import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";
import { SUPPORT_EMAIL } from "@/lib/support";

export const metadata: Metadata = {
  title: "Privacy Policy — Sumvora",
  description: "Privacy Policy for the Sumvora AI document analysis service.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <section>
        <h2 className="text-base font-semibold text-slate-900">1. Overview</h2>
        <p className="mt-2">
          This Privacy Policy explains how Sumvora collects, uses, and shares
          information when you use our website and AI document analysis
          features. We aim to collect only what is needed to operate accounts,
          process AI requests, and manage paid subscriptions.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          2. Account email and profile data
        </h2>
        <p className="mt-2">
          When you create or sign in to a Sumvora account, we process your email
          address and related authentication data. Your profile may also store
          plan status (Free or Pro) and billing linkage identifiers needed to
          keep your subscription in sync after payment.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">3. Usage data</h2>
        <p className="mt-2">
          We track AI usage for Free-plan limits (for example, monthly AI call
          counts). We may also process basic technical and operational logs
          needed to secure the service, debug errors, and prevent abuse.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          4. Uploaded documents and text processing
        </h2>
        <p className="mt-2">
          PDF text extraction for the workspace can run locally in your browser.
          When you use AI features (summarize, ask, or compare), the relevant
          document text you submit is sent to our servers and to the AI provider
          so we can generate a response. Document Library history may be stored
          locally in your browser (for example, via IndexedDB) and is not used
          as a cloud document archive unless we clearly introduce that feature
          later.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          5. Service providers
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium text-slate-900">Supabase</span> —
            authentication, profile storage, and related backend data needed for
            accounts and plan status.
          </li>
          <li>
            <span className="font-medium text-slate-900">Google Gemini</span> —
            AI model processing for summaries, questions, and document
            comparisons based on the text you submit.
          </li>
          <li>
            <span className="font-medium text-slate-900">Paddle</span> —
            payment processing, subscription billing, invoices, and related
            purchase records for Pro upgrades. Paddle acts as merchant of record
            for those transactions.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          6. Retention and deletion
        </h2>
        <p className="mt-2">
          We retain account and billing-related data for as long as your account
          remains active and as needed for security, fraud prevention, and legal
          compliance. Local Document Library data remains on your device until
          you clear it. You may request account-related deletion by contacting
          us; some records may need to be retained for a limited period where
          required for billing disputes, legal obligations, or security logs.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          7. Your rights and contact
        </h2>
        <p className="mt-2">
          Depending on where you live, you may have rights to access, correct,
          update, or delete certain personal data, or to object to or restrict
          some processing. To make a privacy request, contact{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            {SUPPORT_EMAIL}
          </a>
          . We may need to verify your request before responding.
        </p>
      </section>
    </LegalPage>
  );
}
