# FP-MCP-363 Diagnostic Report Evidence

## Result

Diagnosed one confirmed false-positive guarded sequencer pathway in bridge commit 3ba467a.

## Confirmed False-Positive

The sequencer can report FRESH_ORIENTATION_BEFORE_START when it should report PREVIEW_SCOPED_ENABLEMENT.

The cause is conditional clearanceId validation in enablementStatus.

When input.clearanceId is omitted, enablementStatus does not compare the enablement artifact's clearanceId against the actual current clearance artifact's clearanceId.

This allows stale enablement evidence created for a previous clearance to remain valid after the local clearance artifact is replaced by a new clearance with the same tuple fields but a different clearanceId.

## Relevant Source

- src/guarded-canary-gate-sequencer.ts
- affected function: enablementStatus
- reported affected line: 195
- reported affected condition: clearanceId mismatch check guarded by input.clearanceId

## False-Positive Scenario

1. Caller invokes forgepilot_observe_next_gate or forgepilot_get_guarded_canary_next_gate without clearanceId.
2. Clearance A exists.
3. Enablement A exists and references Clearance A.
4. Clearance B replaces the local clearance artifact using the same tuple fields but a different clearanceId.
5. clearanceStatus validates Clearance B.
6. enablementStatus validates Enablement A because the clearanceId comparison is skipped when input.clearanceId is absent.
7. getGuardedCanaryNextGate falls through to FRESH_ORIENTATION_BEFORE_START.
8. The expected result is PREVIEW_SCOPED_ENABLEMENT with ENABLEMENT_CLEARANCE_ID_MISMATCH.

## Why This Violates FP-MCP-362

FP-MCP-362 states that a next gate may be reported only if all prerequisite evidence for that exact tuple is present, current, unexpired, and positively valid.

The stale enablement is not current for the active clearance. It must not satisfy the enablement prerequisite.

## Proposed Minimal Correction for FP-MCP-364

Propagate the observed clearance id from clearanceStatus into the enablementStatus input before validating enablement.

Expected behavior:

- If enablement.clearanceId differs from the current clearance artifact id, enablementStatus marks the enablement invalid.
- The sequencer returns PREVIEW_SCOPED_ENABLEMENT.
- Reasons include ENABLEMENT_CLEARANCE_ID_MISMATCH.

## Suggested Tests

- Stale enablement clearanceId is detected when input.clearanceId is omitted.
- Fresh enablement clearanceId passes when it matches current clearance.
- Omitted input.clearanceId still passes when current clearance and enablement agree.

## MCP/OpenAI Conformance Observations

- Sequencer read-only tools appear read-only.
- Mutating tools appear clearly described as mutating or evidence-writing.
- Exact approval literals are present for mutating tools.
- Structured blocked states are represented.
- The conformance gap is not a descriptor problem; it is a server-side validation gap caused by optional input-driven cross-artifact checking.

## Non-Execution Statement

No code was modified. No files were created in the bridge repo. No commits were made in the bridge repo. No pushes were made from the bridge repo. No services were restarted. No approval was consumed. No OpenCode was started. No runner start endpoint was contacted. No FP-027 canary was run. No disable switch was cleared.
