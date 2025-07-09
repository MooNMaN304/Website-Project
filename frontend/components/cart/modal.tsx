'use client';

import clsx from 'clsx';
import { Dialog, Transition } from '@headlessui/react';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LoadingDots from 'components/loading-dots';
import Price from 'components/price';
import { DEFAULT_OPTION } from 'lib/constants';
import { createUrl } from 'lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { redirectToCheckout } from './actions';
import { useCart } from './cart-context';
import { DeleteItemButton } from './delete-item-button';
import { EditItemQuantityButton } from './edit-item-quantity-button';
import OpenCart from './open-cart';

export default function CartModal() {
  const { cart, isOpen, closeCart, updateCartItem, isLoading } = useCart();

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('Cart modal opened. Cart data:', cart);
      console.log('Cart lines:', cart?.lines);
      console.log('Cart lines length:', cart?.lines?.length);
      console.log('Total quantity:', cart?.totalQuantity);
      console.log('Is loading:', isLoading);

      // Debug each cart item
      if (cart?.lines) {
        cart.lines.forEach((item, index) => {
          console.log(`Cart item ${index}:`, item);
        });
      }
    }
  }, [isOpen, cart, isLoading]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={closeCart} className="relative z-50">
        {/* Transition overlay */}
        <Transition.Child
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-[.5px]"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="opacity-100 backdrop-blur-[.5px]"
          leaveTo="opacity-0 backdrop-blur-none"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        {/* Slide-out panel */}
        <Transition.Child
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl dark:border-neutral-700 dark:bg-black/80 dark:text-white md:w-[390px]">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">Cart</p>
              <button aria-label="Close cart" onClick={closeCart}>
                <XMarkIcon className="h-6" />
              </button>
            </div>

            {/* Показываем состояние загрузки */}
            {isLoading ? (
              <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                <LoadingDots className="mb-4" />
                <p className="text-center text-lg">Loading cart...</p>
              </div>
            ) : !cart || cart.lines.length === 0 ? (
              <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                <ShoppingCartIcon className="h-16" />
                <p className="mt-6 text-center text-2xl font-bold">
                  Your cart is empty.
                </p>
              </div>
            ) : (
              <CartContents cart={cart} updateCartItem={updateCartItem} closeCart={closeCart} />
            )}
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}

function CartContents({ cart, updateCartItem, closeCart }: any) {
  // Сортируем товары по ID для стабильного порядка
  const sortedLines = [...cart.lines].sort((a: any, b: any) =>
    `${a.merchandise.product.id}-${a.merchandise.id}`.localeCompare(`${b.merchandise.product.id}-${b.merchandise.id}`)
  );

  return (
    <>
      <div className="flex h-full flex-col justify-between overflow-hidden p-1">
        <ul className="grow overflow-auto py-4">
          {sortedLines.map((item: any) => {
            const searchParams = new URLSearchParams();

            item.merchandise.selectedOptions.forEach(({ name, value }: any) => {
              if (value !== DEFAULT_OPTION) {
                searchParams.set(name.toLowerCase(), value);
              }
            });

            const merchandiseUrl = createUrl(
              `/product/${item.merchandise.product.handle}`,
              searchParams
            );

            return (
              <li
                key={`${item.merchandise.product.id}-${item.merchandise.id}`}
                className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
              >
                <div className="relative flex w-full flex-row justify-between px-1 py-4">
                  <div className="absolute z-40 -ml-1 -mt-2">
                    <DeleteItemButton item={item} optimisticUpdate={updateCartItem} />
                  </div>
                  <div className="flex flex-row">
                    <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 dark:border-neutral-700">
                      <Image
                        className="h-full w-full object-cover"
                        width={64}
                        height={64}
                        alt={item.merchandise.product.title}
                        src={item.merchandise.product.featuredImage.url}
                      />
                    </div>
                    <Link
                      href={merchandiseUrl}
                      onClick={closeCart}
                      className="z-30 ml-2 flex flex-row space-x-4"
                    >
                      <div className="flex flex-1 flex-col text-base">
                        <span>{item.merchandise.product.title}</span>
                        {item.merchandise.title !== DEFAULT_OPTION && (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {item.merchandise.title}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                  <div className="flex h-16 flex-col justify-between">
                    <Price
                      className="text-right text-sm"
                      amount={item.cost.totalAmount.amount}
                      currencyCode={item.cost.totalAmount.currencyCode}
                    />
                    <div className="ml-auto flex h-9 items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                      <EditItemQuantityButton item={item} type="minus" optimisticUpdate={updateCartItem} />
                      <p className="w-6 text-center">{item.quantity}</p>
                      <EditItemQuantityButton item={item} type="plus" optimisticUpdate={updateCartItem} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Totals */}
        <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
          <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 dark:border-neutral-700">
            <p>Taxes</p>
            <Price amount={cart.cost.totalTaxAmount.amount} currencyCode={cart.cost.totalTaxAmount.currencyCode} />
          </div>
          <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
            <p>Shipping</p>
            <p className="text-right">Calculated at checkout</p>
          </div>
          <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
            <p>Total</p>
            <Price amount={cart.cost.totalAmount.amount} currencyCode={cart.cost.totalAmount.currencyCode} />
          </div>
        </div>

        {/* Checkout */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            redirectToCheckout();
          }}
        >
          <CheckoutButton />
        </form>
      </div>
    </>
  );
}

function CheckoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="block w-full rounded-full bg-blue-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100"
    >
      {pending ? <LoadingDots className="bg-white" /> : 'Proceed to Checkout'}
    </button>
  );
}
