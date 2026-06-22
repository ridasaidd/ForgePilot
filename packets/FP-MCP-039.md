# FP-MCP-039 — Execution Enablement Status Tool

## Task

Implement a read-only ForgePilot MCP tool that evaluates the FP-MCP-038 execution enablement policy gates and reports whether execution is currently allowed.

## Goal

Prove that ForgePilot can evaluate execution enablement readiness without enabling execution, starting OpenCode, contacting the runner start endpoint, or mutating artifacts.

FP-MCP-039 answers one question:

**Can ForgePilot compute the current execution enablement status from committed policy/evidence/boundary state and correctly return `executionAllowedNow: false`?**

The expected current result is:

```text
executionEnablementStatusEvaluated: true
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
```

This is a successful result.

---

## Background

FP-MCP-038 defined the execution enablement policy contract.

The policy requires all of these layers before execution may ever be enabled:

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

FP-MCP-039 implements a read-only status evaluator for that policy.

This tool is not an enablement tool.

It must only report status.

---

## Scope Boundary

FP-MCP-039 may:

* add a read-only MCP status tool
* evaluate committed repository files
* evaluate committed policy documents
* evaluate committed dry-run artifacts
* evaluate committed verification artifacts
* call read-only ForgePilot repository status helpers
* call read-only runner capability status
* call read-only OpenCode status
* report all policy gate statuses
* report blocking reasons
* report `executionAllowedNow: false`
* add TypeScript helpers if needed
* add output schemas if needed
* record verification artifacts

FP-MCP-039 must not:

* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* change runner execution config
* call `/runner/start-run`
* call the guarded start MCP tool
* call the dry-run writer tool
* call execution preflight as an execution authorization path
* start OpenCode
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* create execution artifacts
* mutate dry-run artifacts
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

## Required Tool

Add a new MCP tool:

```text
forgepilot_get_execution_enablement_status
```

Recommended input:

```json
{
  "packetId": "FP-MCP-039"
}
```

The input packet id is the policy-status packet being evaluated.

The tool must be read-only.

It must not write files.

It must not call:

```text
/runner/start-run
```

It must not call the guarded start MCP tool.

It must not call the dry-run writer tool.

---

## Tool Annotations

Recommended annotations:

```text
readOnlyHint: true
destructiveHint: false
idempotentHint: true
openWorldHint: true
```

`openWorldHint` may be true because the tool may contact the configured runner capabilities endpoint.

It must not contact the runner start endpoint.

---

## Required Policy Inputs

The tool must check for committed policy/contract artifacts:

```text
docs/guarded-execution-preflight-contract.md
docs/execution-artifact-contract.md
docs/execution-enablement-policy.md
packets/FP-MCP-038.md
```

The tool should also check that relevant implementation-stage packets exist:

```text
packets/FP-MCP-034.md
packets/FP-MCP-036.md
packets/FP-MCP-037.md
```

---

## Required Evidence Inputs

The tool must check for the committed FP-MCP-036 dry-run evidence:

```text
runs/FP-MCP-036/qwen-3.7-max-DESIGN_ONLY/execution-dry-run/preflight-result.json
runs/FP-MCP-036/qwen-3.7-max-DESIGN_ONLY/execution-dry-run/start-request.json
runs/FP-MCP-036/qwen-3.7-max-DESIGN_ONLY/execution-dry-run/runner-acceptance.json
runs/FP-MCP-036/qwen-3.7-max-DESIGN_ONLY/execution-dry-run/artifact-manifest.json
```

The tool must check for the committed FP-MCP-037 verification evidence:

```text
runs/FP-MCP-037/executor-result.md
runs/FP-MCP-037/verification.txt
```

At minimum, these files must exist.

The tool may reuse the FP-MCP-037 verifier logic if it remains read-only and does not mutate artifacts.

---

## Required Gate Model

The tool must return a gate object with all FP-MCP-038 gates:

```json
{
  "contractComplete": true,
  "dryRunEvidencePresent": true,
  "dryRunVerified": true,
  "repoClean": true,
  "runnerExecutionCapabilityPresent": false,
  "opencodeBoundarySatisfied": false,
  "secretBoundarySatisfied": false,
  "networkBoundarySatisfied": false,
  "humanApprovalRecorded": false,
  "disablePathDefined": true,
  "auditAdmissionPathDefined": true
}
```

Current expected values may differ only if supported by observed evidence.

Top-level `executionAllowedNow` may only be true if every required gate is true.

Current expected top-level status is:

```text
executionAllowedNow: false
```

---

## Required Current Blocking Reasons

The current expected blocking reasons are:

```text
RUNNER_EXECUTION_CAPABILITY_NOT_PRESENT
OPENCODE_BOUNDARY_UNSATISFIED
SECRET_BOUNDARY_UNSATISFIED
NETWORK_BOUNDARY_UNSATISFIED
HUMAN_APPROVAL_NOT_RECORDED
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
```

The tool may include additional specific reasons if they are observations.

The tool must not include reasons that imply execution was attempted.

---

## Required Non-Execution State

The tool must return:

```text
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

---

## Required Tool Output

The tool must return:

```json
{
  "schemaVersion": "FP-MCP-039",
  "packetId": "FP-MCP-039",
  "executionEnablementStatusEvaluated": true,
  "executionAllowedNow": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "runnerExecutionEnabled": false,
  "opencodeExecutionEnabled": false,
  "gates": {
    "contractComplete": true,
    "dryRunEvidencePresent": true,
    "dryRunVerified": true,
    "repoClean": true,
    "runnerExecutionCapabilityPresent": false,
    "opencodeBoundarySatisfied": false,
    "secretBoundarySatisfied": false,
    "networkBoundarySatisfied": false,
    "humanApprovalRecorded": false,
    "disablePathDefined": true,
    "auditAdmissionPathDefined": true
  },
  "blockingReasons": [
    "RUNNER_EXECUTION_CAPABILITY_NOT_PRESENT",
    "OPENCODE_BOUNDARY_UNSATISFIED",
    "SECRET_BOUNDARY_UNSATISFIED",
    "NETWORK_BOUNDARY_UNSATISFIED",
    "HUMAN_APPROVAL_NOT_RECORDED",
    "RUNNER_EXECUTION_DISABLED",
    "OPENCODE_EXECUTION_DISABLED"
  ],
  "checkedAt": "2026-06-22T00:00:00.000Z",
  "statusSource": "ForgePilot execution enablement policy status"
}
```

Additional fields are allowed if they are observations.

---

## Gate Semantics

### `contractComplete`

True only if required contract documents and packets exist.

### `dryRunEvidencePresent`

True only if required FP-MCP-036 dry-run artifacts exist.

### `dryRunVerified`

True only if FP-MCP-037 verification artifacts exist and/or the verifier confirms the dry-run artifacts are valid.

### `repoClean`

True only if ForgePilot working tree is clean.

### `runnerExecutionCapabilityPresent`

True only if runner capabilities include an explicit future execution operation.

Current expected value:

```text
false
```

because current supported operations are:

```text
capabilities
validate-request
```

### `opencodeBoundarySatisfied`

True only if OpenCode execution boundary is fully implemented and execution-enabled.

Current expected value:

```text
false
```

### `secretBoundarySatisfied`

True only if secret boundary is implemented and verified for real execution.

Current expected value:

```text
false
```

### `networkBoundarySatisfied`

True only if network exposure rules for real execution are implemented and verified.

Current expected value:

```text
false
```

### `humanApprovalRecorded`

True only if an explicit scoped human approval record exists.

Current expected value:

```text
false
```

### `disablePathDefined`

May be true if the FP-MCP-038 policy defines the disable path.

### `auditAdmissionPathDefined`

May be true if the FP-MCP-038 policy defines the audit/admission path.

---

## Failure Reason Codes

Required reason codes include:

```text
CONTRACT_INCOMPLETE
DRY_RUN_EVIDENCE_MISSING
DRY_RUN_VERIFICATION_FAILED
REPO_STATE_INVALID
RUNNER_EXECUTION_CAPABILITY_NOT_PRESENT
OPENCODE_BOUNDARY_UNSATISFIED
SECRET_BOUNDARY_UNSATISFIED
NETWORK_BOUNDARY_UNSATISFIED
HUMAN_APPROVAL_NOT_RECORDED
DISABLE_PATH_MISSING
AUDIT_ADMISSION_PATH_MISSING
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
```

---

## Safety Requirements

The implementation must preserve:

```text
OpenCode started: NO
OpenCode CLI invoked: NO
OpenCode API invoked: NO
Runner execution enabled: NO
Runner start endpoint contacted: NO
Shell executed through runner: NO
Secrets committed: NO
Runner publicly exposed: NO
Artifacts mutated by status tool: NO
```

---

## Verification Requirements

Verification must include:

1. Build/typecheck of the MCP bridge.
2. Service restart.
3. Action refresh if needed.
4. Invocation of the status tool.
5. Confirmation that `executionEnablementStatusEvaluated: true`.
6. Confirmation that `executionAllowedNow: false`.
7. Confirmation that `runnerExecutionEnabled: false`.
8. Confirmation that `opencodeExecutionEnabled: false`.
9. Confirmation that `executionStarted: false`.
10. Confirmation that required blocking reasons are present.
11. Confirmation that no start endpoint was contacted.
12. Confirmation that OpenCode was not started.
13. Confirmation that no artifacts were mutated by the tool.
14. Verification artifacts committed.

---

## Expected Files

Likely MCP bridge changes:

```text
src/server.ts
```

Expected ForgePilot verification artifacts:

```text
packets/FP-MCP-039.md
runs/FP-MCP-039/executor-result.md
runs/FP-MCP-039/verification.txt
```

---

## Acceptance Criteria

FP-MCP-039 is accepted if:

```text
new status MCP tool exists
tool is read-only
tool does not call start-run
tool does not call dry-run writer
tool does not start OpenCode
tool evaluates all FP-MCP-038 gates
tool returns executionAllowedNow false
tool returns runnerExecutionEnabled false
tool returns opencodeExecutionEnabled false
tool returns executionStarted false
tool reports required blocking reasons
runner execution remains disabled
OpenCode execution remains disabled
verification artifacts are committed
repo is clean
```

---

## Failure Conditions

FP-MCP-039 fails if:

```text
executionAllowedNow is true in current state
executionStarted becomes true
OpenCode starts
OpenCode CLI is invoked
OpenCode API is invoked
runner execution is enabled
start-run endpoint is contacted
dry-run writer tool is invoked by status tool
shell executes through runner
artifacts are mutated by status tool
blocking reasons are omitted
secrets are written to artifacts
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
executionEnablementStatusEvaluated: true
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionStarted: false
blockingReasons:
- RUNNER_EXECUTION_CAPABILITY_NOT_PRESENT
- OPENCODE_BOUNDARY_UNSATISFIED
- SECRET_BOUNDARY_UNSATISFIED
- NETWORK_BOUNDARY_UNSATISFIED
- HUMAN_APPROVAL_NOT_RECORDED
- RUNNER_EXECUTION_DISABLED
- OPENCODE_EXECUTION_DISABLED
```

---

## Follow-Up

After FP-MCP-039, ForgePilot can proceed to one of:

```text
FP-MCP-040 — Human Approval Record Contract
FP-MCP-040 — Execution Disable Switch Contract
FP-MCP-040 — Secret Boundary Verification Contract
```

The safest next step is likely human approval record contract or secret boundary verification contract.
