export interface SectionResult {
  name: string;
  found: boolean;
  message: string;
}

export interface AnalysisResult {
  score: number;
  scoreBreakdown: {
    keywordScore: number;
    sectionScore: number;
    lengthScore: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  sections: SectionResult[];
  suggestions: string[];
  wordCount: number;
}

export type Theme = 'light' | 'dark';