'use client';

import { useEffect, useState } from 'react';
import Grid from 'components/grid';
import ProductGridItems from 'components/layout/product-grid-items';
import { Product } from 'lib/shopify/types';
import type { operations } from 'lib/api/types';
import { getClientApiUrl } from 'lib/config';

interface ProductListProps {
  sortKey?: string;
  reverse?: boolean;
}

export default function ProductList({ sortKey, reverse }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch(`${getClientApiUrl()}/api/products`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform backend data to frontend format
        // Note: The API returns unknown type, so we need to cast it properly
        const apiData = data as any;
        const transformedProducts: Product[] = (apiData.products || []).map((product: any) => ({
          id: product.id.toString(),
          handle: product.id.toString(),
          title: product.name || 'Product',
          description: product.description || '',
          descriptionHtml: product.description || '',
          updatedAt: new Date().toISOString(),
          tags: [],
          priceRange: {
            maxVariantPrice: {
              amount: product.price?.toString() || '0',
              currencyCode: 'USD'
            },
            minVariantPrice: {
              amount: product.price?.toString() || '0',
              currencyCode: 'USD'
            }
          },
          variants: [{
            id: `variant-${product.id}`,
            title: 'Default',
            availableForSale: true,
            selectedOptions: [],
            price: {
              amount: product.price?.toString() || '0',
              currencyCode: 'USD'
            }
          }],
          featuredImage: {
            url: '/placeholder.svg',
            altText: product.name || 'Product image',
            width: 300,
            height: 300
          },
          images: [{
            url: '/placeholder.svg',
            altText: product.name || 'Product image',
            width: 300,
            height: 300
          }],
          seo: {
            title: product.name || 'Product',
            description: product.description || ''
          },
          options: [],
          availableForSale: true
        }));

        setProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [sortKey, reverse]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Loading products...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-red-500">
          Error loading products: {error}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Catalog</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {products.length === 0
            ? 'No products available at the moment.'
            : `Showing ${products.length} product${products.length > 1 ? 's' : ''}`
          }
        </p>
      </div>

      {products.length > 0 ? (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            No products are currently available in our catalog.
          </p>
        </div>
      )}
    </>
  );
}
