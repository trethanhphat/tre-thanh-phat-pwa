// File: src/models/News.ts
export interface News {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  date?: string;
  image_url?: string;
  link?: string;
}
