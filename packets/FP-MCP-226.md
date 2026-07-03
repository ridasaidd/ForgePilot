# FP-MCP-226 — Update Operator-Local Clearance Observer Commit Binding

## Checkpoint Type

```text
TOOL_IMPLEMENTATION_RESULT
```

## Summary

Record implementation of the FP-MCP-225 two-commit binding policy in the MCP bridge operator-local clearance observer. The observer remains read-only and now supports optional executionBaseCommit and requestArtifactCommit inputs while preserving backward compatibility with targetExecutionCommit. It reads the target workspace request artifact, validates the request artifact is present and valid JSON, derives the request artifact execution base, checks that it matches the expected execution base, checks that the execution base is an ancestor of the request artifact commit, and binds the current workspace HEAD to the request artifact commit rather than the execution base. The server tool schema now exposes the optional two-commit fields. pnpm build passed, and a direct read-only smoke invocation showed request artifact present/valid, execution base match, ancestry pass, and fail-closed behavior because local clearance was missing and current HEAD did not match the supplied request-artifact commit.

## Claim

```text
FP_MCP_226_OPERATOR_LOCAL_CLEARANCE_TWO_COMMIT_BINDING_IMPLEMENTED
```

## Caveats

- The running MCP service may need a restart before the updated schema and implementation are visible through ChatGPT tool discovery.
- No local clearance artifact was created or modified.
- The smoke invocation used a placeholder approval id only to exercise read-only logic; it did not create approval evidence or consume approval.
- The existing FP-MCP-223 request is still not sufficient for guarded execution; local clearance is missing and current ForgePilot HEAD has advanced beyond the supplied request artifact commit used in the smoke test.
- Future fresh approval/local clearance should bind requestArtifactCommit to the exact current committed evidence state that proves the request artifact exists, while executionBaseCommit remains the authorized execution base.
- No runner start endpoint was contacted, no OpenCode process was started, and FP-027 did not run.

## Boundaries

- execution authorized: false
- approval created: false
- approval consumed: false
- disable switch cleared: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- local clearance artifact created: false
- local clearance artifact mutated: false
- standing execution authority created: false

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
FP_MCP_226_OPERATOR_LOCAL_CLEARANCE_TWO_COMMIT_BINDING_IMPLEMENTED
```
