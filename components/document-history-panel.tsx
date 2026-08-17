"use client";

import {
  deleteHistoryEntry,
  listHistoryEntries,
} from "@/lib/document-history";
import type { HistoryEntry } from "@/lib/document-history-types";
import {
  entryAskCount,
  entryHasCompareResult,
  entryHasCustomAsk,
  entryHasExportableContent,
  entryHasQuickActionAsk,
  entryHasSummary,
  filterLibraryEntries,
  formatFileSize,
  getEntryFileSizeBytes,
  getEntryResponseLanguageLabel,
  getEntryTitle,
  type LibrarySortOrder,
  type LibraryTypeFilter,
} from "@/lib/document-library-utils";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type DocumentHistoryPanelProps = {
  selectedId: string | null;
  refreshToken: number;
  onSelect: (entry: HistoryEntry) => void;
  onDeleted: (id: string) => void;
};

function MetaBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "success" | "violet";
}) {
  const toneClass =
    tone === "primary"
      ? "badge-primary"
      : tone === "success"
        ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
        : tone === "violet"
          ? "inline-flex rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700"
          : "badge";

  return <span className={toneClass}>{children}</span>;
}

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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const dialogTitleId = useId();
  const dialogDescId = useId();

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

  const pendingDeleteEntry = useMemo(
    () => entries.find((entry) => entry.id === pendingDeleteId) ?? null,
    [entries, pendingDeleteId],
  );

  const confirmDelete = async () => {
    if (!pendingDeleteId || isDeleting) return;

    setIsDeleting(true);
    try {
      const id = pendingDeleteId;
      await deleteHistoryEntry(id);
      onDeleted(id);
      const items = await listHistoryEntries();
      setEntries(items);
      setPendingDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (entries.length === 0) {
    return (
      <section className="card mt-8">
        <h2 className="section-title">Document Library</h2>
        <p className="section-subtitle">
          Your local analysis history will appear here.
        </p>
        <div className="mt-5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 px-4 py-8 text-center">
          <p className="text-sm font-medium text-slate-800">
            No saved analyses yet
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Upload a PDF, analyze it, and use Summarize, Ask AI, or Compare.
            Results are stored locally in this browser only.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="card mt-8 overflow-hidden">
      <h2 className="section-title">Document Library</h2>
      <p className="section-subtitle">
        Search and reopen saved analyses. Everything stays on this device.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
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
            placeholder="Search filenames, summaries, questions…"
            className="input-field mt-1 py-2.5"
            autoComplete="off"
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
            className="select-field mt-1 w-full sm:min-w-[10.5rem]"
          >
            <option value="all">All</option>
            <option value="single">Single</option>
            <option value="compare">Compare</option>
            <option value="has_summary">Has Summary</option>
            <option value="has_asks">Has Asks</option>
            <option value="quick_action">Quick Action</option>
            <option value="custom_ask">Custom Ask</option>
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
            className="select-field mt-1 w-full sm:min-w-[10.5rem]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name_asc">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
          </select>
        </div>
      </div>

      {visibleEntries.length === 0 ? (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-7 text-center">
          <p className="text-sm font-medium text-slate-800">
            No matching documents
          </p>
          <p className="mt-1.5 text-sm text-slate-600">
            Try a different search term or clear filters.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {visibleEntries.map((entry) => {
            const isSelected = selectedId === entry.id;
            const title = getEntryTitle(entry);
            const askCount = entryAskCount(entry);
            const exportable = entryHasExportableContent(entry);

            return (
              <li
                key={entry.id}
                className={`rounded-xl border px-3.5 py-3 transition-all sm:px-4 ${
                  isSelected
                    ? "border-indigo-300 bg-indigo-50/60 shadow-sm"
                    : "border-slate-200 bg-white hover:border-indigo-200/80 hover:shadow-sm"
                }`}
              >
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <MetaBadge
                        tone={entry.type === "compare" ? "violet" : "neutral"}
                      >
                        {entry.type === "single" ? "Single" : "Compare"}
                      </MetaBadge>
                      {entryHasSummary(entry) && (
                        <MetaBadge tone="primary">Summary</MetaBadge>
                      )}
                      {askCount > 0 && (
                        <MetaBadge tone="primary">
                          {askCount === 1 ? "1 Ask" : `${askCount} Asks`}
                        </MetaBadge>
                      )}
                      {entryHasQuickActionAsk(entry) && (
                        <MetaBadge tone="violet">Quick Action</MetaBadge>
                      )}
                      {entryHasCustomAsk(entry) && (
                        <MetaBadge>Custom Ask</MetaBadge>
                      )}
                      {entryHasCompareResult(entry) && (
                        <MetaBadge tone="success">Compare result</MetaBadge>
                      )}
                    </div>

                    <p
                      className="mt-2 break-words text-sm font-semibold tracking-[-0.01em] text-slate-900 sm:truncate sm:text-[15px]"
                      title={title}
                    >
                      {title}
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                      <span className="whitespace-nowrap">
                        {formatFileSize(getEntryFileSizeBytes(entry))}
                      </span>
                      <span className="mx-1.5 text-slate-300">·</span>
                      <span>{formatDate(entry.analyzedAt)}</span>
                      <span className="mx-1.5 text-slate-300">·</span>
                      <span>{getEntryResponseLanguageLabel(entry)}</span>
                      {exportable && (
                        <>
                          <span className="mx-1.5 text-slate-300">·</span>
                          <span className="text-indigo-600">Export available</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(entry)}
                      className="btn-secondary h-9 px-3 text-xs sm:text-sm"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(entry.id)}
                      className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 sm:text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pendingDeleteEntry && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
          role="presentation"
          onClick={() => {
            if (!isDeleting) {
              setPendingDeleteId(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescId}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3
              id={dialogTitleId}
              className="text-base font-semibold text-slate-900"
            >
              Delete this history entry?
            </h3>
            <p id={dialogDescId} className="mt-2 text-sm leading-relaxed text-slate-600">
              This will permanently remove the locally stored history entry for{" "}
              <span className="font-medium text-slate-800">
                {getEntryTitle(pendingDeleteEntry)}
              </span>
              . This cannot be undone.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-secondary"
                disabled={isDeleting}
                onClick={() => setPendingDeleteId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void confirmDelete()}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
