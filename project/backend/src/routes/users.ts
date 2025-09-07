import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional()
});

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            apps: true,
            purchases: true,
            reviews: true
          }
        }
      }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { name } = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Get user's apps (for developers)
router.get('/my-apps', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role !== 'DEVELOPER' && req.user!.role !== 'ADMIN') {
      throw createError('Only developers can access this endpoint', 403);
    }

    const apps = await prisma.app.findMany({
      where: { developerId: req.user!.id },
      include: {
        screenshots: {
          take: 1,
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: { purchases: true, reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: apps
    });
  } catch (error) {
    next(error);
  }
});

// Upgrade to developer
router.post('/upgrade-to-developer', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role !== 'USER') {
      throw createError('Only users can upgrade to developer', 400);
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { role: 'DEVELOPER' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: user,
      message: 'Successfully upgraded to developer account'
    });
  } catch (error) {
    next(error);
  }
});

export default router;