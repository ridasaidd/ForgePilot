# FP-MCP-202 DeepSeek/OpenCode Runtime Fix Prompt

You are implementing FP-MCP-202 in the MCP bridge repository.

## Workspace

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

## Starting point

Start from bridge branch:

```text
feature/oauth-auth0
```

Expected latest bridge commit:

```text
9c355e7 Refactor packet checkpoint recorder
```

Before editing, verify:

```sh
git status --short
git log --oneline -5
pnpm build
```

If the working tree is dirty before you start, stop and report it.

## Observed failure

FP-MCP-201 live smoke-tested the refreshed MCP tool:

```text
forgepilot_record_packet_checkpoint
```

The tool was visible, callable, reached the bridge, and wrote partial artifacts. It failed at the evidence execution step with:

```text
spawn pnpm ENOENT
```

This likely means the MCP service process environment does not have `pnpm` on PATH, even though interactive terminal sessions do.

## Task

Fix command resolution in the checkpoint tool so the MCP service runtime can execute the evidence script reliably without assuming `pnpm` is on PATH.

Primary target module:

```text
src/packet-checkpoint.ts
```

## Current problematic behavior

The checkpoint tool currently uses something equivalent to:

```ts
execFileAsync("pnpm", ["tsx", evidenceScriptPath], ...)
```

That fails when the MCP service environment cannot resolve `pnpm`.

## Preferred fix direction

Implement a bounded command-resolution helper inside the checkpoint module. It should try safe, explicit options in order, for example:

1. Use an explicit configured path from environment if present, such as:

```text
FORGEPILOT_PNPM_BIN
```

2. Fall back to the currently used literal command:

```text
pnpm
```

3. If spawning fails with ENOENT, return a structured fail-closed result with a clear reason code, without leaving the repository dirty if possible.

Alternative acceptable approach:

Use Node/Corepack in a safe bounded way if already available in the project environment, but do not introduce network installs or package-manager bootstrapping.

## Important hardening requirement

The tool currently writes packet/checkpoint artifacts before executing evidence admission. If evidence execution fails, it can leave partial uncommitted artifacts.

Improve this behavior if feasible within scope:

- Either preflight command availability before writing artifacts; or
- perform cleanup of only files created by the current invocation if evidence execution fails before commit; or
- return a structured failure that clearly reports partial artifacts and dirty state.

Preferred: preflight command availability before writing artifacts so `spawn pnpm ENOENT` fails closed before artifact writes.

## Required reason codes

Add clear reason codes where appropriate:

```text
PNPM_COMMAND_NOT_FOUND
EVIDENCE_EXECUTION_FAILED
PARTIAL_ARTIFACTS_WRITTEN
```

Do not replace existing reason codes unless necessary.

## Required non-execution boundary

This fix must never:

```text
authorize execution
consume approval
clear disable switch
contact runner start endpoint
start OpenCode
run FP-027 or any canary
change approval semantics
change disable-switch semantics
change request-artifact semantics
broaden terminal-command authority
perform broad unrelated refactors
```

## Validation requirements

Run:

```sh
pnpm build
```

If possible, also perform a local dry validation that does not create a real packet checkpoint, or explain why that is not available.

Do not run the live `forgepilot_record_packet_checkpoint` action yourself. GPT/operator will run the live smoke test after bridge refresh.

## Expected changed files

Likely:

```text
src/packet-checkpoint.ts
```

Maybe:

```text
src/server.ts
```

Only change `src/server.ts` if necessary for passing config/path through cleanly.

## Expected output report

When complete, report:

```text
changed files
bridge commit
build command and result
summary of the fix
whether FORGEPILOT_PNPM_BIN is supported
whether preflight command availability was added
whether partial-artifact behavior was improved
explicit non-execution boundary confirmation
caveats
```

## Success result string

```text
FP_MCP_202_CHECKPOINT_TOOL_RUNTIME_COMMAND_RESOLUTION_FIXED
```

## Stop conditions

Stop and report without further modification if:

```text
working tree is dirty before start
fix requires changing execution/approval/disable/start semantics
fix requires broad unrelated refactor
build fails and fix is not clearly within scope
```
