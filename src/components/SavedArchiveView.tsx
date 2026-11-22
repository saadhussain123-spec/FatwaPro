import React, { useMemo, useState } from "react";
import { ArrowUpRight, Search, Trash2 } from "lucide-react";
import type { AppLanguage, ResearchResult } from "../types/research";
import type { AppTranslations } from "../i18n/translations";

interface SavedArchiveViewProps {
  language: AppLanguage;
  t: AppTranslations;
  savedItems: ResearchResult[];
  onOpenItem: (item: ResearchResult) => void;
  onRemoveItem: (id: string) => void;
  onStartResearch: () => void;
}

export const SavedArchiveView: React.FC<SavedArchiveViewProps> = ({
  language,
  t,
  savedItems,
  onOpenItem,
  onRemoveItem,
  onStartResearch,
}) => {
  const [filterText, setFilterText] = useState("");

  const filtered = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return savedItems;
    return savedItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.query.toLowerCase().includes(q) ||
        item.rulingSummary.toLowerCase().includes(q)
    );
  }, [savedItems, filterText]);

  const locale =
    language === "de"
      ? "de-DE"
      : language === "ur"
        ? "ur-PK"
        : language === "ar"
          ? "ar-SA"
          : "en-US";

  return (
    <section className="py-10">
      <header className="flex flex-col gap-4 border-b border-[#E5DFD5] pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-[#2C2925]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#78350F] dark:text-[#D9B99B]">
            {t.archive.kicker}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl dark:text-[#EDEAE3]">
            {t.archive.title}
          </h1>
          <p className="mt-2 text-sm text-[#57534E] dark:text-[#B8B2A6]">
            {savedItems.length} {t.archive.storedSuffix}{" "}
            {savedItems.length === 1 ? t.archive.countSingular : t.archive.countPlural}
          </p>
        </div>

        {savedItems.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]"
            />
            <input
              type="search"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder={t.archive.filterPlaceholder}
              className="w-full rounded-md border border-[#E5DFD5] bg-[#FFFFFF] py-2 ps-9 pe-3 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#14532D] focus:outline-none dark:border-[#2C2925] dark:bg-[#1A1815] dark:text-[#EDEAE3]"
            />
          </div>
        )}
      </header>

      {savedItems.length === 0 ? (
        <div className="mt-10 rounded-lg border border-[#E5DFD5] bg-[#FFFFFF] p-8 text-center dark:border-[#2C2925] dark:bg-[#1A1815]">
          <h2 className="font-serif text-2xl font-semibold text-[#1C1917] dark:text-[#EDEAE3]">
            {t.archive.emptyTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#57534E] dark:text-[#B8B2A6]">
            {t.archive.emptyBody}
          </p>
          <button
            type="button"
            onClick={onStartResearch}
            className="mt-5 rounded-md bg-[#14532D] px-5 py-2.5 text-sm font-medium text-[#FBF9F5] transition-colors hover:bg-[#166534] dark:bg-[#86EFAC] dark:text-[#141311] cursor-pointer"
          >
            {t.archive.startBtn}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-sm text-[#78716C] dark:text-[#A8A29E]">
          {t.archive.noMatch} &ldquo;{filterText}&rdquo;.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-[#E5DFD5] border-b border-[#E5DFD5] dark:divide-[#2C2925] dark:border-[#2C2925]">
          {filtered.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleDateString(locale, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-start"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C] dark:text-[#A8A29E]">
                    <span className="font-medium text-[#78350F] dark:text-[#D9B99B]">
                      {item.scope === "islamqa"
                        ? t.search.scopeIslamqa
                        : item.scope === "web"
                          ? t.search.scopeWeb
                          : t.search.scopeAll}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{dateStr}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {item.quranReferences.length} {t.dossier.quranUnit} ·{" "}
                      {item.hadithReferences.length} {t.dossier.hadithUnit}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenItem(item)}
                    className="mt-1.5 text-start font-serif text-2xl font-semibold text-[#1C1917] transition-colors hover:text-[#14532D] hover:underline dark:text-[#EDEAE3] dark:hover:text-[#86EFAC] cursor-pointer"
                  >
                    {item.title}
                  </button>

                  <p className="mt-1.5 line-clamp-2 max-w-3xl text-sm leading-relaxed text-[#57534E] dark:text-[#B8B2A6]">
                    {item.rulingSummary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenItem(item)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#E5DFD5] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#1C1917] transition-colors hover:border-[#14532D] hover:text-[#14532D] dark:border-[#2C2925] dark:bg-[#1A1815] dark:text-[#EDEAE3] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{t.archive.openDossier}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    aria-label={item.title}
                    className="inline-flex items-center justify-center rounded-md border border-[#E5DFD5] p-1.5 text-[#78716C] transition-colors hover:border-[#9A3412] hover:text-[#9A3412] dark:border-[#2C2925] dark:text-[#A8A29E] dark:hover:text-[#FDBA74] cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
