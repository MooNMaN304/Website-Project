'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { OrderResponse, getUserOrders } from 'lib/api/orders';

interface OrderContextType {
  orders: OrderResponse[];
  isLoading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  addOrder: (order: OrderResponse) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedOrders = await getUserOrders();
      setOrders(fetchedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addOrder = useCallback((order: OrderResponse) => {
    setOrders(prevOrders => [order, ...prevOrders]);
  }, []);

  useEffect(() => {
    // Load orders on mount
    refreshOrders();
  }, [refreshOrders]);

  return (
    <OrderContext.Provider value={{
      orders,
      isLoading,
      error,
      refreshOrders,
      addOrder
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
