# FP-MCP-311 — Sequencer Follow-On Mismatch

## Checkpoint Type

```text
FAIL_CLOSED_HOLD
```

## Summary

The sequencer returned PREVIEW_CLEARANCE for FP-MCP-295 with FP-MCP-310 approval. The returned clearance preview tool was called and passed. The intended follow-on was clearance creation, but scoped enablement creation was selected instead. It refused with CLEARANCE_VALID_FAILED and CLEARANCE_ID_MATCHES_FAILED. No approval was consumed and no canary ran.

## Claim

```text
FP-MCP-311 confirmed the sequencer and clearance preview worked, then recorded that the wrong follow-on tool was selected. The wrong call refused and made no usable artifact.
```

## Caveats

- No fresh clearance was created.
- No scoped enablement was created.
- The canary did not run.
- Continuation must start from the sequencer again.

## Boundaries

- fail-closed hold
- no approval consumed
- no clearance created
- no enablement created
- no model run started

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
FP-MCP-311 confirmed the sequencer and clearance preview worked, then recorded that the wrong follow-on tool was selected. The wrong call refused and made no usable artifact.
```
