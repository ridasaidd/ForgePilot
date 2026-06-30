# FP-MCP-093 — Committed Real Approval Evidence Revalidation

## Task

Revalidate the committed real human approval evidence artifact created by FP-MCP-092 without consuming approval, enabling execution, relaxing the disable switch, contacting the runner start endpoint, or starting OpenCode.

## Goal

Determine whether the FP-MCP-092 real approval evidence artifact becomes valid approval evidence after it has been committed.

This packet answers one question:

Does committed real approval evidence validate cleanly while remaining unconsumed and non-executing?

## Background

FP-MCP-092 created one scoped real human approval evidence artifact.

Created artifact:

- approvalId: APPROVAL-20260630T112307543Z-5f55a9ce
- approvalArtifactPath: runs/FP-MCP-092/approvals/APPROVAL-20260630T112307543Z-5f55a9ce.json
- approvalArtifactSha256: d2a88ef7dafbcfed7dbbbd2322cb5e7002ad9dcec885bf10c868388192a4b8de

Initial validation showed the artifact satisfied the real approval evidence contract except committed-artifact status.

Expected remaining blockers before commit were:

- APPROVAL_EVIDENCE_ARTIFACT_UNCOMMITTED
- APPROVAL_ARTIFACT_UNCOMMITTED

The artifact has now been committed.

The next smallest gate is to revalidate the committed approval evidence artifact.

## Scope

Allowed:

- Validate the committed FP-MCP-092 approval artifact.
- Record whether committed-artifact validation now passes.
- Record whether approval evidence is valid.
- Record whether approval remains unconsumed.
- Record whether execution remains blocked by independent gates.
- Record observations under `runs/FP-MCP-093/`.

Forbidden:

- Do not consume approval.
- Do not enable execution.
- Do not relax the global disable switch.
- Do not contact the runner start endpoint.
- Do not call `forgepilot_start_remote_runner_request`.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not mutate approval artifacts.
- Do not mutate request artifacts.
- Do not change production MCP behavior.

## Approval Artifact Under Test

- approvalPacketId: FP-MCP-092
- approvalId: APPROVAL-20260630T112307543Z-5f55a9ce
- approvalPath: runs/FP-MCP-092/approvals/APPROVAL-20260630T112307543Z-5f55a9ce.json

## Expected Scope

The approval must validate against this exact scope:

- packetId: FP-MCP-036
- requestId: REQ-20260630T094727908Z-630a4f0d
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY
- repoCommit: dbeded5
- branch: main

## Required Observation

Record:

- approval validation result
- approval evidence validity
- approval usability for execution
- committed artifact status
- exact validation checks
- validation reasons, if any
- consumption evidence state
- execution safety fields
- disable switch state if surfaced
- whether execution remains blocked

## Required Safety Results

Verification must show:

- approvalConsumed: false
- executionAllowedNow: false unless independently blocked state is explicitly explained
- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- no runner run id created
- no approval mutation

## Evidence

Record:

- `runs/FP-MCP-093/committed-approval-revalidation.md`
- `runs/FP-MCP-093/verification.txt`

## Success Criteria

This packet is successful if:

1. The committed FP-MCP-092 approval artifact is revalidated.
2. The committed-artifact blocker is resolved or explicitly remains with evidence.
3. Approval consumption remains false.
4. No execution is started.
5. No runner start endpoint is contacted.
6. No approval artifact is mutated.
7. The next smallest gate is identified.

## Non-goals

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable execution.

This packet does not start OpenCode.

This packet does not perform a remote runner start.

This packet does not admit model output.
