import Link from "next/link";
import { FREE_MONTHLY_AI_CALLS } from "@/lib/plan-limits";

const capabilityStripItems = [
  "AI Summary",
  "Ask AI",
  "Quick Actions",
  "Compare PDFs",
  "Export",
  "Local History",
];

const useCases = [
  {
    title: "Contracts & Legal",
    description:
      "Surface risks, obligations, and contradictions in agreements—then ask clarifying questions before you decide next steps. Not a substitute for professional legal advice.",
  },
  {
    title: "Business Documents",
    description:
      "Turn proposals, SOWs, and vendor docs into summaries, action items, and open questions your team can act on.",
  },
  {
    title: "Research & Academic",
    description:
      "Extract key points, explain dense passages in plain language, and keep a local history of papers you analyze.",
  },
  {
    title: "Reports & Policies",
    description:
      "Compare policy versions, find inconsistencies, and export structured findings for review meetings.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Upload your PDF",
    description:
      "Drag and drop a PDF (up to 10 MB). Use single-document mode or compare exactly two files.",
  },
  {
    step: "02",
    title: "Extract and inspect content",
    description:
      "Text and page structure are extracted in your browser so you can review content before any AI request.",
  },
  {
    step: "03",
    title: "Choose an AI workflow",
    description:
      "Run a Quick Action, ask a custom question, generate a summary, or compare two documents.",
  },
  {
    step: "04",
    title: "Review grounded results",
    description:
      "Read structured AI output with source excerpts where available, and choose a response language.",
  },
  {
    step: "05",
    title: "Save locally or export",
    description:
      "Keep analyses in your local Document Library, or download results as PDF, Markdown, or TXT.",
  },
];

const privacyTrustPoints = [
  {
    title: "Privacy-first PDF handling",
    description:
      "Uploaded PDFs are handled in a privacy-first workflow designed for analysis—not for building a cloud document archive.",
  },
  {
    title: "Local Document Library",
    description:
      "Saved analyses stay in IndexedDB on this device. Search, filter, reopen, and delete history locally—no cross-device sync.",
  },
  {
    title: "AI only when you ask",
    description:
      "Document content is sent to our AI processing provider only when you request an AI analysis or answer.",
  },
];

const faqs = [
  {
    question: "Which file types are supported?",
    answer:
      "Sumvora currently supports PDF files only, with a maximum upload size of 10 MB per file.",
  },
  {
    question: "Where is my Document Library stored?",
    answer:
      "Extracted text, AI results, and Document Library entries are stored locally in your browser using IndexedDB. You can search, filter, sort, reopen, and delete that history on this device.",
  },
  {
    question: "Are original PDF files saved in the cloud?",
    answer:
      "No. Sumvora does not keep a cloud PDF archive. It stores extracted text, analysis results, and metadata locally—not the original PDF binary.",
  },
  {
    question: "Can I compare documents?",
    answer:
      "Yes. Compare mode supports exactly two PDF files and generates a structured AI comparison.",
  },
  {
    question: "Which response languages are available?",
    answer:
      "English, Türkçe, Deutsch, Français, Español, and Italiano. Source excerpts remain in the document's original language.",
  },
  {
    question: "Can I export my AI results?",
    answer:
      "Yes. AI results can be downloaded as PDF, Markdown (.md), or plain text (.txt).",
  },
  {
    question: "What are the Free and Pro plans?",
    answer: `Free includes ${FREE_MONTHLY_AI_CALLS} AI uses per month. Pro is $9.99 per month with unlimited AI usage. See Pricing for full details.`,
  },
  {
    question: "Do I need an account to use AI?",
    answer:
      "You can explore the workspace and extract PDF text without signing in. AI features such as summaries, Ask AI, Quick Actions, and compare require a signed-in Sumvora account.",
  },
];

export function CapabilityStrip() {
  return (
    <section
      id="features"
      className="border-b border-indigo-100/70 bg-white/80"
      aria-label="Product capabilities"
    >
      <div className="mx-auto max-w-6xl px-6 py-4 sm:py-5">
        <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {capabilityStripItems.map((label) => (
            <li key={label}>
              <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1.5 text-xs font-medium text-indigo-800 sm:text-sm">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function UseCasesSection() {
  return (
    <section id="use-cases" className="section-band section-band-clean">
      <div className="mx-auto max-w-6xl px-6">
        <div className="section-heading">
          <span className="section-kicker">Use cases</span>
          <h2 className="section-title-lg">Built for real document work</h2>
          <p className="section-lead">
            Use Sumvora on the documents you already review—without pretending
            to replace professional judgment.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:gap-5">
          {useCases.map((item) => (
            <article key={item.title} className="feature-card">
              <h3 className="feature-card-title">{item.title}</h3>
              <p className="feature-card-body">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-band section-band-clean">
      <div className="mx-auto max-w-6xl px-6">
        <div className="section-heading">
          <span className="section-kicker">How it works</span>
          <h2 className="section-title-lg">
            From upload to insight in five steps
          </h2>
          <p className="section-lead">
            A simple path from PDF to grounded AI results—then save locally or
            export.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5 xl:gap-4">
          {workflowSteps.map((item) => (
            <article key={item.step} className="feature-card">
              <span className="badge-primary px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em]">
                Step {item.step}
              </span>
              <h3 className="feature-card-title mt-4">{item.title}</h3>
              <p className="feature-card-body">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PrivacySecuritySection() {
  return (
    <section id="privacy-security" className="section-band section-band-light">
      <div className="mx-auto max-w-6xl px-6">
        <div className="section-heading">
          <span className="section-kicker">Privacy-first</span>
          <h2 className="section-title-lg">Your documents. Your privacy.</h2>
          <p className="section-lead">
            Sumvora is designed for privacy-first document analysis—without a
            Sumvora cloud PDF archive.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
          {privacyTrustPoints.map((item) => (
            <article key={item.title} className="feature-card">
              <h3 className="feature-card-title">{item.title}</h3>
              <p className="feature-card-body">{item.description}</p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          <a
            href="/privacy"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Learn about Privacy &amp; Security
          </a>
        </p>
      </div>
    </section>
  );
}

export function PricingTeaserSection() {
  return (
    <section id="pricing-teaser" className="section-band section-band-tinted">
      <div className="mx-auto max-w-6xl px-6">
        <div className="section-heading">
          <span className="section-kicker">Pricing</span>
          <h2 className="section-title-lg">Start free. Upgrade when you need more.</h2>
          <p className="section-lead">
            Simple plans for AI document analysis—based on monthly AI usage.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2 md:gap-5">
          <article className="feature-card flex flex-col">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Free
            </p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight text-slate-900">
                $0
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {FREE_MONTHLY_AI_CALLS} AI uses per month
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              <li>PDF analysis in the workspace</li>
              <li>Summaries, Ask AI, and Quick Actions</li>
              <li>Local Document Library</li>
            </ul>
          </article>

          <article className="feature-card flex flex-col border-indigo-200/80 ring-1 ring-indigo-100">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Pro
            </p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight text-slate-900">
                $9.99
              </span>
              <span className="text-sm text-slate-500">/ month</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">Unlimited AI usage</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              <li>Everything in Free</li>
              <li>Unlimited AI analyses</li>
              <li>Same privacy-first local library</li>
            </ul>
          </article>
        </div>

        <div className="mt-8 text-center">
          <Link href="/pricing" className="btn-secondary">
            See full pricing
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="section-band section-band-clean">
      <div className="mx-auto max-w-6xl px-6">
        <div className="section-heading">
          <span className="section-kicker">FAQ</span>
          <h2 className="section-title-lg">Common questions</h2>
          <p className="section-lead">
            Quick answers about files, privacy, plans, languages, and exports.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {faqs.map((item) => (
            <details key={item.question} className="faq-item group">
              <summary className="cursor-pointer list-none text-[15px] font-semibold tracking-[-0.01em] text-slate-900 marker:content-none">
                <div className="flex items-center justify-between gap-4">
                  <span>{item.question}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm text-indigo-600 transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </div>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="section-band section-band-dark">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="section-title-lg">
          Ready to understand your documents faster?
        </h2>
        <p className="section-lead mx-auto mt-3">
          Upload a PDF, choose a workflow, and get clear AI results you can
          save locally or export.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#workspace" className="btn-cta">
            Start analyzing
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </a>
          <Link href="/pricing" className="btn-secondary bg-white/95">
            View pricing
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="site-footer-title">Sumvora</p>
          <p className="site-footer-text">
            Turn complex PDFs into clear answers with grounded AI summaries,
            Quick Actions, comparisons, and local history.
          </p>
        </div>

        <div className="flex flex-wrap gap-5">
          <a href="/#features" className="site-footer-link">
            Capabilities
          </a>
          <a href="/#how-it-works" className="site-footer-link">
            How it works
          </a>
          <a href="/#privacy-security" className="site-footer-link">
            Privacy
          </a>
          <a href="/pricing" className="site-footer-link">
            Pricing
          </a>
          <a href="/#faq" className="site-footer-link">
            FAQ
          </a>
          <a href="/support" className="site-footer-link">
            Support
          </a>
          <a href="/#workspace" className="site-footer-link">
            Workspace
          </a>
        </div>
      </div>

      <div className="site-footer-divider">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="site-footer-copy text-center sm:text-left">
            © 2026 Sumvora · PDF analysis powered by Gemini
          </p>
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-500 sm:justify-end"
          >
            <a href="/terms" className="site-footer-link">
              Terms
            </a>
            <span aria-hidden="true">·</span>
            <a href="/privacy" className="site-footer-link">
              Privacy
            </a>
            <span aria-hidden="true">·</span>
            <a href="/refund" className="site-footer-link">
              Refund
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
