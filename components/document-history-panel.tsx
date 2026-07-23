"use client";

import {
  deleteHistoryEntry,
  listHistoryEntries,
} from "@/lib/document-history";
import type { HistoryEntry } from "@/lib/document-history-types";
import { useEffect, useState } from "react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

type DocumentHistoryPanelProps = {
  selectedId: string | null;
  refreshToken: number;
  onSelect: (entry: HistoryEntry) => void;
  onDeleted: (id: string) => void;
};

export default function DocumentHistoryPanel({
  selectedId,
  refreshToken,
  onSelect,
  onDeleted,
}: DocumentHistoryPanelProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    listHistoryEntries()
      .then((items) => {
        if (!cancelled) {
          setEntries(items);
        }
      })
      .catch(() => {
        // IndexedDB may be unavailable in some environments.
      });

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const handleDelete = async (id: string) => {
    await deleteHistoryEntry(id);
    onDeleted(id);
    const items = await listHistoryEntries();
    setEntries(items);
  };

  if (entries.length === 0) {
    return (
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">History</h2>
        <p className="mt-2 text-sm text-slate-500">
          Analyzed documents will appear here automatically.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">History</h2>
      <p className="mt-1 text-sm text-slate-500">
        Select a saved analysis to view it read-only.
      </p>

      <ul className="mt-4 space-y-3">
        {entries.map((entry) => {
          const isSelected = selectedId === entry.id;
          const title =
            entry.type === "single"
              ? entry.fileName
              : entry.documents.map((document) => document.name).join(" vs ");
          const badge = entry.type === "single" ? "Single" : "Compare";

          return (
            <li
              key={entry.id}
              className={`rounded-lg border px-4 py-3 transition-colors ${
                isSelected
                  ? "border-indigo-300 bg-indigo-50/50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => onSelect(entry)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {badge}
                    </span>
                    <span className="truncate text-sm font-medium text-slate-900 sm:text-base">
                      {title}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    {formatDate(entry.analyzedAt)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(entry.id)}
                  className="self-start text-xs font-medium text-red-600 hover:text-red-700 sm:self-center"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
