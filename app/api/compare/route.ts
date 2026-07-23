import { compareDocuments } from "@/lib/gemini";
import type { DocumentPage } from "@/lib/extract-pdf-text";
import { parseResponseLanguage } from "@/lib/response-language";
import { NextResponse } from "next/server";

function parseCompareDocuments(value: unknown) {
  if (!Array.isArray(value) || value.length !== 2) {
    return null;
  }

  const documents = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;
      const id = typeof record.id === "string" ? record.id.trim() : "";
      const name = typeof record.name === "string" ? record.name.trim() : "";
      const pages = Array.isArray(record.pages)
        ? record.pages
            .map((pageItem) => {
              if (!pageItem || typeof pageItem !== "object") return null;

              const pageRecord = pageItem as Record<string, unknown>;
              const page =
                typeof pageRecord.page === "number" &&
                Number.isInteger(pageRecord.page)
                  ? pageRecord.page
                  : null;
              const text =
                typeof pageRecord.text === "string"
                  ? pageRecord.text.trim()
                  : "";

              if (!page || page < 1 || !text) {
                return null;
              }

              return { page, text } satisfies DocumentPage;
            })
            .filter((page): page is DocumentPage => page !== null)
        : [];

      if (!id || !name || pages.length === 0) {
        return null;
      }

      return { id, name, pages };
    })
    .filter(
      (
        document,
      ): document is {
        id: string;
        name: string;
        pages: DocumentPage[];
      } => document !== null,
    );

  return documents.length === 2 ? documents : null;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const documents =
    typeof body === "object" &&
    body !== null &&
    "documents" in body
      ? parseCompareDocuments((body as { documents: unknown }).documents)
      : null;

  if (!documents) {
    return NextResponse.json(
      { error: "Exactly two analyzed documents are required." },
      { status: 400 },
    );
  }

  const responseLanguage =
    typeof body === "object" && body !== null && "responseLanguage" in body
      ? parseResponseLanguage(
          (body as { responseLanguage: unknown }).responseLanguage,
        )
      : parseResponseLanguage(undefined);

  try {
    const result = await compareDocuments(documents, responseLanguage);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Compare API error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to compare documents. Please check your connection and try again.";

    const status = message.includes("not configured") ? 500 : 502;

    return NextResponse.json({ error: message }, { status });
  }
}
