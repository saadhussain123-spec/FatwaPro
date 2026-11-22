import React from "react";
import { ArrowRight, Loader2, Mic, Moon, Search, Square, Sun } from "lucide-react";
import type {
  AppLanguage,
  ResearchDepth,
  SearchScope,
} from "../types/research";
import {
  LOCALIZED_QUICK_INQUIRIES,
  type AppTranslations,
} from "../i18n/translations";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { PWAInstallButton } from "./PWAInstallButton";

interface SearchDeskProps {
  language: AppLanguage;
  t: AppTranslations;
  query: string;
  onQueryChange: (value: string) => void;
  scope: SearchScope;
  onScopeChange: (scope: SearchScope) => void;
  depth: ResearchDepth;
  onDepthChange: (depth: ResearchDepth) => void;
  isLoading: boolean;
  onSubmit: (overrideQuery?: string) => void;
  compact?: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const SearchDesk: React.FC<SearchDeskProps> = ({
  language,
  t,
  query,
  onQueryChange,
  scope,
  onScopeChange,
  depth,
  onDepthChange,
  isLoading,
  onSubmit,
  compact = false,
  isDark,
  onToggleTheme,
  inputRef,
}) => {
  const {
    isRecording,
    isTranscribing,
    elapsedSeconds,
    voiceError,
    clearVoiceError,
    toggleRecording,
  } = useVoiceInput({
    language,
    t,
    onTranscript: (spokenText) => {
      const trimmedCurrent = query.trim();
      const updated = trimmedCurrent
        ? `${trimmedCurrent} ${spokenText}`
        : spokenText;
      onQueryChange(updated);
      setTimeout(() => {
        inputRef?.current?.focus();
      }, 30);
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (query.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  const scopeOptions: Array<{ id: SearchScope; label: string }> = [
    { id: "all", label: t.search.scopeAll },
    { id: "islamqa", label: t.search.scopeIslamqa },
    { id: "web", label: t.search.scopeWeb },
  ];

  const depthOptions: Array<{ id: ResearchDepth; label: string }> = [
    { id: "comprehensive", label: t.search.depthComprehensive },
    { id: "concise", label: t.search.depthConcise },
  ];

  const quickInquiries = LOCALIZED_QUICK_INQUIRIES[language];

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins}:${String(rem).padStart(2, "0")}`;
  };

  return (
    <section
      aria-label={t.search.heroTitle}
      className={
        compact
          ? "border-b border-[#E5DFD5] pb-8 dark:border-[#2C2925]"
          : "py-6 lg:py-10"
      }
    >
      {!compact && (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#78350F] dark:text-[#D9B99B]">
              {t.search.kicker}
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.12] tracking-tight text-[#1C1917] sm:text-5xl text-balance dark:text-[#EDEAE3]">
              {t.search.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[#57534E] dark:text-[#B8B2A6]">
              {t.search.heroSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start shrink-0">
            <PWAInstallButton t={t} />
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? t.toolbar.lightTheme : t.toolbar.darkTheme}
              className="inline-flex items-center gap-2 rounded-md border border-[#E5DFD5] bg-[#F7F4EE] px-3.5 py-2 text-xs font-medium text-[#44403C] transition-colors hover:border-[#D6CEBE] hover:text-[#1C1917] dark:border-[#2C2925] dark:bg-[#1C1A17] dark:text-[#D6D3CD] dark:hover:border-[#44403C] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isDark ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
              <span>{isDark ? t.toolbar.lightTheme : t.toolbar.darkTheme}</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim() && !isLoading) onSubmit();
        }}
        className={`rounded-lg border bg-[#FFFFFF] p-4 sm:p-5 transition-colors dark:bg-[#1A1815] ${
          isRecording
            ? "border-[#9A3412] dark:border-[#FDBA74]"
            : "border-[#E5DFD5] dark:border-[#2C2925]"
        }`}
      >
        <div className="flex flex-col gap-3">
          <label htmlFor="research-query-input" className="sr-only">
            {t.search.placeholder}
          </label>
          <div className="flex items-start gap-3">
            <Search
              aria-hidden="true"
              className="mt-1.5 h-5 w-5 shrink-0 text-[#78716C] dark:text-[#A8A29E]"
            />
            <textarea
              ref={inputRef}
              id="research-query-input"
              rows={compact ? 2 : 3}
              value={query}
              onChange={(e) => {
                clearVoiceError();
                onQueryChange(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t.search.placeholder}
              className="w-full resize-none bg-transparent text-[15.5px] leading-relaxed text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none dark:text-[#EDEAE3] dark:placeholder:text-[#78716C]"
            />

            {/* Microphone Voice Search Button */}
            <button
              type="button"
              onClick={toggleRecording}
              disabled={isLoading || isTranscribing}
              aria-label={isRecording ? t.search.micStop : t.search.micStart}
              title={isRecording ? t.search.micStop : t.search.micStart}
              className={`mt-0.5 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 ${
                isRecording
                  ? "border-[#9A3412] bg-[#9A3412] text-[#FBF9F5] hover:bg-[#7C2D12] dark:border-[#FDBA74] dark:bg-[#FDBA74] dark:text-[#141311]"
                  : "border-[#E5DFD5] bg-[#F7F4EE] text-[#44403C] hover:border-[#14532D] hover:text-[#14532D] dark:border-[#2C2925] dark:bg-[#24211D] dark:text-[#D6D3CD] dark:hover:border-[#86EFAC] dark:hover:text-[#86EFAC]"
              }`}
            >
              {isTranscribing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : isRecording ? (
                <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              ) : (
                <Mic className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline font-mono text-[11px] uppercase">
                {isRecording
                  ? formatTimer(elapsedSeconds)
                  : language.toUpperCase()}
              </span>
            </button>
          </div>

          {/* Live Voice Status / Error Strip */}
          {(isRecording || isTranscribing || voiceError) && (
            <div
              role={voiceError ? "alert" : "status"}
              aria-live="polite"
              className={`flex items-center justify-between gap-3 rounded-md px-3 py-2 text-xs ${
                voiceError
                  ? "border border-[#9A3412]/30 bg-[#FFF7ED] text-[#7C2D12] dark:border-[#FDBA74]/30 dark:bg-[#2A1810] dark:text-[#FED7AA]"
                  : isRecording
                    ? "border border-[#9A3412]/25 bg-[#FFF7ED] text-[#9A3412] dark:border-[#FDBA74]/25 dark:bg-[#241B15] dark:text-[#FDBA74]"
                    : "border border-[#14532D]/20 bg-[#F4F0E8] text-[#14532D] dark:border-[#86EFAC]/20 dark:bg-[#24211D] dark:text-[#86EFAC]"
              }`}
            >
              <div className="flex items-center gap-2">
                {isTranscribing && (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />
                )}
                {isRecording && (
                  <Mic className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
                <span>
                  {voiceError
                    ? voiceError
                    : isRecording
                      ? `${t.search.micRecording} (${formatTimer(elapsedSeconds)})`
                      : t.search.micTranscribing}
                </span>
              </div>
              {isRecording && (
                <button
                  type="button"
                  onClick={toggleRecording}
                  className="rounded border border-current px-2 py-0.5 text-[11px] font-medium cursor-pointer whitespace-nowrap shrink-0"
                >
                  {t.search.micStop}
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0ECE3] pt-3.5 dark:border-[#26231F]">
            <div className="flex flex-wrap items-center gap-3">
              {/* Source Scope Segmented Control */}
              <div
                role="group"
                aria-label={t.search.scopeAll}
                className="flex items-center gap-1 rounded-md bg-[#F4F0E8] p-1 dark:bg-[#24211D]"
              >
                {scopeOptions.map((option) => {
                  const active = scope === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onScopeChange(option.id)}
                      className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? "bg-[#FFFFFF] text-[#14532D] shadow-xs dark:bg-[#141311] dark:text-[#86EFAC]"
                          : "text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#EDEAE3]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {/* Depth Segmented Control */}
              <div
                role="group"
                aria-label={t.search.depthComprehensive}
                className="flex items-center gap-1 rounded-md bg-[#F4F0E8] p-1 dark:bg-[#24211D]"
              >
                {depthOptions.map((option) => {
                  const active = depth === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onDepthChange(option.id)}
                      className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? "bg-[#FFFFFF] text-[#1C1917] shadow-xs dark:bg-[#141311] dark:text-[#EDEAE3]"
                          : "text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#EDEAE3]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {compact && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  aria-label={
                    isDark ? t.toolbar.lightTheme : t.toolbar.darkTheme
                  }
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#E5DFD5] px-2.5 py-1.5 text-xs font-medium text-[#57534E] transition-colors hover:text-[#1C1917] dark:border-[#2C2925] dark:text-[#A8A29E] dark:hover:text-[#EDEAE3] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isDark ? (
                    <Sun className="h-3.5 w-3.5" />
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {isDark ? t.toolbar.lightShort : t.toolbar.darkShort}
                  </span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isTranscribing || !query.trim()}
              className="inline-flex items-center gap-2 rounded-md bg-[#14532D] px-5 py-2.5 text-sm font-medium text-[#FBF9F5] transition-colors duration-150 hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#86EFAC] dark:text-[#141311] dark:hover:bg-[#BBF7D0] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>
                {isLoading ? t.search.submitLoading : t.search.submitIdle}
              </span>
              <ArrowRight
                className="h-4 w-4 rtl:rotate-180"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </form>

      {/* Curated Inquiry Prompts (empty-state workspace) */}
      {!compact && (
        <div className="mt-8 border-t border-[#E5DFD5] pt-6 dark:border-[#2C2925]">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#78716C] dark:text-[#A8A29E]">
            {t.search.suggestedHeading}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            {quickInquiries.map((sample, idx) => (
              <button
                key={sample}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  onQueryChange(sample);
                  onSubmit(sample);
                }}
                className="group flex items-baseline gap-3 border-b border-[#EFECE4] py-2.5 text-start text-sm text-[#44403C] transition-colors hover:text-[#14532D] disabled:opacity-50 dark:border-[#24221E] dark:text-[#C7C2B8] dark:hover:text-[#86EFAC] cursor-pointer"
              >
                <span className="font-mono text-xs tabular-nums text-[#78350F] dark:text-[#D9B99B]">
                  0{idx + 1}.
                </span>
                <span className="flex-1 leading-snug group-hover:underline group-hover:underline-offset-4">
                  {sample}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
