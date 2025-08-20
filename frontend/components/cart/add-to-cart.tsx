'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useProduct } from 'components/product/product-context';
import { Product, ProductVariant } from 'lib/shopify/types';
import { useActionState } from 'react';
import { useCart } from './cart-context';
import { getClientApiUrl } from '../../lib/config';

function SubmitButton({
  availableForSale,
  selectedVariantId
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
}) {
  const buttonClasses =
    'relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white';
  const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60';

  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        Out Of Stock
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        aria-label="Please select an option"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        Add To Cartssss
      </button>
    );
  }

  return (
    <button
      aria-label=""
      className={clsx(buttonClasses, {
        'hover:opacity-90': true
      })}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      Add To Cart
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();

  // Handle both array of variants and GraphQL edges/nodes structure
  const variantsArray = Array.isArray(variants)
    ? variants
    : (variants as any)?.edges?.map((edge: { node: ProductVariant }) => edge.node) || [];

  const variant = variantsArray.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()]
    )
  );
  const defaultVariantId = variantsArray.length === 1 ? variantsArray[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variantsArray.find(
    (variant: ProductVariant) => variant.id === selectedVariantId
  )!;

  return (
    <form
      action={async () => {
        const productId = parseInt(product.id?.split('-')[1] || '0', 10);
        try {
          // Добавляем товар в корзину через API
          const token = localStorage.getItem('authToken');
          await fetch(`${getClientApiUrl()}/api/users/carts/items/?quantity=1`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              product_id: productId,
              variant_id: selectedVariantId
            })
          });

          // После успешного добавления на бэкенде обновляем локальную корзину
          addCartItem(finalVariant, product);
        } catch (error) {
          console.error('Error adding item to cart:', error);
        }
      }}
    >
      <SubmitButton
        availableForSale={availableForSale}
        selectedVariantId={selectedVariantId}
      />
    </form>
  );
}
