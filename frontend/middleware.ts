import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Создаем базовый ответ
  let response = NextResponse.next();

  // Если это API запрос, пропускаем его без изменений
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return response;
  }

  // Добавляем CORS заголовки только для не-API запросов
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 часа кэширования preflight запросов

  // Check if the user is accessing the checkout page
  if (request.nextUrl.pathname.startsWith('/checkout')) {
    // Check for auth token in cookies
    const authToken = request.cookies.get('authToken')?.value;

    if (!authToken) {
      // Redirect to login page if no auth token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Для OPTIONS запросов возвращаем ответ с CORS заголовками
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/api/:path*',
    // Add other protected routes here
  ],
};
