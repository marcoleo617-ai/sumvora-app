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
        className="btn-secondary h-9 px-3 text-xs sm:text-sm"
      >
        Download Markdown (.md)
      </button>
      <button
        type="button"
        onClick={() => onExport("txt")}
        className="btn-secondary h-9 px-3 text-xs sm:text-sm"
      >
        Download TXT
      </button>
    </div>
  );
}
