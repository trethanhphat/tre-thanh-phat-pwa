// app/news/page.tsx
'use client';
import { Select } from '@/components/ui/select';
import { useNewsFilter } from '@/controllers/useNewsFilter';

export default function NewsPage(
  {
    /* props */
  }
) {
  const { selectedCategory, handleCategoryChange } = useNewsFilter();

  return (
    <div>
      <Select value={selectedCategory} onChange={handleCategoryChange}>
        <option value="all">Tất cả</option>
        <option value="1">Kinh tế</option>
        <option value="2">Môi trường</option>
        {/* ... */}
      </Select>

      {/* Phần render bài viết sẽ lọc theo selectedCategory */}
    </div>
  );
}
