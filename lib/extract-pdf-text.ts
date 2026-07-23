import { extractText, getDocumentProxy } from "unpdf";

export type DocumentPage = {
  page: number;
  text: string;
};

export type ExtractedPdfDocument = {
  text: string;
  pages: DocumentPage[];
};

export type AnalyzedDocument = {
  id: string;
  name: string;
  text: string;
  pages: DocumentPage[];
};

export async function extractPdfDocument(
  file: File,
): Promise<ExtractedPdfDocument> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text: pageTexts } = await extractText(pdf, { mergePages: false });

  const pages = pageTexts
    .map((pageText, index) => ({
      page: index + 1,
      text: pageText.trim(),
    }))
    .filter((page) => page.text.length > 0);

  const text = pageTexts.join("\n").replace(/\s+/g, " ").trim();

  if (!text) {
    throw new Error(
      "No readable text was found in this PDF. It may be empty or contain only images.",
    );
  }

  return { text, pages };
}

export async function extractPdfText(file: File): Promise<string> {
  const document = await extractPdfDocument(file);
  return document.text;
}
