'use client';

import CartSection from './cart-section';
import LogoSquare from 'components/logo-square';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import MobileMenu from './mobile-menu';
import Search from './search';
import { Menu } from 'lib/shopify/types';

// Use NEXT_PUBLIC_ prefix for client-side environment variables
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'STORE';

export function ClientNavbar() {
  const [menu, setMenu] = useState<Menu[]>([]);

  // This would normally fetch the menu from an API
  // For simplicity, we're using a hardcoded menu
  const defaultMenu = useMemo(() => [
    { title: 'Home', path: '/' },
    { title: 'Search', path: '/search' },
    { title: 'Products', path: '/search/all-products' }
  ], []);

  useEffect(() => {
    setMenu(defaultMenu);
  }, [defaultMenu]);

  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="block flex-none md:hidden">
        <MobileMenu menu={menu} />
      </div>
      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <Link
            href="/"
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <LogoSquare />
            <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block">
              {SITE_NAME}
            </div>
          </Link>
          <ul className="hidden gap-6 text-sm md:flex md:items-center">
            {menu.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.path}
                  className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden justify-center md:flex md:w-1/3">
          <Search />
        </div>        <div className="flex justify-end md:w-1/3">
          <CartSection />
        </div>
      </div>
    </nav>
  );
}
