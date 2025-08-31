'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useCart } from 'components/cart/cart-context';
import { useOrders } from 'components/orders/order-context';
import { useEffect, useState } from 'react';
import { getOrder, OrderResponse } from 'lib/api/orders';
import LoadingDots from 'components/loading-dots';

export default function SuccessWrapper() {
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

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Error</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{error}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Order Confirmed!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {order && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order Details
            </h2>
            <div className="mt-4 text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Order ID:</span> {order.id}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Status:</span> {order.status}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Total:</span> ${order.total_amount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Created:</span>{' '}
                {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">
                  Items Ordered
                </h3>
                <div className="mt-4 space-y-4">
                  {order.items.map((item: any, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name || item.title || 'Product'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Quantity: {item.quantity || 1}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${item.price || '0.00'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link
            href="/orders"
            className="inline-block rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            View Orders
          </Link>
          <Link
            href="/"
            className="inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
