// app/api/news/route.ts
import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

// Tắt cache layer của Next cho route này
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Lấy URL feed từ ENV và đảm bảo hợp lệ.
 * - Cần khai báo: NEWS_FEED_URL="https://.../feeds/posts/default?alt=atom&max-results=200"
 * - Tự đảm bảo có alt=atom nếu thiếu.
 */
function getFeedUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_API_NEWS_URL?.trim();
  if (!raw) {
    throw new Error(
      'Thiếu ENV NEXT_PUBLIC_API_NEWS_URL. Hãy đặt trong .env.local hoặc biến môi trường của server.'
    );
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('NEXT_PUBLIC_API_NEWS_URL không phải URL hợp lệ.');
  }
  // Đảm bảo trả về Atom XML
  if (!url.searchParams.has('alt')) url.searchParams.set('alt', 'atom');
  return url;
}

type RawEntry = {
  id?: string;
  title?: { '#text'?: string } | string;
  link?: { '@_rel'?: string; '@_href'?: string }[] | any[];
  author?: { name?: string } | Array<{ name?: string }>;
  category?: { '@_term'?: string }[] | any[];
  published?: string;
  updated?: string;
  summary?: { '#text'?: string } | string;
  content?: { '#text'?: string } | string;
  'media:thumbnail'?: { '@_url'?: string } | Array<{ '@_url'?: string }>;
};

function getText(n: any): string {
  if (!n) return '';
  if (typeof n === 'string') return n;
  if (typeof n['#text'] === 'string') return n['#text'];
  return '';
}

function first<T>(x: T | T[] | undefined | null): T | undefined {
  if (!x) return undefined;
  return Array.isArray(x) ? x[0] : x;
}

function extractFirstImageFromHtml(html: string): string | undefined {
  if (!html) return;
  const m = html.match(/<img[^>]+src="'["']/i);
  return m?.[1];
}

export async function GET() {
  try {
    const FEED_URL = getFeedUrl();

    const res = await fetch(FEED_URL.toString(), {
      cache: 'no-store',
      headers: { Accept: 'application/atom+xml' },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      trimValues: true,
    });
    const data = parser.parse(xml);
    const entries: RawEntry[] = data?.feed?.entry ?? [];

    const items = entries.map((e) => {
      // link ưu tiên rel="alternate"
      const linkArr = Array.isArray(e.link) ? e.link : e.link ? [e.link] : [];
      const alt = linkArr.find((l: any) => l?.['@_rel'] === 'alternate');
      const link = alt?.['@_href'] || linkArr[0]?.['@_href'] || '';

      // author
      const auth = first(e.author);
      const author = auth && typeof auth === 'object' && auth.name ? auth.name : '';

      // categories
      const categories: string[] = (e.category || [])
        .map((c: any) => c?.['@_term'])
        .filter(Boolean);

      const title = getText(e.title);
      const summary = getText(e.summary);
      const content = getText(e.content);

      // thumbnail: ưu tiên media:thumbnail, fallback ảnh đầu trong HTML
      let image_url: string | undefined =
        first(e['media:thumbnail'])?.['@_url'] ||
        extractFirstImageFromHtml(content) ||
        extractFirstImageFromHtml(summary);

      return {
        news_id: e.id || link || title, // key
        title,
        link,
        author,
        categories,
        published: e.published ? new Date(e.published).toISOString() : '',
        updated: e.updated ? new Date(e.updated).toISOString() : '',
        summary,
        image_url,
      };
    });

    // Sort mới → cũ
    items.sort((a, b) => {
      const ad = a.published || a.updated || '';
      const bd = b.published || b.updated || '';
      return bd.localeCompare(ad);
    });

    return NextResponse.json(
      { data: items },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Parse error' },
      { status: 500 }
    );
  }
}