import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Download, CreditCard, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { App } from '../../../../shared/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface PurchaseButtonProps {
  app: App;
  isOwned?: boolean;
  className?: string;
}

const PurchaseForm: React.FC<{ app: App; onSuccess: () => void }> = ({ app, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const createPaymentIntent = useMutation({
    mutationFn: async () => {
      const response = await api.post('/purchases/create-payment-intent', {
        appId: app.id
      });
      return response.data.data;
    },
  });

  const confirmPurchase = useMutation({
    mutationFn: async (paymentIntentId: string) => {
      const response = await api.post('/purchases/confirm', {
        paymentIntentId
      });
      return response.data.data;
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      // Create payment intent
      const { clientSecret } = await createPaymentIntent.mutateAsync();

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        await confirmPurchase.mutateAsync(paymentIntent.id);
        toast.success('Purchase successful! You can now download the app.');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-300 rounded-lg p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>Complete Purchase - ${app.price}</span>
          </>
        )}
      </button>
    </form>
  );
};

const PurchaseButton: React.FC<PurchaseButtonProps> = ({ app, isOwned, className = '' }) => {
  const { user } = useAuthStore();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(isOwned || false);

  const downloadApp = useMutation({
    mutationFn: async () => {
      const response = await api.get(`/purchases/download/${app.id}`);
      return response.data.data;
    },
    onSuccess: (data) => {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = `${app.title}-${data.version}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Download failed');
    },
  });

  if (!user) {
    return (
      <button
        onClick={() => window.location.href = '/login'}
        className={`bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors ${className}`}
      >
        Sign In to Purchase
      </button>
    );
  }

  if (purchaseComplete) {
    return (
      <button
        onClick={() => downloadApp.mutate()}
        disabled={downloadApp.isPending}
        className={`bg-success-600 hover:bg-success-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${className}`}
      >
        {downloadApp.isPending ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <Download className="h-5 w-5" />
            <span>Download</span>
          </>
        )}
      </button>
    );
  }

  if (app.price === 0) {
    // Free app - direct download
    return (
      <button
        onClick={() => downloadApp.mutate()}
        disabled={downloadApp.isPending}
        className={`bg-success-600 hover:bg-success-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${className}`}
      >
        {downloadApp.isPending ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <Download className="h-5 w-5" />
            <span>Download Free</span>
          </>
        )}
      </button>
    );
  }

  if (showPaymentForm) {
    return (
      <div className="space-y-4">
        <Elements stripe={stripePromise}>
          <PurchaseForm
            app={app}
            onSuccess={() => {
              setPurchaseComplete(true);
              setShowPaymentForm(false);
            }}
          />
        </Elements>
        <button
          onClick={() => setShowPaymentForm(false)}
          className="w-full text-gray-600 hover:text-gray-800 py-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowPaymentForm(true)}
      className={`bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${className}`}
    >
      <CreditCard className="h-5 w-5" />
      <span>Buy for ${app.price}</span>
    </button>
  );
};

export default PurchaseButton;