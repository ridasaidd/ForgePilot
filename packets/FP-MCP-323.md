# FP-MCP-323 — Local Client Preparation Plan

## Checkpoint Type

```text
LOCAL_PREPARATION_PLAN
```

## Summary

Current clean state was observed: ForgePilot core is clean at fce74cd and the MCP bridge is clean on feature/oauth-auth0 at 11d4490. The next work should prepare fresh, short-lived operator artifacts and a local input file for the existing local client script. The local client script should be run by the operator outside ChatGPT when the operator is ready.

## Claim

```text
FP-MCP-323 will prepare local-operator artifacts for the next guarded handoff step using the committed FP-MCP-322 local client script, while keeping ChatGPT on non-executing preparation only.
```

## Caveats

- This checkpoint does not run the local client script.
- Fresh short-lived artifacts are required before any local operator run.
- ChatGPT should remain on preparation, validation, and evidence recording only.

## Boundaries

- No local client invocation by this checkpoint.
- No approval consumption by this checkpoint.
- No OpenCode start by this checkpoint.
- No canary run by this checkpoint.

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
FP-MCP-323 will prepare local-operator artifacts for the next guarded handoff step using the committed FP-MCP-322 local client script, while keeping ChatGPT on non-executing preparation only.
```
