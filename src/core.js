(function (root) {
  "use strict";

  function parseRoute(pathname) {
    const parts = String(pathname || "/").split("/").filter(Boolean);
    if (parts.length === 0) return { kind: "transient-new-chat", conversationId: null, projectHint: "unknown" };
    if (parts[0] === "c" && parts[1]) {
      return { kind: "ordinary-conversation", conversationId: parts[1], projectHint: "unknown" };
    }
    const cIndex = parts.indexOf("c");
    if (cIndex >= 0 && parts[cIndex + 1]) {
      const prefix = parts.slice(0, cIndex).join("/");
      const projectish = parts.includes("project") || parts[0] === "g";
      return {
        kind: projectish ? "project-conversation" : "scoped-conversation",
        conversationId: parts[cIndex + 1],
        projectHint: projectish ? "project" : "unknown",
        routePrefix: prefix
      };
    }
    return { kind: "unsupported", conversationId: null, projectHint: "unknown" };
  }

  function chooseOrdinaryCandidate(records) {
    const safe = (records || []).filter((r) =>
      r && r.chatCount >= 2 && r.projectCount === 0 && r.protectedCount === 0 && r.inNavigation === true
    );
    safe.sort((a, b) => b.chatCount - a.chatCount || a.depth - b.depth);
    return safe[0] || null;
  }

  function createTabRegistry() {
    const tabs = new Map();
    return {
      update(tabId, route) {
        const prior = tabs.get(tabId) || { epoch: 0, route: null };
        if (prior.route === route) return prior;
        const next = { epoch: prior.epoch + 1, route };
        tabs.set(tabId, next);
        return next;
      },
      register(tabId, route) {
        const prior = tabs.get(tabId);
        if (prior && prior.route === route) return prior;
        return this.update(tabId, route);
      },
      get(tabId) {
        return tabs.get(tabId) || null;
      },
      accept(tabId, epoch, route) {
        const current = tabs.get(tabId);
        return Boolean(current && current.epoch === epoch && current.route === route);
      },
      remove(tabId) {
        tabs.delete(tabId);
      }
    };
  }

  function reconcileRegistration(currentPath, reply) {
    if (!reply || reply.route !== currentPath || !Number.isInteger(reply.epoch)) {
      return { safe: false, epoch: null };
    }
    return { safe: true, epoch: reply.epoch };
  }

  function redactPath(pathname) {
    return String(pathname || "/")
      .replace(/\/c\/[^/?#]+/g, "/c/REDACTED")
      .replace(/\/project\/[^/?#]+/g, "/project/REDACTED")
      .replace(/\/g\/[^/?#]+/g, "/g/REDACTED");
  }

  root.ACSCore = { parseRoute, chooseOrdinaryCandidate, createTabRegistry, reconcileRegistration, redactPath };
})(globalThis);