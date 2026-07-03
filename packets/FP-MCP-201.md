# FP-MCP-201 — Packet Checkpoint Tool Live Smoke Test and Terminal-to-Tool Promotion Rule

## Task

Run the newly exposed `forgepilot_record_packet_checkpoint` tool as a live non-executing smoke test and record the terminal-to-tool promotion rule.

## Result

The live smoke test did not complete successfully.

The tool was visible and callable through the refreshed MCP action surface, and it created partial packet/checkpoint artifacts. It then failed while trying to execute the evidence-recording step:

```text
spawn pnpm ENOENT
```

## Classification

```text
CHECKPOINT_TOOL_SMOKE_TEST_FAILED_RUNTIME_PATH
```

## Accurate Claim

```text
FP_MCP_201_PACKET_CHECKPOINT_TOOL_SMOKE_TEST_FAILED_PNPM_ENOENT
```

## What Passed

```text
tool visible in refreshed action surface: true
tool invocation reached MCP bridge: true
packet artifact written: true
structured checkpoint artifact written: true
result summary artifact written: true
verification artifact written: true
evidence script artifact written: true
```

## What Failed

```text
evidence script execution inside tool runtime: failed
failure reason: spawn pnpm ENOENT
evidence result artifact written by tool: false
commit completed by tool: false
post-tool clean state achieved by tool: false
```

## Interpretation

The failure indicates a runtime environment mismatch: the MCP service process could not spawn `pnpm`, even though terminal sessions can run `pnpm` successfully.

This is an implementation/environment bug in the checkpoint tool path, not an execution-gate event.

## Terminal-to-Tool Promotion Rule

Terminal commands remain valid for:

```text
exploration
debugging
inspection
development
recovery
one-off scaffolding
```

A repeated terminal workflow should become a candidate dedicated MCP tool when it is:

```text
repeated
stable
bounded
operationally meaningful
has clear inputs and outputs
has a clear fail-closed contract
```

If the workflow touches packet state, evidence state, admission state, approval state, execution gating, or repository commits, it should be packetized before becoming routine.

## Boundary

```text
execution authorized: false
approval consumed: false
disable switch cleared: false
runner start endpoint contacted: false
OpenCode started: false
FP-027 canary run: false
execution gate modified: false
approval artifact mutated: false
request artifact mutated: false
```

## Expected Result

```text
FP_MCP_201_PACKET_CHECKPOINT_TOOL_SMOKE_TEST_FAILED_PNPM_ENOENT
```
