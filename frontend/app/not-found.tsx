'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto my-4 flex max-w-xl flex-col rounded-lg border border-neutral-200 bg-white p-8 text-center md:p-12 dark:border-neutral-800 dark:bg-black">
      <div className="mb-6">
        <h1 className="text-6xl font-bold text-neutral-900 dark:text-neutral-100">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
          Page Not Found
        </h2>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Sorry, we couldn't find the page you're looking for. The page may have been moved, deleted, or the URL might be incorrect.
        </p>
      </div>

      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-black"
        >
          Go back home
        </Link>

        <button
          onClick={() => window.history.back()}
          className="inline-flex w-full items-center justify-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:ring-offset-black"
        >
          Go back
        </button>
      </div>

      <div className="mt-8 text-sm text-neutral-500 dark:text-neutral-500">
        <p>If you believe this is an error, please <Link href="/contact" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">contact us</Link>.</p>
      </div>
    </div>
  );
}
