import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Package, CreditCard, Star, Calendar, ArrowUpCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AppCard from '@/components/apps/AppCard';

interface ProfileFormData {
  name: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'purchases' | 'apps'>('profile');

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || ''
    }
  });

  // Get user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data.data;
    },
  });

  // Get user purchases
  const { data: purchases, isLoading: purchasesLoading } = useQuery({
    queryKey: ['user-purchases'],
    queryFn: async () => {
      const response = await api.get('/purchases/my-purchases');
      return response.data.data;
    },
    enabled: activeTab === 'purchases',
  });

  // Get user's apps (for developers)
  const { data: apps, isLoading: appsLoading } = useQuery({
    queryKey: ['user-apps'],
    queryFn: async () => {
      const response = await api.get('/users/my-apps');
      return response.data.data;
    },
    enabled: activeTab === 'apps' && (user?.role === 'DEVELOPER' || user?.role === 'ADMIN'),
  });

  // Update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await api.put('/users/profile', data);
      return response.data.data;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  // Upgrade to developer
  const upgradeToDeveloperMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/users/upgrade-to-developer');
      return response.data.data;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Successfully upgraded to developer account!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upgrade account');
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'purchases', label: 'My Apps', icon: Package },
    ...(user?.role === 'DEVELOPER' || user?.role === 'ADMIN' 
      ? [{ id: 'apps', label: 'Published Apps', icon: CreditCard }] 
      : []
    ),
  ];

  if (profileLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold">{user?.name}</h1>
              <p className="text-primary-100">{user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                  {user?.role}
                </span>
                <span className="text-primary-100 text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {new Date(user?.createdAt || '').toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          {profile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{profile._count.purchases}</div>
                <div className="text-primary-100 text-sm">Apps Purchased</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{profile._count.reviews}</div>
                <div className="text-primary-100 text-sm">Reviews Written</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{profile._count.apps}</div>
                <div className="text-primary-100 text-sm">Apps Published</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition-colors`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="max-w-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    {...register('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {updateProfileMutation.isPending && <LoadingSpinner size="sm" />}
                    <span>Update Profile</span>
                  </button>
                </div>
              </form>

              {/* Upgrade to Developer */}
              {user?.role === 'USER' && (
                <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                  <div className="flex items-start space-x-3">
                    <ArrowUpCircle className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Become a Developer</h3>
                      <p className="text-gray-600 mt-1">
                        Upload and sell your own apps on Intoide. Join thousands of developers earning from their creations.
                      </p>
                      <button
                        onClick={() => upgradeToDeveloperMutation.mutate()}
                        disabled={upgradeToDeveloperMutation.isPending}
                        className="mt-3 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {upgradeToDeveloperMutation.isPending && <LoadingSpinner size="sm" />}
                        <span>Upgrade Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'purchases' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">My Purchased Apps</h2>
              
              {purchasesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : purchases && purchases.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchases.map((purchase: any) => (
                    <AppCard key={purchase.id} app={purchase.app} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No apps purchased</h3>
                  <p className="text-gray-500 mb-4">Start exploring our app store to find amazing apps!</p>
                  <a
                    href="/apps"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Browse Apps
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'apps' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Published Apps</h2>
                <a
                  href="/developer"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Manage Apps
                </a>
              </div>
              
              {appsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : apps && apps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {apps.map((app: any) => (
                    <div key={app.id} className="relative">
                      <AppCard app={app} />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          app.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No apps published</h3>
                  <p className="text-gray-500 mb-4">Start publishing your first app to reach users worldwide!</p>
                  <a
                    href="/developer"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Publish App
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;