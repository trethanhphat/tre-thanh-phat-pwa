// 📄 app/api/image-proxy/route.ts
import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'edge'; // ✅ Chạy trên Edge Functions → CDN cache toàn cầu

// 🔹 Domain được phép GỌI API proxy này (không phải domain ảnh đích)
const ALLOWED_ORIGINS = [
  'https://app.trethanhphat.vn',
  'https://tpbc.top',
  'https://rungkhoai.com',
];

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  // ✅ Nếu không có Origin (do gọi nội bộ, SW, SSR...) → cho phép
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

export async function GET(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
  }

  const url = req.nextUrl.searchParams.get('url');
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'Missing or invalid image URL' }, { status: 400 });
  }

  try {
    const response = await fetch(url, { redirect: 'follow' });

    if (!response.ok || !response.body) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
    }

    // ✅ Thiết lập header cache và CORS
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, s-maxage=28800, immutable');
    headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');

    return new Response(response.body, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching image' }, { status: 500 });
  }
}
