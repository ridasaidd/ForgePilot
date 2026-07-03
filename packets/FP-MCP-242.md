# FP-MCP-242 — Repair Approved Pre-Start Evidence Recording Path

## Checkpoint Type

```text
MCP_TOOL_REPAIR_RESULT
```

## Summary

Repair the FP-MCP-241 blocked pre-start evidence path by adding a narrower MCP tool, forgepilot_record_approved_pre_start_evidence_artifact. The existing recorder implementation already supported approval-scoped pre-start evidence, but the prior tool invocation shape with approvalId was blocked before MCP execution. The new tool uses an explicit approved-evidence artifact workflow, calls the same non-executing recorder logic with RECORD_PRE_START_EVIDENCE_DRY_RUN internally, writes only the pre-start evidence artifact, and never contacts the runner start endpoint, starts OpenCode, consumes approval, or clears the disable switch. Verification passed with pnpm test, including TypeScript build and hardcoded packet-id lint. Bridge commit c5f90af records the implementation.

## Claim

```text
FP_MCP_242_APPROVED_PRE_START_EVIDENCE_RECORDER_IMPLEMENTED
```

## Caveats

- The new MCP tool is committed but requires an MCP service restart before it is available in the live runtime.
- FP-MCP-241's existing approval and clearance may expire before the repaired tool is live; if expired, they must not be reused.
- This repair does not itself create FP-MCP-241 pre-start evidence; it only makes the approved path available after restart.
- The tool reuses existing recorder logic and does not weaken the pre-start gate.
- A future FP-MCP-241 continuation must revalidate freshness and may need a fresh approval/clearance tuple.

## Boundaries

- execution authorized: false
- approval created: false
- approval consumed: false
- local clearance created: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- disable switch cleared: false

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
FP_MCP_242_APPROVED_PRE_START_EVIDENCE_RECORDER_IMPLEMENTED
```
