# FP-MCP-240 — Pre-Contact Canary Discipline Gate

## Checkpoint Type

```text
GUARD_IMPLEMENTATION_RESULT
```

## Summary

Implement a mandatory pre-contact canary discipline gate in the MCP bridge remote-runner start path. Immediately before contacting the runner start endpoint, the bridge now records a local non-target-workspace pre-contact canary discipline artifact under the bridge .local directory. The artifact records a process-tree/process snapshot, abort-readiness, no-retry marker, no-chaining marker, target workspace cleanliness, and approval/clearance freshness at contact time. If the discipline artifact is not valid, the start path returns before runner contact with PRE_CONTACT_CANARY_DISCIPLINE_FAILED. The artifact is written outside the ForgePilot target workspace so it does not dirty the workspace before runner validation. The start request now carries preContactCanaryDiscipline metadata and boundaryVersion FP-MCP-240. Verification passed with pnpm test, including TypeScript build and hardcoded packet-id lint. Bridge commit 1d906c3 records the implementation.

## Claim

```text
FP_MCP_240_PRE_CONTACT_CANARY_DISCIPLINE_GATE_IMPLEMENTED
```

## Caveats

- This implementation changes the start path but has not yet been exercised by a fresh real guarded start.
- The pre-contact discipline artifact is local to the MCP bridge .local directory to avoid dirtying the ForgePilot target workspace before runner validation; a later output-promotion or run-result reader packet may make these artifacts easier to collect into canonical run evidence.
- The process snapshot is bounded and filtered to relevant process lines; it is a practical guard artifact, not a full forensic process dump.
- Abort-readiness records that AbortController exists and the 10-second timeout policy is armed before contact; it does not by itself prove an operator can manually abort after contact.
- No retry/no-chaining are recorded as explicit state markers for the single start call path; future multi-attempt orchestration would require separate policy and tooling.
- The MCP service must be restarted before FP-MCP-240 is active in the live runtime.

## Boundaries

- execution authorized: false
- approval created: false
- approval consumed: false
- local clearance created: false
- runner start endpoint contacted by this packet: false
- OpenCode started: false
- FP-027 canary run: false
- disable switch cleared: false
- standing execution authority created: false

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
FP_MCP_240_PRE_CONTACT_CANARY_DISCIPLINE_GATE_IMPLEMENTED
```
