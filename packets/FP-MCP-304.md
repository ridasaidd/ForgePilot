# FP-MCP-304 — Scoped Execution Enablement Gate Design

## Checkpoint Type

```text
ENABLEMENT_GATE_DESIGN
```

## Summary

FP-MCP-303 proved the FP-027 path now reaches a valid local clearance but remains correctly blocked by GLOBAL_DISABLE_ACTIVE, RUNNER_EXECUTION_DISABLED, and OPENCODE_EXECUTION_DISABLED. FP-MCP-304 records the design contract for the missing bridge between eligible local clearance and guarded runner start. The enablement gate should be a scoped, local, short-lived, single-use artifact bound to packet, requestId, approvalId, clearanceId, modelId, runMode, workspace, branch, execution base commit, current request-artifact/evidence HEAD, pre-start evidence hash, state snapshot attempt/hash pair, and runner capability observation. It must never clear execution broadly, never create a standing global unlock, never authorize direct HTTP execution, and never start OpenCode or contact the runner start endpoint when it is created. A future guarded start may proceed only when fresh orientation reports executionAllowedNow true, preflightPassableNow true, disableSwitch passed, opencodeReadiness passed, and all prior evidence gates remain valid.

## Claim

```text
FP-MCP-304 defines the missing scoped execution enablement gate needed after local clearance and before any guarded runner start: execution enablement must be represented as a short-lived, single-use, exact-tuple local artifact that can make executionAllowedNow true only for one approved FP-MCP-295 guarded-run attempt, without globally disabling safety, without standing authorization, without direct HTTP execution authority, and without contacting runner start by itself.
```

## Caveats

- This packet is design/contract only; it does not implement the enablement tool.
- No disable switch is cleared by this packet.
- No runner/OpenCode execution is enabled by this packet.
- Existing FP-MCP-302 approval and CLEARANCE-20260704T145411583Z-29b22ae0 should be treated as expired for any future run unless tool validation proves otherwise, and practically should be refreshed.
- The exact implementation may choose different tool names, but must preserve the scoped semantics and refusal cases recorded here.
- The enablement mechanism must be auditable before runner start; it must not hide enablement inside start-run.

## Boundaries

- non-executing design checkpoint only
- no approval created
- no approval consumed
- no clearance created
- no scoped enablement artifact created
- no disable switch cleared
- no runner execution enabled
- no OpenCode execution enabled
- no runner start endpoint contact
- no OpenCode session or worker started
- no prompt submitted
- no FP-027 canary run
- no source edits
- no MCP bridge source inspection or refactor
- no direct HTTP execution authority

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
FP-MCP-304 defines the missing scoped execution enablement gate needed after local clearance and before any guarded runner start: execution enablement must be represented as a short-lived, single-use, exact-tuple local artifact that can make executionAllowedNow true only for one approved FP-MCP-295 guarded-run attempt, without globally disabling safety, without standing authorization, without direct HTTP execution authority, and without contacting runner start by itself.
```
