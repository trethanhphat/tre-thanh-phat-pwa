// File: src/components/ControlBar.tsx
'use client';

import React from 'react';

export type ControlBarProps = {
  searchText: string;
  setSearchText: (v: string) => void;
  pageSize: number;
  setPageSize: (n: number) => void;
  currentPage: number;
  setCurrentPage: (n: number) => void;
  totalPages: number;

  // Tuỳ biến hiển thị (optional)
  searchPlaceholder?: string; // default: "🔎 Tìm kiếm..."
  unitLabel?: string;         // default: "mục/trang"
};

export default function ControlBar({
  searchText,
  setSearchText,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  totalPages,
  searchPlaceholder = '🔎 Tìm kiếm...',
  unitLabel = 'mục/trang',
}: ControlBarProps) {
  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > totalPages) val = totalPages;
    setCurrentPage(val);
  };

  return (
    <>
      <div className="control-bar">
        <div className="ctrl-group">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>

        <div className="ctrl-group">
          <label>
            Hiển thị:&nbsp;
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="select"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            &nbsp;{unitLabel}
          </label>
        </div>

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
              min={1}
              max={totalPages}
              onChange={handlePageInput}
              className="page-input"
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

      <style jsx>{``}</style>
    </>
  );
}