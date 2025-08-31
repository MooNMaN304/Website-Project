'use client';

import { useOrders } from 'components/orders/order-context';
import Link from 'next/link';
import Price from 'components/price';
import LoadingDots from 'components/loading-dots';
import { OrderResponse } from 'lib/api/orders';

export default function OrdersPage() {
  const { orders, isLoading, error, refreshOrders } = useOrders();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <LoadingDots className="bg-gray-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Error Loading Orders</h1>
          <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={refreshOrders}
            className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Orders</h1>
        <button
          onClick={refreshOrders}
          className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">No orders yet</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            When you place your first order, it will appear here.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

// Remove duplicate import

function OrderCard({ order }: { order: OrderResponse }) {
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
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
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

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Order #{order.id || 'Unknown'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Placed on {order.created_at ? formatDate(order.created_at) : 'Unknown date'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
            {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
          </span>
          <div className="text-right">
            <Price
              amount={(order.total_amount || 0).toString()}
              currencyCode={order.currency_code || 'USD'}
              className="text-lg font-medium text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Shipping Address
            </h4>
            {order.shipping_address ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {(() => {
                  const address = order.shipping_address as any;
                  return (
                    <>
                      <span>{address.first_name} {address.last_name}</span><br />
                      <span>{address.address}</span><br />
                      <span>{address.city}, {address.state} {address.zip_code}</span><br />
                      <span>{address.country}</span>
                    </>
                  );
                })()}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No shipping address provided
              </p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Payment Method
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {order.payment_method || 'Not specified'}
            </p>
          </div>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Items ({order.items.length})
            </h4>
            <div className="space-y-2">
              {order.items.slice(0, 3).map((item: any) => (
                <div key={`${order.id}-${item.id || item.product_id || item.merchandise?.id}`} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.quantity || 1}x {item.name || item.title || 'Unknown Item'}
                  </span>
                  <Price
                    amount={((item.price || 0) * (item.quantity || 1)).toString()}
                    currencyCode={order.currency_code || 'USD'}
                    className="text-gray-900 dark:text-white"
                  />
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  +{order.items.length - 3} more items
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
