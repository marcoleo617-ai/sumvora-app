import Link from "next/link";
import UpgradeToProButton from "@/components/upgrade-to-pro-button";
import type { UserProfile } from "@/lib/profile-types";

type PricingProCtaProps = {
  profile: UserProfile | null;
};

export default function PricingProCta({ profile }: PricingProCtaProps) {
  if (profile?.plan === "pro") {
    return (
      <Link href="/account" className="btn-secondary w-full">
        You are on Sumvora Pro
      </Link>
    );
  }

  if (profile) {
    return (
      <UpgradeToProButton email={profile.email} userId={profile.id} />
    );
  }

  return (
    <Link href="/signup" className="btn-primary w-full">
      Upgrade to Pro
    </Link>
  );
}
