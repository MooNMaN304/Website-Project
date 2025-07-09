'use client';

import { useCallback, useRef, useState } from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { CartItem } from 'lib/shopify/types';

// Функция дебаунсинга
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function SubmitButton({
  type,
  onClick,
  disabled
}: {
  type: 'plus' | 'minus';
  onClick: (e: React.MouseEvent) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={
        type === 'plus' ? 'Increase item quantity' : 'Reduce item quantity'
      }
      className={clsx(
        'ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200',
        {
          'ml-auto': type === 'minus',
          'hover:border-neutral-800 hover:opacity-80': !disabled,
          'opacity-50 cursor-not-allowed': disabled
        }
      )}
    >
      {type === 'plus' ? (
        <PlusIcon className="h-4 w-4 dark:text-neutral-500" />
      ) : (
        <MinusIcon className="h-4 w-4 dark:text-neutral-500" />
      )}
    </button>
  );
}

export function EditItemQuantityButton({
  item,
  type,
  optimisticUpdate
}: {
  item: CartItem;
  type: 'plus' | 'minus';
  optimisticUpdate: any;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const lastUpdateTime = useRef(0);
  const DEBOUNCE_DELAY = 300; // 300ms задержка между запросами
  const MIN_REQUEST_INTERVAL = 500; // Минимальный интервал между запросами

  const handleAction = useCallback(
    debounce(async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      if (now - lastUpdateTime.current < MIN_REQUEST_INTERVAL) {
        return;
      }

      if (isLoading) return;

      try {
        setIsLoading(true);
        lastUpdateTime.current = now;
        await optimisticUpdate(item.merchandise.id, type);
      } finally {
        // Добавляем небольшую задержку перед сбросом состояния загрузки
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      }
    }, DEBOUNCE_DELAY),
    [item.merchandise.id, optimisticUpdate, type, isLoading]
  );

  return (
    <SubmitButton
      type={type}
      onClick={handleAction}
      disabled={isLoading}
    />
  );
}
