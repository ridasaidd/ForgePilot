# FP-MCP-331 — Fresh Session Approval Recording Probe

## Result

A fresh ChatGPT session successfully invoked the real human approval evidence recorder.

The first attempt was rejected by ForgePilot because the approval text was not canonical.

The second attempt used canonical approval text and recorded approval evidence.

## Recorded Approval

Approval id:

- APPROVAL-20260704T205936956Z-1d134e12

Approval artifact:

- runs/FP-MCP-331/approvals/APPROVAL-20260704T205936956Z-1d134e12.json

Approval artifact sha256:

- d9bb7b27297b7032f3f4a61843e6d70c8a1e4be35e6446ccbe83c43943e1e37f

## Boundary

The approval was not consumed.

Execution was not allowed.

The runner start endpoint was not contacted.

OpenCode was not started.

No clearance, enablement, guarded apply, runner start, OpenCode start, or token-handling tool was called.

## Observation

The approval recorder wrote the approval artifact but did not commit or admit it. The working tree became dirty with:

- runs/FP-MCP-331/

## Interpretation

The ChatGPT host boundary is not at approval recorder invocation or valid approval artifact creation.
