import React, { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  FileSearch,
  Send,
} from "lucide-react";
import type {
  AppLanguage,
  GroundedSource,
  InspectedSourceResult,
  ResearchResult,
} from "../types/research";
import type { AppTranslations } from "../i18n/translations";
import {
  getFatwaSourceLink,
  getQuranComLink,
  getSunnahComLink,
} from "../utils/sourceLinks";

interface ResearchDossierProps {
  language: AppLanguage;
  t: AppTranslations;
  result: ResearchResult;
  isSaved: boolean;
  onToggleSave: (result: ResearchResult) => void;
  onRunFollowUp: (question: string) => void;
  isLoadingFollowUp: boolean;
  inspectedMap: Record<string, InspectedSourceResult>;
  onInspectedSource: (uri: string, data: InspectedSourceResult) => void;
}

export const ResearchDossier: React.FC<ResearchDossierProps> = ({
  language,
  t,
  result,
  isSaved,
  onToggleSave,
  onRunFollowUp,
  isLoadingFollowUp,
  inspectedMap,
  onInspectedSource,
}) => {
  const [copied, setCopied] = useState(false);
  const [followUpText, setFollowUpText] = useState("");
  const [showQueries, setShowQueries] = useState(false);
  const [inspectingUri, setInspectingUri] = useState<string | null>(null);
  const [inspectErrorMap, setInspectErrorMap] = useState<
    Record<string, string>
  >({});

  const scopeLabel =
    result.scope === "islamqa"
      ? t.dossier.scopeIslamqaLabel
      : result.scope === "web"
        ? t.dossier.scopeWebLabel
        : t.dossier.scopeAllLabel;

  const depthLabel =
    result.depth === "concise"
      ? t.search.depthConcise
      : t.search.depthComprehensive;

  const locale =
    language === "de"
      ? "de-DE"
      : language === "ur"
        ? "ur-PK"
        : language === "ar"
          ? "ar-SA"
          : "en-US";

  const formattedDate = new Date(result.timestamp).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleCopyCitations = async () => {
    const lines: string[] = [
      `# ${result.title}`,
      `${t.dossier.inquiryPrefix} ${result.query}`,
      `${scopeLabel} | ${formattedDate}`,
      "",
      `## ${t.dossier.summaryHeading}`,
      result.rulingSummary,
      "",
    ];

    if (result.quranReferences.length > 0) {
      lines.push(`## ${t.dossier.quranHeading}`);
      result.quranReferences.forEach((q) => {
        const qLink = getQuranComLink(q);
        lines.push(`- ${q.surahName} (${q.verseNumber}) [${qLink.url}]: "${q.translation}"`);
      });
      lines.push("");
    }

    if (result.hadithReferences.length > 0) {
      lines.push(`## ${t.dossier.hadithHeading}`);
      result.hadithReferences.forEach((h) => {
        const hLink = getSunnahComLink(h);
        lines.push(
          `- ${h.collection}, ${h.referenceNumber} [${h.grade}] (${hLink.url}): "${h.translation}"`
        );
      });
      lines.push("");
    }

    const islamqaLive = result.groundedSources.filter((s) => s.isIslamQA);
    const otherLive = result.groundedSources.filter((s) => !s.isIslamQA);
    const islamqaCited = result.fatwaSources?.islamqa ?? [];
    const otherCited = result.fatwaSources?.others ?? [];

    lines.push(`## ${t.dossier.bottomSourcesTitle}`);
    lines.push(`### ${t.dossier.fromIslamqaTitle}`);
    if (islamqaLive.length === 0 && islamqaCited.length === 0) {
      lines.push(`- https://islamqa.info/en/search?q=${encodeURIComponent(result.query)}`);
    } else {
      islamqaLive.forEach((s) => lines.push(`- ${s.title} (${s.domain}): ${s.uri}`));
      islamqaCited.forEach((f) => {
        const fLink = getFatwaSourceLink(f, true, result.groundedSources);
        lines.push(`- ${f.sourceName}${f.reference ? ` (${f.reference})` : ""}: ${f.title} (${fLink.url})${f.summary ? ` — ${f.summary}` : ""}`);
      });
    }
    lines.push("");

    lines.push(`### ${t.dossier.fromOthersTitle}`);
    if (otherLive.length === 0 && otherCited.length === 0) {
      lines.push(`- https://seekersguidance.org/?s=${encodeURIComponent(result.query)}`);
    } else {
      otherLive.forEach((s) => lines.push(`- ${s.title} (${s.domain}): ${s.uri}`));
      otherCited.forEach((f) => {
        const fLink = getFatwaSourceLink(f, false, result.groundedSources);
        lines.push(`- ${f.sourceName}${f.reference ? ` (${f.reference})` : ""}: ${f.title} (${fLink.url})${f.summary ? ` — ${f.summary}` : ""}`);
      });
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failure silently
    }
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const handleExportHtml = () => {
    const docLang = result.language ?? language;
    const isDocRtl = docLang === "ur" || docLang === "ar";
    const docDir = isDocRtl ? "rtl" : "ltr";

    const quranHtml = result.quranReferences
      .map((q) => {
        const qLink = getQuranComLink(q);
        return `
      <div class="card">
        <div class="meta">${escapeHtml(q.surahName)} · <a href="${escapeHtml(qLink.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(q.verseNumber)} (${escapeHtml(qLink.label)})</a></div>
        ${q.arabicText ? `<p class="arabic" dir="rtl" lang="ar">${escapeHtml(q.arabicText)}</p>` : ""}
        <p class="quote">&ldquo;${escapeHtml(q.translation)}&rdquo;</p>
        ${q.relevance ? `<p class="note">${escapeHtml(q.relevance)}</p>` : ""}
      </div>`;
      })
      .join("");

    const hadithHtml = result.hadithReferences
      .map((h) => {
        const hLink = getSunnahComLink(h);
        return `
      <div class="card">
        <div class="meta">${escapeHtml(h.collection)} · <a href="${escapeHtml(hLink.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(h.referenceNumber || hLink.label)} (${escapeHtml(hLink.label)})</a> · ${escapeHtml(t.dossier.gradePrefix)} ${escapeHtml(h.grade)}</div>
        ${h.narrator ? `<p class="note">${escapeHtml(t.dossier.narratedBy)} ${escapeHtml(h.narrator)}</p>` : ""}
        ${h.arabicText ? `<p class="arabic" dir="rtl" lang="ar">${escapeHtml(h.arabicText)}</p>` : ""}
        <p class="quote">&ldquo;${escapeHtml(h.translation)}&rdquo;</p>
        ${h.relevance ? `<p class="note">${escapeHtml(h.relevance)}</p>` : ""}
      </div>`;
      })
      .join("");

    const analysisHtml = result.detailedAnalysis
      .map((p) => `<p class="prose">${escapeHtml(p)}</p>`)
      .join("");

    const perspectivesHtml = result.scholarlyPerspectives
      .map(
        (s) =>
          `<li><strong>${escapeHtml(s.schoolOrScholar)}:</strong> ${escapeHtml(s.position)}</li>`
      )
      .join("");

    const islamqaLiveHtml = result.groundedSources
      .filter((s) => s.isIslamQA)
      .map(
        (s) =>
          `<li><a href="${escapeHtml(s.uri)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)}</a> <span class="note">(${escapeHtml(s.domain)})</span></li>`
      )
      .join("");

    const islamqaCitedHtml = (result.fatwaSources?.islamqa ?? [])
      .map((f) => {
        const fLink = getFatwaSourceLink(f, true, result.groundedSources);
        return `<li><strong>${escapeHtml(f.sourceName)}${f.reference ? ` (${escapeHtml(f.reference)})` : ""}:</strong> <a href="${escapeHtml(fLink.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(f.title)}</a>${f.summary ? ` <span class="note">— ${escapeHtml(f.summary)}</span>` : ""}</li>`;
      })
      .join("");

    const otherLiveHtml = result.groundedSources
      .filter((s) => !s.isIslamQA)
      .map(
        (s) =>
          `<li><a href="${escapeHtml(s.uri)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)}</a> <span class="note">(${escapeHtml(s.domain)})</span></li>`
      )
      .join("");

    const otherCitedHtml = (result.fatwaSources?.others ?? [])
      .map((f) => {
        const fLink = getFatwaSourceLink(f, false, result.groundedSources);
        return `<li><strong>${escapeHtml(f.sourceName)}${f.reference ? ` (${escapeHtml(f.reference)})` : ""}:</strong> <a href="${escapeHtml(fLink.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(f.title)}</a>${f.summary ? ` <span class="note">— ${escapeHtml(f.summary)}</span>` : ""}</li>`;
      })
      .join("");

    const docHtml = `<!doctype html>
<html lang="${docLang}" dir="${docDir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(result.title)} — Fatwa Pro</title>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:wght@600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    body { font-family: ${isDocRtl ? '"Noto Naskh Arabic", "Amiri", serif' : '"Plus Jakarta Sans", system-ui, sans-serif'}; background: #FBF9F5; color: #1C1917; max-width: 860px; margin: 0 auto; padding: 40px 24px; line-height: ${isDocRtl ? "1.95" : "1.7"}; }
    h1, h2, h3 { font-family: ${isDocRtl ? '"Noto Naskh Arabic", "Amiri", serif' : '"Cormorant Garamond", Georgia, serif'}; font-weight: 600; }
    h1 { font-size: 2.25rem; line-height: 1.25; margin: 12px 0 6px; }
    h2 { font-size: 1.35rem; margin-top: 28px; border-bottom: 1px solid #E5DFD5; padding-bottom: 6px; }
    h3 { font-size: 1.05rem; margin-top: 16px; color: #14532D; }
    .meta { font-size: 0.78rem; color: #78350F; font-weight: 600; }
    .summary { font-family: ${docLang === "ur" ? '"Noto Naskh Arabic", "Amiri", serif' : '"Cormorant Garamond", Georgia, serif'}; font-size: 1.25rem; border-top: 1px solid #E5DFD5; border-bottom: 1px solid #E5DFD5; padding: 16px 0; margin: 20px 0; }
    .card { border: 1px solid #E5DFD5; background: #FFFFFF; border-radius: 6px; padding: 14px 16px; margin-top: 12px; }
    .arabic { font-family: "Amiri", serif; font-size: 1.35rem; line-height: 2; text-align: right; margin: 10px 0; }
    .quote { margin: 8px 0; }
    .note { font-size: 0.85rem; color: #57534E; }
    .prose { margin: 12px 0; }
    a { color: #14532D; }
    footer { margin-top: 40px; border-top: 1px solid #E5DFD5; padding-top: 16px; font-size: 0.78rem; color: #78716C; }
  </style>
</head>
<body>
  <div class="meta">Fatwa Pro · ${escapeHtml(scopeLabel)} · ${escapeHtml(formattedDate)}</div>
  <h1>${escapeHtml(result.title)}</h1>
  <p class="note">${escapeHtml(t.dossier.inquiryPrefix)} &ldquo;${escapeHtml(result.query)}&rdquo;</p>
  <div class="summary">${escapeHtml(result.rulingSummary)}</div>
  ${analysisHtml ? `<h2>${escapeHtml(t.dossier.analysisHeading)}</h2>${analysisHtml}` : ""}
  ${quranHtml ? `<h2>${escapeHtml(t.dossier.quranHeading)}</h2>${quranHtml}` : ""}
  ${hadithHtml ? `<h2>${escapeHtml(t.dossier.hadithHeading)}</h2>${hadithHtml}` : ""}
  ${perspectivesHtml ? `<h2>${escapeHtml(t.dossier.perspectivesHeading)}</h2><ul>${perspectivesHtml}</ul>` : ""}
  <h2>${escapeHtml(t.dossier.bottomSourcesTitle)}</h2>
  <h3>${escapeHtml(t.dossier.fromIslamqaTitle)}</h3>
  <ul>${islamqaLiveHtml || islamqaCitedHtml ? `${islamqaLiveHtml}${islamqaCitedHtml}` : `<li><a href="https://islamqa.info/en/search?q=${encodeURIComponent(result.query)}">islamqa.info/en</a></li>`}</ul>
  <h3>${escapeHtml(t.dossier.fromOthersTitle)}</h3>
  <ul>${otherLiveHtml || otherCitedHtml ? `${otherLiveHtml}${otherCitedHtml}` : `<li><a href="https://seekersguidance.org/?s=${encodeURIComponent(result.query)}">seekersguidance.org</a></li>`}</ul>
  <footer>Fatwa Pro · ${escapeHtml(t.footer.developedBy)} ${escapeHtml(t.footer.developerName)} · ${escapeHtml(t.footer.rightSuffix)}</footer>
</body>
</html>`;

    const blob = new Blob([docHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const slug = result.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fatwa-pro-${slug || "dossier"}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleInspectSource = async (source: GroundedSource) => {
    if (inspectedMap[source.uri] || inspectingUri === source.uri) return;
    setInspectingUri(source.uri);
    setInspectErrorMap((prev) => {
      const next = { ...prev };
      delete next[source.uri];
      return next;
    });

    try {
      const response = await fetch("/api/inspect-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: source.uri,
          title: source.title,
          query: result.query,
          language,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to inspect source.");
      }
      onInspectedSource(source.uri, data as InspectedSourceResult);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not load fatwa inspection.";
      setInspectErrorMap((prev) => ({ ...prev, [source.uri]: msg }));
    } finally {
      setInspectingUri(null);
    }
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpText.trim() || isLoadingFollowUp) return;
    onRunFollowUp(followUpText.trim());
    setFollowUpText("");
  };

  const islamQaSources = result.groundedSources.filter((s) => s.isIslamQA);
  const otherSources = result.groundedSources.filter((s) => !s.isIslamQA);

  return (
    <article className="py-8">
      {/* Dossier Header */}
      <header className="border-b border-[#E5DFD5] pb-6 dark:border-[#2C2925]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C] dark:text-[#A8A29E]">
            <span className="font-medium text-[#78350F] dark:text-[#D9B99B]">
              {scopeLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {depthLabel} {t.dossier.analysisLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {result.quranReferences.length} {t.dossier.quranUnit} ·{" "}
              {result.hadithReferences.length} {t.dossier.hadithUnit}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCitations}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#E5DFD5] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#44403C] transition-colors hover:border-[#D6CEBE] hover:text-[#1C1917] dark:border-[#2C2925] dark:bg-[#1A1815] dark:text-[#D6D3CD] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[#14532D] dark:text-[#86EFAC]" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copied ? t.dossier.copied : t.dossier.copyCitations}</span>
            </button>

            <button
              type="button"
              onClick={handleExportHtml}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#E5DFD5] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#44403C] transition-colors hover:border-[#D6CEBE] hover:text-[#1C1917] dark:border-[#2C2925] dark:bg-[#1A1815] dark:text-[#D6D3CD] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.dossier.exportHtml}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(result)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isSaved
                  ? "border-[#14532D] bg-[#14532D] text-[#FBF9F5] dark:border-[#86EFAC] dark:bg-[#86EFAC] dark:text-[#141311]"
                  : "border-[#E5DFD5] bg-[#FFFFFF] text-[#44403C] hover:border-[#D6CEBE] hover:text-[#1C1917] dark:border-[#2C2925] dark:bg-[#1A1815] dark:text-[#D6D3CD]"
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
              <span>
                {isSaved ? t.dossier.savedInArchive : t.dossier.saveResearch}
              </span>
            </button>
          </div>
        </div>

        <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-[#1C1917] sm:text-4xl text-balance dark:text-[#EDEAE3]">
          {result.title}
        </h1>
        <p className="mt-2 text-sm text-[#78716C] dark:text-[#A8A29E]">
          {t.dossier.inquiryPrefix} &ldquo;{result.query}&rdquo;
        </p>
      </header>

      {/* Asymmetric Two-Column Reading Canvas (65% Essay / 35% Primary Evidences & Sources) */}
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        {/* Left Main Scholarly Essay */}
        <div className="lg:col-span-7 space-y-8">
          {/* Summary Ruling */}
          <section aria-labelledby="ruling-summary-heading">
            <h2
              id="ruling-summary-heading"
              className="text-xs font-medium uppercase tracking-[0.14em] text-[#78350F] dark:text-[#D9B99B]"
            >
              {t.dossier.summaryHeading}
            </h2>
            <div className="mt-3 border-y border-[#E5DFD5] py-5 dark:border-[#2C2925]">
              <p className="font-serif text-xl leading-relaxed text-[#1C1917] dark:text-[#EDEAE3]">
                {result.rulingSummary}
              </p>
            </div>
          </section>

          {/* Detailed Scholarly Exposition */}
          {result.detailedAnalysis.length > 0 && (
            <section aria-labelledby="detailed-analysis-heading">
              <h2
                id="detailed-analysis-heading"
                className="text-xs font-medium uppercase tracking-[0.14em] text-[#78716C] dark:text-[#A8A29E]"
              >
                {t.dossier.analysisHeading}
              </h2>
              <div className="mt-4 max-w-prose space-y-5 text-[15.5px] leading-[1.78] text-[#292524] dark:text-[#D6D3CD]">
                {result.detailedAnalysis.map((paragraph, index) => (
                  <p key={index} className={index === 0 ? "drop-cap" : ""}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Raw Markdown Fallback if JSON parsing failed */}
          {result.rawFallbackMarkdown && (
            <section className="max-w-prose whitespace-pre-wrap text-[15.5px] leading-[1.78] text-[#292524] dark:text-[#D6D3CD]">
              {result.rawFallbackMarkdown}
            </section>
          )}

          {/* Scholarly Perspectives / Ikhtilaf */}
          {result.scholarlyPerspectives.length > 0 && (
            <section
              aria-labelledby="perspectives-heading"
              className="border-t border-[#E5DFD5] pt-7 dark:border-[#2C2925]"
            >
              <h2
                id="perspectives-heading"
                className="text-xs font-medium uppercase tracking-[0.14em] text-[#78716C] dark:text-[#A8A29E]"
              >
                {t.dossier.perspectivesHeading}
              </h2>
              <dl className="mt-4 divide-y divide-[#EFECE4] border-y border-[#EFECE4] dark:divide-[#24221E] dark:border-[#24221E]">
                {result.scholarlyPerspectives.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-12 sm:gap-6"
                  >
                    <dt className="text-sm font-semibold text-[#1C1917] sm:col-span-4 dark:text-[#EDEAE3]">
                      {item.schoolOrScholar}
                    </dt>
                    <dd className="text-sm leading-relaxed text-[#44403C] sm:col-span-8 dark:text-[#C7C2B8]">
                      {item.position}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Practical Guidance */}
          {result.practicalGuidance.length > 0 && (
            <section
              aria-labelledby="guidance-heading"
              className="border-t border-[#E5DFD5] pt-7 dark:border-[#2C2925]"
            >
              <h2
                id="guidance-heading"
                className="text-xs font-medium uppercase tracking-[0.14em] text-[#78716C] dark:text-[#A8A29E]"
              >
                {t.dossier.guidanceHeading}
              </h2>
              <ol className="mt-4 space-y-3">
                {result.practicalGuidance.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex items-baseline gap-3 text-[15px] leading-relaxed text-[#292524] dark:text-[#D6D3CD]"
                  >
                    <span className="font-mono text-xs tabular-nums text-[#78350F] dark:text-[#D9B99B]">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Fatwa Sources Divided Vertically: From IslamQA.info, then From Other Sources (Left of Qur'an/Hadith Primary Sources) */}
          <section
            aria-labelledby="fatwa-sources-heading"
            className="border-t border-[#E5DFD5] pt-7 dark:border-[#2C2925]"
          >
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#78350F] dark:text-[#D9B99B]">
                {t.dossier.bottomSourcesKicker}
              </p>
              <h2
                id="fatwa-sources-heading"
                className="mt-1 font-serif text-xl font-semibold text-[#1C1917] dark:text-[#EDEAE3]"
              >
                {t.dossier.bottomSourcesTitle}
              </h2>
            </div>

            <div className="space-y-5">
              {/* Group 1: From IslamQA.info */}
              <div className="rounded-lg border border-[#E5DFD5] bg-[#F7F4EE] p-5 dark:border-[#2C2925] dark:bg-[#1A1815]">
                <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3 dark:border-[#2C2925]">
                  <h3 className="font-serif text-lg font-semibold text-[#14532D] dark:text-[#86EFAC]">
                    {t.dossier.fromIslamqaTitle}
                  </h3>
                  <span className="font-mono text-xs tabular-nums text-[#78716C] dark:text-[#A8A29E]">
                    {islamQaSources.length + (result.fatwaSources?.islamqa.length ?? 0)}
                  </span>
                </div>

                <div className="mt-4 space-y-5">
                  {islamQaSources.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#14532D] dark:text-[#86EFAC]">
                        {t.dossier.liveLinksHeading}
                      </p>
                      <ul className="mt-2 divide-y divide-[#E5DFD5] dark:divide-[#2C2925]">
                        {islamQaSources.map((src) => (
                          <SourceRow
                            key={`left-${src.uri}`}
                            t={t}
                            source={src}
                            inspected={inspectedMap[src.uri]}
                            isInspecting={inspectingUri === src.uri}
                            inspectError={inspectErrorMap[src.uri]}
                            onInspect={() => handleInspectSource(src)}
                          />
                        ))}
                      </ul>
                    </div>
                  )}

                  {(result.fatwaSources?.islamqa.length ?? 0) > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#78350F] dark:text-[#D9B99B]">
                        {t.dossier.citedPositionsHeading}
                      </p>
                      <ul className="mt-2 divide-y divide-[#E5DFD5] dark:divide-[#2C2925]">
                        {result.fatwaSources?.islamqa.map((item, idx) => {
                          const link = getFatwaSourceLink(
                            item,
                            true,
                            result.groundedSources
                          );
                          return (
                            <li key={idx} className="py-2.5 first:pt-1 last:pb-1">
                              <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs font-semibold text-[#14532D] dark:text-[#86EFAC]">
                                <div className="flex flex-wrap items-baseline gap-x-2">
                                  <span>{item.sourceName}</span>
                                  {item.reference && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span className="font-mono text-[#78350F] dark:text-[#D9B99B]">
                                        {item.reference}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <span dir="ltr" className="font-mono text-[11px] font-normal text-[#78716C] dark:text-[#A8A29E]">
                                  {link.domainLabel}
                                </span>
                              </div>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-start gap-1.5 text-sm font-medium text-[#1C1917] transition-colors hover:text-[#14532D] hover:underline dark:text-[#EDEAE3] dark:hover:text-[#86EFAC]"
                              >
                                <span>{item.title}</span>
                                <ExternalLink
                                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#78716C]"
                                  aria-hidden="true"
                                />
                              </a>
                              {item.summary && (
                                <p className="mt-1 text-xs leading-relaxed text-[#57534E] dark:text-[#B8B2A6]">
                                  {item.summary}
                                </p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {islamQaSources.length === 0 &&
                    (result.fatwaSources?.islamqa.length ?? 0) === 0 && (
                      <p className="text-xs leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                        {t.dossier.emptyIslamqaNote}
                      </p>
                    )}
                </div>
              </div>

              {/* Group 2: From Other Scholarly Sources */}
              <div className="rounded-lg border border-[#E5DFD5] bg-[#FFFFFF] p-5 dark:border-[#2C2925] dark:bg-[#1A1815]">
                <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3 dark:border-[#2C2925]">
                  <h3 className="font-serif text-lg font-semibold text-[#1C1917] dark:text-[#EDEAE3]">
                    {t.dossier.fromOthersTitle}
                  </h3>
                  <span className="font-mono text-xs tabular-nums text-[#78716C] dark:text-[#A8A29E]">
                    {otherSources.length + (result.fatwaSources?.others.length ?? 0)}
                  </span>
                </div>

                <div className="mt-4 space-y-5">
                  {otherSources.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#78716C] dark:text-[#A8A29E]">
                        {t.dossier.liveLinksHeading}
                      </p>
                      <ul className="mt-2 divide-y divide-[#EFECE4] dark:divide-[#24221E]">
                        {otherSources.map((src) => (
                          <SourceRow
                            key={`left-${src.uri}`}
                            t={t}
                            source={src}
                            inspected={inspectedMap[src.uri]}
                            isInspecting={inspectingUri === src.uri}
                            inspectError={inspectErrorMap[src.uri]}
                            onInspect={() => handleInspectSource(src)}
                          />
                        ))}
                      </ul>
                    </div>
                  )}

                  {(result.fatwaSources?.others.length ?? 0) > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#78350F] dark:text-[#D9B99B]">
                        {t.dossier.citedPositionsHeading}
                      </p>
                      <ul className="mt-2 divide-y divide-[#EFECE4] dark:divide-[#24221E]">
                        {result.fatwaSources?.others.map((item, idx) => {
                          const link = getFatwaSourceLink(
                            item,
                            false,
                            result.groundedSources
                          );
                          return (
                            <li key={idx} className="py-2.5 first:pt-1 last:pb-1">
                              <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs font-semibold text-[#78350F] dark:text-[#D9B99B]">
                                <div className="flex flex-wrap items-baseline gap-x-2">
                                  <span>{item.sourceName}</span>
                                  {item.reference && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span className="font-mono text-[#78716C] dark:text-[#A8A29E]">
                                        {item.reference}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <span dir="ltr" className="font-mono text-[11px] font-normal text-[#78716C] dark:text-[#A8A29E]">
                                  {link.domainLabel}
                                </span>
                              </div>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-start gap-1.5 text-sm font-medium text-[#1C1917] transition-colors hover:text-[#14532D] hover:underline dark:text-[#EDEAE3] dark:hover:text-[#86EFAC]"
                              >
                                <span>{item.title}</span>
                                <ExternalLink
                                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#78716C]"
                                  aria-hidden="true"
                                />
                              </a>
                              {item.summary && (
                                <p className="mt-1 text-xs leading-relaxed text-[#57534E] dark:text-[#B8B2A6]">
                                  {item.summary}
                                </p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {otherSources.length === 0 &&
                    (result.fatwaSources?.others.length ?? 0) === 0 && (
                      <p className="text-xs leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                        {t.dossier.emptyOthersNote}
                      </p>
                    )}
                </div>
              </div>
            </div>
          </section>

          {/* Follow-up Inquiry & Related Questions */}
          <section
            aria-labelledby="followup-heading"
            className="border-t border-[#E5DFD5] pt-7 dark:border-[#2C2925]"
          >
            <h2
              id="followup-heading"
              className="text-xs font-medium uppercase tracking-[0.14em] text-[#78716C] dark:text-[#A8A29E]"
            >
              {t.dossier.followUpHeading}
            </h2>

            <form onSubmit={handleFollowUpSubmit} className="mt-3 flex gap-2">
              <label htmlFor="followup-input" className="sr-only">
                {t.dossier.followUpPlaceholder}
              </label>
              <input
                id="followup-input"
                type="text"
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                placeholder={t.dossier.followUpPlaceholder}
                className="flex-1 rounded-md border border-[#E5DFD5] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#14532D] focus:outline-none dark:border-[#2C2925] dark:bg-[#1A1815] dark:text-[#EDEAE3] dark:placeholder:text-[#78716C] dark:focus:border-[#86EFAC]"
              />
              <button
                type="submit"
                disabled={isLoadingFollowUp || !followUpText.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#14532D] px-4 py-2.5 text-xs font-medium text-[#FBF9F5] transition-colors hover:bg-[#166534] disabled:opacity-50 dark:bg-[#86EFAC] dark:text-[#141311] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send
                  className="h-3.5 w-3.5 rtl:rotate-180"
                  aria-hidden="true"
                />
                <span>
                  {isLoadingFollowUp
                    ? t.dossier.researching
                    : t.dossier.askFollowUp}
                </span>
              </button>
            </form>

            {result.relatedQuestions.length > 0 && (
              <div className="mt-5">
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                  {t.dossier.relatedHeading}
                </p>
                <div className="mt-2 divide-y divide-[#EFECE4] dark:divide-[#24221E]">
                  {result.relatedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={isLoadingFollowUp}
                      onClick={() => onRunFollowUp(q)}
                      className="flex w-full items-center justify-between gap-4 py-2.5 text-start text-sm text-[#44403C] transition-colors hover:text-[#14532D] disabled:opacity-50 dark:text-[#C7C2B8] dark:hover:text-[#86EFAC] cursor-pointer"
                    >
                      <span>{q}</span>
                      <span className="text-xs text-[#78716C] shrink-0">
                        {t.dossier.exploreArrow}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Margin Reference Rail: Qur'an, Hadith, & Grounded IslamQA/Web Sources */}
        <aside
          aria-label={t.dossier.quranHeading}
          className="lg:col-span-5 space-y-8"
        >
          {/* Noble Qur'an Evidences */}
          <section
            aria-labelledby="quran-evidence-heading"
            className="rounded-lg border border-[#E5DFD5] bg-[#F7F4EE] p-5 dark:border-[#2C2925] dark:bg-[#1A1815]"
          >
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3 dark:border-[#2C2925]">
              <div className="flex items-center gap-2">
                <BookOpen
                  className="h-4 w-4 text-[#14532D] dark:text-[#86EFAC]"
                  aria-hidden="true"
                />
                <h2
                  id="quran-evidence-heading"
                  className="font-serif text-lg font-semibold text-[#1C1917] dark:text-[#EDEAE3]"
                >
                  {t.dossier.quranHeading}
                </h2>
              </div>
              <span className="font-mono text-xs tabular-nums text-[#78716C] dark:text-[#A8A29E]">
                {result.quranReferences.length} {t.dossier.citedCount}
              </span>
            </div>

            {result.quranReferences.length === 0 ? (
              <p className="mt-4 text-sm text-[#78716C] dark:text-[#A8A29E]">
                {t.dossier.noQuranNote}
              </p>
            ) : (
              <div className="mt-4 divide-y divide-[#E5DFD5] dark:divide-[#2C2925]">
                {result.quranReferences.map((verse, idx) => {
                  const quranLink = getQuranComLink(verse);
                  return (
                    <div key={idx} className="py-4 first:pt-1 last:pb-1">
                      <div className="flex items-baseline justify-between gap-2 text-xs text-[#78350F] dark:text-[#D9B99B]">
                        <span className="font-semibold">{verse.surahName}</span>
                        <a
                          href={quranLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono tabular-nums text-[#14532D] hover:underline dark:text-[#86EFAC]"
                        >
                          <span>{verse.verseNumber || quranLink.label}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                        </a>
                      </div>
                      {verse.arabicText && (
                        <p
                          dir="rtl"
                          lang="ar"
                          className="font-arabic mt-3 text-right text-xl leading-[2.1] text-[#1C1917] dark:text-[#F5F2EB]"
                        >
                          {verse.arabicText}
                        </p>
                      )}
                      <p className="mt-2.5 text-sm leading-relaxed text-[#292524] dark:text-[#D6D3CD]">
                        &ldquo;{verse.translation}&rdquo;
                      </p>
                      {verse.relevance && (
                        <p className="mt-2 text-xs leading-relaxed text-[#78716C] dark:text-[#A8A29E]">
                          {verse.relevance}
                        </p>
                      )}
                      <div className="mt-2">
                        <a
                          href={quranLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-[#78716C] transition-colors hover:text-[#14532D] hover:underline dark:text-[#A8A29E] dark:hover:text-[#86EFAC]"
                        >
                          <span dir="ltr">{quranLink.label}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Authentic Hadith Evidences */}
          <section
            aria-labelledby="hadith-evidence-heading"
            className="rounded-lg border border-[#E5DFD5] bg-[#FFFFFF] p-5 dark:border-[#2C2925] dark:bg-[#1A1815]"
          >
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3 dark:border-[#2C2925]">
              <h2
                id="hadith-evidence-heading"
                className="font-serif text-lg font-semibold text-[#1C1917] dark:text-[#EDEAE3]"
              >
                {t.dossier.hadithHeading}
              </h2>
              <span className="font-mono text-xs tabular-nums text-[#78716C] dark:text-[#A8A29E]">
                {result.hadithReferences.length} {t.dossier.citedCount}
              </span>
            </div>

            {result.hadithReferences.length === 0 ? (
              <p className="mt-4 text-sm text-[#78716C] dark:text-[#A8A29E]">
                {t.dossier.noHadithNote}
              </p>
            ) : (
              <div className="mt-4 divide-y divide-[#EFECE4] dark:divide-[#24221E]">
                {result.hadithReferences.map((hadith, idx) => {
                  const sunnahLink = getSunnahComLink(hadith);
                  return (
                    <div key={idx} className="py-4 first:pt-1 last:pb-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-[#57534E] dark:text-[#A8A29E]">
                        <a
                          href={sunnahLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#14532D] hover:underline dark:text-[#86EFAC]"
                        >
                          {hadith.collection}
                        </a>
                        {hadith.referenceNumber && (
                          <>
                            <span aria-hidden="true">·</span>
                            <a
                              href={sunnahLink.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono tabular-nums hover:text-[#14532D] hover:underline dark:hover:text-[#86EFAC]"
                            >
                              <span>{hadith.referenceNumber}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                            </a>
                          </>
                        )}
                        {hadith.grade && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-[#78350F] dark:text-[#D9B99B]">
                              {t.dossier.gradePrefix} {hadith.grade}
                            </span>
                          </>
                        )}
                      </div>

                      {hadith.narrator && (
                        <p className="mt-1.5 text-xs italic text-[#78716C] dark:text-[#A8A29E]">
                          {t.dossier.narratedBy} {hadith.narrator}
                        </p>
                      )}

                      {hadith.arabicText && (
                        <p
                          dir="rtl"
                          lang="ar"
                          className="font-arabic mt-2.5 text-right text-lg leading-[2] text-[#1C1917] dark:text-[#F5F2EB]"
                        >
                          {hadith.arabicText}
                        </p>
                      )}

                      <p className="mt-2.5 text-sm leading-relaxed text-[#292524] dark:text-[#D6D3CD]">
                        &ldquo;{hadith.translation}&rdquo;
                      </p>

                      {hadith.relevance && (
                        <p className="mt-2 text-xs leading-relaxed text-[#78716C] dark:text-[#A8A29E]">
                          {hadith.relevance}
                        </p>
                      )}

                      <div className="mt-2">
                        <a
                          href={sunnahLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-[#78716C] transition-colors hover:text-[#14532D] hover:underline dark:text-[#A8A29E] dark:hover:text-[#86EFAC]"
                        >
                          <span dir="ltr">{sunnahLink.label}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Grounded IslamQA.info & Web Sources */}
          <section
            aria-labelledby="grounded-sources-heading"
            className="rounded-lg border border-[#E5DFD5] bg-[#FFFFFF] p-5 dark:border-[#2C2925] dark:bg-[#1A1815]"
          >
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3 dark:border-[#2C2925]">
              <h2
                id="grounded-sources-heading"
                className="font-serif text-lg font-semibold text-[#1C1917] dark:text-[#EDEAE3]"
              >
                {t.dossier.sourcesHeading}
              </h2>
              <span className="font-mono text-xs tabular-nums text-[#78716C] dark:text-[#A8A29E]">
                {result.groundedSources.length} {t.dossier.linksCount}
              </span>
            </div>

            {result.groundedSources.length === 0 ? (
              <div className="mt-4 space-y-3">
                <p className="text-xs leading-relaxed text-[#78716C] dark:text-[#A8A29E]">
                  {t.dossier.directPortalIntro}
                </p>
                <ul className="divide-y divide-[#EFECE4] dark:divide-[#24221E]">
                  {[
                    {
                      label: t.dossier.searchIslamqaLabel,
                      domain: "islamqa.info/en",
                      href: `https://islamqa.info/en/search?q=${encodeURIComponent(result.query)}`,
                    },
                    {
                      label: t.dossier.searchQuranLabel,
                      domain: "quran.com",
                      href: `https://quran.com/search?q=${encodeURIComponent(result.query)}`,
                    },
                    {
                      label: t.dossier.searchSunnahLabel,
                      domain: "sunnah.com",
                      href: `https://sunnah.com/search?q=${encodeURIComponent(result.query)}`,
                    },
                    {
                      label: t.dossier.searchSeekersLabel,
                      domain: "seekersguidance.org",
                      href: `https://seekersguidance.org/?s=${encodeURIComponent(result.query)}`,
                    },
                  ].map((portal) => (
                    <li
                      key={portal.domain}
                      className="py-2.5 first:pt-1 last:pb-1"
                    >
                      <a
                        href={portal.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 text-sm font-medium text-[#1C1917] transition-colors hover:text-[#14532D] hover:underline dark:text-[#EDEAE3] dark:hover:text-[#86EFAC]"
                      >
                        <span>{portal.label}</span>
                        <ExternalLink
                          className="h-3.5 w-3.5 shrink-0 text-[#78716C]"
                          aria-hidden="true"
                        />
                      </a>
                      <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                        {portal.domain}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-4 space-y-5">
                {islamQaSources.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#14532D] dark:text-[#86EFAC]">
                      {t.dossier.islamqaGroup}
                    </p>
                    <ul className="mt-2 divide-y divide-[#EFECE4] dark:divide-[#24221E]">
                      {islamQaSources.map((src) => (
                        <SourceRow
                          key={src.uri}
                          t={t}
                          source={src}
                          inspected={inspectedMap[src.uri]}
                          isInspecting={inspectingUri === src.uri}
                          inspectError={inspectErrorMap[src.uri]}
                          onInspect={() => handleInspectSource(src)}
                        />
                      ))}
                    </ul>
                    <div className="mt-2.5 border-t border-[#EFECE4] pt-2.5 dark:border-[#24221E]">
                      <a
                        href={`https://islamqa.info/en/search?q=${encodeURIComponent(result.query)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 text-xs font-medium text-[#14532D] transition-colors hover:underline dark:text-[#86EFAC]"
                      >
                        <span>{t.dossier.searchIslamqaLabel}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                ) : (
                  result.scope !== "web" && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#14532D] dark:text-[#86EFAC]">
                        {t.dossier.islamqaGroup}
                      </p>
                      <div className="mt-2 py-1">
                        <a
                          href={`https://islamqa.info/en/search?q=${encodeURIComponent(result.query)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 text-sm font-medium text-[#1C1917] transition-colors hover:text-[#14532D] hover:underline dark:text-[#EDEAE3] dark:hover:text-[#86EFAC]"
                        >
                          <span>{t.dossier.searchIslamqaLabel}</span>
                          <ExternalLink
                            className="h-3.5 w-3.5 shrink-0 text-[#78716C]"
                            aria-hidden="true"
                          />
                        </a>
                        <p className="mt-0.5 text-xs text-[#78716C] dark:text-[#A8A29E]">
                          islamqa.info/en
                        </p>
                      </div>
                    </div>
                  )
                )}

                {otherSources.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C] dark:text-[#A8A29E]">
                      {t.dossier.otherSourcesGroup}
                    </p>
                    <ul className="mt-2 divide-y divide-[#EFECE4] dark:divide-[#24221E]">
                      {otherSources.map((src) => (
                        <SourceRow
                          key={src.uri}
                          t={t}
                          source={src}
                          inspected={inspectedMap[src.uri]}
                          isInspecting={inspectingUri === src.uri}
                          inspectError={inspectErrorMap[src.uri]}
                          onInspect={() => handleInspectSource(src)}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {result.searchQueriesUsed.length > 0 && (
              <div className="mt-4 border-t border-[#EFECE4] pt-3 dark:border-[#24221E]">
                <button
                  type="button"
                  onClick={() => setShowQueries((v) => !v)}
                  className="flex w-full items-center justify-between text-xs text-[#78716C] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#EDEAE3] cursor-pointer"
                >
                  <span>
                    {t.dossier.queriesExecuted} (
                    {result.searchQueriesUsed.length})
                  </span>
                  {showQueries ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
                {showQueries && (
                  <ul className="mt-2 space-y-1 text-xs text-[#57534E] dark:text-[#A8A29E]">
                    {result.searchQueriesUsed.map((sq, i) => (
                      <li key={i} className="font-mono text-[11px] break-words">
                        {i + 1}. {sq}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        </aside>
      </div>
    </article>
  );
};

interface SourceRowProps {
  t: AppTranslations;
  source: GroundedSource;
  inspected?: InspectedSourceResult;
  isInspecting: boolean;
  inspectError?: string;
  onInspect: () => void;
}

const SourceRow: React.FC<SourceRowProps> = ({
  t,
  source,
  inspected,
  isInspecting,
  inspectError,
  onInspect,
}) => {
  return (
    <li className="py-3 first:pt-1 last:pb-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <a
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium leading-snug text-[#1C1917] hover:text-[#14532D] hover:underline dark:text-[#EDEAE3] dark:hover:text-[#86EFAC]"
          >
            {source.title}
          </a>
          <p className="mt-0.5 text-xs text-[#78716C] dark:text-[#A8A29E]">
            {source.domain}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onInspect}
            disabled={isInspecting || Boolean(inspected)}
            title={source.title}
            className="inline-flex items-center gap-1 rounded border border-[#E5DFD5] px-2 py-1 text-[11px] font-medium text-[#44403C] transition-colors hover:border-[#14532D] hover:text-[#14532D] disabled:opacity-50 dark:border-[#2C2925] dark:text-[#D6D3CD] dark:hover:border-[#86EFAC] dark:hover:text-[#86EFAC] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileSearch className="h-3 w-3" aria-hidden="true" />
            <span>
              {isInspecting
                ? t.dossier.readingBtn
                : inspected
                  ? t.dossier.inspectedBtn
                  : t.dossier.inspectBtn}
            </span>
          </button>
          <a
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={source.title}
            className="inline-flex items-center justify-center rounded border border-[#E5DFD5] p-1 text-[#57534E] transition-colors hover:border-[#14532D] hover:text-[#14532D] dark:border-[#2C2925] dark:text-[#A8A29E] dark:hover:border-[#86EFAC]"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {inspectError && (
        <p className="mt-2 text-xs text-[#9A3412] dark:text-[#FDBA74]">
          {inspectError}
        </p>
      )}

      {inspected && (
        <div className="mt-3 rounded border border-[#E5DFD5] bg-[#F7F4EE] p-3 text-xs leading-relaxed text-[#292524] dark:border-[#2C2925] dark:bg-[#141311] dark:text-[#D6D3CD]">
          <p className="font-medium text-[#14532D] dark:text-[#86EFAC]">
            {t.dossier.sourceExtractTitle}
          </p>
          <p className="mt-1">{inspected.summary}</p>
          {inspected.keyEvidences.length > 0 && (
            <ul className="mt-2 space-y-1 text-[#44403C] dark:text-[#B8B2A6]">
              {inspected.keyEvidences.map((ev, i) => (
                <li key={i}>· {ev}</li>
              ))}
            </ul>
          )}
          {(inspected.quranMentions.length > 0 ||
            inspected.hadithMentions.length > 0) && (
            <div className="mt-2 border-t border-[#E5DFD5] pt-2 text-[11px] text-[#78716C] dark:border-[#2C2925] dark:text-[#A8A29E]">
              {inspected.quranMentions.length > 0 && (
                <p>
                  {t.dossier.quranLabel}: {inspected.quranMentions.join(" · ")}
                </p>
              )}
              {inspected.hadithMentions.length > 0 && (
                <p className="mt-0.5">
                  {t.dossier.hadithLabel}:{" "}
                  {inspected.hadithMentions.join(" · ")}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  );
};
