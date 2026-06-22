# FP-MCP-059 — Human Approval Evidence Contract

## Status

DRAFT

## Type

Contract / documentation only.

## Purpose

Define what counts as valid human approval evidence before any future ForgePilot MCP start request can be considered eligible to proceed.

This packet does **not** enable execution. It does **not** contact the runner start endpoint. It does **not** start OpenCode. It does **not** create approval artifacts. It only defines the contract that future validation and dry-run recording tools must enforce.

## Context

The execution safety boundary currently requires all of the following before the start path may proceed:

1. A valid OpenCode run request artifact.
2. A valid remote runner request envelope.
3. Execution enablement policy evaluation.
4. Global execution disable switch evaluation.
5. Valid pre-start evidence.
6. Valid start request state snapshots.

FP-MCP-059 adds the next missing safety concept:

> A start request must not proceed merely because machine-readable gates are satisfied. It must also have explicit, scoped, recent, and auditable human approval evidence.

Human approval is an observation. It is not execution capability. It is not trust by itself. It is not stronger than the execution disable switch.

## Governing Principles

This packet is constrained by the ForgePilot principles:

- P01 — ForgePilot records observations, not narratives.
- P02 — Trust cannot be retroactively created.
- P03 — ForgePilot does not optimize for favorable outcomes.
- P04 — Only admitted evidence may influence observatory outputs.
- P06 — Classification follows observation.

## Non-Goals

This packet must not:

- enable execution
- start OpenCode
- contact the runner start endpoint
- mutate an existing request artifact
- infer approval from conversational intent
- infer approval from the existence of a packet
- infer approval from successful validation of other gates
- create a human approval evidence artifact
- implement a validator
- implement a recorder
- implement start-path enforcement
- add routing, ranking, model selection, or cost policy

## Core Rule

A future start request may only treat human approval as valid when there is an explicit approval evidence artifact bound to the exact request being evaluated.

The approval must be:

1. **Explicit** — recorded from a human-provided approval string.
2. **Scoped** — bound to packet id, request id, model id, run mode, and base commit.
3. **Fresh** — recorded within a defined validity window.
4. **Single-use for execution admission** — it may authorize at most one accepted start transition.
5. **Revocable** — later revocation or quarantine observations must defeat it.
6. **Subordinate to the disable switch** — approval cannot override a disabled execution boundary.
7. **Evidence-bearing** — future tools must record enough provenance to audit who approved what, when, and for which request.

## Required Approval String

The approval string must have one canonical form:

```text
APPROVE_FORGEPILOT_START packet=<packetId> request=<requestId> model=<modelId> mode=<runMode> baseCommit=<baseCommitSha>
```

Example:

```text
APPROVE_FORGEPILOT_START packet=FP-MCP-036 request=REQ-20260622T144553300Z-fbbe8d82 model=qwen-3.7-max mode=DESIGN_ONLY baseCommit=ee747ee
```

The approval string is case-sensitive. Field names are case-sensitive. Field order is fixed. Future validators must reject approval strings that require interpretation, normalization beyond whitespace trimming, or semantic guessing.

## Approval Scope

Human approval evidence is valid only for the exact tuple below:

```text
packetId
requestId
modelId
runMode
baseCommitSha
```

A mismatch in any field invalidates the approval for the evaluated start request.

Approval for one request must not be reused for another request. Approval for one model must not be reused for another model. Approval for one run mode must not be reused for another run mode. Approval for one base commit must not be reused after the repository base changes.

## Allowed Run Mode

At the time this contract is defined, the only allowed run mode is:

```text
DESIGN_ONLY
```

Future validators must reject approval evidence for any run mode that is not currently allowed by the execution boundary.

## Who May Provide Approval

Approval must originate from an authenticated human operator.

A future recorder may record approval evidence only when the human operator has provided the canonical approval string. The recorder must not synthesize, complete, or repair the approval string on behalf of the operator.

The following must not count as human approval:

- model-generated text
- assistant-generated text
- inferred user intent
- a packet entering READY state
- a passing preflight result
- a valid request artifact
- a valid state snapshot
- a valid pre-start evidence artifact
- prior approval of another request
- approval copied from documentation examples

## Future Approval Evidence Artifact

A future human approval evidence artifact must contain at least the following fields:

```json
{
  "artifactVersion": "human-approval-evidence-v1",
  "boundaryVersion": "FP-MCP-059",
  "packetId": "FP-MCP-036",
  "requestId": "REQ-20260622T144553300Z-fbbe8d82",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "baseCommitSha": "ee747ee",
  "approvalText": "APPROVE_FORGEPILOT_START packet=FP-MCP-036 request=REQ-20260622T144553300Z-fbbe8d82 model=qwen-3.7-max mode=DESIGN_ONLY baseCommit=ee747ee",
  "approvalTextSha256": "<sha256-of-approvalText>",
  "approvedByPrincipal": "<authenticated-human-principal>",
  "approvalSource": "chatgpt-mcp-human-operator",
  "approvedAt": "<iso8601-utc-timestamp>",
  "expiresAt": "<iso8601-utc-timestamp>",
  "singleUse": true,
  "consumed": false,
  "revoked": false,
  "quarantined": false,
  "requestArtifactPath": "<path-to-request-artifact>",
  "preStartEvidenceAttemptId": "<attempt-id-or-null>",
  "stateSnapshotAttemptId": "<attempt-id-or-null>",
  "disableSwitchObserved": true,
  "disableSwitchActiveAtApproval": true,
  "runnerContacted": false,
  "startEndpointContacted": false,
  "executionStarted": false,
  "opencodeStarted": false,
  "recordedByTool": "<future-tool-name>",
  "recordedByToolVersion": "<future-tool-version>"
}
```

The artifact must record observations as they were seen at approval-recording time. It must not claim that execution became enabled. It must not claim that the runner start endpoint was contacted. It must not claim that OpenCode started.

## Expiration

Human approval evidence must have an explicit `expiresAt` timestamp.

A future validator must reject approval evidence when:

- `expiresAt` is missing
- `expiresAt` is not a valid UTC timestamp
- `expiresAt` is earlier than or equal to `approvedAt`
- the current validation time is later than `expiresAt`
- the validity window exceeds the maximum allowed approval lifetime

The maximum approval lifetime for this contract is:

```text
30 minutes
```

Expiration does not delete or mutate the artifact. Expiration only changes whether the artifact may be considered valid for a future start decision.

## Single-Use Behavior

Human approval evidence must be single-use for execution admission.

A future start path may evaluate an approval artifact multiple times while it remains unconsumed, but the approval must authorize at most one accepted start transition.

Consumption must be recorded as an observation. Consumption must not mutate the original approval artifact unless a future packet explicitly defines a safe append-only mechanism for doing so.

If a start request is blocked before the runner start endpoint is contacted because the disable switch is active, the approval should not be considered consumed by execution. A future packet must define the exact consumption ledger before execution is enabled.

## Revocation and Quarantine

A future system must support approval revocation and approval quarantine as observations.

Revocation should be used when the human operator withdraws approval.

Quarantine should be used when the approval artifact is suspected to be unsafe, stale, copied, malformed, generated by a model, inconsistent with the request, or otherwise unsuitable as evidence.

A revoked or quarantined approval must not satisfy the human approval gate.

Revocation or quarantine must not delete the original approval artifact. They must be appended as later observations.

## Relationship to the Disable Switch

The global execution disable switch dominates human approval.

If the disable switch is active, a valid approval artifact must not allow execution to proceed.

A start request with valid human approval and an active disable switch must report a blocked state equivalent to:

```text
humanApprovalEvaluated: true
humanApprovalValid: true
started: false
accepted: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
opencodeStarted: false
disableSwitchActive: true
effectiveDisableReason: EXECUTION_DISABLED_GLOBAL
```

Human approval is necessary but never sufficient.

## Relationship to Pre-Start Evidence

Human approval does not replace pre-start evidence.

A valid human approval artifact must be evaluated alongside valid pre-start evidence. If pre-start evidence is missing, incomplete, stale, malformed, or invalid, the start path must remain blocked even when human approval is valid.

## Relationship to State Snapshots

Human approval does not replace start request state snapshots.

A valid human approval artifact must be evaluated alongside valid pre/post state snapshot evidence. If required snapshots are missing, incomplete, stale, malformed, or invalid, the start path must remain blocked even when human approval is valid.

## Invalid Approval Cases

A future validator must reject approval evidence when any of the following are true:

1. Approval text is missing.
2. Approval text is not in canonical form.
3. Approval text has the wrong packet id.
4. Approval text has the wrong request id.
5. Approval text has the wrong model id.
6. Approval text has the wrong run mode.
7. Approval text has the wrong base commit.
8. Approval text uses an unsupported run mode.
9. Approval text appears to be model-generated.
10. Approval text is copied from a packet example instead of provided for the evaluated request.
11. Approval artifact is expired.
12. Approval artifact has no expiration.
13. Approval artifact has an invalid expiration window.
14. Approval artifact is already consumed for execution admission.
15. Approval artifact is revoked.
16. Approval artifact is quarantined.
17. Approval artifact lacks authenticated human principal provenance.
18. Approval artifact lacks recorder provenance.
19. Approval artifact claims execution started during approval recording.
20. Approval artifact claims the runner start endpoint was contacted during approval recording.
21. Approval artifact conflicts with request artifact contents.
22. Approval artifact conflicts with observed repository base commit.

## Required Future Tool Behavior

Future packets should implement this contract in stages:

1. Human approval evidence validation tool.
2. Human approval evidence dry-run recorder.
3. Start request human approval gate enforcement.
4. Negative approval tests.
5. Consumption/revocation/quarantine ledger, if needed before execution is enabled.

Each stage must preserve the current safety boundary:

```text
No execution enabled.
Runner start endpoint not contacted.
OpenCode not started.
```

## Acceptance Criteria

This packet is accepted when:

1. `packets/FP-MCP-059.md` exists.
2. The packet defines the canonical approval string.
3. The packet defines required approval scope fields.
4. The packet defines who may provide approval.
5. The packet defines invalid approval cases.
6. The packet defines expiration behavior.
7. The packet defines single-use behavior.
8. The packet defines revocation and quarantine behavior.
9. The packet defines relationship to the global disable switch.
10. The packet defines relationship to pre-start evidence.
11. The packet defines relationship to state snapshots.
12. The packet explicitly states that it does not enable execution, contact the runner start endpoint, or start OpenCode.
13. The ForgePilot repository remains clean after commit.
14. `forgepilot_status` reports the expected branch and commit after commit.
15. `forgepilot_get_opencode_status` continues to report `opencodeExecutionEnabled: false`.

## Verification Commands

```bash
cd /home/ridasaidd/forgepilot

git status --short
test -f packets/FP-MCP-059.md

grep -n "APPROVE_FORGEPILOT_START" packets/FP-MCP-059.md
grep -n "No execution enabled" packets/FP-MCP-059.md
grep -n "Runner start endpoint not contacted" packets/FP-MCP-059.md
grep -n "OpenCode not started" packets/FP-MCP-059.md

git log --oneline -5
```

Then verify through MCP:

```text
forgepilot_status
forgepilot_get_opencode_status
```

## Expected Safety Result

The expected safety result after this packet is committed is:

```text
executionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
runnerContacted: false
startEndpointContacted: false
opencodeStarted: false
```

## Next Packets

Likely follow-up packets:

```text
FP-MCP-060 — Human Approval Evidence Validation Tool
FP-MCP-061 — Human Approval Evidence Dry-Run Recorder
FP-MCP-062 — Start Request Human Approval Gate Enforcement
```
