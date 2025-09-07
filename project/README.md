# Intoide - Community App Store

A full-stack web application for an independent app store where developers can publish apps and users can browse, purchase, and download them.

## Features

- **User Management**: Signup/login with JWT authentication
- **Developer Publishing**: Submit apps with screenshots and binaries
- **App Store**: Browse, search, and filter apps by category
- **Purchase System**: Secure payments via Stripe integration
- **Reviews & Ratings**: User feedback system
- **Admin Dashboard**: App moderation and user management
- **Security**: File validation and checksum verification

## Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **File Storage**: S3-compatible storage
- **Payments**: Stripe
- **Testing**: Jest + React Testing Library
- **Deployment**: Docker + Vercel/Railway

## Project Structure

```
├── frontend/          # React frontend application
├── backend/           # Express.js API server
├── shared/            # Shared types and utilities
├── docker-compose.yml # Development environment
└── README.md
```

## Quick Start

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Set up database**
   ```bash
   cd backend
   npx prisma migrate dev
   npm run seed
   ```

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `STRIPE_SECRET_KEY`: Stripe secret key
- `AWS_ACCESS_KEY_ID`: S3 access key
- `AWS_SECRET_ACCESS_KEY`: S3 secret key
- `AWS_BUCKET_NAME`: S3 bucket name

### Frontend (.env)
- `VITE_API_URL`: Backend API URL
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

## Development

- Backend runs on http://localhost:3001
- Frontend runs on http://localhost:5173
- Database runs on localhost:5432 (PostgreSQL)

## Deployment

Both frontend and backend include Dockerfiles for containerized deployment.

### Docker Development
```bash
docker-compose up
```

## License

MIT License