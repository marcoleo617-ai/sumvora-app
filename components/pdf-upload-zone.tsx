"use client";

import DocumentChat from "./document-chat";
import DocumentHistoryPanel from "./document-history-panel";
import ExportButtons from "./export-buttons";
import HistoryDetailView from "./history-detail-view";
import MarkdownContent from "./markdown-content";
import ResponseLanguageSelect from "./response-language-select";
import SmartTemplates from "./smart-templates";
import {
  appendAskSession,
  saveHistoryEntry,
  updateSingleHistoryEntry,
} from "@/lib/document-history";
import type { HistoryEntry, AskSession } from "@/lib/document-history-types";
import {
  extractPdfDocument,
  type AnalyzedDocument,
  type DocumentPage,
} from "@/lib/extract-pdf-text";
import type { AskSource, CompareResult } from "@/lib/gemini";
import { downloadCompareExport, downloadSummaryExport } from "@/lib/export-content";
import {
  DEFAULT_RESPONSE_LANGUAGE,
  parseResponseLanguage,
  RESPONSE_LANGUAGE_STORAGE_KEY,
  type ResponseLanguage,
} from "@/lib/response-language";
import {
  getSmartTemplate,
  type SmartTemplateId,
} from "@/lib/smart-templates";
import { useCallback, useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const PREVIEW_CHAR_LIMIT = 3000;
const MAX_COMPARE_FILES = 2;

type UploadMode = "single" | "compare";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isPdfFile(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return file.type === "application/pdf" || extension === "pdf";
}

function validateFile(file: File): string | null {
  if (!isPdfFile(file)) {
    return "Please upload a PDF file only. Other file types are not supported.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File size must be 10 MB or less. Your file is ${formatFileSize(file.size)}.`;
  }
  return null;
}

function getAnalysisErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to analyze this PDF. The file may be corrupted or password-protected.";
}

export default function PdfUploadZone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const compareInputRef = useRef<HTMLInputElement>(null);
  const singleHistoryIdRef = useRef<string | null>(null);
  const [mode, setMode] = useState<UploadMode>("single");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [extractedPages, setExtractedPages] = useState<DocumentPage[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<SmartTemplateId | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [chatTurns, setChatTurns] = useState<AskSession[]>([]);
  const [compareFiles, setCompareFiles] = useState<File[]>([]);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [isCompareDragging, setIsCompareDragging] = useState(false);
  const [isCompareAnalyzing, setIsCompareAnalyzing] = useState(false);
  const [compareAnalysisError, setCompareAnalysisError] = useState<string | null>(
    null,
  );
  const [compareAnalyzed, setCompareAnalyzed] = useState<AnalyzedDocument[]>(
    [],
  );
  const [isComparing, setIsComparing] = useState(false);
  const [compareResultError, setCompareResultError] = useState<string | null>(
    null,
  );
  const [compareResult, setCompareResult] = useState<CompareResult | null>(
    null,
  );
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  const [viewingHistoryEntry, setViewingHistoryEntry] =
    useState<HistoryEntry | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null,
  );
  const [responseLanguage, setResponseLanguage] = useState<ResponseLanguage>(
    () => {
      if (typeof window === "undefined") {
        return DEFAULT_RESPONSE_LANGUAGE;
      }

      return parseResponseLanguage(
        localStorage.getItem(RESPONSE_LANGUAGE_STORAGE_KEY),
      );
    },
  );

  const bumpHistoryRefresh = useCallback(() => {
    setHistoryRefreshToken((token) => token + 1);
  }, []);

  const handleResponseLanguageChange = useCallback((language: ResponseLanguage) => {
    setResponseLanguage(language);
    if (typeof window !== "undefined") {
      localStorage.setItem(RESPONSE_LANGUAGE_STORAGE_KEY, language);
    }
  }, []);

  const resetCompare = useCallback(() => {
    setCompareFiles([]);
    setCompareError(null);
    setIsCompareDragging(false);
    setIsCompareAnalyzing(false);
    setCompareAnalysisError(null);
    setCompareAnalyzed([]);
    setIsComparing(false);
    setCompareResultError(null);
    setCompareResult(null);
  }, []);

  const applySelectedTemplatePrompt = useCallback(
    (templateId: SmartTemplateId | null) => {
      const template = getSmartTemplate(templateId);
      setQuestion(template?.prompt ?? "");
    },
    [],
  );

  const handleSelectTemplate = useCallback(
    (templateId: SmartTemplateId | null) => {
      // Selection only prepares a prompt — never calls AI endpoints.
      setSelectedTemplateId(templateId);
      applySelectedTemplatePrompt(templateId);
      setAskError(null);
    },
    [applySelectedTemplatePrompt],
  );

  const resetAnalysis = useCallback(() => {
    singleHistoryIdRef.current = null;
    setIsAnalyzing(false);
    setAnalysisError(null);
    setExtractedText(null);
    setExtractedPages([]);
    setIsSummarizing(false);
    setSummaryError(null);
    setAiSummary(null);
    setQuestion("");
    setIsAsking(false);
    setAskError(null);
    setChatTurns([]);
  }, []);

  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    setViewingHistoryEntry(entry);
    setSelectedHistoryId(entry.id);
    setMode(entry.type === "compare" ? "compare" : "single");
  }, []);

  const handleCloseHistoryView = useCallback(() => {
    setViewingHistoryEntry(null);
    setSelectedHistoryId(null);
  }, []);

  const handleDeleteHistory = useCallback(
    (id: string) => {
      if (viewingHistoryEntry?.id === id) {
        setViewingHistoryEntry(null);
        setSelectedHistoryId(null);
      }
    },
    [viewingHistoryEntry?.id],
  );

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        resetAnalysis();
        applySelectedTemplatePrompt(selectedTemplateId);
        return;
      }

      setError(null);
      setSelectedFile(file);
      resetAnalysis();
      // Keep prepared Quick Action ready after a new upload.
      applySelectedTemplatePrompt(selectedTemplateId);
    },
    [resetAnalysis, applySelectedTemplatePrompt, selectedTemplateId],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files[0]);
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setExtractedText(null);
    setExtractedPages([]);
    setChatTurns([]);
    setAiSummary(null);

    try {
      const document = await extractPdfDocument(selectedFile);
      setExtractedText(document.text);
      setExtractedPages(document.pages);

      const id = crypto.randomUUID();
      singleHistoryIdRef.current = id;
      await saveHistoryEntry({
        type: "single",
        id,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        analyzedAt: new Date().toISOString(),
        text: document.text,
        pages: document.pages,
      });
      bumpHistoryRefresh();
    } catch (err) {
      setAnalysisError(getAnalysisErrorMessage(err));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSummarize = async () => {
    if (!extractedText || isSummarizing) return;

    setIsSummarizing(true);
    setSummaryError(null);
    setAiSummary(null);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText, responseLanguage }),
      });

      const data: { summary?: string; error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to generate summary. Please check your connection and try again.",
        );
      }

      if (!data.summary) {
        throw new Error("Gemini returned an empty summary. Please try again.");
      }

      setAiSummary(data.summary);

      if (singleHistoryIdRef.current) {
        await updateSingleHistoryEntry(singleHistoryIdRef.current, {
          summary: data.summary,
          responseLanguage,
        });
        bumpHistoryRefresh();
      }
    } catch (err) {
      setSummaryError(
        err instanceof Error
          ? err.message
          : "Failed to generate summary. Please check your connection and try again.",
      );
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleAsk = async () => {
    if (!extractedText || extractedPages.length === 0 || isAsking) return;

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setAskError("Please enter a question about your document.");
      return;
    }

    setIsAsking(true);
    setAskError(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentPages: extractedPages,
          question: trimmedQuestion,
          responseLanguage,
        }),
      });

      const data: {
        answer?: string;
        sources?: AskSource[];
        error?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to answer the question. Please check your connection and try again.",
        );
      }

      if (!data.answer) {
        throw new Error("Gemini returned an empty answer. Please try again.");
      }

      const sources = Array.isArray(data.sources) ? data.sources : [];
      const turn: AskSession = {
        question: trimmedQuestion,
        answer: data.answer,
        sources,
        askedAt: new Date().toISOString(),
        responseLanguage,
      };

      setChatTurns((current) => [...current, turn]);
      applySelectedTemplatePrompt(selectedTemplateId);

      if (singleHistoryIdRef.current) {
        await appendAskSession(singleHistoryIdRef.current, turn);
        bumpHistoryRefresh();
      }
    } catch (err) {
      setAskError(
        err instanceof Error
          ? err.message
          : "Failed to answer the question. Please check your connection and try again.",
      );
    } finally {
      setIsAsking(false);
    }
  };

  const switchMode = (nextMode: UploadMode) => {
    setMode(nextMode);
    setViewingHistoryEntry(null);
    setSelectedHistoryId(null);
    if (nextMode === "single") {
      resetCompare();
    } else {
      setError(null);
      setSelectedFile(null);
      setSelectedTemplateId(null);
      resetAnalysis();
    }
  };

  const resetCompareSelectionResults = useCallback(() => {
    setCompareAnalysisError(null);
    setCompareAnalyzed([]);
    setCompareResultError(null);
    setCompareResult(null);
  }, []);

  const handleCompareSelection = useCallback(
    (incomingFiles: File[]) => {
      if (incomingFiles.length > MAX_COMPARE_FILES) {
        setCompareError("Please select exactly 2 PDF files for comparison.");
        return;
      }

      for (const file of incomingFiles) {
        const validationError = validateFile(file);
        if (validationError) {
          setCompareError(validationError);
          setCompareFiles([]);
          resetCompareSelectionResults();
          return;
        }
      }

      setCompareError(null);
      setCompareFiles(incomingFiles);
      resetCompareSelectionResults();
    },
    [resetCompareSelectionResults],
  );

  const handleCompareInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    handleCompareSelection(files);
    event.target.value = "";
  };

  const handleCompareDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsCompareDragging(true);
  };

  const handleCompareDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsCompareDragging(false);
  };

  const handleCompareDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsCompareDragging(false);
    handleCompareSelection(Array.from(event.dataTransfer.files));
  };

  const openCompareFilePicker = () => {
    compareInputRef.current?.click();
  };

  const removeCompareFile = (index: number) => {
    setCompareFiles((current) => current.filter((_, i) => i !== index));
    resetCompareSelectionResults();
  };

  const handleCompareAnalyze = async () => {
    if (compareFiles.length !== MAX_COMPARE_FILES || isCompareAnalyzing) return;

    setIsCompareAnalyzing(true);
    setCompareAnalysisError(null);
    setCompareAnalyzed([]);
    setCompareResult(null);
    setCompareResultError(null);

    try {
      const analyzed = await Promise.all(
        compareFiles.map(async (file) => {
          const document = await extractPdfDocument(file);
          return {
            id: crypto.randomUUID(),
            name: file.name,
            text: document.text,
            pages: document.pages,
          } satisfies AnalyzedDocument;
        }),
      );

      setCompareAnalyzed(analyzed);
    } catch (err) {
      setCompareAnalysisError(getAnalysisErrorMessage(err));
    } finally {
      setIsCompareAnalyzing(false);
    }
  };

  const handleCompareDocuments = async () => {
    if (compareAnalyzed.length !== MAX_COMPARE_FILES || isComparing) return;

    setIsComparing(true);
    setCompareResultError(null);
    setCompareResult(null);

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: compareAnalyzed.map(({ id, name, pages }) => ({
            id,
            name,
            pages,
          })),
          responseLanguage,
        }),
      });

      const data: CompareResult & { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to compare documents. Please check your connection and try again.",
        );
      }

      if (!data.executiveSummary) {
        throw new Error(
          "Gemini returned an empty comparison. Please try again.",
        );
      }

      const result: CompareResult = {
        executiveSummary: data.executiveSummary,
        similarities: Array.isArray(data.similarities) ? data.similarities : [],
        differences: Array.isArray(data.differences) ? data.differences : [],
        contradictions: Array.isArray(data.contradictions)
          ? data.contradictions
          : [],
        keyFacts: Array.isArray(data.keyFacts) ? data.keyFacts : [],
        sources: Array.isArray(data.sources) ? data.sources : [],
      };

      setCompareResult(result);

      await saveHistoryEntry({
        type: "compare",
        id: crypto.randomUUID(),
        analyzedAt: new Date().toISOString(),
        documents: compareAnalyzed.map((document, index) => ({
          name: document.name,
          fileSize: compareFiles[index]?.size ?? 0,
          text: document.text,
          pages: document.pages,
        })),
        compareResult: result,
        responseLanguage,
      });
      bumpHistoryRefresh();
    } catch (err) {
      setCompareResultError(
        err instanceof Error
          ? err.message
          : "Failed to compare documents. Please check your connection and try again.",
      );
    } finally {
      setIsComparing(false);
    }
  };

  const zoneClasses = [
    "group dropzone sm:py-20",
    selectedFile && !error
      ? "border-indigo-300 bg-indigo-50/50 py-12 shadow-md ring-1 ring-indigo-100"
      : "py-16",
    error
      ? "border-red-300 bg-red-50/50 hover:border-red-400 hover:bg-red-50/70"
      : isDragging
        ? "border-indigo-400 bg-indigo-50/70 shadow-md ring-2 ring-indigo-100"
        : "border-slate-300 bg-white/90 hover:border-indigo-400 hover:bg-indigo-50/40 hover:shadow-md",
  ].join(" ");

  const previewText =
    extractedText && extractedText.length > PREVIEW_CHAR_LIMIT
      ? `${extractedText.slice(0, PREVIEW_CHAR_LIMIT)}…`
      : extractedText;

  const summaryExportFileName = selectedFile?.name ?? "document.pdf";
  const hasAiSummary = Boolean(aiSummary?.trim());

  const compareZoneClasses = [
    "group dropzone w-full sm:py-20",
    compareFiles.length === MAX_COMPARE_FILES && !compareError
      ? "border-indigo-300 bg-indigo-50/50 py-12 shadow-md ring-1 ring-indigo-100"
      : "py-16",
    compareError
      ? "border-red-300 bg-red-50/50 hover:border-red-400 hover:bg-red-50/70"
      : isCompareDragging
        ? "border-indigo-400 bg-indigo-50/70 shadow-md ring-2 ring-indigo-100"
        : "border-slate-300 bg-white/90 hover:border-indigo-400 hover:bg-indigo-50/40 hover:shadow-md",
  ].join(" ");

  const canCompareDocuments =
    compareAnalyzed.length === MAX_COMPARE_FILES && !isComparing;

  const containerWidth =
    viewingHistoryEntry?.type === "compare" || mode === "compare"
      ? "max-w-6xl"
      : "max-w-2xl";

  return (
    <div className={`mx-auto w-full ${containerWidth}`}>
      <div className="mb-6 flex rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => switchMode("single")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            mode === "single"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          Single document
        </button>
        <button
          type="button"
          onClick={() => switchMode("compare")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            mode === "compare"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          Compare documents
        </button>
      </div>

      {!viewingHistoryEntry && (
        <ResponseLanguageSelect
          value={responseLanguage}
          onChange={handleResponseLanguageChange}
        />
      )}

      {viewingHistoryEntry ? (
        <HistoryDetailView
          entry={viewingHistoryEntry}
          onClose={handleCloseHistoryView}
        />
      ) : mode === "single" ? (
        <>
      <SmartTemplates
        selectedId={selectedTemplateId}
        onSelect={handleSelectTemplate}
      />

      <div className="mb-4">
        <h2 className="section-title">Upload your PDF</h2>
        <p className="section-subtitle">
          Drag and drop a file here or click to browse your device.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          🔒 Privacy-first document handling • No cloud PDF archive
          {" · "}
          <a
            href="/privacy"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Learn about Privacy &amp; Security
          </a>
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div
        className={zoneClasses}
        role="button"
        tabIndex={0}
        aria-label="Upload PDF file"
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile && !error ? (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 shadow-sm">
              <svg
                className="h-7 w-7 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
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
            <p className="max-w-full truncate px-4 text-base font-medium text-slate-900 sm:text-lg">
              {selectedFile.name}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {formatFileSize(selectedFile.size)}
            </p>
            <p className="mt-4 text-sm text-indigo-600">
              Click or drop to choose a different file
            </p>
          </>
        ) : (
          <>
            <div
              className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors shadow-sm ${
                error
                  ? "bg-red-100"
                  : "bg-slate-100 group-hover:bg-indigo-50"
              }`}
            >
              <svg
                className={`h-7 w-7 transition-colors ${
                  error
                    ? "text-red-500"
                    : "text-slate-400 group-hover:text-indigo-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
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

            <p className="text-base font-medium text-slate-700 sm:text-lg">
              Drag &amp; drop your PDF here
            </p>
            <p className="mt-3 text-sm text-slate-500">or click to choose a file</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="info-chip">PDF only</span>
              <span className="info-chip">Max 10 MB</span>
            </div>
          </>
        )}
      </div>

      {error && (
        <p
          className="mt-3 text-center text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {selectedFile && !error && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn-primary"
          >
            Analyze PDF
          </button>

          {isAnalyzing && (
            <p
              className="flex items-center gap-2 text-sm text-slate-600"
              role="status"
              aria-live="polite"
            >
              <svg
                className="h-4 w-4 animate-spin text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing document...
            </p>
          )}
        </div>
      )}

      {analysisError && (
        <p
          className="mt-4 text-center text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {analysisError}
        </p>
      )}

      {extractedText && previewText && (
        <section className="card mt-8 text-left">
          <h2 className="section-title">
            Document Content
          </h2>
          <p className="section-subtitle !mt-1 text-xs text-slate-400">
            Showing the first {PREVIEW_CHAR_LIMIT.toLocaleString()} characters
          </p>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-700">
            {previewText}
          </pre>

          <div className="mt-6 flex flex-col items-start gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="btn-primary"
            >
              Summarize with AI
            </button>

            {isSummarizing && (
              <p
                className="flex items-center gap-2 text-sm text-slate-600"
                role="status"
                aria-live="polite"
              >
                <svg
                  className="h-4 w-4 animate-spin text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating summary...
              </p>
            )}

            {summaryError && (
              <p className="text-sm text-red-600" role="alert" aria-live="polite">
                {summaryError}
              </p>
            )}
          </div>

          {hasAiSummary && aiSummary && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <h3 className="section-title">AI Summary</h3>
              <div className="mt-4 text-sm">
                <MarkdownContent content={aiSummary} />
              </div>
              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6">
                <ExportButtons
                  onExport={(format) =>
                    downloadSummaryExport({
                      summary: aiSummary,
                      fileName: summaryExportFileName,
                      format,
                    })
                  }
                />
              </div>
            </div>
          )}
        </section>
      )}

      {extractedText && (
        <DocumentChat
          turns={chatTurns}
          question={question}
          isAsking={isAsking}
          askError={askError}
          preparedTemplateTitle={
            getSmartTemplate(selectedTemplateId)?.title ?? null
          }
          documentFileName={summaryExportFileName}
          onQuestionChange={(value) => {
            setQuestion(value);
            // Editing the prompt keeps the custom-question workflow; clear highlight
            // only when the text no longer matches the selected template.
            const template = getSmartTemplate(selectedTemplateId);
            if (template && value.trim() !== template.prompt.trim()) {
              setSelectedTemplateId(null);
            }
          }}
          onAsk={handleAsk}
        />
      )}

        </>
      ) : (
        <>
          <div className="w-full max-w-6xl">
          <div className="mb-4">
            <h2 className="section-title">Upload two PDFs</h2>
            <p className="section-subtitle">
              Add exactly two documents to generate a structured comparison.
            </p>
          </div>

          <input
            ref={compareInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            onChange={handleCompareInputChange}
            aria-hidden="true"
            tabIndex={-1}
          />

          <div
            className={`${compareZoneClasses} w-full`}
            role="button"
            tabIndex={0}
            aria-label="Upload PDF files for comparison"
            onClick={openCompareFilePicker}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openCompareFilePicker();
              }
            }}
            onDragOver={handleCompareDragOver}
            onDragLeave={handleCompareDragLeave}
            onDrop={handleCompareDrop}
          >
            {compareFiles.length > 0 && !compareError ? (
              <div className="w-full space-y-3 px-4">
                {compareFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                  className="card-muted flex items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeCompareFile(index);
                      }}
                      className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {compareFiles.length < MAX_COMPARE_FILES && (
                  <p className="pt-2 text-center text-sm text-indigo-600">
                    Add {MAX_COMPARE_FILES - compareFiles.length} more PDF
                    {MAX_COMPARE_FILES - compareFiles.length === 1 ? "" : "s"}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 shadow-sm transition-colors group-hover:bg-indigo-50">
                  <svg
                    className="h-7 w-7 text-slate-400 transition-colors group-hover:text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
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
                <p className="text-base font-medium text-slate-700 sm:text-lg">
                  Drag &amp; drop 2 PDFs here
                </p>
                <p className="mt-3 text-sm text-slate-500">or click to choose files</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <span className="info-chip">2 PDFs required</span>
                  <span className="info-chip">Max 10 MB each</span>
                </div>
              </>
            )}
          </div>

          {compareError && (
            <p
              className="mt-3 text-center text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
              {compareError}
            </p>
          )}

          {compareFiles.length === MAX_COMPARE_FILES && !compareError && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleCompareAnalyze}
                disabled={isCompareAnalyzing}
                className="btn-primary"
              >
                Analyze Documents
              </button>

              {isCompareAnalyzing && (
                <p
                  className="flex items-center gap-2 text-sm text-slate-600"
                  role="status"
                  aria-live="polite"
                >
                  <svg
                    className="h-4 w-4 animate-spin text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Analyzing documents...
                </p>
              )}
            </div>
          )}

          {compareAnalysisError && (
            <p
              className="mt-4 text-center text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
              {compareAnalysisError}
            </p>
          )}

          {compareAnalyzed.length === MAX_COMPARE_FILES && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleCompareDocuments}
                disabled={!canCompareDocuments}
                className="btn-primary"
              >
                Compare Documents
              </button>

              {isComparing && (
                <p
                  className="flex items-center gap-2 text-sm text-slate-600"
                  role="status"
                  aria-live="polite"
                >
                  <svg
                    className="h-4 w-4 animate-spin text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Comparing documents...
                </p>
              )}
            </div>
          )}

          {compareResultError && (
            <p
              className="mt-4 text-center text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
              {compareResultError}
            </p>
          )}

          {compareResult && (
            <section className="card mt-8 w-full text-left sm:p-8 lg:p-10">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  Document Comparison
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
                  {compareAnalyzed.map((document) => document.name).join(" vs ")}
                </p>
              </div>

              <div className="mt-8 w-full space-y-8 border-t border-slate-100 pt-8 sm:space-y-10 sm:pt-10">
                <div className="card-muted w-full">
                  <h3 className="text-base font-semibold text-slate-900">
                    Executive Summary
                  </h3>
                  <div className="mt-4 text-sm leading-7 text-slate-700 sm:text-base">
                    <MarkdownContent content={compareResult.executiveSummary} />
                  </div>
                </div>

                <div className="card-muted w-full">
                  <h3 className="text-base font-semibold text-slate-900">
                    Similarities
                  </h3>
                  {compareResult.similarities.length > 0 ? (
                    <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-700 sm:text-base">
                      {compareResult.similarities.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                      No clear similarities were identified.
                    </p>
                  )}
                </div>

                <div className="card-muted w-full">
                  <h3 className="text-base font-semibold text-slate-900">
                    Differences
                  </h3>
                  {compareResult.differences.length > 0 ? (
                    <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-700 sm:text-base">
                      {compareResult.differences.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                      No meaningful differences were identified.
                    </p>
                  )}
                </div>

                <div className="card-muted w-full">
                  <h3 className="text-base font-semibold text-slate-900">
                    Contradictions
                  </h3>
                  {compareResult.contradictions.length > 0 ? (
                    <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-700 sm:text-base">
                      {compareResult.contradictions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                      No direct contradictions were found.
                    </p>
                  )}
                </div>

                <div className="card-muted w-full">
                  <h3 className="text-base font-semibold text-slate-900">
                    Key Facts
                  </h3>
                  {compareResult.keyFacts.length > 0 ? (
                    <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-700 sm:text-base">
                      {compareResult.keyFacts.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                      No key facts were identified.
                    </p>
                  )}
                </div>

                <div className="card-muted w-full">
                  <h3 className="text-base font-semibold text-slate-900">
                    Sources
                  </h3>
                  {compareResult.sources.length > 0 ? (
                    <ul className="mt-4 space-y-4">
                      {compareResult.sources.map((source) => (
                        <li
                          key={`${source.documentName}-${source.page}-${source.excerpt}`}
                          className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 shadow-sm sm:px-5"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                            <span className="text-sm font-semibold text-slate-900 sm:text-base">
                              {source.documentName}
                            </span>
                            <span className="badge-primary w-fit px-3 py-1 text-xs sm:text-sm">
                              Page {source.page}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                            <span className="font-medium text-slate-500">
                              Excerpt:{" "}
                            </span>
                            <span className="italic">
                              &ldquo;{source.excerpt}&rdquo;
                            </span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                      No supporting sources were identified in the documents.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6">
                <ExportButtons
                  onExport={(format) =>
                    downloadCompareExport({
                      result: compareResult,
                      documentNames: compareAnalyzed.map((document) => document.name),
                      format,
                    })
                  }
                />
              </div>
            </section>
          )}
          </div>
        </>
      )}

      <DocumentHistoryPanel
        refreshToken={historyRefreshToken}
        selectedId={selectedHistoryId}
        onSelect={handleSelectHistory}
        onDeleted={handleDeleteHistory}
      />
    </div>
  );
}
