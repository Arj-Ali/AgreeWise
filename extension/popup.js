const DEFAULT_SERVER_URL = 'https://ais-dev-pr4pjugatqdqkmf5cymjvd-1000238381404.asia-southeast1.run.app';

let activeTab = null;

const domainEl = document.getElementById('current-domain');
const statusEl = document.getElementById('site-status');
const errorBox = document.getElementById('error-box');
const analyzeBtn = document.getElementById('btn-analyze-page');
const privacyBtn = document.getElementById('btn-privacy-analyzer');
const termsBtn = document.getElementById('btn-terms-analyzer');
const openDashboardBtn = document.getElementById('btn-open-dashboard');
const openDashboardTopBtn = document.getElementById('open-dashboard-top');

const toggleSettingsBtn = document.getElementById('toggle-settings');
const settingsChevron = document.getElementById('settings-chevron');
const settingsPanel = document.getElementById('settings-panel');
const serverUrlInput = document.getElementById('server-url-input');
const saveServerUrlBtn = document.getElementById('save-server-url');
const saveFeedback = document.getElementById('save-feedback');

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove('hidden');
}

function clearError() {
  errorBox.textContent = '';
  errorBox.classList.add('hidden');
}

function isRestrictedUrl(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  return (
    lower.startsWith('chrome://') ||
    lower.startsWith('chrome-extension://') ||
    lower.startsWith('edge://') ||
    lower.startsWith('about:') ||
    lower.startsWith('https://chrome.google.com/webstore') ||
    lower.startsWith('https://chromewebstore.google.com')
  );
}

async function getConfiguredServerUrl() {
  const data = await chrome.storage.local.get(['agreewiseServerUrl']);
  return (data.agreewiseServerUrl || '').trim().replace(/\/+$/, '') || DEFAULT_SERVER_URL;
}

async function extractFromTab(tabId) {
  try {
    const resp = await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_PAGE_TEXT' });
    if (resp) return resp;
  } catch {
    // Content script not injected yet on pre-existing tab; inject now via scripting API
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js'],
  });

  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      if (typeof window.__agreeWiseExtractPolicy === 'function') {
        return window.__agreeWiseExtractPolicy();
      }
      return {
        ok: false,
        errorCode: 'EXTRACTION_FAILED',
        error: 'Unable to extract text from this page.',
      };
    },
  });

  return results?.[0]?.result || { ok: false, error: 'Extraction failed.' };
}

async function runAnalysis(categoryOverride) {
  clearError();
  if (!activeTab?.id) {
    showError('No active browser tab found.');
    return;
  }

  if (isRestrictedUrl(activeTab.url)) {
    showError(
      'AgreeWise cannot analyze internal browser pages or Chrome Web Store pages. Navigate to a website and try again.'
    );
    return;
  }

  // Open Chrome Side Panel immediately inside user gesture
  if (chrome.sidePanel?.open) {
    chrome.sidePanel.open({ tabId: activeTab.id }).catch(() => {});
  }

  analyzeBtn.disabled = true;
  privacyBtn.disabled = true;
  termsBtn.disabled = true;
  statusEl.textContent = 'Extracting page text...';

  try {
    const extracted = await extractFromTab(activeTab.id);
    if (!extracted?.ok) {
      const msg = extracted?.error || 'Unable to extract readable policy text from this page.';
      showError(msg);
      await chrome.runtime.sendMessage({
        type: 'SET_TAB_ERROR',
        tabId: activeTab.id,
        sourceUrl: activeTab.url || '',
        error: msg,
      });
      statusEl.textContent = 'Extraction issue';
      return;
    }

    const chosenCategory = categoryOverride || 'Terms & Conditions';
    statusEl.textContent = 'Analyzing in Side Panel...';

    // Kick off analysis in background service worker so it persists cleanly
    chrome.runtime.sendMessage({
      type: 'START_TAB_ANALYSIS',
      payload: {
        tabId: activeTab.id,
        documentName: extracted.documentName,
        category: chosenCategory,
        sourceUrl: extracted.sourceUrl,
        documentText: extracted.documentText,
        truncated: extracted.truncated,
      },
    });

    setTimeout(() => window.close(), 280);
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : 'Unable to access this page. Try reloading the tab or pasting text into the AgreeWise Dashboard.';
    showError(msg);
    statusEl.textContent = 'Error';
  } finally {
    analyzeBtn.disabled = false;
    privacyBtn.disabled = false;
    termsBtn.disabled = false;
  }
}

async function openDashboard() {
  const serverUrl = await getConfiguredServerUrl();
  await chrome.tabs.create({ url: serverUrl });
  window.close();
}

async function initPopup() {
  const serverUrl = await getConfiguredServerUrl();
  serverUrlInput.value = serverUrl;

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTab = tabs[0] || null;

  if (!activeTab?.url) {
    domainEl.textContent = 'Unavailable';
    statusEl.textContent = 'Unsupported tab';
    analyzeBtn.disabled = true;
    privacyBtn.disabled = true;
    termsBtn.disabled = true;
    return;
  }

  try {
    const parsed = new URL(activeTab.url);
    domainEl.textContent = parsed.hostname || activeTab.url;
  } catch {
    domainEl.textContent = activeTab.url;
  }

  if (isRestrictedUrl(activeTab.url)) {
    statusEl.textContent = 'Restricted page';
    showError(
      'Browser system pages cannot be analyzed. Open any website or click Open AgreeWise Dashboard to upload a PDF.'
    );
    analyzeBtn.disabled = true;
    privacyBtn.disabled = true;
    termsBtn.disabled = true;
    return;
  }

  // Ask content script passively if a policy was detected
  try {
    const ping = await chrome.tabs.sendMessage(activeTab.id, { type: 'PING_AGREEWISE' });
    if (ping?.detected) {
      statusEl.textContent = `${ping.category} detected`;
    } else {
      statusEl.textContent = 'Ready to scan';
    }
  } catch {
    statusEl.textContent = 'Ready to scan';
  }
}

analyzeBtn.addEventListener('click', () => runAnalysis());
privacyBtn.addEventListener('click', () => runAnalysis('Privacy Policy'));
termsBtn.addEventListener('click', () => runAnalysis('Terms & Conditions'));
openDashboardBtn.addEventListener('click', openDashboard);
openDashboardTopBtn.addEventListener('click', openDashboard);

toggleSettingsBtn.addEventListener('click', () => {
  const isHidden = settingsPanel.classList.toggle('hidden');
  settingsChevron.textContent = isHidden ? 'Show' : 'Hide';
});

saveServerUrlBtn.addEventListener('click', async () => {
  const raw = serverUrlInput.value.trim().replace(/\/+$/, '');
  if (!raw || (!raw.startsWith('http://') && !raw.startsWith('https://'))) {
    saveFeedback.style.color = '#b91c1c';
    saveFeedback.textContent = 'Enter a valid http:// or https:// URL.';
    return;
  }
  await chrome.storage.local.set({ agreewiseServerUrl: raw });
  saveFeedback.style.color = '#15803d';
  saveFeedback.textContent = 'Saved backend URL.';
  setTimeout(() => {
    saveFeedback.textContent = '';
  }, 2000);
});

initPopup();
