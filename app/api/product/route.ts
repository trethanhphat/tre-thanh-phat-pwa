// ✅ File: app/api/product/route.ts
import { NextResponse } from 'next/server';
import sanitizeHtml from 'sanitize-html';

const API_PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL as string;
const CONSUMER_KEY = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET!;

const productCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 ngày

// Chỉ cho phép 1 số thẻ cơ bản; loại mọi thuộc tính gây tràn (class/style/data-*, width/height...)
const cleanDescription = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'ul',
      'ol',
      'li',
      'strong',
      'em',
      'b',
      'i',
      'u',
      'br',
      'hr',
      'blockquote',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'img',
      'a',
      'div',
      'span',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'name'],
      img: ['src', 'alt', 'loading'],
      // Mặc định các thẻ khác không được phép có thuộc tính => class/style/data-* sẽ bị loại
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener', target: '_blank' }),
      img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }),
      // Xoá mọi inline width/height nếu có lọt qua
      table: (tagName, attribs) => ({ tagName, attribs: {} }),
      th: (t, a) => ({ tagName: 'th', attribs: {} }),
      td: (t, a) => ({ tagName: 'td', attribs: {} }),
      div: (t, a) => ({ tagName: 'div', attribs: {} }),
      span: (t, a) => ({ tagName: 'span', attribs: {} }),
    },
    // Loại các thẻ trống còn sót
    exclusiveFilter: frame => {
      const text = (frame.text || '').trim();
      return !text && ['div', 'span', 'p'].includes(frame.tag);
    },
  });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Thiếu id sản phẩm' }, { status: 400 });
  }

  // 1️⃣ Check cache server
  const cached = productCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const url = `${API_PRODUCTS_URL}/${id}?_fields=id,name,price,stock_quantity,stock_status,images,description`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
          'base64'
        )}`,
      },
    });

    if (!res.ok) {
      throw new Error(`WooCommerce trả về lỗi: ${res.status}`);
    }

    const data = await res.json();

    // 2️⃣ Chuẩn hoá dữ liệu
    const product = {
      id: data.id,
      name: data.name,
      price: data.price,
      stock_quantity: data.stock_quantity,
      stock_status: data.stock_status,
      image_url: data.images?.[0]?.src || '',
      description: data.description ? cleanDescription(data.description) : '',
    };

    // 3️⃣ Cache server
    productCache.set(id, { data: product, timestamp: Date.now() });

    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
