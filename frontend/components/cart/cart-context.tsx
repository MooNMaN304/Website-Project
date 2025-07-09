'use client';

import type {
  Cart,
  Product,
  ProductVariant
} from 'lib/shopify/types';
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import {
  getCart as getLocalCart,
  addProductToCart,
  updateCart as updateLocalCart,
  removeFromCart as removeFromLocalCart
} from 'lib/cart';

type UpdateType = 'plus' | 'minus' | 'delete';

type CartContextType = {
  cart: Cart | undefined;
  setCart: React.Dispatch<React.SetStateAction<Cart | undefined>>;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isLoading: boolean;
  updateCartItem: (merchandiseId: string, updateType: UpdateType) => Promise<void>;
  addCartItem: (variant: ProductVariant, product: Product) => Promise<void>;
  initializeCart: () => Promise<void>;
  clearCart: () => void;
};

// Helper function to build delete URL from cart item
function buildDeleteUrl(cartItem: any): string | null {
  try {
    if (!cartItem?.merchandise?.product?.id) {
      console.error('Invalid cart item structure for delete URL:', cartItem);
      return null;
    }

    // Extract product ID from the backend format: "product-123" -> 123
    const productIdMatch = cartItem.merchandise.product.id.match(/product-(\d+)/);
    if (!productIdMatch || !productIdMatch[1]) {
      console.error('Invalid product ID format:', cartItem.merchandise.product.id);
      return null;
    }

    const productId = parseInt(productIdMatch[1], 10);
    if (isNaN(productId)) {
      console.error('Invalid product ID:', productIdMatch[1]);
      return null;
    }

    const variant_id = cartItem.merchandise.id;

    let url = `/api/users/carts/items/${productId}/`;
    if (variant_id) {
      url += `?variant_id=${encodeURIComponent(variant_id)}`;
    }
    return url;
  } catch (error) {
    console.error('Error building delete URL:', error);
  }
  return null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;
  let currentPromise: Promise<ReturnType<T>> | null = null;

  return function executedFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
    // Если уже есть активный промис, возвращаем его
    if (currentPromise) {
      return currentPromise;
    }

    // Создаем новый промис
    currentPromise = new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          currentPromise = null;
          timeoutId = null;
        }
      }, wait);
    });

    return currentPromise;
  };
}

export function CartProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<Cart | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const operationsInProgress = useRef(new Map());
  const [authToken, setAuthToken] = useState<string | null>(null);
  const updateQueue = useRef<Map<string, number>>(new Map());

  const isOperationInProgress = useCallback((key: string) => {
    return operationsInProgress.current.has(key);
  }, []);

  const setOperationInProgress = useCallback((key: string, value: boolean) => {
    if (value) {
      operationsInProgress.current.set(key, true);
    } else {
      operationsInProgress.current.delete(key);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const newToken = token || null;

    // Only update if token actually changed
    if (newToken !== authToken) {
      setAuthToken(newToken);
    }

    // Listen for storage changes (including from other tabs/components)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authToken') {
        const newTokenFromStorage = event.newValue;
        if (newTokenFromStorage !== authToken) {
          setAuthToken(newTokenFromStorage);
        }
      }
    };

    // Listen for custom auth events
    const handleAuthChange = () => {
      const currentToken = localStorage.getItem('authToken');
      if (currentToken !== authToken) {
        setAuthToken(currentToken);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [authToken]);

  const initializeCart = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Initializing cart...');

      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await fetch('/api/users/carts/', {  // Добавляем слеш в конце URL
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (response.ok) {
          const cartData = await response.json();
          console.log('Loaded cart from backend:', cartData);

          // Ensure cartData has the expected structure
          if (!cartData || !Array.isArray(cartData.items)) {
            console.error('Invalid cart data structure:', cartData);
            setCart(undefined);
            return;
          }

          const totalQuantity = cartData.items.reduce((sum: number, item: any) => sum + (item?.quantity || 0), 0);
          const totalPrice = cartData.total_price || 0;

          setCart({
            id: 'cart-id',
            checkoutUrl: '/checkout',
            cost: {
              subtotalAmount: {
                amount: totalPrice.toString(),
                currencyCode: 'USD'
              },
              totalAmount: {
                amount: totalPrice.toString(),
                currencyCode: 'USD'
              },
              totalTaxAmount: {
                amount: '0',
                currencyCode: 'USD'
              }
            },
            lines: cartData.items.map((item: any) => {
              // The backend already returns items in the correct Shopify-like format
              if (!item || !item.merchandise || !item.merchandise.product) {
                console.warn('Invalid cart item:', item);
                return null;
              }

              return {
                id: item.id || '',
                quantity: item.quantity || 0,
                cost: item.cost || {
                  totalAmount: {
                    amount: '0',
                    currencyCode: 'USD'
                  }
                },
                merchandise: item.merchandise
              };
            }).filter(Boolean), // Remove any null items
            totalQuantity
          });
        } else {
          const errorText = await response.text();
          console.error('Failed to load cart from backend:', response.status);
          console.error('Error details:', errorText);
          setCart(undefined);
        }
      } else {
        setCart(undefined);
      }
    } catch (error) {
      console.error('Error initializing cart:', error);
      setCart(undefined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Re-initialize cart whenever auth token changes
    initializeCart();
  }, [authToken, initializeCart]);

  const debouncedUpdateCart = useCallback(
    debounce(async (merchandiseId: string, updateType: UpdateType) => {
      if (!cart) return;

      const itemToUpdate = cart.lines.find(item => item.merchandise.id === merchandiseId);
      if (!itemToUpdate) return;

      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const productIdMatch = itemToUpdate.merchandise.product.id.match(/product-(\d+)/);
        if (!productIdMatch?.[1]) return;

        const productId = parseInt(productIdMatch[1], 10);
        if (isNaN(productId)) return;

        const newQuantity = updateType === 'plus' ? itemToUpdate.quantity + 1 : itemToUpdate.quantity - 1;

        // Оптимистично обновляем UI немедленно
        setCart(prevCart => {
          if (!prevCart) return prevCart;
          return {
            ...prevCart,
            lines: prevCart.lines.map(line => {
              if (line.merchandise.id === merchandiseId) {
                return {
                  ...line,
                  quantity: newQuantity
                };
              }
              return line;
            }).filter(line => line.quantity > 0)
          };
        });

        if (newQuantity === 0) {
          const url = buildDeleteUrl(itemToUpdate);
          if (url) {
            await fetch(url, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              },
              credentials: 'same-origin'
            });
          }
        } else {
          await fetch(
            `/api/users/carts/items/${productId}/?variant_id=${encodeURIComponent(itemToUpdate.merchandise.id)}&quantity=${newQuantity}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              },
              credentials: 'same-origin'
            }
          );
        }

        // Задержка перед обновлением с сервера для избежания гонки состояний
        await new Promise(resolve => setTimeout(resolve, 300));
        await initializeCart();
      } catch (error) {
        console.error('Error updating cart:', error);
        // В случае ошибки откатываем оптимистичное обновление
        await initializeCart();
      }
    }, 500), // Увеличиваем время дебаунсинга до 500мс
    [cart, initializeCart]
  );

  const updateCartItem = useCallback(async (merchandiseId: string, updateType: UpdateType) => {
    const operationKey = `${merchandiseId}-${updateType}`;

    if (isOperationInProgress(operationKey)) {
      return;
    }

    try {
      setOperationInProgress(operationKey, true);
      await debouncedUpdateCart(merchandiseId, updateType);
    } finally {
      setTimeout(() => {
        setOperationInProgress(operationKey, false);
      }, 300); // Добавляем задержку перед сбросом состояния операции
    }
  }, [debouncedUpdateCart, isOperationInProgress, setOperationInProgress]);

  const addCartItem = useCallback(async (variant: ProductVariant, product: Product) => {
    const operationKey = `add-${variant.id}`;

    if (isOperationInProgress(operationKey)) {
      console.log('Add operation already in progress:', operationKey);
      return;
    }

    try {
      setOperationInProgress(operationKey, true);

      // Сначала добавляем товар локально
      const updatedCart = await addProductToCart(variant, product);
      setCart(updatedCart);

      // Затем отправляем запрос на бэкенд
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Extract product ID from the backend format: "product-123" -> 123 or "gid://shopify/Product/123" -> 123
          let productIdMatch = product.id.match(/product-(\d+)/);
          if (!productIdMatch) {
            productIdMatch = product.id.match(/Product\/(\d+)/);
          }
          if (!productIdMatch || !productIdMatch[1]) {
            console.error('Invalid product ID format:', product.id);
            return;
          }

          const productId = parseInt(productIdMatch[1], 10);
          if (isNaN(productId)) {
            console.error('Invalid product ID:', productIdMatch[1]);
            return;
          }

          await fetch('/api/users/carts/items/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              product_id: productId,
              variant_id: variant.id,
              quantity: 1,
            }),
          });

          // После успешного добавления обновляем корзину с сервера
          await initializeCart();
        } catch (error) {
          console.error('Failed to add item to backend cart:', error);
        }
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    } finally {
      setOperationInProgress(operationKey, false);
    }
  }, [setCart, isOperationInProgress, initializeCart]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const clearCart = useCallback(() => {
    setCart(undefined);
    // Also clear from localStorage if using local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('local_cart');
    }
  }, []);

  const value = useMemo(() => ({
    cart,
    setCart,
    isOpen,
    openCart,
    closeCart,
    isLoading,
    updateCartItem,
    addCartItem,
    initializeCart,
    clearCart
  }), [cart, isOpen, openCart, closeCart, isLoading, updateCartItem, addCartItem, initializeCart, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
