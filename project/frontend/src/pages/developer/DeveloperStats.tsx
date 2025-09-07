import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Download, Users, Star, TrendingUp, Package } from 'lucide-react';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const DeveloperStats: React.FC = () => {
  const { data: apps, isLoading } = useQuery({
    queryKey: ['developer-apps'],
    queryFn: async () => {
      const response = await api.get('/users/my-apps');
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate stats
  const stats = apps ? {
    totalApps: apps.length,
    totalSales: apps.reduce((sum: number, app: any) => sum + app._count.purchases, 0),
    totalReviews: apps.reduce((sum: number, app: any) => sum + app._count.reviews, 0),
    totalRevenue: apps.reduce((sum: number, app: any) => sum + (app.price * app._count.purchases), 0),
    approvedApps: apps.filter((app: any) => app.status === 'APPROVED').length,
    pendingApps: apps.filter((app: any) => app.status === 'REVIEW').length,
  } : {
    totalApps: 0,
    totalSales: 0,
    totalReviews: 0,
    totalRevenue: 0,
    approvedApps: 0,
    pendingApps: 0,
  };

  const statCards = [
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Sales',
      value: stats.totalSales.toString(),
      icon: Download,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Published Apps',
      value: stats.approvedApps.toString(),
      icon: Package,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      name: 'Total Reviews',
      value: stats.totalReviews.toString(),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Track your app performance and earnings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* App Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">App Performance</h2>
        </div>
        
        {apps && apps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    App Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviews
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apps.map((app: any) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{app.title}</div>
                          <div className="text-sm text-gray-500">{app.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        app.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${app.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app._count.purchases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app._count.reviews}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(app.price * app._count.purchases).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No apps to analyze yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first app to see analytics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperStats;