import React, { useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import type { AppTranslations } from "../i18n/translations";

interface PWAInstallButtonProps {
  t: AppTranslations;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ t }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 rounded-md border border-[#14532D] bg-[#14532D] px-3.5 py-2 text-xs font-medium text-[#FBF9F5] transition-colors hover:bg-[#166534] dark:border-[#86EFAC] dark:bg-[#86EFAC] dark:text-[#141311] dark:hover:bg-[#BBF7D0] whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{t.toolbar.installApp}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#E5DFD5] bg-[#F7F4EE] px-3.5 py-2 text-xs font-medium text-[#44403C] transition-colors hover:border-[#D6CEBE] hover:text-[#1C1917] dark:border-[#2C2925] dark:bg-[#1C1A17] dark:text-[#D6D3CD] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t.toolbar.installIos}</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <div className="w-full max-w-sm rounded-lg border border-[#E5DFD5] bg-[#FBF9F5] p-6 shadow-xl dark:border-[#2C2925] dark:bg-[#1A1815]">
              <div className="flex items-start justify-between gap-4">
                <h3
                  id="ios-install-title"
                  className="font-serif text-xl font-semibold text-[#1C1917] dark:text-[#EDEAE3]"
                >
                  {t.toolbar.iosModalTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label={t.toolbar.done}
                  className="rounded p-1 text-[#78716C] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#EDEAE3] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#44403C] dark:text-[#C7C2B8]">
                <li>
                  <span className="font-mono text-xs text-[#78350F] dark:text-[#D9B99B]">
                    01.
                  </span>{" "}
                  {t.toolbar.iosStep1}
                </li>
                <li>
                  <span className="font-mono text-xs text-[#78350F] dark:text-[#D9B99B]">
                    02.
                  </span>{" "}
                  {t.toolbar.iosStep2}
                </li>
                <li>
                  <span className="font-mono text-xs text-[#78350F] dark:text-[#D9B99B]">
                    03.
                  </span>{" "}
                  {t.toolbar.iosStep3}
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-md bg-[#14532D] py-2 text-xs font-medium text-[#FBF9F5] transition-colors hover:bg-[#166534] dark:bg-[#86EFAC] dark:text-[#141311] cursor-pointer"
              >
                {t.toolbar.done}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
