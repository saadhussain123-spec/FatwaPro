import React from "react";
import type { AppTranslations } from "../i18n/translations";

export type AppView = "research" | "topics" | "archive" | "methodology";

interface HeaderProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onNewInquiry: () => void;
  t: AppTranslations;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  onNewInquiry,
  t,
}) => {
  const navItems: Array<{ id: AppView; label: string }> = [
    { id: "research", label: t.nav.research },
    { id: "topics", label: t.nav.topics },
    { id: "archive", label: t.nav.archive },
    { id: "methodology", label: t.nav.methodology },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5DFD5] bg-[#FBF9F5]/95 backdrop-blur-sm dark:border-[#2C2925] dark:bg-[#141311]/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate("research")}
          className="font-serif text-2xl font-semibold tracking-tight text-[#1C1917] transition-colors hover:text-[#14532D] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#14532D] dark:text-[#EDEAE3] dark:hover:text-[#86EFAC] whitespace-nowrap shrink-0 cursor-pointer"
        >
          Fatwa Pro
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-1 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#14532D] ${
                  isActive
                    ? "text-[#14532D] dark:text-[#86EFAC]"
                    : "text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#EDEAE3]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-[1.5px] bg-[#14532D] dark:bg-[#86EFAC]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNewInquiry}
            className="rounded-md bg-[#14532D] px-4 py-2 text-xs font-medium text-[#FBF9F5] transition-colors duration-150 hover:bg-[#166534] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D] dark:bg-[#86EFAC] dark:text-[#141311] dark:hover:bg-[#BBF7D0] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.nav.newInquiry}
          </button>
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <nav
        aria-label="Mobile navigation"
        className="flex md:hidden items-center justify-between gap-4 border-t border-[#EBE6DF] px-4 py-2 dark:border-[#24221E] overflow-x-auto"
      >
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`text-xs font-medium whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                isActive
                  ? "text-[#14532D] underline underline-offset-4 dark:text-[#86EFAC]"
                  : "text-[#57534E] dark:text-[#A8A29E]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
