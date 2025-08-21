// app/products/ControlBar.tsx
import React from 'react';

interface Props {
  searchText: string;
  setSearchText: (v: string) => void;
  pageSize: number;
  setPageSize: (v: number) => void;
  currentPage: number;
  setCurrentPage: (v: number) => void;
  totalPages: number;
}

export default function ControlBar({
  searchText,
  setSearchText,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  totalPages,
}: Props) {
  return (
    <div className="control-bar">
      {/* Search */}
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        className="search-input"
      />

      {/* Page size */}
      <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
        <option value={10}>10 / trang</option>
        <option value={20}>20 / trang</option>
        <option value={50}>50 / trang</option>
      </select>

      {/* Pagination */}
      <div className="pagination-group">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
          «
        </button>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        >
          ‹
        </button>

        <span className="page-indicator">
          Trang{' '}
          <input
            type="number"
            value={currentPage}
            min={1}
            max={totalPages}
            onChange={e => {
              let val = Number(e.target.value);
              if (isNaN(val) || val < 1) val = 1;
              if (val > totalPages) val = totalPages;
              setCurrentPage(val);
            }}
            className="page-input"
          />{' '}
          / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        >
          ›
        </button>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
          »
        </button>
      </div>

      <style jsx>{`
        .control-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
          margin: 0.5rem 0;
        }
        .search-input {
          flex: 1;
          min-width: 120px;
          padding: 0.25rem 0.5rem;
        }
        .pagination-group {
          display: flex;
          flex-wrap: nowrap; /* ✅ buộc nằm 1 dòng */
          gap: 0.25rem;
          align-items: center;
          overflow-x: auto; /* ✅ tránh tràn trên mobile */
        }
        .pagination-group button {
          padding: 0.25rem 0.5rem;
          min-width: 2rem;
        }
        .page-indicator {
          display: flex;
          align-items: center;
          white-space: nowrap;
          gap: 0.25rem;
        }
        .page-input {
          width: 3rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
