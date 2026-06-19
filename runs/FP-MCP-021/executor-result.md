# FP-MCP-021 Executor Result

## Packet

FP-MCP-021 — Remote Runner Start Tool Boundary

## Repository State

ForgePilot repository:

```text
/home/ridasaidd/forgepilot
```

ForgePilot branch:

```text
main
```

ForgePilot packet commit:

```text
8e6aac6
```

Working tree after packet commit:

```text
clean
```

## Implementation Summary

FP-MCP-021 added a boundary-only packet defining the safety requirements for a future MCP tool that may request the private dev runner to start an OpenCode run.

Files added:

```text
packets/FP-MCP-021.md
```

The packet defines:

* future start tool name
* required input schema
* exact approval token
* required gate order
* local validation gate
* remote validation gate
* runner configuration gate
* runner authentication requirements
* request artifact digest requirement
* start endpoint
* start request shape
* forbidden request fields
* expected success response
* expected rejection response
* pre-start state artifact
* post-start state artifact
* request artifact mutation boundary
* timeout boundary
* idempotency boundary
* duplicate start boundary
* output schema
* logging boundary
* reason codes
* trust boundary

## Scope Confirmation

FP-MCP-021 is boundary-only.

It did not add:

* MCP start tool implementation
* runner implementation code
* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* arbitrary HTTP proxying
* artifact writing implementation
* Git mutation
* SQLite mutation
* background workers
* automatic retries
* runtime behavior changes

## Boundary Summary

Future tool name:

```text
forgepilot_start_remote_runner_request
```

Required future input:

```text
packetId
requestId
approval
```

Required approval token:

```text
START_REMOTE_RUNNER_REQUEST
```

Required future gate order:

```text
1. Validate input syntax.
2. Check exact approval token.
3. Run local validation equivalent to FP-MCP-015.
4. Confirm runner is configured.
5. Compute request artifact SHA-256 digest.
6. Call remote runner validate-request equivalent to FP-MCP-020.
7. Confirm remote validation accepted.
8. Record pre-start state artifact.
9. Call POST /runner/start-run.
10. Record post-start state artifact.
11. Return structured result.
```

## Connector Verification

ChatGPT MCP connector observed after packet commit:

```text
branch: main
commit: 8e6aac6
workingTreeClean: true
gitStatusShort: ""
```

## Result

FP-MCP-021 satisfies its remote runner start tool boundary-only scope.

Status:

```text
ACCEPTED_FOR_VERIFICATION
```
