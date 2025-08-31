'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import Grid from 'components/grid';
import ProductGridItems from 'components/layout/product-grid-items';
import { defaultSort, sorting } from 'lib/constants';
import { getCollection, getCollectionProducts } from 'lib/shopify';
import type { Collection, Product } from 'lib/shopify/types';

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const sort = searchParams?.get('sort') || '';
  const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [collectionData, productsData] = await Promise.all([
          getCollection(params.collection as string),
          getCollectionProducts(
            params.collection as string,
            reverse,
            sortKey
          )
        ]);

        setCollection(collectionData || null);
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching collection data:', error);
        setCollection(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.collection, sortKey, reverse]);

  if (loading) {
    return (
      <section>
        <div className="py-3 text-lg animate-pulse">Loading...</div>
      </section>
    );
  }

  if (!collection) {
    return (
      <section>
        <p className="py-3 text-lg">Collection not found</p>
      </section>
    );
  }

  return (
    <section>
      {products.length === 0 ? (
        <p className="py-3 text-lg">{`No products found in this collection`}</p>
      ) : (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      )}
    </section>
  );
}
