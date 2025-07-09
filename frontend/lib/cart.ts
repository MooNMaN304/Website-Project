'use client';

import { Cart, CartItem, Product, ProductVariant } from './shopify/types';
import { updateCartItem, removeCartItem } from './api/cart';

// In-memory cart storage (will be lost on page refresh)
let cartCache: Cart | undefined;

// Local storage key for cart
const LOCAL_STORAGE_CART_KEY = 'local_cart';

// Generate a unique cart ID
function generateCartId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Generate a unique line ID
function generateLineId(): string {
  return `line_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Function to create an empty cart structure
function createEmptyCart(): Cart {
  return {
    id: generateCartId(),
    checkoutUrl: '/checkout', // Frontend route for checkout
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: '0', currencyCode: 'USD' },
      totalAmount: { amount: '0', currencyCode: 'USD' },
      totalTaxAmount: { amount: '0', currencyCode: 'USD' }
    }
  };
}

// Helper to calculate item cost
function calculateItemCost(quantity: number, price: string): string {
  return (Number(price) * quantity).toString();
}

// Calculate cart totals
function updateCartTotals(lines: CartItem[]): Pick<Cart, 'totalQuantity' | 'cost'> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0
  );
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? 'USD';

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: '0', currencyCode }
    }
  };
}

// Load cart from localStorage
export function loadCartFromStorage(): Cart | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
    if (storedCart) {
      return JSON.parse(storedCart);
    }
  } catch (error) {
    console.error('Failed to load cart from storage:', error);
  }

  return undefined;
}

// Save cart to localStorage
export function saveCartToStorage(cart: Cart): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to storage:', error);
  }
}

// Get current cart or create a new one
export async function getCart(): Promise<Cart> {
  console.log('getCart called');

  // Use cached cart if available
  if (cartCache) {
    console.log('Returning cached cart:', cartCache);
    return cartCache;
  }

  // Try to load from localStorage
  const storedCart = loadCartFromStorage();
  let cart: Cart;

  if (storedCart) {
    console.log('Loaded cart from storage:', storedCart);
    cart = storedCart;
  } else {
    console.log('Creating new empty cart');
    // Create a new cart
    cart = createEmptyCart();
  }
    try {
    // Fetch products from the backend API
    const apiCartItems = await fetchCartProductsFromApi();

    if (apiCartItems.length > 0) {
      // Replace local cart lines with items from API
      cart.lines = apiCartItems;
      console.log('Cart items fetched from API:', cart.lines);

      // Update cart totals after fetching from API
      const totals = updateCartTotals(cart.lines);
      cart.totalQuantity = totals.totalQuantity;
      cart.cost = totals.cost;
    }
  } catch (error) {
    console.error('Error integrating API cart data:', error);
    // Continue with local cart if API call fails
  }
    // Save and cache the cart
  console.log('Final cart before caching:', cart);
  cartCache = cart;
  saveCartToStorage(cart);
  return cart;
}

// Add item to cart
export async function addToCart(lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const cart = await getCart();

  lines.forEach(({ merchandiseId, quantity }) => {
    const existingItemIndex = cart.lines.findIndex(
      (line) => line.merchandise.id === merchandiseId
    );

    if (existingItemIndex >= 0 && cart.lines[existingItemIndex]) {
      // Update existing item
      const existingItem = cart.lines[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;

      // Calculate new cost
      const singleItemAmount = Number(existingItem.cost.totalAmount.amount) / existingItem.quantity;
      const newTotalAmount = calculateItemCost(newQuantity, singleItemAmount.toString());

      cart.lines[existingItemIndex] = {
        id: existingItem.id || generateLineId(),
        quantity: newQuantity,
        cost: {
          totalAmount: {
            amount: newTotalAmount,
            currencyCode: existingItem.cost.totalAmount.currencyCode
          }
        },
        merchandise: existingItem.merchandise
      };
    } else {
      // For adding a new item, we would need product details
      // This would come from the product catalog in a real implementation
      // For now, we'll add a placeholder that will be updated later
      cart.lines.push({
        id: generateLineId(),
        quantity,
        cost: {
          totalAmount: {
            amount: '0', // Will be updated when product details are available
            currencyCode: 'USD'
          }
        },
        merchandise: {
          id: merchandiseId,
          title: 'Product',
          selectedOptions: [],
          product: {
            id: 'placeholder',
            handle: 'placeholder',
            title: 'Product',
            featuredImage: {
              url: '',
              altText: '',
              width: 0,
              height: 0
            }
          }
        }
      });
    }
  });

  // Update cart totals
  const totals = updateCartTotals(cart.lines);
  cart.totalQuantity = totals.totalQuantity;
  cart.cost = totals.cost;

  // Save updated cart
  cartCache = cart;
  saveCartToStorage(cart);

  return cart;
}

// Add product to cart with complete product details
export async function addProductToCart(variant: ProductVariant, product: Product, quantity: number = 1): Promise<Cart> {
  const cart = await getCart();

  const existingItemIndex = cart.lines.findIndex(
    (line) => line.merchandise.id === variant.id
  );

  const totalAmount = calculateItemCost(
    existingItemIndex >= 0 && cart.lines[existingItemIndex]
      ? cart.lines[existingItemIndex].quantity + quantity
      : quantity,
    variant.price.amount
  );

  if (existingItemIndex >= 0 && cart.lines[existingItemIndex]) {
    // Update existing item
    const existingItem = cart.lines[existingItemIndex];
    cart.lines[existingItemIndex] = {
      id: existingItem.id || generateLineId(),
      quantity: existingItem.quantity + quantity,
      cost: {
        totalAmount: {
          amount: totalAmount,
          currencyCode: variant.price.currencyCode
        }
      },
      merchandise: {
        id: variant.id,
        title: variant.title,
        selectedOptions: variant.selectedOptions,
        product: {
          id: product.id,
          handle: product.handle,
          title: product.title,
          featuredImage: product.featuredImage
        }
      }
    };
  } else {
    // Add new item
    cart.lines.push({
      id: generateLineId(),
      quantity,
      cost: {
        totalAmount: {
          amount: totalAmount,
          currencyCode: variant.price.currencyCode
        }
      },
      merchandise: {
        id: variant.id,
        title: variant.title,
        selectedOptions: variant.selectedOptions,
        product: {
          id: product.id,
          handle: product.handle,
          title: product.title,
          featuredImage: product.featuredImage
        }
      }
    });
  }

  // Update cart totals
  const totals = updateCartTotals(cart.lines);
  cart.totalQuantity = totals.totalQuantity;
  cart.cost = totals.cost;

  // Save updated cart
  cartCache = cart;
  saveCartToStorage(cart);

  return cart;
}

// Update item quantity
export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const cart = await getCart();
  // Make API calls to update cart items on the backend
  for (const { id, merchandiseId, quantity } of lines) {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const cartItem = cart.lines.find(
          (line) => (line.id === id || line.merchandise.id === merchandiseId)
        );
        if (cartItem) {
          const productIdMatch = cartItem.merchandise.product.id.match(/^product-(\d+)$/) || cartItem.merchandise.product.id.match(/^(\d+)$/);
          const productId = productIdMatch ? productIdMatch[1] : null;
          if (productId && !isNaN(Number(productId))) {
            const variantId = String(cartItem.merchandise.id);
            if (quantity === 0) {
              if (variantId) {
                await removeCartItem(token, productId, variantId);
              } else {
                await removeCartItem(token, productId);
              }
            } else {
              const response = await updateCartItem(token, productId, quantity, variantId);
              // Обновляем локальный кэш корзины на основе ответа от сервера
              if (response && response.items) {
                cart.lines = response.items;
                const totals = updateCartTotals(cart.lines);
                cart.totalQuantity = totals.totalQuantity;
                cart.cost = totals.cost;
                cartCache = cart;
                saveCartToStorage(cart);
                return cart;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to update cart item on backend:', error);
    }
  }

  // Если не удалось получить обновленные данные от сервера, обновляем локально
  lines.forEach(({ id, merchandiseId, quantity }) => {
    const existingItemIndex = cart.lines.findIndex(
      (line) => (line.id === id || line.merchandise.id === merchandiseId)
    );

    if (existingItemIndex >= 0 && cart.lines[existingItemIndex]) {
      const existingItem = cart.lines[existingItemIndex];
      const singleItemAmount = Number(existingItem.cost.totalAmount.amount) / existingItem.quantity;
      const newTotalAmount = calculateItemCost(quantity, singleItemAmount.toString());

      cart.lines[existingItemIndex] = {
        ...existingItem,
        quantity,
        cost: {
          totalAmount: {
            amount: newTotalAmount,
            currencyCode: existingItem.cost.totalAmount.currencyCode
          }
        }
      };
    }
  });

  const totals = updateCartTotals(cart.lines);
  cart.totalQuantity = totals.totalQuantity;
  cart.cost = totals.cost;
  cartCache = cart;
  saveCartToStorage(cart);

  return cart;
}

// Remove items from cart (local only - API removal should be handled by caller)
export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cart = await getCart();

  // Remove items from local cart only
  cart.lines = cart.lines.filter(
    (line) => !lineIds.includes(line.id || '')
  );

  // Update cart totals
  const totals = updateCartTotals(cart.lines);
  cart.totalQuantity = totals.totalQuantity;
  cart.cost = totals.cost;

  // Save updated cart
  cartCache = cart;
  saveCartToStorage(cart);

  return cart;
}

// Create a new cart (resets current cart)
export async function createCart(): Promise<Cart> {
  const newCart = createEmptyCart();
  cartCache = newCart;
  saveCartToStorage(newCart);
  return newCart;
}

// Clear cart data
export function clearCart(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
  }
  cartCache = undefined;
}

// Fetch cart products from API
export async function fetchCartProductsFromApi(): Promise<CartItem[]> {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.log('No auth token found, skipping API cart fetch');
      return [];
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    console.log('Fetching cart from API...');
    const response = await fetch('http://localhost:8000/api/users/carts/', {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`Error fetching cart: ${response.status} - ${response.statusText}`);
      throw new Error(`Error fetching cart: ${response.status}`);
    }

    const data = await response.json();
    console.log('API cart response:', data);

    // The API returns { user_id, items, total_items, total_price, created_at, updated_at }
    // We need the items array
    const items = data.items || [];
    console.log('Cart items from API:', items);

    return items;
  } catch (error) {
    console.error('Failed to fetch cart products from API:', error);
    return [];
  }
}
