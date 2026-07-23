import PdfUploadZone from "@/components/pdf-upload-zone";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
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
            <span className="text-xl font-semibold tracking-tight text-slate-900">
              Sumvora
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center px-6 py-12 sm:py-20">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl sm:leading-tight">
            Understand your documents with AI
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Upload PDF documents, analyze them, summarize content, and ask
            questions.
          </p>
        </div>

        <div className="mt-10 w-full">
          <PdfUploadZone />
        </div>
      </main>
    </div>
  );
}
