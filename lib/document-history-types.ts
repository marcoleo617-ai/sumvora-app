import type { DocumentPage } from "@/lib/extract-pdf-text";
import type { AskSource, CompareResult } from "@/lib/gemini";
import type { ResponseLanguage } from "@/lib/response-language";

export type AskSession = {
  question: string;
  answer: string;
  sources: AskSource[];
  askedAt: string;
  responseLanguage?: ResponseLanguage;
};

export type SingleHistoryEntry = {
  type: "single";
  id: string;
  fileName: string;
  fileSize: number;
  analyzedAt: string;
  text: string;
  pages: DocumentPage[];
  summary?: string;
  responseLanguage?: ResponseLanguage;
  askSessions?: AskSession[];
};

export type CompareHistoryDocument = {
  name: string;
  fileSize: number;
  text: string;
  pages: DocumentPage[];
};

export type CompareHistoryEntry = {
  type: "compare";
  id: string;
  analyzedAt: string;
  documents: CompareHistoryDocument[];
  compareResult?: CompareResult;
  responseLanguage?: ResponseLanguage;
};

export type HistoryEntry = SingleHistoryEntry | CompareHistoryEntry;
