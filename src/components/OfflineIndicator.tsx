import React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import type { AppTranslations } from "../i18n/translations";

interface OfflineIndicatorProps {
  t: AppTranslations;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ t }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-md border border-[#9A3412]/40 bg-[#FFF7ED] px-3.5 py-2 text-xs font-medium text-[#7C2D12] shadow-md dark:border-[#FDBA74]/30 dark:bg-[#2A1810] dark:text-[#FED7AA]"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{t.status.offlineBanner}</span>
    </div>
  );
};
