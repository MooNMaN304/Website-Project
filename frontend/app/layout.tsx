import { CartProvider } from 'components/cart/cart-context';
import { AuthProvider } from 'components/auth/auth-context';
import { OrderProvider } from 'components/orders/order-context';
import { Navbar } from 'components/layout/navbar';
import { WelcomeToast } from 'components/welcome-toast';
import { GeistSans } from 'geist/font/sans';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import './globals.css';
import { baseUrl } from 'lib/utils';

const { SITE_NAME } = process.env;

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`
  },
  robots: {
    follow: true,
    index: true
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="bg-white text-black dark:bg-black dark:text-white">
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              <Navbar />
              <main>
                {children}
                <Toaster closeButton />
                <WelcomeToast />
              </main>
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
