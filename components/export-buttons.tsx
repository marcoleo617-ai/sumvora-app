"use client";

import type { ExportFormat } from "@/lib/export-content";

type ExportButtonsProps = {
  onExport: (format: ExportFormat) => void;
};

export default function ExportButtons({ onExport }: ExportButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onExport("md")}
        className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:text-sm"
      >
        Download .md
      </button>
      <button
        type="button"
        onClick={() => onExport("txt")}
        className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:text-sm"
      >
        Download .txt
      </button>
    </div>
  );
}
