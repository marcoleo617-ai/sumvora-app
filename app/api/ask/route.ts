import { askDocument } from "@/lib/gemini";
import type { DocumentPage } from "@/lib/extract-pdf-text";
import { parseResponseLanguage } from "@/lib/response-language";
import { NextResponse } from "next/server";

function parseDocumentPages(value: unknown): DocumentPage[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const pages = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;
      const page =
        typeof record.page === "number" && Number.isInteger(record.page)
          ? record.page
          : null;
      const text = typeof record.text === "string" ? record.text.trim() : "";

      if (!page || page < 1 || !text) {
        return null;
      }

      return { page, text };
    })
    .filter((page): page is DocumentPage => page !== null);

  return pages.length > 0 ? pages : null;
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

  const documentPages =
    typeof body === "object" &&
    body !== null &&
    "documentPages" in body
      ? parseDocumentPages((body as { documentPages: unknown }).documentPages)
      : null;

  const question =
    typeof body === "object" &&
    body !== null &&
    "question" in body &&
    typeof (body as { question: unknown }).question === "string"
      ? (body as { question: string }).question
      : null;

  if (!documentPages || !question?.trim()) {
    return NextResponse.json(
      { error: "Document pages and question are required." },
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
    const result = await askDocument(
      documentPages,
      question,
      responseLanguage,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Ask API error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to answer the question. Please check your connection and try again.";

    const status = message.includes("not configured") ? 500 : 502;

    return NextResponse.json({ error: message }, { status });
  }
}
