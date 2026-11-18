import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import type { ChatMessage, DocumentAnalysisResult } from '../types/analysis.ts';

interface AskAgreeWiseChatProps {
  analysis: DocumentAnalysisResult;
  documentText: string;
}

const SUGGESTED_QUESTIONS = [
  'Can this company share my personal information?',
  'Will I be charged automatically?',
  'How can I cancel this subscription?',
  'What happens if I terminate this agreement?',
  'Which clauses should I pay attention to?',
];

export function AskAgreeWiseChat({ analysis, documentText }: AskAgreeWiseChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [analysis.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isLoading]);

  const hasRawText = documentText.trim().length > 20;

  const buildAnalysisSummaryContext = () => {
    return JSON.stringify({
      documentName: analysis.documentName,
      category: analysis.category,
      summaryParagraphs: analysis.summaryParagraphs,
      privacyAnalysis: analysis.privacyAnalysis,
      clauses: analysis.clauses.map((c) => ({
        title: c.title,
        riskLevel: c.riskLevel,
        excerpt: c.excerpt,
        simpleExplanation: c.simpleExplanation,
        whyItMatters: c.whyItMatters,
      })),
    });
  };

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: hasRawText ? documentText : '',
          documentName: analysis.documentName,
          analysisSummary: buildAnalysisSummaryContext(),
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Unable to get a response from AgreeWise AI.');
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.reply || 'No response received.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to contact AI assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendQuestion(input);
  };

  return (
    <section
      aria-label="Ask AgreeWise AI"
      className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-2xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E3DFD6] bg-[#F7F5F0] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3730A3] to-[#2563EB] text-white flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-[#0F172A]">Ask AgreeWise AI</h3>
          <p className="text-xs text-[#64748B] truncate">
            Grounded strictly in {analysis.documentName}
          </p>
        </div>
      </div>

      {!hasRawText && (
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900">
          Opened from saved history: raw document text was not stored in your browser for privacy.
          Answers are grounded in your saved analysis report.
        </div>
      )}

      {/* Suggested Questions */}
      <div className="px-6 py-3.5 border-b border-[#E3DFD6] bg-[#FDFCFA]">
        <p className="text-xs font-medium text-[#64748B] mb-2">Suggested questions</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={isLoading}
              onClick={() => void sendQuestion(q)}
              className="text-xs text-left px-3 py-1.5 rounded-lg bg-[#F7F5F0] border border-[#E3DFD6] text-[#334155] hover:bg-indigo-50 hover:border-indigo-200 hover:text-[#3730A3] transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation History */}
      <div className="p-6 space-y-4 max-h-[420px] min-h-[220px] overflow-y-auto bg-[#F7F5F0]/60">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#64748B]">
            Ask any question about fees, cancellation rules, privacy rights, or specific clauses in
            this document.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-[#3730A3] to-[#2563EB] text-white'
                    : 'bg-[#FDFCFA] border border-[#E3DFD6] text-[#0F172A]'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#FDFCFA] border border-[#E3DFD6] rounded-xl px-4 py-3 text-sm text-[#475569] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#3730A3]" aria-hidden="true" />
              Checking the document...
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-[#E3DFD6] bg-[#FDFCFA] flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this document..."
          disabled={isLoading}
          className="flex-1 min-w-0 px-3.5 py-2.5 text-sm bg-[#F7F5F0] border border-[#D6D1C7] rounded-lg text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4338CA] min-h-[44px]"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#3730A3] to-[#2563EB] hover:opacity-95 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap shrink-0 min-h-[44px]"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          <span>Send</span>
        </button>
      </form>
    </section>
  );
}
