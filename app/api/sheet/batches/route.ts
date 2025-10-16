// ✅ File: app/api/sheet/batches/route.ts

import Papa from 'papaparse';

export const dynamic = 'force-dynamic'; // ✅ Fix build lỗi DYNAMIC_SERVER_USAGE

export const revalidate = 3600; // ISR hint cho Next.js (60 phút)

// API handler
export async function GET(request: Request) {
  try {
    const batchesApi = process.env.API_BATCHES_URL;
    if (!batchesApi) {
      return new Response(JSON.stringify({ error: 'Thiếu API_BATCHES_URL trong .env' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id'); // ?id=...

    // 🔵 Fetch CSV từ nguồn
    const res = await fetch(batchesApi, { cache: 'no-store' });
    const csvText = await res.text();

    // ✅ Parse CSV bằng PapaParse (chuẩn RFC 4180)
    const { data } = Papa.parse<Record<string, string>>(csvText, {
      header: true, // Lấy hàng đầu tiên làm header
      skipEmptyLines: true, // Bỏ dòng trống
    });

    const list = data;

    if (id) {
      const found = list.find(item => item.batch_id === id);
      return new Response(JSON.stringify(found || null), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 🔥 Trả toàn bộ danh sách
    return new Response(JSON.stringify(list), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=60', // Cache edge
      },
    });
  } catch (err) {
    console.error('CSV parse error:', err);
    return new Response(JSON.stringify({ error: 'Không lấy được dữ liệu' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/* NOTE: Đoạn mã này là backup tách thủ công csv đơn giản không có dấu , hoặc " trong dữ liệu  
export async function GET(request: Request) {
  try {
    const batchApi = process.env.API_BATCH_URL;
    if (!batchApi) {
      return new Response(JSON.stringify({ error: 'Thiếu API_BATCH_URL trong .env' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id'); // ?id=...

    const res = await fetch(batchApi);
    const csvText = await res.text();

    // Parse CSV
    const rows = csvText.split('\n').map(row => row.split(','));
    const headers = rows[0].map(h => h.replace(/\r$/, ''));

    const list = rows
      .slice(1)
      .filter(row => row.some(cell => cell.trim() !== ''))
      .map(row => {
        const obj: Record<string, any> = {};
        headers.forEach((key, i) => {
          obj[key] = row[i]?.replace(/\r$/, '') ?? '';
        });
        return obj;
      });

    if (id) {
      const found = list.find(item => item.batch_id === id);
      return new Response(JSON.stringify(found || null), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(list), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Không lấy được dữ liệu' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
NOTE */
