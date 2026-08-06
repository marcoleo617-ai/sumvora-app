import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";
import { SUPPORT_EMAIL } from "@/lib/support";

export const metadata: Metadata = {
  title: "Refund Policy — Sumvora",
  description: "Refund Policy for Sumvora Pro subscriptions billed through Paddle.",
};

export default function RefundPage() {
  return (
    <LegalPage title="Refund Policy">
      <section>
        <h2 className="text-base font-semibold text-slate-900">
          1. Pro subscription billing
        </h2>
        <p className="mt-2">
          Sumvora Pro is a paid subscription. Charges for Pro are processed by
          Paddle, which acts as the merchant of record. Pricing, taxes, and the
          billing period are shown at checkout before you complete payment.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          2. How to request a refund
        </h2>
        <p className="mt-2">
          Refund requests may be submitted through Paddle’s buyer support
          channels for your purchase, or by contacting Sumvora at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            {SUPPORT_EMAIL}
          </a>
          . Include the email used at checkout and enough detail for us to
          locate the transaction.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          3. Refund eligibility and process
        </h2>
        <p className="mt-2">
          We generally consider refund requests made within 14 days of the
          initial Pro purchase if you have not made substantial use of Pro AI
          features during that period. Refunds for renewals, chargebacks related
          to misuse, or requests after extended use may be declined. Approved
          refunds are processed through Paddle back to the original payment
          method; timing depends on Paddle and your payment provider.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          4. Cancellation and renewals
        </h2>
        <p className="mt-2">
          Canceling your Pro subscription stops future renewals. Cancellation
          does not automatically create a refund for the current billing period.
          After cancellation, Pro access typically continues until the end of
          the paid period, unless a refund is approved and access is ended
          earlier as part of that refund.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">5. Contact</h2>
        <p className="mt-2">
          For billing or refund questions, contact{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          or use Paddle’s support options for your receipt.
        </p>
      </section>
    </LegalPage>
  );
}
