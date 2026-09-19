# ACS-00 — B2 Recovery Closure Receipt

**Date:** 2026-09-20  
**Round:** ACS-00  
**Scope:** B2 authenticated MV3 recovery only  
**Remote source of truth inspected:** `main@cce8d9620e912b3ca27027dab675bb6d91207777`  
**Disposition:** BLOCKED  
**Later rounds:** ACS-01 and all later rounds remain LOCKED.

## Decision

B2 is **not closed**.

The interrupted recovery execution did obtain real evidence that an unpacked ACS build could run inside the user's already-authenticated Chrome profile: the live ChatGPT page exposed the ACS diagnostic hook, a real projection reached `mode=projection` with the native ordinary-history list concealed, and the live `Others` control restored native browsing with the projection removed.

That is meaningful authenticated developer-mode evidence, but it is not enough to certify the current exact remote HEAD through the required recovery lifecycle.

## Exact-head evidence gap

For the current remote HEAD `cce8d9620e912b3ca27027dab675bb6d91207777`:

- a Chrome `Load unpacked` action was initiated on the authenticated developer-mode profile;
- the expected extension item could be observed disabled and then re-enabled (`false -> true`);
- the exact-head reload probe did **not** find a usable reload control for the expected extension item (`ACS RELOAD CCE8 false`);
- no sanitized post-disable/post-enable snapshot proved that the exact-head content script/service worker recovered and re-entered the projection;
- a final attempt to read the post-refresh ChatGPT DevTools state did not produce a valid recovery snapshot.

Therefore there is no complete exact-head chain proving:

`projected -> extension disable -> native fail-open -> re-enable/reload/refresh -> ACS reconnect -> projection recovery`.

The earlier authenticated projection/Others evidence must not be promoted into an exact-head reload/disable PASS.

## Checks

A fresh checkout from GitHub remote `main` resolved to the exact inspected HEAD and ran:

`npm run check`

Result:

- JavaScript syntax checks: PASS
- unit/adapter/navigation/privacy/recovery assertions: **11 passed, 0 failed**

GitHub Actions / commit-status evidence:

- required workflows: none configured for this package/round
- workflow runs on the inspected HEAD: none
- commit statuses on the inspected HEAD: none

No CI PASS is claimed.

## Why BLOCKED rather than NO_GO

This evidence does not show that the MV3 architecture is impossible or that it requires a forbidden private interface. In fact, authenticated live execution of the spike was observed.

The unresolved problem is certification: the current exact HEAD has not been demonstrated through the complete developer-mode reload/disable recovery sequence required by ACS-00. Under the execution protocol, missing mandatory live evidence is a blocker, not a success and not by itself an architectural NO_GO.

## Canonical consequence

- ACS-00 -> **BLOCKED**
- B2 authenticated MV3 recovery -> **BLOCKED / exact-head lifecycle evidence incomplete**
- B1 scope-key blocker -> unchanged
- B3 route/content ownership barrier -> unchanged and fail-closed
- ACS-01 -> **LOCKED**
- no further runtime-code retries are part of this closure
- no later round was started

No real chat bodies, credentials, cookies, tokens, account identifiers, or sensitive titles are included in this receipt.
