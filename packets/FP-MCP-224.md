# FP-MCP-224 — Fresh Request Artifact Commit-Binding Gap

## Checkpoint Type

```text
FRESH_REQUEST_ARTIFACT_COMMIT_BINDING_GAP
```

## Summary

Record the FP-MCP-223 fresh request artifact result and the newly observed commit-binding gap in the operator-local clearance path. FP-MCP-223 successfully created and committed a fresh non-executing request artifact, and the remote-runner request validator accepts it because the request base commit is an ancestor of the artifact commit. However, the operator-local clearance observer requires the current workspace commit to exactly match the clearance targetExecutionCommit. Because committing the request artifact moved HEAD from the request target commit 6fb3a32 to artifact commit d1607d4, creating a fresh approval and local clearance immediately may recreate a stale-tuple failure unless the commit-binding policy is clarified.

## Claim

```text
FP_MCP_224_FRESH_REQUEST_ARTIFACT_COMMIT_BINDING_GAP_RECORDED
```

## Caveats

- FP-MCP-223 request artifact REQ-20260703T125101090Z-8535b3c0 was created non-executingly and committed at d1607d4.
- The request artifact target/base commit is 6fb3a32, while current HEAD after committing the request artifact is d1607d4.
- forgepilot_validate_remote_runner_request returned eligible true for the request artifact because creation commit 6fb3a32 is an ancestor of artifact commit d1607d4 and the artifact commit is reachable from HEAD.
- forgepilot_validate_pre_start_evidence without approval returned invalid/incomplete as expected: human approval missing, global disable active, pre-start evidence missing, and no execution permitted.
- No fresh approval was created because the exact target commit to bind for operator-local clearance requires policy clarification.
- No local clearance artifact was created or modified through MCP.

## Boundaries

- execution authorized: false
- approval consumed: false
- fresh approval created: false
- disable switch cleared: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- local clearance artifact created: false
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
FP_MCP_224_FRESH_REQUEST_ARTIFACT_COMMIT_BINDING_GAP_RECORDED
```
