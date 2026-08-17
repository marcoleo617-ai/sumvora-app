"use client";

import {
  SMART_TEMPLATES,
  type SmartTemplate,
  type SmartTemplateId,
} from "@/lib/smart-templates";

type SmartTemplatesProps = {
  selectedId: SmartTemplateId | null;
  onSelect: (id: SmartTemplateId | null) => void;
};

function TemplateIcon({ id }: { id: SmartTemplateId }) {
  const className = "h-4 w-4 text-indigo-600";
  const props = {
    className,
    fill: "none" as const,
    viewBox: "0 0 24 24",
    strokeWidth: 1.8,
    stroke: "currentColor",
    "aria-hidden": true as const,
  };

  switch (id) {
    case "smart-summary":
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
          />
        </svg>
      );
    case "find-risks":
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      );
    case "explain-simply":
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
          />
        </svg>
      );
    case "action-items":
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    case "key-questions":
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
          />
        </svg>
      );
    case "find-contradictions":
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
          />
        </svg>
      );
    default:
      return null;
  }
}

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: SmartTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200 ${
        selected
          ? "border-indigo-400 bg-indigo-50/80 shadow-sm ring-1 ring-indigo-200"
          : "border-slate-200/80 bg-white hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-sm"
      }`}
    >
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
          selected
            ? "border-indigo-200 bg-white"
            : "border-indigo-100 bg-indigo-50/80 group-hover:border-indigo-200"
        }`}
      >
        <TemplateIcon id={template.id} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold tracking-[-0.01em] text-slate-900">
          {template.title}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-slate-500">
          {template.subtitle}
        </span>
      </span>
    </button>
  );
}

export default function SmartTemplates({
  selectedId,
  onSelect,
}: SmartTemplatesProps) {
  return (
    <section className="mb-6" aria-label="Quick Actions">
      <div className="mb-3">
        <h2 className="section-title">Quick Actions</h2>
        <p className="section-subtitle">
          Start with a ready-made analysis or ask your own question.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SMART_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={selectedId === template.id}
            onSelect={() =>
              onSelect(selectedId === template.id ? null : template.id)
            }
          />
        ))}
      </div>
    </section>
  );
}
