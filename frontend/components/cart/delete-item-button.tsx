'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import type { CartItem } from 'lib/shopify/types';
import { useState } from 'react';

export function DeleteItemButton({
  item,
  optimisticUpdate
}: {
  item: CartItem;
  optimisticUpdate: any;
}) {
  const merchandiseId = item.merchandise.id;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDeleting) {
      console.log('Delete operation already in progress');
      return;
    }

    setIsDeleting(true);
    try {
      // Удаляем товар полностью
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      // Извлекаем product_id из формата "product-123"
      const productIdMatch = item.merchandise.product.id.match(/product-(\d+)/);
      if (!productIdMatch || !productIdMatch[1]) {
        console.error('Invalid product ID format:', item.merchandise.product.id);
        return;
      }

      const productId = parseInt(productIdMatch[1], 10);
      const url = `/api/users/carts/items/${productId}/?variant_id=${item.merchandise.id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.status}`);
      }

      await optimisticUpdate(merchandiseId, 'delete');
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label="Remove cart item"
      className={`flex h-[24px] w-[24px] items-center justify-center rounded-full ${
        isDeleting ? 'bg-neutral-300' : 'bg-neutral-500'
      }`}
    >
      <XMarkIcon className="mx-[1px] h-4 w-4 text-white dark:text-black" />
    </button>
  );
}
