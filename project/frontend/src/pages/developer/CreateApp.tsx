import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { APP_CATEGORIES } from '../../../../shared/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CreateAppFormData {
  title: string;
  description: string;
  category: string;
  price: number;
}

const CreateApp: React.FC = () => {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreateAppFormData>();

  const createAppMutation = useMutation({
    mutationFn: async (data: CreateAppFormData) => {
      const response = await api.post('/apps', data);
      return response.data.data;
    },
    onSuccess: (app) => {
      toast.success('App created successfully!');
      navigate('/developer');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create app');
    },
  });

  const onSubmit = (data: CreateAppFormData) => {
    createAppMutation.mutate(data);
  };

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => navigate('/developer')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to My Apps</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New App</h1>
        <p className="text-gray-600 mt-2">Fill in the basic information for your new application</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* App Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              App Title *
            </label>
            <input
              {...register('title', {
                required: 'App title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
                maxLength: { value: 100, message: 'Title must be less than 100 characters' }
              })}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your app title"
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              This will be displayed as your app's name in the store
            </p>
          </div>

          {/* App Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 50, message: 'Description must be at least 50 characters' },
                maxLength: { value: 2000, message: 'Description must be less than 2000 characters' }
              })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe your app, its features, and what makes it special..."
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Provide a detailed description to help users understand your app
            </p>
          </div>

          {/* Category and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {APP_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) *
              </label>
              <input
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price cannot be negative' },
                  max: { value: 999.99, message: 'Price cannot exceed $999.99' }
                })}
                type="number"
                step="0.01"
                min="0"
                max="999.99"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-2 text-sm text-red-600">{errors.price.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Set to $0.00 for a free app
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your app will be created in "Draft" status</li>
              <li>• You can upload screenshots and app binaries</li>
              <li>• Submit for review when ready</li>
              <li>• Once approved, users can discover and purchase your app</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/developer')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAppMutation.isPending}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {createAppMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>Create App</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateApp;