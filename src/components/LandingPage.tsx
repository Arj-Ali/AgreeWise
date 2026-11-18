import {
  ArrowRight,
  FileSearch,
  ShieldAlert,
  Lock,
  BookOpen,
  Scale,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { DEMO_BENCHMARK_STATS } from '../data/sampleDocument.ts';
import { LogoMark } from './LogoMark.tsx';
import { EditorialImage } from './EditorialImage.tsx';

interface LandingPageProps {
  onStartAnalyzing: () => void;
  onExploreFeatures: () => void;
  onOpenComparison: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function LandingPage({
  onStartAnalyzing,
  onExploreFeatures,
  onOpenComparison,
}: LandingPageProps) {
  return (
    <div className="bg-[#F7F5F0] text-[#0F172A]">
      {/* Hero Section */}
      <section className="relative border-b border-[#E3DFD6] bg-[#F7F5F0] saas-dot-grid overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-22">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Column: Primary Statement & Actions */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, ease: EASE }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <p className="text-sm font-semibold text-[#3730A3] mb-4">
                AI Document Intelligence · Plain-English Agreement Screening
              </p>

              <h1
                className="font-display font-bold tracking-tight text-[#0F172A] text-balance mb-6"
                style={{ fontSize: 'clamp(2.35rem, 4.2vw, 3.75rem)', lineHeight: 1.07 }}
              >
                Don&apos;t Just Accept. Understand.
              </h1>

              <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl mb-8">
                AI-powered document analysis that reveals important clauses, hidden conditions,
                privacy concerns, and complicated terms in seconds.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.15 }}
                  onClick={onStartAnalyzing}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#3730A3] via-[#4338CA] to-[#2563EB] hover:opacity-95 rounded-xl shadow-sm transition-all whitespace-nowrap shrink-0 min-h-[44px]"
                >
                  Analyze Your Document
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </motion.button>

                <button
                  type="button"
                  onClick={onExploreFeatures}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#0F172A] bg-[#FDFCFA] border border-[#D6D1C7] hover:bg-[#EFECE5] rounded-xl transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[44px]"
                >
                  Explore Features
                </button>
              </div>

              <p className="mt-7 text-xs text-[#64748B]">
                Supports PDF uploads, pasted text &amp; live Chrome Extension scanning · Terms,
                Privacy Policies, Leases, Contracts
              </p>
            </motion.div>

            {/* Right Column: Modern SaaS Legal-Tech Visual + Clause Translation Preview */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.08, ease: EASE }}
              className="lg:col-span-6 flex flex-col"
            >
              <div className="relative rounded-2xl overflow-hidden border border-[#E3DFD6] bg-[#EFECE5] shadow-sm min-h-[390px] lg:h-full flex flex-col justify-end">
                <EditorialImage
                  src="/src/assets/images/agreewise_hero_saas_1794985732802.jpg"
                  alt="Modern workspace laptop displaying side-by-side digital contract review on a warm light beige oak desk"
                  fallbackTitle="AgreeWise Document Intelligence"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/82 via-[#0F172A]/25 to-transparent"
                />

                {/* Overlaid Clause Translation Card */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.22, ease: EASE }}
                  className="relative z-10 m-4 sm:m-6 bg-[#FDFCFA]/96 backdrop-blur-md border border-[#E3DFD6] rounded-xl p-5 shadow-md"
                >
                  <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#E3DFD6]">
                    <div>
                      <p className="text-xs font-medium text-[#64748B]">
                        Illustrative Clause Translation
                      </p>
                      <p className="font-display text-sm font-semibold text-[#0F172A]">
                        Automatic Renewal &amp; Rate Increase
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#B91C1C] flex items-center gap-1.5 whitespace-nowrap">
                      <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                      High Priority
                    </span>
                  </div>

                  <p className="mt-3 text-xs font-mono text-[#334155] bg-[#F7F5F0] border border-[#E3DFD6] rounded-lg p-3 leading-relaxed">
                    &ldquo;Unless notice of non-renewal is delivered via certified mail 30 days
                    prior to expiration, this Agreement shall automatically renew...&rdquo;
                  </p>

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm text-[#0F172A] leading-snug">
                      <strong>Plain English:</strong> Charges renew automatically unless you send
                      certified mail 30 days early.
                    </p>
                    <button
                      type="button"
                      onClick={onStartAnalyzing}
                      className="text-xs font-semibold text-[#3730A3] hover:text-[#2563EB] whitespace-nowrap shrink-0 self-start sm:self-auto"
                    >
                      Scan your file →
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Three Feature Cards */}
      <section id="features" className="py-16 lg:py-20 bg-[#FDFCFA] border-b border-[#E3DFD6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="max-w-2xl mb-12"
          >
            <p className="text-xs font-semibold text-[#3730A3] mb-2">Core Capabilities</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] mb-3">
              Clarity before commitment
            </h2>
            <p className="text-base text-[#475569] leading-relaxed">
              Every agreement hides critical obligations inside dense paragraphs. AgreeWise surfaces
              what actually affects your wallet, your rights, and your personal data.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Risk Detection',
                desc: 'Identify potentially risky clauses and unexpected conditions.',
                icon: ShieldAlert,
                accentBg: 'bg-red-50 border-red-200 text-[#B91C1C]',
                graphicLabel: '01 · Risk Screening',
              },
              {
                title: 'Simple Explanations',
                desc: 'Convert complicated legal language into easy-to-understand explanations.',
                icon: BookOpen,
                accentBg: 'bg-indigo-50 border-indigo-200 text-[#3730A3]',
                graphicLabel: '02 · Plain English',
              },
              {
                title: 'Privacy Protection',
                desc: 'Understand what information companies collect and how they may use it.',
                icon: Lock,
                accentBg: 'bg-blue-50 border-blue-200 text-[#1D4ED8]',
                graphicLabel: '03 · Data Audit',
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: idx * 0.08, ease: EASE }}
                  whileHover={{ y: -3 }}
                  className="bg-[#F7F5F0] border border-[#E3DFD6] rounded-2xl p-7 transition-colors hover:border-[#94A3B8] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center ${card.accentBg}`}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <span className="font-mono text-xs text-[#64748B]">{card.graphicLabel}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#0F172A] mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#475569] leading-relaxed">{card.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E3DFD6] flex items-center justify-between text-xs text-[#64748B]">
                    <span>AI-verified excerpt</span>
                    <span className="font-mono text-[#3730A3] font-medium">13 checks</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 pt-6 border-t border-[#E3DFD6] flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#475569]">
              Updating an old policy or comparing two vendor contracts side by side?
            </p>
            <button
              type="button"
              onClick={onOpenComparison}
              className="text-sm font-semibold text-[#3730A3] hover:text-[#2563EB] inline-flex items-center gap-1.5"
            >
              Open Document Comparison
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Illustrative Demo Benchmark Statistics */}
      <section className="py-14 bg-[#EFECE5] border-b border-[#E3DFD6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-xl font-bold text-[#0F172A]">
                Why Manual Reading Breaks Down
              </h2>
              <p className="text-sm text-[#475569] mt-1">
                Illustrative demo benchmarks — reference scenarios, not live platform usage figures.
              </p>
            </div>
            <span className="text-xs font-medium text-[#64748B]">Demo Benchmark Reference</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEMO_BENCHMARK_STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3, delay: idx * 0.06, ease: EASE }}
                className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-xl p-5"
              >
                <p className="font-mono tabular-nums text-2xl font-bold text-[#0F172A] mb-1.5">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-[#0F172A] mb-1">{stat.label}</p>
                <p className="text-xs text-[#64748B]">{stat.context}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AgreeWise? — AI Clause Scanning Graphic + Editorial Breakdown */}
      <section className="py-16 lg:py-20 bg-[#F7F5F0] border-b border-[#E3DFD6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="lg:col-span-5"
            >
              <div className="rounded-2xl overflow-hidden border border-[#E3DFD6] bg-[#EFECE5] h-full min-h-[320px] flex flex-col">
                <EditorialImage
                  src="/src/assets/images/agreewise_clause_scan_1794985732971.jpg"
                  alt="AI cobalt optical beam scanning translucent legal contract clauses over a soft beige surface"
                  fallbackTitle="AI Clause Scanning Engine"
                  className="w-full h-64 lg:h-full object-cover flex-1"
                />
                <div className="p-4 bg-[#FDFCFA] border-t border-[#E3DFD6] flex items-center justify-between text-xs text-[#64748B]">
                  <span>Structured Clause Screening</span>
                  <span className="font-mono text-[#3730A3] font-medium">Grounded Excerpts</span>
                </div>
              </div>
            </motion.div>

            <div className="lg:col-span-7 flex flex-col justify-center">
              <p className="text-xs font-semibold text-[#3730A3] mb-2">The Problem We Solve</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] mb-4">
                Why AgreeWise?
              </h2>
              <p className="text-base text-[#475569] leading-relaxed mb-8">
                Everyday digital services, apartment leases, software trials, and employment offers
                rely on dense legal prose that almost nobody has time to read line by line.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Agreement fatigue is real',
                    text: 'Users routinely click "I Agree" on thousands of words of binding terms because reading every clause before signing up is impractical.',
                  },
                  {
                    title: 'Critical conditions stay buried',
                    text: 'Automatic renewals, price hike permissions, broad third-party data sharing, and arbitration waivers often sit inside neutral sections.',
                  },
                  {
                    title: 'Grounded, honest screening',
                    text: 'AgreeWise quotes exact excerpts from your uploaded document, separates standard terms from risky ones, and flags missing disclosures.',
                  },
                  {
                    title: 'Interactive follow-up Q&A',
                    text: 'Instead of searching Ctrl+F across 20 pages, ask plain questions like "Will I be charged automatically?" and get grounded answers.',
                  },
                ].map((item) => (
                  <div key={item.title} className="border-t border-[#D6D1C7] pt-4">
                    <h3 className="font-display text-base font-semibold text-[#0F172A] mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#475569] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works + Architectural Flow Graphic */}
      <section id="how-it-works" className="py-16 lg:py-20 bg-[#FDFCFA] border-b border-[#E3DFD6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold text-[#3730A3] mb-2">Workflow</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] mb-3">
              How It Works
            </h2>
            <p className="text-base text-[#475569]">
              Four straightforward steps from dense PDF or live webpage to clear understanding.
            </p>
          </div>

          <div className="relative">
            {/* Desktop SVG workflow connector */}
            <svg
              className="hidden lg:block absolute top-10 left-12 right-12 w-[calc(100%-6rem)] h-6 pointer-events-none"
              viewBox="0 0 1000 24"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <motion.path
                d="M 0 12 L 1000 12"
                stroke="#CBD5E1"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease: EASE }}
              />
            </svg>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {[
                {
                  step: '01',
                  title: 'Upload or paste your document',
                  desc: 'Drop in a PDF file (extracted directly in your browser) or paste text from any agreement.',
                  icon: FileSearch,
                },
                {
                  step: '02',
                  title: 'AI reads and analyzes the content',
                  desc: 'Our server-side AI inspects 13 legal, billing, cancellation, and privacy categories.',
                  icon: Scale,
                },
                {
                  step: '03',
                  title: 'Important clauses and concerns are identified',
                  desc: 'Terms are sorted into High, Medium, and Low priority with exact supporting excerpts.',
                  icon: ShieldAlert,
                },
                {
                  step: '04',
                  title: 'Receive a simple summary and report',
                  desc: 'Review plain-English explanations, ask follow-up questions, or export a PDF report.',
                  icon: CheckCircle2,
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.34, delay: idx * 0.08, ease: EASE }}
                    whileHover={{ y: -3 }}
                    className="bg-[#F7F5F0] border border-[#E3DFD6] rounded-2xl p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3730A3] to-[#2563EB] text-white font-mono text-xs font-semibold flex items-center justify-center tabular-nums">
                          {item.step}
                        </span>
                        <Icon className="w-5 h-5 text-[#4338CA]" aria-hidden="true" />
                      </div>
                      <h3 className="font-display text-base font-semibold text-[#0F172A] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[#475569] leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* About & Security Section with Privacy Shield Graphic */}
      <section id="about" className="py-16 lg:py-20 bg-[#F7F5F0] border-b border-[#E3DFD6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div>
                <p className="text-xs font-semibold text-[#3730A3] mb-2">
                  Trust &amp; Transparency
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] mb-4">
                  About AgreeWise &amp; Responsible AI Screening
                </h2>
                <p className="text-base text-[#475569] leading-relaxed mb-4">
                  AgreeWise is built to make everyday agreements legible. Whether you are reviewing
                  a SaaS subscription, a residential lease, an employment offer, or a privacy
                  notice, you deserve to know what you are signing before clicking accept.
                </p>
                <p className="text-sm text-[#475569] leading-relaxed">
                  <strong>Important Legal Disclaimer:</strong> AgreeWise provides informational
                  AI-generated explanations and screening indicators only. It is not a law firm,
                  does not provide legal advice, and is not a substitute for consultation with a
                  qualified attorney.
                </p>
              </div>

              <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#3730A3]" aria-hidden="true" />
                  <h3 className="font-display text-base font-semibold text-[#0F172A]">
                    Privacy &amp; Document Handling Safeguards
                  </h3>
                </div>
                <ul className="space-y-3 text-sm text-[#475569]">
                  <li className="pb-3 border-b border-[#E3DFD6]">
                    <strong className="text-[#0F172A]">Client-side PDF text extraction:</strong>{' '}
                    Uploaded PDFs are parsed locally in your browser using PDF.js before analysis.
                  </li>
                  <li className="pb-3 border-b border-[#E3DFD6]">
                    <strong className="text-[#0F172A]">No raw document storage:</strong> Browser
                    analysis history saves only structured report summaries—never the full text of
                    your uploaded documents.
                  </li>
                  <li>
                    <strong className="text-[#0F172A]">Untrusted-content isolation:</strong>{' '}
                    Documents are analyzed strictly as passive text, protected against embedded
                    prompt instructions.
                  </li>
                </ul>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="lg:col-span-5"
            >
              <div className="rounded-2xl overflow-hidden border border-[#E3DFD6] bg-[#EFECE5] h-full min-h-[340px] flex flex-col">
                <EditorialImage
                  src="/src/assets/images/agreewise_privacy_shield_1794985733111.jpg"
                  alt="Deep navy and frosted glass shield protecting privacy policy documents on a soft beige background"
                  fallbackTitle="Privacy-First Document Screening"
                  className="w-full h-72 lg:h-full object-cover flex-1"
                />
                <div className="p-4 bg-[#FDFCFA] border-t border-[#E3DFD6] flex items-center justify-between text-xs text-[#64748B]">
                  <span>Zero Raw Text Retention</span>
                  <span className="font-mono text-[#3730A3] font-medium">Browser-First Privacy</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-[#3B82F6]/20 blur-3xl pointer-events-none"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance mb-4">
            Understand Before You Agree.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            Upload a Terms &amp; Conditions PDF or paste any agreement to uncover hidden terms,
            privacy practices, and renewal obligations in plain English.
          </p>
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={onStartAnalyzing}
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-[#0F172A] bg-[#FDFCFA] hover:bg-[#EFECE5] rounded-xl shadow-sm transition-colors whitespace-nowrap min-h-[44px]"
          >
            Start Analyzing
            <ArrowRight className="w-4 h-4 text-[#3730A3]" aria-hidden="true" />
          </motion.button>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="bg-[#FDFCFA] border-t border-[#E3DFD6] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2.5">
            <LogoMark size={24} />
            <span className="font-display font-bold text-[#0F172A] text-sm">AgreeWise</span>
            <span aria-hidden="true">·</span>
            <span>AI Document Intelligence Platform</span>
          </div>
          <p>Informational analysis only. Not a substitute for professional legal advice.</p>
        </div>
      </footer>
    </div>
  );
}
