# FP-MCP-038 — Execution Enablement Policy Contract

## Task

Define the policy contract that must be satisfied before ForgePilot remote runner execution may ever be enabled.

## Goal

Create a non-executing, documentation-only policy contract for future execution enablement.

FP-MCP-038 answers one question:

**What conditions must be true before ForgePilot is allowed to move from non-executing dry-run evidence to real remote runner execution?**

This packet must not enable execution.

The expected current result is:

```text
executionEnablementPolicyDefined: true
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
```

This is a successful result.

---

## Background

ForgePilot now has a staged non-executing execution boundary:

```text
FP-MCP-028 — request artifact lifecycle validation fixed
FP-MCP-029 — guarded start non-execution verified
FP-MCP-030 — structured rejection reason preserved
FP-MCP-031 — runner start response contract documented
FP-MCP-032 — state artifact status vocabulary aligned
FP-MCP-033 — guarded execution preflight contract documented
FP-MCP-034 — non-executing preflight validation tool implemented
FP-MCP-035 — execution artifact contract documented
FP-MCP-036 — non-executing execution artifact dry-run implemented
FP-MCP-037 — dry-run artifact verification tool implemented
```

The system can now:

```text
create request artifacts
validate request lifecycle
evaluate guarded execution preflight
record non-executing dry-run artifacts
verify dry-run artifacts
prove execution did not start
```

The next boundary is policy.

Before execution can be enabled, ForgePilot needs a written enablement contract.

---

## Scope Boundary

FP-MCP-038 may:

* define execution enablement policy
* define required gates before execution may be enabled
* define required human approval
* define required repository state
* define required runner state
* define required OpenCode state
* define required artifact contracts
* define required secret handling
* define required rollback conditions
* define required audit trail
* define required disable switch
* define required dry-run evidence prerequisites
* define required verification prerequisites
* add documentation under `docs/`
* record verification artifacts

FP-MCP-038 must not:

* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* change runner execution config
* call `/runner/start-run`
* call the guarded start MCP tool
* call the dry-run writer tool
* start OpenCode
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* create execution artifacts
* create a real `runnerRunId`
* add a real execution harness
* add worker processes
* add queues
* add scheduling
* mutate SQLite
* change routing logic
* expose the private runner publicly
* commit tokens or secrets

---

## Required Documentation

Add a document:

```text
docs/execution-enablement-policy.md
```

The document must define policy gates for future execution enablement.

It must clearly state:

```text
This document does not enable execution.
This document is not approval to execute.
Execution remains disabled until a later packet explicitly implements enablement after all gates pass.
```

---

## Required Policy Model

Execution enablement must require all of these layers:

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
10. Rollback/disable path
11. Audit/admission path
```

No single layer may imply execution authorization by itself.

---

## Gate 1 — Contract Completeness

Execution must not be enabled unless the following contracts exist and are committed:

```text
docs/guarded-execution-preflight-contract.md
docs/execution-artifact-contract.md
docs/execution-enablement-policy.md
```

The following implemented or documented tools must exist before future enablement:

```text
forgepilot_validate_execution_preflight
forgepilot_record_execution_artifact_dry_run
forgepilot_verify_execution_artifact_dry_run
```

---

## Gate 2 — Dry-Run Evidence

Execution must not be enabled unless at least one dry-run has produced contract-shaped non-execution artifacts:

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

---

## Gate 3 — Verification Evidence

Execution must not be enabled unless the dry-run artifacts have been verified by the verifier tool.

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

---

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

---

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

Current runner state intentionally does not satisfy execution enablement because:

```text
executionEnabled: false
supportedOperations:
- capabilities
- validate-request
```

A future execution-capable runner must expose an explicit execution operation in capabilities.

---

## Gate 6 — OpenCode Boundary State

Execution must not be enabled unless OpenCode boundary checks prove:

```text
OpenCode executable path is explicitly configured
allowed models are explicitly configured
allowed run modes are explicitly configured
non-interactive execution mode is defined
working directory restrictions are defined
environment variable restrictions are defined
stdout/stderr capture is defined
timeout behavior is defined
exit-code handling is defined
```

Current OpenCode status intentionally remains:

```text
opencodeExecutionEnabled: false
```

---

## Gate 7 — Secret Boundary

Execution must not be enabled unless secret handling is explicitly defined.

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
```

---

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

---

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

---

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

---

## Gate 11 — Audit / Admission Path

Execution must not be enabled unless real execution artifacts have a future admission path.

Required future real-run artifacts:

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

Real execution evidence must not be admitted automatically.

Admission must remain separate from execution.

---

## Enablement Decision Rule

Execution may only be enabled if all gates pass:

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

---

## Required Current Classification

Current system must be classified as:

```text
executionEnablementPolicyDefined: true
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
```

Required current reason:

```text
EXECUTION_POLICY_DEFINED_ONLY
```

Optional current supporting reasons:

```text
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
HUMAN_APPROVAL_NOT_RECORDED
RUNNER_EXECUTION_CAPABILITY_NOT_PRESENT
```

---

## Required Non-Enablement Statement

The document must contain this statement or equivalent:

```text
This policy defines future enablement conditions only. It does not enable execution, authorize execution, or permit OpenCode invocation.
```

---

## Verification Requirements

Verification must include:

1. Confirmation that the packet is committed.
2. Confirmation that `docs/execution-enablement-policy.md` is committed.
3. Confirmation that runner execution remains disabled.
4. Confirmation that OpenCode execution remains disabled.
5. Confirmation that no start endpoint was contacted.
6. Confirmation that OpenCode was not started.
7. Confirmation that no execution artifacts were created.
8. Confirmation that no secrets were committed.
9. Verification artifacts committed.
10. Repository clean.

---

## Expected Files

Expected ForgePilot files:

```text
packets/FP-MCP-038.md
docs/execution-enablement-policy.md
runs/FP-MCP-038/executor-result.md
runs/FP-MCP-038/verification.txt
```

No MCP bridge changes are required for FP-MCP-038.

No runner changes are required for FP-MCP-038.

---

## Acceptance Criteria

FP-MCP-038 is accepted if:

```text
packet is committed
execution enablement policy document is committed
policy defines all required gates
policy states that documentation is not execution approval
policy states that dry-run verification is not execution approval
policy states that preflight success is not execution approval
policy requires explicit human approval
policy requires runner execution capability
policy requires OpenCode boundary satisfaction
policy requires secret boundary satisfaction
policy requires network boundary satisfaction
policy requires rollback/disable path
policy requires audit/admission path
current classification is executionAllowedNow false
runner execution remains disabled
OpenCode execution remains disabled
no execution attempted
verification artifacts are committed
repo is clean
```

---

## Failure Conditions

FP-MCP-038 fails if:

```text
runner execution is enabled
OpenCode execution is enabled
start-run endpoint is contacted
OpenCode starts
OpenCode CLI is invoked
OpenCode API is invoked
model providers are contacted
shell executes through runner
real execution artifacts are created
policy implies documentation is approval
policy implies dry-run verification is approval
policy collapses execution and admission
secrets are committed
runner is publicly exposed
```

---

## Expected Result

Current expected successful result:

```text
PASS
```

with:

```text
executionEnablementPolicyDefined: true
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
reasons:
- EXECUTION_POLICY_DEFINED_ONLY
- RUNNER_EXECUTION_DISABLED
- OPENCODE_EXECUTION_DISABLED
```

---

## Follow-Up

After FP-MCP-038, ForgePilot can proceed to one of:

```text
FP-MCP-039 — Execution Enablement Status Tool
FP-MCP-039 — Human Approval Record Contract
FP-MCP-039 — Execution Disable Switch Contract
```

The safest next step is likely an execution enablement status tool that evaluates the policy without enabling execution.
