"use client";

import ReactMarkdown from "react-markdown";

type MarkdownContentProps = {
  content: string;
};

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h3 className="mt-4 text-base font-semibold text-slate-900 first:mt-0">
            {children}
          </h3>
        ),
        h2: ({ children }) => (
          <h3 className="mt-4 text-base font-semibold text-slate-900 first:mt-0">
            {children}
          </h3>
        ),
        h3: ({ children }) => (
          <h4 className="mt-3 text-sm font-semibold text-slate-900">{children}</h4>
        ),
        p: ({ children }) => (
          <p className="mt-2 leading-relaxed text-slate-700">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-700">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900">{children}</strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
