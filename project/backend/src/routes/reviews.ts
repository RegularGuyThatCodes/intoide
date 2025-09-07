import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

const reviewSchema = z.object({
  appId: z.string(),
  rating: z.number().min(1).max(5),
  text: z.string().min(10, 'Review must be at least 10 characters')
});

// Create review
router.post('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { appId, rating, text } = reviewSchema.parse(req.body);

    // Check if user purchased the app
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_appId: {
          userId: req.user!.id,
          appId
        }
      }
    });

    if (!purchase) {
      throw createError('You can only review apps you have purchased', 403);
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_appId: {
          userId: req.user!.id,
          appId
        }
      }
    });

    if (existingReview) {
      throw createError('You have already reviewed this app', 409);
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user!.id,
        appId,
        rating,
        text
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
});

// Update review
router.put('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { rating, text } = reviewSchema.omit({ appId: true }).parse(req.body);

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw createError('Review not found', 404);
    }

    if (review.userId !== req.user!.id) {
      throw createError('Unauthorized', 403);
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { rating, text },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    next(error);
  }
});

// Delete review
router.delete('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw createError('Review not found', 404);
    }

    if (review.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw createError('Unauthorized', 403);
    }

    await prisma.review.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get reviews for an app
router.get('/app/:appId', async (req, res, next) => {
  try {
    const { appId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { appId },
        include: {
          user: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({ where: { appId } })
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;