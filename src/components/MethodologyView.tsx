import React from "react";
import type { AppTranslations } from "../i18n/translations";

interface MethodologyViewProps {
  t: AppTranslations;
  onStartResearch: () => void;
}

export const MethodologyView: React.FC<MethodologyViewProps> = ({
  t,
  onStartResearch,
}) => {
  return (
    <section className="py-10">
      <header className="border-b border-[#E5DFD5] pb-6 dark:border-[#2C2925]">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#78350F] dark:text-[#D9B99B]">
          {t.methodology.kicker}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl dark:text-[#EDEAE3]">
          {t.methodology.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#57534E] dark:text-[#B8B2A6]">
          {t.methodology.subtitle}
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {t.methodology.principles.map((p) => (
          <div
            key={p.num}
            className="rounded-lg border border-[#E5DFD5] bg-[#FFFFFF] p-6 dark:border-[#2C2925] dark:bg-[#1A1815]"
          >
            <span className="font-mono text-xs tabular-nums text-[#78350F] dark:text-[#D9B99B]">
              {p.num}.
            </span>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#1C1917] dark:text-[#EDEAE3]">
              {p.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#44403C] dark:text-[#C7C2B8]">
              {p.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-[#E5DFD5] bg-[#F7F4EE] p-6 dark:border-[#2C2925] dark:bg-[#1A1815]">
        <h2 className="font-serif text-xl font-semibold text-[#1C1917] dark:text-[#EDEAE3]">
          {t.methodology.advisoryTitle}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#44403C] dark:text-[#C7C2B8]">
          {t.methodology.advisoryBody}
        </p>
        <button
          type="button"
          onClick={onStartResearch}
          className="mt-4 rounded-md bg-[#14532D] px-4 py-2 text-xs font-medium text-[#FBF9F5] transition-colors hover:bg-[#166534] dark:bg-[#86EFAC] dark:text-[#141311] cursor-pointer"
        >
          {t.methodology.returnBtn}
        </button>
      </div>
    </section>
  );
};
