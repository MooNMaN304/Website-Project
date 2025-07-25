import { mockProducts, mockCollections, mockCart, mockMenu, mockPage } from './data';
import { TAGS } from '../constants';

/**
 * This file contains mock implementations of the Shopify API functions
 * to allow the application to run without connecting to the Shopify API.
 */



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
  // handle is product-<id>  extracte id and make call to backend 
  const product = mockProducts.find(p => p.id === handle);
  if (product) {
    console.log(`[MOCK] Found product: ${product.title}`);
  } else {
    console.log(`[MOCK] No product found with handle: ${handle}`);
  }
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


// -----------------------------------------------------------------------------
export async function getCollectionProducts({ 
  collection, 
  reverse, 
  sortKey 
}: { 
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}) {
  try {
    const res = await fetch(`http://localhost:8000/api/products?page=1`);
    const data = await res.json();
    
    // Преобразуем GraphQL-структуру в плоский массив продуктов
    const products = data.edges.map((edge: any) => {
      const product = edge.node;
      
      // Преобразуем variants из edges/node в плоский массив
      const variants = product.variants.edges.map((v: any) => v.node);
      
      // Преобразуем images из edges/node в плоский массив
      const images = product.images.edges.map((i: any) => i.node);
      
      return {
        ...product,
        variants,
        images
      };
    });
    
    return products;
    
  } catch (error) {
    console.error('Error fetching from FastAPI:', error);
    return []; // Возвращаем пустой массив в случае ошибки
  }
}
// -----------------------------------------------------------------------------
// export async function getCollectionProducts({ 
//   collection, 
//   reverse, 
//   sortKey 
// }: { 
//   collection: string;
//   reverse?: boolean;
//   sortKey?: string;
// }) {
//   // If collection handle is provided, filter products that belong to that collection
//   // For simplicity, we'll just return all products for any valid collection
  
//   try {
//     const res = await fetch(`${process.env.FASTAPI_BASE_URL}/api/products?page=1`);

//     // if (!res.ok) {
//     //   throw new Error(`FastAPI fetch failed: ${res.statusText}`);
//     // }

//     const data = await res.json();
//     return data
//     // console.log(data)
//     // // const transformedProducts = data.products.map((product, i) =>
//     // //   transformProduct(product, i + 1)
//     // // );
//     // // console.log(transformedProducts);
//     // return data;
//     // return mockProducts.map((product, i
//   } catch (error) {
//     console.error('Error fetching from FastAPI:', error);
//   }


//   // if (collection && mockCollections.some(c => c.handle === collection)) {
//   //   // Simulate products that belong to the specific collection
//   //   return mockProducts.filter((_, index) => {
//   //     if (collection === 'clothing') return index < 2; // First 2 products are clothing
//   //     if (collection === 'accessories') return index >= 2; // Last product is accessory
//   //     return true; // Return all for other collections
//   //   });
//   // }
  
//   // // Return all products for default collection
//   // return mockProducts;
// }
// -----------------------------------------------------------------------------

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
// export async function createCart() {
//   return { ...mockCart };
// }
// --------------------------------------------------------------------------
// не нужно так как корзина создается автоматически на бекенде
export async function createCart() {
  const res = await fetch(`http://localhost:8000/api/users/carts/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  return await res.json();
}
// --------------------------------------------------------------------------

// export async function addToCart({ 
//   cartId, 
//   lines 
// }: { 
//   cartId: string;
//   lines: { merchandiseId: string; quantity: number }[];
// }) {
//   // In a real implementation, we would update the cart
//   // For now, just return the mock cart
//   return { ...mockCart };
// }
// --------------------------------------------------------------------------
export async function addToCart({
  cartId, // можно игнорировать
  lines
}: {
  cartId: string;
  lines: { merchandiseId: string; quantity: number }[];
}) {
  const item = {
    product_id: parseInt(lines[0].merchandiseId),
    variant_id: lines[0].variantId ?? null,
    quantity: lines[0].quantity
  };

  const res = await fetch(`http://localhost:8000/api/users/carts/items/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify(item)
  });

  return await res.json();
}
// --------------------------------------------------------------------------

// export async function removeFromCart({ 
//   cartId, 
//   lineIds 
// }: { 
//   cartId: string;
//   lineIds: string[];
// }) {
//   // Just return the mock cart
//   return { ...mockCart };
// }
// --------------------------------------------------------------------------
export async function removeFromCart({
  cartId,
  lineIds
}: {
  cartId: string;
  lineIds: string[];
}) {
  const res = await fetch(
    `http://localhost:8000/api/users/carts/items/${lineIds[0]}/`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    }
  );
  return await res.json();
}
// --------------------------------------------------------------------------
function getToken() {
  const cachedToken = localStorage.getItem('authToken');
  return cachedToken || '';
}
// --------------------------------------------------------------------------

// export async function updateCart({ 
//   cartId, 
//   lines 
// }: { 
//   cartId: string;
//   lines: { id: string; merchandiseId: string; quantity: number }[];
// }) {
//   // Just return the mock cart
//   return { ...mockCart };
// }
// --------------------------------------------------------------------------
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export async function updateCart({
  lines
}: {
  lines: { id: string; merchandiseId: string; quantity: number; variantId?: string }[];
}) {
  const item = lines[0];
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000);

  try {
    const url = new URL(`http://localhost:8000/api/users/carts/items/${item.merchandiseId}/`);
    url.searchParams.append('quantity', item.quantity.toString());
    if (item.variantId) {
      url.searchParams.append('variant_id', item.variantId);
    }

    const res = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      signal: controller.signal
    });
    clearTimeout(id);
    
    if (!res.ok) {
      throw new Error(`Failed to update cart: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request was aborted due to timeout');
    }
    throw error;
  }
}
// --------------------------------------------------------------------------

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