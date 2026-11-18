(() => {
  if (window.__agreeWiseContentLoaded) return;
  window.__agreeWiseContentLoaded = true;

  const BANNER_HOST_ID = 'agreewise-policy-banner-host';
  const MAX_EXTRACTED_CHARS = 140000;

  const URL_PATTERNS = [
    /terms[-_]?of[-_]?(use|service)/i,
    /terms[-_]?and[-_]?conditions/i,
    /\b(terms|tos|eula|legal|privacy|cookies?|gdpr|ccpa|subscription|agreement|subscriber)\b/i,
  ];

  const HEADING_PATTERNS = [
    /terms\s+(of\s+(use|service)|&\s*conditions|and\s+conditions)/i,
    /privacy\s+(policy|notice|statement)/i,
    /cookie\s+(policy|notice)/i,
    /(user|subscription|license|rental|service)\s+agreement/i,
    /end\s+user\s+license/i,
    /legal\s+(notice|terms|disclosures)/i,
  ];

  const BODY_KEYWORDS = [
    'automatic renewal',
    'automatically renew',
    'terms of service',
    'terms and conditions',
    'privacy policy',
    'personal data',
    'personal information',
    'third parties',
    'third-party',
    'binding arbitration',
    'class action waiver',
    'limitation of liability',
    'indemnify',
    'governing law',
    'data retention',
    'cookie policy',
    'cancel your subscription',
    'by accessing or using',
    'by clicking',
  ];

  function isAgreeWiseWebApp() {
    if (document.title && document.title.includes('AgreeWise — AI Document Intelligence Platform')) {
      return true;
    }
    return false;
  }

  function isPdfDocument() {
    if (document.contentType === 'application/pdf') return true;
    if (window.location.pathname.toLowerCase().endsWith('.pdf')) return true;
    const embed = document.querySelector('embed[type="application/pdf"]');
    return Boolean(embed);
  }

  function detectPolicyDocument() {
    if (isAgreeWiseWebApp() || isPdfDocument()) {
      return { detected: false, category: 'Other' };
    }

    const urlStr = `${window.location.pathname} ${window.location.search}`.toLowerCase();
    const titleStr = (document.title || '').toLowerCase();
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .slice(0, 15)
      .map((el) => (el.textContent || '').trim())
      .filter(Boolean)
      .join(' ');

    let score = 0;
    let detectedCategory = 'Terms & Conditions';

    if (/privacy|gdpr|ccpa|cookie/i.test(urlStr + ' ' + titleStr)) {
      detectedCategory = 'Privacy Policy';
    } else if (/subscription|billing|renewal/i.test(urlStr + ' ' + titleStr)) {
      detectedCategory = 'Subscription Agreement';
    }

    if (URL_PATTERNS.some((re) => re.test(urlStr))) score += 3;
    if (HEADING_PATTERNS.some((re) => re.test(titleStr))) score += 3;
    if (HEADING_PATTERNS.some((re) => re.test(headings))) score += 3;

    const bodySample = (document.body?.innerText || '').slice(0, 12000).toLowerCase();
    let keywordHits = 0;
    for (const kw of BODY_KEYWORDS) {
      if (bodySample.includes(kw)) keywordHits += 1;
    }
    if (keywordHits >= 4) score += 3;
    else if (keywordHits >= 2) score += 1;

    if (score >= 4 && bodySample.trim().length > 250) {
      return { detected: true, category: detectedCategory };
    }
    return { detected: false, category: detectedCategory };
  }

  function isElementVisible(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    return true;
  }

  function isUnwantedContainer(el) {
    if (!el || el.id === BANNER_HOST_ID) return true;
    const tag = el.tagName?.toLowerCase();
    if (['nav', 'header', 'footer', 'aside', 'script', 'style', 'noscript', 'svg', 'iframe', 'button', 'form'].includes(tag)) {
      return true;
    }
    const role = (el.getAttribute('role') || '').toLowerCase();
    if (['navigation', 'banner', 'contentinfo', 'complementary', 'search'].includes(role)) {
      return true;
    }
    const idAndClass = `${el.id || ''} ${typeof el.className === 'string' ? el.className : ''}`.toLowerCase();
    if (
      /\b(nav|navbar|sidebar|footer|cookie-banner|cookie-consent|consent-banner|advert|ad-slot|promo-banner|menu|breadcrumb|social-share)\b/.test(
        idAndClass
      )
    ) {
      return true;
    }
    return false;
  }

  function scoreContainerForLegalContent(el) {
    const text = (el.innerText || '').trim();
    if (text.length < 300) return 0;
    const lower = text.slice(0, 6000).toLowerCase();
    let hits = 0;
    for (const kw of BODY_KEYWORDS) {
      if (lower.includes(kw)) hits += 1;
    }
    const tag = el.tagName.toLowerCase();
    const baseBonus = tag === 'main' || tag === 'article' || el.getAttribute('role') === 'main' ? 5 : 0;
    return hits * 2 + baseBonus + Math.min(4, Math.floor(text.length / 2500));
  }

  function extractStructuredText(rootEl) {
    const blocks = [];
    const blockTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'li', 'blockquote', 'dt', 'dd']);

    function walk(node) {
      if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
      if (isUnwantedContainer(node) || !isElementVisible(node)) return;

      const tag = node.tagName.toLowerCase();
      if (blockTags.has(tag)) {
        const text = (node.innerText || '').replace(/\s+/g, ' ').trim();
        if (text.length > 2) {
          if (tag.startsWith('h')) {
            blocks.push(`\n## ${text}`);
          } else if (tag === 'li') {
            blocks.push(`• ${text}`);
          } else {
            blocks.push(text);
          }
        }
        return;
      }

      for (const child of node.children) {
        walk(child);
      }
    }

    walk(rootEl);

    const joined = blocks.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
    if (joined.length >= 250) {
      return joined;
    }

    // Fallback to clean innerText if page uses non-semantic divs
    const clone = rootEl.cloneNode(true);
    clone
      .querySelectorAll('nav, header, footer, aside, script, style, noscript, [role="navigation"]')
      .forEach((n) => n.remove());
    return (clone.innerText || '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function extractPolicyContent() {
    if (isPdfDocument()) {
      return {
        ok: false,
        errorCode: 'PDF_PAGE',
        error:
          'This tab is displaying a browser-rendered PDF. Open the AgreeWise web workspace to upload and analyze PDF files directly.',
      };
    }

    const candidates = Array.from(
      document.querySelectorAll('main, article, [role="main"], section, div')
    ).filter((el) => !isUnwantedContainer(el) && isElementVisible(el));

    let bestEl = document.body;
    let bestScore = 0;

    for (const el of candidates) {
      // Skip giant wrappers that equal whole body unless no better child exists
      if (el === document.body) continue;
      const sc = scoreContainerForLegalContent(el);
      if (sc > bestScore) {
        bestScore = sc;
        bestEl = el;
      }
    }

    let extracted = extractStructuredText(bestEl || document.body);
    if ((!extracted || extracted.length < 150) && bestEl !== document.body) {
      extracted = extractStructuredText(document.body);
    }

    const words = extracted ? extracted.split(/\s+/).filter(Boolean).length : 0;
    if (!extracted || words < 25 || extracted.length < 120) {
      return {
        ok: false,
        errorCode: 'INSUFFICIENT_TEXT',
        error:
          'Not enough readable legal or policy text was found on this page. If the document is behind a login wall or rendered as images, copy and paste it into the AgreeWise dashboard.',
      };
    }

    let truncated = false;
    if (extracted.length > MAX_EXTRACTED_CHARS) {
      extracted = extracted.slice(0, MAX_EXTRACTED_CHARS);
      truncated = true;
    }

    return {
      ok: true,
      documentName: document.title ? document.title.trim() : window.location.hostname,
      sourceUrl: window.location.href,
      domain: window.location.hostname,
      documentText: extracted,
      wordCount: extracted.split(/\s+/).filter(Boolean).length,
      truncated,
    };
  }

  // Expose helper for programmatic scripting.executeScript calls from popup
  window.__agreeWiseExtractPolicy = extractPolicyContent;

  function removeBanner() {
    const existing = document.getElementById(BANNER_HOST_ID);
    if (existing) existing.remove();
  }

  function getSessionDismissKey() {
    return `agreewise_dismissed_${window.location.origin}${window.location.pathname}`;
  }

  function markDismissedLocally() {
    try {
      sessionStorage.setItem(getSessionDismissKey(), '1');
    } catch {
      // Ignore storage failures on restricted frames
    }
    chrome.runtime.sendMessage({
      type: 'DISMISS_URL',
      url: `${window.location.origin}${window.location.pathname}`,
    });
  }

  function isDismissedLocally() {
    try {
      if (sessionStorage.getItem(getSessionDismissKey()) === '1') return true;
    } catch {
      // Ignore
    }
    return false;
  }

  function showDetectionBanner(detectedCategory) {
    if (document.getElementById(BANNER_HOST_ID)) return;

    const host = document.createElement('div');
    host.id = BANNER_HOST_ID;
    host.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';

    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        .card {
          width: 348px;
          max-width: calc(100vw - 32px);
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          box-shadow: 0 18px 38px -12px rgba(15, 23, 42, 0.22), 0 4px 12px -2px rgba(79, 70, 229, 0.12);
          padding: 16px;
          box-sizing: border-box;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logo {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: linear-gradient(135deg, #4f46e5, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
        }
        .title {
          font-size: 14px;
          font-weight: 700;
          color: #1e1b4b;
          margin: 0;
        }
        .sub {
          font-size: 11px;
          color: #64748b;
          margin: 0;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          font-size: 16px;
          line-height: 1;
        }
        .close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .body-text {
          font-size: 13px;
          line-height: 1.45;
          color: #334155;
          margin: 0 0 14px 0;
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .primary-btn {
          flex: 1;
          border: none;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 12.5px;
          font-weight: 600;
          color: #ffffff;
          background: linear-gradient(90deg, #4f46e5, #2563eb);
          cursor: pointer;
          transition: opacity 0.15s ease;
        }
        .primary-btn:hover {
          opacity: 0.93;
        }
        .primary-btn:disabled {
          opacity: 0.65;
          cursor: wait;
        }
        .dismiss-btn {
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
        }
        .dismiss-btn:hover {
          background: #f8fafc;
          color: #0f172a;
        }
        .error-msg {
          margin-top: 8px;
          font-size: 11.5px;
          color: #b91c1c;
          display: none;
        }
      </style>
      <div class="card" role="dialog" aria-label="AgreeWise policy detector">
        <div class="header">
          <div class="brand">
            <div class="logo" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div>
              <p class="title">AgreeWise</p>
              <p class="sub">${detectedCategory} detected</p>
            </div>
          </div>
          <button class="close-btn" id="aw-close" aria-label="Dismiss notification">&times;</button>
        </div>
        <p class="body-text">
          AgreeWise found a policy document. Want to understand it before agreeing?
        </p>
        <div class="actions">
          <button class="primary-btn" id="aw-open-web">Analyze Now on AgreeWise</button>
          <button class="dismiss-btn" id="aw-dismiss">Dismiss</button>
        </div>
        <p class="error-msg" id="aw-error"></p>
      </div>
    `;

    document.documentElement.appendChild(host);

    const openBtn = shadow.getElementById('aw-open-web');
    const dismissBtn = shadow.getElementById('aw-dismiss');
    const closeBtn = shadow.getElementById('aw-close');
    const errorEl = shadow.getElementById('aw-error');

    const handleDismiss = () => {
      markDismissedLocally();
      removeBanner();
    };

    dismissBtn.addEventListener('click', handleDismiss);
    closeBtn.addEventListener('click', handleDismiss);

    openBtn.addEventListener('click', () => {
      errorEl.style.display = 'none';
      openBtn.disabled = true;
      openBtn.textContent = 'Opening AgreeWise...';

      const extracted = extractPolicyContent();
      if (!extracted.ok) {
        openBtn.disabled = false;
        openBtn.textContent = 'Analyze Now on AgreeWise';
        errorEl.textContent = extracted.error;
        errorEl.style.display = 'block';
        return;
      }

      chrome.runtime.sendMessage(
        {
          type: 'OPEN_ON_WEB_APP',
          payload: {
            documentName: extracted.documentName,
            category: detectedCategory,
            documentText: extracted.documentText,
            sourceUrl: extracted.sourceUrl,
          },
        },
        (resp) => {
          if (chrome.runtime.lastError || !resp?.ok) {
            openBtn.disabled = false;
            openBtn.textContent = 'Analyze Now on AgreeWise';
            errorEl.textContent =
              resp?.error ||
              chrome.runtime.lastError?.message ||
              'Unable to connect to AgreeWise server.';
            errorEl.style.display = 'block';
            return;
          }
          markDismissedLocally();
          removeBanner();
        }
      );
    });
  }

  function runDetectionCheck() {
    if (isDismissedLocally()) return;

    const result = detectPolicyDocument();
    if (!result.detected) return;

    chrome.runtime.sendMessage(
      {
        type: 'IS_URL_DISMISSED',
        url: `${window.location.origin}${window.location.pathname}`,
      },
      (resp) => {
        if (chrome.runtime.lastError) return;
        if (resp?.dismissed) return;
        chrome.runtime.sendMessage({
          type: 'POLICY_DETECTED',
          category: result.category,
          url: window.location.href,
        });
        showDetectionBanner(result.category);
      }
    );
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'EXTRACT_PAGE_TEXT') {
      sendResponse(extractPolicyContent());
      return true;
    }
    if (message?.type === 'PING_AGREEWISE') {
      const detection = detectPolicyDocument();
      sendResponse({ ok: true, ...detection });
      return true;
    }
    return false;
  });

  // Initial check + lightweight SPA navigation observer
  let lastCheckedHref = window.location.href;
  setTimeout(runDetectionCheck, 900);

  const checkUrlChange = () => {
    if (window.location.href !== lastCheckedHref) {
      lastCheckedHref = window.location.href;
      removeBanner();
      setTimeout(runDetectionCheck, 1000);
    }
  };

  window.addEventListener('popstate', checkUrlChange);
  window.addEventListener('hashchange', checkUrlChange);
  setInterval(checkUrlChange, 2500);
})();
