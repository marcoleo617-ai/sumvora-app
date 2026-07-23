"use client";

import {
  DEFAULT_RESPONSE_LANGUAGE,
  RESPONSE_LANGUAGES,
  type ResponseLanguage,
} from "@/lib/response-language";

type ResponseLanguageSelectProps = {
  value: ResponseLanguage;
  onChange: (language: ResponseLanguage) => void;
  disabled?: boolean;
};

export default function ResponseLanguageSelect({
  value,
  onChange,
  disabled = false,
}: ResponseLanguageSelectProps) {
  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <label
        htmlFor="response-language"
        className="block text-sm font-medium text-slate-700"
      >
        Response language
      </label>
      <select
        id="response-language"
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value as ResponseLanguage)
        }
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 sm:w-auto"
      >
        {RESPONSE_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-slate-500">
        AI summaries, answers, and comparisons will be written in this language.
        Source excerpts stay in the original document language.
      </p>
    </div>
  );
}

export { DEFAULT_RESPONSE_LANGUAGE };
