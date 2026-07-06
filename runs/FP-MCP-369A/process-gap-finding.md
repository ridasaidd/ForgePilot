# FP-MCP-369A — Process Gap Finding

## Finding

The auditor identified a real process gap:

    FP-MCP-298 through FP-MCP-368 introduced substantial guarded execution infrastructure without concurrent auditor review at the points where new state machines, executors, and gates were introduced.

The retrospective reconciliation did not find evidence that FP-027 ran or that unsafe execution occurred.

However, absence of unsafe execution does not erase the process gap.

## Safety-Relevant Infrastructure Introduced During The Gap

Examples include:

- scoped execution enablement gate design
- scoped execution enablement tooling
- guarded gate sequencer
- sequencer-enforced executor
- canary action surface narrowing
- runner-start executor implementation
- capability-separated observer/preview surfaces
- MCP tool contract manifest
- default ChatGPT-safe surface profile
- inline registration extraction
- sanitized observer safe-surface exposure

## Accepted Process Rule Going Forward

Any future packet that introduces a new:

- state machine
- executor
- gate mechanism
- execution-adjacent sequencing layer
- approval/clearance/enablement mechanism
- tool-surface category change

must be flagged for auditor review at introduction time, not discovered later through retrospective reconciliation.

## Application

This process rule applies before resuming sandbox preview work.

Future sandboxed-command packets must be auditor-visible at introduction time because they involve a new execution-adjacent mechanism.
