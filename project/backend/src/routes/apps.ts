import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireDeveloper, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

const createAppSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be 0 or greater')
});

const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(['newest', 'oldest', 'price-low', 'price-high', 'rating']).optional().default('newest'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(12)
});

// Get all apps (public)
router.get('/', async (req, res, next) => {
  try {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit
    } = searchSchema.parse(req.query);

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'APPROVED'
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Build order clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        // This would need a more complex query with aggregated ratings
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [apps, total] = await Promise.all([
      prisma.app.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          developer: {
            select: { name: true }
          },
          screenshots: {
            orderBy: { orderIndex: 'asc' },
            take: 5
          },
          _count: {
            select: { reviews: true }
          }
        }
      }),
      prisma.app.count({ where })
    ]);

    // Calculate average ratings (would be more efficient with database aggregation)
    const appsWithRatings = await Promise.all(
      apps.map(async (app) => {
        const ratings = await prisma.review.aggregate({
          where: { appId: app.id },
          _avg: { rating: true }
        });

        return {
          ...app,
          averageRating: ratings._avg.rating,
          totalReviews: app._count.reviews
        };
      })
    );

    res.json({
      success: true,
      data: {
        apps: appsWithRatings,
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

// Get app by slug (public)
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const app = await prisma.app.findUnique({
      where: { slug },
      include: {
        developer: {
          select: { id: true, name: true }
        },
        screenshots: {
          orderBy: { orderIndex: 'asc' }
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: { reviews: true }
        }
      }
    });

    if (!app || app.status !== 'APPROVED') {
      throw createError('App not found', 404);
    }

    // Calculate average rating
    const ratings = await prisma.review.aggregate({
      where: { appId: app.id },
      _avg: { rating: true }
    });

    const appWithRating = {
      ...app,
      averageRating: ratings._avg.rating,
      totalReviews: app._count.reviews,
      currentVersion: app.versions[0] || null
    };

    res.json({
      success: true,
      data: appWithRating
    });
  } catch (error) {
    next(error);
  }
});

// Create app (developers only)
router.post('/', authenticateToken, requireDeveloper, async (req: AuthRequest, res, next) => {
  try {
    const { title, description, category, price } = createAppSchema.parse(req.body);

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingApp = await prisma.app.findUnique({
      where: { slug }
    });

    if (existingApp) {
      throw createError('App with similar title already exists', 409);
    }

    const app = await prisma.app.create({
      data: {
        title,
        slug,
        description,
        category,
        price,
        developerId: req.user!.id
      },
      include: {
        developer: {
          select: { name: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: app
    });
  } catch (error) {
    next(error);
  }
});

// Update app (owner only)
router.put('/:id', authenticateToken, requireDeveloper, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updateData = createAppSchema.partial().parse(req.body);

    const app = await prisma.app.findUnique({
      where: { id }
    });

    if (!app) {
      throw createError('App not found', 404);
    }

    if (app.developerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw createError('Unauthorized', 403);
    }

    const updatedApp = await prisma.app.update({
      where: { id },
      data: updateData,
      include: {
        developer: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      data: updatedApp
    });
  } catch (error) {
    next(error);
  }
});

// Delete app (owner only)
router.delete('/:id', authenticateToken, requireDeveloper, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const app = await prisma.app.findUnique({
      where: { id }
    });

    if (!app) {
      throw createError('App not found', 404);
    }

    if (app.developerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw createError('Unauthorized', 403);
    }

    await prisma.app.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'App deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get categories (public)
router.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await prisma.app.findMany({
      where: { status: 'APPROVED' },
      select: { category: true },
      distinct: ['category']
    });

    res.json({
      success: true,
      data: categories.map(c => c.category).sort()
    });
  } catch (error) {
    next(error);
  }
});

export default router;