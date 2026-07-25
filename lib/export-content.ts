import type { CompareResult } from "@/lib/gemini";

export type ExportFormat = "md" | "txt";

function markdownToPlainText(content: string): string {
  return content
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sanitizeFilename(name: string, maxLength = 80): string {
  const sanitized = name
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!sanitized) {
    return "sumvora-export";
  }

  return sanitized.slice(0, maxLength);
}

function formatBulletSection(
  title: string,
  items: string[],
  format: ExportFormat,
): string {
  if (items.length === 0) {
    return format === "md"
      ? `## ${title}\n\nNone identified.\n`
      : `${title.toUpperCase()}\n\nNone identified.\n`;
  }

  if (format === "md") {
    return `## ${title}\n\n${items.map((item) => `- ${item}`).join("\n")}\n`;
  }

  return `${title.toUpperCase()}\n\n${items.map((item) => `- ${item}`).join("\n")}\n`;
}

export function buildSummaryExport(options: {
  summary: string;
  fileName: string;
  format: ExportFormat;
}): string {
  const header =
    options.format === "md"
      ? `# AI Summary\n\nDocument: ${options.fileName}\n\n`
      : `AI SUMMARY\n\nDocument: ${options.fileName}\n\n`;

  const body =
    options.format === "md"
      ? options.summary.trim()
      : markdownToPlainText(options.summary);

  return `${header}${body}\n`;
}

export function buildCompareExport(options: {
  result: CompareResult;
  documentNames: string[];
  format: ExportFormat;
}): string {
  const documentsLine = options.documentNames.join(" vs ");
  const header =
    options.format === "md"
      ? `# Document Comparison\n\nDocuments: ${documentsLine}\n\n`
      : `DOCUMENT COMPARISON\n\nDocuments: ${documentsLine}\n\n`;

  const executiveTitle = options.format === "md" ? "## Executive Summary" : "EXECUTIVE SUMMARY";
  const executiveBody =
    options.format === "md"
      ? options.result.executiveSummary.trim()
      : markdownToPlainText(options.result.executiveSummary);

  const sections = [
    `${executiveTitle}\n\n${executiveBody}\n`,
    formatBulletSection("Similarities", options.result.similarities, options.format),
    formatBulletSection("Differences", options.result.differences, options.format),
    formatBulletSection("Contradictions", options.result.contradictions, options.format),
    formatBulletSection("Key Facts", options.result.keyFacts, options.format),
  ].join("\n");

  const sourcesHeader = options.format === "md" ? "## Sources" : "SOURCES";
  const sourcesBody =
    options.result.sources.length > 0
      ? options.result.sources
          .map((source) => {
            if (options.format === "md") {
              return `- **${source.documentName}** (Page ${source.page}): "${source.excerpt}"`;
            }

            return `- ${source.documentName} (Page ${source.page}): "${source.excerpt}"`;
          })
          .join("\n")
      : "None identified.";

  return `${header}${sections}\n${sourcesHeader}\n\n${sourcesBody}\n`;
}

export function getSummaryFilename(fileName: string, format: ExportFormat): string {
  const baseName = sanitizeFilename(fileName.replace(/\.pdf$/i, ""));
  return `${baseName}-summary.${format}`;
}

export function getCompareFilename(
  documentNames: string[],
  format: ExportFormat,
): string {
  const baseName = sanitizeFilename(
    documentNames.map((name) => name.replace(/\.pdf$/i, "")).join("-vs-"),
  );
  return `${baseName}-comparison.${format}`;
}

export function downloadFile(
  filename: string,
  content: string,
  format: ExportFormat,
): void {
  const mimeType = format === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8";
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadSummaryExport(options: {
  summary: string;
  fileName: string;
  format: ExportFormat;
}): void {
  downloadFile(
    getSummaryFilename(options.fileName, options.format),
    buildSummaryExport(options),
    options.format,
  );
}

export function downloadCompareExport(options: {
  result: CompareResult;
  documentNames: string[];
  format: ExportFormat;
}): void {
  downloadFile(
    getCompareFilename(options.documentNames, options.format),
    buildCompareExport(options),
    options.format,
  );
}
