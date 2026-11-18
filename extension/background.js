const DEFAULT_SERVER_URL = 'https://ais-dev-pr4pjugatqdqkmf5cymjvd-1000238381404.asia-southeast1.run.app';
const MAX_REQUEST_CHARS = 140000;

async function getServerUrl() {
  try {
    const data = await chrome.storage.local.get(['agreewiseServerUrl']);
    const configured = (data.agreewiseServerUrl || '').trim().replace(/\/+$/, '');
    return configured || DEFAULT_SERVER_URL;
  } catch {
    return DEFAULT_SERVER_URL;
  }
}

async function setTabState(tabId, state) {
  const key = `tabAnalysis_${tabId}`;
  await chrome.storage.session.set({ [key]: state });
  chrome.runtime.sendMessage({ type: 'TAB_STATE_UPDATED', tabId, state }).catch(() => {
    // Side panel may not be open yet
  });
}

async function getTabState(tabId) {
  const key = `tabAnalysis_${tabId}`;
  const data = await chrome.storage.session.get([key]);
  return data[key] || null;
}

async function postJson(url, body) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      `Could not reach the AgreeWise server at ${new URL(url).origin}. Verify the server is running and check the Server URL in the popup.`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Received an invalid response (HTTP ${response.status}) from AgreeWise server.`);
  }

  if (!response.ok) {
    throw new Error(data?.error || `AgreeWise server returned error HTTP ${response.status}.`);
  }

  return data;
}

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(`tabAnalysis_${tabId}`).catch(() => {});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message?.type === 'POLICY_DETECTED') {
        const tabId = sender.tab?.id;
        if (tabId !== undefined) {
          await chrome.action.setBadgeText({ tabId, text: '!' });
          await chrome.action.setBadgeBackgroundColor({ tabId, color: '#4f46e5' });
        }
        sendResponse({ ok: true });
        return;
      }

      if (message?.type === 'IS_URL_DISMISSED') {
        const data = await chrome.storage.session.get(['dismissedUrls']);
        const dismissedMap = data.dismissedUrls || {};
        sendResponse({ dismissed: Boolean(dismissedMap[message.url]) });
        return;
      }

      if (message?.type === 'DISMISS_URL') {
        const data = await chrome.storage.session.get(['dismissedUrls']);
        const dismissedMap = data.dismissedUrls || {};
        dismissedMap[message.url] = true;
        await chrome.storage.session.set({ dismissedUrls: dismissedMap });
        sendResponse({ ok: true });
        return;
      }

      if (message?.type === 'GET_TAB_STATE') {
        const state = await getTabState(message.tabId);
        sendResponse({ ok: true, state });
        return;
      }

      if (message?.type === 'SET_TAB_ERROR') {
        await setTabState(message.tabId, {
          status: 'error',
          error: message.error || 'Unable to read this page.',
          sourceUrl: message.sourceUrl || '',
          updatedAt: Date.now(),
        });
        sendResponse({ ok: true });
        return;
      }

      if (message?.type === 'START_TAB_ANALYSIS') {
        const { tabId, documentName, category, sourceUrl, documentText, truncated } = message.payload;
        if (!documentText || documentText.trim().length < 40) {
          await setTabState(tabId, {
            status: 'error',
            error: 'Not enough readable text was found on this page to analyze.',
            sourceUrl,
            updatedAt: Date.now(),
          });
          sendResponse({ ok: false, error: 'Insufficient text.' });
          return;
        }

        const safeText = documentText.slice(0, MAX_REQUEST_CHARS);
        await setTabState(tabId, {
          status: 'loading',
          documentName,
          category,
          sourceUrl,
          documentText: safeText,
          truncated: Boolean(truncated),
          updatedAt: Date.now(),
        });

        const serverUrl = await getServerUrl();
        try {
          const analysis = await postJson(`${serverUrl}/api/analyze`, {
            documentText: safeText,
            documentName,
            category,
          });

          await setTabState(tabId, {
            status: 'ready',
            documentName,
            category,
            sourceUrl,
            documentText: safeText,
            truncated: Boolean(truncated),
            analysis,
            updatedAt: Date.now(),
          });

          await chrome.action.setBadgeText({ tabId, text: '' }).catch(() => {});
          sendResponse({ ok: true, analysis });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Analysis failed.';
          await setTabState(tabId, {
            status: 'error',
            documentName,
            category,
            sourceUrl,
            documentText: safeText,
            error: errorMsg,
            updatedAt: Date.now(),
          });
          sendResponse({ ok: false, error: errorMsg });
        }
        return;
      }

      if (message?.type === 'OPEN_ON_WEB_APP') {
        const { documentName, category, documentText, sourceUrl, analysisResult } = message.payload || {};
        const serverUrl = await getServerUrl();

        if (!documentText && !analysisResult) {
          await chrome.tabs.create({ url: serverUrl });
          sendResponse({ ok: true });
          return;
        }

        const handoffResp = await postJson(`${serverUrl}/api/handoff`, {
          documentName,
          category: category || 'Terms & Conditions',
          documentText: (documentText || '').slice(0, MAX_REQUEST_CHARS),
          sourceUrl: sourceUrl || '',
          analysisResult: analysisResult || null,
        });

        const targetUrl = `${serverUrl}/?handoff=${encodeURIComponent(handoffResp.id)}`;
        await chrome.tabs.create({ url: targetUrl });
        sendResponse({ ok: true, url: targetUrl });
        return;
      }

      if (message?.type === 'ASK_AI_QUESTION') {
        const { documentText, documentName, analysisSummary, messages } = message.payload;
        const serverUrl = await getServerUrl();
        const chatResp = await postJson(`${serverUrl}/api/chat`, {
          documentText: (documentText || '').slice(0, MAX_REQUEST_CHARS),
          documentName,
          analysisSummary,
          messages,
        });
        sendResponse({ ok: true, reply: chatResp.reply });
        return;
      }

      sendResponse({ ok: false, error: 'Unsupported action.' });
    } catch (err) {
      sendResponse({
        ok: false,
        error: err instanceof Error ? err.message : 'Unexpected extension background error.',
      });
    }
  })();

  return true;
});
