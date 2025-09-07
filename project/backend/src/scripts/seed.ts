import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  'Productivity',
  'Games',
  'Developer Tools',
  'Graphics & Design',
  'Business',
  'Education',
  'Utilities',
  'Entertainment'
];

const sampleApps = [
  {
    title: 'TaskFlow Pro',
    description: 'A powerful task management application with team collaboration features, deadline tracking, and advanced reporting capabilities.',
    category: 'Productivity',
    price: 29.99
  },
  {
    title: 'CodeSnap',
    description: 'Beautiful code screenshot generator with syntax highlighting, custom themes, and social sharing capabilities.',
    category: 'Developer Tools',
    price: 9.99
  },
  {
    title: 'Pixel Perfect',
    description: 'Professional image editor with AI-powered features, batch processing, and RAW format support.',
    category: 'Graphics & Design',
    price: 49.99
  },
  {
    title: 'StudyBuddy',
    description: 'Interactive learning platform with flashcards, spaced repetition, and progress tracking for students.',
    category: 'Education',
    price: 19.99
  },
  {
    title: 'RetroGame',
    description: 'Classic arcade-style platformer game with modern graphics and challenging levels.',
    category: 'Games',
    price: 14.99
  },
  {
    title: 'BusinessCard Maker',
    description: 'Create professional business cards with templates, QR codes, and high-quality printing options.',
    category: 'Business',
    price: 24.99
  }
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@intoide.com' },
    update: {},
    create: {
      email: 'admin@intoide.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin user created');

  // Create test developers
  const developers = [];
  for (let i = 1; i <= 3; i++) {
    const password = await bcrypt.hash('developer123', 12);
    const developer = await prisma.user.upsert({
      where: { email: `developer${i}@example.com` },
      update: {},
      create: {
        email: `developer${i}@example.com`,
        name: `Developer ${i}`,
        passwordHash: password,
        role: 'DEVELOPER'
      }
    });
    developers.push(developer);
  }
  console.log('✅ Test developers created');

  // Create test users
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const password = await bcrypt.hash('user123', 12);
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        name: `Test User ${i}`,
        passwordHash: password,
        role: 'USER'
      }
    });
    users.push(user);
  }
  console.log('✅ Test users created');

  // Create sample apps
  const apps = [];
  for (const [index, appData] of sampleApps.entries()) {
    const developer = developers[index % developers.length];
    const slug = appData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const app = await prisma.app.upsert({
      where: { slug },
      update: {},
      create: {
        ...appData,
        slug,
        developerId: developer.id,
        status: 'APPROVED'
      }
    });

    // Add app version
    await prisma.appVersion.create({
      data: {
        appId: app.id,
        version: '1.0.0',
        fileUrl: `https://cdn.intoide.com/apps/${slug}/v1.0.0.zip`,
        changelog: 'Initial release',
        size: Math.floor(Math.random() * 50000000) + 1000000, // Random size between 1MB-50MB
        checksum: Math.random().toString(36).substring(2, 15)
      }
    });

    // Add screenshots
    for (let i = 1; i <= 3; i++) {
      await prisma.screenshot.create({
        data: {
          appId: app.id,
          fileUrl: `https://picsum.photos/800/600?random=${app.id}-${i}`,
          orderIndex: i
        }
      });
    }

    apps.push(app);
  }
  console.log('✅ Sample apps created');

  // Create sample purchases and reviews
  for (const user of users.slice(0, 3)) {
    const appsToPurchase = apps.slice(0, Math.floor(Math.random() * 3) + 1);
    
    for (const app of appsToPurchase) {
      // Create purchase
      await prisma.purchase.create({
        data: {
          userId: user.id,
          appId: app.id,
          amount: app.price,
          currency: 'usd',
          stripePaymentId: `pi_${Math.random().toString(36).substring(2, 15)}`
        }
      });

      // Create review (50% chance)
      if (Math.random() > 0.5) {
        const ratings = [4, 5, 3, 4, 5]; // Mostly positive ratings
        const reviewTexts = [
          'Great app! Really helps with productivity.',
          'Love the user interface and features.',
          'Works perfectly, highly recommended!',
          'Good value for money, solid functionality.',
          'Excellent app with regular updates.'
        ];

        await prisma.review.create({
          data: {
            userId: user.id,
            appId: app.id,
            rating: ratings[Math.floor(Math.random() * ratings.length)],
            text: reviewTexts[Math.floor(Math.random() * reviewTexts.length)]
          }
        });
      }
    }
  }
  console.log('✅ Sample purchases and reviews created');

  // Create some pending apps for admin review
  const pendingApp = await prisma.app.create({
    data: {
      title: 'Pending App',
      slug: 'pending-app',
      description: 'This app is waiting for admin approval.',
      category: 'Utilities',
      price: 12.99,
      developerId: developers[0].id,
      status: 'REVIEW'
    }
  });
  console.log('✅ Pending app created for testing');

  console.log('🎉 Database seed completed!');
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@intoide.com / admin123');
  console.log('Developer: developer1@example.com / developer123');
  console.log('User: user1@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });