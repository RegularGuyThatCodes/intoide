import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Download, Shield, Calendar, User, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PurchaseButton from '@/components/apps/PurchaseButton';
import ReviewSection from '@/components/apps/ReviewSection';

const AppDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const [selectedScreenshot, setSelectedScreenshot] = useState(0);

  const { data: app, isLoading, error } = useQuery({
    queryKey: ['app', slug],
    queryFn: async () => {
      const response = await api.get(`/apps/${slug}`);
      return response.data.data;
    },
    enabled: !!slug,
  });

  const { data: ownershipData } = useQuery({
    queryKey: ['app-ownership', app?.id],
    queryFn: async () => {
      const response = await api.get(`/purchases/check/${app.id}`);
      return response.data.data;
    },
    enabled: !!app?.id && !!user,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">App Not Found</h2>
          <p className="text-gray-600">The app you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const isOwned = ownershipData?.owned;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* App Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{app.title}</h1>
                <p className="text-gray-600">by {app.developer.name}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <span className="font-semibold">
                    {app.averageRating ? app.averageRating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-gray-500">
                    ({app.totalReviews || 0} reviews)
                  </span>
                </div>
                <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                  {app.category}
                </span>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">{app.description}</p>

            {/* App Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full mx-auto mb-2">
                  <DollarSign className="h-5 w-5 text-primary-600" />
                </div>
                <p className="font-semibold text-gray-900">
                  {app.price > 0 ? `$${app.price}` : 'Free'}
                </p>
                <p className="text-sm text-gray-500">Price</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-success-100 rounded-full mx-auto mb-2">
                  <Shield className="h-5 w-5 text-success-600" />
                </div>
                <p className="font-semibold text-gray-900">Verified</p>
                <p className="text-sm text-gray-500">Security</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-secondary-100 rounded-full mx-auto mb-2">
                  <Calendar className="h-5 w-5 text-secondary-600" />
                </div>
                <p className="font-semibold text-gray-900">
                  {new Date(app.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">Released</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-accent-100 rounded-full mx-auto mb-2">
                  <User className="h-5 w-5 text-accent-600" />
                </div>
                <p className="font-semibold text-gray-900">{app.totalReviews || 0}</p>
                <p className="text-sm text-gray-500">Reviews</p>
              </div>
            </div>
          </div>

          {/* Screenshots */}
          {app.screenshots && app.screenshots.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Screenshots</h3>
              
              {/* Main Screenshot */}
              <div className="mb-4">
                <img
                  src={app.screenshots[selectedScreenshot]?.fileUrl}
                  alt={`${app.title} screenshot`}
                  className="w-full h-96 object-cover rounded-lg border border-gray-200"
                />
              </div>

              {/* Thumbnail Gallery */}
              {app.screenshots.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {app.screenshots.map((screenshot: any, index: number) => (
                    <button
                      key={screenshot.id}
                      onClick={() => setSelectedScreenshot(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                        selectedScreenshot === index
                          ? 'border-primary-500'
                          : 'border-gray-200 hover:border-gray-300'
                      } transition-colors`}
                    >
                      <img
                        src={screenshot.fileUrl}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Version Info */}
          {app.currentVersion && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Version Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Current Version</h4>
                  <p className="text-gray-600">{app.currentVersion.version}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">File Size</h4>
                  <p className="text-gray-600">
                    {(app.currentVersion.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-2">Changelog</h4>
                  <p className="text-gray-600">{app.currentVersion.changelog}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          <ReviewSection appId={app.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase/Download Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <div className="text-center mb-4">
              {app.price > 0 ? (
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  ${app.price}
                </div>
              ) : (
                <div className="text-3xl font-bold text-success-600 mb-2">
                  Free
                </div>
              )}
            </div>

            <PurchaseButton 
              app={app} 
              isOwned={isOwned}
              className="w-full"
            />

            {isOwned && (
              <p className="text-center text-sm text-gray-500 mt-2">
                ✓ You own this app
              </p>
            )}
          </div>

          {/* Developer Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Developer</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {app.developer.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{app.developer.name}</p>
                <p className="text-sm text-gray-500">Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDetailPage;