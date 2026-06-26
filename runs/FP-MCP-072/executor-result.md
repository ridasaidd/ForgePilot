# FP-MCP-072 Executor Result — Consumed Approval Validator Enforcement

## Packet

FP-MCP-072 — Consumed Approval Validator Enforcement

## Result

SUCCESS

## Scope

This run validated that an existing append-only approval consumption evidence artifact causes future validation of the consumed approval to fail without mutating the original approval artifact and without enabling or starting execution.

## Inputs

- Approval packet id: `FP-MCP-069`
- Approval id: `APPROVAL-20260623T111242963Z-78f7e740`
- Expected request packet id: `FP-MCP-036`
- Expected request id: `REQ-20260622T144553300Z-fbbe8d82`
- Expected model id: `qwen-3.7-max`
- Expected run mode: `DESIGN_ONLY`
- Expected repository commit: `40b53dc`
- Expected branch: `main`

## Environment observations

- ForgePilot repository: `/home/ridasaidd/forgepilot`
- ForgePilot branch before validation: `main`
- ForgePilot commit before validation: `8e5e771`
- ForgePilot working tree before validation: clean
- Bridge repository: `/home/ridasaidd/forgepilot-chatgpt-mcp`
- Bridge commit containing validator change: `9e7f336`
- Bridge build command previously verified: `pnpm run build`
- Bridge build output: `tsc`
- MCP bridge service previously observed: `forgepilot-chatgpt-mcp-oauth.service` active/running
- MCP bridge listener previously observed: `http://0.0.0.0:8790/mcp`

## MCP validator probe

Tool used:

```text
forgepilot_validate_human_approval_record
```

The validator returned:

- `schemaVersion`: `FP-MCP-072`
- `validatorBoundaryVersion`: `FP-MCP-072`
- `approvalEvidenceValid`: `false`
- `approvalValid`: `false`
- `approvalUsableForExecution`: `false`
- `approvalConsumed`: `true`
- `consumptionEvidenceEvaluated`: `true`
- `consumptionEvidencePresent`: `true`
- `consumptionEvidenceValid`: `true`
- `consumptionEvidenceId`: `CONSUMPTION-20260623T111327467Z-0cfc7dee`
- `consumptionEvidencePath`: `runs/FP-MCP-071/approval-consumptions/CONSUMPTION-20260623T111327467Z-0cfc7dee.json`
- `approvalMutated`: `false`
- `executionAllowedNow`: `false`
- `executionStarted`: `false`
- `startEndpointContacted`: `false`
- `opencodeStarted`: `false`
- `reasons`: `APPROVAL_EXPIRED`, `APPROVAL_CONSUMED`

## Acceptance criteria result

PASS. FP-MCP-072 validator enforcement rejects a consumed approval using existing append-only FP-MCP-071 consumption evidence.

## Safety observations

- No new consumption evidence was created.
- The FP-MCP-069 approval artifact was not mutated.
- Execution was not enabled.
- OpenCode was not started.
- The runner start endpoint was not contacted.
