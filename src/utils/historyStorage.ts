import type { DocumentAnalysisResult, HistoryEntry } from '../types/analysis.ts';

const HISTORY_STORAGE_KEY = 'agreewise_analysis_history_v1';
const MAX_HISTORY_ITEMS = 25;

/**
 * Retrieves analysis history from browser LocalStorage.
 * Note: Raw uploaded/pasted document text is intentionally never stored in LocalStorage.
 */
export function loadAnalysisHistory(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveAnalysisToHistory(result: DocumentAnalysisResult): HistoryEntry[] {
  const existing = loadAnalysisHistory();
  const entry: HistoryEntry = {
    id: result.id,
    documentName: result.documentName,
    category: result.category,
    analyzedAt: result.analyzedAt,
    wordCount: result.wordCount,
    riskScore: result.riskScore,
    riskLabel: result.riskLabel,
    result,
  };

  const updated = [entry, ...existing.filter((item) => item.id !== entry.id)].slice(
    0,
    MAX_HISTORY_ITEMS
  );

  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Handle storage quota errors gracefully
  }
  return updated;
}

export function deleteHistoryItem(id: string): HistoryEntry[] {
  const existing = loadAnalysisHistory();
  const updated = existing.filter((item) => item.id !== id);
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
  return updated;
}

export function clearAllHistory(): HistoryEntry[] {
  try {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
  return [];
}
