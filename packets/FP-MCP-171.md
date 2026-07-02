# FP-MCP-171 — Pre-Canary Sequence Violation Halt

## Task

Record and disposition a premature start-tool invocation that occurred before the planned FP-027 canary sequence was prepared.

This packet is an anomaly and halt packet.

## What happened

The start tool was invoked against the FP-MCP-159 request before the intended canary steps were completed:

```text
fresh canary packet
fresh scoped approval
pre-contact process snapshot
explicit canary start attempt
post-contact/process snapshot
abort-readiness check if worker id exists
```

The invocation was premature and out of sequence.

## Safety outcome

The start policy blocked the request before runner contact.

Observed result:

```text
started: false
accepted: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
executionAllowedNow: false
approvalId: null
humanApprovalEvidenceGatePassed: false
disableSwitchActive: true
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
```

The runner was not contacted.
OpenCode was not started.
No worker id was created.
No retry was attempted.
No canary was run.

## Classification

```text
PRE_CANARY_SEQUENCE_VIOLATION_BLOCKED_BEFORE_RUNNER_CONTACT
```

## Required disposition

FP-027 must not proceed until this anomaly is admitted and reviewed.

The next action after FP-MCP-171 must be a fresh canary packet/attempt, starting from a clean sequence.

## Expected result

```text
PRE_CANARY_SEQUENCE_VIOLATION_RECORDED_CANARY_NOT_RUN
```
