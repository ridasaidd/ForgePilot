# FP-MCP-142 — MCP v1 Runner Smoke Blocked Start

## Outcome

The first simplified MCP v1 runner smoke attempt contacted `/runner/start-run`, but the runner refused to start OpenCode.

No OpenCode execution was started.

## Observed Result

The runner returned:

```text
accepted: false
executionStarted: false
opencodeStarted: false
runnerRunId: null
```

Observed blocker reasons:

```text
DIRTY_WORKING_TREE
BASE_COMMIT_MISMATCH
```

## Interpretation

This was a useful v1 policy failure.

`DIRTY_WORKING_TREE` happened because the smoke script wrote capability evidence inside the repository before calling `/runner/start-run`.

`BASE_COMMIT_MISMATCH` happened because the runner required request base commit to equal current HEAD. For MCP v1, the target/base commit should be accepted when it is reachable from current HEAD, not only when it equals current HEAD.

## Next Policy

The runner should preserve dirty-tree blocking but change base commit validation to:

```text
target/base commit must be an ancestor of current HEAD
```

not:

```text
target/base commit must equal current HEAD
```
