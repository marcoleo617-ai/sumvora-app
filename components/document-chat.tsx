"use client";

import type { AskSession } from "@/lib/document-history-types";

type DocumentChatProps = {
  turns: AskSession[];
  question: string;
  isAsking: boolean;
  askError: string | null;
  preparedTemplateTitle?: string | null;
  onQuestionChange: (value: string) => void;
  onAsk: () => void;
};

export default function DocumentChat({
  turns,
  question,
  isAsking,
  askError,
  preparedTemplateTitle = null,
  onQuestionChange,
  onAsk,
}: DocumentChatProps) {
  return (
    <section className="card mt-6 text-left">
      <h2 className="section-title">Ask your document</h2>
      <p className="section-subtitle">
        Ask questions about your PDF. Previous questions and answers stay visible
        below.
      </p>

      {preparedTemplateTitle && (
        <p className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-indigo-800">
          Prepared action:{" "}
          <span className="font-semibold">{preparedTemplateTitle}</span>. Review
          or edit the prompt, then click Ask AI — no credit is used until you
          send the request.
        </p>
      )}

      {turns.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {turns.map((turn) => (
            <li
              key={`${turn.askedAt}-${turn.question}`}
              className="space-y-3"
            >
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-900 shadow-sm">
                  {turn.question}
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-indigo-100 bg-gradient-to-br from-indigo-50/90 to-violet-50/50 px-4 py-3 shadow-sm">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {turn.answer}
                  </p>
                  <div className="mt-4 border-t border-indigo-100/80 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sources
                    </p>
                    {turn.sources.length > 0 ? (
                      <ul className="mt-2 space-y-2">
                        {turn.sources.map((source) => (
                          <li
                            key={`${turn.askedAt}-${source.page}-${source.excerpt}`}
                            className="text-sm leading-relaxed text-slate-600"
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
                      <p className="mt-2 text-sm text-slate-500">
                        No supporting sources were identified in the document.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-slate-500">
          {preparedTemplateTitle
            ? "Your Quick Action is ready below. You can also type a custom question instead."
            : "Ask your first question about this document."}
        </p>
      )}

      {isAsking && (
        <p
          className="mt-4 flex items-center gap-2 text-sm text-slate-600"
          role="status"
          aria-live="polite"
        >
          <svg
            className="h-4 w-4 animate-spin text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Thinking...
        </p>
      )}

      <textarea
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        placeholder="What is this document about?"
        rows={3}
        disabled={isAsking}
        className="input-field mt-4 resize-y"
      />

      <div className="mt-4 flex flex-col items-start gap-3">
        <button
          type="button"
          onClick={onAsk}
          disabled={isAsking || !question.trim()}
          className="btn-primary"
        >
          Ask AI
        </button>

        {askError && (
          <p className="text-sm text-red-600" role="alert" aria-live="polite">
            {askError}
          </p>
        )}
      </div>
    </section>
  );
}
