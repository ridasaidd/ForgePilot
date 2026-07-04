# FP-MCP-289 — Auditor Architectural Reconciliation and Evidence Accounting

## Checkpoint Type

```text
AUDITOR_RECONCILIATION
```

## Summary

FP-MCP-289 records the auditor-requested reconciliation before any MCP server refactor proceeds. It accounts for admitted evidence IDs 153 through 163, clarifies that FP-MCP-278 became the observed MCP refactor workload decision while FP-MCP-279 performed the master-plan orientation refresh, clarifies the FP-MCP-277 COMPENSATED checklist item, and corrects the direct-HTTP pivot language. The remote-runner guarded-start path retains safety properties that the direct HTTP path has not yet proven: process/state snapshots at contact boundary, live abort-readiness equivalent to process-group abort, no-retry/no-chaining state-machine evidence, approval-consumption coupling, and FP-027 canary discipline. The direct HTTP path has proven authenticated reachability, session creation, async prompt submission, assistant completion detection, and cleanup for bounded canary/design interactions only. No refactor, execution enablement, approval consumption, disable-switch clearance, runner-start contact, OpenCode start, prompt wait call, or code modification is authorized by this reconciliation.

## Claim

```text
FP-MCP-289 accepts the auditor finding that FP-MCP-287/288 constituted an architectural policy revision, not merely a status update; direct OpenCode HTTP is reclassified as a provisional design/canary path only, not a safety-equivalent replacement for the guarded-runner FP-027 path, until abort semantics, process/state evidence, no-retry/no-chaining discipline, and master-plan reconciliation are explicitly specified and audited.
```

## Caveats

- FP-MCP-287's wording was too strong if read as replacing the guarded-runner safety architecture for execution; FP-MCP-289 narrows it to provisional direct-HTTP design/canary use pending safety parity or explicit accepted tradeoff.
- Session DELETE is not admitted as equivalent to a proven abort primitive; it has not been shown to terminate underlying OpenCode execution if a prompt hangs or misbehaves.
- The presence of a direct HTTP abort endpoint is not enough; no ForgePilot-admitted direct-HTTP abort discipline has been proven here.
- The keyword-like prompt boundary is useful fail-closed behavior but must be treated as a soft heuristic until structural enforcement is proven.
- The master plan/progress checklist may now be stale because FP-MCP-287/288 changed direction; a follow-up refresh must state the provisional status and preserve FP-027 as unsatisfied.
- The existing FP-MCP-276 approval expired after its recorded expiresAt and must not be reused for future gated execution.

## Boundaries

- non-executing reconciliation only
- no MCP bridge source modification
- no server.ts refactor
- no runner start endpoint contact
- no OpenCode session created by this checkpoint
- no prompt submitted by this checkpoint
- no approval consumed
- no disable switch cleared
- FP-027 remains unsatisfied
- direct HTTP not accepted as safety-equivalent execution path

## Non-Execution Boundary

```text
execution authorized: false
approval consumed: false
disable switch cleared: false
runner start endpoint contacted: false
OpenCode started: false
FP-027 canary run: false
```

## Expected Result

```text
FP-MCP-289 accepts the auditor finding that FP-MCP-287/288 constituted an architectural policy revision, not merely a status update; direct OpenCode HTTP is reclassified as a provisional design/canary path only, not a safety-equivalent replacement for the guarded-runner FP-027 path, until abort semantics, process/state evidence, no-retry/no-chaining discipline, and master-plan reconciliation are explicitly specified and audited.
```
