# FP-MCP-227 — Fresh Scoped Approval for Two-Commit Clearance Path

## Checkpoint Type

```text
FRESH_SCOPED_APPROVAL_PREPARATION
```

## Summary

Prepare a fresh scoped approval packet for the FP-MCP-223 request after FP-MCP-225 clarified the two-commit policy and FP-MCP-226 implemented observer support. This checkpoint records preparation only. The approval recorder remains backward-compatible with a single repoCommit field, so the approval evidence should bind repoCommit to the request execution base commit 6fb3a32, while the later operator-local clearance artifact should carry both executionBaseCommit 6fb3a32 and requestArtifactCommit dccc41c/current HEAD or later exact evidence HEAD. This checkpoint does not create local clearance, consume approval, clear the disable switch, contact runner start, start OpenCode, or run FP-027.

## Claim

```text
FP_MCP_227_FRESH_SCOPED_APPROVAL_PREPARATION_RECORDED
```

## Caveats

- The structured approval recorder currently exposes one repoCommit field, not a first-class two-commit tuple.
- The approval repoCommit should remain compatible with the request artifact execution base commit 6fb3a32.
- The later operator-local clearance artifact must include executionBaseCommit and requestArtifactCommit to satisfy the FP-MCP-226 observer policy.
- Any later evidence commit may advance HEAD again; the local clearance requestArtifactCommit must match the exact HEAD observed at clearance time.
- This checkpoint does not create or mutate local clearance.

## Boundaries

- execution authorized: false
- approval consumed: false
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
FP_MCP_227_FRESH_SCOPED_APPROVAL_PREPARATION_RECORDED
```
