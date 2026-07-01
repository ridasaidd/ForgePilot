# FP-MCP-142 — Controlled DESIGN_ONLY Execution Enablement

## Task

Enable the first controlled guarded execution path for ForgePilot using the existing target-bound FP-MCP-134 request and fresh FP-MCP-141 approval.

## Goal

Move ForgePilot from evidence-only guarded preflight into one controlled `DESIGN_ONLY` execution attempt, without weakening target binding, approval binding, evidence recording, or post-run observability.

This packet answers one question:

Can ForgePilot safely transition from "all prerequisite evidence gates pass" to "one guarded DESIGN_ONLY execution attempt is allowed and recorded"?

## Background

ForgePilot has reached the point where further pre-execution scaffolding is no longer useful unless it enables real work.

The current targeted request evidence chain is:

```text
requestArtifact: PASSED
preStartEvidence: PASSED
stateSnapshotEvidence: PASSED
humanApprovalEvidence: PASSED
evidenceLedgerReadiness: PASSED
```

The remaining blockers are operational enablement gates:

```text
disableSwitch: FAILED
runnerCapabilityState: FAILED
opencodeReadiness: FAILED
```

These blockers were intentional while ForgePilot built evidence discipline.

The relevant request is:

```text
packetId: FP-MCP-134
requestId: REQ-20260630T202005438Z-86d20df4
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
targetExecutionCommit: bbf930a
approvedTargetExecutionCommit: bbf930a
```

The fresh approval is:

```text
packetId: FP-MCP-141
approvalId: APPROVAL-20260701T091652051Z-620f9f99
scope.packetId: FP-MCP-134
scope.requestId: REQ-20260630T202005438Z-86d20df4
scope.modelId: deepseek-v4-pro-high
scope.runMode: DESIGN_ONLY
scope.branch: main
scope.repoCommit: bbf930a
scope.approvedTargetExecutionCommit: bbf930a
approvalConsumed: false
```

## Decision

FP-MCP-142 intentionally changes the project posture:

```text
from: evidence-only guarded preflight
to: one controlled guarded DESIGN_ONLY execution attempt
```

This is not a general execution unlock.

This packet may enable execution only for:

```text
requestId: REQ-20260630T202005438Z-86d20df4
approvalId: APPROVAL-20260701T091652051Z-620f9f99
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
targetExecutionCommit: bbf930a
```

The execution path must remain guarded by:

```text
request artifact validation
target execution commit binding
fresh human approval evidence
approval not consumed before start
pre-start evidence
state snapshot evidence
evidence ledger readiness
runner capability check
OpenCode readiness check
post-start evidence recording
approval consumption evidence
runner run id recording
```

## Scope

Allowed:

- Inspect current bridge and runner enablement code.
- Remove or narrow the global disable switch only for this targeted `DESIGN_ONLY` execution path.
- Make the guarded start capability callable only after all evidence gates pass.
- Add `start` or equivalent guarded start operation to supported operations only if guarded by the same preflight checks.
- Contact the runner start endpoint only after the guarded preflight passes.
- Start OpenCode only through the guarded start path.
- Consume the fresh FP-MCP-141 approval exactly once if the start attempt is made.
- Record approval consumption evidence.
- Record runner run id if returned.
- Record post-start execution evidence.
- Record success/failure honestly.
- Commit bridge changes and ForgePilot evidence.

Forbidden:

- Do not mutate the FP-MCP-134 request artifact.
- Do not mutate the expired FP-MCP-135 approval artifact.
- Do not mutate the fresh FP-MCP-141 approval artifact.
- Do not mutate FP-MCP-139 pre-start evidence.
- Do not mutate FP-MCP-140 state snapshot evidence.
- Do not allow execution for any request other than `REQ-20260630T202005438Z-86d20df4`.
- Do not allow any run mode other than `DESIGN_ONLY`.
- Do not allow any model other than `deepseek-v4-pro-high` for this first attempt.
- Do not allow execution at any commit other than target commit `bbf930a`.
- Do not bypass evidence ledger readiness.
- Do not bypass human approval evidence.
- Do not bypass approval single-use semantics.
- Do not convert this into general autonomous execution.
- Do not enable broad `/runner/start-run` access without guarded preflight.
- Do not run arbitrary shell commands from model output.
- Do not pass secrets to OpenCode.
- Do not continue to further starts after the first controlled attempt without a new packet.

## Required Execution Boundary

The runner start path may become callable only if all of the following are true:

```text
requestArtifact: PASSED
commitBinding: PASSED
modelAndRunMode: PASSED
preStartEvidence: PASSED
stateSnapshotEvidence: PASSED
humanApprovalEvidence: PASSED
evidenceLedgerReadiness: PASSED
disableSwitch: clear for this exact request
runnerCapabilityState: start callable for guarded DESIGN_ONLY
opencodeReadiness: configured for DESIGN_ONLY
```

The first execution attempt must be bounded to:

```text
runMode: DESIGN_ONLY
modelId: deepseek-v4-pro-high
targetExecutionCommit: bbf930a
```

## Required Evidence

Record:

```text
runs/FP-MCP-142/execution-enablement-plan.md
runs/FP-MCP-142/pre-execution-preflight-report.json
runs/FP-MCP-142/pre-execution-preflight-report.md
runs/FP-MCP-142/execution-attempt-result.json
runs/FP-MCP-142/execution-attempt-result.md
runs/FP-MCP-142/approval-consumption-evidence.json
runs/FP-MCP-142/post-execution-verification.txt
```

If execution cannot be enabled safely, record:

```text
runs/FP-MCP-142/execution-blocker-report.md
runs/FP-MCP-142/verification.txt
```

and do not force execution.

## Success Criteria

This packet is successful if one of these outcomes occurs:

### Outcome A — Controlled execution attempt recorded

1. Guarded preflight passes for the exact target-bound request.
2. Start becomes callable only through the guarded path.
3. One `DESIGN_ONLY` execution attempt is made.
4. OpenCode starts only through the guarded path.
5. Approval is consumed exactly once.
6. Runner run id is recorded if produced.
7. Execution result is recorded.
8. Bridge and ForgePilot evidence are committed.
9. No broad/general execution unlock is introduced.

### Outcome B — Honest blocker recorded

1. The exact blocker to safe execution is identified.
2. No execution attempt is made.
3. No approval is consumed.
4. No request or approval artifacts are mutated.
5. Evidence is recorded and committed.

## Non-goals

This packet does not enable general execution.

This packet does not enable autonomous execution.

This packet does not allow arbitrary run modes.

This packet does not allow arbitrary models.

This packet does not remove approval requirements.

This packet does not remove evidence ledger requirements.

This packet does not skip post-run evidence.

This packet does not perform repeated execution attempts.

This packet does not continue beyond the first controlled `DESIGN_ONLY` attempt.
