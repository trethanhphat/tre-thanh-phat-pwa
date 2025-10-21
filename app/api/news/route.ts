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

/* -------------------------- Helpers an toàn -------------------------- */
function getText(n: any): string {
  if (!n) return '';
  if (typeof n === 'string') return n;
  if (typeof n['#text'] === 'string') return n['#text'];
  return '';
}
function toArray<T = any>(x: T | T[] | null | undefined): T[] {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

/**
 * Chuẩn hoá URL ảnh của Blogger (nếu có segment kích thước như /s72-c/ hoặc /s220/...) → thay bằng kích thước lớn hơn.
 * Nếu không có segment kích thước thì trả về nguyên bản.
 *
 * Ví dụ: https://.../s72-c/Logo.png  -> https://.../s480/Logo.png
 */
function normalizeBloggerImage(url: string | undefined, targetSize = 480): string | undefined {
  if (!url) return undefined;
  try {
    // Thay /s72-c/ hoặc /s320/ hoặc /s220/ ... bằng /s{targetSize}/
    // Lưu ý: chỉ thay segment dạng /s<number>(-...)/
    const replaced = url.replace(/\/s\d+(-[a-z]+)?\//, `\/s${targetSize}\/`);
    return replaced;
  } catch {
    return url;
  }
}

/**
 * Lấy URL ảnh đầu tiên trong một chuỗi HTML.
 * Hỗ trợ src="..." hoặc src='...'
 */
function extractFirstImageFromHtml(html: string): string | undefined {
  if (!html) return;
  // ✅ Regex chuẩn bắt src="..." hoặc src='...'
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1];
}

/* -------------------------- Types thô từ XML -------------------------- */
type RawEntry = {
  id?: string;
  title?: { '#text'?: string } | string;
  link?: { '@_rel'?: string; '@_href'?: string }[] | any[];
  author?: { name?: string } | Array<{ name?: string }>;
  category?: { '@_term'?: string } | { '@_term'?: string }[] | string;
  published?: string;
  updated?: string;
  summary?: { '#text'?: string } | string;
  content?: { '#text'?: string } | string;
  'media:thumbnail'?: { '@_url'?: string } | Array<{ '@_url'?: string }>;
};

export async function GET() {
  try {
    const FEED_URL = getFeedUrl();

    const res = await fetch(FEED_URL.toString(), {
      cache: 'no-store',
      headers: { Accept: 'application/atom+xml' },
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Upstream HTTP ${res.status}` }, { status: 502 });
    }

    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      trimValues: true,
    });
    const data = parser.parse(xml);
    const entries: RawEntry[] = toArray<RawEntry>(data?.feed?.entry);

    const items = entries.map(e => {
      /* link ưu tiên rel="alternate" */
      const linkArr = toArray<any>(e.link);
      const alt = linkArr.find(l => l?.['@_rel'] === 'alternate');
      const link = alt?.['@_href'] || linkArr[0]?.['@_href'] || '';

      /* author (coerce về mảng rồi lấy phần tử đầu) */
      const authArr = toArray<any>(e.author);
      const author = (authArr[0] && typeof authArr[0] === 'object' && authArr[0].name) || '';

      /* categories (coerce về mảng, hỗ trợ object/string) */
      const catArr = toArray<any>(e.category);
      const categories: string[] = catArr
        .map(c => {
          if (!c) return '';
          if (typeof c === 'string') return c;
          return c?.['@_term'] || '';
        })
        .filter(Boolean);

      /* text fields */
      const title = getText(e.title);
      const summary = getText(e.summary);
      const content = getText(e.content);

      /* thumbnail: ưu tiên media:thumbnail, fallback ảnh đầu trong content → summary */
      const thumbArr = toArray<any>(e['media:thumbnail']);
      // Lấy url raw nếu có
      let rawImage: string | undefined = thumbArr[0]?.['@_url'];
      // Nếu không có media:thumbnail thì tìm ảnh trong content/summary
      if (!rawImage) {
        rawImage = extractFirstImageFromHtml(content) || extractFirstImageFromHtml(summary);
      }
      // Chuẩn hoá (nâng kích thước ảnh Blogger nếu cần)
      const image_url = normalizeBloggerImage(rawImage, 480);

      return {
        news_id: e.id || link || title,
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

    /* Sort mới → cũ (published/updated) */
    items.sort((a, b) => {
      const ad = a.published || a.updated || '';
      const bd = b.published || b.updated || '';
      return bd.localeCompare(ad);
    });

    return NextResponse.json({ data: items }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Parse error' }, { status: 500 });
  }
}
