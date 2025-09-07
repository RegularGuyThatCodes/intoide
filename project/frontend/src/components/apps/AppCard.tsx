import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Download } from 'lucide-react';
import { App } from '../../../../shared/types';

interface AppCardProps {
  app: App;
}

const AppCard: React.FC<AppCardProps> = ({ app }) => {
  return (
    <Link
      to={`/apps/${app.slug}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      {/* App Screenshot */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-secondary-100 overflow-hidden">
        {app.screenshots && app.screenshots.length > 0 ? (
          <img
            src={app.screenshots[0].fileUrl}
            alt={app.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl font-bold text-primary-300">
              {app.title.charAt(0)}
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
            {app.category}
          </span>
        </div>
      </div>

      {/* App Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {app.title}
          </h3>
          <div className="flex items-center space-x-1 text-sm text-gray-500 ml-2">
            <Star className="h-4 w-4 fill-current text-yellow-400" />
            <span>{app.averageRating ? app.averageRating.toFixed(1) : 'N/A'}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {app.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            by <span className="font-medium">{app.developer.name}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {app.price > 0 ? (
              <span className="font-bold text-primary-600">
                ${app.price}
              </span>
            ) : (
              <span className="text-success-600 font-semibold">
                Free
              </span>
            )}
          </div>
        </div>

        {/* Reviews Count */}
        {app.totalReviews && app.totalReviews > 0 && (
          <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
            <span>{app.totalReviews} review{app.totalReviews !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default AppCard;