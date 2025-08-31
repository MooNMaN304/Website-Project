/**
 * Client-safe Shopify library stub
 * This provides the necessary exports for components without server-side dependencies
 */

import { getClientApiUrl, getApiUrl } from '../config';
import type {
  Cart,
  Collection,
  Menu,
  Page,
  Product,
  ProductVariant
} from './types';

// Mock implementations that work client-side
export async function getCart(): Promise<Cart | undefined> {
  // Return undefined for client-side - cart is managed by cart context
  return undefined;
}

export async function createCart(): Promise<Cart> {
  // Empty cart structure
  return {
    id: `cart_${Date.now()}`,
    checkoutUrl: '/checkout',
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: '0', currencyCode: 'USD' },
      totalAmount: { amount: '0', currencyCode: 'USD' },
      totalTaxAmount: { amount: '0', currencyCode: 'USD' }
    }
  };
}

export async function addToCart(lines: any[]): Promise<Cart> {
  console.warn('addToCart called - this should be handled by cart context');
  return createCart();
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  console.warn('removeFromCart called - this should be handled by cart context');
  return createCart();
}

export async function updateCart(lines: any[]): Promise<Cart> {
  console.warn('updateCart called - this should be handled by cart context');
  return createCart();
}

// Collection functions - these could fetch from your backend
export async function getCollections(): Promise<Collection[]> {
  try {
    const response = await fetch(`${getClientApiUrl()}/api/collections/`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error('Error fetching collections:', error);
  }
  return [];
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  try {
    const response = await fetch(`${getApiUrl()}/api/collections/${handle}/`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error('Error fetching collection:', error);
  }
  return undefined;
}

export async function getCollectionProducts(
  collection: string,
  reverse?: boolean,
  sortKey?: string
): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (reverse) params.set('reverse', 'true');
    if (sortKey) params.set('sort', sortKey);

    const response = await fetch(`${getApiUrl()}/api/collections/${collection}/products/?${params}`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error('Error fetching collection products:', error);
  }
  return [];
}

// Product functions
export async function getProduct(handle: string): Promise<Product | undefined> {
  try {
    const response = await fetch(`${getApiUrl()}/api/products/${handle}/`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  }
  return undefined;
}

export async function getProducts(
  options?: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
  }
): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (options?.query) params.set('q', options.query);
    if (options?.reverse) params.set('reverse', 'true');
    if (options?.sortKey) params.set('sort', options.sortKey);

    const response = await fetch(`${getApiUrl()}/api/products/?${params}`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
  return [];
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
  try {
    const response = await fetch(`${getApiUrl()}/api/products/${productId}/recommendations/`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error('Error fetching product recommendations:', error);
  }
  return [];
}

// Page functions
export async function getPage(handle: string): Promise<Page | undefined> {
  try {
    const response = await fetch(`${getApiUrl()}/api/pages/${handle}/`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error('Error fetching page:', error);
  }
  return undefined;
}

export async function getPages(): Promise<Page[]> {
  try {
    const response = await fetch(`${getApiUrl()}/api/pages/`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error('Error fetching pages:', error);
  }
  return [];
}

// Menu functions
export async function getMenu(handle: string): Promise<Menu[]> {
  try {
    // Use the appropriate API URL based on environment
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/menus/${handle}/`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error('Error fetching menu:', error);
  }
  return [];
}

// Re-export types for convenience
export type {
  Cart,
  Collection,
  Menu,
  Page,
  Product,
  ProductVariant
} from './types';
