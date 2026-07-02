# FP-021 Result Summary

## Result

```text
SAFETY_GATE_FAILURE_CONFIRMED_BY_SOURCE_INSPECTION
```

## Finding split

```text
Finding 1: SHADOW-REF packet id rejected by validator
Disposition: VALIDATION_NAMESPACE_BUG
Severity: workflow blocker / low execution risk

Finding 2: forgepilot_start_opencode_worker spawned OpenCode while execution status reported disabled
Disposition: SAFETY_GATE_FAILURE
Severity: security-relevant execution-gate defect
```

## Root cause

At bridge commit `3a16d68`, `startOpenCodeWorker` checks only:

```text
approval string
non-empty packetId
workspace allowlist
prompt path/file existence
no active worker for same packetId
```

It does not enforce the execution disable switch, guarded preflight, request artifact validation, human approval, model/run-mode allowlist, packet namespace policy beyond non-empty packet id, or repository cleanliness before spawning OpenCode.

## Blast radius

Based on source inspection, the issue is not specific to `FP-MCP-036`.

```text
Any caller authorized to invoke forgepilot_start_opencode_worker with approval=START_OPENCODE_WORKER can attempt to spawn OpenCode for an allowed workspace and readable prompt file, regardless of reported disabled execution status.
```

The risk is bounded by MCP tool access, workspace allowlist, prompt-file location checks, and whether OpenCode itself succeeds, but not by the intended execution-enable/disable policy gates.

## Required regression before extraction resumes

A later fix packet must prove:

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

## Extraction status

```text
EXTRACTION_BLOCKED_UNTIL_SAFETY_GATE_FIX
```

## Boundary

No bridge source files were modified. No additional workers were started during FP-021. No extraction was attempted.
