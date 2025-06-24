export interface Post {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  featured_media: number;
  categories: number[];
}

export interface Media {
  source_url: string;
}
