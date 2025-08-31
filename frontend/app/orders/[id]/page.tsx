'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { getOrder, OrderResponse } from 'lib/api/orders';
import LoadingDots from 'components/loading-dots';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      getOrder(orderId)
        .then((orderData) => {
          setOrder(orderData);
        })
        .catch((err) => {
          console.error('Failed to fetch order details:', err);
          setError('Could not load order details');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [orderId]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case 'processing':
        return <ClockIcon className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="h-6 w-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <LoadingDots className="bg-blue-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Not Found</h1>
          <p className="mt-2 text-red-600 dark:text-red-400">{error || 'Order could not be loaded'}</p>
          <Link
            href="/orders"
            className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/orders"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order #{order.id}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Placed on {order.created_at ? formatDate(order.created_at) : 'Unknown date'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {getStatusIcon(order.status)}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Total Amount</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${order.total_amount.toFixed(2)} {order.currency_code}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Payment Status</h3>
            <p className="text-lg text-gray-700 dark:text-gray-200">
              {order.payment_method ? 'Paid' : 'Pending'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Email</h3>
            <p className="text-lg text-gray-700 dark:text-gray-200">
              {order.email}
            </p>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      {order.shipping_address && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Shipping Address</h3>
              <div className="text-gray-700 dark:text-gray-200">
                {(() => {
                  const address = order.shipping_address as any;
                  return (
                    <>
                      <p>{address.first_name} {address.last_name}</p>
                      <p>{address.address}</p>
                      <p>{address.city}, {address.state} {address.zip_code}</p>
                      <p>{address.country}</p>
                    </>
                  );
                })()}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Payment Method</h3>
              <p className="text-gray-700 dark:text-gray-200 capitalize">
                {order.payment_method || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Order Items ({order.items.length})
          </h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {order.items.map((item: any, index: number) => (
              <div key={index} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      {item.name || item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Timeline */}
      <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Timeline</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Order Placed</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {order.created_at ? formatDate(order.created_at) : 'Unknown date'}
              </p>
            </div>
          </div>
          {order.status !== 'pending' && (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Order Confirmed</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Processing started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
