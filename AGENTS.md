# AGENTS.md

## Repository purpose

This repository contains Adaptive Contextual Sidebar (ACS), an anchor-centric Chrome MV3 experiment for reducing ChatGPT sidebar clutter without creating user-visible Workspaces.

The currently opened Chat is the anchor. The product hypothesis, technical boundaries, and staged plan are frozen in `docs/FROZEN_DESIGN_v0.1.md`.

## Source of truth

GitHub remote `main` is the development source of truth.

Before any execution round, re-read the current remote versions of:

1. `AGENTS.md`
2. `README.md`
3. `docs/FROZEN_DESIGN_v0.1.md`
4. `docs/EXECUTION_PROTOCOL.md`
5. the current round file under `docs/rounds/`
6. `status/ACS_STATUS.yaml`

Do not treat a stale local clone, prior chat, or previously observed commit as authoritative.

## One-round execution rule

One user execution authorization covers only the current canonical `READY` or `IN_PROGRESS` round.

When that round reaches a terminal state, update canonical status, commit the evidence, push to remote `main`, re-check remote HEAD/status, and stop.

Do not begin the next round in the same execution unless the product owner explicitly authorizes it in a new instruction.

## Product invariants

- Chat is the anchor; there is no user-visible Workspace in v0.1.
- The main experience must occur in ChatGPT's ordinary conversation-list area.
- `Others` restores native ChatGPT browsing; ACS does not claim to own complete history.
- Projects, Search, New Chat, account/settings, and other protected native surfaces must not be reorganized.
- ACS metadata never owns, moves, deletes, archives, renames, or changes the Project membership of ChatGPT conversations.
- Automatic candidates are bounded; no full-history scan.
- Manual include/exclude decisions outrank learned behavior and AI.
- Each tab has independent view state.
- Network/model calls never block the navigation path.
- Fail open: uncertainty or adapter failure restores native ChatGPT UI.
- Do not substitute a Chrome Side Panel, standalone dashboard, or rewritten sidebar for the frozen native-slot product hypothesis.

## Platform boundary

Never make correctness depend on:

- undocumented/private ChatGPT APIs;
- replaying internal endpoints;
- cookies or authentication interception;
- hidden React state;
- MAIN-world hooks solely to extract private application internals;
- automating ChatGPT subscription messages as a classifier API.

Visible page routes, rendered links, public browser navigation events, isolated content scripts, local extension storage, and later the official OpenAI API boundary are allowed only as specified by the frozen design and current round.

## ACS-00 special restriction

ACS-00 is a capability spike, not product implementation.

It must not implement:

- semantic routing;
- OpenAI model calls;
- Native Messaging helper;
- behavior-learning relation graph;
- scoring/decay/hysteresis product algorithms;
- formal WorkingSetCache policy;
- manual include/exclude product UX;
- PAIA integration;
- Workspace/folders/tags;
- cloud sync;
- production dashboard or Side Panel.

Minimal diagnostics, reversible page patches, fixtures, and temporary hard-coded projections are allowed only to prove capability.

## Evidence discipline

A static HTML fixture cannot prove current ChatGPT Web capability.

Claims about identity, scope isolation, protected surfaces, SPA navigation, native-slot projection, Others, multi-tab isolation, and recovery must be backed by dated real-site evidence for the supported environment.

Never commit real chat bodies, credentials, cookies, tokens, account identifiers, or sensitive titles as fixtures. Sanitize any recorded DOM evidence.

Unknown is not success. If a required capability cannot be demonstrated, report `LIMITED`, `PRIVATE_SPIKE`, `BLOCKED`, or `NO_GO` as appropriate.

## Safety and recovery

Any uncertain DOM ownership, scope conflict, Project-protection failure, stale navigation epoch, or adapter mismatch must prefer native UI over ACS projection.

Do not broaden selectors to “make the test pass.”

Do not use a private interface to rescue a failing public-surface architecture.

## Status integrity

`status/ACS_STATUS.yaml` is canonical execution state, but it is not sufficient by itself. A round can be marked `COMPLETE` only when its implementation/evidence commit exists on remote `main` and all required checks for that round pass.

Status text must never be used to paper over failing evidence.
