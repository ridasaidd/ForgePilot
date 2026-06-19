# FP-MCP-011 Executor Result

## Packet

FP-MCP-011 — OpenCode Execution Start Boundary

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
51d6a40
```

Working tree after packet commit:

```text
clean
```

## Implementation Summary

FP-MCP-011 added a boundary-only packet defining the safety, approval, validation, and artifact requirements that must exist before any ForgePilot MCP tool may start an OpenCode execution run.

Files added:

```text
packets/FP-MCP-011.md
```

The packet defines:

* execution-start prerequisites
* exact approval-token requirement
* request artifact prerequisite
* repository cleanliness requirements
* base commit matching requirement
* model allowlist requirement
* run-mode allowlist requirement
* artifact directory derivation rules
* execution state artifact requirements
* terminal output capture requirements
* required post-run artifacts
* execution state transitions
* stable failure reason codes
* sanitized logging requirements
* future execution tool annotation requirements

## Scope Confirmation

FP-MCP-011 is boundary-only.

It did not add:

* MCP execution-start tools
* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* background execution
* worker daemons
* prompt submission
* terminal streaming
* arbitrary command execution
* Git mutation
* SQLite mutation
* runtime behavior changes

## Boundary Summary

FP-MCP-011 requires that a future execution-start tool must not accept:

* raw prompt text
* arbitrary shell commands
* arbitrary filesystem paths
* model overrides
* run-mode overrides
* raw artifact directories
* raw repository paths
* shell arguments
* environment variables
* secrets
* arbitrary JSON payloads

The future execution-start tool may only accept:

```text
packetId: string
requestId: string
approval: string
```

The execution input must be an existing validated request artifact.

## Required Future Approval

FP-MCP-011 defines the recommended future execution approval token:

```text
START_OPENCODE_RUN
```

Missing or incorrect approval must prevent execution.

## Required Future Tool

FP-MCP-011 identifies the possible future implementation tool:

```text
forgepilot_start_opencode_run
```

This tool is not implemented by FP-MCP-011.

## Connector Verification

ChatGPT MCP connector observed after packet commit:

```text
branch: main
commit: 51d6a40
workingTreeClean: true
gitStatusShort: ""
```

## Result

FP-MCP-011 satisfies its boundary-only execution-start scope.

Status:

```text
ACCEPTED_FOR_VERIFICATION
```

