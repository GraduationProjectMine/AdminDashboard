"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) {
  const { t } = useI18n();

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(validCurrentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (validCurrentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, validCurrentPage - 1);
      const end = Math.min(totalPages - 1, validCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (validCurrentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  if (totalItems <= 0) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      {/* Left: Summary text & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 text-slate-400">
        <span>
          {t.pagination.showing}{" "}
          <strong className="text-slate-200 font-mono">{startItem}</strong> {t.pagination.to}{" "}
          <strong className="text-slate-200 font-mono">{endItem}</strong> {t.pagination.of}{" "}
          <strong className="text-slate-200 font-mono">{totalItems}</strong> {t.pagination.results}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <span className="text-[11px] text-slate-500">{t.pagination.itemsPerPage}</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(validCurrentPage - 1)}
          disabled={validCurrentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title={t.pagination.prev}
          aria-label={t.pagination.prev}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) => {
          if (page === "...") {
            return (
              <span key={`dots-${idx}`} className="px-2 py-1 text-slate-500 font-mono">
                ...
              </span>
            );
          }

          const pageNum = Number(page);
          const isActive = pageNum === validCurrentPage;

          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#147D74] text-white shadow-md shadow-teal-700/20 border border-teal-500/40"
                  : "border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(validCurrentPage + 1)}
          disabled={validCurrentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title={t.pagination.next}
          aria-label={t.pagination.next}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
