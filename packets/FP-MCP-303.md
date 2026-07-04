# FP-MCP-303 — Guarded Canary Blocked at Execution Enablement

## Checkpoint Type

```text
ENABLEMENT_BLOCK_RESULT
```

## Summary

The operator requested proceeding until actually running ForgePilot OpenCode. A fresh approval was recorded as FP-MCP-302 approval APPROVAL-20260704T145343543Z-8a4d2a6f, committed at 9a0b6b7, and validated. A refreshed clearance preview at current HEAD 9a0b6b7 passed and local clearance CLEARANCE-20260704T145411583Z-29b22ae0 was created by mutating only the gitignored MCP bridge local clearance file. Independent clearance validation reported eligibleForGuardedAttempt true. However, the read-only execution gate orientation still reported the execution enablement blockers: GLOBAL_DISABLE_ACTIVE, RUNNER_EXECUTION_DISABLED, and OPENCODE_EXECUTION_DISABLED. Guarded preflight showed request artifact, commit binding, model/run mode, runner capability, pre-start evidence, state snapshot evidence, human approval evidence, and evidence ledger readiness passed, but disableSwitch failed and opencodeReadiness failed. Because there is no available scoped tool to clear the disable switch or enable runner/OpenCode execution, and because runner start is forbidden before those gates pass, the correct endpoint is a blocked-at-enablement checkpoint rather than contacting runner start.

## Claim

```text
FP-MCP-303 records that the FP-MCP-295 minimal FP-027 guarded/worker canary advanced through fresh approval, refreshed clearance preview, local clearance creation, and independent local clearance validation, but did not proceed to runner start because the aggregate execution orientation still reported executionAllowedNow false, globalDisableActive true, runnerExecutionEnabled false, opencodeExecutionEnabled false, and guarded preflight failed the disableSwitch and opencodeReadiness gates; no exposed scoped disable-clear or execution-enable tool was available, so no runner start endpoint was contacted and OpenCode was not started.
```

## Caveats

- The local clearance artifact is gitignored and lives in the MCP bridge workspace, not the ForgePilot repository.
- The local clearance expires at 2026-07-04T14:59:11.583Z and must not be reused after expiration.
- FP-MCP-302 approval expires at 2026-07-04T15:02:00.000Z and must not be reused after expiration.
- An attempted dedicated disable-status read was blocked by platform safety; the aggregate orientation result still provided the relevant disable and enablement status.
- No exposed scoped tool was available to clear the global disable switch or enable runner/OpenCode execution.
- Runner start remains forbidden until executionAllowedNow/preflight pass in a fresh orientation.

## Boundaries

- blocked-at-enablement checkpoint only
- no approval consumed
- no disable switch cleared
- no runner start endpoint contact
- no OpenCode session or worker started
- no prompt submitted
- no FP-027 canary run
- no source edits
- no MCP bridge source inspection or refactor
- no direct HTTP execution authority
- no attempt to bypass global disable

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
FP-MCP-303 records that the FP-MCP-295 minimal FP-027 guarded/worker canary advanced through fresh approval, refreshed clearance preview, local clearance creation, and independent local clearance validation, but did not proceed to runner start because the aggregate execution orientation still reported executionAllowedNow false, globalDisableActive true, runnerExecutionEnabled false, opencodeExecutionEnabled false, and guarded preflight failed the disableSwitch and opencodeReadiness gates; no exposed scoped disable-clear or execution-enable tool was available, so no runner start endpoint was contacted and OpenCode was not started.
```
