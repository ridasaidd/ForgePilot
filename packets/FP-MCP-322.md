# FP-MCP-322 — Local Guarded Executor CLI Proposal

## Checkpoint Type

```text
NEXT_PACKET_PROPOSAL
```

## Summary

FP-MCP-321 moved the final runner-start boundary to local operator handoff after repeated ChatGPT platform safety blocks. FP-MCP-322 should implement a narrow local CLI in the MCP bridge that imports existing guarded executor code rather than duplicating gate logic. The CLI should require an input JSON file, call the same guarded executor once, write a result JSON file, and exit. It must not create broad direct runner-start access or unbounded retries.

## Claim

```text
FP-MCP-322 should add a local-only MCP bridge CLI that can execute the existing guarded canary sequencer/executor path from the operator host, write a full result JSON artifact, and preserve the same one-gate-at-a-time and one-final-attempt boundaries without routing the final execution boundary through ChatGPT tools.
```

## Caveats

- This proposal does not execute the final runner-start attempt.
- The CLI implementation must not weaken existing approval, clearance, enablement, or sequencer gates.
- The first use of the CLI for the final attempt must use fresh short-lived artifacts.

## Boundaries

- No runner start endpoint contact by this checkpoint.
- No approval consumption by this checkpoint.
- No OpenCode start by this checkpoint.
- No canary execution by this checkpoint.
- The proposed CLI must call the guarded executor once per invocation and then stop.

## Non-Execution Boundary

```text
execution authorized: false
approval consumed: false
disable switch cleared: false
runner start endpoint contacted: false
OpenCode started: false
FP-027 canary run: false
```

## Expected Result

```text
FP-MCP-322 should add a local-only MCP bridge CLI that can execute the existing guarded canary sequencer/executor path from the operator host, write a full result JSON artifact, and preserve the same one-gate-at-a-time and one-final-attempt boundaries without routing the final execution boundary through ChatGPT tools.
```
