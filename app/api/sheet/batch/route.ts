// ✅ File: app/api/sheet/batch/route.ts

export async function GET() {
  try {
    const csvUrl =
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vR7S58kDsnFDNkCCtOLEnwsN0hGgQB-Lg6HYhnbe7E3pm8rtP5eHaDREH8zcq1krfYgLitPrOxOeME6/pub?gid=641211344&single=true&output=csv'; // 🔹 thay bằng link CSV của bạn

    const res = await fetch(csvUrl);
    const csvText = await res.text();

    // Parse CSV thành mảng
    const rows = csvText.split('\n').map(row => row.split(','));

    return new Response(JSON.stringify({ data: rows }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Không lấy được dữ liệu' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
