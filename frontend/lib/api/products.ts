/**
 * Client-side API utilities for fetching data from the browser
 */
import { getClientApiUrl } from 'lib/config';
import { Product } from 'lib/api/types';
import { mapBackendProductsToFrontend, mapBackendProductToFrontend } from 'lib/mappers/product';
import type { components } from '../../src/types/api';

export interface GetProductsParams {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}

export interface GetCollectionProductsParams {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}

/**
 * Fetch products from the API (client-side only)
 */
export async function fetchProducts(params: GetProductsParams = {}): Promise<Product[]> {
  const { query, reverse, sortKey } = params;

  const url = new URL(`${getClientApiUrl()}/api/products`);
  if (query) url.searchParams.append('query', query);
  if (sortKey) url.searchParams.append('sortKey', sortKey);
  if (reverse !== undefined) url.searchParams.append('reverse', String(reverse));

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  const data = await response.json();
  const products: components['schemas']['ProductResponseSchema'][] = data.products || [];

  // Convert backend response to frontend format using type-safe mapper
  return mapBackendProductsToFrontend(products);
}

/**
 * Fetch collection products from the API (client-side only)
 */
export async function fetchCollectionProducts(params: GetCollectionProductsParams): Promise<Product[]> {
  const { collection, reverse, sortKey } = params;

  // If collection is empty or 'all', get all products
  if (!collection || collection === '' || collection === 'all') {
    return fetchProducts({ reverse, sortKey });
  }

  // Handle special homepage collections by returning products from all products
  if (collection.startsWith('hidden-homepage-')) {
    console.log(`🟨 Handling special homepage collection: ${collection}`);
    const allProducts = await fetchProducts({ reverse, sortKey });
    // Return the first few products for homepage collections
    return allProducts.slice(0, 10);
  }

  // Map collection names to category IDs
  const categoryMap: { [key: string]: number } = {
    'electronics': 1,
    'clothing': 2,
    // Add more mappings as needed
  };

  const categoryId = categoryMap[collection];
  if (!categoryId) {
    console.log(`No category ID found for collection: ${collection}, returning all products instead`);
    // Instead of returning empty array, return all products as fallback
    const allProducts = await fetchProducts({ reverse, sortKey });
    return allProducts.slice(0, 12); // Limit to 12 products for performance
  }

  try {
    const url = new URL(`${getClientApiUrl()}/api/category/${categoryId}`);
    if (sortKey) url.searchParams.append('sortKey', sortKey);
    if (reverse !== undefined) url.searchParams.append('reverse', String(reverse));

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error(`Failed to fetch collection products: ${response.statusText}`);
      // Fallback to all products
      const allProducts = await fetchProducts({ reverse, sortKey });
      return allProducts.slice(0, 12);
    }

    const data = await response.json();
    const products: components['schemas']['ProductResponseSchema'][] = data.products || [];

    // Convert backend response to frontend format using type-safe mapper
    return mapBackendProductsToFrontend(products);
  } catch (error) {
    console.error('Error fetching collection products:', error);
    // Fallback to all products
    const allProducts = await fetchProducts({ reverse, sortKey });
    return allProducts.slice(0, 12);
  }
}

/**
 * Fetch a single product by ID (client-side only)
 */
export async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${getClientApiUrl()}/api/products/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    const product: components['schemas']['ProductResponseSchema'] = await response.json();

    // Convert backend response to frontend format using type-safe mapper
    return mapBackendProductToFrontend(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}
