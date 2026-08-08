import type { Metadata } from "next";
import Link from "next/link";
import PricingProCta from "@/components/pricing-pro-cta";
import { SiteFooter } from "@/components/marketing-sections";
import SiteNavbar from "@/components/site-navbar";
import { FREE_MONTHLY_AI_CALLS } from "@/lib/plan-limits";
import { getCurrentUserProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Pricing — Sumvora",
  description:
    "Compare Sumvora Free and Sumvora Pro plans for AI document analysis.",
};

const freeFeatures = [
  `${FREE_MONTHLY_AI_CALLS} AI uses per month`,
  "PDF document analysis",
  "AI summaries",
  "Ask questions about documents",
];

const proFeatures = [
  "Higher AI usage limits",
  "PDF document analysis",
  "AI summaries",
  "Ask questions about documents",
  "Document comparison",
  "Priority access to advanced features",
];

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="mt-8 space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-700">
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"
            aria-hidden="true"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.4}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function PricingPage() {
  const profile = await getCurrentUserProfile();

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <SiteNavbar />

      <main className="flex-1">
        <section className="hero-section">
          <div className="hero-glow" aria-hidden="true" />
          <div className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-14 sm:pb-20 sm:pt-16">
            <div className="mx-auto max-w-2xl text-center">
              <p className="section-kicker">Pricing</p>
              <h1 className="section-title-lg mt-4">
                Simple plans for document AI
              </h1>
              <p className="section-lead">
                Start free with monthly AI limits, or upgrade to Sumvora Pro for
                higher usage and advanced document workflows.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
              <article className="feature-card flex flex-col">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Free
                  </p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight text-slate-900">
                      $0
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    For getting started with Sumvora AI document analysis.
                  </p>
                  <FeatureList features={freeFeatures} />
                </div>
                <div className="mt-8">
                  <Link href={profile ? "/#workspace" : "/signup"} className="btn-secondary w-full">
                    {profile ? "Open workspace" : "Get started free"}
                  </Link>
                </div>
              </article>

              <article className="feature-card flex flex-col border-indigo-200/80 ring-1 ring-indigo-100">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
                      Sumvora Pro
                    </p>
                    <span className="badge-primary px-3 py-1">Popular</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight text-slate-900">
                      $9.99
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      /month
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    For higher AI usage and advanced Sumvora features.
                  </p>
                  <FeatureList features={proFeatures} />
                </div>
                <div className="mt-8">
                  <PricingProCta profile={profile} />
                  {!profile && (
                    <p className="mt-3 text-center text-xs text-slate-500">
                      Create a free account, then complete Pro checkout with
                      Paddle.
                    </p>
                  )}
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
