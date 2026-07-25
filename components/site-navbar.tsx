const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#why-sumvora", label: "Why Sumvora" },
  { href: "#faq", label: "FAQ" },
];

export default function SiteNavbar() {
  return (
    <header className="site-navbar">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <a href="#" className="group flex items-center gap-3">
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
        </a>

        <nav className="flex max-w-full items-center gap-1 overflow-x-auto sm:gap-2">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
          <a href="#workspace" className="btn-cta-sm ml-1 shrink-0">
            Get started
          </a>
        </nav>
      </div>
    </header>
  );
}
