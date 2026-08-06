import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";
import { SUPPORT_EMAIL } from "@/lib/support";

export const metadata: Metadata = {
  title: "Terms of Service — Sumvora",
  description: "Terms of Service for the Sumvora AI document analysis service.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <section>
        <h2 className="text-base font-semibold text-slate-900">1. About Sumvora</h2>
        <p className="mt-2">
          Sumvora is an AI document analysis service that lets you upload PDF
          documents, extract text locally in your browser, generate summaries,
          ask questions about your documents, and compare files. These Terms of
          Service (“Terms”) govern your use of the Sumvora website and related
          features.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          2. Free and Pro accounts
        </h2>
        <p className="mt-2">
          Sumvora offers a Free plan with monthly AI usage limits and a Pro plan
          with unlimited AI usage for the subscribed account. Plan features and
          limits may change over time. You are responsible for keeping your
          account credentials secure and for activity under your account.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          3. Subscription billing through Paddle
        </h2>
        <p className="mt-2">
          Paid Pro subscriptions are billed through Paddle, which acts as the
          merchant of record for payments. By purchasing Pro, you also agree to
          Paddle’s applicable checkout and buyer terms. Prices, taxes, currency,
          renewal timing, and invoices are presented at checkout and managed by
          Paddle. Unless canceled, subscriptions renew automatically for the
          selected billing period.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">4. Acceptable use</h2>
        <p className="mt-2">You agree not to use Sumvora to:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Violate applicable laws or third-party rights</li>
          <li>Upload or process unlawful, harmful, or infringing content</li>
          <li>Attempt to disrupt, reverse engineer, or abuse the service</li>
          <li>Circumvent usage limits, authentication, or billing controls</li>
          <li>Use the service to generate spam, malware, or deceptive content</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          5. AI-generated output disclaimer
        </h2>
        <p className="mt-2">
          Sumvora uses artificial intelligence to generate summaries, answers,
          and comparisons. AI output may be incomplete, inaccurate, or
          outdated. You should review all results before relying on them for
          decisions. Sumvora does not provide legal, financial, medical, or
          other professional advice.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          6. Account termination
        </h2>
        <p className="mt-2">
          You may stop using Sumvora at any time and may cancel a Pro
          subscription according to the Refund Policy and Paddle’s cancellation
          process. We may suspend or terminate access if you violate these Terms,
          misuse the service, or create risk to Sumvora, other users, or third
          parties. Termination does not limit rights or remedies that accrued
          before termination.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          7. Limitation of liability
        </h2>
        <p className="mt-2">
          To the fullest extent permitted by law, Sumvora is provided “as is”
          and “as available,” without warranties of any kind, whether express or
          implied. Sumvora and its operators are not liable for indirect,
          incidental, special, consequential, or punitive damages, or for loss
          of profits, data, goodwill, or business interruption arising from your
          use of the service. Our aggregate liability for claims relating to the
          service is limited to the amounts you paid to Sumvora through Paddle
          for Pro access in the three months before the claim, or zero if you
          use only the Free plan.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">8. Contact</h2>
        <p className="mt-2">
          For questions about these Terms, contact{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
