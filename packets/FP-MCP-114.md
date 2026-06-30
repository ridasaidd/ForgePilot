# FP-MCP-114 — Start Capability Transition Contract

## Task

Define the formal transition contract for ForgePilot MCP start capability states.

## Goal

Define the evidence required to move ForgePilot MCP start capability from `PRESENT_DISABLED` to `PRESENT_GUARDED` and eventually to `CALLABLE_GUARDED` without allowing implicit execution.

This packet answers one question:

What evidence must exist before the system may transition from disabled start to guarded start?

## Background

FP-MCP-109 defined the disabled start stub contract.

FP-MCP-110 implemented the authenticated, fail-closed disabled start stub.

FP-MCP-111 exposed start endpoint state through the MCP bridge.

FP-MCP-112 verified disabled start stub safety regression.

FP-MCP-113 aligned the MCP start-shaped tool boundary with the disabled start state so that the bridge rejects before contacting `/runner/start-run` while the runner reports:

- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`

Current state:

- runner start endpoint is present
- runner start endpoint is disabled
- bridge observes the disabled state
- bridge refuses start contact while disabled
- execution is disabled
- OpenCode is not started
- no runner run id is created
- no approval is consumed
- no request artifact is mutated

The next architecture step is not execution.

The next architecture step is a transition contract.

## Core Rule

Start capability state transitions are evidence-gated.

A later state must never be inferred from implementation presence alone.

A start endpoint existing does not imply that start is callable.

A dry-run validating does not imply that execution is authorized.

A green preflight report does not imply that start may be attempted.

Only an explicitly recorded transition decision may move the system to a later state.

## Start Capability States

### State 1 — NOT_PRESENT

Meaning:

- no runner start endpoint exists
- no start endpoint may be contacted
- no execution path exists through the runner

Required metadata:

- `startEndpointPresent: false`
- `startEndpointState: NOT_PRESENT`
- `startCapabilityCallable: false`

Allowed operations:

- capabilities
- validation-only tools

Forbidden:

- start endpoint contact
- execution
- OpenCode start
- runner run id creation

### State 2 — PRESENT_DISABLED

Meaning:

- runner start endpoint exists
- endpoint is authenticated
- endpoint fails closed
- endpoint is not callable for execution
- endpoint must not consume approval
- endpoint must not mutate request artifacts
- endpoint must not start OpenCode
- endpoint must not create a runner run id

Required metadata:

- `startEndpointPresent: true`
- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `startDisabledReason`
- `startBlockingReasons`

Allowed operations:

- capabilities
- validate-request
- disabled-stub observation where explicitly authorized
- MCP bridge preflight-only rejection

Forbidden:

- execution
- OpenCode start
- runner run id creation
- approval consumption
- request artifact mutation
- adding start to `supportedOperations`

Current system state after FP-MCP-113:

- `PRESENT_DISABLED`

### State 3 — PRESENT_GUARDED

Meaning:

- runner start endpoint exists
- runner understands the guarded start contract
- runner can validate a guarded start request shape
- runner can return guarded dry-run results
- runner still cannot start execution
- runner still cannot create a runner run id
- runner still cannot consume approval for execution
- runner still cannot mutate request artifacts for execution
- MCP bridge may contact the runner guarded dry-run path only when explicitly authorized by packet scope

Required metadata:

- `startEndpointPresent: true`
- `startEndpointState: PRESENT_GUARDED`
- `startCapabilityCallable: false`
- `startGuardContractVersion`
- `startGuardDryRunSupported: true`
- `startReturnsRunnerRunId: false`
- `startRecordsPreStartState: false`
- `startRecordsPostStartState: false`

Allowed operations:

- capabilities
- validate-request
- guarded dry-run validation
- bridge guarded-start readiness reporting

Forbidden:

- real execution
- OpenCode start
- runner run id creation
- approval consumption for execution
- request artifact mutation for execution
- adding executable start to `supportedOperations`

### State 4 — CALLABLE_GUARDED

Meaning:

- runner start endpoint exists
- runner start endpoint is callable
- runner may start execution only after all guarded start gates pass
- runner may create runner run id only after all guarded start gates pass
- runner may consume approval only according to append-only evidence rules
- runner must record pre-start and post-start state
- runner must preserve full auditability

Required metadata:

- `startEndpointPresent: true`
- `startEndpointState: CALLABLE_GUARDED`
- `startCapabilityCallable: true`
- `startGuardContractVersion`
- `startRequiresApprovalEvidence: true`
- `startRequiresPreflight: true`
- `startRequiresDisableSwitchClear: true`
- `startRequiresRequestArtifactHash: true`
- `startRequiresTargetExecutionCommit: true`
- `startRequiresEvidenceLedgerValidation: true`
- `startRecordsPreStartState: true`
- `startRecordsPostStartState: true`
- `startReturnsRunnerRunId: true`

Allowed operations:

- capabilities
- validate-request
- guarded start
- state snapshot recording
- append-only approval consumption evidence
- runner run id creation after gate success

Forbidden:

- execution without explicit transition decision
- execution without approval evidence
- execution without preflight success
- execution while disable switch is active
- execution without request artifact hash verification
- execution from an unbound commit
- execution without evidence ledger validation
- silent approval mutation
- silent request artifact mutation

## Transition Law

Valid transitions:

```text
NOT_PRESENT
→ PRESENT_DISABLED
→ PRESENT_GUARDED
→ CALLABLE_GUARDED
```

Invalid transitions:

```text
NOT_PRESENT → PRESENT_GUARDED
NOT_PRESENT → CALLABLE_GUARDED
PRESENT_DISABLED → CALLABLE_GUARDED
PRESENT_GUARDED → CALLABLE_GUARDED without explicit transition evidence
CALLABLE_GUARDED → any state silently
```

Rollback transitions are allowed only when explicitly recorded:

```text
CALLABLE_GUARDED → PRESENT_GUARDED
CALLABLE_GUARDED → PRESENT_DISABLED
PRESENT_GUARDED → PRESENT_DISABLED
PRESENT_DISABLED → NOT_PRESENT
```

Rollback must never delete historical evidence.

Rollback must append new evidence explaining the observed state change.

## Required Evidence To Enter PRESENT_GUARDED

The system may transition from `PRESENT_DISABLED` to `PRESENT_GUARDED` only after all of the following evidence exists.

### Evidence 1 — Disabled State Baseline

Required:

- latest runner capabilities observation
- latest MCP bridge status observation
- disabled stub regression evidence

Must show:

- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `executionEnabled: false`
- `executionStarted: false`
- `opencodeStarted: false`
- `runnerRunId: null`

Existing evidence:

- FP-MCP-112
- FP-MCP-113

### Evidence 2 — Guarded Start Contract

Required document:

- guarded start request contract
- guarded start response contract
- guarded dry-run response contract
- failure reason taxonomy
- side effect policy

Must define:

- accepted request fields
- required approval evidence references
- required request artifact hash
- required target commit
- required branch
- required model id
- required run mode
- required preflight result
- required disable-switch status
- required evidence ledger status
- required no-op dry-run behavior

### Evidence 3 — Runner Guarded Dry-Run Semantics

Required:

- runner behavior contract for `PRESENT_GUARDED`
- authenticated dry-run validation path
- proof that dry-run cannot start OpenCode
- proof that dry-run cannot create runner run id
- proof that dry-run cannot consume approval
- proof that dry-run cannot mutate request artifacts

### Evidence 4 — Bridge Guarded Readiness Semantics

Required:

- MCP bridge readiness report shape
- bridge behavior when runner reports `PRESENT_GUARDED`
- bridge behavior when runner reports `PRESENT_DISABLED`
- bridge behavior when runner reports unknown state
- bridge behavior when runner is unreachable
- proof that readiness report cannot start execution

### Evidence 5 — Regression Tests

Required checks:

- disabled state remains fail-closed
- guarded dry-run validates without execution
- invalid request fails
- missing approval fails
- invalid approval fails
- active disable switch fails
- invalid request artifact hash fails
- mismatched commit fails
- unsupported model fails
- unsupported run mode fails
- runner unreachable fails closed
- unknown runner state fails closed

### Evidence 6 — Explicit Transition Decision

Required artifact:

- `runs/<packet>/transition-decision.md`

Must include:

- previous state
- proposed next state
- exact evidence reviewed
- responsible operator
- timestamp
- explicit decision text
- rollback path
- non-execution confirmation

Required decision text:

```text
AUTHORIZE_TRANSITION_TO_PRESENT_GUARDED
```

This text authorizes only `PRESENT_GUARDED`.

It does not authorize `CALLABLE_GUARDED`.

It does not authorize execution.

## Required Evidence To Enter CALLABLE_GUARDED

The system may transition from `PRESENT_GUARDED` to `CALLABLE_GUARDED` only after all of the following evidence exists.

This section defines the future burden of proof only.

It does not authorize implementation.

### Evidence 1 — PRESENT_GUARDED Baseline

Must show:

- `startEndpointState: PRESENT_GUARDED`
- `startCapabilityCallable: false`
- guarded dry-run supported
- execution disabled
- OpenCode not started
- no runner run id created

### Evidence 2 — End-to-End Guarded Dry-Run

Must show a complete non-executing pass across:

- request artifact validation
- request artifact hash verification
- commit binding
- branch binding
- model allowlist
- run mode allowlist
- disable switch clear
- human approval evidence validation
- approval consumption evidence validation
- pre-start evidence validation
- state snapshot validation
- evidence ledger validation
- runner guarded dry-run validation
- bridge readiness report

Must still show:

- executionStarted: false
- opencodeStarted: false
- runnerRunId: null
- approvalConsumed: false
- requestArtifactMutated: false

### Evidence 3 — Failure Matrix

Must show fail-closed behavior for every guarded gate.

At minimum:

- no approval
- expired approval
- mismatched approval scope
- missing consumption evidence
- invalid consumption evidence
- disable switch active
- invalid request hash
- mismatched commit
- dirty working tree
- unsupported model
- unsupported run mode
- runner unreachable
- runner protocol mismatch
- unknown runner state
- OpenCode unavailable
- OpenCode execution disabled

### Evidence 4 — Runtime Isolation

Must show:

- OpenCode command path is explicit
- model provider invocation path is explicit
- no shell interpolation vulnerability
- no ambient approval token
- no implicit environment-based start
- no background execution
- no retry loop that can execute without new evidence

### Evidence 5 — Rollback Path

Must show:

- how to return to `PRESENT_GUARDED`
- how to return to `PRESENT_DISABLED`
- how to verify rollback
- how to prove no execution is possible after rollback

### Evidence 6 — Explicit Transition Decision

Required artifact:

- `runs/<packet>/transition-decision.md`

Required decision text:

```text
AUTHORIZE_TRANSITION_TO_CALLABLE_GUARDED
```

This text is execution-relevant.

It must not be reused.

It must be scoped to one exact repository commit and one exact bridge/runner version.

## State Reporting Requirements

Every status surface must report:

- `startEndpointPresent`
- `startEndpointState`
- `startCapabilityCallable`
- `startGuardContractVersion` when applicable
- `startDisabledReason` when applicable
- `startBlockingReasons`
- `executionEnabled`
- `supportedOperations`
- `checkedAt`
- `statusSource`

The MCP bridge must not hide runner state transitions.

The MCP bridge must fail closed on unknown states.

Unknown states must be treated as:

```text
START_ENDPOINT_STATE_UNKNOWN
START_NOT_CALLABLE
EXECUTION_NOT_ALLOWED
```

## Supported Operations Rule

`start-run` may not appear in `supportedOperations` while state is:

- `NOT_PRESENT`
- `PRESENT_DISABLED`
- `PRESENT_GUARDED`

`start-run` may appear in `supportedOperations` only when state is:

- `CALLABLE_GUARDED`

Presence in `supportedOperations` does not itself authorize execution.

Execution still requires all guarded gates.

## Approval Rule

Approval evidence may be created before `CALLABLE_GUARDED`.

Approval consumption for execution may not occur before `CALLABLE_GUARDED`.

Dry-run validation may observe approval evidence.

Dry-run validation must not consume approval evidence.

A transition approval is not a start approval.

A start approval is not a transition approval.

These evidence types must remain separate.

## Request Artifact Rule

Request artifacts may be validated before `CALLABLE_GUARDED`.

Request artifacts may not be mutated by transition checks.

Request artifacts may not be silently normalized.

Request artifact hashes must be computed before start.

A guarded start may only use the exact artifact hash that passed preflight.

## OpenCode Rule

OpenCode must not be started in:

- `NOT_PRESENT`
- `PRESENT_DISABLED`
- `PRESENT_GUARDED`

OpenCode may be started only in:

- `CALLABLE_GUARDED`

and only after all guarded start gates pass.

## Runner Run Id Rule

A runner run id must not be created in:

- `NOT_PRESENT`
- `PRESENT_DISABLED`
- `PRESENT_GUARDED`

A runner run id may be created only in:

- `CALLABLE_GUARDED`

and only after start is accepted and execution is actually starting.

## Evidence Mutation Rule

No state transition may rewrite earlier evidence.

All transition records must be append-only.

If evidence is found invalid later, record invalidation evidence.

Do not edit the original evidence to make it appear valid.

## Verification

This packet is documentation and contract only.

Verification must confirm:

- transition states are defined
- valid transitions are defined
- invalid transitions are defined
- rollback transitions are defined
- evidence required for `PRESENT_GUARDED` is defined
- evidence required for `CALLABLE_GUARDED` is defined
- state reporting requirements are defined
- supported operations rule is defined
- approval rule is defined
- request artifact rule is defined
- OpenCode rule is defined
- runner run id rule is defined
- evidence mutation rule is defined
- no execution was enabled
- no start was made callable
- no OpenCode process was started
- no runner run id was created

## Evidence

Record:

- `docs/start-capability-transition-contract.md`
- `runs/FP-MCP-114/contract-evidence.md`
- `runs/FP-MCP-114/verification.txt`

## Success Criteria

This packet is successful if:

1. The start capability state machine is defined.
2. Each state has explicit semantics.
3. Valid transitions are defined.
4. Invalid transitions are defined.
5. Rollback transitions are defined.
6. Evidence required for `PRESENT_GUARDED` is defined.
7. Evidence required for `CALLABLE_GUARDED` is defined as future burden of proof only.
8. State reporting requirements are defined.
9. Supported operations constraints are defined.
10. Approval, request artifact, OpenCode, runner run id, and evidence mutation rules are defined.
11. Verification passes.
12. No execution behavior changes.

## Non-goals

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable runner execution.

This packet does not enable OpenCode execution.

This packet does not contact the runner start endpoint.

This packet does not perform a remote runner start.
