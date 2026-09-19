# ACS-00 — Three-Blocker Closure Investigation

**Date:** 2026-09-19  
**Scope:** Only the three blockers recorded by the first ACS-00 closure.  
**Source of truth:** GitHub remote main.  
**Result:** No blocker can honestly be marked fully resolved. ACS-00 remains PRIVATE_SPIKE and ACS-01 remains LOCKED.

## Executive disposition

| Blocker | Disposition | Meaning |
|---|---|---|
| B1 — stable public scope key | CONFIRMED_UNRESOLVED | This is a real production-safety blocker, not a missing unit test. |
| B2 — authenticated unpacked MV3 recovery | TEST_ENVIRONMENT_BLOCKED | The prototype was not proven through the required authenticated developer-mode lifecycle. |
| B3 — route-to-render content ownership | SAFE_FAIL_CLOSED_UNVERIFIED | Navigation remains usable, but body/user-message extraction must remain disabled. |

No frozen product boundary was changed. No private ChatGPT API, cookie/auth interception, hidden React state, broader permission, AI, behavior learning, PAIA integration, or ACS-01 implementation was introduced.

## B1 — Stable public account/native-workspace scope key

### New investigation

OpenAI's current public documentation explicitly supports account switching on ChatGPT Web: two accounts may remain signed in in one browser session, and chats, memory, files, settings, billing, and workspaces remain separate. Workspace switching is likewise an explicit account/workspace boundary.

Relevant public documentation checked during this investigation:

- https://help.openai.com/en/articles/20001068
- https://help.openai.com/en/articles/8542216
- https://help.openai.com/en/articles/8265430-what-is-a-chatgpt-enterprise-workspace-how-can-i-switch-workspaces

This makes the following candidates invalid as a production ScopeKey by construction:

- browser session id;
- Chrome profile id alone;
- ACS installation id;
- tab/document id;
- display name or avatar alone.

The first ACS-00 live DOM probe already found the rendered profile control but no stable public user/account/workspace/org identifier. This closure investigation did not obtain new reliable rendered evidence that would overturn that result.

### Considered alternatives

A recent-chat witness/fingerprint could be useful as a conservative *same-scope witness*, but it was not live-tested across account/workspace switching and cannot be promoted to VERIFIED in ACS-00. It may produce safe false negatives, but cross-scope false-positive risk has not been bounded with real evidence.

Hashing a displayed email/workspace label was also considered, but this execution did not verify that such a value is consistently rendered, stable across supported scopes, and sufficient to distinguish account plus native workspace. The frozen design specifically forbids treating mutable display labels as a reliable primary key.

### Disposition

**CONFIRMED_UNRESOLVED.**

Persistent cross-document/cross-account projection remains unsafe unless a future live capability probe establishes a sufficiently unique public scope witness or the frozen design is explicitly amended. Unknown scope must fail open to native UI.

## B2 — Authenticated unpacked MV3 execution and recovery

### New investigation

The investigation attempted to use the normal Chrome developer-mode path on the user's authenticated Chrome session without restarting the active browser or copying authentication data.

Observed constraints:

1. macOS rejected coordinate-based UI automation with error -25211: osascript is not allowed assistive access.
2. Chrome continued to reject Apple Events JavaScript with its explicit disabled error, so page-script automation could not substitute for developer-mode loading.
3. The earlier isolated branded-Chrome command-line attempt did not expose the ACS service-worker path and is still excluded as evidence.
4. Chrome's current official DevTools-for-agents documentation describes extension lifecycle tools for installing/reloading unpacked extensions:
   https://developer.chrome.com/docs/devtools/agents/extensions
5. The currently available ChatGPT plugin directory was searched for a Chrome DevTools / extension-lifecycle connector; no relevant connector was available.

No attempt was made to change macOS Privacy & Security settings, copy cookies, intercept authentication, or restart the user's working Chrome merely to manufacture a PASS.

### What remains required

A real authenticated developer-mode smoke must still exercise:

- load the exact remote-main unpacked ACS-00 prototype;
- projection -> Others -> native restore;
- three-tab isolation;
- DOM rebuild fail-open;
- service-worker termination/reconnect;
- extension reload;
- extension disable while projected;
- refresh/re-enable recovery;
- Project-protection failure.

### Disposition

**TEST_ENVIRONMENT_BLOCKED.**

This is not evidence that MV3 cannot support the lifecycle. It is evidence that this execution did not prove it on the authenticated supported environment. One real developer-mode test (manual or via a properly connected Chrome DevTools agent) is still necessary.

## B3 — Route-to-render content ownership barrier

### Investigation correction

One apparent mismatch was observed while reopening ChatGPT: AppleScript reported a root route while a screenshot contained an older monitor-related conversation. Further investigation showed that Chrome had multiple windows and Split View / pane state; AppleScript's active-tab target and the visible pane were not the same surface. The apparent mismatch was therefore an instrumentation artifact and is **not** counted as ChatGPT route/content evidence.

This correction is important: ACS-00 must not convert ambiguous automation behavior into a live capability claim.

### Remote-main safety check

The current remote-main runtime was scanned for content-extraction selectors. None of the following exist in the ACS-00 runtime:

- data-message-author-role
- message-author
- prompt-textarea
- conversation-turn
- article
- user-message

The adapter reads only ordinary sidebar links/titles for the hard-coded projection. It does not read conversation bodies or user-message content.

A local sandbox mirror also reran the existing ACS-00 check suite: 7 passed, 0 failed. The local clone is not treated as source of truth; this result is secondary to the remote-main source scan.

### Disposition

**SAFE_FAIL_CLOSED_UNVERIFIED.**

The current prototype correctly avoids the unsafe operation, but a reliable route-to-render ownership proof still has not been demonstrated on the real site. Per the frozen design, user-message extraction remains disabled. Navigation/projection evidence is not allowed to stand in for content-ownership evidence.

## Closure conclusion

The investigation does not justify changing ACS-00 to COMPLETE, PASS, or LIMITED-as-advanceable.

- B1 remains a platform/scope safety blocker.
- B2 remains an authenticated lifecycle evidence gap caused by the available test environment.
- B3 remains an intentionally disabled capability with safe fail-closed behavior.

Therefore:

**ACS-00 = PRIVATE_SPIKE**  
**ACS-01 = LOCKED**

The next legitimate ways forward are narrowly defined:

1. obtain real public-surface scope evidence, or explicitly amend the frozen scope requirement;
2. perform the authenticated unpacked-extension lifecycle smoke through Developer Mode or an authorized Chrome DevTools agent;
3. separately prove a route-to-render content ownership barrier before enabling any body/user-message extraction.

No later round was started in this investigation.
