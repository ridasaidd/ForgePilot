# FP-MCP-225 — Operator-Local Clearance Commit-Binding Policy Clarification

## Checkpoint Type

```text
COMMIT_BINDING_POLICY_CLARIFICATION
```

## Summary

Clarify the commit-binding policy for the operator-local clearance path after FP-MCP-224 exposed a mismatch between remote-runner request validation and the read-only operator-local clearance observer. The policy decision is to treat the authorization scope as a two-commit tuple: executionBaseCommit names the code/workspace state being authorized for model work, while requestArtifactCommit names the evidence commit proving the request artifact exists. Future observer validation should require the current workspace HEAD to equal requestArtifactCommit, require the request artifact execution base to match the approved executionBaseCommit, require executionBaseCommit to be an ancestor of requestArtifactCommit, and require the target workspace to be clean. This avoids invalidating a request merely because the request artifact itself was committed, while preserving exact current-HEAD binding for the evidence state that approval and local clearance observe.

## Claim

```text
FP_MCP_225_OPERATOR_LOCAL_CLEARANCE_COMMIT_BINDING_POLICY_CLARIFIED
```

## Caveats

- This packet records policy clarification only; it does not modify MCP bridge code.
- The current operator-local clearance observer may still require exact current commit to match targetExecutionCommit until a later implementation packet updates it.
- No fresh approval should be recorded for FP-MCP-223 until the observer and approval terminology can represent the two-commit tuple or an equivalent safe binding.
- The old FP-MCP-209 tuple remains stale and must not be used for local clearance.
- FP-MCP-223 request REQ-20260703T125101090Z-8535b3c0 remains non-executing and only eligible under remote-runner request-artifact validation, not under the full operator-local clearance path.

## Boundaries

- execution authorized: false
- fresh approval created: false
- approval consumed: false
- disable switch cleared: false
- runner start endpoint contacted: false
- OpenCode started: false
- FP-027 canary run: false
- local clearance artifact created: false
- standing execution authority created: false
- MCP bridge code modified: false

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
FP_MCP_225_OPERATOR_LOCAL_CLEARANCE_COMMIT_BINDING_POLICY_CLARIFIED
```
