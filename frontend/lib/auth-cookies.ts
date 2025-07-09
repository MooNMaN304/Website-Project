'use server';

import { cookies } from 'next/headers';

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('authToken', token, {
    httpOnly: false, // Allow client-side access for compatibility
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('authToken');
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('authToken')?.value || null;
}
