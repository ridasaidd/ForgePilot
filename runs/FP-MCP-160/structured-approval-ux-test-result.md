# FP-MCP-160 Structured Approval UX Test Result

## Result

```text
STRUCTURED_APPROVAL_POPUP_PATTERN_SAFE_BUT_EXISTING_FIXTURE_NOT_MIGRATION_READY
```

## What was tested

The existing non-authorizing dry-run fixture tool was called:

```text
forgepilot_record_human_approval_evidence_dry_run_fixture
```

with structured scope arguments intended to model popup-based human approval UX.

## Fixture artifact

```text
approvalId: APPROVAL-20260702T150302133Z-0011e6f4
path: runs/FP-MCP-160/approvals/APPROVAL-20260702T150302133Z-0011e6f4.json
sha256: 45d86f655390b059d044c95c0455902723fa00d390a4c3bf2417c7289e493fd3
```

## Positive finding

The popup-style structured-tool interaction is viable as a UX pattern.

The tool call presented fixed structured fields instead of requiring the user to paste exact approval text.

The fixture remained safe:

```text
approvalEvidenceValid: false
approvalValid: false
approvalUsableForExecution: false
humanApprovalRecorded: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

## Negative finding

The existing dry-run fixture tool is not suitable as the final structured approval UX model.

The created fixture hardcoded its approval scope packet to:

```text
FP-MCP-036
```

instead of the intended execution packet under test:

```text
FP-MCP-159
```

Validation against FP-MCP-159 correctly failed with:

```text
APPROVAL_SCOPE_MISMATCH
APPROVAL_REQUEST_BINDING_INVALID
APPROVAL_TEXT_INVALID
APPROVAL_QUARANTINED
```

## Interpretation

The UX idea is good, but the current dry-run fixture is only a safety fixture, not a reusable approval UX primitive.

A real structured approval tool must explicitly distinguish:

```text
approval recorder packet
execution target packet
request id
model id
run mode
repository commit
branch
expiration
single-use flag
```

## Required next design

A future structured approval tool should be create-only and should not require manual approval text.

It must not:

```text
enable execution
consume approval
contact runner start endpoint
start OpenCode
mutate the request artifact
override disable switch
```

It should create an approval artifact whose scope exactly matches the structured fields shown in the popup.

## Boundary

No execution was enabled.
No approval was usable for execution.
No approval was consumed.
No runner start endpoint was contacted.
No OpenCode process started.
No bridge source changed.
