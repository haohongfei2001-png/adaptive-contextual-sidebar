(function () {
  "use strict";

  const adapter = globalThis.ACSSurfaceAdapter;
  const core = globalThis.ACSCore;
  const state = {
    tabId: null,
    epoch: 0,
    route: location.pathname,
    mode: "native",
    nativeList: null,
    projection: null,
    priorDisplay: "",
    mountToken: 0
  };

  function log(event, detail = {}) {
    console.debug("[ACS-00]", event, { route: core.redactPath(state.route), epoch: state.epoch, ...detail });
  }

  function restoreNative(reason) {
    if (state.nativeList?.isConnected) {
      state.nativeList.style.display = state.priorDisplay;
      state.nativeList.removeAttribute("data-acs-native-hidden");
    }
    if (state.projection?.isConnected) state.projection.remove();
    state.nativeList = null;
    state.projection = null;
    state.mode = "native";
    log("native-restored", { reason });
  }

  function buildProjection(refs) {
    const section = document.createElement("section");
    section.setAttribute("data-acs-spike-projection", "true");
    section.style.cssText = "padding:4px 8px 8px;display:grid;gap:2px;";
    const label = document.createElement("div");
    label.textContent = "ACS-00 test projection";
    label.style.cssText = "font-size:11px;opacity:.65;padding:4px 8px;";
    section.append(label);
    for (const ref of refs) {
      const a = document.createElement("a");
      a.href = ref.href;
      a.textContent = ref.title;
      a.style.cssText = "display:block;padding:8px;border-radius:8px;text-decoration:none;color:inherit;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
      section.append(a);
    }
    const others = document.createElement("button");
    others.type = "button";
    others.textContent = "Others";
    others.setAttribute("data-acs-others", "true");
    others.style.cssText = "margin-top:4px;padding:8px;text-align:left;";
    others.addEventListener("click", () => restoreNative("others"));
    section.append(others);
    return section;
  }

  function tryProject(reason) {
    const token = ++state.mountToken;
    restoreNative("pre-mount");
    const route = core.parseRoute(location.pathname);
    if (!route.conversationId) return log("skip-projection", { reason: "non-durable-route" });
    const list = adapter.locateOrdinaryList(document);
    if (!list || !adapter.isStillSafe(list)) return log("fail-open", { reason: "no-safe-list" });
    const refs = adapter.collectRefs(list, 4);
    if (refs.length < 2) return log("fail-open", { reason: "insufficient-refs" });
    if (token !== state.mountToken) return;
    state.nativeList = list;
    state.priorDisplay = list.style.display;
    const projection = buildProjection(refs);
    list.parentElement.insertBefore(projection, list);
    list.setAttribute("data-acs-native-hidden", "true");
    list.style.display = "none";
    state.projection = projection;
    state.mode = "projection";
    log("projection-mounted", { reason, refs: refs.length });
  }

  function onRoute(route, epoch, reason) {
    if (route !== location.pathname) return restoreNative("route-message-mismatch");
    if (epoch < state.epoch) return log("stale-navigation-ignored", { incomingEpoch: epoch });
    state.route = route;
    state.epoch = epoch;
    restoreNative("route-transition");
    const captured = epoch;
    setTimeout(() => {
      if (captured !== state.epoch || route !== location.pathname) return;
      tryProject(reason);
    }, 250);
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "ACS_NAVIGATION") onRoute(msg.route, msg.epoch, msg.reason);
  });

  const observer = new MutationObserver(() => {
    if (state.mode !== "projection") return;
    if (!adapter.isStillSafe(state.nativeList) || !state.projection?.isConnected) {
      restoreNative("dom-rebuild-or-protection-change");
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  addEventListener("pagehide", () => restoreNative("pagehide"), { once: true });
  addEventListener("beforeunload", () => restoreNative("beforeunload"), { once: true });

  function registerWithWorker(reason) {
    chrome.runtime.sendMessage({ type: "ACS_REGISTER", route: location.pathname }, (reply) => {
      if (chrome.runtime.lastError || !reply) return restoreNative("registration-failed");
      const reconciled = core.reconcileRegistration(location.pathname, reply);
      if (!reconciled.safe) return restoreNative("registration-route-mismatch");
      state.tabId = reply.tabId;
      if (state.epoch === 0) {
        onRoute(reply.route, reconciled.epoch, reason);
        return;
      }
      // A restarted MV3 worker may reset its in-memory epoch. A same-route
      // registration is an explicit handshake, so adopt the worker epoch
      // without repainting the current safe view.
      state.route = reply.route;
      state.epoch = reconciled.epoch;
      log("worker-registered", { reason });
    });
  }

  registerWithWorker("initial-register");
  setInterval(() => registerWithWorker("reconnect-probe"), 10000);

  globalThis.__ACS00_DIAGNOSTICS__ = {
    snapshot: () => ({
      tabId: state.tabId,
      epoch: state.epoch,
      route: core.redactPath(state.route),
      mode: state.mode,
      projectionMounted: Boolean(state.projection?.isConnected),
      nativeHidden: Boolean(state.nativeList?.getAttribute("data-acs-native-hidden"))
    }),
    restoreNative
  };
})();