(function () {
  "use strict";

  const adapter = globalThis.ACSSurfaceAdapter;
  const core = globalThis.ACSCore;
  const LEASE_TTL_MS = 1800;
  const LEASE_RENEW_MS = 500;
  const WORKER_PROBE_MS = 1000;
  const STARTUP_RETRY_MS = 250;
  const STARTUP_RETRY_LIMIT = 8;
  const state = {
    tabId: null,
    epoch: 0,
    route: location.pathname,
    mode: "native",
    nativeList: null,
    projection: null,
    priorStyleAttr: null,
    mountToken: 0,
    leaseStyle: null,
    leasePhase: 0,
    leaseRenewedAt: 0
  };

  function log(event, detail = {}) {
    console.debug("[ACS-00]", event, { route: core.redactPath(state.route), epoch: state.epoch, ...detail });
  }

  function ensureLeaseStyle() {
    if (state.leaseStyle?.isConnected) return;
    const style = document.createElement("style");
    style.setAttribute("data-acs-lease-style", "true");
    style.textContent = [
      "@keyframes acs00NativeLeaseA{0%,99%{max-height:0;overflow:hidden;opacity:0;visibility:hidden;pointer-events:none}100%{max-height:100000px;overflow:visible;opacity:1;visibility:visible;pointer-events:auto}}",
      "@keyframes acs00NativeLeaseB{0%,99%{max-height:0;overflow:hidden;opacity:0;visibility:hidden;pointer-events:none}100%{max-height:100000px;overflow:visible;opacity:1;visibility:visible;pointer-events:auto}}",
      "@keyframes acs00ProjectionLeaseA{0%,99%{max-height:100000px;opacity:1;visibility:visible;pointer-events:auto}100%{max-height:0;overflow:hidden;opacity:0;visibility:hidden;pointer-events:none;padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0}}",
      "@keyframes acs00ProjectionLeaseB{0%,99%{max-height:100000px;opacity:1;visibility:visible;pointer-events:auto}100%{max-height:0;overflow:hidden;opacity:0;visibility:hidden;pointer-events:none;padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0}}"
    ].join("\n");
    (document.head || document.documentElement).append(style);
    state.leaseStyle = style;
  }

  function applyLeaseAnimation(node, name) {
    node.style.animationName = name;
    node.style.animationDuration = `${LEASE_TTL_MS}ms`;
    node.style.animationTimingFunction = "linear";
    node.style.animationFillMode = "forwards";
    node.style.animationIterationCount = "1";
  }

  function renewConcealLease(reason) {
    if (state.mode !== "projection" || !state.nativeList?.isConnected || !state.projection?.isConnected) return;
    const now = performance.now();
    if (state.leaseRenewedAt && now - state.leaseRenewedAt > LEASE_TTL_MS) {
      restoreNative("conceal-lease-expired");
      return;
    }
    state.leaseRenewedAt = now;
    state.leasePhase ^= 1;
    const suffix = state.leasePhase ? "B" : "A";
    applyLeaseAnimation(state.nativeList, `acs00NativeLease${suffix}`);
    applyLeaseAnimation(state.projection, `acs00ProjectionLease${suffix}`);
    log("conceal-lease-renewed", { reason });
  }

  function restoreNative(reason) {
    if (state.nativeList?.isConnected) {
      if (state.priorStyleAttr === null) state.nativeList.removeAttribute("style");
      else state.nativeList.setAttribute("style", state.priorStyleAttr);
      state.nativeList.removeAttribute("data-acs-native-hidden");
    }
    if (state.projection?.isConnected) state.projection.remove();
    state.leaseStyle?.remove();
    state.nativeList = null;
    state.projection = null;
    state.priorStyleAttr = null;
    state.leaseStyle = null;
    state.leasePhase = 0;
    state.leaseRenewedAt = 0;
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

  function scheduleProjectionRetry(reason, attempt, expectedRoute, expectedEpoch) {
    if (attempt >= STARTUP_RETRY_LIMIT) return;
    setTimeout(() => {
      if (state.mode !== "native") return;
      if (expectedRoute !== location.pathname || expectedEpoch !== state.epoch) return;
      tryProject(reason, attempt + 1, expectedRoute, expectedEpoch);
    }, STARTUP_RETRY_MS);
  }

  function tryProject(reason, attempt = 0, expectedRoute = state.route, expectedEpoch = state.epoch) {
    const token = ++state.mountToken;
    restoreNative("pre-mount");
    if (expectedRoute !== location.pathname || expectedEpoch !== state.epoch) {
      return log("stale-projection-attempt", { reason, attempt });
    }
    const route = core.parseRoute(location.pathname);
    if (!route.conversationId) return log("skip-projection", { reason: "non-durable-route" });
    const list = adapter.locateOrdinaryList(document);
    if (!list || !adapter.isStillSafe(list)) {
      log("fail-open", { reason: "no-safe-list", attempt });
      scheduleProjectionRetry(reason, attempt, expectedRoute, expectedEpoch);
      return;
    }
    const refs = adapter.collectRefs(list, 4);
    if (refs.length < 2) {
      log("fail-open", { reason: "insufficient-refs", attempt });
      scheduleProjectionRetry(reason, attempt, expectedRoute, expectedEpoch);
      return;
    }
    if (token !== state.mountToken) return;
    state.nativeList = list;
    state.priorStyleAttr = list.getAttribute("style");
    const projection = buildProjection(refs);
    list.parentElement.insertBefore(projection, list);
    list.setAttribute("data-acs-native-hidden", "true");
    state.projection = projection;
    state.mode = "projection";
    ensureLeaseStyle();
    renewConcealLease("mount");
    log("projection-mounted", { reason, refs: refs.length, attempt });
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
  setInterval(() => renewConcealLease("heartbeat"), LEASE_RENEW_MS);
  setInterval(() => registerWithWorker("reconnect-probe"), WORKER_PROBE_MS);

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