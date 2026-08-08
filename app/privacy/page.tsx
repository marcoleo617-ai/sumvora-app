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
          process AI requests you start, and manage paid subscriptions.
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
          keep your subscription in sync after payment. This account and
          application data is stored in our authentication and database
          provider (Supabase) where necessary to run the service.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">3. Usage data</h2>
        <p className="mt-2">
          We track AI usage for Free-plan limits (for example, monthly AI call
          counts). We may also process basic technical and operational logs
          needed to secure the service, debug errors, and prevent abuse. Usage
          counters are account-related and are not a cloud archive of your PDF
          files.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          4. Uploaded documents and text processing
        </h2>
        <p className="mt-2">
          When you upload a PDF in the workspace, text extraction can run
          locally in your browser. Sumvora does not maintain a cloud document
          archive of your uploaded PDF files. The original PDF binary is not
          stored by Sumvora as a server-side document library.
        </p>
        <p className="mt-2">
          Your Document Library (extracted text, analysis results, and related
          history) may be stored locally in your browser—for example via
          IndexedDB—on the device you use. That local history is not used as a
          shared cloud document archive for other users.
        </p>
        <p className="mt-2">
          When you use AI features (such as summarize, ask, or compare), the
          document content needed for that request—typically extracted text or
          page content, and your question when applicable—is sent to Sumvora’s
          servers and then to our configured AI processing provider (Google
          Gemini) so we can generate a response. Document content is processed
          for those requested AI actions; Sumvora does not use your documents to
          train Sumvora’s own models.
        </p>
        <p className="mt-2">
          How Google handles API inputs (including any improvement or retention
          practices) is governed by Google’s terms and policies for the Gemini
          API service we use. Sumvora does not claim zero-retention at the AI
          provider.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          5. Isolation between users
        </h2>
        <p className="mt-2">
          Sumvora does not provide a shared document library across accounts.
          Other authenticated Sumvora users cannot open your local Document
          Library. Account profile and usage data in our database are scoped to
          your user account with access controls appropriate to that data.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          6. Service providers
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium text-slate-900">Supabase</span> —
            authentication, profile storage, usage counters, and related backend
            data needed for accounts and plan status.
          </li>
          <li>
            <span className="font-medium text-slate-900">Google Gemini</span> —
            AI model processing for summaries, questions, and document
            comparisons based on the document content you submit when you use
            those features.
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
          7. Retention and deletion
        </h2>
        <p className="mt-2">
          We retain account and billing-related data for as long as your account
          remains active and as needed for security, fraud prevention, and legal
          compliance.
        </p>
        <p className="mt-2">
          Local Document Library data remains on your device until you delete
          individual entries in the product, clear site data in your browser, or
          older entries are trimmed by the local library limit. Deleting a
          document or history entry in Sumvora removes that entry from the local
          library on that device. Because Sumvora does not keep a cloud PDF
          archive, there is no separate server-side PDF file to delete for that
          library entry. Deleting a local entry does not delete account data,
          billing records, or usage counters, and it does not control retention
          of content that may have already been processed by the AI provider for
          a prior request.
        </p>
        <p className="mt-2">
          You may request account-related deletion by contacting us; some
          records may need to be retained for a limited period where required
          for billing disputes, legal obligations, or security logs.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          8. Your rights and contact
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
