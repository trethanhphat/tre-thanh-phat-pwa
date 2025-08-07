// ✅ File: middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const t = url.searchParams.get('t');
  const b = url.searchParams.get('b');

  if (t) {
    url.pathname = `/tree/${t}`;
    url.searchParams.delete('t');
    return NextResponse.redirect(url);
  }

  if (b) {
    url.pathname = `/batch/${b}`;
    url.searchParams.delete('b');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/:path*'], // áp dụng middleware cho trang gốc "/" và mọi đường dẫn khác
};
