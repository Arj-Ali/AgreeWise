import { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  ShieldCheck,
  Puzzle,
  PanelRight,
  BellRing,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { EditorialImage } from './EditorialImage.tsx';

interface ExtensionGuidePageProps {
  onGoToAnalyze: () => void;
}

export function ExtensionGuidePage({ onGoToAnalyze }: ExtensionGuidePageProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyOrigin = async () => {
    try {
      await navigator.clipboard.writeText(currentOrigin);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
      >
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-4">
          <p className="text-xs font-semibold text-[#3730A3]">Chrome Extension · Manifest V3</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Analyze Terms &amp; Privacy Policies Directly While Browsing
          </h1>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            The AgreeWise Chrome Extension detects legal agreements on websites you visit, prompts
            you with a one-click jump to the AgreeWise web dashboard, or opens a Chrome Side Panel
            with collapsible risk cards and Ask AgreeWise AI.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="/api/extension/download"
              download="agreewise-chrome-extension.zip"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#3730A3] via-[#4338CA] to-[#2563EB] hover:opacity-95 rounded-xl shadow-xs transition-all whitespace-nowrap min-h-[44px]"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Download Extension (.zip)
            </a>
            <button
              type="button"
              onClick={onGoToAnalyze}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#0F172A] bg-[#EFECE5] hover:bg-[#E4E0D6] rounded-xl transition-colors whitespace-nowrap min-h-[44px]"
            >
              Open Web Analyzer
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 min-h-[240px] bg-[#EFECE5] border-t lg:border-t-0 lg:border-l border-[#E3DFD6]">
          <EditorialImage
            src="/src/assets/images/agreewise_extension_flow_1794985734788.jpg"
            alt="Laptop on a light beige desk displaying a clean summary side panel beside a webpage"
            fallbackTitle="AgreeWise Browser Extension"
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      {/* Capabilities */}
      <section aria-label="Extension Capabilities" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-[#3730A3] flex items-center justify-center mb-4">
            <BellRing className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="font-display text-base font-semibold text-[#0F172A] mb-2">
            Automatic Policy Detection
          </h2>
          <p className="text-sm text-[#475569] leading-relaxed">
            Detects Terms of Service, Privacy Policies, Cookie Notices, and subscription pages
            locally in your browser and offers a one-click handoff straight into the AgreeWise web
            dashboard.
          </p>
        </div>

        <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#1D4ED8] flex items-center justify-center mb-4">
            <PanelRight className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="font-display text-base font-semibold text-[#0F172A] mb-2">
            Chrome Side Panel &amp; AI Chat
          </h2>
          <p className="text-sm text-[#475569] leading-relaxed">
            Click the AgreeWise toolbar icon for Privacy Policy or Terms &amp; Conditions analysis
            inside Chrome&apos;s Side Panel, complete with Ask AgreeWise AI Q&amp;A.
          </p>
        </div>

        <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-[#0F172A] flex items-center justify-center mb-4">
            <Lock className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="font-display text-base font-semibold text-[#0F172A] mb-2">
            Zero Passive Uploads
          </h2>
          <p className="text-sm text-[#475569] leading-relaxed">
            Page detection runs locally with zero network calls. Webpage text is extracted and sent
            to your AgreeWise AI backend only when you explicitly click Analyze.
          </p>
        </div>
      </section>

      {/* Step-by-Step Developer Mode Installation */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <Puzzle className="w-5 h-5 text-[#3730A3]" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              Install in Google Chrome (Developer Mode)
            </h2>
          </div>

          <ol className="space-y-4 text-sm text-[#334155]">
            <li className="pb-4 border-b border-[#E3DFD6]">
              <p className="font-semibold text-[#0F172A] mb-1">
                01. Download and unzip the extension bundle
              </p>
              <p className="text-[#475569]">
                Click <strong>Download Extension (.zip)</strong> above and extract{' '}
                <code className="font-mono text-xs bg-[#EFECE5] px-1.5 py-0.5 rounded">
                  agreewise-chrome-extension.zip
                </code>{' '}
                to a folder on your computer. The bundle is automatically pre-configured with this
                AgreeWise backend URL.
              </p>
            </li>

            <li className="pb-4 border-b border-[#E3DFD6]">
              <p className="font-semibold text-[#0F172A] mb-1">
                02. Open Chrome Extensions management
              </p>
              <p className="text-[#475569]">
                In Google Chrome, open a new tab and go to{' '}
                <code className="font-mono text-xs bg-[#EFECE5] px-1.5 py-0.5 rounded">
                  chrome://extensions
                </code>
                .
              </p>
            </li>

            <li className="pb-4 border-b border-[#E3DFD6]">
              <p className="font-semibold text-[#0F172A] mb-1">03. Enable Developer Mode</p>
              <p className="text-[#475569]">
                Toggle on <strong>Developer mode</strong> in the top-right corner of the Extensions
                page.
              </p>
            </li>

            <li>
              <p className="font-semibold text-[#0F172A] mb-1">
                04. Load unpacked extension folder
              </p>
              <p className="text-[#475569]">
                Click <strong>Load unpacked</strong>, select the extracted extension folder
                containing{' '}
                <code className="font-mono text-xs bg-[#EFECE5] px-1.5 py-0.5 rounded">
                  manifest.json
                </code>
                , and pin AgreeWise to your Chrome toolbar.
              </p>
            </li>
          </ol>
        </div>

        {/* Backend URL & Permissions Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6 space-y-3">
            <h3 className="font-display text-base font-semibold text-[#0F172A]">
              Connected AgreeWise Backend URL
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              The extension connects securely to this server so your Gemini API key stays strictly
              on the backend and never inside browser extension code.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentOrigin}
                aria-label="AgreeWise backend URL"
                className="flex-1 min-w-0 px-3 py-2 text-xs font-mono bg-[#F7F5F0] border border-[#D6D1C7] rounded-lg text-[#0F172A]"
              />
              <button
                type="button"
                onClick={() => void handleCopyOrigin()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#3730A3] bg-indigo-50 hover:bg-indigo-100 rounded-lg shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="bg-[#EFECE5] border border-[#E3DFD6] rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#3730A3]" aria-hidden="true" />
              <h3 className="font-display text-base font-semibold text-[#0F172A]">
                Minimal Chrome Permissions
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-[#475569]">
              <li>
                <strong className="font-mono text-[#0F172A]">activeTab</strong> — Accesses the
                current tab only when you click Analyze.
              </li>
              <li>
                <strong className="font-mono text-[#0F172A]">scripting</strong> — Extracts clean
                legal text from dynamically loaded pages on demand.
              </li>
              <li>
                <strong className="font-mono text-[#0F172A]">sidePanel</strong> — Renders clause
                breakdowns and Ask AgreeWise AI beside the active webpage.
              </li>
              <li>
                <strong className="font-mono text-[#0F172A]">storage</strong> — Stores your backend
                URL preference and temporary per-tab analysis state without tracking browsing
                history.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
