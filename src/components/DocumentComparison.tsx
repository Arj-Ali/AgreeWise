import { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  ArrowLeftRight,
  Loader2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import type { DocumentComparisonResult, RiskLevel } from '../types/analysis.ts';
import { extractTextFromPdf, formatFileSize } from '../utils/pdfExtractor.ts';

interface DocSlotState {
  name: string;
  text: string;
  fileSize?: number;
  extracting: boolean;
  error: string | null;
}

const EMPTY_SLOT: DocSlotState = {
  name: '',
  text: '',
  extracting: false,
  error: null,
};

export function DocumentComparison() {
  const [docA, setDocA] = useState<DocSlotState>({ ...EMPTY_SLOT, name: 'Original Agreement' });
  const [docB, setDocB] = useState<DocSlotState>({ ...EMPTY_SLOT, name: 'Updated Agreement' });
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentComparisonResult | null>(null);

  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    file: File | undefined,
    setter: React.Dispatch<React.SetStateAction<DocSlotState>>
  ) => {
    if (!file) return;
    setter((prev) => ({ ...prev, extracting: true, error: null }));
    try {
      const extracted = await extractTextFromPdf(file);
      setter({
        name: file.name,
        text: extracted.text,
        fileSize: file.size,
        extracting: false,
        error: null,
      });
    } catch (err: unknown) {
      setter((prev) => ({
        ...prev,
        extracting: false,
        error: err instanceof Error ? err.message : 'Failed to extract PDF text.',
      }));
    }
  };

  const handleCompare = async () => {
    if (!docA.text.trim() || !docB.text.trim()) {
      setCompareError('Please upload or paste text for both Document A and Document B.');
      return;
    }

    setIsComparing(true);
    setCompareError(null);
    setResult(null);

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docA: { name: docA.name || 'Document A', text: docA.text },
          docB: { name: docB.name || 'Document B', text: docB.text },
        }),
      });
      const data = (await res.json()) as DocumentComparisonResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Comparison failed. Please try again.');
      }
      setResult(data);
    } catch (err: unknown) {
      setCompareError(
        err instanceof Error ? err.message : 'An unexpected error occurred during comparison.'
      );
    } finally {
      setIsComparing(false);
    }
  };

  const renderImpactBadge = (level: RiskLevel) => {
    if (level === 'High') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B91C1C]">
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          High Impact
        </span>
      );
    }
    if (level === 'Medium') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B45309]">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
          Medium Impact
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#15803D]">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        Low Impact
      </span>
    );
  };

  const renderDocSlot = (
    title: string,
    slot: DocSlotState,
    setter: React.Dispatch<React.SetStateAction<DocSlotState>>,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const wordCount = slot.text.trim() ? slot.text.trim().split(/\s+/).length : 0;
    return (
      <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-base font-semibold text-[#0F172A]">{title}</h3>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                void handleFileUpload(e.target.files?.[0], setter);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={slot.extracting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#3730A3] bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              {slot.extracting ? 'Extracting...' : 'Upload PDF'}
            </button>
            {slot.text && (
              <button
                type="button"
                onClick={() => setter({ ...EMPTY_SLOT, name: title })}
                aria-label={`Clear ${title}`}
                className="p-1.5 text-[#64748B] hover:text-red-600 rounded-lg"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <input
          type="text"
          value={slot.name}
          onChange={(e) => setter((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Document label (e.g., 2025 Terms)"
          className="w-full px-3 py-2 text-sm bg-[#F7F5F0] border border-[#D6D1C7] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
        />

        {slot.fileSize !== undefined && (
          <p className="text-xs text-[#64748B] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#3730A3]" aria-hidden="true" />
            <span>PDF loaded · {formatFileSize(slot.fileSize)}</span>
          </p>
        )}

        {slot.error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
            <span>{slot.error}</span>
          </div>
        )}

        <textarea
          rows={8}
          value={slot.text}
          onChange={(e) => setter((prev) => ({ ...prev, text: e.target.value }))}
          placeholder={`Paste text for ${title} or upload a PDF above...`}
          className="w-full p-3 text-sm bg-[#F7F5F0] border border-[#D6D1C7] rounded-lg text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4338CA] resize-y"
        />

        <p className="text-xs text-[#64748B] tabular-nums">{wordCount.toLocaleString()} words</p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderDocSlot('Document A (Original / Option 1)', docA, setDocA, fileInputARef)}
        {renderDocSlot('Document B (Updated / Option 2)', docB, setDocB, fileInputBRef)}
      </div>

      {compareError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
          <span>{compareError}</span>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => void handleCompare()}
          disabled={isComparing || docA.extracting || docB.extracting}
          className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#3730A3] via-[#4338CA] to-[#2563EB] hover:opacity-95 rounded-lg shadow-sm disabled:opacity-50 transition-all min-h-[44px]"
        >
          {isComparing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Comparing Documents...
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
              Compare Two Documents
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-6 pt-6 border-t border-[#E3DFD6]">
          <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-[#0F172A] mb-2">
              Comparison Summary: {result.docAName} vs {result.docBName}
            </h3>
            <p className="text-sm sm:text-base text-[#334155] leading-relaxed">
              {result.overallSummary}
            </p>
          </div>

          {[
            { title: 'Differences in Important Clauses', items: result.importantClauseDifferences },
            { title: 'Differences in Privacy Policies', items: result.privacyPolicyDifferences },
            {
              title: 'Differences in Subscription & Billing Conditions',
              items: result.subscriptionConditionDifferences,
            },
          ].map((group) => (
            <div key={group.title} className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6">
              <h4 className="font-display text-base font-semibold text-[#0F172A] mb-4">
                {group.title}
              </h4>
              {group.items.length === 0 ? (
                <p className="text-sm text-[#64748B]">
                  No major differences identified in this category.
                </p>
              ) : (
                <div className="space-y-4 divide-y divide-[#E3DFD6]">
                  {group.items.map((item, idx) => (
                    <div key={idx} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-sm text-[#0F172A]">{item.topic}</p>
                        {renderImpactBadge(item.impactLevel)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                        <div className="bg-[#F7F5F0] border border-[#E3DFD6] rounded-lg p-3">
                          <p className="text-xs font-semibold text-[#64748B] mb-1">
                            {result.docAName}
                          </p>
                          <p className="text-[#334155]">{item.documentA}</p>
                        </div>
                        <div className="bg-[#F7F5F0] border border-[#E3DFD6] rounded-lg p-3">
                          <p className="text-xs font-semibold text-[#64748B] mb-1">
                            {result.docBName}
                          </p>
                          <p className="text-[#334155]">{item.documentB}</p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-[#475569]">{item.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6">
              <h4 className="font-display text-base font-semibold text-[#0F172A] mb-3">
                New or Removed Obligations
              </h4>
              {result.newOrRemovedObligations.length === 0 ? (
                <p className="text-sm text-[#64748B]">None identified.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-2 text-sm text-[#334155]">
                  {result.newOrRemovedObligations.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6">
              <h4 className="font-display text-base font-semibold text-[#B91C1C] mb-3">
                Potentially Concerning Changes
              </h4>
              {result.potentiallyConcerningChanges.length === 0 ? (
                <p className="text-sm text-[#64748B]">None identified.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-2 text-sm text-[#334155]">
                  {result.potentiallyConcerningChanges.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
