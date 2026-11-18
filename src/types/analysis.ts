export type RiskLevel = 'Low' | 'Medium' | 'High';

export type DocumentCategory =
  | 'Terms & Conditions'
  | 'Privacy Policy'
  | 'Rental Agreement'
  | 'Employment Contract'
  | 'Insurance Policy'
  | 'Subscription Agreement'
  | 'Other';

export interface AnalyzedClause {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  simpleExplanation: string;
  whyItMatters: string;
  riskLevel: RiskLevel;
  recommendedAction: string;
}

export interface PrivacyAnalysis {
  personalDataCollected: string;
  thirdPartySharing: string;
  howInfoIsUsed: string;
  dataRetentionExplained: string;
  deletionOptionsMentioned: string;
}

export interface DocumentAnalysisResult {
  id: string;
  documentName: string;
  category: DocumentCategory;
  analyzedAt: string;
  wordCount: number;
  riskScore: number;
  riskLabel: 'Lower identified concern' | 'Moderate identified concern' | 'Higher identified concern';
  riskDerivationNote: string;
  summaryParagraphs: string[];
  clauses: AnalyzedClause[];
  privacyAnalysis: PrivacyAnalysis;
  checklistQuestions: string[];
  missingOrUnclear: string[];
  counts: {
    totalClauses: number;
    concerningClauses: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface HistoryEntry {
  id: string;
  documentName: string;
  category: DocumentCategory;
  analyzedAt: string;
  wordCount: number;
  riskScore: number;
  riskLabel: DocumentAnalysisResult['riskLabel'];
  result: DocumentAnalysisResult;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ComparisonDiffItem {
  topic: string;
  documentA: string;
  documentB: string;
  impactLevel: RiskLevel;
  explanation: string;
}

export interface DocumentComparisonResult {
  docAName: string;
  docBName: string;
  overallSummary: string;
  importantClauseDifferences: ComparisonDiffItem[];
  privacyPolicyDifferences: ComparisonDiffItem[];
  subscriptionConditionDifferences: ComparisonDiffItem[];
  newOrRemovedObligations: string[];
  potentiallyConcerningChanges: string[];
}
