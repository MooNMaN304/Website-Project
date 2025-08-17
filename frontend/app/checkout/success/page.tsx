import { Suspense } from 'react';
import LoadingDots from 'components/loading-dots';
import SuccessWrapper from './success-wrapper';

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <LoadingDots className="bg-blue-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessWrapper />
    </Suspense>
  );
}
