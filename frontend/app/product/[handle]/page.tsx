'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { GridTileImage } from 'components/grid/tile';
import { Gallery } from 'components/product/gallery';
import { ProductProvider } from 'components/product/product-context';
import { ProductDescription } from 'components/product/product-description';
import { fetchProduct } from 'lib/api/products';
import { Product, Image } from 'lib/shopify/types';
import Link from 'next/link';
import { Suspense } from 'react';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handle = params?.handle as string;

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;

      setLoading(true);
      setError(null);

      try {
        // Extract product ID from handle if it has the format 'product-123'
        const idMatch = handle.match(/^product-(\d+)$/);
        const productId = idMatch ? idMatch[1] : handle;

        if (!productId) {
          setError('Invalid product handle');
          return;
        }

        const fetchedProduct = await fetchProduct(productId);

        if (!fetchedProduct) {
          setError('Product not found');
          return;
        }

        setProduct(fetchedProduct);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [handle]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-red-500 text-center py-8">
        <p>Error: {error || 'Product not found'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      highPrice: product.priceRange.maxVariantPrice.amount,
      lowPrice: product.priceRange.minVariantPrice.amount
    }
  };

  return (
    <ProductProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd)
        }}
      />
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4">
        <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 md:p-12 lg:flex-row lg:gap-8 dark:border-neutral-800 dark:bg-black">
          <div className="h-full w-full basis-full lg:basis-4/6">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />
              }
            >
              <Gallery
                images={(product.images || []).slice(0, 5).map((image: Image) => ({
                  src: image.url,
                  altText: image.altText || ''
                }))}
              />
            </Suspense>
          </div>

          <div className="basis-full lg:basis-2/6">
            <Suspense fallback={null}>
              <ProductDescription product={product} />
            </Suspense>
          </div>
        </div>
        <RelatedProducts id={product.id} />
      </div>
    </ProductProvider>
  );
}

function RelatedProducts({ id }: { id: string }) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRelatedProducts = async () => {
      setLoading(true);
      try {
        // For now, we'll just return an empty array since getProductRecommendations is commented out
        // You can implement this later when you have the API endpoint
        setRelatedProducts([]);
      } catch (error) {
        console.error('Error fetching related products:', error);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadRelatedProducts();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
        <div className="text-center">Loading related products...</div>
      </div>
    );
  }

  if (!relatedProducts.length) return null;

  return (
    <div className="py-8">
      <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
      <ul className="flex w-full gap-4 overflow-x-auto pt-1">
        {relatedProducts.map((product) => (
          <li
            key={product.handle}
            className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
          >
            <Link
              className="relative h-full w-full"
              href={`/product/${product.handle}`}
              prefetch={true}
            >
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode
                }}
                src={product.featuredImage?.url}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
