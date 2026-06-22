# Execution Enablement Policy

## Status

This document defines future execution enablement conditions only.

It does not enable execution.

It does not authorize execution.

It does not permit OpenCode invocation.

It does not permit runner shell execution.

Execution remains disabled until a later ForgePilot packet explicitly implements enablement after all required gates pass.

## Purpose

ForgePilot has reached the point where it can produce and verify non-executing execution-shaped evidence.

The system can now:

```text
create request artifacts
validate request lifecycle
evaluate guarded execution preflight
record non-executing dry-run artifacts
verify dry-run artifacts
prove execution did not start
```

This policy defines what must be true before ForgePilot may ever move from non-executing dry-run evidence to real remote runner execution.

## Current Classification

Current state:

```text
executionEnablementPolicyDefined: true
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
```

Current reasons:

```text
EXECUTION_POLICY_DEFINED_ONLY
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
HUMAN_APPROVAL_NOT_RECORDED
RUNNER_EXECUTION_CAPABILITY_NOT_PRESENT
```

This is the expected safe state.

## Non-Authorization Rule

The following do not authorize execution by themselves:

```text
this policy document
a committed packet
a clean repository
a successful preflight
a successful dry-run
a successful dry-run verification
runner reachability
OpenCode discovery
model allowlist membership
run mode allowlist membership
```

Execution authorization requires all enablement gates plus explicit human approval and a later implementation packet.

## Policy Model

Execution enablement requires all layers below:

```text
1. Contract completeness
2. Dry-run evidence
3. Verification evidence
4. Repository state
5. Runner state
6. OpenCode boundary state
7. Secret boundary
8. Network boundary
9. Human approval
10. Rollback / disable path
11. Audit / admission path
```

No single layer may imply execution authorization.

No layer may override a failed layer.

If any layer fails, execution remains disabled.

## Gate 1 — Contract Completeness

Execution must not be enabled unless these contracts exist and are committed:

```text
docs/guarded-execution-preflight-contract.md
docs/execution-artifact-contract.md
docs/execution-enablement-policy.md
```

Required tools must exist before future enablement:

```text
forgepilot_validate_execution_preflight
forgepilot_record_execution_artifact_dry_run
forgepilot_verify_execution_artifact_dry_run
```

Contract completeness means the system has written standards.

It does not mean execution is allowed.

## Gate 2 — Dry-Run Evidence

Execution must not be enabled unless at least one committed dry-run has produced contract-shaped non-execution artifacts:

```text
preflight-result.json
start-request.json
runner-acceptance.json
artifact-manifest.json
```

The dry-run evidence must show:

```text
dryRunRecorded: true
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
reasons:
- EXECUTION_DISABLED
```

Dry-run evidence proves that the artifact boundary can be recorded safely.

It does not prove that real execution is safe.

## Gate 3 — Verification Evidence

Execution must not be enabled unless dry-run artifacts have been verified by the verifier tool.

Required verifier result:

```text
verified: true
requiredArtifactsPresent: true
forbiddenArtifactsAbsent: true
jsonArtifactsValid: true
manifestValid: true
manifestHashesValid: true
packetRequestConsistent: true
dryRunConsistent: true
reasonConsistent: true
boundaryConsistent: true
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

Verification evidence proves the dry-run artifact set is internally consistent.

It does not authorize real execution.

## Gate 4 — Repository State

Execution must not be enabled unless:

```text
ForgePilot repository is on the expected branch
working tree is clean
all relevant packet files are committed
all relevant docs are committed
all relevant verification artifacts are committed
request artifact is committed
dry-run artifacts are committed
verifier output is committed or reproducible
current commit is recorded
```

Execution must not be enabled from an uncommitted working tree.

Execution must not be enabled from an unknown commit.

Execution must not be enabled from an ambiguous branch state.

## Gate 5 — Runner State

Execution must not be enabled unless the runner reports:

```text
runnerConfigured: true
runnerReachable: true
runnerProtocolVersion: forgepilot-runner-v1
supportedOperations includes required future execution operation
supportedRunModes includes intended run mode
allowedModels includes intended model
```

Current runner state intentionally does not satisfy execution enablement because the current runner exposes only:

```text
capabilities
validate-request
```

A future execution-capable runner must expose an explicit execution operation in capabilities.

Runner reachability alone is not enough.

A runner that can validate requests is not necessarily a runner that may execute requests.

## Gate 6 — OpenCode Boundary State

Execution must not be enabled unless OpenCode boundary checks prove:

```text
OpenCode executable path is explicitly configured
allowed models are explicitly configured
allowed run modes are explicitly configured
non-interactive execution mode is defined
working directory restrictions are defined
environment variable restrictions are defined
stdout capture is defined
stderr capture is defined
timeout behavior is defined
exit-code handling is defined
failure artifact behavior is defined
```

Current OpenCode status intentionally remains:

```text
opencodeExecutionEnabled: false
```

OpenCode discovery is not OpenCode authorization.

## Gate 7 — Secret Boundary

Execution must not be enabled unless secret handling is explicitly defined and verified.

Required conditions:

```text
secrets are never committed
request artifacts do not contain tokens
execution artifacts do not contain tokens
logs redact known secret patterns
environment variables passed to executor are allowlisted
provider credentials are stored outside the repository
secret redaction failure is a hard block
```

Forbidden:

```text
writing API keys to request artifacts
writing API keys to execution artifacts
writing OAuth tokens to logs
passing full ambient environment into execution
committing .env files
committing provider credentials
```

If secret boundary verification fails, execution must remain disabled.

## Gate 8 — Network Boundary

Execution must not be enabled unless network exposure is explicitly constrained.

Required conditions:

```text
runner remains private
runner start endpoint is not publicly exposed
bridge-to-runner endpoint is configured intentionally
public MCP bridge never exposes raw shell execution
public MCP bridge never exposes arbitrary command execution
runner rejects unknown packet ids
runner rejects unknown request ids
runner rejects uncommitted request artifacts
```

The public bridge must not become a public shell proxy.

The runner must remain a private execution plane.

## Gate 9 — Human Approval

Execution must not be enabled without explicit human approval.

Required approval model:

```text
approval token must be exact
approval must name the packet id
approval must name the request id
approval must name the model id
approval must name the run mode
approval must be recorded
approval must be tied to a commit
approval must be single-use or auditable
```

Documentation alone is not approval.

Dry-run verification alone is not approval.

A successful preflight alone is not approval.

Human approval must be explicit, scoped, and recorded.

## Gate 10 — Rollback / Disable Path

Execution must not be enabled unless there is a documented disable path.

Required disable behavior:

```text
one configuration switch disables execution
disabled state blocks start endpoint
disabled state blocks OpenCode invocation
disabled state still allows read-only status checks
disabled state still allows dry-run verification
disable event is recorded
post-disable verification confirms executionStarted false
```

Rollback must be simpler than enablement.

If disabling execution requires complex manual repair, execution must not be enabled.

## Gate 11 — Audit / Admission Path

Execution must not be enabled unless real execution artifacts have a future audit and admission path.

Required real-run artifacts:

```text
preflight-result.json
start-request.json
runner-acceptance.json
execution-start.json
stdout.txt
stderr.txt
execution-result.json
artifact-manifest.json
```

If execution fails after start, required failure artifact:

```text
execution-failure.json
```

Execution is not admission.

Execution produces observations.

Admission decides whether observations may become evidence.

Real execution evidence must not be admitted automatically.

## Enablement Decision Rule

Execution may only be enabled if all gates are true:

```text
contractComplete: true
dryRunEvidencePresent: true
dryRunVerified: true
repoClean: true
runnerExecutionCapabilityPresent: true
opencodeBoundarySatisfied: true
secretBoundarySatisfied: true
networkBoundarySatisfied: true
humanApprovalRecorded: true
disablePathDefined: true
auditAdmissionPathDefined: true
```

If any field is false, execution remains disabled.

## Current Gate Evaluation

Current expected policy evaluation:

```text
contractComplete: true
dryRunEvidencePresent: true
dryRunVerified: true
repoClean: true
runnerExecutionCapabilityPresent: false
opencodeBoundarySatisfied: false
secretBoundarySatisfied: not yet fully evaluated for execution
networkBoundarySatisfied: partially defined, execution exposure still disabled
humanApprovalRecorded: false
disablePathDefined: policy-defined only
auditAdmissionPathDefined: policy-defined only
```

Therefore:

```text
executionAllowedNow: false
```

## Required Future Enablement Packet

A future packet that enables execution must include:

```text
packet id
request id
model id
run mode
target branch
current commit
approval record
preflight result
dry-run verification result
runner capability result
OpenCode boundary result
secret boundary result
network boundary result
disable switch proof
artifact recording proof
failure handling proof
rollback verification proof
```

The enablement packet must fail if any prerequisite is missing.

## Hard Blocks

Execution must remain disabled if any condition below is observed:

```text
working tree dirty
request artifact uncommitted
dry-run artifacts missing
dry-run verifier fails
runner does not advertise execution capability
OpenCode execution boundary not satisfied
secret boundary not satisfied
network exposure ambiguous
human approval missing
disable path missing
audit path missing
unknown model id
unknown run mode
unknown packet id
unknown request id
runner public exposure detected
start endpoint reachable from untrusted boundary
```

## Reason Codes

Current successful policy-definition reason codes:

```text
EXECUTION_POLICY_DEFINED_ONLY
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
HUMAN_APPROVAL_NOT_RECORDED
RUNNER_EXECUTION_CAPABILITY_NOT_PRESENT
```

Future block reason codes should include:

```text
CONTRACT_INCOMPLETE
DRY_RUN_EVIDENCE_MISSING
DRY_RUN_VERIFICATION_FAILED
REPO_STATE_INVALID
RUNNER_EXECUTION_CAPABILITY_MISSING
OPENCODE_BOUNDARY_UNSATISFIED
SECRET_BOUNDARY_UNSATISFIED
NETWORK_BOUNDARY_UNSATISFIED
HUMAN_APPROVAL_MISSING
DISABLE_PATH_MISSING
AUDIT_ADMISSION_PATH_MISSING
```

## Non-Regression Requirements

Future work must preserve the ability to prove:

```text
execution was not enabled
execution was not permitted
start endpoint was not contacted
OpenCode was not started
shell execution did not occur
forbidden artifacts were absent
```

until a future packet explicitly changes those states.

## Summary

This policy defines future enablement conditions only.

It does not enable execution.

It does not authorize execution.

It does not permit OpenCode invocation.

It does not permit runner shell execution.

Current correct state remains:

```text
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
```
