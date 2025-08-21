// File: app/products/PaginationControls.tsx
import React from 'react';

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function PaginationControls({ currentPage, totalPages, onPageChange }: Props) {
  return (
    <div className="pagination">
      {/* Nút trang đầu */}
      <button disabled={currentPage === 1} onClick={() => onPageChange(1)}>
        ⏮ Trang đầu
      </button>

      {/* Nút lùi 1 */}
      <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        ⬅ Trước
      </button>

      {/* Số trang */}
      <span>
        Trang {currentPage}/{totalPages}
      </span>

      {/* Nút tới 1 */}
      <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        Sau ➡
      </button>

      {/* Nút trang cuối */}
      <button disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)}>
        Trang cuối ⏭
      </button>
    </div>
  );
}
