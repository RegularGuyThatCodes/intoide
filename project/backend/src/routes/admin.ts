import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// Get admin dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const [
      totalUsers,
      totalDevelopers,
      totalApps,
      approvedApps,
      pendingApps,
      totalPurchases,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'DEVELOPER' } }),
      prisma.app.count(),
      prisma.app.count({ where: { status: 'APPROVED' } }),
      prisma.app.count({ where: { status: 'REVIEW' } }),
      prisma.purchase.count(),
      prisma.purchase.aggregate({
        _sum: { amount: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          developers: totalDevelopers
        },
        apps: {
          total: totalApps,
          approved: approvedApps,
          pending: pendingApps
        },
        purchases: {
          total: totalPurchases,
          revenue: totalRevenue._sum.amount || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get pending apps for review
router.get('/pending-apps', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    const [apps, total] = await Promise.all([
      prisma.app.findMany({
        where: { status: 'REVIEW' },
        include: {
          developer: {
            select: { name: true, email: true }
          },
          screenshots: {
            take: 3,
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.app.count({ where: { status: 'REVIEW' } })
    ]);

    res.json({
      success: true,
      data: {
        apps,
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

// Approve/reject app
router.put('/apps/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw createError('Status must be APPROVED or REJECTED', 400);
    }

    const app = await prisma.app.findUnique({
      where: { id }
    });

    if (!app) {
      throw createError('App not found', 404);
    }

    const updatedApp = await prisma.app.update({
      where: { id },
      data: { status },
      include: {
        developer: {
          select: { name: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      data: updatedApp,
      message: `App ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    next(error);
  }
});

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              apps: true,
              purchases: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count()
    ]);

    res.json({
      success: true,
      data: {
        users,
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

// Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user!.id) {
      throw createError('Cannot delete your own account', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;