'use client';

import { useState, useEffect } from 'react';
import { GridTileImage } from 'components/grid/tile';
import { fetchCollectionProducts } from 'lib/api/products';
import type { Product } from 'lib/shopify/types';
import Link from 'next/link';

function ThreeItemGridItem({
  item,
  size,
  priority
}: {
  item: Product;
  size: 'full' | 'half';
  priority?: boolean;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div
      className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
    >
      <Link
        className="relative block aspect-square h-full w-full"
        href={`/product/${item.id}`}
        prefetch={true}
      >
        {isClient && (
          <GridTileImage
            src={item.featuredImage?.url || '/placeholder.svg'}
            fill
            sizes={
              size === 'full' ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'
            }
            priority={priority}
            alt={item.title}
            label={{
              position: size === 'full' ? 'center' : 'bottom',
              title: item.title as string,
              amount: item.priceRange.maxVariantPrice.amount,
              currencyCode: item.priceRange.maxVariantPrice.currencyCode
            }}
          />
        )}
      </Link>
    </div>
  );
}

export function ThreeItemGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Don't fetch on server side

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Collections that start with `hidden-*` are hidden from the search page.
        const homepageItems = await fetchCollectionProducts({
          collection: 'hidden-homepage-featured-items'
        });

        setProducts(homepageItems);
      } catch (err) {
        console.error('Error fetching homepage products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [isClient]);

  if (!isClient || loading) {
    return (
      <section className="mx-auto grid max-w-(--breakpoint-2xl) gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
        <div className="md:col-span-4 md:row-span-2 animate-pulse bg-gray-200 rounded"></div>
        <div className="md:col-span-2 md:row-span-1 animate-pulse bg-gray-200 rounded"></div>
        <div className="md:col-span-2 md:row-span-1 animate-pulse bg-gray-200 rounded"></div>
      </section>
    );
  }

  if (error) {
    console.error('ThreeItemGrid error:', error);
    return null; // Gracefully hide the component on error
  }

  if (!products[0] || !products[1] || !products[2]) {
    return null;
  }

  const [firstProduct, secondProduct, thirdProduct] = products;

  return (
    <section className="mx-auto grid max-w-(--breakpoint-2xl) gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
      <ThreeItemGridItem size="full" item={firstProduct} priority={true} />
      <ThreeItemGridItem size="half" item={secondProduct} priority={true} />
      <ThreeItemGridItem size="half" item={thirdProduct} />
    </section>
  );
}
