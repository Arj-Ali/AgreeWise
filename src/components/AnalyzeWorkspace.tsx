import { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Eraser,
  ArrowLeftRight,
  FileSearch,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { DocumentAnalysisResult, DocumentCategory } from '../types/analysis.ts';
import { extractTextFromPdf, formatFileSize } from '../utils/pdfExtractor.ts';
import { SAMPLE_TERMS_DOCUMENT } from '../data/sampleDocument.ts';
import { AnalysisDashboard } from './AnalysisDashboard.tsx';
import { DocumentComparison } from './DocumentComparison.tsx';

export type WorkspaceMode = 'single' | 'compare';

interface AnalyzeWorkspaceProps {
  mode: WorkspaceMode;
  onModeChange: (mode: WorkspaceMode) => void;
  activeResult: DocumentAnalysisResult | null;
  activeDocumentText: string;
  onAnalysisComplete: (result: DocumentAnalysisResult, rawText: string) => void;
  onResetAnalysis: () => void;
}

const CATEGORIES: DocumentCategory[] = [
  'Terms & Conditions',
  'Privacy Policy',
  'Rental Agreement',
  'Employment Contract',
  'Insurance Policy',
  'Subscription Agreement',
  'Other',
];

export function AnalyzeWorkspace({
  mode,
  onModeChange,
  activeResult,
  activeDocumentText,
  onAnalysisComplete,
  onResetAnalysis,
}: AnalyzeWorkspaceProps) {
  const [documentName, setDocumentName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Terms & Conditions');
  const [pastedText, setPastedText] = useState('');

  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    pageCount: number;
    wordCount: number;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveText = pastedText;
  const wordCount = effectiveText.trim() ? effectiveText.trim().split(/\s+/).length : 0;

  const processPdfFile = async (file: File | undefined) => {
    if (!file) return;
    setPdfError(null);
    setAnalysisError(null);
    setIsExtractingPdf(true);
    setUploadProgress(5);

    try {
      const extracted = await extractTextFromPdf(file, (pct) => setUploadProgress(pct));
      setUploadedFile({
        name: file.name,
        size: file.size,
        pageCount: extracted.pageCount,
        wordCount: extracted.wordCount,
      });
      setPastedText(extracted.text);
      if (!documentName.trim()) {
        setDocumentName(file.name.replace(/\.pdf$/i, ''));
      }
      setUploadProgress(100);
    } catch (err: unknown) {
      setUploadedFile(null);
      setUploadProgress(0);
      setPdfError(err instanceof Error ? err.message : 'Unable to extract text from PDF.');
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const handleRemoveDocument = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setPdfError(null);
    setPastedText('');
    setDocumentName('');
    setAnalysisError(null);
  };

  const handleLoadSample = () => {
    setUploadedFile(null);
    setPdfError(null);
    setAnalysisError(null);
    setDocumentName(SAMPLE_TERMS_DOCUMENT.name);
    setCategory(SAMPLE_TERMS_DOCUMENT.category);
    setPastedText(SAMPLE_TERMS_DOCUMENT.text);
  };

  const handleAnalyze = async () => {
    const trimmed = effectiveText.trim();
    if (!trimmed || trimmed.length < 40) {
      setAnalysisError(
        'Please upload a PDF or paste at least a short agreement paragraph before analyzing.'
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    const finalName =
      documentName.trim() || uploadedFile?.name.replace(/\.pdf$/i, '') || `${category} Document`;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: trimmed,
          documentName: finalName,
          category,
        }),
      });

      const data = (await response.json()) as DocumentAnalysisResult & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Document analysis failed. Please try again.');
      }

      onAnalysisComplete(data, trimmed);
    } catch (err: unknown) {
      setAnalysisError(
        err instanceof Error
          ? err.message
          : 'Unable to reach the AI analysis service. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFullReset = () => {
    handleRemoveDocument();
    onResetAnalysis();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Workspace Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E3DFD6] mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Document Analysis Workspace
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Upload a PDF or paste legal text to reveal risky clauses, plain-English meanings, and
            privacy practices.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-[#EFECE5] border border-[#E3DFD6] rounded-lg self-start md:self-auto">
          <button
            type="button"
            onClick={() => onModeChange('single')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              mode === 'single'
                ? 'bg-[#FDFCFA] text-[#0F172A] shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <FileSearch className="w-4 h-4" aria-hidden="true" />
            Analyze Document
          </button>
          <button
            type="button"
            onClick={() => onModeChange('compare')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              mode === 'compare'
                ? 'bg-[#FDFCFA] text-[#0F172A] shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
            Compare Documents
          </button>
        </div>
      </div>

      {mode === 'compare' ? (
        <DocumentComparison />
      ) : activeResult ? (
        <AnalysisDashboard
          analysis={activeResult}
          documentText={activeDocumentText}
          onReset={handleFullReset}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          {/* Input Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* OPTION A: Upload Document */}
            <section
              aria-label="Option A: Upload PDF Document"
              className="lg:col-span-5 bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#3730A3]">Option A</p>
                  <h2 className="font-display text-lg font-semibold text-[#0F172A]">
                    Upload PDF Document
                  </h2>
                </div>
                {uploadedFile && (
                  <button
                    type="button"
                    onClick={handleRemoveDocument}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#B91C1C] hover:text-red-800 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                    Remove
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  void processPdfFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  void processPdfFile(e.dataTransfer.files?.[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-[#4338CA] bg-indigo-50/60'
                    : 'border-[#D6D1C7] bg-[#F7F5F0] hover:border-[#4338CA] hover:bg-[#EFECE5]'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-[#FDFCFA] border border-[#E3DFD6] text-[#3730A3] flex items-center justify-center mx-auto mb-3 shadow-xs">
                  {isExtractingPdf ? (
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Upload className="w-5 h-5" aria-hidden="true" />
                  )}
                </div>
                <p className="text-sm font-semibold text-[#0F172A] mb-1">
                  {isExtractingPdf
                    ? 'Extracting text from PDF...'
                    : 'Drop your PDF here, or click to browse'}
                </p>
                <p className="text-xs text-[#64748B]">
                  PDF files up to 10 MB · Text extracted locally via PDF.js
                </p>
              </div>

              {isExtractingPdf && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#475569]">
                    <span>Reading PDF pages...</span>
                    <span className="font-mono tabular-nums">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#EFECE5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4338CA] transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadedFile && (
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText
                      className="w-5 h-5 text-[#3730A3] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-[#475569] tabular-nums mt-0.5">
                        {formatFileSize(uploadedFile.size)} · {uploadedFile.pageCount}{' '}
                        {uploadedFile.pageCount === 1 ? 'page' : 'pages'} ·{' '}
                        {uploadedFile.wordCount.toLocaleString()} words extracted
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4338CA] w-full" />
                  </div>
                </div>
              )}

              {pdfError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
                  <span>{pdfError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#E3DFD6] flex items-center justify-between gap-3">
                <p className="text-xs text-[#64748B]">
                  Testing AgreeWise? Load a sample Terms &amp; Conditions agreement.
                </p>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs font-semibold text-[#3730A3] hover:text-[#2563EB] whitespace-nowrap shrink-0"
                >
                  Load Sample Text
                </button>
              </div>
            </section>

            {/* OPTION B: Paste Document Text */}
            <section
              aria-label="Option B: Paste Document Text"
              className="lg:col-span-7 bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#3730A3]">Option B</p>
                  <h2 className="font-display text-lg font-semibold text-[#0F172A]">
                    Paste Document Text
                  </h2>
                </div>

                {pastedText && (
                  <button
                    type="button"
                    onClick={() => {
                      setPastedText('');
                      setUploadedFile(null);
                      setUploadProgress(0);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] hover:text-[#0F172A] px-3 py-1.5 rounded-lg border border-[#E3DFD6] hover:bg-[#EFECE5] transition-colors"
                  >
                    <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
                    Clear Text
                  </button>
                )}
              </div>

              <textarea
                rows={12}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your Terms & Conditions, Privacy Policy, or agreement here..."
                className="w-full p-4 text-sm bg-[#F7F5F0] border border-[#D6D1C7] rounded-xl text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-[#4338CA] leading-relaxed resize-y"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
                <span className="font-mono tabular-nums font-medium text-[#0F172A]">
                  {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
                </span>
                <span>
                  {wordCount === 0
                    ? 'Empty state: Upload a PDF or paste agreement text to begin.'
                    : 'Ready for AI clause screening.'}
                </span>
              </div>
            </section>
          </div>

          {/* Document Details & Analyze CTA Bar */}
          <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <label
                  htmlFor="doc-name-input"
                  className="block text-xs font-semibold text-[#334155] mb-1.5"
                >
                  Document Title (Optional)
                </label>
                <input
                  id="doc-name-input"
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="e.g., Acme Cloud Subscription Terms"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border border-[#D6D1C7] rounded-lg text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4338CA] min-h-[44px]"
                />
              </div>

              <div className="md:col-span-4">
                <label
                  htmlFor="doc-category-select"
                  className="block text-xs font-semibold text-[#334155] mb-1.5"
                >
                  Document Category
                </label>
                <select
                  id="doc-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border border-[#D6D1C7] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4338CA] min-h-[44px]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => void handleAnalyze()}
                  disabled={isAnalyzing || isExtractingPdf || !effectiveText.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#3730A3] via-[#4338CA] to-[#2563EB] hover:opacity-95 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                      Analyze Document
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {isAnalyzing && (
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-3 text-sm text-[#0F172A]">
                <Loader2 className="w-5 h-5 animate-spin text-[#3730A3] shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Analyzing document with AgreeWise AI...</p>
                  <p className="text-xs text-[#475569] mt-0.5">
                    Inspecting clauses for renewals, fees, privacy terms, liability limits, and
                    arbitration waivers.
                  </p>
                </div>
              </div>
            )}

            {analysisError && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
                <span>{analysisError}</span>
              </div>
            )}

            <div className="pt-3 border-t border-[#E3DFD6] flex items-start gap-2.5 text-xs text-[#64748B]">
              <ShieldCheck className="w-4 h-4 text-[#3730A3] shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                By clicking &ldquo;Analyze Document&rdquo;, the extracted text is sent securely to
                AgreeWise&apos;s server-side AI analysis service for immediate processing and is not
                stored on our servers. AgreeWise provides informational explanations only, not legal
                advice.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
