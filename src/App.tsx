import { useEffect, useRef, useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { Header, type AppView } from "./components/Header";
import { SearchDesk } from "./components/SearchDesk";
import { ResearchDossier } from "./components/ResearchDossier";
import { FiqhIndexView } from "./components/FiqhIndexView";
import { SavedArchiveView } from "./components/SavedArchiveView";
import { MethodologyView } from "./components/MethodologyView";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { TRANSLATIONS } from "./i18n/translations";
import type {
  AppLanguage,
  InspectedSourceResult,
  ResearchDepth,
  ResearchResult,
  ResearchThreadItem,
  SearchScope,
} from "./types/research";

const SAVED_STORAGE_KEY = "almizan_saved_research_v1";
const THEME_STORAGE_KEY = "almizan_theme_v1";
const LANG_STORAGE_KEY = "fatwapro_lang_v2";

const LANGUAGE_OPTIONS: Array<{
  id: AppLanguage;
  nativeLabel: string;
  dir: "ltr" | "rtl";
}> = [
  { id: "de", nativeLabel: "Deutsch", dir: "ltr" },
  { id: "en", nativeLabel: "English", dir: "ltr" },
  { id: "ur", nativeLabel: "اردو", dir: "rtl" },
  { id: "ar", nativeLabel: "العربية", dir: "rtl" },
];

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("research");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [depth, setDepth] = useState<ResearchDepth>("comprehensive");

  const [language, setLanguage] = useState<AppLanguage>(() => {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (
        stored === "de" ||
        stored === "en" ||
        stored === "ur" ||
        stored === "ar"
      ) {
        return stored;
      }
    } catch {
      // Ignore storage read error
    }
    return "de";
  });

  const [thread, setThread] = useState<ResearchThreadItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const [inspectedMap, setInspectedMap] = useState<
    Record<string, InspectedSourceResult>
  >({});

  const [savedItems, setSavedItems] = useState<ResearchResult[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as ResearchResult[]) : [];
      }
    } catch {
      // Ignore storage read error
    }
    return [];
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === "dark";
    } catch {
      return false;
    }
  });

  const searchInputRef = useRef<HTMLTextAreaElement | null>(null);
  const translationReqIdRef = useRef(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // Ignore storage write error
    }
  }, [isDark]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir =
      language === "ur" || language === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      // Ignore storage write error
    }
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedItems));
    } catch {
      // Ignore storage write error
    }
  }, [savedItems]);

  const t = TRANSLATIONS[language];
  const activeResult = thread[activeIndex]?.result ?? null;

  const translateThreadEntry = async (
    targetThread: ResearchThreadItem[],
    targetIdx: number,
    targetLang: AppLanguage,
    currentInspectedMap: Record<string, InspectedSourceResult>
  ) => {
    const entry = targetThread[targetIdx];
    if (!entry) return;

    const cachedVariant = entry.variants?.[targetLang];
    const sourceUris = new Set(
      entry.result.groundedSources.map((s) => s.uri)
    );
    const untranslatedExtracts = Object.values(currentInspectedMap).filter(
      (ex) => sourceUris.has(ex.url) && ex.language !== targetLang
    );

    const knownQueries = new Set<string>([
      entry.query.trim(),
      entry.result.query.trim(),
      ...Object.values(entry.variants ?? {}).map((v) => v?.query?.trim() ?? ""),
    ]);

    if (cachedVariant && untranslatedExtracts.length === 0) {
      setThread((prev) =>
        prev.map((item, idx) =>
          idx === targetIdx
            ? { ...item, query: cachedVariant.query, result: cachedVariant }
            : item
        )
      );
      setQuery((prevQ) =>
        knownQueries.has(prevQ.trim()) ? cachedVariant.query : prevQ
      );
      setTranslateError(null);
      setIsTranslating(false);
      return;
    }

    const baseResult = cachedVariant ?? entry.result;
    const baseLang = baseResult.language ?? "en";
    if (baseLang === targetLang && untranslatedExtracts.length === 0) {
      setTranslateError(null);
      setIsTranslating(false);
      return;
    }

    const reqId = ++translationReqIdRef.current;
    setIsTranslating(true);
    setTranslateError(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: baseResult,
          targetLanguage: targetLang,
          inspectedExtracts: untranslatedExtracts,
        }),
      });

      const data = await response.json();
      if (translationReqIdRef.current !== reqId) return;

      if (!response.ok) {
        throw new Error(data.error || TRANSLATIONS[targetLang].status.translateError);
      }

      const translatedResult = data.result as ResearchResult;
      const translatedExtracts = Array.isArray(data.inspectedExtracts)
        ? (data.inspectedExtracts as InspectedSourceResult[])
        : [];

      setThread((prev) =>
        prev.map((item) => {
          if (item.result.id !== entry.result.id) return item;
          const origLang = item.result.language ?? "en";
          return {
            query: translatedResult.query,
            result: translatedResult,
            variants: {
              ...(item.variants ?? {}),
              [origLang]: item.result,
              [targetLang]: translatedResult,
            },
          };
        })
      );

      setQuery((prevQ) =>
        knownQueries.has(prevQ.trim()) ? translatedResult.query : prevQ
      );

      if (translatedExtracts.length > 0) {
        setInspectedMap((prev) => {
          const next = { ...prev };
          for (const ex of translatedExtracts) {
            next[ex.url] = ex;
          }
          return next;
        });
      }
    } catch (err: unknown) {
      if (translationReqIdRef.current !== reqId) return;
      const msg =
        err instanceof Error
          ? err.message
          : TRANSLATIONS[targetLang].status.translateError;
      setTranslateError(msg);
    } finally {
      if (translationReqIdRef.current === reqId) {
        setIsTranslating(false);
      }
    }
  };

  const handleLanguageChange = (nextLang: AppLanguage) => {
    setLanguage(nextLang);
    setTranslateError(null);
    if (!isLoading && thread[activeIndex]) {
      void translateThreadEntry(thread, activeIndex, nextLang, inspectedMap);
    }
  };

  const handleSelectThreadIndex = (idx: number) => {
    setActiveIndex(idx);
    setTranslateError(null);
    const targetEntry = thread[idx];
    if (targetEntry) {
      setQuery(targetEntry.query);
      if ((targetEntry.result.language ?? "en") !== language) {
        void translateThreadEntry(thread, idx, language, inspectedMap);
      }
    }
  };

  const executeResearch = async (
    targetQuery: string,
    isFollowUp: boolean = false
  ) => {
    const trimmed = targetQuery.trim();
    if (!trimmed) return;

    translationReqIdRef.current += 1;
    setIsTranslating(false);
    setTranslateError(null);
    setQuery(trimmed);
    setIsLoading(true);
    setErrorMessage(null);
    setActiveView("research");

    const priorContext =
      isFollowUp && activeResult
        ? `Previous question: "${activeResult.query}". Summary ruling given: "${activeResult.rulingSummary}".`
        : undefined;

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          scope,
          depth,
          language,
          priorContext,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to complete scholarly search.");
      }

      const result = data as ResearchResult;
      const resultLang = result.language ?? language;
      const newItem: ResearchThreadItem = {
        query: result.query || trimmed,
        result,
        variants: { [resultLang]: result },
      };

      if (isFollowUp) {
        setThread((prev) => {
          const next = [...prev, newItem];
          setActiveIndex(next.length - 1);
          return next;
        });
      } else {
        setThread([newItem]);
        setActiveIndex(0);
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during search.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewInquiry = () => {
    translationReqIdRef.current += 1;
    setIsTranslating(false);
    setTranslateError(null);
    setActiveView("research");
    setThread([]);
    setActiveIndex(0);
    setQuery("");
    setErrorMessage(null);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleToggleSave = (item: ResearchResult) => {
    setSavedItems((prev) => {
      const exists = prev.some((s) => s.id === item.id);
      if (exists) {
        return prev.filter((s) => s.id !== item.id);
      }
      return [item, ...prev];
    });
  };

  const handleRemoveSaved = (id: string) => {
    setSavedItems((prev) => prev.filter((s) => s.id !== id));
  };

  const handleOpenSaved = (item: ResearchResult) => {
    const itemLang = item.language ?? "en";
    const initialEntry: ResearchThreadItem = {
      query: item.query,
      result: item,
      variants: { [itemLang]: item },
    };
    const nextThread = [initialEntry];
    setThread(nextThread);
    setActiveIndex(0);
    setQuery(item.query);
    setScope(item.scope);
    setDepth(item.depth);
    setErrorMessage(null);
    setTranslateError(null);
    setActiveView("research");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (itemLang !== language) {
      void translateThreadEntry(nextThread, 0, language, inspectedMap);
    }
  };

  const handleSelectTopicInquiry = (inquiry: string) => {
    setQuery(inquiry);
    executeResearch(inquiry, false);
  };

  const handleInspectedSource = (uri: string, data: InspectedSourceResult) => {
    setInspectedMap((prev) => ({
      ...prev,
      [uri]: { ...data, language: data.language ?? language },
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917] dark:bg-[#141311] dark:text-[#EDEAE3]">
      <Header
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onNewInquiry={handleNewInquiry}
        t={t}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 lg:px-8">
        {/* Compact Workspace Language Utility Bar (keeps top Header strictly 3 zones) */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-b border-[#EFECE4] py-2.5 dark:border-[#24221E]">
          <div className="flex items-center gap-2 text-xs text-[#78716C] dark:text-[#A8A29E]">
            <Languages className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.toolbar.languageLabel}:</span>
          </div>
          <div
            role="group"
            aria-label={t.toolbar.languageLabel}
            className="flex items-center gap-1 rounded-md bg-[#F4F0E8] p-1 dark:bg-[#24211D]"
          >
            {LANGUAGE_OPTIONS.map((opt) => {
              const active = language === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  lang={opt.id}
                  dir={opt.dir}
                  aria-pressed={active}
                  onClick={() => handleLanguageChange(opt.id)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? "bg-[#FFFFFF] text-[#14532D] shadow-xs dark:bg-[#141311] dark:text-[#86EFAC]"
                      : "text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#EDEAE3]"
                  }`}
                >
                  {opt.nativeLabel}
                </button>
              );
            })}
          </div>
        </div>

        {activeView === "research" && (
          <>
            <SearchDesk
              language={language}
              t={t}
              query={query}
              onQueryChange={setQuery}
              scope={scope}
              onScopeChange={setScope}
              depth={depth}
              onDepthChange={setDepth}
              isLoading={isLoading}
              onSubmit={(override) => executeResearch(override ?? query, false)}
              compact={Boolean(activeResult) || isLoading}
              isDark={isDark}
              onToggleTheme={() => setIsDark((d) => !d)}
              inputRef={searchInputRef}
            />

            {/* Research Session Breadcrumbs for multi-turn follow-ups */}
            {thread.length > 1 && !isLoading && (
              <div
                aria-label={t.status.sessionThread}
                className="mt-5 flex flex-wrap items-center gap-2 border-b border-[#EFECE4] pb-4 text-xs dark:border-[#24221E]"
              >
                <span className="text-[#78716C] dark:text-[#A8A29E]">
                  {t.status.sessionThread}
                </span>
                {thread.map((entry, idx) => (
                  <button
                    key={entry.result.id}
                    type="button"
                    onClick={() => handleSelectThreadIndex(idx)}
                    className={`rounded px-2.5 py-1 text-start transition-colors cursor-pointer ${
                      idx === activeIndex
                        ? "bg-[#14532D] font-medium text-[#FBF9F5] dark:bg-[#86EFAC] dark:text-[#141311]"
                        : "bg-[#F4F0E8] text-[#44403C] hover:text-[#1C1917] dark:bg-[#24211D] dark:text-[#C7C2B8]"
                    }`}
                  >
                    <span className="font-mono tabular-nums me-1">
                      0{idx + 1}.
                    </span>
                    <span className="inline-block max-w-[200px] truncate align-bottom">
                      {entry.query}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Translating Dossier Notice */}
            {isTranslating && !isLoading && (
              <div
                role="status"
                aria-live="polite"
                className="mt-6 flex items-center gap-2.5 rounded-lg border border-[#14532D]/25 bg-[#F4F0E8] px-4 py-3 text-sm font-medium text-[#14532D] dark:border-[#86EFAC]/25 dark:bg-[#1A1815] dark:text-[#86EFAC]"
              >
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
                <span>{t.status.translatingMessage}</span>
              </div>
            )}

            {/* Translation Error Notice */}
            {translateError && !isTranslating && !isLoading && (
              <div
                role="alert"
                className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#9A3412]/30 bg-[#FFF7ED] px-4 py-3 text-xs text-[#7C2D12] dark:border-[#FDBA74]/30 dark:bg-[#2A1810] dark:text-[#FED7AA]"
              >
                <span>{translateError}</span>
                <button
                  type="button"
                  onClick={() =>
                    translateThreadEntry(
                      thread,
                      activeIndex,
                      language,
                      inspectedMap
                    )
                  }
                  className="rounded border border-[#9A3412]/40 px-2.5 py-1 font-medium hover:bg-[#FFEDD5] dark:hover:bg-[#3B2116] cursor-pointer"
                >
                  {t.status.retry}
                </button>
              </div>
            )}

            {/* Error State */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-6 rounded-lg border border-[#9A3412]/30 bg-[#FFF7ED] p-5 text-sm text-[#7C2D12] dark:border-[#FDBA74]/30 dark:bg-[#2A1810] dark:text-[#FED7AA]"
              >
                <p className="font-semibold">{t.status.errorTitle}</p>
                <p className="mt-1">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => executeResearch(query, false)}
                  className="mt-3 rounded border border-[#9A3412]/40 px-3 py-1.5 text-xs font-medium hover:bg-[#FFEDD5] dark:hover:bg-[#3B2116] cursor-pointer"
                >
                  {t.status.retry}
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <div
                aria-live="polite"
                aria-label={t.status.loadingMessage}
                className="py-10"
              >
                <p className="text-sm font-medium text-[#14532D] dark:text-[#86EFAC]">
                  {t.status.loadingMessage}
                </p>
                <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
                  <div className="lg:col-span-7 space-y-5 animate-pulse">
                    <div className="h-8 w-3/4 rounded bg-[#EBE6DF] dark:bg-[#24211D]" />
                    <div className="h-24 w-full rounded bg-[#EBE6DF] dark:bg-[#24211D]" />
                    <div className="h-4 w-full rounded bg-[#EBE6DF] dark:bg-[#24211D]" />
                    <div className="h-4 w-11/12 rounded bg-[#EBE6DF] dark:bg-[#24211D]" />
                    <div className="h-4 w-5/6 rounded bg-[#EBE6DF] dark:bg-[#24211D]" />
                  </div>
                  <div className="lg:col-span-5 space-y-5 animate-pulse">
                    <div className="h-44 w-full rounded-lg bg-[#EBE6DF] dark:bg-[#24211D]" />
                    <div className="h-44 w-full rounded-lg bg-[#EBE6DF] dark:bg-[#24211D]" />
                  </div>
                </div>
              </div>
            )}

            {/* Active Result Dossier */}
            {!isLoading && activeResult && (
              <div className={isTranslating ? "opacity-60 transition-opacity" : ""}>
                <ResearchDossier
                  language={language}
                  t={t}
                  result={activeResult}
                  isSaved={savedItems.some((s) => s.id === activeResult.id)}
                  onToggleSave={handleToggleSave}
                  onRunFollowUp={(followUpQ) => executeResearch(followUpQ, true)}
                  isLoadingFollowUp={isLoading}
                  inspectedMap={inspectedMap}
                  onInspectedSource={handleInspectedSource}
                />
              </div>
            )}
          </>
        )}

        {activeView === "topics" && (
          <FiqhIndexView
            language={language}
            t={t}
            onSelectInquiry={handleSelectTopicInquiry}
          />
        )}

        {activeView === "archive" && (
          <SavedArchiveView
            language={language}
            t={t}
            savedItems={savedItems}
            onOpenItem={handleOpenSaved}
            onRemoveItem={handleRemoveSaved}
            onStartResearch={() => setActiveView("research")}
          />
        )}

        {activeView === "methodology" && (
          <MethodologyView
            t={t}
            onStartResearch={() => setActiveView("research")}
          />
        )}
      </main>

      <footer className="mt-16 border-t border-[#E5DFD5] bg-[#F7F4EE] py-6 dark:border-[#2C2925] dark:bg-[#11100E]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 text-xs text-[#78716C] sm:flex-row sm:items-center sm:px-6 lg:px-8 dark:text-[#A8A29E]">
          <p>{t.footer.left}</p>
          <p>
            {t.footer.developedBy}{" "}
            <span className="font-medium text-[#1C1917] dark:text-[#EDEAE3]">
              {t.footer.developerName}
            </span>{" "}
            · {t.footer.rightSuffix}
          </p>
        </div>
      </footer>
      <OfflineIndicator t={t} />
    </div>
  );
}
