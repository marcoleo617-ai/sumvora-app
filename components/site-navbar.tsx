import Link from "next/link";
import AuthNav from "@/components/auth-nav";

const navLinks = [
  { href: "/#features", label: "Capabilities" },
  { href: "/#use-cases", label: "Use cases" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#privacy-security", label: "Privacy" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export default function SiteNavbar() {
  return (
    <header className="site-navbar">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md transition-shadow duration-200 group-hover:shadow-lg">
            <svg
              className="h-4.5 w-4.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125V4.875c0-.621-.504-1.125-1.125-1.125H8.25c-.621 0-1.125.504-1.125 1.125v2.25c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375V14.25m0 0v2.625a3.375 3.375 0 0 1-3.375 3.375h-1.5A1.125 1.125 0 0 1 9 19.875v-2.25c0-.621.504-1.125 1.125-1.125h1.5a3.375 3.375 0 0 0 3.375-3.375Z"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
            Sumvora
          </span>
        </Link>

        <nav className="flex min-w-0 max-w-full items-center gap-0.5 overflow-x-auto sm:gap-1.5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link shrink-0">
              {link.label}
            </Link>
          ))}
          <Link href="/#workspace" className="btn-cta-sm ml-1 shrink-0">
            Get started
          </Link>
          <div className="shrink-0">
            <AuthNav />
          </div>
        </nav>
      </div>
    </header>
  );
}
