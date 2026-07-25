import PdfUploadZone from "@/components/pdf-upload-zone";
import {
  FaqSection,
  HowItWorksSection,
  SiteFooter,
  WhySumvoraSection,
} from "@/components/marketing-sections";
import SiteNavbar from "@/components/site-navbar";

const features = [
  {
    title: "Analyze PDF",
    description: "Extract text and page structure from your documents locally.",
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
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125V4.875c0-.621-.504-1.125-1.125-1.125H8.25c-.621 0-1.125.504-1.125 1.125v2.25c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375V14.25m0 0v2.625a3.375 3.375 0 0 1-3.375 3.375h-1.5A1.125 1.125 0 0 1 9 19.875v-2.25c0-.621.504-1.125 1.125-1.125h1.5a3.375 3.375 0 0 0 3.375-3.375Z"
        />
      </svg>
    ),
  },
  {
    title: "AI Summary",
    description: "Generate clear, structured summaries powered by Gemini.",
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
          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z"
        />
      </svg>
    ),
  },
  {
    title: "Ask your document",
    description: "Chat with your PDF and get grounded answers with sources.",
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
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
      </svg>
    ),
  },
  {
    title: "Compare documents",
    description: "Analyze two PDFs side by side with structured AI insights.",
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
          d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
        />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteNavbar />

      <div className="hero-section">
        <div className="hero-glow" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-10 sm:pb-14 sm:pt-14">
          <section className="mx-auto max-w-4xl px-2 text-center sm:px-4">
            <span className="hero-badge">AI Document Analysis</span>
            <h1 className="hero-title">
              Understand your documents with{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                intelligent AI
              </span>
            </h1>
            <p className="hero-lead">
              Upload PDF documents, analyze them, summarize content, ask
              questions, and compare files — all in one workspace.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <span className="info-chip">PDF files only</span>
              <span className="info-chip">Max 10 MB</span>
              <span className="info-chip">Local document library</span>
            </div>
            <div className="mt-8">
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
            </div>
          </section>
        </div>
      </div>

      <section id="features" className="section-band section-band-light">
        <div className="mx-auto max-w-6xl px-6">
          <div className="section-heading">
            <span className="section-kicker">Features</span>
            <h2 className="section-title-lg">
              Everything you need in one workspace
            </h2>
            <p className="section-lead">
              From extraction to export, Sumvora covers the full document AI
              workflow without leaving the page.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {features.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div className="feature-icon-wrap">{feature.icon}</div>
                <h2 className="feature-card-title mt-4">{feature.title}</h2>
                <p className="feature-card-body">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workspace" className="section-band section-band-workspace">
        <div className="mx-auto max-w-6xl px-6">
          <div className="section-heading">
            <span className="section-kicker">Workspace</span>
            <h2 className="section-title-lg">Start with your PDF</h2>
            <p className="section-lead">
              Upload a document, choose your workflow, and let Sumvora handle
              the rest.
            </p>
          </div>

          <div className="workspace-panel mt-8">
            <PdfUploadZone />
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <WhySumvoraSection />
      <FaqSection />
      <SiteFooter />
    </div>
  );
}
