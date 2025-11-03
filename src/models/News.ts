// File: src/models/News.ts
export interface News {
  news_id: string; // keyPath
  title: string;
  link: string;
  author?: string;
  categories: string[];
  published?: string; // ISO
  updated?: string; // ISO
  summary?: string;
  image_url?: string; // 🟢 chỉ lưu URL gốc
}
