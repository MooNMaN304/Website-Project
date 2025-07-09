'use client';

import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useCart } from './cart-context';

export default function OpenCart({
  className
}: {
  className?: string;
}) {
  const { cart, openCart } = useCart();
  const quantity = cart?.totalQuantity || 0;

  return (
    <button
      aria-label="Open cart"
      onClick={openCart}
      className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:text-white dark:hover:border-neutral-600"
    >
      <ShoppingCartIcon
        className={clsx('h-4 transition-all ease-in-out hover:scale-110', className)}
      />

      {quantity > 0 ? (
        <div className="absolute right-0 top-0 -mr-2 -mt-2 h-4 w-4 rounded bg-blue-600 text-[11px] font-medium text-white flex items-center justify-center">
          {quantity}
        </div>
      ) : null}
    </button>
  );
}
