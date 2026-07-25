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
    <div className="card mb-6 px-4 py-4">
      <label
        htmlFor="response-language"
        className="block text-sm font-medium text-slate-800"
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
        className="select-field mt-2 w-full sm:w-auto"
      >
        {RESPONSE_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        AI summaries, answers, and comparisons will be written in this language.
        Source excerpts stay in the original document language.
      </p>
    </div>
  );
}

export { DEFAULT_RESPONSE_LANGUAGE };
