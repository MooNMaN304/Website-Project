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

const CartContext = createContext<CartContextType | undefined>(undefined);

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
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
          timeoutId = null;
        }
      }, wait);
    });
  };
}

export function CartProvider({ children }: { children: React.ReactNode; }) {
  const [cart, setCart] = useState<Cart | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const operationsInProgress = useRef(new Map());

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

  const initializeCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setCart(undefined);
        return;
      }

      const response = await fetch('/api/users/carts/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const cartData = await response.json();
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
          lines: cartData.items.map((item: any) => ({
            id: item.id || '',
            quantity: item.quantity || 0,
            cost: {
              totalAmount: {
                amount: (item.cost?.totalAmount?.amount || '0').toString(),
                currencyCode: 'USD'
              }
            },
            merchandise: item.merchandise
          })).filter(Boolean),
          totalQuantity
        });
      } else {
        console.error('Failed to load cart:', response.status);
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
    initializeCart();
  }, [initializeCart]);

  const updateCartItem = useCallback(async (merchandiseId: string, updateType: UpdateType) => {
    const operationKey = `${merchandiseId}-${updateType}`;
    if (isOperationInProgress(operationKey)) return;

    setOperationInProgress(operationKey, true);
    let response;

    try {
      if (!cart) return;

      const itemToUpdate = cart.lines.find(item => item.merchandise.id === merchandiseId);
      if (!itemToUpdate) return;

      const token = localStorage.getItem('authToken');
      if (!token) return;

      const productIdMatch = itemToUpdate.merchandise.product.id.match(/product-(\d+)/);
      if (!productIdMatch?.[1]) return;

      const productId = parseInt(productIdMatch[1], 10);
      if (isNaN(productId)) return;

      let newQuantity = updateType === 'delete' ? 0 :
                      updateType === 'plus' ? itemToUpdate.quantity + 1 :
                      Math.max(0, itemToUpdate.quantity - 1);

      // Защита от отрицательных значений и проверка типа
      newQuantity = Math.max(0, parseInt(newQuantity.toString(), 10));

      // Логируем значения для отладки
      console.log('Update cart:', {
        productId,
        merchandiseId: itemToUpdate.merchandise.id,
        updateType,
        oldQuantity: itemToUpdate.quantity,
        newQuantity
      });

      // Делаем прямой вызов API в зависимости от типа операции
      if (newQuantity === 0) {
        // DELETE запрос для удаления товара
        // Используем URLSearchParams для формирования query параметров
        const searchParams = new URLSearchParams();
        searchParams.set('variant_id', itemToUpdate.merchandise.id);
        const deleteUrl = `/api/users/carts/items/${productId}/?${searchParams.toString()}`;

        console.log('Cart DELETE operation:', {
          url: deleteUrl,
          method: 'DELETE',
          productId,
          variant_id: itemToUpdate.merchandise.id,
          fullUrl: deleteUrl
        });

        // Используем AbortController для предотвращения дублирования запросов
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            signal: controller.signal
          });
        } finally {
          clearTimeout(timeoutId);
        }
      } else {
        // PUT запрос для обновления количества
        // Используем URLSearchParams для гарантированно правильного формирования query параметров
        const putParams = new URLSearchParams();
        putParams.set('variant_id', itemToUpdate.merchandise.id);
        putParams.set('quantity', newQuantity.toString());

        const putUrl = `/api/users/carts/items/${productId}?${putParams.toString()}`;

        console.log('Cart PUT operation:', {
          url: putUrl,
          method: 'PUT',
          productId,
          variantId: itemToUpdate.merchandise.id,
          quantity: newQuantity,
          queryParams: putParams.toString()
        });

        // Используем AbortController для предотвращения дублирования запросов
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          response = await fetch(putUrl, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            signal: controller.signal
          });
        } finally {
          clearTimeout(timeoutId);
        }
      }

      if (!response?.ok) {
        const errorText = await response?.text();
        const responseDetails = {
          status: response?.status,
          statusText: response?.statusText,
          headers: Object.fromEntries(response?.headers.entries() || []),
          url: response?.url,
          body: errorText
        };
        console.error('Server response error:', responseDetails);
        throw new Error(`Failed to update cart: ${response?.status} ${errorText}`);
      } else {
        console.log('Server response success:', {
          status: response?.status,
          statusText: response?.statusText,
          url: response?.url
        });
      }

      // После успешного обновления на сервере обновляем UI
      await initializeCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setOperationInProgress(operationKey, false);
    }
  }, [cart, isOperationInProgress, setOperationInProgress, initializeCart]);

  const addCartItem = useCallback(async (variant: ProductVariant, product: Product) => {
    const operationKey = `add-${variant.id}`;
    if (isOperationInProgress(operationKey)) return;

    setOperationInProgress(operationKey, true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      let productIdMatch = product.id.match(/product-(\d+)/);
      if (!productIdMatch) {
        productIdMatch = product.id.match(/Product\/(\d+)/);
      }
      if (!productIdMatch?.[1]) {
        throw new Error('Invalid product ID format');
      }

      const productId = parseInt(productIdMatch[1], 10);
      if (isNaN(productId)) {
        throw new Error('Invalid product ID');
      }

      const response = await fetch('/api/users/carts/items/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          variant_id: variant.id,
          quantity: 1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add item: ${response.status} ${errorText}`);
      }

      await initializeCart();
    } catch (error) {
      console.error('Error adding item to cart:', error);
    } finally {
      setOperationInProgress(operationKey, false);
    }
  }, [isOperationInProgress, setOperationInProgress, initializeCart]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const clearCart = useCallback(() => setCart(undefined), []);

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
