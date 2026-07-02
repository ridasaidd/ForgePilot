# FP-OPS-003 — Manual Action Ledger

## Task

Create a repo-tracked manual action ledger/runbook for external operator actions that ForgePilot cannot perform or observe automatically.

## Goal

Prevent manual actions from living only in chat memory.

## Scope

Add:

```text
docs/manual-action-ledger.md
```

The ledger should define how to record actions such as OpenAI Actions schema refresh, service/account configuration, OAuth setup, and other external/manual steps.

## Non-Goals

- No secret capture.
- No credential storage.
- No implementation code.
- No MCP tools.
- No automation.
