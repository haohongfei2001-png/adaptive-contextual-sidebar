(function (root) {
  "use strict";

  const core = root.ACSCore;
  const PROTECTED = [
    '[data-testid="create-new-chat-button"]',
    '[data-testid="accounts-profile-button"]',
    '[data-testid="sidebar-item-recall"]',
    'a[href^="/search"]',
    'a[href*="/project/"]',
    'a[href^="/g/"]'
  ].join(",");

  function candidateRecord(node) {
    return {
      node,
      chatCount: node.querySelectorAll('a[href^="/c/"]').length,
      projectCount: node.querySelectorAll('a[href*="/project/"],a[href^="/g/"]').length,
      protectedCount: node.querySelectorAll(PROTECTED).length,
      inNavigation: Boolean(node.closest("nav,aside,[role=navigation]")),
      depth: depth(node)
    };
  }

  function depth(node) {
    let n = node;
    let d = 0;
    while (n && n.parentElement) { d += 1; n = n.parentElement; }
    return d;
  }

  function locateOrdinaryList(doc) {
    const lists = [...doc.querySelectorAll("ul")]
      .filter((ul) => ul.querySelectorAll('a[href^="/c/"]').length >= 2)
      .map(candidateRecord);
    const chosen = core.chooseOrdinaryCandidate(lists);
    return chosen ? chosen.node : null;
  }

  function collectRefs(list, limit = 4) {
    const seen = new Set();
    const refs = [];
    for (const a of list.querySelectorAll('a[href^="/c/"]')) {
      const href = a.getAttribute("href");
      if (!href || seen.has(href)) continue;
      seen.add(href);
      refs.push({
        href,
        title: ((a.getAttribute("aria-label") || a.textContent || "Chat").trim().slice(0, 120) || "Chat")
      });
      if (refs.length >= limit) break;
    }
    return refs;
  }

  function isStillSafe(list) {
    if (!list || !list.isConnected) return false;
    const r = candidateRecord(list);
    return Boolean(core.chooseOrdinaryCandidate([r]));
  }

  root.ACSSurfaceAdapter = { locateOrdinaryList, collectRefs, isStillSafe, candidateRecord };
})(globalThis);