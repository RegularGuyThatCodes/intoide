import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Package, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const AdminOverview: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
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

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.users.total || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Developers',
      value: stats?.users.developers || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Apps',
      value: stats?.apps.total || 0,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Approved Apps',
      value: stats?.apps.approved || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Pending Apps',
      value: stats?.apps.pending || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Total Revenue',
      value: `$${(stats?.purchases.revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-600 mt-2">Monitor platform activity and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/pending"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-900">Review Pending Apps</p>
                <p className="text-sm text-gray-500">{stats?.apps.pending || 0} apps waiting for review</p>
              </div>
            </div>
            <div className="text-yellow-600">
              →
            </div>
          </a>

          <a
            href="/admin/users"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">View and manage user accounts</p>
              </div>
            </div>
            <div className="text-blue-600">
              →
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">App Approval Rate</span>
            <span className="font-semibold text-green-600">
              {stats?.apps.total > 0 
                ? ((stats.apps.approved / stats.apps.total) * 100).toFixed(1) 
                : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Average Revenue per App</span>
            <span className="font-semibold text-gray-900">
              ${stats?.apps.approved > 0 
                ? (stats.purchases.revenue / stats.apps.approved).toFixed(2) 
                : '0.00'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600">Developer-to-User Ratio</span>
            <span className="font-semibold text-gray-900">
              1:{stats?.users.total > 0 
                ? Math.round((stats.users.total - stats.users.developers) / Math.max(stats.users.developers, 1)) 
                : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;