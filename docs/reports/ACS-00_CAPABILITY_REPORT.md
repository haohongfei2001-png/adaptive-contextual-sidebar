# ACS-00 Capability Report

**Round:** ACS-00 — Live Capability Spike  
**Test date:** 2026-09-19  
**Outcome:** PRIVATE_SPIKE  
**Environment:** macOS 27.0 (26A428), Google Chrome 153.0.8010.48, authenticated ChatGPT Web, desktop sidebar, Chinese UI.  
**Evidence policy:** Real account identifiers, chat identifiers, chat titles, and conversation bodies are omitted or redacted.

## Executive result

The frozen native-slot hypothesis is technically credible on the tested ChatGPT Web layout. Ordinary-chat history is isolatable from Projects and protected sidebar controls; public conversation routes support durable identity; a reversible projection can occupy the ordinary-history slot; and native browsing can be restored without moving or cloning native React rows.

ACS-00 is not production-capable. The current public rendered surface did not expose a stable, verifiable account/native-workspace identifier suitable for persistent cross-scope cache partitioning. This execution also could not prove the unpacked MV3 prototype inside the already-authenticated Chrome profile without restarting or disrupting the active browser. Therefore extension disable/reload recovery on an authenticated projected page remains unproven.

Per the frozen design and round contract, these limitations force PRIVATE_SPIKE. ACS-01 remains locked.

## Live evidence matrix

| Capability | Result | Dated real-site evidence | Recovery / limitation |
|---|---|---|---|
| C1 Conversation identity | PASS | Ordinary conversations used /c/REDACTED. Project conversations used /g/REDACTED/c/REDACTED. Native sidebar click changed the SPA route and the selected native link matched the new route. Browser Back restored the prior route. A separate Back/Forward probe returned true/true. Three direct-URL tabs resolved successfully. A new Chat began at / and became /c/REDACTED after the first dedicated test message. | Identity is route-derived, never title/list-position derived. Unknown route kinds remain unsupported. |
| C2 Scope isolation | LIMITED | accounts-profile-button exists, but its public attributes are UI/test state only. No userId, accountId, workspaceId, organizationId, orgId, or equivalent stable public identifier was found on the tested rendered surface. | Persistent cross-document/cross-account projection must stay disabled. Single-account/private ephemeral testing only. |
| C3 Route/content ownership barrier | LIMITED | SPA navigation demonstrated a route change with one matching selected sidebar link after navigation; the prototype uses per-tab route epochs and rejects stale route messages. | ACS-00 deliberately does not extract user messages. URL/content ownership was not proven strongly enough to enable extraction. |
| C4 Ordinary conversation-list ownership | PASS | On the tested ordinary layout there was exactly one UL with at least two /c/ links; 28 ordinary links were observed in the live probe. The candidate contained zero Project links. Project surfaces remained outside that UL, including on /g/... routes. | Adapter rejects candidates containing protected controls or Project links and fails open to native UI. |
| C5 Reversible projection | LIMITED | A live-page probe inserted a three-link ACS test projection immediately before the ordinary-history UL, hid only that UL, did not move or clone native rows, and observed zero Project links inside the hidden slot. | DOM capability is proven live. Authenticated execution of the actual unpacked MV3 content script was not proven in this run. |
| C6 Others/native restore | LIMITED | Live Others probe restored the original UL display value, removed the ACS probe, and cleared the temporary hidden marker. Native browsing then successfully changed anchor routes. | Actual MV3 re-entry after Others remains covered by prototype logic/tests rather than an authenticated loaded-extension smoke. |
| C7 Multi-tab isolation | LIMITED | Three simultaneous direct ChatGPT tabs loaded independently. Unit state-machine tests keep separate per-tab epochs and reject stale events from another epoch. | Authenticated three-tab projection with the loaded extension was not executed. |
| C8 Fail-open recovery | LIMITED | Protected-surface mismatch returns no candidate; route mismatch/stale epoch paths restore or preserve native mode; service-worker restart handshake is unit-tested; live Others restores native DOM. | DOM rebuild plus extension disable/reload on an authenticated projected page were not fully executed. |

## Route and navigation observations

- Ordinary conversation route: /c/REDACTED.
- Project landing route begins with /g/; Project conversation links were observed as /g/REDACTED/c/REDACTED.
- Expanding Projects did not mix Project links into the ordinary /c/ history UL.
- Native Search opened a dialog containing public conversation links. Clicking a result produced a real SPA transition, including a transition into a Project conversation.
- New Chat had no durable conversation ID at /. After sending one dedicated ACS-00 test message, the URL became /c/REDACTED and one native sidebar link matched that route.
- Direct URL navigation to three previously observed ordinary-chat URLs succeeded in three simultaneous tabs.
- Browser Back and Forward both restored the expected direct URLs.

## Scope evidence

The tested profile control exposed attributes such as data-testid, aria-label, aria-haspopup, aria-expanded, role/type/id, and presentation state. A page-wide scan found no public stable user/account/workspace/organization identifier suitable for a durable scope key.

A display label is not accepted as an account key because it may be non-unique, mutable, localized, or privacy-sensitive. ACS therefore must not persist or project cached titles/links across documents/accounts based on the current evidence.

## Minimal prototype

ACS-00 adds only:

- MV3 manifest with ChatGPT-only host permission and webNavigation;
- pure route/candidate/tab-state core;
- conservative ChatGPTSurfaceAdapter;
- reversible hard-coded projection and Others;
- per-tab route epochs and stale-event rejection;
- MV3 service-worker registration/reconnect handshake;
- fail-open restoration paths;
- unit and permission tests.

It does not add AI/model calls, behavior learning, relation scoring, manual include/exclude product UX, PAIA integration, Workspace/folder/tag semantics, cloud sync, full-history scanning, or a Side Panel/dashboard.

## Required checks

| Check | Result | Evidence |
|---|---|---|
| Manifest JSON / MV3 static validation | PASS | Parsed by tests; manifest_version = 3. |
| JavaScript syntax checks | PASS | node --check on all runtime files. |
| Adapter / fixture logic | PASS | Safe ordinary candidate selected; Project/protected candidates rejected. |
| Navigation state machine | PASS | Route epochs, stale rejection, ordinary and Project route parsing tested. |
| Multi-tab isolation tests | PASS | Three independent tab states; one tab update does not mutate the others. |
| Service-worker restart handshake | PASS (unit) | Fresh worker registry epoch can be reconciled on the same current route without repainting. |
| Protected-surface assertions | PASS | Static test plus live Project/ordinary separation evidence. |
| Fail-open / recovery | PARTIAL | Candidate failure, route mismatch and Others restore proven; authenticated extension disable/reload not proven. |
| Privacy / permissions | PASS | No cookies, history, debugger, webRequest, scripting, or nativeMessaging. Host access is only https://chatgpt.com/*. |
| Dated live smoke matrix | PASS with limitations | Evidence above from 2026-09-19, Chrome 153.0.8010.48. |
| Authenticated unpacked-extension smoke | NOT PROVEN | Active authenticated Chrome was not restarted merely to inject the unpacked spike. |

Final npm run check result: 7 tests passed, 0 failed.

## Branded Chrome load attempt

A separate temporary Chrome instance was launched with an isolated user-data directory and a load-extension argument. The DevTools target list did not expose the ACS worker path src/service-worker.js; the visible worker belonged to another extension. A clean retry also logged that disable-extensions-except is not allowed in branded Google Chrome. No unrelated worker target is counted as ACS evidence.

This is a test-harness limitation, not evidence that normal developer-mode Load unpacked cannot work. It still means this round did not prove the authenticated loaded-extension path.

## Blocking limitations before ACS-01

1. Stable scope key absent on the tested public surface. Cross-account/native-workspace persistent cache reuse cannot be enabled safely.
2. Authenticated loaded-extension recovery is incomplete. The real MV3 content script must still be exercised through projection, Others, DOM rebuild, worker restart, extension reload/disable, and three-tab isolation in an authenticated developer-mode load.
3. Content ownership remains intentionally conservative. User-message extraction stays disabled until route-to-render ownership is independently proven across SPA transitions.

These limitations must not be bypassed by private APIs, cookie interception, hidden React state, broader permissions, or a Side Panel substitute.

## Final decision

**ACS-00 = PRIVATE_SPIKE.**

The core native-slot product hypothesis survives the capability spike, but the frozen production safety gates do not all pass. ACS-01 remains LOCKED and must not begin from this execution.