# ACS Execution Protocol

## 1. Purpose

ACS is developed in bounded rounds. The protocol exists to prevent scope drift, accidental advancement, stale-local execution, and unsupported claims about the live ChatGPT surface.

## 2. Authority order

When instructions conflict, use this order:

1. safety, privacy, and source authenticity;
2. explicit current product-owner instruction;
3. `docs/FROZEN_DESIGN_v0.1.md`;
4. current round contract;
5. this execution protocol;
6. repository-wide `AGENTS.md`;
7. implementation convenience.

A round may refine implementation details but may not silently amend frozen product boundaries.

## 3. Canonical state

Remote GitHub `main` is the only development source of truth.

At the start of every execution:

- resolve remote HEAD;
- read `status/ACS_STATUS.yaml`;
- verify the requested round equals the canonical executable round;
- read the frozen design, AGENTS, protocol, and round contract from that same remote state;
- inspect recent relevant commits and required checks when they exist.

If the user's quoted HEAD differs from remote, report the discrepancy and follow the current remote source unless the user explicitly instructs otherwise.

## 4. Round states

Allowed execution states:

- `READY` — may begin when explicitly authorized.
- `IN_PROGRESS` — active bounded execution.
- `BLOCKED` — cannot proceed without a missing technical prerequisite or owner decision.
- `LIMITED` — capability works only under material documented constraints; round is not closed for normal advancement.
- `PRIVATE_SPIKE` — useful only in explicitly controlled/private conditions; not production-capable.
- `NO_GO` — frozen technical/product gate failed; do not work around it by violating architecture.
- `COMPLETE` — round deliverables, evidence, and required checks are all closed on remote main.

Only `READY` or `IN_PROGRESS` may be executed.

## 5. Start procedure

For an authorized round:

1. verify remote source of truth;
2. set the current round to `IN_PROGRESS` only when actual round work begins;
3. implement only work required by that round;
4. maintain an evidence/report artifact defined by the round;
5. avoid speculative scaffolding for later rounds unless strictly required by the current contract.

## 6. Scope control

Do not start a later round early because it appears convenient.

Do not implement deferred capabilities “for future proofing.”

If later-round architecture is needed to reason about an interface, define only the narrow interface/fixture required by the current round.

For ACS-00 specifically, AI, behavior-learning, PAIA integration, cloud/sync, Workspace management, and production recommendation algorithms are out of scope.

## 7. Live-surface evidence

Where a round depends on current ChatGPT Web behavior, real-site evidence is mandatory.

Record at minimum:

- test date;
- Chrome version;
- ChatGPT surface/layout context;
- supported route type;
- exact capability under test;
- observed public evidence;
- PASS/LIMITED/FAIL outcome;
- known unsupported cases.

Evidence must be sanitized before committing.

Static fixtures and automated tests may prove deterministic adapter logic, but they cannot independently prove that the current live site exposes the assumed capability.

## 8. Required checks

Each round file defines its own closure checks. At minimum, when applicable:

- type/lint;
- unit/property tests;
- state/storage tests;
- adapter fixture regression;
- privacy/permission assertions;
- real-site smoke evidence.

A check that cannot run must be reported explicitly. It is not equivalent to PASS.

## 9. Failure handling

When a gate fails:

- identify the exact failing capability;
- preserve already-correct work;
- use fail-open/native restoration behavior;
- do not widen permissions or use private APIs merely to obtain a PASS;
- set canonical status to the appropriate non-complete state;
- record the blocker and stop.

## 10. Closure procedure

A round closes only after:

1. all required deliverables are committed;
2. required checks pass or the round is explicitly terminal as `NO_GO`;
3. evidence/report is committed;
4. `status/ACS_STATUS.yaml` is updated;
5. changes are pushed to remote `main`;
6. remote HEAD and canonical status are re-fetched and verified.

Then stop.

Even if the next round is marked `READY`, do not begin it without a new explicit owner execution instruction.

## 11. Design amendments

Changing a frozen invariant requires an explicit design amendment. Do not hide product-model changes in implementation commits.

Numerical policy values in the frozen design are initial strategies and may later be amended with evidence, but ACS-00 must not begin tuning later-round product algorithms.
