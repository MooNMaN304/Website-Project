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
      await optimisticUpdate(merchandiseId, 'delete');
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
