# FP-MCP-127 Guarded Preflight Report

Result: BLOCKED_BY_PLATFORM_TOOL_SAFETY

## Packet

- FP-MCP-127 — Human Approval Evidence Passing Preflight Test

## Packet Commit

- `c64284c Add FP-MCP-127 approval evidence preflight packet`

## Intended Read-Only Preflight Input

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approvalId": "APPROVAL-20260630T175528922Z-806b81c3"
}
```

## Approval Evidence Artifact

```text
approvalId: APPROVAL-20260630T175528922Z-806b81c3
path: runs/FP-MCP-126/approvals/APPROVAL-20260630T175528922Z-806b81c3.json
sha256: 482e7c13c3fda729bab0eada110b41199dc576be8a7b4112324f1ae4220a1fdb
createdByPacket: FP-MCP-126
```

## Observed Boundary

The ChatGPT Action call to the read-only preflight tool was blocked before reaching the MCP bridge.

Attempted tool:

```text
forgepilot_get_guarded_start_preflight_report
```

Attempted arguments:

```json
{
  "packetId": "FP-MCP-117",
  "requestId": "REQ-20260630T160920008Z-195b9969",
  "approvalId": "APPROVAL-20260630T175528922Z-806b81c3"
}
```

Observed result:

```text
This tool call was blocked by OpenAI's safety checks. Please double check what you are sending.
```

## Secondary Read-Only Observation Attempt

A second read-only attempt was made to read the approval artifact through the MCP file reader.

Attempted tool:

```text
forgepilot_read_file
```

Attempted path:

```text
runs/FP-MCP-126/approvals/APPROVAL-20260630T175528922Z-806b81c3.json
```

Observed result:

```text
This tool call was blocked by OpenAI's safety checks. Please double check what you are sending.
```

## Classification

This is classified as:

```text
BLOCKED_BY_PLATFORM_TOOL_SAFETY
```

This is not classified as:

```text
ForgePilot preflight failure
MCP bridge failure
runner failure
OpenCode failure
approval validation failure
approval consumption
execution attempt
```

## Important Boundary Distinction

The block occurred before the request reached the MCP bridge.

Therefore, FP-MCP-127 cannot honestly claim that the guarded preflight report evaluated the FP-MCP-126 approval artifact through the ChatGPT Action path.

## Safety State

Because the tool call was blocked before MCP execution:

```text
runner start endpoint: not contacted
OpenCode: not started
runnerRunId: not created
approval: not consumed
approval consumption evidence: not created
approval artifact: not mutated
request artifact: not mutated
execution: not enabled
start: not made callable
```

## Result

FP-MCP-127 did not produce the intended preflight report.

It did produce a valid platform-boundary observation:

```text
The ChatGPT Action path may block read-only approval-evidence preflight calls when a real-shaped approval artifact id is supplied.
```

## Follow-Up

A local or non-ChatGPT invocation path is required to evaluate this read-only preflight without platform Action safety interference.

Recommended next packet:

```text
FP-MCP-128 — Local Guarded Preflight Invocation Path Contract
```
