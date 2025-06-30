import { type Metadata } from 'next';
import { getPostById } from '@/lib/api/wp'; // hoặc fetch trực tiếp nếu chưa tách
import type { Post } from '@/types/post';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post: Post | null = await getPostById(params.id);
  if (!post) return { title: 'Không tìm thấy bài viết' };

  return {
    title: `${post.title.rendered} - Rừng Khoái`,
    description: post.title.rendered,
  };
}
