# FP-MCP-167 Result Summary

## Result

```text
CONSUMING_CLEARANCE_MECHANISM_CONTRACT_DEFINED
```

## Summary

FP-MCP-167 defines the consuming scoped clearance mechanism contract before any side-effecting implementation.

It explicitly treats approval consumption and runner contact as a two-phase transition with a detectable intermediate state.

## Core decisions

```text
consumption and runner contact are not assumed atomic
CONSUMED_PENDING_RUNNER_CONTACT is a first-class state
stale pending-contact state must be reconstructable
runner contact outcome must be appended
same approval/request pair cannot be reused after consumption
a second exact contact confirmation is required before runner contact
first real consuming run remains the FP-027 process-tree canary
abort readiness is part of the first real consuming contract
failure after consumption burns approval by design
```

## Boundary

```text
approval_consumed: false
runner_start_endpoint_contacted: false
opencode_started: false
execution_permitted: false
runner_run_id_created: false
request_artifact_mutated: false
```
