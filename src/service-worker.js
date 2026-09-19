importScripts("core.js");

const registry = ACSCore.createTabRegistry();

function isChatGPT(url) {
  try { return new URL(url).origin === "https://chatgpt.com"; } catch { return false; }
}

async function publish(tabId, url, reason) {
  if (!isChatGPT(url)) return;
  const route = new URL(url).pathname;
  const state = registry.update(tabId, route);
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: "ACS_NAVIGATION",
      route,
      epoch: state.epoch,
      reason
    });
  } catch (_) {
    // Content script may not be ready. It will register itself.
  }
}

chrome.webNavigation.onCommitted.addListener((d) => {
  if (d.frameId === 0) publish(d.tabId, d.url, "committed");
}, { url: [{ hostEquals: "chatgpt.com" }] });

chrome.webNavigation.onHistoryStateUpdated.addListener((d) => {
  if (d.frameId === 0) publish(d.tabId, d.url, "history-state");
}, { url: [{ hostEquals: "chatgpt.com" }] });

chrome.tabs.onRemoved.addListener((tabId) => registry.remove(tabId));

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "ACS_REGISTER" || !sender.tab?.id) return;
  const route = String(msg.route || "/");
  const state = registry.register(sender.tab.id, route);
  sendResponse({ tabId: sender.tab.id, route: state.route, epoch: state.epoch });
  return true;
});