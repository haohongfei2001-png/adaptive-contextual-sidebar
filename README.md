# Adaptive Contextual Sidebar

Adaptive Contextual Sidebar (ACS) is a Chrome MV3 experiment for an anchor-centric, dynamic ChatGPT conversation sidebar.

## Product premise

The currently opened Chat is the anchor. ACS aims to show only a small, stable set of currently related conversations in ChatGPT's ordinary conversation-list area, with Others restoring native browsing.

ACS is not a Workspace manager, folder taxonomy, Project replacement, or full-history organizer.

## Canonical sources

Read these before any implementation:

1. docs/FROZEN_DESIGN_v0.1.md — frozen product and technical design.
2. AGENTS.md — repository-wide execution constraints.
3. docs/EXECUTION_PROTOCOL.md — round-based execution protocol.
4. docs/rounds/ACS-00.md — ACS-00 round contract.
5. status/ACS_STATUS.yaml — canonical execution status.
6. docs/reports/ACS-00_CAPABILITY_REPORT.md — dated ACS-00 live capability evidence.

## Current state

- Design: frozen.
- Product implementation: not started beyond the bounded ACS-00 capability prototype.
- ACS-00 outcome: PRIVATE_SPIKE.
- The native-slot hypothesis is credible on the tested ChatGPT Web layout, but production-grade scope isolation and authenticated loaded-extension recovery remain unproven.
- ACS-01: LOCKED.

Do not begin ACS-01 or any later round without resolving the canonical ACS-00 limitations as required by the frozen design and receiving a separate explicit execution instruction.