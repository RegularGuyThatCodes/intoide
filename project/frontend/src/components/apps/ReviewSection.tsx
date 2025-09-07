import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ReviewSectionProps {
  appId: string;
}

interface ReviewFormData {
  rating: number;
  text: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ appId }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ReviewFormData>();
  const rating = watch('rating', 0);

  // Fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['reviews', appId],
    queryFn: async () => {
      const response = await api.get(`/reviews/app/${appId}?limit=10`);
      return response.data.data;
    },
  });

  // Check if user can review (purchased app)
  const { data: canReview } = useQuery({
    queryKey: ['can-review', appId],
    queryFn: async () => {
      const response = await api.get(`/purchases/check/${appId}`);
      return response.data.data.owned;
    },
    enabled: !!user,
  });

  // Create/update review
  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData & { reviewId?: string }) => {
      if (data.reviewId) {
        const response = await api.put(`/reviews/${data.reviewId}`, {
          rating: data.rating,
          text: data.text,
        });
        return response.data.data;
      } else {
        const response = await api.post('/reviews', {
          appId,
          rating: data.rating,
          text: data.text,
        });
        return response.data.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', appId] });
      toast.success(editingReview ? 'Review updated!' : 'Review submitted!');
      setShowReviewForm(false);
      setEditingReview(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    },
  });

  // Delete review
  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      await api.delete(`/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', appId] });
      toast.success('Review deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    reviewMutation.mutate({
      ...data,
      reviewId: editingReview || undefined,
    });
  };

  const handleEdit = (review: any) => {
    setEditingReview(review.id);
    setShowReviewForm(true);
    setValue('rating', review.rating);
    setValue('text', review.text);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setShowReviewForm(false);
    reset();
  };

  const reviews = reviewsData?.reviews || [];
  const userReview = reviews.find((review: any) => review.userId === user?.id);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Reviews ({reviews.length})</span>
        </h3>

        {user && canReview && !userReview && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">
            {editingReview ? 'Edit Review' : 'Write a Review'}
          </h4>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue('rating', star)}
                    className={`p-1 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
              <input
                type="hidden"
                {...register('rating', { required: 'Rating is required', min: 1, max: 5 })}
              />
              {errors.rating && (
                <p className="text-red-600 text-sm mt-1">{errors.rating.message}</p>
              )}
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review
              </label>
              <textarea
                {...register('text', { 
                  required: 'Review text is required',
                  minLength: { value: 10, message: 'Review must be at least 10 characters' }
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Share your experience with this app..."
              />
              {errors.text && (
                <p className="text-red-600 text-sm mt-1">{errors.text.message}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={reviewMutation.isPending}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {reviewMutation.isPending && <LoadingSpinner size="sm" />}
                <span>{editingReview ? 'Update Review' : 'Submit Review'}</span>
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No reviews yet</p>
          <p className="text-gray-400 text-sm">Be the first to review this app!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div
              key={review.id}
              className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{review.user.name}</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Review Actions for Owner/Admin */}
                {user && (review.userId === user.id || user.role === 'ADMIN') && (
                  <div className="flex items-center space-x-2">
                    {review.userId === user.id && (
                      <button
                        onClick={() => handleEdit(review)}
                        className="text-gray-600 hover:text-primary-600 p-1 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(review.id)}
                      disabled={deleteMutation.isPending}
                      className="text-gray-600 hover:text-red-600 p-1 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-700">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;