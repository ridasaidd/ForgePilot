# FP-MCP-241 — Fresh Guarded Start Lifecycle Canary Paused

## Checkpoint Type

```text
CANARY_PAUSED_ON_EVIDENCE_GATE
```

## Summary

Record that the FP-MCP-241 fresh lifecycle canary was prepared but intentionally not started because pre-start evidence validation was incomplete. Request artifact, structured approval, and popup local clearance were created successfully, but the pre-start evidence validator reported missing pre-start evidence artifact and request-artifact-hash evidence. The runner start endpoint was not contacted and OpenCode was not started. This is a disciplined pause, not a failed execution.

## Claim

```text
FP_MCP_241_FRESH_LIFECYCLE_CANARY_PAUSED_ON_PRE_START_EVIDENCE_GATE
```

## Caveats

- The FP-MCP-241 approval and local clearance may expire while the recording path is repaired; expired artifacts must not be reused for a later start.
- No attempt should be made to start the runner until preStartEvidenceComplete and preStartEvidenceValid are both true for a fresh tuple.
- Approval consumption was not attempted because no start occurred.
- The correct pre-start evidence recorder call with approval id was blocked by the wrapper, so FP-MCP-242 should repair or provide a usable MCP-layer path for this non-executing evidence artifact.

## Boundaries

- execution authorized: false
- approval consumed: false
- disable switch cleared: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- second start attempted: false

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
FP_MCP_241_FRESH_LIFECYCLE_CANARY_PAUSED_ON_PRE_START_EVIDENCE_GATE
```
