import type {
  FatwaSourceAttribution,
  GroundedSource,
  HadithReference,
  QuranReference,
} from "../types/research";

const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const EASTERN_INDIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function normalizeNumerals(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC_DIGITS.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String(EASTERN_INDIC_DIGITS.indexOf(d)));
}

export function getQuranComLink(verse: QuranReference): {
  url: string;
  label: string;
} {
  const normalizedRef = normalizeNumerals(verse.verseNumber || "");
  const normalizedSurah = normalizeNumerals(verse.surahName || "");
  const combined = `${normalizedRef} ${normalizedSurah}`;

  const match = combined.match(/(\d{1,3})\s*[:：/]\s*(\d{1,3}(?:\s*-\s*\d{1,3})?)/);
  if (match) {
    const surah = Number(match[1]);
    const ayahRange = match[2].replace(/\s+/g, "");
    if (surah >= 1 && surah <= 114) {
      return {
        url: `https://quran.com/${surah}/${ayahRange}`,
        label: `quran.com/${surah}/${ayahRange}`,
      };
    }
  }

  const query = `${verse.surahName} ${verse.verseNumber}`.trim();
  return {
    url: `https://quran.com/search?q=${encodeURIComponent(query)}`,
    label: "quran.com",
  };
}

const SUNNAH_COLLECTION_SLUGS: Array<{ keywords: string[]; slug: string }> = [
  { keywords: ["bukhari", "al-bukhari", "بخاري", "بخاری"], slug: "bukhari" },
  { keywords: ["muslim", "مسلم"], slug: "muslim" },
  {
    keywords: ["abu dawud", "abi dawud", "abu dawood", "abudawud", "أبي داود", "ابو داؤد", "ابو داود"],
    slug: "abudawud",
  },
  { keywords: ["tirmidhi", "at-tirmidhi", "ترمذي", "ترمذی"], slug: "tirmidhi" },
  { keywords: ["nasai", "nasa'i", "nasa’i", "an-nasai", "نسائي", "نسائی"], slug: "nasai" },
  { keywords: ["ibn majah", "ibnmajah", "ابن ماجه", "ابن ماجہ"], slug: "ibnmajah" },
  { keywords: ["muwatta", "malik", "موطأ", "مؤطا"], slug: "malik" },
  { keywords: ["riyad", "riyadh", "رياض الصالحين"], slug: "riyadussalihin" },
  { keywords: ["nawawi", "forty hadith", "40 hadith", "arbaeen", "الأربعون"], slug: "nawawi40" },
  { keywords: ["adab al-mufrad", "al-adab al-mufrad", "الأدب المفرد"], slug: "adab" },
  { keywords: ["bulugh", "بلوغ المرام"], slug: "bulugh" },
  { keywords: ["mishkat", "مشكاة"], slug: "mishkat" },
  { keywords: ["darimi", "الدارمي"], slug: "darimi" },
  { keywords: ["ahmad", "musnad ahmad", "مسند أحمد", "أحمد"], slug: "ahmad" },
  { keywords: ["shamail", "shama'il", "الشمائل"], slug: "shamail" },
];

function detectSunnahSlug(collection: string): string | null {
  const norm = collection.toLowerCase().replace(/[`’']/g, "'");
  for (const entry of SUNNAH_COLLECTION_SLUGS) {
    if (entry.keywords.some((kw) => norm.includes(kw))) {
      return entry.slug;
    }
  }
  return null;
}

function extractGlobalHadithNumber(referenceNumber: string): string | null {
  const norm = normalizeNumerals(referenceNumber || "").trim();
  if (!norm) return null;

  // Strip "Book X, Hadith Y" / "Buch X, Hadith Y" / "Kitab X..." clauses so we don't confuse in-book numbers
  const withoutBookClause = norm
    .replace(/\b(?:book|buch|kitab|chapter|kapitel|vol\.?|volume)\s+\d+[^/;|]*/gi, " ")
    .replace(/(?:كتاب|باب|جلد)\s*\d+[^/;|]*/g, " ");

  const explicitMatch = withoutBookClause.match(
    /(?:hadith|nr\.?|no\.?|#|number|رقم|حديث|حدیث)?\s*(\d{1,5}[a-z]?)(?:\b|$)/i
  );
  if (explicitMatch?.[1]) {
    return explicitMatch[1];
  }

  return null;
}

export function getSunnahComLink(hadith: HadithReference): {
  url: string;
  label: string;
} {
  const slug = detectSunnahSlug(hadith.collection || "");
  const hadithNum = extractGlobalHadithNumber(hadith.referenceNumber || "");

  if (slug && hadithNum) {
    return {
      url: `https://sunnah.com/${slug}:${hadithNum}`,
      label: `sunnah.com/${slug}:${hadithNum}`,
    };
  }

  const searchTerms = [
    slug || hadith.collection,
    normalizeNumerals(hadith.referenceNumber || ""),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    url: `https://sunnah.com/search?q=${encodeURIComponent(searchTerms || hadith.translation.slice(0, 60))}`,
    label: "sunnah.com",
  };
}

export function getFatwaSourceLink(
  item: FatwaSourceAttribution,
  isIslamQA: boolean,
  groundedSources: GroundedSource[]
): { url: string; domainLabel: string } {
  const refNorm = normalizeNumerals(item.reference || "").trim();
  const refDigits = refNorm.match(/\b(\d{3,7})\b/)?.[1];

  if (isIslamQA) {
    if (refDigits) {
      const matchedLive = groundedSources.find(
        (s) =>
          s.isIslamQA &&
          (s.uri.includes(refDigits) || s.title.includes(refDigits))
      );
      if (matchedLive) {
        return { url: matchedLive.uri, domainLabel: matchedLive.domain };
      }
    }

    const q = refDigits || item.searchQuery?.trim() || item.title.trim();
    return {
      url: `https://islamqa.info/en/search?q=${encodeURIComponent(q)}`,
      domainLabel: "islamqa.info/en",
    };
  }

  const lowerName = (item.sourceName || "").toLowerCase();
  const matchedExternal = groundedSources.find(
    (s) =>
      !s.isIslamQA &&
      !s.domain.toLowerCase().includes("islamweb") &&
      (lowerName.includes(s.domain.toLowerCase().split(".")[0]) ||
        s.title.toLowerCase().includes(lowerName))
  );
  if (matchedExternal) {
    return { url: matchedExternal.uri, domainLabel: matchedExternal.domain };
  }

  const queryTerm = item.searchQuery?.trim() || item.title.trim() || refNorm;

  if (lowerName.includes("seekersguidance")) {
    return {
      url: `https://seekersguidance.org/?s=${encodeURIComponent(queryTerm)}`,
      domainLabel: "seekersguidance.org",
    };
  }
  if (lowerName.includes("sunnah")) {
    return {
      url: `https://sunnah.com/search?q=${encodeURIComponent(refNorm || queryTerm)}`,
      domainLabel: "sunnah.com",
    };
  }
  if (lowerName.includes("quran")) {
    return {
      url: `https://quran.com/search?q=${encodeURIComponent(refNorm || queryTerm)}`,
      domainLabel: "quran.com",
    };
  }
  if (lowerName.includes("binbaz") || lowerName.includes("ibn baz") || lowerName.includes("بن باز")) {
    return {
      url: `https://binbaz.org.sa/search?q=${encodeURIComponent(item.title.trim() || queryTerm)}`,
      domainLabel: "binbaz.org.sa",
    };
  }
  if (lowerName.includes("dar al-ifta") || lowerName.includes("dar-alifta") || lowerName.includes("دار الإفتاء")) {
    return {
      url: `https://www.dar-alifta.org/en/search?q=${encodeURIComponent(queryTerm)}`,
      domainLabel: "dar-alifta.org",
    };
  }
  if (lowerName.includes("european council") || lowerName.includes("ecfr")) {
    return {
      url: `https://www.e-cfr.org/?s=${encodeURIComponent(queryTerm)}`,
      domainLabel: "e-cfr.org",
    };
  }

  const fullLookup = `${item.sourceName} ${item.searchQuery || item.title} ${refNorm}`.trim();
  return {
    url: `https://www.google.com/search?q=${encodeURIComponent(fullLookup)}`,
    domainLabel: item.sourceName,
  };
}
