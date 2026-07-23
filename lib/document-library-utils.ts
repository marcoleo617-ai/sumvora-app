import type { HistoryEntry } from "@/lib/document-history-types";
import {
  DEFAULT_RESPONSE_LANGUAGE,
  getResponseLanguageLabel,
  type ResponseLanguage,
} from "@/lib/response-language";

export type LibraryTypeFilter = "all" | "single" | "compare";

export type LibrarySortOrder = "newest" | "oldest";

export function getEntryTitle(entry: HistoryEntry): string {
  if (entry.type === "single") {
    return entry.fileName;
  }

  return entry.documents.map((document) => document.name).join(" vs ");
}

export function getEntryResponseLanguage(entry: HistoryEntry): ResponseLanguage {
  if (entry.type === "single") {
    if (entry.responseLanguage) {
      return entry.responseLanguage;
    }

    const lastAskSession = entry.askSessions?.at(-1);
    if (lastAskSession?.responseLanguage) {
      return lastAskSession.responseLanguage;
    }

    return DEFAULT_RESPONSE_LANGUAGE;
  }

  return entry.responseLanguage ?? DEFAULT_RESPONSE_LANGUAGE;
}

export function getEntryResponseLanguageLabel(entry: HistoryEntry): string {
  return getResponseLanguageLabel(getEntryResponseLanguage(entry));
}

export function entryMatchesSearch(entry: HistoryEntry, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const title = getEntryTitle(entry).toLowerCase();

  if (title.includes(normalizedQuery)) {
    return true;
  }

  if (entry.type === "compare") {
    return entry.documents.some((document) =>
      document.name.toLowerCase().includes(normalizedQuery),
    );
  }

  return false;
}

export function entryMatchesTypeFilter(
  entry: HistoryEntry,
  filter: LibraryTypeFilter,
): boolean {
  if (filter === "all") {
    return true;
  }

  return entry.type === filter;
}

export function sortLibraryEntries(
  entries: HistoryEntry[],
  sortOrder: LibrarySortOrder,
): HistoryEntry[] {
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime(),
  );

  return sortOrder === "newest" ? sorted.reverse() : sorted;
}

export function filterLibraryEntries(
  entries: HistoryEntry[],
  options: {
    searchQuery: string;
    typeFilter: LibraryTypeFilter;
    sortOrder: LibrarySortOrder;
  },
): HistoryEntry[] {
  const filtered = entries.filter(
    (entry) =>
      entryMatchesSearch(entry, options.searchQuery) &&
      entryMatchesTypeFilter(entry, options.typeFilter),
  );

  return sortLibraryEntries(filtered, options.sortOrder);
}
