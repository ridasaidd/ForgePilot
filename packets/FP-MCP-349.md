# FP-MCP-349 — FP-MCP-345 clearance preview head mismatch finding

## Checkpoint Type

```text
CAPABILITY_SPLIT_LIVE_PROBE_RESULT
```

## Summary

A fresh structured approval was recorded under FP-MCP-346, committed at 46642ae, and then supplied to forgepilot_observe_next_gate. The observer reported approval valid and advanced nextRequiredGate to PREVIEW_CLEARANCE. The follow-on read-only forgepilot_preview_clearance_creation call returned previewOnly=true and preserved all non-execution boundaries, but preflight.eligibleToInvokeClearancePopup was false because currentCommitMatches failed: expected head 5c0ab8b while current head was 46642ae. No clearance intent was recorded.

## Claim

```text
With a fresh committed approval, observe advanced to PREVIEW_CLEARANCE, but clearance preview remained ineligible because current repository head no longer matched executionBaseCommit after committing approval evidence.
```

## Caveats

- This appears to expose a coordination issue between committed approval evidence and clearance preview current-head validation.
- The approval artifact must be committed for validation, but committing it advances repository head away from the executionBaseCommit 5c0ab8b required by preview currentCommitMatches.
- The observer advanced to PREVIEW_CLEARANCE while preview rejected eligibility, so observe and preview eligibility predicates may not yet be fully aligned.
- No conclusion should be drawn about clearance creation or runner behavior because the probe stopped at read-only preview ineligibility.

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
With a fresh committed approval, observe advanced to PREVIEW_CLEARANCE, but clearance preview remained ineligible because current repository head no longer matched executionBaseCommit after committing approval evidence.
```
