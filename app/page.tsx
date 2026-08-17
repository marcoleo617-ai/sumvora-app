import PdfUploadZone from "@/components/pdf-upload-zone";
import {
  CapabilityStrip,
  FaqSection,
  FinalCtaSection,
  HowItWorksSection,
  PricingTeaserSection,
  PrivacySecuritySection,
  SiteFooter,
  UseCasesSection,
} from "@/components/marketing-sections";
import SiteNavbar from "@/components/site-navbar";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col overflow-x-hidden">
      <SiteNavbar />

      <div className="hero-section">
        <div className="hero-glow" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-10 sm:pb-14 sm:pt-14">
          <section className="mx-auto max-w-4xl px-2 text-center sm:px-4">
            <span className="hero-badge">AI Document Analysis</span>
            <h1 className="hero-title">
              Turn complex PDFs into{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                clear answers
              </span>
            </h1>
            <p className="hero-lead">
              Summarize documents, ask questions, find risks and contradictions,
              compare two PDFs, export results, and keep analysis history
              locally—in one privacy-first workspace.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <span className="info-chip">PDF files only</span>
              <span className="info-chip">Max 10 MB</span>
              <span className="info-chip">Local document library</span>
            </div>
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
              <a href="#how-it-works" className="btn-secondary">
                See how it works
              </a>
            </div>
          </section>
        </div>
      </div>

      <CapabilityStrip />

      <section id="workspace" className="section-band section-band-workspace">
        <div className="mx-auto max-w-6xl px-6">
          <div className="section-heading">
            <span className="section-kicker">Workspace</span>
            <h2 className="section-title-lg">Try Sumvora with your PDF</h2>
            <p className="section-lead">
              Upload a document, choose a Quick Action or ask your own question,
              compare files, and export results—without leaving the page.
            </p>
          </div>

          <div className="workspace-panel mt-8">
            <PdfUploadZone />
          </div>
        </div>
      </section>

      <UseCasesSection />
      <HowItWorksSection />
      <PrivacySecuritySection />
      <PricingTeaserSection />
      <FaqSection />
      <FinalCtaSection />
      <SiteFooter />
    </div>
  );
}
