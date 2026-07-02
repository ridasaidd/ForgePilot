# FP-021 Root Cause Report

## Result

```text
SAFETY_GATE_FAILURE_CONFIRMED_BY_SOURCE_INSPECTION
```

## Finding 1 — namespace validation blocker

```text
VALIDATION_NAMESPACE_BUG
```

`forgepilot_validate_opencode_run_request` rejects `SHADOW-REF-*` packet ids as `INVALID_PACKET_ID`, even for committed SHADOW-REF packets.

This blocks the shadow-refactor executor workflow but is not the execution-risk finding.

## Finding 2 — disabled-state bypass

```text
SAFETY_GATE_FAILURE
```

`forgepilot_start_opencode_worker` successfully started an OpenCode process for `FP-MCP-036` while status/disable tools reported execution disabled.

The worker failed quickly, but the safety gate failed because process start was supposed to be prevented before spawn.

## Root cause

Static source inspection of the bridge at commit `3a16d68` shows `startOpenCodeWorker` performs only local checks before spawning:

```text
approval string equals START_OPENCODE_WORKER
packetId is non-empty
workspace id resolves
prompt file resolves and exists
no active worker exists for the same packet id
```

Before `spawn(OPENCODE_BIN, args, ...)`, the implementation does not enforce:

```text
execution disable switch
execution enablement status
guarded execution preflight
request artifact validation
human approval evidence
model allowlist beyond accepting an optional modelId string
run-mode allowlist
packet namespace policy beyond non-empty packetId
repository cleanliness
```

## Source evidence

Bridge source:

```text
/home/ridasaidd/forgepilot-chatgpt-mcp/src/opencode-worker.ts
```

Relevant function:

```text
startOpenCodeWorker(input)
```

Observed behavior:

```text
spawn(OPENCODE_BIN, args, { cwd: workspacePath, env: sanitizeEnv(), detached: true, ... })
```

is reached after the local checks above, with no disable gate call in between.

## Blast radius

Based on source inspection, the gap is not specific to `FP-MCP-036`.

The start function accepts any non-empty `packetId`, subject to worker directory creation and active-worker collision checks. It does not prove packet existence before spawn.

Therefore the blast radius is:

```text
Any caller authorized to invoke forgepilot_start_opencode_worker with approval=START_OPENCODE_WORKER can attempt to spawn OpenCode for an allowed workspace and readable prompt file, regardless of reported disabled execution status.
```

This is bounded by:

```text
MCP tool access/approval path
workspace allowlist
prompt file location checks
OpenCode process success/failure
```

but not by the intended execution-enable/disable policy gates.

## Required regression behavior

A later fix packet must add a regression test proving:

```text
When execution is disabled, forgepilot_start_opencode_worker refuses before spawn.
```

Minimum proof:

```text
no worker id is allocated
no pid is created
no OpenCode process is spawned
no stdout/stderr worker logs are created
rejection reason includes execution disabled / disable switch active
```

## Required fix behavior

Before any executor-driven extraction resumes, a later fix packet must ensure worker start enforces the same effective gate as the trusted start path:

```text
request artifact validation
model/run-mode allowlist
execution disable switch clear
execution enablement/preflight status passed
required human approval or explicit safe dry-run mode policy
```

## Extraction status

```text
EXTRACTION_BLOCKED_UNTIL_SAFETY_GATE_FIX
```

No further bridge extraction should be attempted until the worker-start safety gate is fixed and regression-tested.
