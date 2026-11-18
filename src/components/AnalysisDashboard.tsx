import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  RotateCcw,
  Search,
  ShieldAlert,
  Info,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { DocumentAnalysisResult, RiskLevel } from '../types/analysis.ts';
import { downloadAnalysisPdf } from '../utils/pdfReport.ts';
import { AskAgreeWiseChat } from './AskAgreeWiseChat.tsx';

interface AnalysisDashboardProps {
  analysis: DocumentAnalysisResult;
  documentText: string;
  onReset: () => void;
}

type RiskFilter = 'All' | RiskLevel;

export function AnalysisDashboard({
  analysis,
  documentText,
  onReset,
}: AnalysisDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('All');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    analysis.clauses.forEach((c, idx) => {
      if (c.riskLevel === 'High' || idx < 3) {
        initial[c.id] = true;
      }
    });
    return initial;
  });
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});
  const [copiedSummary, setCopiedSummary] = useState(false);

  const filteredClauses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return analysis.clauses.filter((clause) => {
      const matchesRisk = riskFilter === 'All' || clause.riskLevel === riskFilter;
      if (!matchesRisk) return false;
      if (!q) return true;
      return (
        clause.title.toLowerCase().includes(q) ||
        clause.category.toLowerCase().includes(q) ||
        clause.excerpt.toLowerCase().includes(q) ||
        clause.simpleExplanation.toLowerCase().includes(q) ||
        clause.whyItMatters.toLowerCase().includes(q)
      );
    });
  }, [analysis.clauses, riskFilter, searchQuery]);

  const toggleClause = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    filteredClauses.forEach((c) => {
      next[c.id] = true;
    });
    setExpandedIds((prev) => ({ ...prev, ...next }));
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = { ...expandedIds };
    filteredClauses.forEach((c) => {
      next[c.id] = false;
    });
    setExpandedIds(next);
  };

  const handleCopySummary = async () => {
    const text = [
      `AgreeWise Summary — ${analysis.documentName} (${analysis.category})`,
      `Risk Indicator: ${analysis.riskScore}/100 (${analysis.riskLabel})`,
      '',
      ...analysis.summaryParagraphs,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const scoreColor =
    analysis.riskScore >= 61
      ? '#DC2626'
      : analysis.riskScore >= 31
      ? '#D97706'
      : '#16A34A';

  const scoreTextClass =
    analysis.riskScore >= 61
      ? 'text-[#B91C1C]'
      : analysis.riskScore >= 31
      ? 'text-[#B45309]'
      : 'text-[#15803D]';

  const getRiskBadge = (level: RiskLevel) => {
    if (level === 'High') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C] whitespace-nowrap shrink-0">
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          High Priority
        </span>
      );
    }
    if (level === 'Medium') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309] whitespace-nowrap shrink-0">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
          Medium Priority
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] whitespace-nowrap shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        Low Priority
      </span>
    );
  };

  const radius = 52;
  const circumference = Math.PI * radius;
  const targetOffset = circumference - (analysis.riskScore / 100) * circumference;

  const totalClauseCount = Math.max(1, analysis.counts.totalClauses);
  const highPct = (analysis.counts.high / totalClauseCount) * 100;
  const medPct = (analysis.counts.medium / totalClauseCount) * 100;
  const lowPct = (analysis.counts.low / totalClauseCount) * 100;

  const privacyRows: Array<{ label: string; value: string }> = [
    {
      label: 'Personal information collected',
      value: analysis.privacyAnalysis.personalDataCollected,
    },
    {
      label: 'Third-party data sharing',
      value: analysis.privacyAnalysis.thirdPartySharing,
    },
    {
      label: 'How collected information may be used',
      value: analysis.privacyAnalysis.howInfoIsUsed,
    },
    {
      label: 'Data retention policy explained',
      value: analysis.privacyAnalysis.dataRetentionExplained,
    },
    {
      label: 'Account or data deletion options',
      value: analysis.privacyAnalysis.deletionOptionsMentioned,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3DFD6]">
        <div>
          <p className="text-xs font-semibold text-[#3730A3] mb-1">
            Analysis Report · {analysis.category}
          </p>
          <h2 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            {analysis.documentName}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => void handleCopySummary()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#0F172A] bg-[#FDFCFA] border border-[#D6D1C7] hover:bg-[#EFECE5] rounded-lg transition-colors whitespace-nowrap min-h-[40px]"
          >
            {copiedSummary ? (
              <>
                <Check className="w-4 h-4 text-[#15803D]" aria-hidden="true" />
                Copied Summary
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                Copy Summary
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => downloadAnalysisPdf(analysis)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#3730A3] via-[#4338CA] to-[#2563EB] hover:opacity-95 rounded-lg transition-all whitespace-nowrap min-h-[40px]"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Download PDF Report
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#334155] bg-[#EFECE5] hover:bg-[#E4E0D6] rounded-lg transition-colors whitespace-nowrap min-h-[40px]"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Reset Analysis
          </button>
        </div>
      </div>

      {/* Legal Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-[#EFECE5] border border-[#E3DFD6] flex items-start gap-3 text-xs sm:text-sm text-[#334155]">
        <Info className="w-5 h-5 text-[#3730A3] shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong>Informational Screening Only:</strong> AgreeWise translates legal text into simple
          English to help you spot key terms. It does not provide professional legal advice or
          formal legal determinations.
        </p>
      </div>

      {/* SECTION A & B: Document Overview + Animated Overall Risk Indicator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <section
          aria-label="Document Overview"
          className="lg:col-span-7 bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6 flex flex-col justify-between"
        >
          <div>
            <h3 className="font-display text-base font-semibold text-[#0F172A] mb-5">
              Document Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-[#64748B] mb-1">Document Name</p>
                <p className="text-sm font-semibold text-[#0F172A] truncate" title={analysis.documentName}>
                  {analysis.documentName}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Category</p>
                <p className="text-sm font-semibold text-[#0F172A]">{analysis.category}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Total Words Analyzed</p>
                <p className="font-mono tabular-nums text-lg font-bold text-[#0F172A]">
                  {analysis.wordCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Important Clauses</p>
                <p className="font-mono tabular-nums text-lg font-bold text-[#0F172A]">
                  {analysis.counts.totalClauses}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Potentially Concerning</p>
                <p className="font-mono tabular-nums text-lg font-bold text-[#3730A3]">
                  {analysis.counts.concerningClauses}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Analyzed On</p>
                <p className="text-xs font-medium text-[#475569] tabular-nums mt-1">
                  {new Date(analysis.analyzedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#E3DFD6]">
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
              <span>Clause Priority Distribution</span>
              <span className="font-mono tabular-nums">
                {analysis.counts.high}H · {analysis.counts.medium}M · {analysis.counts.low}L
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#EFECE5] overflow-hidden flex">
              {highPct > 0 && (
                <div
                  className="bg-[#DC2626] h-full transition-all duration-500"
                  style={{ width: `${highPct}%` }}
                  title={`High Priority: ${analysis.counts.high}`}
                />
              )}
              {medPct > 0 && (
                <div
                  className="bg-[#D97706] h-full transition-all duration-500"
                  style={{ width: `${medPct}%` }}
                  title={`Medium Priority: ${analysis.counts.medium}`}
                />
              )}
              {lowPct > 0 && (
                <div
                  className="bg-[#16A34A] h-full transition-all duration-500"
                  style={{ width: `${lowPct}%` }}
                  title={`Low Priority: ${analysis.counts.low}`}
                />
              )}
            </div>
          </div>
        </section>

        {/* SECTION B: Animated SVG Risk Gauge */}
        <section
          aria-label="Overall Risk Indicator"
          className="lg:col-span-5 bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-semibold text-[#0F172A]">
                Overall Risk Indicator
              </h3>
              <p className={`text-sm font-semibold mt-1 ${scoreTextClass}`}>{analysis.riskLabel}</p>
            </div>

            <div className="relative w-36 h-22 flex items-end justify-center shrink-0">
              <svg viewBox="0 0 120 70" className="w-full h-full overflow-visible" aria-hidden="true">
                <path
                  d="M 8 60 A 52 52 0 0 1 112 60"
                  fill="none"
                  stroke="#E3DFD6"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <motion.path
                  d="M 8 60 A 52 52 0 0 1 112 60"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: targetOffset }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <div className="absolute bottom-0 text-center">
                <span className="font-mono tabular-nums text-2xl font-bold text-[#0F172A]">
                  {analysis.riskScore}
                </span>
                <span className="text-xs text-[#64748B] font-mono">/100</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E3DFD6] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>0–30 Lower</span>
              <span>31–60 Moderate</span>
              <span>61–100 Higher</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">{analysis.riskDerivationNote}</p>
          </div>
        </section>
      </div>

      {/* SECTION C: Risk Breakdown */}
      <section aria-label="Risk Breakdown" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setRiskFilter(riskFilter === 'High' ? 'All' : 'High')}
          className={`text-left bg-[#FDFCFA] border rounded-2xl p-5 transition-all ${
            riskFilter === 'High'
              ? 'border-[#DC2626] ring-1 ring-[#DC2626]'
              : 'border-[#E3DFD6] hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#B91C1C] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              High Priority
            </span>
            <span className="text-xs text-[#64748B]">
              {riskFilter === 'High' ? 'Filtered' : 'Click to filter'}
            </span>
          </div>
          <p className="font-mono tabular-nums text-3xl font-bold text-[#0F172A]">
            {analysis.counts.high}
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            Clauses with significant financial, privacy, or rights impact
          </p>
        </button>

        <button
          type="button"
          onClick={() => setRiskFilter(riskFilter === 'Medium' ? 'All' : 'Medium')}
          className={`text-left bg-[#FDFCFA] border rounded-2xl p-5 transition-all ${
            riskFilter === 'Medium'
              ? 'border-[#D97706] ring-1 ring-[#D97706]'
              : 'border-[#E3DFD6] hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#B45309] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              Medium Priority
            </span>
            <span className="text-xs text-[#64748B]">
              {riskFilter === 'Medium' ? 'Filtered' : 'Click to filter'}
            </span>
          </div>
          <p className="font-mono tabular-nums text-3xl font-bold text-[#0F172A]">
            {analysis.counts.medium}
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            Notable conditions or obligations worth reviewing closely
          </p>
        </button>

        <button
          type="button"
          onClick={() => setRiskFilter(riskFilter === 'Low' ? 'All' : 'Low')}
          className={`text-left bg-[#FDFCFA] border rounded-2xl p-5 transition-all ${
            riskFilter === 'Low'
              ? 'border-[#16A34A] ring-1 ring-[#16A34A]'
              : 'border-[#E3DFD6] hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#15803D] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              Low Priority
            </span>
            <span className="text-xs text-[#64748B]">
              {riskFilter === 'Low' ? 'Filtered' : 'Click to filter'}
            </span>
          </div>
          <p className="font-mono tabular-nums text-3xl font-bold text-[#0F172A]">
            {analysis.counts.low}
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            Standard or informational contractual terms
          </p>
        </button>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-7 space-y-8">
          {/* SECTION F: Simple Summary */}
          <section
            aria-label="Simple Summary"
            className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="font-display text-lg font-semibold text-[#0F172A]">Simple Summary</h3>
              <button
                type="button"
                onClick={() => void handleCopySummary()}
                className="text-xs font-semibold text-[#3730A3] hover:text-[#2563EB] inline-flex items-center gap-1"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSummary ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-[#334155] leading-relaxed">
              {analysis.summaryParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* SECTION D: Important Clauses */}
          <section aria-label="Important Clauses" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#0F172A]">
                  Important Clauses ({filteredClauses.length})
                </h3>
                <p className="text-xs text-[#64748B]">
                  Search clauses or filter by priority level
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={expandAll}
                  className="px-3 py-1.5 rounded-lg border border-[#E3DFD6] bg-[#FDFCFA] text-[#334155] hover:bg-[#EFECE5] font-medium"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="px-3 py-1.5 rounded-lg border border-[#E3DFD6] bg-[#FDFCFA] text-[#334155] hover:bg-[#EFECE5] font-medium"
                >
                  Collapse All
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clauses by keyword, topic, or excerpt..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-[#FDFCFA] border border-[#D6D1C7] rounded-lg text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4338CA] min-h-[40px]"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#EFECE5] border border-[#E3DFD6] rounded-lg shrink-0">
                {(['All', 'High', 'Medium', 'Low'] as RiskFilter[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setRiskFilter(level)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      riskFilter === level
                        ? 'bg-[#FDFCFA] text-[#0F172A] shadow-xs'
                        : 'text-[#475569] hover:text-[#0F172A]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {filteredClauses.length === 0 ? (
              <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-8 text-center text-sm text-[#64748B]">
                No clauses match your current search or risk filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredClauses.map((clause) => {
                  const isOpen = Boolean(expandedIds[clause.id]);
                  return (
                    <div
                      key={clause.id}
                      className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleClause(clause.id)}
                        aria-expanded={isOpen}
                        className="w-full px-5 py-4 text-left flex items-start justify-between gap-4 hover:bg-[#F7F5F0] transition-colors"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                            <span>{clause.category}</span>
                            <span aria-hidden="true">·</span>
                            {getRiskBadge(clause.riskLevel)}
                          </div>
                          <h4 className="font-display text-base font-semibold text-[#0F172A]">
                            {clause.title}
                          </h4>
                        </div>
                        <span className="p-1 text-[#64748B] shrink-0 mt-1">
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="w-4 h-4" aria-hidden="true" />
                          )}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.16 }}
                            className="px-5 pb-5 pt-3 border-t border-[#E3DFD6] space-y-4"
                          >
                            {clause.excerpt && (
                              <div>
                                <p className="text-xs font-medium text-[#64748B] mb-1.5">
                                  Original Document Excerpt
                                </p>
                                <blockquote className="text-xs font-mono text-[#334155] bg-[#F7F5F0] border border-[#E3DFD6] rounded-lg p-3 leading-relaxed">
                                  &ldquo;{clause.excerpt}&rdquo;
                                </blockquote>
                              </div>
                            )}

                            <div>
                              <p className="text-xs font-semibold text-[#3730A3] mb-1">
                                Simple English Explanation
                              </p>
                              <p className="text-sm text-[#0F172A] leading-relaxed">
                                {clause.simpleExplanation}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E3DFD6]">
                              <div>
                                <p className="text-xs font-semibold text-[#334155] mb-1">
                                  Why It Matters
                                </p>
                                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                                  {clause.whyItMatters}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[#334155] mb-1">
                                  Recommended Action / Check
                                </p>
                                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                                  {clause.recommendedAction}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SECTION E: Privacy Analysis */}
          <section
            aria-label="Privacy Analysis"
            className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Lock className="w-5 h-5 text-[#3730A3]" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold text-[#0F172A]">
                Privacy Analysis
              </h3>
            </div>
            <div className="divide-y divide-[#E3DFD6]">
              {privacyRows.map((row) => {
                const isNotFound = row.value.toLowerCase().includes('not found in the provided');
                return (
                  <div key={row.label} className="py-3.5 first:pt-0 last:pb-0">
                    <p className="text-xs font-semibold text-[#334155] mb-1">{row.label}</p>
                    <p
                      className={`text-sm leading-relaxed ${
                        isNotFound ? 'text-[#64748B] italic' : 'text-[#0F172A]'
                      }`}
                    >
                      {row.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION G: What Should You Check? */}
          <section
            aria-label="What Should You Check"
            className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-[#3730A3]" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold text-[#0F172A]">
                What Should You Check?
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mb-4">
              Review and check off these questions before agreeing to the document.
            </p>

            {analysis.checklistQuestions.length > 0 ? (
              <ul className="space-y-2.5">
                {analysis.checklistQuestions.map((question, idx) => {
                  const isChecked = Boolean(checkedQuestions[idx]);
                  return (
                    <li key={idx}>
                      <label className="flex items-start gap-3 p-3 rounded-lg border border-[#E3DFD6] hover:bg-[#F7F5F0] cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setCheckedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }))
                          }
                          className="mt-0.5 h-4 w-4 rounded border-[#D6D1C7] accent-[#3730A3]"
                        />
                        <span
                          className={`text-sm leading-relaxed ${
                            isChecked ? 'line-through text-[#94A3B8]' : 'text-[#0F172A]'
                          }`}
                        >
                          {question}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-[#64748B]">No specific checklist items generated.</p>
            )}

            {analysis.missingOrUnclear.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[#E3DFD6]">
                <h4 className="text-xs font-semibold text-[#334155] mb-2">
                  Missing or Unclear Information Noted
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[#475569]">
                  {analysis.missingOrUnclear.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Ask AgreeWise AI */}
        <div className="xl:col-span-5 xl:sticky xl:top-20">
          <AskAgreeWiseChat analysis={analysis} documentText={documentText} />
        </div>
      </div>
    </motion.div>
  );
}
