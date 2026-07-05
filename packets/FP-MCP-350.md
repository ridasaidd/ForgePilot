# FP-MCP-350 — Clearance preview evidence-head alignment

## Checkpoint Type

```text
TOOL_IMPLEMENTATION_RESULT
```

## Summary

The bridge implementation now passes requestArtifactCommit as the current committed ForgePilot evidence HEAD into previewOperatorLocalExecutionClearanceReviewManifest while preserving targetExecutionCommit and executionBaseCommit as the original scoped execution base. This fixes the mismatch where committed approval evidence advanced HEAD and made preview ineligible. The bridge build and full test script passed. A direct read-only built-code probe returned eligible=true, reasons=[], currentHead=84814b9, expectedHead=84814b9, executionBaseAncestorOfRequestArtifact=true, and no side effects.

## Claim

```text
FP-MCP-350 patched the capability-separated preview and clearance-intent surfaces to bind committed evidence HEAD separately from the target execution commit, resolving the FP-MCP-349 head-mismatch condition in built-code validation.
```

## Caveats

- The running MCP process was observed as node dist/server.js and may need restart/action refresh before the tool server uses the newly built dist code.
- The live MCP tool was not used to create clearance or record clearance intent after this patch.
- The approval used for validation expires at 2026-07-05T10:20:00.000Z, so a new approval may be needed after restart or later testing.
- This patch keeps target execution commit bound to 5c0ab8b and only separates the committed evidence head used for repository cleanliness/current-head validation.

## Boundaries

- Did not call deprecated forgepilot_apply_guarded_canary_next_gate.
- Did not create clearance.
- Did not record clearance intent.
- Did not create enablement.
- Did not consume approval.
- Did not clear the disable switch.
- Did not contact runner start.
- Did not start OpenCode.
- Did not run FP-027 canary.

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
FP-MCP-350 patched the capability-separated preview and clearance-intent surfaces to bind committed evidence HEAD separately from the target execution commit, resolving the FP-MCP-349 head-mismatch condition in built-code validation.
```
