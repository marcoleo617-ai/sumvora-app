export type SmartTemplateId =
  | "smart-summary"
  | "find-risks"
  | "explain-simply"
  | "action-items"
  | "key-questions"
  | "find-contradictions";

export type SmartTemplate = {
  id: SmartTemplateId;
  title: string;
  subtitle: string;
  /** Full prompt sent via the existing /api/ask flow when the user runs analysis. */
  prompt: string;
};

export const SMART_TEMPLATES: readonly SmartTemplate[] = [
  {
    id: "smart-summary",
    title: "Smart Summary",
    subtitle: "Get the key points in seconds.",
    prompt:
      "Generate a structured summary of the document including the main topic, key points, important facts, and conclusion.",
  },
  {
    id: "find-risks",
    title: "Find Risks",
    subtitle: "Spot risks, warnings & red flags.",
    prompt:
      "Analyze the document for risks, warnings, unusual clauses, inconsistencies, obligations, and potential red flags.",
  },
  {
    id: "explain-simply",
    title: "Explain Simply",
    subtitle: "Turn complex text into plain language.",
    prompt:
      "Explain the document in simple language that a non-expert can understand, while preserving important details.",
  },
  {
    id: "action-items",
    title: "Action Items",
    subtitle: "Extract tasks, deadlines & responsibilities.",
    prompt:
      "Identify all action items, deadlines, responsibilities, commitments, dates, and required follow-up actions in the document.",
  },
  {
    id: "key-questions",
    title: "Key Questions",
    subtitle: "Discover what you should ask next.",
    prompt:
      "Generate the most important questions a professional should ask after reading this document, especially missing information, unclear points, and areas requiring clarification.",
  },
  {
    id: "find-contradictions",
    title: "Find Contradictions",
    subtitle: "Detect conflicting or inconsistent information.",
    prompt:
      "Analyze the document for contradictions, conflicting statements, inconsistent dates, numbers, names, obligations, or claims.",
  },
] as const;

export function getSmartTemplate(
  id: string | null | undefined,
): SmartTemplate | null {
  if (!id) return null;
  return SMART_TEMPLATES.find((template) => template.id === id) ?? null;
}
