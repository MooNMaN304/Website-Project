import { mockProducts, mockCollections, mockCart, mockMenu, mockPage } from './data';
import { TAGS } from '../constants';

/**
 * This file contains mock implementations of the Shopify API functions
 * to allow the application to run without connecting to the Shopify API.
 */

function transformProduct(product, index = 1) {
  return {
    id: `product-${index}`,
    handle: product.product_name.toLowerCase().replace(/\s+/g, '-'),
    availableForSale: true,
    title: product.product_name,
    description: product.product_description,
    descriptionHtml: `<p>${product.product_description}</p>`,
    options: [
      {
        id: 'option-1',
        name: 'Size',
        values: ['S', 'M', 'L', 'XL']
      },
      {
        id: 'option-2',
        name: 'Color',
        values: ['Black', 'White', 'Blue']
      }
    ],
    priceRange: {
      maxVariantPrice: {
        amount: product.product_price.toFixed(2),
        currencyCode: 'USD'
      },
      minVariantPrice: {
        amount: product.product_price.toFixed(2),
        currencyCode: 'USD'
      }
    },
    variants: {
      edges: [
        {
          node: {
            id: `variant-${index}`,
            availableForSale: true,
            selectedOptions: [
              {
                name: 'Size',
                value: product.product_size.toUpperCase()
              },
              {
                name: 'Color',
                value: capitalize(product.product_color)
              }
            ],
            price: {
              amount: product.product_price.toFixed(2),
              currencyCode: 'USD'
            }
          }
        }
      ]
    },
    featuredImage: {
      url: 'https://picsum.photos/seed/picsum/800/800',
      altText: product.product_name,
      width: 800,
      height: 800
    },
    images: {
      edges: [
        {
          node: {
            url: 'https://picsum.photos/seed/picsum/800/800',
            altText: `${product.product_name} Front`,
            width: 800,
            height: 800
          }
        },
        {
          node: {
            url: 'https://picsum.photos/seed/product1/800/800',
            altText: `${product.product_name} Back`,
            width: 800,
            height: 800
          }
        }
      ]
    },
    seo: {
      title: product.product_name,
      description: product.product_description
    },
    tags: ['t-shirt', 'clothing', 'fashion'],
    updatedAt: new Date().toISOString()
  };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


export async function getProducts({ query, reverse, sortKey }: { 
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}) {
  // Simple filtering based on query
  let filteredProducts = [...mockProducts];
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.title.toLowerCase().includes(lowerQuery) || 
      product.description.toLowerCase().includes(lowerQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
  
  // Simple sorting logic
  if (sortKey === 'PRICE') {
    filteredProducts.sort((a, b) => {
      const aPrice = parseFloat(a.priceRange.minVariantPrice.amount);
      const bPrice = parseFloat(b.priceRange.minVariantPrice.amount);
      return reverse ? bPrice - aPrice : aPrice - bPrice;
    });
  } else if (sortKey === 'CREATED_AT') {
    // Already sorted by creation date
    if (reverse) {
      filteredProducts.reverse();
    }
  }
  
  return filteredProducts;
}

export async function getProduct({ handle }: { handle: string }) {
  const product = mockProducts.find(p => p.handle === handle);
  return product || null;
}

export async function getProductRecommendations({ productId }: { productId: string }) {
  // Return some products except the one with the given ID
  return mockProducts.filter(p => p.id !== productId).slice(0, 2);
}

export async function getCollections() {
  return [
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
    ...mockCollections
  ];
}

export async function getCollection({ handle }: { handle: string }) {
  if (handle === '') {
    return {
      handle: '',
      title: 'All',
      description: 'All products',
      seo: {
        title: 'All',
        description: 'All products'
      },
      path: '/search',
      updatedAt: new Date().toISOString()
    };
  }
  
  const collection = mockCollections.find(c => c.handle === handle);
  return collection || null;
}

export async function getCollectionProducts({ 
  collection, 
  reverse, 
  sortKey 
}: { 
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}) {
  // If collection handle is provided, filter products that belong to that collection
  // For simplicity, we'll just return all products for any valid collection
  
  try {
    const res = await fetch(`${process.env.FASTAPI_BASE_URL}/api/products/?page=1`);

    if (!res.ok) {
      throw new Error(`FastAPI fetch failed: ${res.statusText}`);
    }

    const data = await res.json();
    console.log(data)
    const transformedProducts = data.products.map((product, i) =>
      transformProduct(product, i + 1)
    );
    console.log(transformedProducts);
    return transformedProducts;
  } catch (error) {
    console.error('Error fetching from FastAPI:', error);
  }


  // if (collection && mockCollections.some(c => c.handle === collection)) {
  //   // Simulate products that belong to the specific collection
  //   return mockProducts.filter((_, index) => {
  //     if (collection === 'clothing') return index < 2; // First 2 products are clothing
  //     if (collection === 'accessories') return index >= 2; // Last product is accessory
  //     return true; // Return all for other collections
  //   });
  // }
  
  // // Return all products for default collection
  // return mockProducts;
}

export async function getMenu({ handle }: { handle: string }) {
  // Return our mock menu regardless of the handle for simplicity
  return mockMenu;
}

export async function getPage({ handle }: { handle: string }) {
  if (handle === 'about') {
    return mockPage;
  }
  return null;
}

export async function getPages() {
  return [mockPage];
}

// Cart functions
export async function createCart() {
  return { ...mockCart };
}

export async function addToCart({ 
  cartId, 
  lines 
}: { 
  cartId: string;
  lines: { merchandiseId: string; quantity: number }[];
}) {
  // In a real implementation, we would update the cart
  // For now, just return the mock cart
  return { ...mockCart };
}

export async function removeFromCart({ 
  cartId, 
  lineIds 
}: { 
  cartId: string;
  lineIds: string[];
}) {
  // Just return the mock cart
  return { ...mockCart };
}

export async function updateCart({ 
  cartId, 
  lines 
}: { 
  cartId: string;
  lines: { id: string; merchandiseId: string; quantity: number }[];
}) {
  // Just return the mock cart
  return { ...mockCart };
}

export async function getCart({ cartId }: { cartId: string }) {
  return { ...mockCart };
}

// This is a dummy function for API revalidation - no-op in mock mode
export async function revalidate(req: Request) {
  return new Response(JSON.stringify({ revalidated: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Mock shopifyFetch that returns success for any operation
export async function shopifyFetch({ 
  query, 
  variables, 
  headers 
}: { 
  query?: string;
  variables?: any;
  headers?: any;
}) {
  // This would typically make an actual API call to Shopify
  // Instead, we'll return a mock success response
  return {
    status: 200,
    body: {
      data: {} // The actual data would be filled by the specific functions above
    }
  };
}