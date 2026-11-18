import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { MotionConfig, AnimatePresence, motion } from 'motion/react';
import { Navbar, type ActivePage } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { AnalyzeWorkspace, type WorkspaceMode } from './components/AnalyzeWorkspace.tsx';
import { HistoryPage } from './components/HistoryPage.tsx';
import { ExtensionGuidePage } from './components/ExtensionGuidePage.tsx';
import type {
  DocumentAnalysisResult,
  DocumentCategory,
  HistoryEntry,
} from './types/analysis.ts';
import {
  loadAnalysisHistory,
  saveAnalysisToHistory,
  deleteHistoryItem,
  clearAllHistory,
} from './utils/historyStorage.ts';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('single');
  const [activeResult, setActiveResult] = useState<DocumentAnalysisResult | null>(null);
  const [activeDocumentText, setActiveDocumentText] = useState<string>('');
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadAnalysisHistory());
  const [handoffStatus, setHandoffStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [handoffMessage, setHandoffMessage] = useState<string>('');

  useEffect(() => {
    setHistory(loadAnalysisHistory());
  }, []);

  // Consume one-time ?handoff=<token> passed from AgreeWise Chrome Extension
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const handoffId = params.get('handoff');
    if (!handoffId) return;

    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);

    let cancelled = false;
    async function loadExtensionHandoff() {
      setHandoffStatus('loading');
      setHandoffMessage('Loading policy document from AgreeWise Chrome Extension...');
      setActivePage('analyze');
      setWorkspaceMode('single');

      try {
        const res = await fetch(`/api/handoff/${encodeURIComponent(handoffId!)}`);
        const payload = (await res.json()) as {
          documentName?: string;
          category?: DocumentCategory;
          documentText?: string;
          analysisResult?: DocumentAnalysisResult | null;
          error?: string;
        };

        if (!res.ok) {
          throw new Error(payload.error || 'Could not retrieve document from Chrome Extension.');
        }

        if (cancelled) return;

        if (payload.analysisResult) {
          setActiveResult(payload.analysisResult);
          setActiveDocumentText(payload.documentText || '');
          setHistory(saveAnalysisToHistory(payload.analysisResult));
          setHandoffStatus('idle');
          return;
        }

        if (!payload.documentText || payload.documentText.trim().length < 40) {
          throw new Error('The handed-off page did not contain enough readable text.');
        }

        setHandoffMessage(
          `Analyzing "${payload.documentName || 'Web Document'}" with AgreeWise AI...`
        );

        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentText: payload.documentText,
            documentName: payload.documentName || 'Web Policy Document',
            category: payload.category || 'Terms & Conditions',
          }),
        });

        const analysisData = (await analyzeRes.json()) as DocumentAnalysisResult & {
          error?: string;
        };
        if (!analyzeRes.ok) {
          throw new Error(analysisData.error || 'AI analysis failed for the handed-off page.');
        }

        if (cancelled) return;

        setActiveResult(analysisData);
        setActiveDocumentText(payload.documentText);
        setHistory(saveAnalysisToHistory(analysisData));
        setHandoffStatus('idle');
      } catch (err: unknown) {
        if (cancelled) return;
        setHandoffStatus('error');
        setHandoffMessage(
          err instanceof Error ? err.message : 'Unable to load document from extension.'
        );
      }
    }

    void loadExtensionHandoff();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleNavigate = (page: ActivePage, sectionId?: string) => {
    setActivePage(page);
    setHandoffStatus('idle');
    if (page === 'analyze') {
      setWorkspaceMode('single');
    }
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnalysisComplete = (result: DocumentAnalysisResult, rawText: string) => {
    setActiveResult(result);
    setActiveDocumentText(rawText);
    const updated = saveAnalysisToHistory(result);
    setHistory(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetAnalysis = () => {
    setActiveResult(null);
    setActiveDocumentText('');
    setHandoffStatus('idle');
  };

  const handleOpenHistoryReport = (result: DocumentAnalysisResult) => {
    setActiveResult(result);
    setActiveDocumentText('');
    setWorkspaceMode('single');
    setActivePage('analyze');
    setHandoffStatus('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    const updated = clearAllHistory();
    setHistory(updated);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0F172A]">
        <Navbar activePage={activePage} onNavigate={handleNavigate} historyCount={history.length} />

        <main className="flex-1">
          {handoffStatus === 'loading' && (
            <div className="max-w-3xl mx-auto px-4 pt-8">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex items-center gap-3 text-sm text-[#0F172A]">
                <Loader2 className="w-5 h-5 animate-spin text-[#3730A3] shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{handoffMessage}</p>
                  <p className="text-xs text-[#475569] mt-0.5">
                    Preparing your full AgreeWise clause breakdown and risk indicator.
                  </p>
                </div>
              </div>
            </div>
          )}

          {handoffStatus === 'error' && (
            <div className="max-w-3xl mx-auto px-4 pt-8">
              <div
                role="alert"
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2.5 text-sm text-red-800"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
                <span>{handoffMessage}</span>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activePage === 'home' && (
              <motion.div
                key="page-home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <LandingPage
                  onStartAnalyzing={() => {
                    setWorkspaceMode('single');
                    setActivePage('analyze');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onExploreFeatures={() => {
                    const el = document.getElementById('features');
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  onOpenComparison={() => {
                    setWorkspaceMode('compare');
                    setActivePage('analyze');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            )}

            {activePage === 'analyze' && handoffStatus !== 'loading' && (
              <motion.div
                key="page-analyze"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <AnalyzeWorkspace
                  mode={workspaceMode}
                  onModeChange={setWorkspaceMode}
                  activeResult={activeResult}
                  activeDocumentText={activeDocumentText}
                  onAnalysisComplete={handleAnalysisComplete}
                  onResetAnalysis={handleResetAnalysis}
                />
              </motion.div>
            )}

            {activePage === 'history' && (
              <motion.div
                key="page-history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <HistoryPage
                  history={history}
                  onOpenReport={handleOpenHistoryReport}
                  onDeleteEntry={handleDeleteHistory}
                  onClearAll={handleClearHistory}
                  onGoToAnalyze={() => {
                    setWorkspaceMode('single');
                    setActivePage('analyze');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            )}

            {activePage === 'extension' && (
              <motion.div
                key="page-extension"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <ExtensionGuidePage
                  onGoToAnalyze={() => {
                    setWorkspaceMode('single');
                    setActivePage('analyze');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  );
}
