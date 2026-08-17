import type { HistoryEntry } from "@/lib/document-history-types";
import {
  DEFAULT_RESPONSE_LANGUAGE,
  getResponseLanguageLabel,
  type ResponseLanguage,
} from "@/lib/response-language";
import { SMART_TEMPLATES } from "@/lib/smart-templates";

export type LibraryTypeFilter =
  | "all"
  | "single"
  | "compare"
  | "has_summary"
  | "has_asks"
  | "quick_action"
  | "custom_ask";

export type LibrarySortOrder = "newest" | "oldest" | "name_asc" | "name_desc";

const QUICK_ACTION_PROMPTS = new Set(
  SMART_TEMPLATES.map((template) => template.prompt.trim()),
);

export function isQuickActionQuestion(question: string): boolean {
  return QUICK_ACTION_PROMPTS.has(question.trim());
}

export function getEntryTitle(entry: HistoryEntry): string {
  if (entry.type === "single") {
    return entry.fileName;
  }

  return entry.documents.map((document) => document.name).join(" vs ");
}

export function getEntryFileSizeBytes(entry: HistoryEntry): number {
  if (entry.type === "single") {
    return entry.fileSize;
  }

  return entry.documents.reduce((total, document) => total + document.fileSize, 0);
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

export function entryHasSummary(entry: HistoryEntry): boolean {
  return entry.type === "single" && Boolean(entry.summary?.trim());
}

export function entryAskCount(entry: HistoryEntry): number {
  if (entry.type !== "single") {
    return 0;
  }
  return entry.askSessions?.length ?? 0;
}

export function entryHasAsks(entry: HistoryEntry): boolean {
  return entryAskCount(entry) > 0;
}

export function entryHasQuickActionAsk(entry: HistoryEntry): boolean {
  if (entry.type !== "single" || !entry.askSessions?.length) {
    return false;
  }
  return entry.askSessions.some((session) =>
    isQuickActionQuestion(session.question),
  );
}

export function entryHasCustomAsk(entry: HistoryEntry): boolean {
  if (entry.type !== "single" || !entry.askSessions?.length) {
    return false;
  }
  return entry.askSessions.some(
    (session) => !isQuickActionQuestion(session.question),
  );
}

export function entryHasCompareResult(entry: HistoryEntry): boolean {
  return entry.type === "compare" && Boolean(entry.compareResult);
}

/** True when the reopened detail view can offer at least one Export control. */
export function entryHasExportableContent(entry: HistoryEntry): boolean {
  if (entry.type === "compare") {
    return entryHasCompareResult(entry);
  }
  return entryHasSummary(entry) || entryHasAsks(entry);
}

function compareResultSearchText(entry: HistoryEntry): string {
  if (entry.type !== "compare" || !entry.compareResult) {
    return "";
  }

  const result = entry.compareResult;
  return [
    result.executiveSummary,
    ...result.similarities,
    ...result.differences,
    ...result.contradictions,
    ...result.keyFacts,
    ...result.sources.map(
      (source) => `${source.documentName} ${source.excerpt}`,
    ),
  ].join("\n");
}

function entrySearchBlob(entry: HistoryEntry): string {
  const parts: string[] = [getEntryTitle(entry)];

  if (entry.type === "single") {
    parts.push(entry.fileName);
    if (entry.summary) {
      parts.push(entry.summary);
    }
    for (const session of entry.askSessions ?? []) {
      parts.push(session.question, session.answer);
    }
  } else {
    for (const document of entry.documents) {
      parts.push(document.name);
    }
    parts.push(compareResultSearchText(entry));
  }

  return parts.join("\n").toLowerCase();
}

export function entryMatchesSearch(entry: HistoryEntry, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return entrySearchBlob(entry).includes(normalizedQuery);
}

export function entryMatchesTypeFilter(
  entry: HistoryEntry,
  filter: LibraryTypeFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "single":
      return entry.type === "single";
    case "compare":
      return entry.type === "compare";
    case "has_summary":
      return entryHasSummary(entry);
    case "has_asks":
      return entryHasAsks(entry);
    case "quick_action":
      return entryHasQuickActionAsk(entry);
    case "custom_ask":
      return entryHasCustomAsk(entry);
    default:
      return true;
  }
}

export function sortLibraryEntries(
  entries: HistoryEntry[],
  sortOrder: LibrarySortOrder,
): HistoryEntry[] {
  const sorted = [...entries];

  switch (sortOrder) {
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime(),
      );
    case "name_asc":
      return sorted.sort((a, b) =>
        getEntryTitle(a).localeCompare(getEntryTitle(b), undefined, {
          sensitivity: "base",
        }),
      );
    case "name_desc":
      return sorted.sort((a, b) =>
        getEntryTitle(b).localeCompare(getEntryTitle(a), undefined, {
          sensitivity: "base",
        }),
      );
    case "newest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime(),
      );
  }
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
