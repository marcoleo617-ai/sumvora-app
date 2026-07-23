export const RESPONSE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
] as const;

export type ResponseLanguage = (typeof RESPONSE_LANGUAGES)[number]["code"];

export const DEFAULT_RESPONSE_LANGUAGE: ResponseLanguage = "en";

const VALID_CODES = new Set<string>(RESPONSE_LANGUAGES.map((lang) => lang.code));

export function isResponseLanguage(value: unknown): value is ResponseLanguage {
  return typeof value === "string" && VALID_CODES.has(value);
}

export function parseResponseLanguage(value: unknown): ResponseLanguage {
  return isResponseLanguage(value) ? value : DEFAULT_RESPONSE_LANGUAGE;
}

export function getResponseLanguageLabel(code: ResponseLanguage): string {
  return (
    RESPONSE_LANGUAGES.find((lang) => lang.code === code)?.label ?? "English"
  );
}

export function appendLanguageInstruction(
  prompt: string,
  language: ResponseLanguage,
): string {
  if (language === "en") {
    return prompt;
  }

  return `${prompt}

Language:
- Write all AI-generated narrative text in Turkish (Türkçe).
- Keep source excerpts as direct quotes in the document's original language. Do not translate excerpts.`;
}

export const RESPONSE_LANGUAGE_STORAGE_KEY = "sumvora-response-language";
