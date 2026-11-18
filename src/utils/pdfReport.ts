import { jsPDF } from 'jspdf';
import type { DocumentAnalysisResult } from '../types/analysis.ts';

export function downloadAnalysisPdf(analysis: DocumentAnalysisResult): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  const maxWidth = pageWidth - margin * 2;
  let y = 52;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 54) {
      doc.addPage();
      y = 52;
    }
  };

  const addWrappedText = (
    text: string,
    fontSize: number,
    color: [number, number, number] = [30, 41, 59],
    isBold = false,
    lineHeightFactor = 1.4
  ) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    const lineHeight = fontSize * lineHeightFactor;
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    }
  };

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 86, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('AgreeWise — Document Analysis Report', margin, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  const formattedDate = new Date(analysis.analyzedAt).toLocaleString();
  doc.text(`Generated on ${formattedDate}  |  AI Screening Report`, margin, 60);

  y = 112;

  // Document Metadata
  addWrappedText(`Document: ${analysis.documentName}`, 13, [15, 23, 42], true);
  y += 2;
  addWrappedText(
    `Category: ${analysis.category}   ·   Words Analyzed: ${analysis.wordCount.toLocaleString()}   ·   Clauses Found: ${analysis.counts.totalClauses} (${analysis.counts.concerningClauses} High/Medium Priority)`,
    10,
    [71, 85, 105]
  );
  y += 10;

  // Risk Score Box
  ensureSpace(74);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, maxWidth, 62, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Overall Risk Indicator: ${analysis.riskScore}/100 — ${analysis.riskLabel}`,
    margin + 14,
    y + 22
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const noteLines = doc.splitTextToSize(analysis.riskDerivationNote, maxWidth - 28) as string[];
  doc.text(noteLines.slice(0, 2), margin + 14, y + 39);
  y += 78;

  // Disclaimer
  addWrappedText(
    'Disclaimer: AgreeWise provides informational AI screening and plain-English explanations only. This report is not legal advice and is not a substitute for review by a qualified attorney.',
    9,
    [100, 116, 139]
  );
  y += 14;

  // Simple Summary
  addWrappedText('1. Simple Summary', 13, [30, 27, 75], true);
  y += 4;
  for (const para of analysis.summaryParagraphs) {
    addWrappedText(para, 10, [51, 65, 85]);
    y += 6;
  }
  y += 8;

  // Privacy Analysis
  ensureSpace(40);
  addWrappedText('2. Privacy & Data Handling Analysis', 13, [30, 27, 75], true);
  y += 4;
  const privacyItems: Array<[string, string]> = [
    ['Personal Information Collected', analysis.privacyAnalysis.personalDataCollected],
    ['Third-Party Sharing', analysis.privacyAnalysis.thirdPartySharing],
    ['How Information Is Used', analysis.privacyAnalysis.howInfoIsUsed],
    ['Data Retention Policy', analysis.privacyAnalysis.dataRetentionExplained],
    ['Deletion Options', analysis.privacyAnalysis.deletionOptionsMentioned],
  ];
  for (const [label, val] of privacyItems) {
    addWrappedText(`${label}:`, 10, [15, 23, 42], true);
    addWrappedText(val, 10, [71, 85, 105]);
    y += 4;
  }
  y += 10;

  // Important Clauses
  ensureSpace(40);
  addWrappedText('3. Identified Clauses & Explanations', 13, [30, 27, 75], true);
  y += 6;

  analysis.clauses.forEach((clause, idx) => {
    ensureSpace(85);
    const riskColor: [number, number, number] =
      clause.riskLevel === 'High'
        ? [185, 28, 28]
        : clause.riskLevel === 'Medium'
        ? [180, 83, 9]
        : [21, 128, 61];

    addWrappedText(
      `${idx + 1}. ${clause.title} [${clause.riskLevel} Priority · ${clause.category}]`,
      11,
      riskColor,
      true
    );
    y += 2;

    if (clause.excerpt) {
      addWrappedText(`Excerpt: "${clause.excerpt}"`, 9, [100, 116, 139]);
      y += 2;
    }
    addWrappedText(`Plain English: ${clause.simpleExplanation}`, 10, [30, 41, 59]);
    addWrappedText(`Why it matters: ${clause.whyItMatters}`, 10, [51, 65, 85]);
    addWrappedText(`What to check: ${clause.recommendedAction}`, 10, [30, 58, 138]);
    y += 10;
  });

  // Checklist
  if (analysis.checklistQuestions.length > 0) {
    ensureSpace(40);
    addWrappedText('4. What Should You Check Before Agreeing?', 13, [30, 27, 75], true);
    y += 4;
    analysis.checklistQuestions.forEach((q) => {
      addWrappedText(`[ ] ${q}`, 10, [51, 65, 85]);
      y += 3;
    });
  }

  const safeFilename = analysis.documentName
    .replace(/\.pdf$/i, '')
    .replace(/[^a-z0-9-_]+/gi, '_')
    .toLowerCase();
  doc.save(`${safeFilename || 'agreewise'}_analysis_report.pdf`);
}
