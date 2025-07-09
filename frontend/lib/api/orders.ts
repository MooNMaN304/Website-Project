/**
 * Client-side API functions for order management
 */

export interface OrderRequest {
  email: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  payment_method: 'card' | 'paypal';
  payment_details?: {
    card_number?: string;
    expiry_date?: string;
    cvv?: string;
    card_name?: string;
  } | null;
}

export interface OrderResponse {
  id: string;
  order_id?: string;
  status: string;
  total_amount: number;
  currency_code: string;
  created_at: string;
  email: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  } | null;
  payment_method: string | null;
  items: any[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get auth token from localStorage or cookies
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') ||
           document.cookie
             .split('; ')
             .find(row => row.startsWith('authToken='))
             ?.split('=')[1] || null;
  }
  return null;
}

/**
 * Create a new order
 */
export async function createOrder(orderData: OrderRequest): Promise<OrderResponse> {
  const authToken = getAuthToken();

  if (!authToken) {
    throw new Error('Authentication required. Please log in to complete your order.');
  }

  const response = await fetch(`${API_BASE_URL}/api/users/order/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to create order';

    try {
      const errorData: ApiError = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;

      // Handle validation errors
      if (errorData.errors) {
        const firstError = Object.values(errorData.errors)[0];
        if (firstError && Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        }
      }
    } catch (e) {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<OrderResponse> {
  const authToken = getAuthToken();

  if (!authToken) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/api/users/order/${orderId}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }

  return response.json();
}

/**
 * Get user's order history
 */
export async function getUserOrders(): Promise<OrderResponse[]> {
  const authToken = getAuthToken();

  if (!authToken) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/api/users/orders/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  return response.json();
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string): Promise<OrderResponse> {
  const authToken = getAuthToken();

  if (!authToken) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/api/users/order/${orderId}/cancel/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to cancel order');
  }

  return response.json();
}
