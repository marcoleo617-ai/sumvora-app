import type { DocumentPage } from "@/lib/extract-pdf-text";
import type { ResponseLanguage } from "@/lib/response-language";
import { appendLanguageInstruction } from "@/lib/response-language";
import { GoogleGenAI } from "@google/genai";

const MAX_DOCUMENT_LENGTH = 100_000;
const MAX_COMPARE_DOCUMENT_LENGTH = 45_000;
const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_FALLBACK_MODEL = "gemini-3.5-flash-lite";
const MAX_GEMINI_ATTEMPTS = 3;
const GEMINI_RETRY_DELAYS_MS = [1000, 2000];
const GEMINI_BUSY_MESSAGE =
  "AI service is temporarily busy. Please try again in a moment.";

export type AskSource = {
  page: number;
  excerpt: string;
};

export type AskDocumentResult = {
  answer: string;
  sources: AskSource[];
};

export type CompareInputDocument = {
  id: string;
  name: string;
  pages: DocumentPage[];
};

export type CompareSource = {
  documentName: string;
  page: number;
  excerpt: string;
};

export type CompareResult = {
  executiveSummary: string;
  similarities: string[];
  differences: string[];
  contradictions: string[];
  keyFacts: string[];
  sources: CompareSource[];
};

type GeminiGenerationConfig = {
  responseMimeType?: string;
  responseJsonSchema?: Record<string, unknown>;
};

const ASK_RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    answer: {
      type: "string",
      description: "The answer to the user's question based on the document.",
    },
    sources: {
      type: "array",
      description:
        "Supporting sources from the document. Must be empty if the answer is not found in the document.",
      items: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            description: "The page number where the supporting text appears.",
          },
          excerpt: {
            type: "string",
            description:
              "A short direct quote from that page that supports the answer.",
          },
        },
        required: ["page", "excerpt"],
      },
    },
  },
  required: ["answer", "sources"],
};

const COMPARE_RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    executiveSummary: {
      type: "string",
      description:
        "A concise executive summary of the comparison in Markdown format.",
    },
    similarities: {
      type: "array",
      items: { type: "string" },
      description: "Points the two documents agree on or share.",
    },
    differences: {
      type: "array",
      items: { type: "string" },
      description: "Meaningful differences between the documents.",
    },
    contradictions: {
      type: "array",
      items: { type: "string" },
      description:
        "Direct contradictions between the documents. Empty if none found.",
    },
    keyFacts: {
      type: "array",
      items: { type: "string" },
      description: "Important facts extracted from the documents.",
    },
    sources: {
      type: "array",
      description:
        "Supporting quotes with document name and page. Empty if no supporting source exists.",
      items: {
        type: "object",
        properties: {
          documentName: {
            type: "string",
            description: "Exact document file name.",
          },
          page: {
            type: "integer",
            description: "Page number in that document.",
          },
          excerpt: {
            type: "string",
            description: "Short direct quote from that page.",
          },
        },
        required: ["documentName", "page", "excerpt"],
      },
    },
  },
  required: [
    "executiveSummary",
    "similarities",
    "differences",
    "contradictions",
    "keyFacts",
    "sources",
  ],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiError(error: unknown): boolean {
  const candidates: unknown[] = [error];

  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    if ("error" in err) candidates.push(err.error);
    if ("cause" in err) candidates.push(err.cause);
  }

  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object") {
      const obj = candidate as Record<string, unknown>;
      const status = obj.status ?? obj.statusCode ?? obj.code;

      if (status === 503 || status === "UNAVAILABLE") {
        return true;
      }
    }

    const message = String(
      candidate && typeof candidate === "object" && "message" in candidate
        ? (candidate as { message: unknown }).message
        : candidate,
    ).toUpperCase();

    if (
      message.includes("503") ||
      message.includes("UNAVAILABLE") ||
      message.includes("HIGH DEMAND") ||
      message.includes("OVERLOADED")
    ) {
      return true;
    }
  }

  return false;
}

async function withGeminiRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_GEMINI_ATTEMPTS; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryableGeminiError(error) || attempt === MAX_GEMINI_ATTEMPTS - 1) {
        break;
      }

      await sleep(GEMINI_RETRY_DELAYS_MS[attempt] ?? 2000);
    }
  }

  if (isRetryableGeminiError(lastError)) {
    throw new Error(GEMINI_BUSY_MESSAGE);
  }

  throw lastError;
}

function isGeminiBusyError(error: unknown): boolean {
  return error instanceof Error && error.message === GEMINI_BUSY_MESSAGE;
}

function sanitizeGeminiError(error: unknown): Error {
  if (error instanceof Error) {
    if (
      error.message === GEMINI_BUSY_MESSAGE ||
      error.message.includes("not configured") ||
      error.message.includes("empty summary") ||
      error.message.includes("empty answer")
    ) {
      return error;
    }

    const message = error.message.trim();
    if (message.startsWith("{") || message.startsWith("[")) {
      return new Error("Failed to process your request. Please try again.");
    }
  }

  if (isRetryableGeminiError(error)) {
    return new Error(GEMINI_BUSY_MESSAGE);
  }

  return new Error("Failed to process your request. Please try again.");
}

async function generateGeminiContent(
  contents: string,
  config?: GeminiGenerationConfig,
) {
  const ai = getGeminiClient();
  const request = (model: string) =>
    ai.models.generateContent({
      model,
      contents,
      ...(config ? { config } : {}),
    });

  try {
    return await withGeminiRetry(() => request(GEMINI_MODEL));
  } catch (error) {
    if (!isGeminiBusyError(error)) {
      throw sanitizeGeminiError(error);
    }

    try {
      return await withGeminiRetry(() => request(GEMINI_FALLBACK_MODEL));
    } catch (fallbackError) {
      throw isGeminiBusyError(fallbackError)
        ? fallbackError
        : sanitizeGeminiError(fallbackError);
    }
  }
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Gemini API is not configured. Please add GEMINI_API_KEY to your environment.",
    );
  }

  return new GoogleGenAI({ apiKey });
}

function formatDocumentWithPages(pages: DocumentPage[]): string {
  let result = "";

  for (const { page, text } of pages) {
    const section = `[Page ${page}]\n${text}\n\n`;
    if (result.length + section.length > MAX_DOCUMENT_LENGTH) {
      break;
    }
    result += section;
  }

  return result.trim();
}

function formatCompareDocuments(documents: CompareInputDocument[]): string {
  return documents
    .map((document) => {
      let content = "";
      const header = `=== Document: ${document.name} ===\n\n`;

      for (const { page, text } of document.pages) {
        const section = `[Page ${page}]\n${text}\n\n`;
        if (header.length + content.length + section.length > MAX_COMPARE_DOCUMENT_LENGTH) {
          break;
        }
        content += section;
      }

      return `${header}${content.trim()}`;
    })
    .join("\n\n---\n\n");
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function parseCompareResponse(
  raw: string,
  validSources: Map<string, Set<number>>,
): CompareResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "Gemini returned an invalid comparison format. Please try again.",
    );
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error(
      "Gemini returned an invalid comparison format. Please try again.",
    );
  }

  const record = parsed as Record<string, unknown>;
  const executiveSummary =
    typeof record.executiveSummary === "string"
      ? record.executiveSummary.trim()
      : "";

  if (!executiveSummary) {
    throw new Error("Gemini returned an empty comparison. Please try again.");
  }

  const sources = Array.isArray(record.sources)
    ? record.sources
        .map((source) => {
          if (!source || typeof source !== "object") return null;

          const item = source as Record<string, unknown>;
          const documentName =
            typeof item.documentName === "string"
              ? item.documentName.trim()
              : "";
          const page =
            typeof item.page === "number" && Number.isInteger(item.page)
              ? item.page
              : null;
          const excerpt =
            typeof item.excerpt === "string" ? item.excerpt.trim() : "";
          const validPages = validSources.get(documentName);

          if (!documentName || !page || !excerpt || !validPages?.has(page)) {
            return null;
          }

          return {
            documentName,
            page,
            excerpt: excerpt.slice(0, 300),
          };
        })
        .filter((source): source is CompareSource => source !== null)
    : [];

  return {
    executiveSummary,
    similarities: parseStringArray(record.similarities),
    differences: parseStringArray(record.differences),
    contradictions: parseStringArray(record.contradictions),
    keyFacts: parseStringArray(record.keyFacts),
    sources,
  };
}

function parseAskResponse(
  raw: string,
  validPages: Set<number>,
): AskDocumentResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gemini returned an invalid answer format. Please try again.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Gemini returned an invalid answer format. Please try again.");
  }

  const record = parsed as Record<string, unknown>;
  const answer = typeof record.answer === "string" ? record.answer.trim() : "";

  if (!answer) {
    throw new Error("Gemini returned an empty answer. Please try again.");
  }

  const sources = Array.isArray(record.sources)
    ? record.sources
        .map((source) => {
          if (!source || typeof source !== "object") return null;

          const item = source as Record<string, unknown>;
          const page =
            typeof item.page === "number" && Number.isInteger(item.page)
              ? item.page
              : null;
          const excerpt =
            typeof item.excerpt === "string" ? item.excerpt.trim() : "";

          if (!page || !validPages.has(page) || !excerpt) {
            return null;
          }

          return {
            page,
            excerpt: excerpt.slice(0, 300),
          };
        })
        .filter((source): source is AskSource => source !== null)
    : [];

  return { answer, sources };
}

const SUMMARY_PROMPT = `You are a professional document analyst. Create a clear, well-organized summary of the following document.

Requirements:
- Use concise, professional language
- Highlight the main topics and key points
- Use short paragraphs and bullet points where helpful
- Do not invent information that is not present in the document

Document:
`;

export async function summarizeDocument(
  text: string,
  responseLanguage: ResponseLanguage = "en",
): Promise<string> {
  const documentText = text.trim().slice(0, MAX_DOCUMENT_LENGTH);

  const response = await generateGeminiContent(
    appendLanguageInstruction(
      `${SUMMARY_PROMPT}${documentText}`,
      responseLanguage,
    ),
  );

  const summary = response.text?.trim();

  if (!summary) {
    throw new Error("Gemini returned an empty summary. Please try again.");
  }

  return summary;
}

const ASK_PROMPT = `You are an AI document assistant.

Answer the user's question using only the document content provided below.
Each section is labeled with a page number such as [Page 1].

Rules:
- Use only information from the document.
- If the answer cannot be found in the document, say clearly that the information is not available in the document and return an empty sources array.
- Do not invent information or sources.
- Include sources only for pages that directly support the answer.
- Each source excerpt must be a short direct quote copied from that page.

Document:
`;

export async function askDocument(
  pages: DocumentPage[],
  question: string,
  responseLanguage: ResponseLanguage = "en",
): Promise<AskDocumentResult> {
  const trimmedQuestion = question.trim();
  const labeledDocument = formatDocumentWithPages(pages);
  const validPages = new Set(pages.map((page) => page.page));

  const response = await generateGeminiContent(
    appendLanguageInstruction(
      `${ASK_PROMPT}${labeledDocument}

User question:
${trimmedQuestion}`,
      responseLanguage,
    ),
    {
      responseMimeType: "application/json",
      responseJsonSchema: ASK_RESPONSE_JSON_SCHEMA,
    },
  );

  const raw = response.text?.trim();

  if (!raw) {
    throw new Error("Gemini returned an empty answer. Please try again.");
  }

  return parseAskResponse(raw, validPages);
}

const COMPARE_PROMPT = `You are a professional document comparison analyst.

Compare the two documents provided below. Each document is clearly labeled with its file name and page numbers.

Rules:
- Use only information present in the documents.
- Do not invent facts, differences, contradictions, or sources.
- If no contradictions exist, return an empty contradictions array.
- If a claim has no supporting quote in the documents, do not include a source for it.
- Each source excerpt must be a short direct quote from the specified document and page.
- The executiveSummary may use Markdown (headings, bold, bullet points).

Documents:
`;

export async function compareDocuments(
  documents: CompareInputDocument[],
  responseLanguage: ResponseLanguage = "en",
): Promise<CompareResult> {
  if (documents.length !== 2) {
    throw new Error("Exactly two documents are required for comparison.");
  }

  const labeledDocuments = formatCompareDocuments(documents);
  const validSources = new Map<string, Set<number>>();

  for (const document of documents) {
    validSources.set(
      document.name,
      new Set(document.pages.map((page) => page.page)),
    );
  }

  const response = await generateGeminiContent(
    appendLanguageInstruction(
      `${COMPARE_PROMPT}${labeledDocuments}`,
      responseLanguage,
    ),
    {
      responseMimeType: "application/json",
      responseJsonSchema: COMPARE_RESPONSE_JSON_SCHEMA,
    },
  );

  const raw = response.text?.trim();

  if (!raw) {
    throw new Error("Gemini returned an empty comparison. Please try again.");
  }

  return parseCompareResponse(raw, validSources);
}
