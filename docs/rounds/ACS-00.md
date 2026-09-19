# ACS-00 — Live Capability Spike

**Round:** ACS-00  
**Status source:** `status/ACS_STATUS.yaml`  
**Nature:** capability spike only  
**Product implementation:** not authorized by this round

## Objective

Determine whether the core Adaptive Contextual Sidebar experience is technically credible on the current real ChatGPT Web surface using only public browser/page evidence and a reversible Chrome MV3 extension architecture.

ACS-00 answers whether the foundation exists. It does not build the recommendation product.

## Required capabilities

### C1 — Conversation identity

Demonstrate reliable identification/lifecycle handling for the supported real-site flows:

- normal ordinary-chat navigation;
- ChatGPT Search result navigation;
- direct URL navigation;
- browser Back/Forward;
- SPA history-state transitions;
- Project conversation routes;
- non-Project conversation routes;
- new Chat transient → durable identity transition;
- multiple simultaneous ChatGPT tabs.

Permanent identity must not be inferred from title, list position, or content similarity.

### C2 — Scope isolation

Determine whether the rendered/public surface provides enough evidence to prevent cached titles, links, or evidence from one account/native scope being projected into another.

If production-grade scope cannot be verified, the outcome must be `LIMITED` or `PRIVATE_SPIKE`; do not disguise a controlled single-account assumption as normal support.

### C3 — Route/content ownership barrier

Prove how ACS avoids assigning old rendered content to a newly changed URL during SPA navigation.

If reliable route-to-content ownership cannot be demonstrated, navigation capability may remain testable but user-message extraction must remain disabled.

### C4 — Ordinary conversation-list ownership

Locate a safely isolatable ordinary conversation-list slot while protecting:

- Projects and Project tree;
- Search;
- New Chat;
- account/settings;
- native menus and non-ordinary sidebar surfaces.

Unknown ownership fails closed to native UI.

### C5 — Reversible projection

Using a minimal hard-coded test projection only, prove that ACS can present a small list in the ordinary-chat slot without deleting, moving, or rewriting ChatGPT data.

Do not clone React nodes, move native rows, or depend on private handlers.

### C6 — Others/native restore

Prove:

context projection → `Others` → native conversation browsing

and, after the user successfully opens another native Chat, that ACS can recognize the new anchor and re-enter the test projection.

`Others` is a native browsing mode, not “complete history minus current set.”

### C7 — Multi-tab isolation

Test at least three ChatGPT tabs.

Each tab must maintain independent anchor/projection state. Stale async or navigation events from another tab/epoch must not repaint the active view incorrectly.

### C8 — Fail-open recovery

Actively test recovery for:

- selector mismatch;
- DOM rebuild;
- service-worker restart;
- content-script reconnect;
- projection mount failure;
- route transition;
- extension reload/disable where testable;
- Project-protection failure.

When uncertain, restore native ChatGPT UI.

## Allowed implementation

Only the minimum necessary for capability proof:

- MV3 manifest;
- narrow content script;
- service-worker/navigation diagnostics;
- replaceable `ChatGPTSurfaceAdapter`;
- temporary per-tab diagnostic state;
- sanitized fixtures;
- hard-coded reversible projection;
- capability report/tests.

## Explicitly forbidden

Do not implement:

- GPT/OpenAI API routing;
- Native Messaging semantic helper;
- behavior learning;
- relation scoring graph;
- decay/hysteresis product policy;
- formal production WorkingSetCache algorithm;
- manual include/exclude product UX;
- PAIA integration;
- Workspace/folders/tags;
- cloud sync;
- full-history scanning/classification;
- Side Panel or Dashboard as the product substitute.

## Evidence deliverable

Create `docs/reports/ACS-00_CAPABILITY_REPORT.md`.

It must identify for every capability:

- environment and test date;
- evidence source;
- supported route/layout;
- PASS / LIMITED / FAIL;
- recovery behavior;
- known unsupported conditions.

Do not commit real chat bodies, auth information, account identifiers, or sensitive titles.

If DOM fixtures are committed, sanitize them to the smallest structure needed for regression tests.

## Required checks

At closure, report:

- manifest/extension validation;
- lint/type checks if tooling exists;
- adapter unit/fixture tests;
- navigation state-machine tests;
- multi-tab isolation tests;
- protected-surface assertions;
- fail-open/recovery tests;
- privacy/permission assertions;
- dated real-site smoke matrix.

Static fixtures alone cannot produce a PASS for live capabilities.

## Outcome rules

### PASS

All core capabilities needed for the frozen native-slot experience are supported with real evidence and safe recovery.

### LIMITED / PRIVATE_SPIKE

A useful private/controlled prototype works, but material scope, route, Project, multi-tab, or recovery limitations remain.

Do not advance to ACS-01 until the limitation is explicitly resolved or the frozen design is amended.

### NO_GO

Stop this architecture if the core product would require any of:

- undocumented/private ChatGPT APIs;
- unreliable conversation identity;
- unsafe/unverifiable cross-scope cache reuse;
- inability to protect Projects/native surfaces;
- inability to restore native sidebar safely;
- rewriting the entire sidebar;
- replacing the frozen experience with a separate Side Panel.

## Closure

When ACS-00 reaches a terminal outcome:

1. commit the capability report, prototype, and tests;
2. update `status/ACS_STATUS.yaml`;
3. run required checks;
4. push remote `main`;
5. re-fetch remote HEAD and canonical status;
6. stop.

Do not begin ACS-01 in the same execution.
