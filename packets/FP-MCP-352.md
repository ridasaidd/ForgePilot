# FP-MCP-352 — Server tool-group extraction Phase 2

## Checkpoint Type

```text
IMPLEMENTATION_PHASE_RESULT
```

## Summary

Copilot performed the second bounded MCP bridge refactor phase in /home/ridasaidd/forgepilot-chatgpt-mcp only. The phase moved forgepilot_validate_opencode_run_request, forgepilot_validate_remote_runner_request, forgepilot_validate_scoped_execution_clearance, and forgepilot_validate_execution_preflight into src/tool-groups/validation-tools.ts and updated src/tool-registry/index.ts plus src/server.ts delegation. Verification showed pnpm test passed and full selected tool-registration parity remained 68 -> 68 with identical sorted names, no additions, no removals, and no duplicates. Bridge commit f3a9063 records the implementation.

## Claim

```text
FP-MCP-352 Phase 2 completed a behavior-preserving extraction of four read-only validation/preflight MCP tools from src/server.ts into a validation tool group without changing the registered tool surface.
```

## Caveats

- This was Phase 2 only, not a complete server.ts normalization.
- forgepilot_validate_remote_runner_endpoint_request intentionally remained in server.ts because it is external-contact/openWorld validation.
- forgepilot_evaluate_consuming_action_no_contact intentionally remained in server.ts because it is not read-only and may write a readiness artifact.
- The running MCP service may still be using old loaded code until the service is restarted/refreshed; this checkpoint records source-level implementation and verification only.
- The bridge branch remains ahead of origin until pushed manually.

## Boundaries

- Did not modify /home/ridasaidd/forgepilot during Copilot implementation.
- Did not change MCP tool names.
- Did not change tool descriptions, input schemas, output schemas, annotations, approval literals, or intended handler behavior.
- Did not move external-contact endpoint validation or no-contact consuming action tools.
- Did not move approval, clearance creation/intent, enablement, runner-start, OpenCode session/canary/delete/wait, terminal, or deprecated/legacy tools.
- Did not start OpenCode.
- Did not contact runner start.
- Did not create clearance.
- Did not record clearance intent.
- Did not consume approval.
- Did not clear the disable switch.

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
FP-MCP-352 Phase 2 completed a behavior-preserving extraction of four read-only validation/preflight MCP tools from src/server.ts into a validation tool group without changing the registered tool surface.
```
