import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Thank you for your purchase. Your order has been successfully processed.',
};

export default function CheckoutSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
