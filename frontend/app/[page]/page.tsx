'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';

import Prose from 'components/prose';
import { getPage } from 'lib/shopify';
import type { Page as PageType } from 'lib/types';

export default function Page() {
  const params = useParams();
  const [page, setPage] = useState<PageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const pageData = await getPage(params.page as string);
        if (pageData) {
          setPage(pageData);
          setError(false);
        } else {
          setPage(null);
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch page:', err);
        setPage(null);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (params.page) {
      fetchPage();
    }
  }, [params.page]);

  if (loading) return <div className="flex justify-center py-8">Loading page...</div>;
  if (error || !page) return <div className="flex justify-center py-8">Page not found</div>;

  if (!page) return notFound();

  return (
    <>
      <h1 className="mb-8 text-5xl font-bold">{page.title}</h1>
      <Prose className="mb-8" html={page.body} />
      <p className="text-sm italic">
        {`This document was last updated on ${new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(new Date(page.updatedAt))}.`}
      </p>
    </>
  );
}
