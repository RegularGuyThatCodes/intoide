export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'developer' | 'admin';
  createdAt: string;
}

export interface App {
  id: string;
  developerId: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  createdAt: string;
  developer: {
    name: string;
  };
  screenshots: Screenshot[];
  currentVersion?: AppVersion;
  averageRating?: number;
  totalReviews?: number;
}

export interface AppVersion {
  id: string;
  appId: string;
  version: string;
  fileUrl: string;
  changelog: string;
  size: number;
  checksum: string;
  createdAt: string;
}

export interface Screenshot {
  id: string;
  appId: string;
  fileUrl: string;
  orderIndex: number;
}

export interface Purchase {
  id: string;
  userId: string;
  appId: string;
  amount: number;
  currency: string;
  stripePaymentId: string;
  createdAt: string;
  app: App;
}

export interface Review {
  id: string;
  userId: string;
  appId: string;
  rating: number;
  text: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const APP_CATEGORIES = [
  'Productivity',
  'Games',
  'Developer Tools',
  'Graphics & Design',
  'Business',
  'Education',
  'Utilities',
  'Entertainment',
  'Social Networking',
  'Photography',
] as const;

export type AppCategory = typeof APP_CATEGORIES[number];

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'rating';
}