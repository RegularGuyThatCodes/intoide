import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Download, Users, Code, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import AppCard from '@/components/apps/AppCard';

const HomePage: React.FC = () => {
  const { data: featuredApps } = useQuery({
    queryKey: ['apps', 'featured'],
    queryFn: async () => {
      const response = await api.get('/apps?limit=6&sortBy=rating');
      return response.data.data.apps;
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Amazing{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Apps
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The independent app store where creativity meets innovation. Find the perfect apps for your needs,
              or publish your own creations to reach thousands of users worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/apps"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Browse Apps
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="bg-white hover:bg-gray-50 text-primary-600 border border-primary-200 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg"
              >
                Join as Developer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Download className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">10K+</h3>
              <p className="text-gray-600">Downloads</p>
            </div>
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">1K+</h3>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-4">
                <Code className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">500+</h3>
              <p className="text-gray-600">Developers</p>
            </div>
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
                <Star className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">4.8</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Intoide?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building the future of app distribution with security, quality, and developer success at the core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-6">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600">
                Optimized download speeds and instant app discovery. Find what you need in seconds.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-lg mb-6">
                <Shield className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure & Safe</h3>
              <p className="text-gray-600">
                Every app is reviewed and scanned for security issues before it reaches our users.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-100 rounded-lg mb-6">
                <Globe className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Global Reach</h3>
              <p className="text-gray-600">
                Connect with users worldwide and grow your app's audience across different markets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Apps Section */}
      {featuredApps && featuredApps.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured Apps
              </h2>
              <p className="text-xl text-gray-600">
                Discover the most popular and highest-rated apps on our platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredApps.map((app: any) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/apps"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
              >
                View All Apps
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Share Your App?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of developers who trust Intoide to distribute their apps to a global audience.
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;