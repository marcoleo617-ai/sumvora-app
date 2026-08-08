import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing-sections";
import SiteNavbar from "@/components/site-navbar";
import { SUPPORT_EMAIL } from "@/lib/support";

export const metadata: Metadata = {
  title: "Support — Sumvora",
  description:
    "Contact Sumvora support for account, billing, subscription, or product questions.",
};

export default function SupportPage() {
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <SiteNavbar />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-12">
        <article className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Sumvora Support
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            How can we help?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Contact Sumvora support for account, billing, subscription, or
            product questions. We are happy to help you get the most out of
            your document analysis workspace.
          </p>

          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Support email
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-2 block break-all text-base font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div className="mt-6">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="btn-primary w-full">
              Email Support
            </a>
          </div>

          <p className="mt-4 text-center text-sm text-slate-500">
            We aim to respond as soon as possible.
          </p>

          <div className="mt-8 border-t border-slate-100 pt-6 text-sm text-slate-600">
            <p>
              For subscription billing details, you can also review our{" "}
              <Link
                href="/refund"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Refund Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/pricing"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Pricing
              </Link>
              .
            </p>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
