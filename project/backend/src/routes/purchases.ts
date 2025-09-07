import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Create payment intent
router.post('/create-payment-intent', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { appId } = req.body;

    if (!appId) {
      throw createError('App ID is required', 400);
    }

    const app = await prisma.app.findUnique({
      where: { id: appId }
    });

    if (!app || app.status !== 'APPROVED') {
      throw createError('App not found', 404);
    }

    // Check if user already owns the app
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_appId: {
          userId: req.user!.id,
          appId: app.id
        }
      }
    });

    if (existingPurchase) {
      throw createError('You already own this app', 409);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(app.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.user!.id,
        appId: app.id
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: app.price
      }
    });
  } catch (error) {
    next(error);
  }
});

// Confirm purchase (webhook endpoint would be better in production)
router.post('/confirm', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      throw createError('Payment intent ID is required', 400);
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw createError('Payment not completed', 400);
    }

    const { userId, appId } = paymentIntent.metadata;

    if (userId !== req.user!.id) {
      throw createError('Unauthorized', 403);
    }

    // Check if purchase already exists
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_appId: {
          userId,
          appId
        }
      }
    });

    if (existingPurchase) {
      return res.json({
        success: true,
        data: existingPurchase
      });
    }

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        appId,
        amount: paymentIntent.amount / 100, // Convert back from cents
        currency: paymentIntent.currency,
        stripePaymentId: paymentIntentId
      },
      include: {
        app: {
          include: {
            developer: {
              select: { name: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    next(error);
  }
});

// Get user's purchases
router.get('/my-purchases', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId: req.user!.id },
      include: {
        app: {
          include: {
            developer: {
              select: { name: true }
            },
            screenshots: {
              take: 1,
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    next(error);
  }
});

// Check if user owns an app
router.get('/check/:appId', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { appId } = req.params;

    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_appId: {
          userId: req.user!.id,
          appId
        }
      }
    });

    res.json({
      success: true,
      data: { owned: !!purchase }
    });
  } catch (error) {
    next(error);
  }
});

// Get download link for purchased app
router.get('/download/:appId', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { appId } = req.params;

    // Verify purchase
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_appId: {
          userId: req.user!.id,
          appId
        }
      }
    });

    if (!purchase) {
      throw createError('App not purchased', 403);
    }

    // Get latest version
    const version = await prisma.appVersion.findFirst({
      where: { appId },
      orderBy: { createdAt: 'desc' }
    });

    if (!version) {
      throw createError('No app version available', 404);
    }

    // In production, you would generate a signed URL for S3
    // For now, return the file URL directly
    res.json({
      success: true,
      data: {
        downloadUrl: version.fileUrl,
        version: version.version,
        size: version.size
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;