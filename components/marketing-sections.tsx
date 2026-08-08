const steps = [
  {
    step: "01",
    title: "Upload your PDF",
    description:
      "Drag and drop a PDF or choose a file. Sumvora supports single-document and two-document compare workflows.",
  },
  {
    step: "02",
    title: "Analyze locally",
    description:
      "Text and page structure are extracted in the browser so you can inspect the document before using AI.",
  },
  {
    step: "03",
    title: "Use AI on your document",
    description:
      "Generate summaries, ask follow-up questions in chat, or compare two PDFs with structured AI output.",
  },
  {
    step: "04",
    title: "Save and export",
    description:
      "Results are stored in your local Document Library and can be exported as Markdown or plain text.",
  },
];

const benefits = [
  {
    title: "Grounded answers with sources",
    description:
      "Ask AI returns page-level excerpts so answers stay tied to the original document content.",
  },
  {
    title: "Multilingual AI output",
    description:
      "Choose from six response languages for summaries, chat answers, and compare results.",
  },
  {
    title: "Local Document Library",
    description:
      "Saved analyses stay in IndexedDB on your device. No account or cloud sync required.",
  },
  {
    title: "Export-ready results",
    description:
      "Download AI summaries and comparison reports as .md or .txt files anytime.",
  },
];

const faqs = [
  {
    question: "Which file types are supported?",
    answer:
      "Sumvora currently supports PDF files only, with a maximum upload size of 10 MB per file.",
  },
  {
    question: "Where is my data stored?",
    answer:
      "Extracted text, AI results, and Document Library entries are stored locally in your browser using IndexedDB.",
  },
  {
    question: "Are PDF files themselves saved?",
    answer:
      "No. Sumvora stores extracted text, analysis results, and metadata — not the original PDF binary.",
  },
  {
    question: "How many documents can I compare?",
    answer:
      "Compare mode supports exactly two PDF files per comparison workflow.",
  },
  {
    question: "Which response languages are available?",
    answer:
      "English, Türkçe, Deutsch, Français, Español, and Italiano. Source excerpts remain in the document's original language.",
  },
  {
    question: "Can I export my AI results?",
    answer:
      "Yes. AI summaries and compare reports can be downloaded as Markdown or plain text files.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-band section-band-tinted">
      <div className="mx-auto max-w-6xl px-6">
        <div className="section-heading">
          <span className="section-kicker">How it works</span>
          <h2 className="section-title-lg">
            From upload to insight in four steps
          </h2>
          <p className="section-lead">
            Sumvora keeps the workflow simple: upload, analyze, use AI, and
            revisit saved results whenever you need them.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {steps.map((item) => (
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

export function WhySumvoraSection() {
  return (
    <section id="why-sumvora" className="section-band section-band-dark">
      <div className="mx-auto max-w-6xl px-6">
        <div className="section-heading">
          <span className="section-kicker">Why Sumvora</span>
          <h2 className="section-title-lg">
            Built for trustworthy document AI
          </h2>
          <p className="section-lead">
            Every part of the experience is designed around clarity, source
            transparency, and keeping your document workflow in one place.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:gap-5">
          {benefits.map((item) => (
            <article
              key={item.title}
              className="feature-card feature-card-dark"
            >
              <div className="feature-icon-wrap">
                <span className="text-sm font-semibold">✦</span>
              </div>
              <h3 className="feature-card-title mt-4">{item.title}</h3>
              <p className="feature-card-body">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const privacyTrustPoints = [
  {
    title: "Local document handling",
    description:
      "Uploaded PDF files are handled locally and are not stored in a Sumvora cloud document archive.",
    icon: (
      <svg
        className="h-5 w-5 text-indigo-600"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
    ),
  },
  {
    title: "Private by design",
    description:
      "Your documents and analysis are isolated from other Sumvora users.",
    icon: (
      <svg
        className="h-5 w-5 text-indigo-600"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
        />
      </svg>
    ),
  },
  {
    title: "AI only when requested",
    description:
      "Document content is sent to our AI processing provider only when required to perform the analysis or answer you request.",
    icon: (
      <svg
        className="h-5 w-5 text-indigo-600"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
        />
      </svg>
    ),
  },
];

export function PrivacySecuritySection() {
  return (
    <section id="privacy-security" className="section-band section-band-light">
      <div className="mx-auto max-w-6xl px-6">
        <div className="section-heading">
          <span className="section-kicker">Privacy &amp; Security</span>
          <h2 className="section-title-lg">Your documents. Your privacy.</h2>
          <p className="section-lead">
            Sumvora is designed to analyze your documents without building a
            cloud archive of your files.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
          {privacyTrustPoints.map((item) => (
            <article key={item.title} className="feature-card">
              <div className="feature-icon-wrap">{item.icon}</div>
              <h3 className="feature-card-title mt-4">{item.title}</h3>
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

export function FaqSection() {
  return (
    <section id="faq" className="section-band section-band-clean">
      <div className="mx-auto max-w-6xl px-6">
        <div className="section-heading">
          <span className="section-kicker">FAQ</span>
          <h2 className="section-title-lg">Common questions</h2>
          <p className="section-lead">
            Quick answers about supported files, storage, languages, and
            exports.
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

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="site-footer-title">Sumvora</p>
          <p className="site-footer-text">
            Understand your documents with grounded AI summaries, chat, and
            comparisons.
          </p>
        </div>

        <div className="flex flex-wrap gap-5">
          <a href="/#features" className="site-footer-link">
            Features
          </a>
          <a href="/#how-it-works" className="site-footer-link">
            How it works
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
