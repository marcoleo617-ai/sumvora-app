"use client";

import MarkdownContent from "./markdown-content";
import ExportButtons from "./export-buttons";
import type {
  CompareHistoryEntry,
  SingleHistoryEntry,
} from "@/lib/document-history-types";
import { downloadCompareExport, downloadSummaryExport } from "@/lib/export-content";
import {
  DEFAULT_RESPONSE_LANGUAGE,
  getResponseLanguageLabel,
  type ResponseLanguage,
} from "@/lib/response-language";

const PREVIEW_CHAR_LIMIT = 3000;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function formatLanguageLabel(language?: ResponseLanguage): string {
  return getResponseLanguageLabel(language ?? DEFAULT_RESPONSE_LANGUAGE);
}

type HistoryDetailViewProps = {
  entry: SingleHistoryEntry | CompareHistoryEntry;
  onClose: () => void;
};

export default function HistoryDetailView({
  entry,
  onClose,
}: HistoryDetailViewProps) {
  if (entry.type === "single") {
    const previewText =
      entry.text.length > PREVIEW_CHAR_LIMIT
        ? `${entry.text.slice(0, PREVIEW_CHAR_LIMIT)}…`
        : entry.text;

    return (
      <section className="card mt-6 text-left">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
              Saved analysis · Read only
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {entry.fileName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {formatFileSize(entry.fileSize)} · {formatDate(entry.analyzedAt)}
              {entry.summary && (
                <>
                  {" "}
                  · Response language: {formatLanguageLabel(entry.responseLanguage)}
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Back
          </button>
        </div>

        <div className="mt-6 space-y-6 border-t border-slate-100 pt-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Document Content
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Showing the first {PREVIEW_CHAR_LIMIT.toLocaleString()} characters
            </p>
            <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-700">
              {previewText}
            </pre>
          </div>

          {entry.summary && (
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="text-base font-semibold text-slate-900">
                  AI Summary
                </h3>
                <ExportButtons
                  onExport={(format) =>
                    downloadSummaryExport({
                      summary: entry.summary!,
                      fileName: entry.fileName,
                      format,
                    })
                  }
                />
              </div>
              <div className="mt-4 text-sm leading-7">
                <MarkdownContent content={entry.summary} />
              </div>
            </div>
          )}

          {entry.askSessions && entry.askSessions.length > 0 && (
            <div className="space-y-6">
              {entry.askSessions.map((session) => (
                <div
                  key={`${session.askedAt}-${session.question}`}
                  className="card-muted rounded-xl border border-slate-100 p-5"
                >
                  <p className="text-xs text-slate-400">
                    {formatDate(session.askedAt)}
                    {session.responseLanguage && (
                      <> · {formatLanguageLabel(session.responseLanguage)}</>
                    )}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">
                    Question
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    {session.question}
                  </p>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    AI Answer
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {session.answer}
                  </p>
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Sources
                    </h4>
                    {session.sources.length > 0 ? (
                      <ul className="mt-3 space-y-3">
                        {session.sources.map((source) => (
                          <li
                            key={`${source.page}-${source.excerpt}`}
                            className="text-sm leading-7 text-slate-600"
                          >
                            <span className="font-medium text-slate-700">
                              Page {source.page}
                            </span>
                            <span className="text-slate-400"> — </span>
                            <span className="italic">
                              &ldquo;{source.excerpt}&rdquo;
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        No supporting sources were identified in the document.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  const result = entry.compareResult;

  return (
    <section className="card mt-6 w-full text-left sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            Saved comparison · Read only
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Document Comparison
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {entry.documents.map((document) => document.name).join(" vs ")}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(entry.analyzedAt)}
            {entry.compareResult && (
              <> · Response language: {formatLanguageLabel(entry.responseLanguage)}</>
            )}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          {result && (
            <ExportButtons
              onExport={(format) =>
                downloadCompareExport({
                  result,
                  documentNames: entry.documents.map((document) => document.name),
                  format,
                })
              }
            />
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Back
          </button>
        </div>
      </div>

      {result ? (
        <div className="mt-8 w-full space-y-8 border-t border-slate-100 pt-8">
          <div className="card-muted w-full">
            <h3 className="text-base font-semibold text-slate-900">
              Executive Summary
            </h3>
            <div className="mt-4 text-sm leading-7 sm:text-base">
              <MarkdownContent content={result.executiveSummary} />
            </div>
          </div>

          {[
            { title: "Similarities", items: result.similarities },
            { title: "Differences", items: result.differences },
            { title: "Contradictions", items: result.contradictions },
            { title: "Key Facts", items: result.keyFacts },
          ].map(({ title, items }) => (
            <div
              key={title}
              className="card-muted w-full"
            >
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              {items.length > 0 ? (
                <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-700 sm:text-base">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                  No items recorded.
                </p>
              )}
            </div>
          ))}

          <div className="card-muted w-full">
            <h3 className="text-base font-semibold text-slate-900">Sources</h3>
            {result.sources.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {result.sources.map((source) => (
                  <li
                    key={`${source.documentName}-${source.page}-${source.excerpt}`}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 shadow-sm sm:px-5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                      <span className="text-sm font-semibold text-slate-900 sm:text-base">
                        {source.documentName}
                      </span>
                      <span className="inline-flex w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 sm:text-sm">
                        Page {source.page}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                      <span className="font-medium text-slate-500">
                        Excerpt:{" "}
                      </span>
                      <span className="italic">
                        &ldquo;{source.excerpt}&rdquo;
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                No supporting sources were identified in the documents.
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-500">
          Comparison results were not saved for this entry.
        </p>
      )}
    </section>
  );
}
