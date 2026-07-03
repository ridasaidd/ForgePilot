# FP-MCP-225 Result Summary

## Result

```text
FP_MCP_225_OPERATOR_LOCAL_CLEARANCE_COMMIT_BINDING_POLICY_CLARIFIED
```

## Summary

Clarify the commit-binding policy for the operator-local clearance path after FP-MCP-224 exposed a mismatch between remote-runner request validation and the read-only operator-local clearance observer. The policy decision is to treat the authorization scope as a two-commit tuple: executionBaseCommit names the code/workspace state being authorized for model work, while requestArtifactCommit names the evidence commit proving the request artifact exists. Future observer validation should require the current workspace HEAD to equal requestArtifactCommit, require the request artifact execution base to match the approved executionBaseCommit, require executionBaseCommit to be an ancestor of requestArtifactCommit, and require the target workspace to be clean. This avoids invalidating a request merely because the request artifact itself was committed, while preserving exact current-HEAD binding for the evidence state that approval and local clearance observe.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
