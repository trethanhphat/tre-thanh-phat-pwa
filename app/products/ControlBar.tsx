// File: app/products/ControlBar.tsx
'use client';

import React from 'react';

type Props = {
  searchText: string;
  setSearchText: (v: string) => void;
  pageSize: number;
  setPageSize: (n: number) => void;
  currentPage: number;
  setCurrentPage: (n: number) => void;
  totalPages: number;
};

export default function ControlBar({
  searchText,
  setSearchText,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  totalPages,
}: Props) {
  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > totalPages) val = totalPages;
    setCurrentPage(val);
  };

  return (
    <>
      <div className="control-bar">
        {/* Nhóm 1: Ô tìm kiếm */}
        <div className="ctrl-group search-wrapper">
          <input
            type="text"
            placeholder="🔎 Tìm theo tên..."
            value={searchText}
            onChange={e => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
          {searchText && (
            <button type="button" className="clear-btn" onClick={() => setSearchText('')}>
              ×
            </button>
          )}
        </div>

        {/* Nhóm 2: Số sản phẩm/trang */}
        <div className="ctrl-group">
          <label>
            Hiển thị:&nbsp;
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="select"
            >
              {[5, 10, 20, 50].map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            &nbsp;sản phẩm/trang
          </label>
        </div>

        {/* Nhóm 3: Pagination */}
        <div className="ctrl-group pagination">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            «
          </button>
          <button
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>

          <span className="page-indicator">
            Trang{' '}
            <input
              type="number"
              value={currentPage}
              onChange={handlePageInput}
              className="page-input"
              min={1}
              max={totalPages}
            />{' '}
            / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
            »
          </button>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .control-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: space-between;
          flex-wrap: wrap;
          margin: 10px 0 12px;
        }
        .ctrl-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Search box + nút clear */
        .search-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .search-input {
          padding: 6px 30px 6px 10px;
          min-width: 240px;
          border: 1px solid var(--color-border, #ccc);
          border-radius: 6px;
        }
        .clear-btn {
          position: absolute;
          right: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          color: #888;
        }
        .clear-btn:hover {
          color: #000;
        }

        /* Select */
        .select {
          padding: 4px 6px;
        }

        /* Pagination */
        .pagination {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: nowrap; /* ✅ ép 1 dòng */
          overflow-x: auto; /* ✅ nếu hẹp quá thì cuộn ngang */
        }
        .pagination button,
        .pagination .page-input {
          padding: 6px 10px;
          border: 1px solid var(--color-border, #ccc);
          border-radius: 4px;
          background: #fff;
          font-size: 14px;
        }
        .pagination button {
          cursor: pointer;
        }
        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .page-input {
          width: 56px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .control-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .ctrl-group {
            justify-content: space-between;
          }
          .pagination {
            justify-content: flex-start;
            flex-wrap: wrap;
            gap: 6px;
          }
        }
      `}</style>
    </>
  );
}
