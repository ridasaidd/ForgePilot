# FP-MCP-329 — Fresh Session Real Tuple Readonly Sequencer

## Checkpoint Type

```text
HOST_BOUNDARY_CHARACTERIZATION
```

## Summary

Record that the real execution packet id, request id, execution base commit, model id, and run mode did not trigger a host block when used in the read-only sequencer from a fresh session with a synthetic approval id.

## Claim

```text
A fresh ChatGPT session can call the read-only guarded sequencer with the real FP-MCP-295 request tuple and receive RECORD_APPROVAL without host blocking.
```

## Caveats

- This did not record approval.
- This did not clear controls.
- This did not call guarded apply.
- This did not contact the runner start endpoint.
- This did not start OpenCode.

## Boundaries

- Read-only sequencer observation only.
- Synthetic approval id was used.
- No operational action was requested.

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
A fresh ChatGPT session can call the read-only guarded sequencer with the real FP-MCP-295 request tuple and receive RECORD_APPROVAL without host blocking.
```
