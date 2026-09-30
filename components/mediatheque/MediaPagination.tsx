"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
interface MediaPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}
export default function MediaPagination({
  page,
  totalPages,
  onChange,
}: MediaPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      {" "}
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className=" flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 "
        aria-label="Page précédente"
      >
        {" "}
        <ChevronLeft size={16} />{" "}
      </button>{" "}
      <div className="flex items-center gap-1">
        {" "}
        {Array.from({ length: totalPages }, (_, index) => index + 1)
          .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
          .map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onChange(pageNumber)}
              className={` h-9 min-w-9 rounded-lg px-2 text-xs font-medium transition ${pageNumber === page ? "bg-[#0f4c5c] text-white" : "text-slate-600 hover:bg-slate-100"} `}
            >
              {" "}
              {pageNumber}{" "}
            </button>
          ))}{" "}
      </div>{" "}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className=" flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 "
        aria-label="Page suivante"
      >
        {" "}
        <ChevronRight size={16} />{" "}
      </button>{" "}
    </div>
  );
}
