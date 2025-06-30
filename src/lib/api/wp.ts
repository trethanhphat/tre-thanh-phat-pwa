// src/lib/wp.ts
import { NEXT_PUBLIC_API_NEWS_URL } from '@/lib/env';

export async function getPostById(id: string) {
  const res = await fetch(`${NEXT_PUBLIC_API_NEWS_URL}/posts/${id}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}
