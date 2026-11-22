import "dotenv/config";
import express from "express";
import { createServer as createHttpServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import type { Request, Response } from "express";
import type {
  AppLanguage,
  FatwaSourceAttribution,
  FatwaSourcesBreakdown,
  GroundedSource,
  InspectedSourceResult,
  ResearchDepth,
  ResearchResult,
  SearchScope,
} from "./src/types/research.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

interface ApiErrorInfo {
  httpStatus: number;
  message: string;
  isQuota: boolean;
}

function parseApiError(err: unknown): ApiErrorInfo {
  const raw = err instanceof Error ? err.message : "Failed to complete scholarly search.";
  const statusFromProp =
    typeof (err as { status?: unknown })?.status === "number"
      ? ((err as { status: number }).status)
      : undefined;

  try {
    const parsed = JSON.parse(raw) as {
      error?: { code?: number; status?: string; message?: string };
    };
    const code = parsed?.error?.code ?? statusFromProp;
    const status = parsed?.error?.status;
    if (code === 429 || status === "RESOURCE_EXHAUSTED") {
      return {
        httpStatus: 429,
        isQuota: true,
        message:
          "Gemini API rate limit or quota exceeded (429). Please wait a moment and retry, or select a billing-enabled API key in Settings > Secrets.",
      };
    }
    if (
      code === 403 ||
      code === 400 ||
      status === "PERMISSION_DENIED" ||
      status === "API_KEY_INVALID"
    ) {
      return {
        httpStatus: code ?? 403,
        isQuota: false,
        message:
          "Gemini API key permission or configuration issue. Please check your API key in Settings > Secrets.",
      };
    }
    if (parsed?.error?.message) {
      return {
        httpStatus: code && code >= 400 ? code : 500,
        isQuota: false,
        message: parsed.error.message,
      };
    }
  } catch {
    // Raw message is plain text
  }

  if (statusFromProp === 429 || raw.includes("429") || raw.includes("RESOURCE_EXHAUSTED")) {
    return {
      httpStatus: 429,
      isQuota: true,
      message:
        "Gemini API rate limit or quota exceeded (429). Please wait a moment and retry, or select a billing-enabled API key in Settings > Secrets.",
    };
  }

  return {
    httpStatus: statusFromProp && statusFromProp >= 400 ? statusFromProp : 500,
    isQuota: false,
    message: raw,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateResearchWithFallback(
  userPrompt: string,
  systemInstruction: string
) {
  const attempts: Array<{
    model: string;
    useSearch: boolean;
    thinkingLevel?: ThinkingLevel;
  }> = [
    { model: "gemini-4-hydrogen", useSearch: true, thinkingLevel: ThinkingLevel.MEDIUM },
    { model: "gemini-3.1-flash-lite", useSearch: true },
    { model: "gemini-3.1-flash-lite", useSearch: false },
  ];

  let lastError: unknown;
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    try {
      return await ai.models.generateContent({
        model: attempt.model,
        contents: userPrompt,
        config: {
          systemInstruction,
          ...(attempt.useSearch ? { tools: [{ googleSearch: {} }] } : { responseMimeType: "application/json" }),
          ...(attempt.thinkingLevel
            ? { thinkingConfig: { thinkingLevel: attempt.thinkingLevel } }
            : {}),
        },
      });
    } catch (err: unknown) {
      lastError = err;
      const info = parseApiError(err);
      if (!info.isQuota) {
        throw err;
      }
      if (i < attempts.length - 1) {
        await sleep(500);
      }
    }
  }
  throw lastError;
}

async function generateTranslationWithFallback(
  userPrompt: string,
  systemInstruction: string
) {
  const attempts: Array<{
    model: string;
    thinkingLevel?: ThinkingLevel;
  }> = [
    { model: "gemini-3.1-flash-lite" },
    { model: "gemini-4-hydrogen", thinkingLevel: ThinkingLevel.LOW },
  ];

  let lastError: unknown;
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    try {
      return await ai.models.generateContent({
        model: attempt.model,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          ...(attempt.thinkingLevel
            ? { thinkingConfig: { thinkingLevel: attempt.thinkingLevel } }
            : {}),
        },
      });
    } catch (err: unknown) {
      lastError = err;
      const info = parseApiError(err);
      if (!info.isQuota) {
        throw err;
      }
      if (i < attempts.length - 1) {
        await sleep(400);
      }
    }
  }
  throw lastError;
}

function extractJsonObject(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  const withoutFences = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(withoutFences) as Record<string, unknown>;
  } catch {
    const firstBrace = withoutFences.indexOf("{");
    const lastBrace = withoutFences.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(withoutFences.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function extractDomain(uri: string, title: string): string {
  try {
    const parsed = new URL(uri);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host.includes("vertexaisearch.cloud.google.com")) {
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes("islamqa")) return "islamqa.info";
      if (lowerTitle.includes("sunnah")) return "sunnah.com";
      if (lowerTitle.includes("quran")) return "quran.com";
      if (lowerTitle.includes("seekersguidance")) return "seekersguidance.org";
      if (lowerTitle.includes("binbaz")) return "binbaz.org.sa";
      if (lowerTitle.includes("dar-alifta")) return "dar-alifta.org";
      return title.trim() || "Scholarly Source";
    }
    return host;
  } catch {
    return title.trim() || "Scholarly Source";
  }
}

function normalizeGroundedSources(response: unknown): {
  sources: GroundedSource[];
  searchQueries: string[];
} {
  const candidate = (response as {
    candidates?: Array<{
      groundingMetadata?: {
        webSearchQueries?: string[];
        groundingChunks?: Array<{
          web?: { uri?: string; title?: string };
        }>;
      };
    }>;
  })?.candidates?.[0];

  const meta = candidate?.groundingMetadata;
  const searchQueries = Array.isArray(meta?.webSearchQueries)
    ? meta.webSearchQueries.filter((q): q is string => typeof q === "string" && q.trim().length > 0)
    : [];

  const chunks = Array.isArray(meta?.groundingChunks) ? meta.groundingChunks : [];
  const seen = new Set<string>();
  const sources: GroundedSource[] = [];

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri?.trim();
    const title = chunk?.web?.title?.trim() || "Islamic Scholarly Reference";
    if (!uri || seen.has(uri)) continue;
    const lowerUri = uri.toLowerCase();
    const lowerTitle = title.toLowerCase();
    const domain = extractDomain(uri, title);
    const lowerDomain = domain.toLowerCase();
    if (
      lowerUri.includes("islamweb") ||
      lowerTitle.includes("islamweb") ||
      lowerDomain.includes("islamweb")
    ) {
      continue;
    }
    if (lowerUri.includes("islamqa.info/ar/") || lowerUri.includes("islamqa.info/ar?")) {
      continue;
    }
    const isIslamQA =
      lowerUri.includes("islamqa.info") ||
      lowerDomain.includes("islamqa.info") ||
      lowerTitle.includes("islamqa") ||
      lowerTitle.includes("islam question & answer") ||
      title.includes("الإسلام سؤال وجواب");
    if (isIslamQA && /[\u0600-\u06FF]/.test(title)) {
      continue;
    }
    seen.add(uri);
    sources.push({ title, uri, domain, isIslamQA });
  }

  sources.sort((a, b) => Number(b.isIslamQA) - Number(a.isIslamQA));
  return { sources, searchQueries };
}

function buildSearchInstruction(
  scope: SearchScope,
  depth: ResearchDepth,
  language: AppLanguage
): string {
  const langName =
    language === "de"
      ? "German (Deutsch)"
      : language === "ur"
        ? "Urdu (اردو)"
        : language === "ar"
          ? "Arabic (العربية)"
          : "English";

  const scopeDirective =
    scope === "islamqa"
      ? `Prioritize searching the English IslamQA portal using site:islamqa.info/en (ALWAYS use islamqa.info/en and NEVER islamqa.info/ar or islamweb.net) for published fatwas, fatwa numbers, and scholarly rulings directly addressing this question.`
      : scope === "web"
        ? `Search across authentic, recognized Islamic scholarly portals and fatwa institutions on the web (such as seekersguidance.org, dar-alifta.org, binbaz.org.sa, sunnah.com, quran.com, and Fiqh councils—never islamweb.net).`
        : `Search BOTH site:islamqa.info/en (ALWAYS use islamqa.info/en and NEVER islamqa.info/ar) AND broader recognized Islamic scholarly websites (such as seekersguidance.org, sunnah.com, quran.com, binbaz.org.sa, dar-alifta.org—never islamweb.net) to synthesize a well-verified, primary-source-grounded answer.`;

  const depthDirective =
    depth === "concise"
      ? `Keep detailedAnalysis focused (2 to 3 crisp, substantive paragraphs) while still providing at least 3 Qur'an verses and at least 5 authentic Hadiths.`
      : `Provide a thorough, scholarly detailedAnalysis (4 to 6 structured paragraphs covering textual evidence, juristic reasoning, conditions/exceptions, and scholarly consensus or legitimate differences of opinion).`;

  return `You are an Islamic Jurisprudential Research Assistant for Fatwa Pro.
Your mandate:
1. ${scopeDirective}
2. MANDATORY MINIMUM PRIMARY TEXTUAL EVIDENCES FOR EVERY INQUIRY:
   - "quranReferences": ALWAYS include AT LEAST 3 distinct, topic-relevant verses from the Noble Qur'an (minimum 3 verses, 4–6 or more when helpful). Never return fewer than 3 Qur'an verses. Include the exact Surah name, verse number (e.g., "2:183"), authentic Arabic text with diacritics, faithful translation, and clear juristic relevance to the topic.
   - "hadithReferences": ALWAYS include AT LEAST 5 distinct, topic-relevant authentic Hadiths from canonical collections (Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami' at-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah, Muwatta Malik) (minimum 5 Hadiths, 6–8 or more when helpful). Never return fewer than 5 Hadiths.
   - For specialized or modern topics with fewer explicit mentions, cite both the direct textual proofs AND the foundational Qur'anic verses / Prophetic Hadiths that establish the governing Islamic legal principles (qawa'id fiqhiyyah) for the ruling.
3. Never invent or fabricate Qur'anic verse numbers, Arabic wording, or Hadith grading. Verify exact Surah:Ayah numbers, Hadith collection/book/number, and authenticity grading (Sahih, Hasan, Muttafaqun 'Alayh, etc.) via search.
4. Where scholars hold differing valid opinions (Ikhtilaf) across the four Sunni schools (Hanafi, Maliki, Shafi'i, Hanbali) or contemporary fatwa councils, present them fairly and respectfully.
5. ${depthDirective}
6. RESPONSE LANGUAGE REQUIREMENT: Write ALL explanatory text—including "title", "rulingSummary", "detailedAnalysis", "surahName", Qur'an and Hadith "translation" & "relevance", "collection", "narrator", "grade", "scholarlyPerspectives", "practicalGuidance", "relatedQuestions", and "fatwaSources"—in ${langName}. Keep "arabicText" in authentic original Arabic script with diacritics.
7. Maintain a dignified, neutral, academic tone. Do not include inline bracketed citation numbers like [1] or [2] inside JSON string fields.
8. REQUIRED "fatwaSources": ALWAYS include "fatwaSources" with two separate arrays:
   - "islamqa": ${scope === "web" ? "empty array [] unless an IslamQA.info ruling was directly verified" : "at least 1-2 entries summarizing the relevant IslamQA.info (islamqa.info/en) fatwa ruling/topic on this question"}
   - "others": ${scope === "islamqa" ? "empty array [] unless external sources were directly verified" : "at least 1-3 entries summarizing rulings/positions from other recognized Islamic fatwa portals or scholarly councils (e.g., Dar al-Ifta al-Misriyyah, Permanent Committee / al-Lajnah ad-Da'imah, SeekersGuidance, Ibn Baz, European Council for Fatwa and Research, or classical Fiqh works—never IslamWeb / islamweb.net)"}
   Only include a specific fatwa number in "reference" if you are certain it is verified; otherwise leave "reference" as "". Never invent URLs.

Return ONLY a valid JSON object (no markdown fences, no commentary outside the JSON) with this exact structure:
{
  "title": "Clear scholarly title for the inquiry",
  "rulingSummary": "A clear, balanced 2-3 sentence direct summary of the ruling and primary evidence.",
  "detailedAnalysis": [
    "Paragraph 1 explaining the foundational principles and primary textual proofs.",
    "Paragraph 2 explaining juristic application, conditions, and scholarly fatwas found.",
    "Paragraph 3 addressing nuances, exceptions, or contemporary context."
  ],
  "quranReferences": [
    {
      "surahName": "Surah Al-Baqarah",
      "verseNumber": "2:183",
      "arabicText": "Exact Arabic verse text with diacritics",
      "translation": "Clear faithful translation of the verse in ${langName}",
      "relevance": "Brief 1-sentence note on how this verse establishes the ruling"
    }
    /* REQUIRED: Provide AT LEAST 3 distinct topic-relevant Qur'an verses here (more allowed) */
  ],
  "hadithReferences": [
    {
      "collection": "Sahih al-Bukhari",
      "referenceNumber": "Global Hadith number from Sunnah.com first if known (e.g., 'Hadith 1086' or '1086'), optionally followed by Book/Hadith",
      "narrator": "Umar ibn al-Khattab (may Allah be pleased with him)",
      "grade": "Sahih (Authentic)",
      "arabicText": "Exact Arabic text of the hadith if accurately verified, otherwise omit or keep concise key wording",
      "translation": "Faithful translation of the Hadith in ${langName}",
      "relevance": "Brief 1-sentence explanation of its juristic relevance"
    }
    /* REQUIRED: Provide AT LEAST 5 distinct topic-relevant authentic Hadiths here (more allowed) */
  ],
  "scholarlyPerspectives": [
    {
      "schoolOrScholar": "IslamQA.info / Majority of Jurists (Jumhur)",
      "position": "Concise summary of this position and its primary rationale."
    }
  ],
  "practicalGuidance": [
    "Clear practical takeaway or condition to observe."
  ],
  "fatwaSources": {
    "islamqa": [
      {
        "sourceName": "IslamQA.info",
        "title": "Fatwa topic title on IslamQA.info",
        "reference": "Optional verified fatwa number or section, or empty string",
        "summary": "Brief 1-sentence note on the ruling/position referenced.",
        "searchQuery": "3-5 concise English keywords to find this ruling on islamqa.info/en"
      }
    ],
    "others": [
      {
        "sourceName": "e.g., Dar al-Ifta / Permanent Committee / SeekersGuidance / Ibn Baz",
        "title": "Fatwa or scholarly ruling title",
        "reference": "Optional reference or council name, or empty string",
        "summary": "Brief 1-sentence note on this scholarly source's position.",
        "searchQuery": "3-5 concise English keywords to find this ruling on the cited portal"
      }
    ]
  },
  "relatedQuestions": [
    "Follow-up question 1",
    "Follow-up question 2",
    "Follow-up question 3"
  ]
}`;
}

async function supplementMinimumEvidences(
  query: string,
  rulingSummary: string,
  langLabel: string,
  existingQuran: ResearchResult["quranReferences"],
  existingHadith: ResearchResult["hadithReferences"]
): Promise<{
  quranReferences: ResearchResult["quranReferences"];
  hadithReferences: ResearchResult["hadithReferences"];
}> {
  const missingQuran = Math.max(0, 3 - existingQuran.length);
  const missingHadith = Math.max(0, 5 - existingHadith.length);
  if (missingQuran === 0 && missingHadith === 0) {
    return { quranReferences: existingQuran, hadithReferences: existingHadith };
  }

  try {
    const supplementPrompt = `Topic/Inquiry: "${query}"
Ruling Summary: "${rulingSummary}"

Already cited Qur'an verses (${existingQuran.length}): ${existingQuran.map((q) => `${q.surahName} ${q.verseNumber}`).join(", ") || "None"}
Already cited Hadiths (${existingHadith.length}): ${existingHadith.map((h) => `${h.collection} ${h.referenceNumber}`).join(", ") || "None"}

Provide additional, non-duplicate, verified Islamic primary evidences directly relevant to this topic in ${langLabel}:
- ${missingQuran > 0 ? `Provide at least ${missingQuran} MORE distinct Qur'an verses (total needed >= 3).` : "No extra Qur'an verses needed (return empty array)."}
- ${missingHadith > 0 ? `Provide at least ${missingHadith} MORE distinct authentic Hadiths from canonical collections (total needed >= 5).` : "No extra Hadiths needed (return empty array)."}

Return ONLY valid JSON:
{
  "additionalQuran": [
    {
      "surahName": "Surah name in ${langLabel}",
      "verseNumber": "X:Y",
      "arabicText": "Exact Arabic verse text with diacritics",
      "translation": "Faithful translation in ${langLabel}",
      "relevance": "1-sentence explanation of relevance to the inquiry in ${langLabel}"
    }
  ],
  "additionalHadith": [
    {
      "collection": "Collection name in ${langLabel}",
      "referenceNumber": "Global Sunnah.com Hadith number if known (e.g., 'Hadith 1086')",
      "narrator": "Companion narrator in ${langLabel}",
      "grade": "Authenticity grade in ${langLabel}",
      "arabicText": "Exact Arabic wording if verified",
      "translation": "Faithful translation in ${langLabel}",
      "relevance": "1-sentence explanation of relevance to the inquiry in ${langLabel}"
    }
  ]
}`;

    const resp = await generateTranslationWithFallback(
      supplementPrompt,
      `You are an Islamic textual verification assistant. Never fabricate verses or hadiths. Return strictly valid JSON with verified Qur'an verses and authentic canonical Hadiths in ${langLabel}, keeping arabicText in original Arabic script.`
    );
    const parsed = extractJsonObject((resp.text ?? "").trim());
    if (!parsed) {
      return { quranReferences: existingQuran, hadithReferences: existingHadith };
    }

    const seenVerses = new Set(existingQuran.map((q) => q.verseNumber.trim().toLowerCase()));
    const extraQuran = Array.isArray(parsed.additionalQuran)
      ? parsed.additionalQuran
          .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
          .map((q) => ({
            surahName: String(q.surahName ?? "Noble Qur'an"),
            verseNumber: String(q.verseNumber ?? ""),
            arabicText: String(q.arabicText ?? ""),
            translation: String(q.translation ?? ""),
            relevance: String(q.relevance ?? ""),
          }))
          .filter((q) => {
            const key = q.verseNumber.trim().toLowerCase();
            if (!q.translation.trim() || (key && seenVerses.has(key))) return false;
            if (key) seenVerses.add(key);
            return true;
          })
      : [];

    const seenHadith = new Set(
      existingHadith.map((h) => `${h.collection}::${h.referenceNumber}`.trim().toLowerCase())
    );
    const extraHadith = Array.isArray(parsed.additionalHadith)
      ? parsed.additionalHadith
          .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
          .map((h) => ({
            collection: String(h.collection ?? "Hadith Collection"),
            referenceNumber: String(h.referenceNumber ?? ""),
            narrator: String(h.narrator ?? ""),
            grade: String(h.grade ?? "Authenticated"),
            arabicText: typeof h.arabicText === "string" ? h.arabicText : undefined,
            translation: String(h.translation ?? ""),
            relevance: String(h.relevance ?? ""),
          }))
          .filter((h) => {
            const key = `${h.collection}::${h.referenceNumber}`.trim().toLowerCase();
            if (!h.translation.trim() || seenHadith.has(key)) return false;
            seenHadith.add(key);
            return true;
          })
      : [];

    return {
      quranReferences: [...existingQuran, ...extraQuran],
      hadithReferences: [...existingHadith, ...extraHadith],
    };
  } catch (err) {
    console.warn("Supplement evidences notice:", err instanceof Error ? err.message : err);
    return { quranReferences: existingQuran, hadithReferences: existingHadith };
  }
}

function safeStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function parseFatwaSourceList(
  val: unknown,
  defaultSourceName: string
): FatwaSourceAttribution[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      sourceName:
        typeof item.sourceName === "string" && item.sourceName.trim()
          ? item.sourceName.trim()
          : defaultSourceName,
      title: typeof item.title === "string" ? item.title.trim() : "",
      reference:
        typeof item.reference === "string" && item.reference.trim()
          ? item.reference.trim()
          : undefined,
      summary: typeof item.summary === "string" ? item.summary.trim() : "",
      searchQuery:
        typeof item.searchQuery === "string" && item.searchQuery.trim()
          ? item.searchQuery.trim()
          : undefined,
    }))
    .filter(
      (item) =>
        (item.title.length > 0 || item.summary.length > 0) &&
        !item.sourceName.toLowerCase().includes("islamweb") &&
        !item.title.toLowerCase().includes("islamweb")
    );
}

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post("/api/research", async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        query?: string;
        scope?: SearchScope;
        depth?: ResearchDepth;
        language?: AppLanguage;
        priorContext?: string;
      };

      const query = typeof body.query === "string" ? body.query.trim() : "";
      if (!query) {
        res.status(400).json({ error: "Please enter an Islamic research question or topic." });
        return;
      }

      const scope: SearchScope =
        body.scope === "islamqa" || body.scope === "web" || body.scope === "all"
          ? body.scope
          : "all";
      const depth: ResearchDepth =
        body.depth === "concise" || body.depth === "comprehensive"
          ? body.depth
          : "comprehensive";
      const language: AppLanguage =
        body.language === "de" ||
        body.language === "ur" ||
        body.language === "ar" ||
        body.language === "en"
          ? body.language
          : "de";

      const langLabel =
        language === "de"
          ? "German (Deutsch)"
          : language === "ur"
            ? "Urdu (اردو)"
            : language === "ar"
              ? "Arabic (العربية)"
              : "English";

      const priorNote =
        typeof body.priorContext === "string" && body.priorContext.trim().length > 0
          ? `\n\nContext from the user's preceding inquiry in this research session:\n${body.priorContext.trim()}`
          : "";

      const userPrompt =
        scope === "islamqa"
          ? `Search site:islamqa.info/en (use the English section islamqa.info/en, not Arabic pages) and verify at least 3 topic-relevant Qur'an verses and at least 5 topic-relevant authentic Hadiths (more if helpful) to answer in ${langLabel}: "${query}"${priorNote}`
          : scope === "web"
            ? `Search recognized Islamic scholarly archives and fatwa councils across the internet (never islamweb.net), always citing at least 3 topic-relevant Qur'an verses and at least 5 topic-relevant authentic Hadiths (more if helpful), and answer in ${langLabel}: "${query}"${priorNote}`
            : `Search site:islamqa.info/en (use the English section islamqa.info/en, not Arabic pages) and broader recognized Islamic scholarly websites across the internet (never islamweb.net), always citing at least 3 topic-relevant Qur'an verses and at least 5 topic-relevant authentic Hadiths (more if helpful), and answer in ${langLabel}: "${query}"${priorNote}`;

      const response = await generateResearchWithFallback(
        userPrompt,
        buildSearchInstruction(scope, depth, language)
      );

      const rawText = (response.text ?? "").trim();
      const { sources, searchQueries } = normalizeGroundedSources(response);
      const parsed = extractJsonObject(rawText);

      const id = `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const timestamp = new Date().toISOString();

      if (parsed && typeof parsed.rulingSummary === "string") {
        const quranReferences = Array.isArray(parsed.quranReferences)
          ? parsed.quranReferences
              .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
              .map((q) => ({
                surahName: String(q.surahName ?? "Noble Qur'an"),
                verseNumber: String(q.verseNumber ?? ""),
                arabicText: String(q.arabicText ?? ""),
                translation: String(q.translation ?? ""),
                relevance: String(q.relevance ?? ""),
              }))
          : [];

        const hadithReferences = Array.isArray(parsed.hadithReferences)
          ? parsed.hadithReferences
              .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
              .map((h) => ({
                collection: String(h.collection ?? "Hadith Collection"),
                referenceNumber: String(h.referenceNumber ?? ""),
                narrator: String(h.narrator ?? ""),
                grade: String(h.grade ?? "Authenticated"),
                arabicText: typeof h.arabicText === "string" ? h.arabicText : undefined,
                translation: String(h.translation ?? ""),
                relevance: String(h.relevance ?? ""),
              }))
          : [];

        const scholarlyPerspectives = Array.isArray(parsed.scholarlyPerspectives)
          ? parsed.scholarlyPerspectives
              .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
              .map((p) => ({
                schoolOrScholar: String(p.schoolOrScholar ?? "Scholarly Position"),
                position: String(p.position ?? ""),
              }))
          : [];

        const rawFatwaSources =
          parsed.fatwaSources && typeof parsed.fatwaSources === "object"
            ? (parsed.fatwaSources as Record<string, unknown>)
            : null;

        const fatwaSources: FatwaSourcesBreakdown = {
          islamqa: parseFatwaSourceList(rawFatwaSources?.islamqa, "IslamQA.info"),
          others: parseFatwaSourceList(rawFatwaSources?.others, "Scholarly Portal"),
        };

        const ensuredEvidences = await supplementMinimumEvidences(
          query,
          parsed.rulingSummary,
          langLabel,
          quranReferences,
          hadithReferences
        );

        const result: ResearchResult = {
          id,
          query,
          scope,
          depth,
          language,
          timestamp,
          title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : query,
          rulingSummary: parsed.rulingSummary,
          detailedAnalysis: safeStringArray(parsed.detailedAnalysis),
          quranReferences: ensuredEvidences.quranReferences,
          hadithReferences: ensuredEvidences.hadithReferences,
          scholarlyPerspectives,
          practicalGuidance: safeStringArray(parsed.practicalGuidance),
          relatedQuestions: safeStringArray(parsed.relatedQuestions),
          groundedSources: sources,
          fatwaSources,
          searchQueriesUsed: searchQueries,
        };

        res.json(result);
        return;
      }

      const fallbackResult: ResearchResult = {
        id,
        query,
        scope,
        depth,
        language,
        timestamp,
        title: query,
        rulingSummary: "Detailed scholarly synthesis retrieved from live Islamic search sources.",
        detailedAnalysis: [],
        quranReferences: [],
        hadithReferences: [],
        scholarlyPerspectives: [],
        practicalGuidance: [],
        relatedQuestions: [],
        groundedSources: sources,
        searchQueriesUsed: searchQueries,
        rawFallbackMarkdown: rawText || "No response text was returned.",
      };

      res.json(fallbackResult);
    } catch (err: unknown) {
      const info = parseApiError(err);
      console.warn(`Research API notice (${info.httpStatus}): ${info.message}`);
      res.status(info.httpStatus).json({ error: info.message, code: info.httpStatus });
    }
  });

  app.post("/api/inspect-source", async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        url?: string;
        title?: string;
        query?: string;
        language?: AppLanguage;
      };

      const url = typeof body.url === "string" ? body.url.trim() : "";
      const title = typeof body.title === "string" ? body.title.trim() : "Scholarly Source";
      const query = typeof body.query === "string" ? body.query.trim() : "";
      const language: AppLanguage =
        body.language === "de" ||
        body.language === "ur" ||
        body.language === "ar" ||
        body.language === "en"
          ? body.language
          : "de";
      const langLabel =
        language === "de"
          ? "German (Deutsch)"
          : language === "ur"
            ? "Urdu (اردو)"
            : language === "ar"
              ? "Arabic (العربية)"
              : "English";

      if (!url) {
        res.status(400).json({ error: "Source URL is required." });
        return;
      }

      const prompt = `Read and analyze the Islamic fatwa or scholarly article at ${url} (titled "${title}") in relation to the inquiry "${query}".
Extract the core fatwa ruling, key textual evidences cited on that page, and list any Qur'an verses and Hadith narrations mentioned there.
Write ALL output text in ${langLabel}.
Return ONLY valid JSON with this structure:
{
  "summary": "Concise 3-4 sentence summary of the exact fatwa or scholarly article in ${langLabel}.",
  "keyEvidences": ["Key point or juristic evidence 1 in ${langLabel}", "Key point 2"],
  "quranMentions": ["Surah Name (X:Y) - brief note in ${langLabel}"],
  "hadithMentions": ["Hadith Collection & reference - brief note in ${langLabel}"]
}`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-4-hydrogen",
          contents: prompt,
          config: {
            tools: [{ urlContext: {} }, { googleSearch: {} }],
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });
      } catch (primaryErr: unknown) {
        if (!parseApiError(primaryErr).isQuota) {
          throw primaryErr;
        }
        await sleep(500);
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: {
              tools: [{ urlContext: {} }],
            },
          });
        } catch (secondaryErr: unknown) {
          if (!parseApiError(secondaryErr).isQuota) {
            throw secondaryErr;
          }
          let pageSnippet = "";
          try {
            const pageRes = await fetch(url, {
              headers: { "User-Agent": "Mozilla/5.0" },
              signal: AbortSignal.timeout(6000),
            });
            if (pageRes.ok) {
              const html = await pageRes.text();
              const ldMatch = html.match(
                /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i
              );
              if (ldMatch?.[1]) {
                pageSnippet = ldMatch[1].slice(0, 8000);
              } else {
                pageSnippet = html
                  .replace(/<script[\s\S]*?<\/script>/gi, " ")
                  .replace(/<style[\s\S]*?<\/style>/gi, " ")
                  .replace(/<[^>]+>/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 6000);
              }
            }
          } catch {
            // Direct page fetch failed; proceed with model fallback if possible
          }

          await sleep(500);
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: pageSnippet
              ? `${prompt}\n\nExtracted page content from ${url}:\n${pageSnippet}`
              : prompt,
          });
        }
      }

      const rawText = (response.text ?? "").trim();
      const parsed = extractJsonObject(rawText);

      const inspected: InspectedSourceResult = {
        url,
        title,
        language,
        summary:
          parsed && typeof parsed.summary === "string"
            ? parsed.summary
            : rawText || "Unable to extract detailed summary from this URL.",
        keyEvidences: parsed ? safeStringArray(parsed.keyEvidences) : [],
        quranMentions: parsed ? safeStringArray(parsed.quranMentions) : [],
        hadithMentions: parsed ? safeStringArray(parsed.hadithMentions) : [],
      };

      res.json(inspected);
    } catch (err: unknown) {
      const info = parseApiError(err);
      console.warn(`Inspect source notice (${info.httpStatus}): ${info.message}`);
      res.status(info.httpStatus).json({ error: info.message, code: info.httpStatus });
    }
  });

  app.post("/api/translate", async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        result?: ResearchResult;
        targetLanguage?: AppLanguage;
        inspectedExtracts?: InspectedSourceResult[];
      };

      const sourceResult = body.result;
      const targetLanguage: AppLanguage =
        body.targetLanguage === "de" ||
        body.targetLanguage === "ur" ||
        body.targetLanguage === "ar" ||
        body.targetLanguage === "en"
          ? body.targetLanguage
          : "de";

      if (!sourceResult || typeof sourceResult !== "object") {
        res.status(400).json({ error: "A valid research dossier is required for translation." });
        return;
      }

      const extracts = Array.isArray(body.inspectedExtracts)
        ? body.inspectedExtracts
        : [];

      if (
        sourceResult.language === targetLanguage &&
        extracts.every((ex) => ex.language === targetLanguage)
      ) {
        res.json({ result: sourceResult, inspectedExtracts: extracts });
        return;
      }

      const targetLangLabel =
        targetLanguage === "de"
          ? "German (Deutsch)"
          : targetLanguage === "ur"
            ? "Urdu (اردو)"
            : targetLanguage === "ar"
              ? "Arabic (العربية)"
              : "English";

      const translatablePayload = {
        query: sourceResult.query,
        title: sourceResult.title,
        rulingSummary: sourceResult.rulingSummary,
        detailedAnalysis: Array.isArray(sourceResult.detailedAnalysis)
          ? sourceResult.detailedAnalysis
          : [],
        quranReferences: Array.isArray(sourceResult.quranReferences)
          ? sourceResult.quranReferences.map((q) => ({
              surahName: q.surahName,
              translation: q.translation,
              relevance: q.relevance,
            }))
          : [],
        hadithReferences: Array.isArray(sourceResult.hadithReferences)
          ? sourceResult.hadithReferences.map((h) => ({
              collection: h.collection,
              referenceNumber: h.referenceNumber,
              narrator: h.narrator,
              grade: h.grade,
              translation: h.translation,
              relevance: h.relevance,
            }))
          : [],
        scholarlyPerspectives: Array.isArray(sourceResult.scholarlyPerspectives)
          ? sourceResult.scholarlyPerspectives.map((p) => ({
              schoolOrScholar: p.schoolOrScholar,
              position: p.position,
            }))
          : [],
        practicalGuidance: Array.isArray(sourceResult.practicalGuidance)
          ? sourceResult.practicalGuidance
          : [],
        fatwaSources: {
          islamqa: Array.isArray(sourceResult.fatwaSources?.islamqa)
            ? sourceResult.fatwaSources.islamqa.map((f) => ({
                sourceName: f.sourceName,
                title: f.title,
                reference: f.reference ?? "",
                summary: f.summary,
              }))
            : [],
          others: Array.isArray(sourceResult.fatwaSources?.others)
            ? sourceResult.fatwaSources.others.map((f) => ({
                sourceName: f.sourceName,
                title: f.title,
                reference: f.reference ?? "",
                summary: f.summary,
              }))
            : [],
        },
        relatedQuestions: Array.isArray(sourceResult.relatedQuestions)
          ? sourceResult.relatedQuestions
          : [],
        ...(typeof sourceResult.rawFallbackMarkdown === "string" &&
        sourceResult.rawFallbackMarkdown.trim()
          ? { rawFallbackMarkdown: sourceResult.rawFallbackMarkdown }
          : {}),
        inspectedExtracts: extracts.map((ex) => ({
          summary: ex.summary,
          keyEvidences: Array.isArray(ex.keyEvidences) ? ex.keyEvidences : [],
          quranMentions: Array.isArray(ex.quranMentions) ? ex.quranMentions : [],
          hadithMentions: Array.isArray(ex.hadithMentions) ? ex.hadithMentions : [],
        })),
      };

      const systemInstruction = `You are an expert Islamic scholarly translator for Fatwa Pro.
Translate ALL string values in the provided JSON object accurately and naturally into ${targetLangLabel} while maintaining a dignified academic fiqh register.
Rules:
1. Return ONLY a valid JSON object with the exact same keys, array lengths, and structure as the input JSON.
2. Translate every human-readable string (including "query", "title", "rulingSummary", every element of "detailedAnalysis", "surahName", "collection", "referenceNumber", "narrator", "grade", "translation", "relevance", "schoolOrScholar", "position", "practicalGuidance", "relatedQuestions", and "inspectedExtracts").
3. Preserve Qur'anic Surah:Ayah numbers, Hadith numbers, and scholarly accuracy faithfully. Keep standard Islamic honorifics appropriate for ${targetLangLabel}.
4. Do NOT omit any array items or keys.`;

      const response = await generateTranslationWithFallback(
        JSON.stringify(translatablePayload),
        systemInstruction
      );

      const rawText = (response.text ?? "").trim();
      const parsed = extractJsonObject(rawText);
      if (!parsed) {
        throw new Error("Translation returned an unreadable response.");
      }

      const translatedQuran = Array.isArray(parsed.quranReferences)
        ? parsed.quranReferences
        : [];
      const translatedHadith = Array.isArray(parsed.hadithReferences)
        ? parsed.hadithReferences
        : [];
      const translatedPerspectives = Array.isArray(parsed.scholarlyPerspectives)
        ? parsed.scholarlyPerspectives
        : [];
      const translatedExtractsRaw = Array.isArray(parsed.inspectedExtracts)
        ? parsed.inspectedExtracts
        : [];

      const mergedResult: ResearchResult = {
        ...sourceResult,
        language: targetLanguage,
        query:
          typeof parsed.query === "string" && parsed.query.trim()
            ? parsed.query.trim()
            : sourceResult.query,
        title:
          typeof parsed.title === "string" && parsed.title.trim()
            ? parsed.title.trim()
            : sourceResult.title,
        rulingSummary:
          typeof parsed.rulingSummary === "string" && parsed.rulingSummary.trim()
            ? parsed.rulingSummary.trim()
            : sourceResult.rulingSummary,
        detailedAnalysis:
          safeStringArray(parsed.detailedAnalysis).length > 0
            ? safeStringArray(parsed.detailedAnalysis)
            : sourceResult.detailedAnalysis,
        quranReferences: sourceResult.quranReferences.map((orig, idx) => {
          const item = translatedQuran[idx] as Record<string, unknown> | undefined;
          if (!item || typeof item !== "object") return orig;
          return {
            ...orig,
            surahName:
              typeof item.surahName === "string" && item.surahName.trim()
                ? item.surahName
                : orig.surahName,
            translation:
              typeof item.translation === "string" && item.translation.trim()
                ? item.translation
                : orig.translation,
            relevance:
              typeof item.relevance === "string"
                ? item.relevance
                : orig.relevance,
          };
        }),
        hadithReferences: sourceResult.hadithReferences.map((orig, idx) => {
          const item = translatedHadith[idx] as Record<string, unknown> | undefined;
          if (!item || typeof item !== "object") return orig;
          return {
            ...orig,
            collection:
              typeof item.collection === "string" && item.collection.trim()
                ? item.collection
                : orig.collection,
            referenceNumber:
              typeof item.referenceNumber === "string" && item.referenceNumber.trim()
                ? item.referenceNumber
                : orig.referenceNumber,
            narrator:
              typeof item.narrator === "string" ? item.narrator : orig.narrator,
            grade:
              typeof item.grade === "string" && item.grade.trim()
                ? item.grade
                : orig.grade,
            translation:
              typeof item.translation === "string" && item.translation.trim()
                ? item.translation
                : orig.translation,
            relevance:
              typeof item.relevance === "string"
                ? item.relevance
                : orig.relevance,
          };
        }),
        scholarlyPerspectives: sourceResult.scholarlyPerspectives.map((orig, idx) => {
          const item = translatedPerspectives[idx] as Record<string, unknown> | undefined;
          if (!item || typeof item !== "object") return orig;
          return {
            schoolOrScholar:
              typeof item.schoolOrScholar === "string" && item.schoolOrScholar.trim()
                ? item.schoolOrScholar
                : orig.schoolOrScholar,
            position:
              typeof item.position === "string" && item.position.trim()
                ? item.position
                : orig.position,
          };
        }),
        practicalGuidance:
          safeStringArray(parsed.practicalGuidance).length > 0
            ? safeStringArray(parsed.practicalGuidance)
            : sourceResult.practicalGuidance,
        fatwaSources: (() => {
          const origFatwa = sourceResult.fatwaSources;
          const rawFs =
            parsed.fatwaSources && typeof parsed.fatwaSources === "object"
              ? (parsed.fatwaSources as Record<string, unknown>)
              : null;
          if (!origFatwa) return undefined;
          const translatedIslamqa = parseFatwaSourceList(
            rawFs?.islamqa,
            "IslamQA.info"
          );
          const translatedOthers = parseFatwaSourceList(
            rawFs?.others,
            "Scholarly Portal"
          );
          return {
            islamqa:
              translatedIslamqa.length > 0
                ? translatedIslamqa.map((item, idx) => ({
                    ...item,
                    searchQuery: item.searchQuery ?? origFatwa.islamqa[idx]?.searchQuery,
                  }))
                : origFatwa.islamqa,
            others:
              translatedOthers.length > 0
                ? translatedOthers.map((item, idx) => ({
                    ...item,
                    searchQuery: item.searchQuery ?? origFatwa.others[idx]?.searchQuery,
                  }))
                : origFatwa.others,
          };
        })(),
        relatedQuestions:
          safeStringArray(parsed.relatedQuestions).length > 0
            ? safeStringArray(parsed.relatedQuestions)
            : sourceResult.relatedQuestions,
        ...(typeof parsed.rawFallbackMarkdown === "string" &&
        parsed.rawFallbackMarkdown.trim()
          ? { rawFallbackMarkdown: parsed.rawFallbackMarkdown }
          : {}),
      };

      const mergedExtracts: InspectedSourceResult[] = extracts.map((orig, idx) => {
        const item = translatedExtractsRaw[idx] as Record<string, unknown> | undefined;
        if (!item || typeof item !== "object") return orig;
        return {
          ...orig,
          language: targetLanguage,
          summary:
            typeof item.summary === "string" && item.summary.trim()
              ? item.summary
              : orig.summary,
          keyEvidences:
            safeStringArray(item.keyEvidences).length > 0
              ? safeStringArray(item.keyEvidences)
              : orig.keyEvidences,
          quranMentions:
            safeStringArray(item.quranMentions).length > 0
              ? safeStringArray(item.quranMentions)
              : orig.quranMentions,
          hadithMentions:
            safeStringArray(item.hadithMentions).length > 0
              ? safeStringArray(item.hadithMentions)
              : orig.hadithMentions,
        };
      });

      res.json({ result: mergedResult, inspectedExtracts: mergedExtracts });
    } catch (err: unknown) {
      const info = parseApiError(err);
      console.warn(`Translate API notice (${info.httpStatus}): ${info.message}`);
      res.status(info.httpStatus).json({ error: info.message, code: info.httpStatus });
    }
  });

  app.post(
    "/api/transcribe",
    express.json({ limit: "12mb" }),
    async (req: Request, res: Response) => {
      try {
        const body = req.body as {
          audioBase64?: string;
          mimeType?: string;
          language?: AppLanguage;
        };

        const audioBase64 =
          typeof body.audioBase64 === "string" ? body.audioBase64.trim() : "";
        if (!audioBase64) {
          res.status(400).json({ error: "Audio data is required." });
          return;
        }

        const rawMime =
          typeof body.mimeType === "string" && body.mimeType.trim()
            ? body.mimeType.split(";")[0].trim()
            : "audio/webm";

        const language: AppLanguage =
          body.language === "de" ||
          body.language === "ur" ||
          body.language === "ar" ||
          body.language === "en"
            ? body.language
            : "de";

        const instructionText =
          language === "de"
            ? "Listen to the audio and transcribe ONLY the exact spoken German (Deutsch) words into clean German text. Do NOT guess or invent words if there is no speech. If the audio is silent, contains only noise, or has no intelligible spoken words, output exact token: [NO_SPEECH]. Otherwise output ONLY the verbatim German transcript."
            : language === "ur"
              ? "Listen to the audio and transcribe ONLY the exact spoken Urdu (اردو) words into proper Urdu Arabic/Nastaliq script (اردو رسم الخط), NOT Roman Urdu. Do NOT guess or invent words if there is no speech. If the audio is silent, contains only noise, or has no intelligible spoken words, output exact token: [NO_SPEECH]. Otherwise output ONLY the verbatim Urdu transcript."
              : language === "ar"
                ? "Listen to the audio and transcribe ONLY the exact spoken Arabic (العربية) words into clean Arabic script (الفصحى أو بحسب نطق المتحدث). Do NOT guess or invent words if there is no speech. If the audio is silent, contains only noise, or has no intelligible spoken words, output exact token: [NO_SPEECH]. Otherwise output ONLY the verbatim Arabic transcript."
                : "Listen to the audio and transcribe ONLY the exact spoken English words into clean English text. Do NOT guess or invent words if there is no speech. If the audio is silent, contains only noise, or has no intelligible spoken words, output exact token: [NO_SPEECH]. Otherwise output ONLY the verbatim English transcript.";

        const audioPart = {
          inlineData: {
            mimeType: rawMime,
            data: audioBase64,
          },
        };

        const transcribeModels = ["gemini-3.5-transcribe", "gemini-3.1-flash-lite"];
        let response;
        let lastErr: unknown;

        for (let i = 0; i < transcribeModels.length; i++) {
          try {
            response = await ai.models.generateContent({
              model: transcribeModels[i],
              contents: { parts: [audioPart, { text: instructionText }] },
            });
            break;
          } catch (err: unknown) {
            lastErr = err;
            const info = parseApiError(err);
            if (!info.isQuota && info.httpStatus !== 404) {
              throw err;
            }
            if (i < transcribeModels.length - 1) {
              await sleep(300);
            }
          }
        }

        if (!response) {
          throw lastErr;
        }

        const rawOut = (response.text ?? "").trim();
        const text =
          !rawOut || rawOut.includes("[NO_SPEECH]") ? "" : rawOut;
        res.json({ text, language });
      } catch (err: unknown) {
        const info = parseApiError(err);
        console.warn(`Transcribe API notice (${info.httpStatus}): ${info.message}`);
        res.status(info.httpStatus).json({ error: info.message, code: info.httpStatus });
      }
    }
  );

  return app;
}

async function startServer() {
  const app = createApp();
  const httpServer = createHttpServer(app);
  const port = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
        ws: { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir, { dotfiles: "allow" }));
    app.get("/.well-known/{*splat}", (_req: Request, res: Response) => {
      res.status(404).json({ error: "Digital Asset Links file not configured yet." });
    });
    app.get("/{*splat}", (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Fatwa Pro running on http://0.0.0.0:${port}`);
  });
}

startServer();
