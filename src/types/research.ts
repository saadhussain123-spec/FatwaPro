export type AppLanguage = "de" | "en" | "ur" | "ar";
export type SearchScope = "all" | "islamqa" | "web";
export type ResearchDepth = "comprehensive" | "concise";

export interface QuranReference {
  surahName: string;
  verseNumber: string;
  arabicText: string;
  translation: string;
  relevance: string;
}

export interface HadithReference {
  collection: string;
  referenceNumber: string;
  narrator: string;
  grade: string;
  arabicText?: string;
  translation: string;
  relevance: string;
}

export interface ScholarlyPerspective {
  schoolOrScholar: string;
  position: string;
}

export interface GroundedSource {
  title: string;
  uri: string;
  domain: string;
  isIslamQA: boolean;
}

export interface FatwaSourceAttribution {
  sourceName: string;
  title: string;
  reference?: string;
  summary: string;
  searchQuery?: string;
}

export interface FatwaSourcesBreakdown {
  islamqa: FatwaSourceAttribution[];
  others: FatwaSourceAttribution[];
}

export interface ResearchResult {
  id: string;
  query: string;
  scope: SearchScope;
  depth: ResearchDepth;
  language?: AppLanguage;
  timestamp: string;
  title: string;
  rulingSummary: string;
  detailedAnalysis: string[];
  quranReferences: QuranReference[];
  hadithReferences: HadithReference[];
  scholarlyPerspectives: ScholarlyPerspective[];
  practicalGuidance: string[];
  relatedQuestions: string[];
  groundedSources: GroundedSource[];
  fatwaSources?: FatwaSourcesBreakdown;
  searchQueriesUsed: string[];
  rawFallbackMarkdown?: string;
}

export interface InspectedSourceResult {
  url: string;
  title: string;
  language?: AppLanguage;
  summary: string;
  keyEvidences: string[];
  quranMentions: string[];
  hadithMentions: string[];
}

export interface ResearchThreadItem {
  query: string;
  result: ResearchResult;
  variants?: Partial<Record<AppLanguage, ResearchResult>>;
}
