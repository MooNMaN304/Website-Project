import {
  HIDDEN_PRODUCT_TAG,
  TAGS
} from 'lib/constants';
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
import { getCollectionQuery } from './queries/collection';
import { getPageQuery, getPagesQuery } from './queries/page';
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
  ShopifyCreateCartOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProduct,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation
} from './types';

// Use local backend instead of Shopify
const LOCAL_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, 'https://')
  : '';

const endpoint = `${LOCAL_API_BASE}/api`;

type ExtractVariables<T> = T extends { variables: object }
  ? T['variables']
  : never;

// Function to call local backend API
async function localApiFetch<T>(url: string, options?: RequestInit): Promise<{ status: number; body: T }> {
  try {
    const result = await fetch(`${LOCAL_API_BASE}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });

    const body = await result.json();

    if (!result.ok) {
      throw new Error(`API Error: ${result.status} ${result.statusText}`);
    }

    return {
      status: result.status,
      body
    };
  } catch (e) {
    throw {
      status: e instanceof Error && 'status' in e ? (e as any).status : 500,
      message: e instanceof Error ? e.message : 'Unknown error',
      query: url
    };
  }
}

export async function shopifyFetch<T>({
  headers,
  query,
  variables
}: {
  headers?: HeadersInit;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  // For backward compatibility, return empty data structure
  console.log('[LOCAL API MODE] GraphQL query bypassed, using local API instead');
  return {
    status: 200,
    body: { data: {} } as T
  };
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
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
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

  // If collection is empty or 'all', get all products
  if (!collection || collection === '' || collection === 'all') {
    return getProducts({ reverse, sortKey });
  }

  // Map collection names to category IDs
  // You can modify these mappings to match your actual categories
  const categoryMap: { [key: string]: number } = {
    'electronics': 1,
    'clothing': 2,
    // Add more mappings as needed
  };

  const categoryId = categoryMap[collection];
  if (!categoryId) {
    console.log(`No category ID found for collection: ${collection}`);
    return [];
  }

  try {
    const url = new URL(`${LOCAL_API_BASE}/api/category/${categoryId}`);
    if (reverse !== undefined) url.searchParams.append('reverse', String(reverse));
    if (sortKey) url.searchParams.append('sortKey', sortKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error('Failed to fetch collection products:', response.statusText);
      return [];
    }

    const data = await response.json();
    const products = data.products || [];

    return products.map((product: any) => ({
      id: product.id.toString(),
      handle: `product-${product.id}`,
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
      featuredImage: product.image_url ? {
        url: `${LOCAL_API_BASE}${product.image_url}`,
        altText: product.name || 'Product image',
        width: 300,
        height: 300
      } : {
        url: '/placeholder.svg',
        altText: 'No image',
        width: 300,
        height: 300
      },
      images: product.image_url ? [{
        url: `${LOCAL_API_BASE}${product.image_url}`,
        altText: product.name || 'Product image',
        width: 300,
        height: 300
      }] : [{
        url: '/placeholder.svg',
        altText: 'No image',
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
  } catch (error) {
    console.error('Error fetching collection products from local API:', error);
    return [];
  }
}

export async function getCollections(): Promise<Collection[]> {
  'use cache';
  cacheTag(TAGS.collections);
  cacheLife('days');

  // Return hardcoded categories that match your backend structure
  // You can modify these to match your actual categories
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
    {
      handle: 'electronics',
      title: 'Electronics',
      description: 'Electronic products',
      seo: {
        title: 'Electronics',
        description: 'Electronic products'
      },
      path: '/search/electronics',
      updatedAt: new Date().toISOString()
    },
    {
      handle: 'clothing',
      title: 'Clothing',
      description: 'Clothing and apparel',
      seo: {
        title: 'Clothing',
        description: 'Clothing and apparel'
      },
      path: '/search/clothing',
      updatedAt: new Date().toISOString()
    }
  ];

  return collections;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  'use cache';
  cacheTag(TAGS.collections);
  cacheLife('days');

  // Return hardcoded menu items for your local API
  // You can modify these to match your site structure
  const menuItems = [
    {
      title: 'All Products',
      path: '/search'
    },
    {
      title: 'Electronics',
      path: '/search/electronics'
    },
    {
      title: 'Clothing',
      path: '/search/clothing'
    }
  ];

  return menuItems;
}

export async function getPage(handle: string): Promise<Page> {
  const res = await shopifyFetch<ShopifyPageOperation>({
    query: getPageQuery,
    variables: { handle }
  });

  return res.body.data.pageByHandle;
}

export async function getPages(): Promise<Page[]> {
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

  if (!handle) {
    console.error('No product handle provided');
    return undefined;
  }

  // Extract product ID from handle if it has the format 'product-123'
  const idMatch = handle.match(/^product-(\d+)$/);
  const productId = idMatch ? idMatch[1] : handle;

  try {
    const response = await fetch(`${LOCAL_API_BASE}/api/products/${productId}`);

    if (!response.ok) {
      console.error('Failed to fetch product:', response.statusText);
      return undefined;
    }

    const product = await response.json();

    // Convert backend product to frontend format
    return {
      id: product.id.toString(),
      handle: `product-${product.id}`,
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
      featuredImage: product.image_url ? {
        url: `${LOCAL_API_BASE}${product.image_url}`,
        altText: product.name || 'Product image',
        width: 600,
        height: 600
      } : {
        url: '/placeholder.svg',
        altText: 'No image',
        width: 600,
        height: 600
      },
      images: product.image_url ? [{
        url: `${LOCAL_API_BASE}${product.image_url}`,
        altText: product.name || 'Product image',
        width: 600,
        height: 600
      }] : [{
        url: '/placeholder.svg',
        altText: 'No image',
        width: 600,
        height: 600
      }],
      seo: {
        title: product.name || 'Product',
        description: product.description || ''
      },
      options: [],
      availableForSale: true
    };
  } catch (error) {
    console.error('Error fetching product from local API:', error);
    return undefined;
  }
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

  try {
    const response = await fetch(`${LOCAL_API_BASE}/api/products/${productId}/recommendations`);

    if (!response.ok) {
      console.error('Failed to fetch product recommendations:', response.statusText);
      return [];
    }

    const data = await response.json();
    const products = data.edges || [];

    return products.map((product: any) => ({
      id: product.id.toString(),
      handle: `product-${product.id}`,
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
      featuredImage: product.image_url ? {
        url: `${LOCAL_API_BASE}${product.image_url}`,
        altText: product.name || 'Product image',
        width: 300,
        height: 300
      } : {
        url: '/placeholder.svg',
        altText: 'No image',
        width: 300,
        height: 300
      },
      images: product.image_url ? [{
        url: `${LOCAL_API_BASE}${product.image_url}`,
        altText: product.name || 'Product image',
        width: 300,
        height: 300
      }] : [{
        url: '/placeholder.svg',
        altText: 'No image',
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
  } catch (error) {
    console.error('Error fetching product recommendations from local API:', error);
    return [];
  }
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
  console.log('🟨 getProducts() called - using local API');

  try {
    const url = new URL(`${LOCAL_API_BASE}/api/products`);
    if (query) url.searchParams.append('query', query);
    if (sortKey) url.searchParams.append('sortKey', sortKey);
    if (reverse !== undefined) url.searchParams.append('reverse', String(reverse));

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error('Failed to fetch products:', response.statusText);
      return [];
    }

    const data = await response.json();
    // Convert backend response to frontend format
    const products = data.products || [];
    return products.map((product: any) => ({
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
      featuredImage: product.image_url ? {
        url: `${LOCAL_API_BASE}${product.image_url}`,
        altText: product.name || 'Product image',
        width: 300,
        height: 300
      } : {
        url: '/placeholder.svg',
        altText: 'No image',
        width: 300,
        height: 300
      },
      images: product.image_url ? [{
        url: `${LOCAL_API_BASE}${product.image_url}`,
        altText: product.name || 'Product image',
        width: 300,
        height: 300
      }] : [{
        url: '/placeholder.svg',
        altText: 'No image',
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
  } catch (error) {
    console.error('Error fetching products from local API:', error);
    return [];
  }
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {

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
