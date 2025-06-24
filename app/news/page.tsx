"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Post {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  categories: number[];
  featured_media: number;
}

interface Category {
  id: number;
  name: string;
}

interface Media {
  id: number;
  source_url: string;
}

export default function NewsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<number, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">(
    "all"
  );
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const router = useRouter();

  useEffect(() => {
    fetch("https://rungkhoai.com/wp-json/wp/v2/posts?per_page=100")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        const mediaIds = data
          .map((post: Post) => post.featured_media)
          .filter((id) => id);
        Promise.all(
          mediaIds.map((id) =>
            fetch(`https://rungkhoai.com/wp-json/wp/v2/media/${id}`).then(
              (res) => res.json()
            )
          )
        ).then((mediaArray: Media[]) => {
          const mediaObj: Record<number, string> = {};
          mediaArray.forEach((media) => {
            mediaObj[media.id] = media.source_url;
          });
          setMediaMap(mediaObj);
        });
      });

    fetch("https://rungkhoai.com/wp-json/wp/v2/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  const filtered = posts
    .filter((p) => p.title.rendered.toLowerCase().includes(query.toLowerCase()))
    .filter(
      (p) =>
        selectedCategory === "all" || p.categories.includes(selectedCategory)
    );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const displayed = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tin tức Rừng Khoái</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <Input
          type="text"
          placeholder="Tìm kiếm tin tức..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          value={selectedCategory}
          onValueChange={(val) =>
            setSelectedCategory(val === "all" ? "all" : parseInt(val))
          }
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {displayed.map((post) => (
          <div
            key={post.id}
            className="border rounded-lg p-3 bg-white shadow cursor-pointer hover:shadow-md transition"
            onClick={() => router.push(`/news/${post.id}`)}
          >
            {mediaMap[post.featured_media] && (
              <img
                src={mediaMap[post.featured_media]}
                alt="thumbnail"
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}
            <h2
              className="text-lg font-semibold mb-2"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
            <div className="text-sm text-gray-600 mb-2">
              {new Date(post.date).toLocaleDateString()}
            </div>
            <div
              className="text-sm prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
            />
          </div>
        ))}
        {displayed.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            Không có bài viết phù hợp.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------
// File: app/news/[id]/page.tsx
// ---------------------------

import { notFound } from "next/navigation";
import { Metadata } from "next";

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

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const res = await fetch(
    `https://rungkhoai.com/wp-json/wp/v2/posts/${params.id}`
  );
  if (!res.ok) return { title: "Không tìm thấy bài viết" };
  const post: Post = await res.json();
  return {
    title: post.title.rendered + " - Rừng Khoái",
    description: post.title.rendered,
  };
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
