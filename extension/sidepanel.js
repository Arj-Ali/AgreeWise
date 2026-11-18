const DEFAULT_SERVER_URL = 'https://ais-dev-pr4pjugatqdqkmf5cymjvd-1000238381404.asia-southeast1.run.app';

let currentTabId = null;
let currentState = null;
let riskFilter = 'All';
let chatMessages = [];
let isSendingChat = false;

const headerMetaEl = document.getElementById('header-doc-meta');
const openFullWebBtn = document.getElementById('btn-open-full-web');
const openFullWebBottomBtn = document.getElementById('btn-open-full-web-bottom');

const emptyStateEl = document.getElementById('state-empty');
const loadingStateEl = document.getElementById('state-loading');
const loadingDocNameEl = document.getElementById('loading-doc-name');
const errorStateEl = document.getElementById('state-error');
const errorMessageEl = document.getElementById('error-message');
const resultsContainerEl = document.getElementById('results-container');

const analyzeActiveBtn = document.getElementById('btn-analyze-active');
const retryBtn = document.getElementById('btn-retry-analyze');
const errorOpenWebBtn = document.getElementById('btn-error-open-web');

const riskLabelEl = document.getElementById('risk-label');
const riskScoreEl = document.getElementById('risk-score');
const riskBarEl = document.getElementById('risk-bar');
const riskNoteEl = document.getElementById('risk-note');

const countHighEl = document.getElementById('count-high');
const countMediumEl = document.getElementById('count-medium');
const countLowEl = document.getElementById('count-low');
const priorityCards = Array.from(document.querySelectorAll('.priority-card'));

const summaryParagraphsEl = document.getElementById('summary-paragraphs');
const clausesCountEl = document.getElementById('clauses-count');
const clausesListEl = document.getElementById('clauses-list');
const resetFilterBtn = document.getElementById('btn-reset-filter');
const privacyListEl = document.getElementById('privacy-list');
const checklistEl = document.getElementById('checklist-items');

const chatHistoryEl = document.getElementById('chat-history');
const chatErrorEl = document.getElementById('chat-error');
const chatFormEl = document.getElementById('chat-form');
const chatInputEl = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const suggestedChips = Array.from(document.querySelectorAll('.chip-btn'));

function showSection(section) {
  emptyStateEl.classList.add('hidden');
  loadingStateEl.classList.add('hidden');
  errorStateEl.classList.add('hidden');
  resultsContainerEl.classList.add('hidden');
  section.classList.remove('hidden');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function renderClauses() {
  const analysis = currentState?.analysis;
  if (!analysis) return;

  const filtered = (analysis.clauses || []).filter(
    (c) => riskFilter === 'All' || c.riskLevel === riskFilter
  );

  clausesCountEl.textContent = String(filtered.length);
  resetFilterBtn.classList.toggle('hidden', riskFilter === 'All');

  priorityCards.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === riskFilter);
  });

  clausesListEl.innerHTML = '';
  if (filtered.length === 0) {
    clausesListEl.innerHTML =
      '<div class="card"><p class="muted-note">No clauses match the selected priority filter.</p></div>';
    return;
  }

  filtered.forEach((clause, idx) => {
    const item = document.createElement('div');
    item.className = 'clause-item';
    const isExpanded = clause.riskLevel === 'High' || idx < 2;
    const riskClass =
      clause.riskLevel === 'High'
        ? 'risk-high'
        : clause.riskLevel === 'Medium'
        ? 'risk-medium'
        : 'risk-low';

    item.innerHTML = `
      <button type="button" class="clause-trigger" aria-expanded="${isExpanded}">
        <div>
          <div class="clause-meta">
            <span>${escapeHtml(clause.category)}</span>
            <span aria-hidden="true">·</span>
            <span class="${riskClass}">${escapeHtml(clause.riskLevel)} Priority</span>
          </div>
          <h3 class="clause-title">${escapeHtml(clause.title)}</h3>
        </div>
        <span class="chevron" aria-hidden="true">${isExpanded ? '▲' : '▼'}</span>
      </button>
      <div class="clause-body ${isExpanded ? '' : 'hidden'}">
        ${
          clause.excerpt
            ? `<blockquote class="clause-excerpt">&ldquo;${escapeHtml(clause.excerpt)}&rdquo;</blockquote>`
            : ''
        }
        <div>
          <p class="field-label">Simple English</p>
          <p class="field-text">${escapeHtml(clause.simpleExplanation)}</p>
        </div>
        <div>
          <p class="field-label dark">Why It Matters</p>
          <p class="field-text">${escapeHtml(clause.whyItMatters)}</p>
        </div>
        <div>
          <p class="field-label dark">Suggested Action</p>
          <p class="field-text">${escapeHtml(clause.recommendedAction)}</p>
        </div>
      </div>
    `;

    const trigger = item.querySelector('.clause-trigger');
    const body = item.querySelector('.clause-body');
    const chevron = item.querySelector('.chevron');

    trigger.addEventListener('click', () => {
      const hidden = body.classList.toggle('hidden');
      trigger.setAttribute('aria-expanded', String(!hidden));
      chevron.textContent = hidden ? '▼' : '▲';
    });

    clausesListEl.appendChild(item);
  });
}

function renderResults(state) {
  currentState = state;
  const analysis = state.analysis;
  if (!analysis) return;

  headerMetaEl.textContent = `${analysis.category} · ${analysis.wordCount.toLocaleString()} words`;
  openFullWebBtn.classList.remove('hidden');

  const score = analysis.riskScore || 0;
  riskScoreEl.textContent = String(score);
  riskLabelEl.textContent = analysis.riskLabel || 'Lower identified concern';

  let color = '#16a34a';
  if (score >= 61) color = '#dc2626';
  else if (score >= 31) color = '#d97706';

  riskLabelEl.style.color = color;
  riskBarEl.style.width = `${score}%`;
  riskBarEl.style.background = color;
  riskNoteEl.textContent = analysis.riskDerivationNote || '';

  countHighEl.textContent = String(analysis.counts?.high || 0);
  countMediumEl.textContent = String(analysis.counts?.medium || 0);
  countLowEl.textContent = String(analysis.counts?.low || 0);

  summaryParagraphsEl.innerHTML = '';
  (analysis.summaryParagraphs || []).forEach((para) => {
    const p = document.createElement('p');
    p.textContent = para;
    summaryParagraphsEl.appendChild(p);
  });

  riskFilter = 'All';
  renderClauses();

  const privacy = analysis.privacyAnalysis || {};
  const privacyRows = [
    ['Personal Information Collected', privacy.personalDataCollected],
    ['Third-Party Sharing', privacy.thirdPartySharing],
    ['How Information Is Used', privacy.howInfoIsUsed],
    ['Data Retention Policy', privacy.dataRetentionExplained],
    ['Deletion Options', privacy.deletionOptionsMentioned],
  ];
  privacyListEl.innerHTML = '';
  privacyRows.forEach(([title, val]) => {
    const row = document.createElement('div');
    row.className = 'privacy-row';
    row.innerHTML = `
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(val || 'Not found in the provided document.')}</p>
    `;
    privacyListEl.appendChild(row);
  });

  checklistEl.innerHTML = '';
  (analysis.checklistQuestions || []).forEach((q) => {
    const li = document.createElement('li');
    li.textContent = q;
    checklistEl.appendChild(li);
  });

  chatMessages = [];
  renderChatHistory();
  showSection(resultsContainerEl);
}

function renderChatHistory() {
  chatHistoryEl.innerHTML = '';
  if (chatMessages.length === 0) {
    chatHistoryEl.innerHTML = '<p class="chat-empty">Ask a question below to inspect specific terms.</p>';
    return;
  }
  chatMessages.forEach((msg) => {
    const div = document.createElement('div');
    div.className = `chat-msg ${msg.role}`;
    div.textContent = msg.content;
    chatHistoryEl.appendChild(div);
  });
  chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
}

function applyTabState(state) {
  currentState = state;
  if (!state || state.status === 'idle') {
    openFullWebBtn.classList.add('hidden');
    headerMetaEl.textContent = 'AI Policy Screening';
    showSection(emptyStateEl);
    return;
  }

  if (state.status === 'loading') {
    openFullWebBtn.classList.add('hidden');
    headerMetaEl.textContent = state.documentName || 'Analyzing page...';
    loadingDocNameEl.textContent = `Analyzing "${state.documentName || 'current webpage'}" in plain English...`;
    showSection(loadingStateEl);
    return;
  }

  if (state.status === 'error') {
    openFullWebBtn.classList.add('hidden');
    errorMessageEl.textContent = state.error || 'Analysis failed.';
    showSection(errorStateEl);
    return;
  }

  if (state.status === 'ready' && state.analysis) {
    renderResults(state);
  }
}

async function triggerCurrentTabAnalysis() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.id) return;
  currentTabId = tab.id;

  const urlLower = (tab.url || '').toLowerCase();
  if (
    !urlLower ||
    urlLower.startsWith('chrome://') ||
    urlLower.startsWith('chrome-extension://') ||
    urlLower.startsWith('edge://') ||
    urlLower.startsWith('about:')
  ) {
    applyTabState({
      status: 'error',
      error: 'Browser system pages cannot be analyzed. Navigate to a website first.',
    });
    return;
  }

  applyTabState({ status: 'loading', documentName: tab.title || 'Current webpage' });

  try {
    let extracted = null;
    try {
      extracted = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_PAGE_TEXT' });
    } catch {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
      const res = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => (window.__agreeWiseExtractPolicy ? window.__agreeWiseExtractPolicy() : null),
      });
      extracted = res?.[0]?.result;
    }

    if (!extracted?.ok) {
      applyTabState({
        status: 'error',
        error: extracted?.error || 'Could not extract readable text from this page.',
      });
      return;
    }

    await chrome.runtime.sendMessage({
      type: 'START_TAB_ANALYSIS',
      payload: {
        tabId: tab.id,
        documentName: extracted.documentName,
        category: 'Terms & Conditions',
        sourceUrl: extracted.sourceUrl,
        documentText: extracted.documentText,
        truncated: extracted.truncated,
      },
    });
  } catch (err) {
    applyTabState({
      status: 'error',
      error: err instanceof Error ? err.message : 'Failed to extract page text.',
    });
  }
}

async function openFullOnWeb() {
  if (!currentState) return;
  const btn = openFullWebBottomBtn;
  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Opening AgreeWise Website...';

  chrome.runtime.sendMessage(
    {
      type: 'OPEN_ON_WEB_APP',
      payload: {
        documentName: currentState.documentName,
        category: currentState.category,
        documentText: currentState.documentText,
        sourceUrl: currentState.sourceUrl,
        analysisResult: currentState.analysis || null,
      },
    },
    (resp) => {
      btn.disabled = false;
      btn.textContent = orig;
      if (!resp?.ok) {
        chatErrorEl.textContent = resp?.error || 'Unable to open AgreeWise web app.';
        chatErrorEl.classList.remove('hidden');
      }
    }
  );
}

async function sendChatQuestion(questionText) {
  const q = questionText.trim();
  if (!q || isSendingChat || !currentState?.analysis) return;

  chatErrorEl.classList.add('hidden');
  chatMessages.push({ role: 'user', content: q });
  renderChatHistory();
  chatInputEl.value = '';
  isSendingChat = true;
  chatSendBtn.disabled = true;
  chatSendBtn.textContent = '...';

  const summaryContext = JSON.stringify({
    documentName: currentState.documentName,
    summaryParagraphs: currentState.analysis.summaryParagraphs,
    privacyAnalysis: currentState.analysis.privacyAnalysis,
    clauses: currentState.analysis.clauses,
  });

  chrome.runtime.sendMessage(
    {
      type: 'ASK_AI_QUESTION',
      payload: {
        documentText: currentState.documentText || '',
        documentName: currentState.documentName,
        analysisSummary: summaryContext,
        messages: chatMessages,
      },
    },
    (resp) => {
      isSendingChat = false;
      chatSendBtn.disabled = false;
      chatSendBtn.textContent = 'Send';

      if (chrome.runtime.lastError || !resp?.ok) {
        chatErrorEl.textContent =
          resp?.error || chrome.runtime.lastError?.message || 'Unable to get an answer.';
        chatErrorEl.classList.remove('hidden');
        return;
      }

      chatMessages.push({ role: 'assistant', content: resp.reply });
      renderChatHistory();
    }
  );
}

async function loadActiveTabState() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.id) {
    applyTabState(null);
    return;
  }
  currentTabId = tab.id;
  const resp = await chrome.runtime.sendMessage({ type: 'GET_TAB_STATE', tabId: tab.id });
  applyTabState(resp?.state || null);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'TAB_STATE_UPDATED' && message.tabId === currentTabId) {
    applyTabState(message.state);
  }
});

chrome.tabs.onActivated.addListener(() => {
  loadActiveTabState().catch(() => {});
});

priorityCards.forEach((card) => {
  card.addEventListener('click', () => {
    const chosen = card.dataset.filter;
    riskFilter = riskFilter === chosen ? 'All' : chosen;
    renderClauses();
  });
});

resetFilterBtn.addEventListener('click', () => {
  riskFilter = 'All';
  renderClauses();
});

analyzeActiveBtn.addEventListener('click', triggerCurrentTabAnalysis);
retryBtn.addEventListener('click', triggerCurrentTabAnalysis);
openFullWebBtn.addEventListener('click', openFullOnWeb);
openFullWebBottomBtn.addEventListener('click', openFullOnWeb);

errorOpenWebBtn.addEventListener('click', async () => {
  const data = await chrome.storage.local.get(['agreewiseServerUrl']);
  const serverUrl = (data.agreewiseServerUrl || '').trim().replace(/\/+$/, '') || DEFAULT_SERVER_URL;
  chrome.tabs.create({ url: serverUrl });
});

suggestedChips.forEach((btn) => {
  btn.addEventListener('click', () => {
    sendChatQuestion(btn.textContent || '');
  });
});

chatFormEl.addEventListener('submit', (e) => {
  e.preventDefault();
  sendChatQuestion(chatInputEl.value);
});

loadActiveTabState().catch(() => {});
