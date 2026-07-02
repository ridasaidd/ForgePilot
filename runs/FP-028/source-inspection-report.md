# FP-028 Source Inspection Report

## Result

```text
ENABLEMENT_BOUNDARY_FLAGS_SOURCE_INSPECTED
```

## Current live FP-027 status after packet creation

```text
contractComplete: true
opencodeBoundarySatisfied: false
secretBoundarySatisfied: false
networkBoundarySatisfied: false
humanApprovalRecorded: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
executionAllowedNow: false
```

## 1. contractComplete

Source location:

```text
src/server.ts around getExecutionEnablementStatus
```

True condition:

```text
packet id is syntactically valid
all required contract files exist
```

Required files include:

```text
docs/guarded-execution-preflight-contract.md
docs/execution-artifact-contract.md
docs/execution-enablement-policy.md
packets/FP-MCP-034.md
packets/FP-MCP-036.md
packets/FP-MCP-037.md
packets/FP-MCP-038.md
packets/<packetId>.md
```

Current value:

```text
true for FP-027 after packets/FP-027.md was committed
```

Can it be made true legitimately?

```text
yes, by committing the required packet and contract files
```

Could it become true too easily?

```text
yes
```

The check verifies file existence, not content adequacy, currentness, semantic alignment, or whether the packet actually authorizes the intended execution. It is a completeness index, not a safety proof.

## 2. opencodeBoundarySatisfied

Source location:

```text
src/server.ts:getExecutionEnablementStatus
```

True condition in the general enablement-status surface:

```text
opencodeStatus.opencodeExecutionEnabled === true
```

But `getOpenCodeStatus()` currently returns:

```text
opencodeExecutionEnabled: false
liveOpenCodeChecked: false
```

Current value:

```text
false
```

Can it be made true legitimately through scoped configuration today?

```text
not through the inspected status path
```

It would require a code/config change that makes `getOpenCodeStatus()` return true.

Surface mismatch:

```text
guarded preflight uses a different opencode boundary condition
```

In the guarded preflight path, the source checks:

```text
opencodeStatus.opencodeExecutionEnabled === false
opencodeStatus.liveOpenCodeChecked === false
```

That means the general enablement-status surface treats enabled OpenCode as satisfying the boundary, while guarded preflight treats not contacting/enabling OpenCode during preflight as satisfying the boundary.

Could it become true too easily?

```text
potentially yes
```

If only the general status flag were changed to true by flipping `opencodeExecutionEnabled`, the name would imply a boundary proof, but the current source does not show canary-scoped controls, process-tree readiness, or per-packet authorization attached to that flag.

## 3. secretBoundarySatisfied

Source location:

```text
src/server.ts:getExecutionEnablementStatus
```

True condition in the general enablement-status surface:

```text
none currently
```

It is hard-coded:

```text
secretBoundarySatisfied = false
```

Current value:

```text
false
```

Can it be made true legitimately through scoped configuration today?

```text
not through the inspected status path
```

A code change is required for the general enablement-status surface.

Surface mismatch:

```text
guarded preflight currently sets secretsBoundaryPassed = true
```

The human approval recorder and validator do perform secret-like material checks for approval text, operator fields, notes, and approval artifacts. That is real protection for approval evidence, but it is not the same thing as a canary/workspace/model secret boundary.

Could it become true too easily?

```text
yes on the guarded preflight surface
```

Because preflight currently treats the secrets boundary as passed unconditionally, it could report that boundary as passed without proving that the canary prompt, workspace, tool access, or runtime environment cannot expose secrets.

## 4. networkBoundarySatisfied

Source location:

```text
src/server.ts:getExecutionEnablementStatus
```

True condition in the general enablement-status surface:

```text
none currently
```

It is hard-coded:

```text
networkBoundarySatisfied = false
```

Current value:

```text
false
```

Can it be made true legitimately through scoped configuration today?

```text
not through the inspected status path
```

A code change is required for the general enablement-status surface.

Surface mismatch:

```text
guarded preflight uses runnerStatus.runnerConfigured === true and runnerEndpointLabel === configured
```

That verifies configured runner exposure, not network isolation or model/API egress policy.

Could it become true too easily?

```text
yes on the guarded preflight surface
```

A configured runner endpoint can satisfy the preflight network exposure gate without proving that the OpenCode run cannot reach disallowed network targets.

Potential design conflict:

```text
A real OpenCode canary may require network access to model APIs, while a strict network-isolation boundary could forbid that.
```

FP-029 must decide whether network boundary means no network, no arbitrary network, runner-only network, model-provider-only egress, or observed-but-not-blocked network exposure.

## 5. humanApprovalRecorded

Source locations:

```text
src/server.ts:getExecutionEnablementStatus
src/server.ts:recordRealHumanApprovalEvidence
src/server.ts:validateHumanApprovalRecord
src/server.ts:validateExecutionPreflight
src/server.ts:recordHumanApprovalConsumption
```

True condition in the general enablement-status surface:

```text
none currently
```

It is hard-coded:

```text
humanApprovalRecorded = false
```

Current value:

```text
false
```

Can it be made true legitimately through scoped configuration today?

```text
not in getExecutionEnablementStatus
```

But a separate real approval mechanism exists.

The recorder can create a real approval artifact when required fields are valid, the working tree is clean, the approval text matches the canonical text, expiration is valid, and approval/operator fields avoid secret-like material.

The created approval artifact records:

```text
humanApprovalRecorded: true
approvalUsableForExecution: false
approvalUsabilityRequiresValidation: true
singleUse: true
consumed: false
executionAllowedNow: false
```

The validator can later classify the approval as usable only if checks pass, including exact scope, committed artifact, not expired, not revoked, not consumed, not quarantined, and secret-boundary validity.

Could it become true too easily?

```text
not in the validator path, but yes in the general status surface if wired naively
```

The validator path is meaningfully strict. The risk is that a future scoped-enable implementation might simply wire `humanApprovalRecorded` to artifact existence, instead of requiring validated exact scope and single-use freshness.

## Cross-surface finding

There are at least two different policy surfaces:

```text
1. general enablement status: getExecutionEnablementStatus
2. guarded preflight: validateExecutionPreflight
```

They do not currently use identical semantics for the same-looking boundary concepts.

The general status surface is conservative and currently impossible to satisfy for several gates without code changes.

The guarded preflight surface has some gates that pass by construction or by runner configuration rather than by strong boundary proof.

## Follow-up requirement

Before scoped enablement is implemented, FP-029 should define one canonical enablement contract that reconciles these surfaces.

It must specify:

```text
which source of truth decides execution allowedness
how FP-027 approval is recorded and consumed
what opencode boundary means for a real canary
what secret boundary means for a real canary
what network boundary means for a real canary
how these gates avoid becoming true by file existence or simple configuration alone
```

## Boundary

No code was changed. No execution was enabled. No worker was started.
