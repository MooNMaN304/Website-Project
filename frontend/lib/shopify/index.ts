import {
  HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS
} from 'lib/constants';
import { isShopifyError } from 'lib/type-guards';
import { ensureStartsWith } from 'lib/utils';
import {
  revalidateTag,
  unstable_cacheTag as cacheTag,
  unstable_cacheLife as cacheLife
} from 'next/cache';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation
} from './mutations/cart';
import { getCartQuery } from './queries/cart';
import {
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery
} from './queries/collection';
import { getMenuQuery } from './queries/menu';
import { getPageQuery, getPagesQuery } from './queries/page';
import {
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery
} from './queries/product';
import {
  Cart,
  Collection,
  Connection,
  Image,
  Menu,
  Page,
  Product,
  ShopifyAddToCartOperation,
  ShopifyCart,
  ShopifyCartOperation,
  ShopifyCollection,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
  ShopifyCreateCartOperation,
  ShopifyMenuOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProduct,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation
} from './types';

// Import mock implementation
import * as mockShopify from '../mock/shopify';

// Check if we should use mock data
const useMockData = process.env.USE_MOCK_DATA === 'false';

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, 'https://')
  : '';
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type ExtractVariables<T> = T extends { variables: object }
  ? T['variables']
  : never;
  function postData(url: string, headers: Record<string, string>): Promise<{ status: number, body: any }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);

      for (const key in headers) {
        xhr.setRequestHeader(key, headers[key]);
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          const status = xhr.status;
          try {
            const body = JSON.parse(xhr.responseText);

            if (body.errors) {
              reject(body.errors[0]);
            } else {
              resolve({ status, body });
            }
          } catch (e) {
            reject(e);
          }
        }
      };

      xhr.send(); // You can modify this to pass a body if needed
    });
  }

  // Usage


  export async function shopifyFetch<T>({
    headers,
    query,
    variables
  }: {
    headers?: HeadersInit;
    query: string;
    variables?: ExtractVariables<T>;
  }): Promise<{ status: number; body: T } | never> {
    // If we're using mock data, use the mock shopifyFetch
    if (useMockData) {
      return mockShopify.shopifyFetch({ headers, query, variables });
    }

    try {
      const result = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': key,
          ...headers
        },
        body: JSON.stringify({
          ...(query && { query }),
          ...(variables && { variables })
        })
      });

      const body = await result.json();

      if (body.errors) {
        throw body.errors[0];
      }

      return {
        status: result.status,
        body
      };
    } catch (e) {
      if (isShopifyError(e)) {
        throw {
          cause: e.cause?.toString() || 'unknown',
          status: e.status || 500,
          message: e.message,
          query
        };
      }

      throw {
        error: e,
        query
      };
    }
  }


const removeEdgesAndNodes = <T>(array: Connection<T> | undefined | null): T[] => {
  if (!array || !array.edges) {
    return [];
  }
  return array.edges.map((edge) => edge?.node);
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: '0.0',
      currencyCode: cart.cost.totalAmount.currencyCode
    };
  }

  return {
    ...cart,
    lines: removeEdgesAndNodes(cart.lines)
  };
};

const reshapeCollection = (
  collection: ShopifyCollection
): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/search/${collection.handle}`
  };
};

const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

const reshapeImages = (images: Connection<Image> | undefined | null, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)?.[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`
    };
  });
};

const reshapeProduct = (
  product: ShopifyProduct,
  filterHiddenProducts: boolean = true
) => {
  if (
    !product ||
    (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants)
  };
};

const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

export async function createCart(): Promise<Cart> {
  if (useMockData) {
    return mockShopify.createCart();
  }

  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  if (useMockData) {
    const cartId = (await cookies()).get('cartId')?.value || 'mock-cart-id';
    return mockShopify.addToCart({ cartId, lines });
  }

  const cartId = (await cookies()).get('cartId')?.value!;
  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines
    }
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  if (useMockData) {
    const cartId = (await cookies()).get('cartId')?.value || 'mock-cart-id';
    return mockShopify.removeFromCart({ cartId, lineIds });
  }

  const cartId = (await cookies()).get('cartId')?.value!;
  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds
    }
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  if (useMockData) {
    const cartId = (await cookies()).get('cartId')?.value || 'mock-cart-id';
    return mockShopify.updateCart({ cartId, lines });
  }

  const cartId = (await cookies()).get('cartId')?.value!;
  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId,
      lines
    }
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getCart(): Promise<Cart | undefined> {
  if (useMockData) {
    const cartId = (await cookies()).get('cartId')?.value || 'mock-cart-id';
    return mockShopify.getCart({ cartId });
  }

  const cartId = (await cookies()).get('cartId')?.value;

  if (!cartId) {
    return undefined;
  }

  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: { cartId }
  });

  // Old carts becomes `null` when you checkout.
  if (!res.body.data.cart) {
    return undefined;
  }

  return reshapeCart(res.body.data.cart);
}

export async function getCollection(
  handle: string
): Promise<Collection | undefined> {
  'use cache';
  cacheTag(TAGS.collections);
  cacheLife('days');

  if (useMockData) {
    return mockShopify.getCollection({ handle });
  }

  const res = await shopifyFetch<ShopifyCollectionOperation>({
    query: getCollectionQuery,
    variables: {
      handle
    }
  });

  return reshapeCollection(res.body.data.collection);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  'use cache';
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife('days');

  if (useMockData) {
    return mockShopify.getCollectionProducts({ collection, reverse, sortKey });
  }

  const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
    query: getCollectionProductsQuery,
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === 'CREATED_AT' ? 'CREATED' : sortKey
    }
  });

  if (!res.body.data.collection) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }

  return reshapeProducts(
    removeEdgesAndNodes(res.body.data.collection.products)
  );
}

export async function getCollections(): Promise<Collection[]> {
  'use cache';
  cacheTag(TAGS.collections);
  cacheLife('days');

  if (useMockData) {
    return mockShopify.getCollections();
  }

  const res = await shopifyFetch<ShopifyCollectionsOperation>({
    query: getCollectionsQuery
  });
  const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
  const collections = [
    {
      handle: '',
      title: 'All',
      description: 'All products',
      seo: {
        title: 'All',
        description: 'All products'
      },
      path: '/search',
      updatedAt: new Date().toISOString()
    },
    // Filter out the `hidden` collections.
    // Collections that start with `hidden-*` need to be hidden on the search page.
    ...reshapeCollections(shopifyCollections).filter(
      (collection) => !collection.handle.startsWith('hidden')
    )
  ];

  return collections;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  'use cache';
  cacheTag(TAGS.collections);
  cacheLife('days');

  if (useMockData) {
    return mockShopify.getMenu({ handle });
  }

  const res = await shopifyFetch<ShopifyMenuOperation>({
    query: getMenuQuery,
    variables: {
      handle
    }
  });

  return (
    res.body?.data?.menu?.items.map((item: { title: string; url: string }) => ({
      title: item.title,
      path: item.url
        .replace(domain, '')
        .replace('/collections', '/search')
        .replace('/pages', '')
    })) || []
  );
}

export async function getPage(handle: string): Promise<Page> {
  if (useMockData) {
    return mockShopify.getPage({ handle });
  }

  const res = await shopifyFetch<ShopifyPageOperation>({
    query: getPageQuery,
    variables: { handle }
  });

  return res.body.data.pageByHandle;
}

export async function getPages(): Promise<Page[]> {
  if (useMockData) {
    return mockShopify.getPages();
  }

  const res = await shopifyFetch<ShopifyPagesOperation>({
    query: getPagesQuery
  });

  return removeEdgesAndNodes(res.body.data.pages);
}

// _____________________________________________________________________________________
// export async function getProduct(handle: string | undefined): Promise<Product | undefined> {
//   'use cache';
//   cacheTag(TAGS.products);
//   cacheLife('days');

//   if (!handle) {
//     console.error('No product handle provided');
//     return undefined;
//   }

//   const idMatch = handle.match(/^product-(\d+)$/);
//   if (!idMatch) {
//     console.error('Invalid product handle format:', handle);
//     return undefined;
//   }

//   const productId = idMatch[1];

//   try {
//     const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}`);
//     const product = await response.json();
//     return product;
//   } catch (error) {
//     console.error('Error fetching product:', error);
//     return undefined;
//   }
// }

export async function getProduct(handle: string): Promise<Product | undefined> {
  'use cache';
  cacheTag(TAGS.products);
  cacheLife('days');

  if (handle.startsWith('product-')) {
    const parts = handle.split('-');
    handle = parts[1] || handle;
  }
  if (useMockData) {
    const result = await fetch(`http://0.0.0.0:8000/api/products/${handle}`, {
      method: 'GET'
    });
    const product = await result.json();
    return product ? reshapeBackendProduct(product) : undefined;

    // const product = await mockShopify.getProduct({ handle: `product-${handle}` });
    // return product ? reshapeProduct(, false) : undefined;
  }

  // const res = await shopifyFetch<ShopifyProductOperation>({
  //   query: getProductQuery,
  //   variables: {
  //     handle
  //   }
  // });

  // return reshapeProduct(res.body.data.product, false);
}
// _____________________________________________________________________________________
// export async function getProduct(handle: string): Promise<Product | undefined> {
//   'use cache';
//   cacheTag(TAGS.products);
//   cacheLife('days');

//   if (useMockData) {
//     return mockShopify.getProduct({ handle });
//   }

//   const res = await shopifyFetch<ShopifyProductOperation>({
//     query: getProductQuery,
//     variables: {
//       handle
//     }
//   });

//   return reshapeProduct(res.body.data.product, false);
// }

export async function getProductRecommendations(
  productId: string
): Promise<Product[]> {
  'use cache';
  cacheTag(TAGS.products);
  cacheLife('days');



  if (useMockData) {
    return mockShopify.getProductRecommendations({ productId });
  }

  const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
    query: getProductRecommendationsQuery,
    variables: {
      productId
    }
  });

  return reshapeProducts(res.body.data.productRecommendations);
}

// _____________________________________________________________________________________
// export async function getProducts({
//   query,
//   reverse,
//   sortKey
// }: {
//   query?: string;
//   reverse?: boolean;
//   sortKey?: string;
// }): Promise<Product[]> {
//   'use cache';
//   cacheTag(TAGS.products);
//   cacheLife('days');

//   if (useMockData) {
//     return mockShopify.getProducts({ query, reverse, sortKey });
//   }

//   try {
//     const url = new URL('http://127.0.0.1:8000/api/products');
//     if (query) url.searchParams.append('query', query);
//     if (sortKey) url.searchParams.append('sortKey', sortKey);
//     if (reverse !== undefined) url.searchParams.append('reverse', String(reverse));

//     const response = await fetch(url.toString());

//     if (!response.ok) {
//       console.error('Failed to fetch products:', response.statusText);
//       return [];
//     }

//     const products = await response.json();
//     return products;
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     return [];
//   }
// }

// _____________________________________________________________________________________
export async function getProducts({
  query,
  reverse,
  sortKey
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  'use cache';
  cacheTag(TAGS.products);
  cacheLife('days');
  console.log('🟨 getProducts() вызвана');

  if (useMockData) {
    return mockShopify.getProducts({ query, reverse, sortKey });
  }

  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
    variables: {
      query,
      reverse,
      sortKey
    }
  });

  return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  if (useMockData) {
    return mockShopify.revalidate(req);
  }

  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = [
    'collections/create',
    'collections/delete',
    'collections/update'
  ];
  const productWebhooks = [
    'products/create',
    'products/delete',
    'products/update'
  ];
  const topic = (await headers()).get('x-shopify-topic') || 'unknown';
  const secret = req.nextUrl.searchParams.get('secret');
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error('Invalid revalidation secret.');
    return NextResponse.json({ status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections);
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products);
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}

// Convert backend product data to frontend format
const reshapeBackendProduct = (backendProduct: any): Product | undefined => {
  if (!backendProduct) {
    return undefined;
  }

  // Convert backend product format to frontend format
  const product: Product = {
    id: backendProduct.id?.toString() || '',
    handle: backendProduct.handle || `product-${backendProduct.id}`,
    availableForSale: backendProduct.available_for_sale ?? true,
    title: backendProduct.title || '',
    description: backendProduct.description || '',
    descriptionHtml: backendProduct.description || '',
    options: backendProduct.options || [],
    priceRange: {
      maxVariantPrice: {
        amount: backendProduct.price?.toString() || '0',
        currencyCode: 'USD'
      },
      minVariantPrice: {
        amount: backendProduct.price?.toString() || '0',
        currencyCode: 'USD'
      }
    },
    variants: backendProduct.variants || [],
    images: backendProduct.images || [],
    featuredImage: backendProduct.featured_image || {
      url: '',
      altText: backendProduct.title || '',
      width: 0,
      height: 0
    },
    seo: {
      title: backendProduct.title || '',
      description: backendProduct.description || ''
    },
    tags: backendProduct.tags || [],
    updatedAt: backendProduct.updated_at || new Date().toISOString()
  };

  return product;
};
