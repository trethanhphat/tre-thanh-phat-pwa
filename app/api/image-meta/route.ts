// File: app/api/image-meta/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // hoặc 'nodejs' nếu bạn cần dùng Node APIs

// ✅ Danh sách domain ảnh được phép tải
const ALLOWED_IMAGE_HOSTS = [
  'rungkhoai.com',
  'trethanhphat.vn',
  'tpbc.top',
  'upload.wikimedia.org',
  'blogger.googleusercontent.com',
];

// ✅ Danh sách domain frontend được phép gọi API này
const ALLOWED_CALLER_ORIGINS = [
  'https://app.trethanhphat.vn',
  'https://tpbc.top',
  'https://rungkhoai.com',
];

function isAllowedCaller(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // gọi nội bộ SSR hoặc SW
  return ALLOWED_CALLER_ORIGINS.includes(origin);
}

function isAllowedImageHost(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_IMAGE_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'Thiếu hoặc sai URL ảnh' }, { status: 400 });
  }

  if (!isAllowedCaller(req)) {
    return NextResponse.json({ error: 'Origin không được phép gọi API này' }, { status: 403 });
  }

  if (!isAllowedImageHost(url)) {
    return NextResponse.json({ error: 'Host ảnh không được phép' }, { status: 403 });
  }

  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Không tải được ảnh (HTTP ${res.status})` },
        { status: 502 }
      );
    }

    const blob = await res.blob();
    if (!blob || blob.size === 0) {
      return NextResponse.json({ error: 'Ảnh rỗng hoặc lỗi blob' }, { status: 400 });
    }

    // ✅ Tính SHA-256 hash
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const blob_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // ✅ Lấy ETag và Last-Modified từ header
    const etag = res.headers.get('ETag') ?? null;
    const last_modified = res.headers.get('Last-Modified') ?? null;

    return NextResponse.json(
      {
        blob_hash,
        etag,
        last_modified,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    console.error('[image-meta] ❌ Lỗi khi tải ảnh:', err);
    return NextResponse.json({ error: 'Lỗi server khi xử lý ảnh' }, { status: 500 });
  }
}
