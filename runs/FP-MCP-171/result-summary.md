# FP-MCP-171 Result Summary

## Result

```text
PRE_CANARY_SEQUENCE_VIOLATION_RECORDED_CANARY_NOT_RUN
```

## Summary

A premature start-tool invocation occurred before the intended FP-027 canary preparation sequence.

The request was blocked before runner contact.

## Safety outcome

```text
runnerContacted: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
runnerRunId: null
approvalConsumed: false
```

## Classification

```text
PRE_CANARY_SEQUENCE_VIOLATION_BLOCKED_BEFORE_RUNNER_CONTACT
```

## Disposition

```text
canary_run: false
retry_attempted: false
must_restart_canary_sequence: true
```
