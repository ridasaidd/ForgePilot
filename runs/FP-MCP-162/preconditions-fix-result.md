# FP-MCP-162 Structured Approval Preconditions Fix

## Result

```text
STRUCTURED_APPROVAL_PRECONDITIONS_COMPATIBILITY_FIX_SOURCE_VERIFIED_REFRESH_PENDING
```

## Bridge commit

```text
cd99571 Fix structured approval preconditions
```

## Trigger

First live structured approval artifact was created successfully but failed validation with:

```text
APPROVAL_PRECONDITIONS_MISSING
APPROVAL_EVIDENCE_ARTIFACT_UNCOMMITTED
APPROVAL_ARTIFACT_UNCOMMITTED
```

After committing the artifact, the remaining source issue was compatibility with existing validator precondition expectations.

## Fix

The structured approval artifact preconditions now include:

```text
preStartEvidenceValidated: true
stateSnapshotValidated: true
```

matching the existing validator's real-approval precondition contract.

## Verification

```text
pnpm test: PASS
pnpm build: PASS
tsc: PASS
```

## Runtime status

```text
ACTION_REFRESH_PENDING
```

The MCP service/actions need another restart/refresh before the fixed tool behavior can be tested live.

## Boundary

No execution was enabled.
No approval was consumed.
No runner start endpoint was contacted.
No OpenCode process started.
