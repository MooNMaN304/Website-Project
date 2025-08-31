'use client';

import dynamic from 'next/dynamic';
import LoadingDots from 'components/loading-dots';

// Dynamically import CheckoutForm to ensure it's only rendered on client
const CheckoutForm = dynamic(() => import('components/checkout/checkout-form'), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <LoadingDots className="bg-blue-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading checkout...</p>
      </div>
    </div>
  )
});

export default function CheckoutPage() {
  return <CheckoutForm />;
}
