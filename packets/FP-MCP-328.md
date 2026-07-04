# FP-MCP-328 — Fresh Session Prior Block Characterization

## Checkpoint Type

```text
HOST_BLOCK_CHARACTERIZATION
```

## Summary

Record that prior ChatGPT-hosted MCP calls were blocked in a different session, while this fresh session can still record non-operational evidence.

## Claim

```text
Fresh-session MCP checkpoint recording remains allowed when documenting that a prior session experienced host tool-call blocks.
```

## Caveats

- This documents prior host behavior only.
- This does not retry the blocked operational path.
- This does not request any model or runner action.

## Boundaries

- No runner contact.
- No OpenCode start.
- No approval consumption.
- No control change.
- No token handling.

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
Fresh-session MCP checkpoint recording remains allowed when documenting that a prior session experienced host tool-call blocks.
```
