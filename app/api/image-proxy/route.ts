// 📄 app/api/image-proxy/route.ts
import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'edge'; // ✅ Chạy trên Edge Functions → CDN cache toàn cầu

// 🔹 Domain được phép GỌI API proxy này (không phải domain ảnh đích)
const ALLOWED_ORIGINS = [
  'https://app.trethanhphat.vn',
  'https://tpbc.top',
  'https://rungkhoai.com',
];

// 🔹 Các host chứa ảnh được phép proxy (tối ưu bảo mật)
const ALLOWED_IMAGE_HOSTS = [
  'upload.wikimedia.org',
  'blogger.googleusercontent.com',
  'trethanhphat.vn',
  'tpbc.top',
];

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // ✅ Nếu gọi nội bộ, SW, SSR → cho phép
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
    const target = new URL(url);
    if (!ALLOWED_IMAGE_HOSTS.includes(target.hostname)) {
      return NextResponse.json({ error: 'Blocked image host' }, { status: 403 });
    }

    const response = await fetch(url, { redirect: 'follow' });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
    }

    const contentType = response.headers.get('Content-Type')?.split(';')[0] || 'image/jpeg';

    // ✅ Kiểm tra loại file có thực sự là image không
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 415 });
    }

    const headers = new Headers({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=28800, immutable',
    });

    return new Response(response.body, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching image' }, { status: 500 });
  }
}
