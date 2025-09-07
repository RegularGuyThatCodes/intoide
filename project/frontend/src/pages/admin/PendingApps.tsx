import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Eye, Calendar, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const PendingApps: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: appsData, isLoading } = useQuery({
    queryKey: ['admin-pending-apps'],
    queryFn: async () => {
      const response = await api.get('/admin/pending-apps');
      return response.data.data;
    },
  });

  const updateAppStatusMutation = useMutation({
    mutationFn: async ({ appId, status }: { appId: string; status: 'APPROVED' | 'REJECTED' }) => {
      const response = await api.put(`/admin/apps/${appId}/status`, { status });
      return response.data.data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-apps'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(`App ${status.toLowerCase()} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update app status');
    },
  });

  const handleApprove = (appId: string) => {
    if (confirm('Are you sure you want to approve this app?')) {
      updateAppStatusMutation.mutate({ appId, status: 'APPROVED' });
    }
  };

  const handleReject = (appId: string) => {
    if (confirm('Are you sure you want to reject this app?')) {
      updateAppStatusMutation.mutate({ appId, status: 'REJECTED' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const apps = appsData?.apps || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Apps</h1>
        <p className="text-gray-600 mt-2">Review and moderate submitted applications</p>
      </div>

      {apps.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending apps</h3>
          <p className="text-gray-600">All submitted apps have been reviewed!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {apps.map((app: any) => (
            <div
              key={app.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* App Screenshots */}
                <div className="lg:w-1/3">
                  {app.screenshots && app.screenshots.length > 0 ? (
                    <div className="space-y-2">
                      <img
                        src={app.screenshots[0].fileUrl}
                        alt={app.title}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      {app.screenshots.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto">
                          {app.screenshots.slice(1, 4).map((screenshot: any, index: number) => (
                            <img
                              key={screenshot.id}
                              src={screenshot.fileUrl}
                              alt={`Screenshot ${index + 2}`}
                              className="w-16 h-16 object-cover rounded border border-gray-200 flex-shrink-0"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-gray-400 text-center">
                        <div className="text-4xl font-bold mb-2">
                          {app.title.charAt(0)}
                        </div>
                        <p className="text-sm">No screenshots</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* App Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{app.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{app.developer.name}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {app.price > 0 ? `$${app.price}` : 'Free'}
                      </div>
                      <div className="text-sm text-gray-500">{app.category}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{app.description}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Developer Information</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">
                        <strong>Name:</strong> {app.developer.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Email:</strong> {app.developer.email}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleApprove(app.id)}
                      disabled={updateAppStatusMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleReject(app.id)}
                      disabled={updateAppStatusMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>

                    <a
                      href={`/apps/${app.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Preview</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApps;