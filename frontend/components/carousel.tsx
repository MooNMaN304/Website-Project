'use client';

import { useState, useEffect } from 'react';
import { fetchCollectionProducts } from 'lib/api/products';
import { Product } from 'lib/shopify/types';
import Link from 'next/link';
import { GridTileImage } from './grid/tile';

export function Carousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Collections that start with `hidden-*` are hidden from the search page.
        const fetchedProducts = await fetchCollectionProducts({
          collection: 'hidden-homepage-carousel'
        });

        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching carousel products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="w-full overflow-x-auto pb-6 pt-1">
        <ul className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3 animate-pulse bg-gray-200 rounded"
            />
          ))}
        </ul>
      </div>
    );
  }

  if (error) {
    console.error('Carousel error:', error);
    return null; // Gracefully hide the component on error
  }

  if (!products?.length) return null;

  // Purposefully duplicating products to make the carousel loop and not run out of products on wide screens.
  const carouselProducts = [...products, ...products, ...products];

  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul className="flex animate-carousel gap-4">
        {carouselProducts.map((product, i) => (
          <li
            key={`${product.id}${i}`}
            className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
          >
            <Link href={`/product/${product.id}`} className="relative h-full w-full">
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode
                }}
                src={product.featuredImage?.url || '/placeholder.svg'}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
