# FP-MCP-298 — FP-027 Canary Sequence Guard

## Checkpoint Type

```text
SEQUENCE_GUARD
```

## Summary

FP-MCP-298 records a non-executing sequence guard after FP-MCP-297 exposed an operator-side out-of-order attempt. The guard defines ordered FP-027 canary gates and a current next-action rule so later steps cannot be treated as interchangeable. It preserves the fact that request artifact FP-MCP-295 / REQ-20260704T142232816Z-a82a42b6 exists and was validated, and approval FP-MCP-296 / APPROVAL-20260704T142523179Z-10b0b6f3 was validated but expires at 2026-07-04T14:40:00.000Z. If continuation occurs after expiration, fresh approval is the only next legal action. If a valid unexpired approval exists, the next legal action is to record approved pre-start evidence, then validate it. State snapshot recording remains forbidden until approved pre-start evidence has both been recorded and validated. This checkpoint does not implement new bridge code, create approval, create pre-start evidence, record snapshots, clear disable switches, create clearance, contact runner start, start OpenCode, consume approval, or run FP-027.

## Claim

```text
FP-MCP-298 turns the FP-027 canary order from operator memory into an explicit mechanical sequencing guard: state snapshot recording is forbidden until approved pre-start evidence exists and validates; the next legal action is fresh approval if the prior approval expired, otherwise approved pre-start evidence recording, followed by pre-start validation before any state snapshot attempt.
```

## Caveats

- This is a non-executing guard artifact, not a canary run.
- It does not create or validate pre-start evidence.
- It does not create or validate state snapshots.
- It does not repair the prior sequencing deviation; it prevents silently repeating it by recording the legal order.
- The prior approval must be treated as expired if continuation occurs after 2026-07-04T14:40:00.000Z.
- Future tooling should prefer a real sequencer tool that enforces this artifact mechanically before write-producing gate tools run.

## Boundaries

- non-executing sequencing guard only
- no approval created
- no approval consumed
- no pre-start evidence recorded
- no state snapshots recorded
- no clearance created
- no disable switch cleared
- no runner start endpoint contact
- no OpenCode session or worker started
- no prompt submitted
- no FP-027 canary run
- no source edits
- no MCP bridge source inspection or refactor

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
FP-MCP-298 turns the FP-027 canary order from operator memory into an explicit mechanical sequencing guard: state snapshot recording is forbidden until approved pre-start evidence exists and validates; the next legal action is fresh approval if the prior approval expired, otherwise approved pre-start evidence recording, followed by pre-start validation before any state snapshot attempt.
```
