import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

interface Post {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  featured_media: number;
  categories: number[];
}

interface Media {
  source_url: string;
}

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent?: ResolvingMetadata
): Promise<Metadata> {
  try {
    const res = await fetch(
      `https://rungkhoai.com/wp-json/wp/v2/posts/${params.id}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return { title: "Không tìm thấy bài viết" };
    const post: Post = await res.json();
    return {
      title: `${post.title.rendered} - Rừng Khoái`,
      description: post.title.rendered,
    };
  } catch (err) {
    return { title: "Không tìm thấy bài viết" };
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await fetch(
    `https://rungkhoai.com/wp-json/wp/v2/posts/${params.id}`
  );
  if (!res.ok) return notFound();
  const post: Post = await res.json();

  let image = "";
  if (post.featured_media) {
    const mediaRes = await fetch(
      `https://rungkhoai.com/wp-json/wp/v2/media/${post.featured_media}`
    );
    if (mediaRes.ok) {
      const media: Media = await mediaRes.json();
      image = media.source_url;
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1
        className="text-2xl font-bold mb-4"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />
      <div className="text-sm text-gray-500 mb-2">
        {new Date(post.date).toLocaleDateString()}
      </div>
      {image && (
        <img src={image} alt="Ảnh đại diện" className="mb-4 rounded w-full" />
      )}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
    </div>
  );
}
