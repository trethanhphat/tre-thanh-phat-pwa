// src/lib/wp.ts
import { apiNewsUrl, RUNGKHOAI_CONSUMER_SECRET } from '@/lib/env';

export async function getPostById(id: string) {
  const res = await fetch(`https://rungkhoai.com/wp-json/wp/v2/posts/${id}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}
