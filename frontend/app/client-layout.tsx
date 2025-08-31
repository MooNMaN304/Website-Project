'use client';

import { CartProvider } from 'components/cart/cart-context';
import { AuthProvider } from 'components/auth/auth-context';
import { OrderProvider } from 'components/orders/order-context';
import { Navbar } from 'components/layout/navbar';
import Footer from 'components/layout/footer';
import { WelcomeToast } from 'components/welcome-toast';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <Navbar />
          <main>
            {children}
            <Toaster closeButton />
            <WelcomeToast />
          </main>
          <Footer />
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}
