import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  wordCount: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function extractTextFromPdf(
  file: File,
  onProgress?: (percent: number) => void
): Promise<PdfExtractionResult> {
  const isPdfMime = file.type === 'application/pdf';
  const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfMime && !isPdfExt) {
    throw new Error('Invalid file type. Please upload a valid PDF document (.pdf).');
  }

  if (file.size === 0) {
    throw new Error('The uploaded PDF file is empty.');
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error(
      `File exceeds the 10 MB size limit (${formatFileSize(file.size)}). Please upload a smaller PDF or paste the text directly.`
    );
  }

  onProgress?.(10);
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(25);

  let pdfDocument: pdfjsLib.PDFDocumentProxy;
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    pdfDocument = await loadingTask.promise;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes('password')) {
      throw new Error(
        'This PDF is password-protected or encrypted. Please unlock it or paste the document text directly.'
      );
    }
    throw new Error(
      'Unable to read this PDF file. Please verify it is not corrupted or paste the text directly.'
    );
  }

  const totalPages = pdfDocument.numPages;
  if (totalPages === 0) {
    throw new Error('This PDF contains zero pages.');
  }

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const strings = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .filter(Boolean);
    pageTexts.push(strings.join(' ').replace(/\s+/g, ' ').trim());

    const progress = 25 + Math.round((pageNum / totalPages) * 75);
    onProgress?.(progress);
  }

  const fullText = pageTexts.filter(Boolean).join('\n\n').trim();
  const alphanumericChars = fullText.replace(/[^a-zA-Z0-9]/g, '').length;

  if (!fullText || alphanumericChars < 30) {
    throw new Error(
      'No extractable text was found in this PDF. It appears to be a scanned or image-only PDF. Please use an OCR-processed PDF or paste the document text directly.'
    );
  }

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  return {
    text: fullText,
    pageCount: totalPages,
    wordCount,
  };
}
