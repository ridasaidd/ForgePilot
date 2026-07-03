# FP-MCP-239 Result Summary

## Result

```text
FP_MCP_239_HARDCODED_PACKET_ID_LINT_IMPLEMENTED
```

## Summary

Implement a mechanical guard against the recurring stale hardcoded packet-id bug family. The MCP bridge now includes scripts/check-hardcoded-packet-ids.mjs and scripts/hardcoded-packet-id-allowlist.json. The lint scans src/**/*.ts for FP-* and FP-MCP-* references, compares observed references against an explicit baseline allowlist, and fails on any new or changed source reference until it is reviewed and allowlisted with a reason. package.json now includes lint:packet-ids and test now runs pnpm build followed by pnpm lint:packet-ids. Verification passed: pnpm test completed successfully and reported 166 observed source references matched the allowlist. Bridge commit a3c99b9 records the implementation.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
