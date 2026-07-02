# FP-MCP-162 Guarded Report Integration Fix

## Result

```text
GUARDED_REPORT_ALIGNED_WITH_CANONICAL_APPROVAL_VALIDATOR_SOURCE_VERIFIED_REFRESH_PENDING
```

## Bridge commit

```text
71a09a2 Use canonical approval validation in guarded report
```

## Trigger

The structured approval artifact validated directly, but guarded preflight still rejected it:

```text
STRUCTURED_APPROVAL_VALIDATOR_ACCEPTED_GUARDED_PREFLIGHT_REJECTED
```

## Fix

The guarded-start preflight report now uses `validateHumanApprovalRecord` as the source of truth when an approval id is supplied.

This avoids a divergent artifact reader treating recorder-local fields as final usability state.

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

The MCP service/actions need another restart/refresh before the fixed guarded report can be tested live.

## Boundary

No execution was enabled.
No approval was consumed.
No runner start endpoint was contacted.
No OpenCode process started.
