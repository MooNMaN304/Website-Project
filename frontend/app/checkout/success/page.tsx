'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useCart } from 'components/cart/cart-context';
import { useOrders } from 'components/orders/order-context';
import { useEffect, useState } from 'react';
import { getOrder, OrderResponse } from 'lib/api/orders';
import LoadingDots from 'components/loading-dots';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCart();
  const { addOrder } = useOrders();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear the cart after successful checkout and fetch order details
  useEffect(() => {
    if (orderId) {
      clearCart();

      // Fetch order details
      getOrder(orderId)
        .then((orderData) => {
          setOrder(orderData);
          addOrder(orderData);
        })
        .catch((err) => {
          console.error('Failed to fetch order details:', err);
          setError('Could not load order details');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setError('No order ID provided');
    }
  }, [orderId, clearCart, addOrder]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <LoadingDots className="bg-blue-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Order Confirmed!
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Thank you for your purchase. Your order has been successfully processed.
        </p>

        {order && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Total:</span> ${order.total_amount.toFixed(2)} {order.currency_code}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Status:</span> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Email:</span> {order.email}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {error}
            </p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You will receive an email confirmation shortly with your order details.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue Shopping
            </Link>
            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View Orders
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 dark:border-gray-600 pt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            What happens next?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full mx-auto mb-2">
                1
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Order Processing</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We&apos;re preparing your order for shipment
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full mx-auto mb-2">
                2
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Shipping</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your order will be shipped within 1-2 business days
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full mx-auto mb-2">
                3
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Delivery</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track your package and enjoy your purchase
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
