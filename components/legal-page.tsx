import Link from "next/link";
import type { ReactNode } from "react";
import { SUPPORT_EMAIL } from "@/lib/support";

type LegalPageProps = {
  title: string;
  children: ReactNode;
};

export default function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <header className="site-navbar">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[-0.02em] text-slate-900"
          >
            Sumvora
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <article className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Sumvora
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Last updated: August 6, 2026
          </p>

          <div className="legal-prose mt-8 space-y-6 text-sm leading-7 text-slate-700">
            {children}
          </div>

          <p className="mt-10 border-t border-slate-100 pt-6 text-sm text-slate-600">
            Questions? Contact us at{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </article>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-700">
            Back to Sumvora
          </Link>
        </p>
      </main>
    </div>
  );
}
