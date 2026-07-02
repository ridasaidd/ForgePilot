# FP-MCP-181 Result Summary

## Result

```text
FP_MCP_180_LIVE_CONFIRMATION_NOT_PROVEN_RUNTIME_STILL_STALE_APPROVAL_PAYLOAD_BLOCKED
```

## Fresh tuple

```text
requestId: REQ-20260702T203356480Z-5f5eefc8
approvalId: APPROVAL-20260702T203443589Z-1459f91e
approval expires: 2026-07-02T20:55:00Z
```

Pre-start evidence showed the fresh approval was usable before live confirmation:

```text
approvalEvidenceValid: true
approvalUsableForExecution: true
```

## What happened

The approval-bearing guarded preflight call was blocked by the platform safety layer before reaching ForgePilot.

A second guarded preflight call without the approval id reached ForgePilot, but it is not a full confirmation because human approval evidence was missing by construction.

## Runtime observation from no-approval preflight

```text
runnerCapabilityState: FAILED
runnerCapabilityState.reasons: UNEXPECTED_SUPPORTED_OPERATION
supportedOperations: capabilities, validate-request, start-run
startEndpointState: CALLABLE_GUARDED
startCapabilityCallable: true
executionEnabled: false
humanApprovalEvidence: INCOMPLETE
humanApprovalEvidence.reasons: HUMAN_APPROVAL_EVIDENCE_MISSING
```

The new FP-MCP-180 report fields were absent:

```text
startRunOperationAdvertised: absent
directExecutionOperationAdvertised: absent
unexpectedSupportedOperation field: absent
```

## Classification

```text
FP-MCP-180 source implementation: admitted
FP-MCP-180 runtime live confirmation: not proven
runtime service loaded bridge commit d3471d4: not proven
observed runtime state: stale guarded preflight predicate still active
```

## Safety boundary

```text
executionPermitted: false
executionStarted: false
opencodeStarted: false
runnerStartEndpointContacted: false
startEndpointContacted: false
runnerRunId: null
approvalConsumed: false
requestArtifactMutated: false
canaryRetried: false
startToolInvoked: false
```

## Next required work

Refresh/restart the MCP service so bridge commit `d3471d4` is loaded, then repeat live confirmation with a fresh non-expired tuple if this approval expires.
