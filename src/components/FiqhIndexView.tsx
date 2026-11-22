import React from "react";
import { ArrowRight } from "lucide-react";
import type { AppLanguage } from "../types/research";
import {
  LOCALIZED_FIQH_CHAPTERS,
  type AppTranslations,
} from "../i18n/translations";

interface FiqhIndexViewProps {
  language: AppLanguage;
  t: AppTranslations;
  onSelectInquiry: (inquiry: string) => void;
}

export const FiqhIndexView: React.FC<FiqhIndexViewProps> = ({
  language,
  t,
  onSelectInquiry,
}) => {
  const chapters = LOCALIZED_FIQH_CHAPTERS[language];

  return (
    <section className="py-10">
      <header className="border-b border-[#E5DFD5] pb-6 dark:border-[#2C2925]">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#78350F] dark:text-[#D9B99B]">
          {t.topics.kicker}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl text-balance dark:text-[#EDEAE3]">
          {t.topics.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#57534E] dark:text-[#B8B2A6]">
          {t.topics.subtitle}
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="flex flex-col justify-between rounded-lg border border-[#E5DFD5] bg-[#FFFFFF] p-6 dark:border-[#2C2925] dark:bg-[#1A1815]"
          >
            <div>
              <div className="flex items-baseline justify-between gap-4 border-b border-[#EFECE4] pb-4 dark:border-[#24221E]">
                <div>
                  <span className="font-mono text-xs tabular-nums text-[#78350F] dark:text-[#D9B99B]">
                    {chapter.number}.
                  </span>
                  <h2 className="mt-1 font-serif text-2xl font-semibold text-[#1C1917] dark:text-[#EDEAE3]">
                    {chapter.title}
                  </h2>
                </div>
                <span
                  dir="rtl"
                  lang="ar"
                  className="font-arabic text-xl text-[#14532D] dark:text-[#86EFAC]"
                >
                  {chapter.arabicTitle}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#57534E] dark:text-[#B8B2A6]">
                {chapter.description}
              </p>

              <ul className="mt-5 divide-y divide-[#EFECE4] dark:divide-[#24221E]">
                {chapter.inquiries.map((inquiry) => (
                  <li key={inquiry}>
                    <button
                      type="button"
                      onClick={() => onSelectInquiry(inquiry)}
                      className="group flex w-full items-center justify-between gap-3 py-3 text-start text-sm text-[#292524] transition-colors hover:text-[#14532D] dark:text-[#D6D3CD] dark:hover:text-[#86EFAC] cursor-pointer"
                    >
                      <span className="leading-snug group-hover:underline group-hover:underline-offset-4">
                        {inquiry}
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 shrink-0 text-[#78716C] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#14532D] rtl:rotate-180 dark:group-hover:text-[#86EFAC]"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
