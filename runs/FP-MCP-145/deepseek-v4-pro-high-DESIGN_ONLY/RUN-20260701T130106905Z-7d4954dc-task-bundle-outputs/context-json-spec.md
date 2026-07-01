# FP-MCP-145 — context.json Specification

## Purpose

The `context.json` file is a new staged artifact in the task bundle that provides
the OpenCode worker with explicit target workspace commit binding information.
It supplements `packet.md` and `request.json` with commit identity data that the
worker needs to avoid confusing the ForgePilot control repository commit with the
target workspace commit.

## Location

```
<opencodeWorkingDirectory>/.forgepilot/tasks/<runnerRunId>/context.json
```

Staged alongside `packet.md`, `request.json`, `instructions.md` in the same
bundle directory.

## Schema

| Field | Type | Source | Description |
|---|---|---|---|
| `controlRepoCommit` | `string` | `validation.requestBaseCommit \|\| validation.baseCommit` | The ForgePilot control repository commit (e.g., `20a2396`) used by the request artifact. |
| `targetWorkspaceId` | `string` | `requestedTargetWorkspaceId` from start-run body | The workspace identifier from the allowlist (e.g., `"forgepilot"`). |
| `targetWorkspaceCommit` | `string \| null` | `git rev-parse --short HEAD` run in target workspace | The HEAD commit of the target workspace at time of runner start. `null` only if the resolver could not complete (execution is blocked in that case). |
| `opencodeWorkingDirectory` | `string` | Resolved from workspace allowlist | The absolute filesystem path where OpenCode is launched. |

## Example (same-repository run)

```json
{
  "controlRepoCommit": "20a2396",
  "targetWorkspaceId": "forgepilot",
  "targetWorkspaceCommit": "20a2396",
  "opencodeWorkingDirectory": "/home/ridasaidd/forgepilot"
}
```

## Example (cross-repository run)

```json
{
  "controlRepoCommit": "20a2396",
  "targetWorkspaceId": "forgepilot-chatgpt-mcp",
  "targetWorkspaceCommit": "bbf930a",
  "opencodeWorkingDirectory": "/home/ridasaidd/forgepilot-chatgpt-mcp"
}
```

## Invariants

1. **Not a mutation of request.json.** `context.json` is a separate file. The
   `request.json` remains an unmodified copy of the request artifact.

2. **Always present when execution proceeds.** If `targetWorkspaceCommit` cannot
   be resolved, execution is blocked before the task bundle is created, so
   `context.json` is never written with `null` for `targetWorkspaceCommit`.

3. **Worker must prefer `targetWorkspaceCommit` for git operations inside the
   target workspace.** `controlRepoCommit` is informational and should not be
   used for `git show`, `git log`, or other git inspections inside the target
   workspace directory.

4. **Read-only for the worker.** The worker reads `context.json` for reference;
   it does not modify it.

## Relationship to request.json

| Field in request.json | Relationship |
|---|---|
| `repoCommit` | This is the ForgePilot control repo commit at request creation time. Matches `context.json.controlRepoCommit`. |
| `baseCommit` | Same commit identity. Matches `context.json.controlRepoCommit`. |
| `targetExecutionCommit` | Also `20a2396` — previously the only "commit" concept. Now separate from `targetWorkspaceCommit` in cross-repo runs. |

The `request.json` fields `repoCommit`, `baseCommit`, `targetExecutionCommit`
all refer to the ForgePilot control repository only. They have no relationship
to the target workspace commit and should not be used as such.

## Why a separate file?

FP-MCP-145 (lines 105–107) explicitly prefers a new file over embedding context
into `request.json`:

> It is acceptable to add a new staged file: `context.json` if that keeps request
> artifact immutability clearer.

This choice preserves the invariant that `request.json` is an unmodified copy
of the request artifact — the worker can verify the SHA256 of `request.json`
against what the runner validated.
