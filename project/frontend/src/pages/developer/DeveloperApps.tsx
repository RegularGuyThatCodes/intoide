import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye, Edit, Trash2, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const DeveloperApps: React.FC = () => {
  const { data: apps, isLoading } = useQuery({
    queryKey: ['developer-apps'],
    queryFn: async () => {
      const response = await api.get('/users/my-apps');
      return response.data.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Apps</h1>
          <p className="text-gray-600 mt-2">Manage and track your published applications</p>
        </div>
        <Link
          to="/developer/create"
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New App</span>
        </Link>
      </div>

      {/* Apps Grid */}
      {apps && apps.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {apps.map((app: any) => (
            <div
              key={app.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{app.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{app.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{app.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium">${app.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sales</p>
                      <p className="font-medium">{app._count.purchases}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reviews</p>
                      <p className="font-medium">{app._count.reviews}</p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Created {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Screenshot Preview */}
                {app.screenshots && app.screenshots.length > 0 && (
                  <div className="ml-6 flex-shrink-0">
                    <img
                      src={app.screenshots[0].fileUrl}
                      alt={app.title}
                      className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <Link
                  to={`/apps/${app.slug}`}
                  className="text-gray-600 hover:text-primary-600 p-2 rounded-lg transition-colors"
                  title="View App"
                >
                  <Eye className="h-5 w-5" />
                </Link>
                <button
                  className="text-gray-600 hover:text-primary-600 p-2 rounded-lg transition-colors"
                  title="Edit App"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  className="text-gray-600 hover:text-primary-600 p-2 rounded-lg transition-colors"
                  title="Upload Version"
                >
                  <Upload className="h-5 w-5" />
                </button>
                <button
                  className="text-gray-600 hover:text-red-600 p-2 rounded-lg transition-colors"
                  title="Delete App"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No apps yet</h3>
          <p className="text-gray-600 mb-6">
            Start by creating your first app to share with the world
          </p>
          <Link
            to="/developer/create"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Your First App</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DeveloperApps;