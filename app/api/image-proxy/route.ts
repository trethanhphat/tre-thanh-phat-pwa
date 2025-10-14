// 📄 app/api/image-proxy/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // ✅ Chạy trên Edge Functions → CDN cache toàn cầu

// 🔹 Domain được phép GỌI API proxy này (không phải domain ảnh đích)
const ALLOWED_ORIGINS = [
  'https://app.trethanhphat.vn',
  'https://tpbc.top',
  'https://rungkhoai.com',
];

/** Kiểm tra domain gửi request có được phép không */
function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(o => origin === o);
}

export async function GET(req: Request) {
  // ✅ Chặn truy cập trái phép từ domain khác
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
  }

  const url = req.nextUrl.searchParams.get('url');
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'Missing or invalid image URL' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok || !response.body) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
    }

    // ✅ Thiết lập header cache và CORS
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, s-maxage=28800, immutable'); // cache CDN 8h

    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    headers.set('Content-Type', contentType);

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching image' }, { status: 500 });
  }
}
