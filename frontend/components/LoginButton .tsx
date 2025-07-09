"use client";

import Link from "next/link";
import { useAuth } from "./auth/auth-context";
import { useCart } from "./cart/cart-context";

export default function LoginButton() {
  const { isLoggedIn, logout } = useAuth();
  const { setCart } = useCart();

  const handleLogout = () => {
    logout();
    setCart(undefined);
  };

  if (isLoggedIn) {
    return (
      <button
        onClick={handleLogout}
        className="relative flex h-11 items-center justify-center rounded-md border border-neutral-200 bg-white px-4 text-sm font-medium text-black transition-colors dark:border-neutral-700 dark:bg-black dark:text-white hover:opacity-80"
      >
        Logout
      </button>
    );
  }

  return (
    <Link href="/login">
      <button className="relative flex h-11 items-center justify-center rounded-md border border-neutral-200 bg-white px-4 text-sm font-medium text-black transition-colors dark:border-neutral-700 dark:bg-black dark:text-white hover:opacity-80">
        Login
      </button>
    </Link>
  );
}
