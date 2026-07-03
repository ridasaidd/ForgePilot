# FP-MCP-239 — Hardcoded Packet ID Lint Check

## Checkpoint Type

```text
TOOLING_HARDENING_RESULT
```

## Summary

Implement a mechanical guard against the recurring stale hardcoded packet-id bug family. The MCP bridge now includes scripts/check-hardcoded-packet-ids.mjs and scripts/hardcoded-packet-id-allowlist.json. The lint scans src/**/*.ts for FP-* and FP-MCP-* references, compares observed references against an explicit baseline allowlist, and fails on any new or changed source reference until it is reviewed and allowlisted with a reason. package.json now includes lint:packet-ids and test now runs pnpm build followed by pnpm lint:packet-ids. Verification passed: pnpm test completed successfully and reported 166 observed source references matched the allowlist. Bridge commit a3c99b9 records the implementation.

## Claim

```text
FP_MCP_239_HARDCODED_PACKET_ID_LINT_IMPLEMENTED
```

## Caveats

- This is a baseline guard, not a full semantic proof that every existing hardcoded packet id is safe.
- Existing 166 source references are allowlisted as the FP-MCP-239 baseline; future packets should gradually replace broad baseline reasons with more specific legacy/schema/boundary justifications where useful.
- The check intentionally fails on changed line text as well as new references, forcing review when a hardcoded packet-id context changes.
- The lint covers src/**/*.ts only; docs, generated dist files, and evidence artifacts are intentionally excluded.
- This packet does not change runtime authorization behavior, runner start behavior, approval consumption, or clearance policy.

## Boundaries

- execution authorized: false
- approval created: false
- approval consumed: false
- local clearance created: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- disable switch cleared: false
- runtime service restarted: false

## Non-Execution Boundary

```text
execution authorized: false
approval consumed: false
disable switch cleared: false
runner start endpoint contacted: false
OpenCode started: false
FP-027 canary run: false
```

## Expected Result

```text
FP_MCP_239_HARDCODED_PACKET_ID_LINT_IMPLEMENTED
```
