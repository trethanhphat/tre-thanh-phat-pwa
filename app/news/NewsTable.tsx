// app/news/NewsTable.tsx
'use client';

import React from 'react';
import type { NewsItem } from '@/lib/news';

interface NewsTableProps {
  items: NewsItem[]; // ✅ đã phân trang từ page.tsx
  imageCache: { [news_id: string]: string }; // ✅ map news_id -> URL (có thể là blob:)
  sortField: 'title' | 'published' | 'author';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: 'title' | 'published' | 'author') => void;
  searchText?: string;
  pageSizeOptions?: number[]; // giữ để tái dùng về sau (không bắt buộc)
}

export default function NewsTable({
  items,
  imageCache,
  sortField,
  sortOrder,
  onSortChange,
  searchText = '',
  pageSizeOptions = [5, 10, 20, 50],
}: NewsTableProps) {
  // ================== ICON SORT Ở HEADER ==================
  const renderSortArrow = (field: string) => {
    if (sortField !== (field as any)) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  // ================== ICON SORT TRONG CELL ==================
  const renderSortSpan = (field: 'title' | 'published' | 'author') => (
    <span onClick={() => onSortChange(field)} style={{ cursor: 'pointer', marginLeft: 4 }}>
      {sortField === field ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : '↕️'}
    </span>
  );

  // Helper: highlight searchText trong tiêu đề (escape regex để an toàn)
  const escapeReg = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return (
    <>
      <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ccc' }}>
        <thead
          style={{
            position: 'sticky',
            top: 0,
            background: 'var(--color-primary)',
            color: 'var(--color-secondary)',
            zIndex: 1,
          }}
        >
          <tr>
            <th style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
              Ảnh bài viết
            </th>

            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('title')}
            >
              Tiêu đề bài viết{renderSortArrow('title')}
            </th>

            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('published')}
            >
              Ngày xuất bản{renderSortArrow('published')}
            </th>

            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('author')}
            >
              Tác giả{renderSortArrow('author')}
            </th>

            <th style={{ border: '1px solid var(--color-border)', padding: '8px' }}>Danh mục</th>

            <th style={{ border: '1px solid var(--color-border)', padding: '8px' }}>Mở bài</th>
          </tr>
        </thead>

        <tbody>
          {items.map(n => (
            <tr
              key={n.news_id}
              style={{
                border: '1px solid var(--color-border)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Ảnh */}
              <td
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  textAlign: 'center',
                }}
                data-label="Ảnh bài viết"
              >
                {imageCache[n.news_id] ? (
                  <a href={n.link} target="_blank" rel="noreferrer">
                    <img
                      src={imageCache[n.news_id]}
                      alt={n.title}
                      style={{ maxWidth: '150px' }}
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </a>
                ) : (
                  <span>...</span>
                )}
              </td>

              {/* Tiêu đề + highlight + icon sort */}
              <td
                style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                data-label="Tiêu đề"
              >
                <a
                  href={n.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--color-link)' }}
                >
                  {searchText
                    ? String(n.title)
                        .split(new RegExp(`(${escapeReg(searchText)})`, 'gi'))
                        .map((part, i) =>
                          part.toLowerCase() === searchText.toLowerCase() ? (
                            <mark key={i}>{part}</mark>
                          ) : (
                            part
                          )
                        )
                    : n.title}
                </a>
                {renderSortSpan('title')}
                {n.summary && (
                  <div style={{ color: '#666', marginTop: 6 }}>
                    {n.summary.length > 160 ? n.summary.slice(0, 160) + '…' : n.summary}
                  </div>
                )}
              </td>

              {/* Ngày xuất bản + icon sort */}
              <td
                style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                data-label="Ngày xuất bản"
              >
                {n.published
                  ? new Date(n.published).toLocaleString()
                  : n.updated
                  ? new Date(n.updated).toLocaleString()
                  : '-'}
                {renderSortSpan('published')}
              </td>

              {/* Tác giả + icon sort */}
              <td
                style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                data-label="Tác giả"
              >
                {n.author || '-'} {renderSortSpan('author')}
              </td>

              {/* Danh mục */}
              <td
                style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                data-label="Danh mục"
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {n.categories?.length
                    ? n.categories.map(c => (
                        <span
                          key={c}
                          style={{ background: '#f3f3f3', padding: '2px 6px', borderRadius: 6 }}
                        >
                          {c}
                        </span>
                      ))
                    : '-'}
                </div>
              </td>

              {/* Mở */}
              <td
                style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                data-label="Mở"
              >
                <a
                  href={n.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--color-link)' }}
                >
                  Xem
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* style slot giữ chỗ nếu bạn muốn thêm responsive label cho mobile */}
      <style jsx>{`
        td::before {
          /* thêm label responsive ở mobile tại đây nếu muốn */
        }
      `}</style>
    </>
  );
}
