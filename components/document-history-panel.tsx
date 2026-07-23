"use client";

import {
  deleteHistoryEntry,
  listHistoryEntries,
} from "@/lib/document-history";
import type { HistoryEntry } from "@/lib/document-history-types";
import {
  filterLibraryEntries,
  getEntryResponseLanguageLabel,
  getEntryTitle,
  type LibrarySortOrder,
  type LibraryTypeFilter,
} from "@/lib/document-library-utils";
import { useEffect, useMemo, useState } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<LibraryTypeFilter>("all");
  const [sortOrder, setSortOrder] = useState<LibrarySortOrder>("newest");

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

  const visibleEntries = useMemo(
    () =>
      filterLibraryEntries(entries, {
        searchQuery,
        typeFilter,
        sortOrder,
      }),
    [entries, searchQuery, typeFilter, sortOrder],
  );

  const handleDelete = async (id: string) => {
    await deleteHistoryEntry(id);
    onDeleted(id);
    const items = await listHistoryEntries();
    setEntries(items);
  };

  if (entries.length === 0) {
    return (
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Document Library</h2>
        <p className="mt-2 text-sm text-slate-500">
          Analyzed documents will appear here automatically.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Document Library</h2>
      <p className="mt-1 text-sm text-slate-500">
        Search, filter, and reopen saved analyses read-only.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1 sm:min-w-[220px]">
          <label
            htmlFor="library-search"
            className="block text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Search
          </label>
          <input
            id="library-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by file name..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="w-full sm:w-auto">
          <label
            htmlFor="library-filter"
            className="block text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Filter
          </label>
          <select
            id="library-filter"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as LibraryTypeFilter)
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-auto"
          >
            <option value="all">All</option>
            <option value="single">Single</option>
            <option value="compare">Compare</option>
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label
            htmlFor="library-sort"
            className="block text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Sort
          </label>
          <select
            id="library-sort"
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(event.target.value as LibrarySortOrder)
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-auto"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {visibleEntries.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No matching documents.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {visibleEntries.map((entry) => {
            const isSelected = selectedId === entry.id;
            const title = getEntryTitle(entry);
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
                      {formatDate(entry.analyzedAt)} ·{" "}
                      {getEntryResponseLanguageLabel(entry)}
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
      )}
    </section>
  );
}
