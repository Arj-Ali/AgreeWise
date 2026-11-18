import { Trash2, FolderOpen, FileText, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { DocumentAnalysisResult, HistoryEntry } from '../types/analysis.ts';

interface HistoryPageProps {
  history: HistoryEntry[];
  onOpenReport: (result: DocumentAnalysisResult) => void;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
  onGoToAnalyze: () => void;
}

export function HistoryPage({
  history,
  onOpenReport,
  onDeleteEntry,
  onClearAll,
  onGoToAnalyze,
}: HistoryPageProps) {
  const getRiskTextStyle = (score: number) => {
    if (score >= 61) return 'text-[#B91C1C]';
    if (score >= 31) return 'text-[#B45309]';
    return 'text-[#15803D]';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E3DFD6] mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Analysis History
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Recent analysis summaries saved locally in your browser.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#B91C1C] bg-[#FDFCFA] border border-red-200 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Clear All History
          </button>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="mb-6 p-4 rounded-xl bg-[#EFECE5] border border-[#E3DFD6] flex items-start gap-3 text-xs sm:text-sm text-[#334155]">
        <ShieldCheck className="w-5 h-5 text-[#3730A3] shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong>Privacy default:</strong> AgreeWise saves only structured analysis reports and
          risk indicators in your browser&apos;s local storage. Full uploaded or pasted document text
          is never persisted.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#EFECE5] text-[#64748B] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="font-display text-lg font-semibold text-[#0F172A] mb-2">
            No analyzed documents yet
          </h2>
          <p className="text-sm text-[#475569] max-w-md mx-auto mb-6">
            Upload a Terms &amp; Conditions PDF or paste any policy text to generate your first
            plain-English report.
          </p>
          <button
            type="button"
            onClick={onGoToAnalyze}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#3730A3] to-[#2563EB] rounded-lg transition-all whitespace-nowrap min-h-[44px]"
          >
            Analyze a Document
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl divide-y divide-[#E3DFD6]">
          {history.map((entry, idx) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: idx * 0.03 }}
              className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F7F5F0] transition-colors"
            >
              <div className="min-w-0 space-y-1.5">
                <h2 className="font-display text-base font-semibold text-[#0F172A] truncate">
                  {entry.documentName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                  <span>{entry.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {new Date(entry.analyzedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{entry.wordCount.toLocaleString()} words</span>
                  <span aria-hidden="true">·</span>
                  <span className={`font-semibold tabular-nums ${getRiskTextStyle(entry.riskScore)}`}>
                    {entry.riskScore}/100 ({entry.riskLabel})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenReport(entry.result)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#3730A3] bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap min-h-[40px]"
                >
                  <FolderOpen className="w-4 h-4" aria-hidden="true" />
                  Open Report
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteEntry(entry.id)}
                  aria-label={`Delete ${entry.documentName} from history`}
                  className="p-2 text-[#64748B] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
