import { summarizeDocument } from "@/lib/gemini";
import { parseResponseLanguage } from "@/lib/response-language";
import { NextResponse } from "next/server";

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

  const text =
    typeof body === "object" &&
    body !== null &&
    "text" in body &&
    typeof (body as { text: unknown }).text === "string"
      ? (body as { text: string }).text
      : null;

  if (!text?.trim()) {
    return NextResponse.json(
      { error: "Document text is required for summarization." },
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
    const summary = await summarizeDocument(text, responseLanguage);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Gemini summarization error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate summary. Please check your connection and try again.";

    const status = message.includes("not configured") ? 500 : 502;

    return NextResponse.json({ error: message }, { status });
  }
}
