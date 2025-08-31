import { getClientApiUrl } from '../config';
import type { components } from './types';

const API_BASE_URL = getClientApiUrl();

// Кэш для предотвращения дублирующих запросов
let pendingRequests: { [key: string]: Promise<any> } = {};

function createRequestKey(method: string, path: string): string {
  return `${method}:${path}`;
}

async function makeRequest<T = any>(url: string, options: RequestInit): Promise<T> {
  const requestKey = createRequestKey(options.method || 'GET', url);

  // Если уже есть такой запрос в процессе, возвращаем его результат
  if (pendingRequests[requestKey]) {
    return pendingRequests[requestKey];
  }

  // Создаем новый запрос и сохраняем его промис
  const requestPromise = fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  })
    .then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          `Request failed: ${res.status}${
            errorData ? ` - ${JSON.stringify(errorData)}` : ''
          }`
        );
      }
      return res.json();
    })
    .finally(() => {
      // Удаляем запрос из кэша после завершения
      delete pendingRequests[requestKey];
    });

  pendingRequests[requestKey] = requestPromise;
  return requestPromise;
}

export async function getCart(token: string): Promise<components['schemas']['CartResponseSchema']> {
  return makeRequest<components['schemas']['CartResponseSchema']>(`${API_BASE_URL}/api/users/carts/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}

export async function updateCartItem(
  token: string,
  productId: string,
  quantity: number,
  variantId?: string
): Promise<components['schemas']['CartResponseSchema']> {
  try {
    if (quantity <= 0 || quantity > 100) {
      throw new Error('Invalid quantity: must be between 1 and 100');
    }

    const numericProductId = Number(productId);
    if (isNaN(numericProductId)) {
      throw new Error('Invalid product ID');
    }

    const url = new URL(`${API_BASE_URL}/api/users/carts/items/${numericProductId}/`);
    url.searchParams.append('quantity', quantity.toString());
    if (variantId) {
      url.searchParams.append('variant_id', variantId);
    }

    return makeRequest<components['schemas']['CartResponseSchema']>(url.toString(), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in updateCartItem:', error);
    throw error;
  }
}

export async function removeCartItem(
  token: string,
  productId: string,
  variantId?: string
): Promise<components['schemas']['CartUpdateResponseSchema']> {
  try {
    const numericProductId = Number(productId);
    if (isNaN(numericProductId)) {
      throw new Error('Invalid product ID');
    }

    const url = new URL(`${API_BASE_URL}/api/users/carts/items/${numericProductId}/`);
    if (variantId) {
      url.searchParams.append('variant_id', variantId);
    }

    return makeRequest<components['schemas']['CartUpdateResponseSchema']>(url.toString(), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error in removeCartItem:', error);
    throw error;
  }
}
