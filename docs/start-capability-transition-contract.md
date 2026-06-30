# Start Capability Transition Contract

## Purpose

This document defines the formal transition contract for ForgePilot MCP start capability states.

The purpose is to prevent implicit execution enablement.

A start endpoint existing does not mean that start is callable.

A start-shaped MCP tool existing does not mean that execution is authorized.

A green dry-run does not mean that execution may begin.

Only explicitly recorded transition evidence may move the system to a later start capability state.

## Current Baseline

As of FP-MCP-113, the verified system state is:

- runner start endpoint is present
- runner start endpoint state is `PRESENT_DISABLED`
- runner start capability is not callable
- MCP bridge exposes the runner start endpoint state
- MCP start-shaped tool refuses to contact the runner start endpoint while state is `PRESENT_DISABLED`
- execution is disabled
- OpenCode is not started
- no runner run id is created
- no approval is consumed
- no request artifact is mutated

## Governing Rules

### Rule 1 — State Is Explicit

The start capability state must be reported explicitly.

Required fields:

- `startEndpointPresent`
- `startEndpointState`
- `startCapabilityCallable`
- `startBlockingReasons`
- `executionEnabled`
- `supportedOperations`
- `checkedAt`
- `statusSource`

A later state must not be inferred from implementation presence.

### Rule 2 — Capability Is Not Execution

A start endpoint may exist without being callable.

A callable start endpoint may exist without any given request being eligible.

A valid request may exist without execution being authorized.

A valid approval may exist without approval consumption being permitted.

### Rule 3 — Transitions Are Evidence-Gated

A state transition requires recorded evidence.

A state transition must not be hidden in implementation changes.

A state transition must not be inferred from a service restart.

A state transition must not be inferred from a passing build.

A state transition requires an explicit transition decision artifact.

### Rule 4 — Rollback Is Append-Only

Rollback must not erase prior evidence.

Rollback must append evidence describing the observed transition.

If earlier evidence is later found invalid, record invalidation evidence.

Do not rewrite historical evidence to make it appear valid.

## Start Capability States

### NOT_PRESENT

Meaning:

- no runner start endpoint exists
- no runner start endpoint may be contacted
- no execution path exists through the runner

Required metadata:

- `startEndpointPresent: false`
- `startEndpointState: NOT_PRESENT`
- `startCapabilityCallable: false`

Allowed operations:

- capabilities
- validation-only tools

Forbidden:

- runner start endpoint contact
- execution
- OpenCode start
- runner run id creation
- approval consumption for execution
- request artifact mutation for execution

### PRESENT_DISABLED

Meaning:

- runner start endpoint exists
- endpoint is authenticated
- endpoint fails closed
- endpoint is not callable for execution
- endpoint may be observed only when explicitly authorized
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
- approval consumption for execution
- request artifact mutation for execution
- adding executable start to `supportedOperations`

### PRESENT_GUARDED

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

### CALLABLE_GUARDED

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

## Valid Transitions

```text
NOT_PRESENT
→ PRESENT_DISABLED
→ PRESENT_GUARDED
→ CALLABLE_GUARDED
```

## Invalid Transitions

```text
NOT_PRESENT → PRESENT_GUARDED
NOT_PRESENT → CALLABLE_GUARDED
PRESENT_DISABLED → CALLABLE_GUARDED
PRESENT_GUARDED → CALLABLE_GUARDED without explicit transition evidence
CALLABLE_GUARDED → any state silently
```

## Rollback Transitions

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

The system may transition from `PRESENT_DISABLED` to `PRESENT_GUARDED` only after all required evidence exists.

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

Known baseline evidence:

- FP-MCP-112
- FP-MCP-113

### Evidence 2 — Guarded Start Contract

Required document must define:

- guarded start request contract
- guarded start response contract
- guarded dry-run response contract
- failure reason taxonomy
- side effect policy

Required request fields:

- packet id
- request id
- approval evidence reference
- request artifact path
- request artifact hash
- target commit
- target branch
- model id
- run mode
- preflight result reference
- disable-switch status reference
- evidence ledger status reference

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

Required fields:

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

The system may transition from `PRESENT_GUARDED` to `CALLABLE_GUARDED` only after all required evidence exists.

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

## Verification Checklist

A valid implementation of this contract must confirm:

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
- no execution was enabled by the transition contract
- no start was made callable by the transition contract
- no OpenCode process was started by the transition contract
- no runner run id was created by the transition contract
