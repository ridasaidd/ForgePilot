# FP-MCP-113 — Start Stub Tool Boundary Alignment

## Task

Align the MCP `forgepilot_start_remote_runner_request` tool boundary with the disabled runner start stub semantics.

## Goal

Ensure that the MCP start tool treats the runner `PRESENT_DISABLED` start endpoint as a structured fail-closed state, not as an executable path.

This packet answers one question:

Can the MCP start tool safely observe the disabled start stub response without implying that execution is possible?

## Background

FP-MCP-109 defined the disabled start stub contract.

FP-MCP-110 implemented an authenticated, fail-closed disabled start stub on the runner.

FP-MCP-111 exposed `startEndpointPresent` and `startEndpointState` through the MCP bridge status tool.

FP-MCP-112 verified the disabled start stub safety regression:

- MCP bridge status reports `startEndpointState: PRESENT_DISABLED`
- raw runner capabilities report `startEndpointState: PRESENT_DISABLED`
- unauthenticated start request fails with `RUNNER_AUTH_FAILED`
- authenticated start request fails closed with `START_ENDPOINT_DISABLED`
- executionStarted remains false
- opencodeStarted remains false
- runnerRunId remains null
- approvalConsumed remains false
- requestArtifactMutated remains false

The MCP tool named `forgepilot_start_remote_runner_request` currently exists as a start-shaped boundary.

Before any future execution enablement work, the tool boundary must explicitly align with `PRESENT_DISABLED`.

## Scope

Allowed:

- Inspect the MCP bridge implementation of `forgepilot_start_remote_runner_request`.
- Define how the MCP start tool must behave when runner capabilities report `startEndpointState: PRESENT_DISABLED`.
- Define required response fields for disabled-stub observation.
- Define required failure reasons.
- Define preconditions before contacting any runner start endpoint.
- Optionally implement a safe alignment if limited to fail-closed behavior.
- Record evidence under `runs/FP-MCP-113/`.

Forbidden:

- Do not enable execution.
- Do not relax the global disable switch.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not create approval evidence.
- Do not consume approval.
- Do not mutate approval artifacts.
- Do not mutate request artifacts.
- Do not authorize execution.
- Do not start OpenCode.
- Do not create a runner run id.
- Do not enqueue execution.
- Do not contact model providers.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.
- Do not implement the full FP-MCP-104 guarded start contract.

## Boundary Rule

The MCP start tool must classify runner start state before attempting start behavior.

If runner status reports:

- `startEndpointState: PRESENT_DISABLED`

then the MCP tool must return a structured fail-closed response.

It must not interpret the endpoint as executable.

It must not report that execution was started.

It must not report runner acceptance as successful execution readiness.

## Required Tool Behavior For PRESENT_DISABLED

When `forgepilot_start_remote_runner_request` is invoked while the runner reports `PRESENT_DISABLED`, the tool must return:

- `valid: false`
- `accepted: false`
- `executionEnabled: false`
- `executionStarted: false`
- `opencodeStarted: false`
- `runnerRunId: null`
- `startEndpointPresent: true`
- `startEndpointState: PRESENT_DISABLED`
- `startCapabilityCallable: false`
- `executionAllowedNow: false`
- `approvalConsumed: false`
- `approvalConsumptionPath: null`
- `preStartEvidenceCreated: false`
- `postStartEvidenceCreated: false`
- `requestArtifactMutated: false`
- `statusSource`
- `checkedAt`
- `reasons`

Required reasons:

- `START_ENDPOINT_DISABLED`
- `START_NOT_CALLABLE`
- `EXECUTION_NOT_ALLOWED`

If the runner and OpenCode remain disabled, reasons must also include:

- `RUNNER_EXECUTION_DISABLED`
- `OPENCODE_EXECUTION_DISABLED`

## Endpoint Contact Rule

Two acceptable approaches exist.

### Approach A — Preflight-only rejection

The MCP tool reads runner capabilities first.

If `startEndpointState: PRESENT_DISABLED`, it does not contact the runner start endpoint.

It returns a bridge-side fail-closed response.

This is the preferred approach because it avoids even start-endpoint contact while disabled.

Required fields:

- `runnerStartEndpointContacted: false`
- `startEndpointContacted: false`
- `statusSource: MCP bridge disabled-start boundary policy`

### Approach B — Disabled stub observation

The MCP tool may contact the authenticated runner disabled start endpoint only if the packet explicitly authorizes observing the disabled stub and the tool guarantees no execution side effects.

Required fields:

- `runnerStartEndpointContacted: true`
- `startEndpointContacted: true`
- `statusSource: remote runner disabled start stub`

For FP-MCP-113, Approach A is preferred unless implementation inspection shows the existing tool already contacts the stub.

## Required Preconditions Before Any Start Endpoint Contact

Before contacting a runner start endpoint, the MCP tool must verify:

- runner configured
- runner reachable
- request artifact exists
- request artifact valid
- model allowed
- run mode allowed
- working tree clean
- artifact commit reachable
- startCapabilityCallable is true

If `startCapabilityCallable` is false, the tool must fail closed before contacting the start endpoint.

## Required Safety Invariants

The MCP tool must preserve:

- executionStarted: false
- opencodeStarted: false
- runnerRunId: null
- approvalConsumed: false
- requestArtifactMutated: false
- executionAllowedNow: false

The tool must not perform hidden background work.

The tool must not infer success from the presence of a start endpoint.

## Verification

Verification must show:

- MCP bridge status reports `startEndpointState: PRESENT_DISABLED`
- MCP start tool does not start execution
- MCP start tool reports `executionStarted: false`
- MCP start tool reports `opencodeStarted: false`
- MCP start tool reports `runnerRunId: null`
- MCP start tool reports `approvalConsumed: false`
- MCP start tool reports `requestArtifactMutated: false`
- MCP start tool reasons include disabled-start reasons
- no OpenCode process is started
- no runner run id is created
- no approval is consumed
- no request artifact is mutated

## Evidence

Record:

- `runs/FP-MCP-113/boundary-alignment.md`
- `runs/FP-MCP-113/verification.txt`

If implementation is performed, also record:

- implementation files changed
- build/test output
- MCP status observation
- MCP start tool observation
- safety result

## Success Criteria

This packet is successful if:

1. The MCP start tool boundary for `PRESENT_DISABLED` is defined.
2. The required fail-closed response shape is defined.
3. The endpoint contact rule is defined.
4. Preconditions before any start endpoint contact are defined.
5. Execution remains disabled.
6. Start remains not callable.
7. OpenCode is not started.
8. No runner run id is created.
9. No approval is consumed.
10. No request artifact is mutated.

## Non-goals

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not create approval evidence.

This packet does not consume approval.

This packet does not relax the disable switch.

This packet does not enable runner execution.

This packet does not enable OpenCode execution.

This packet does not perform a real remote runner start.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not implement the full FP-MCP-104 guarded start contract.
