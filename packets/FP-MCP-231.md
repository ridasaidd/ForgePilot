# FP-MCP-231 — Fix Guarded Start Evidence Ordering

## Checkpoint Type

```text
TOOL_IMPLEMENTATION_RESULT
```

## Summary

Recorded and fixed the guarded-start dirty-tree blocker discovered during the FP-MCP-230 one-shot start attempt. The previous rejected start evidence was first preserved in ForgePilot. The MCP bridge guarded start path was then patched so it no longer writes local start-state evidence into the target ForgePilot workspace before contacting the runner. The bridge now defers local non-start/rejection evidence until after runner validation and skips local post-state writes when execution actually starts, preserving a clean target workspace at runner validation time.

## Claim

```text
FP_MCP_231_GUARDED_START_EVIDENCE_ORDERING_FIXED
```

## Caveats

- The running MCP service must be restarted before this bridge fix is active.
- This packet did not retry the canary after the fix.
- Existing approval/local clearance from FP-MCP-230 are expired and must not be reused.
- The fix preserves target workspace cleanliness for runner validation but runner-side behavior still determines whether execution starts.
- No approval was consumed by this packet.

## Boundaries

- execution authorized: false
- approval consumed: false
- disable switch cleared: false
- runner start endpoint contacted by this checkpoint: false
- OpenCode started: false
- FP-027 canary run: false
- local clearance artifact created: false
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
FP_MCP_231_GUARDED_START_EVIDENCE_ORDERING_FIXED
```
