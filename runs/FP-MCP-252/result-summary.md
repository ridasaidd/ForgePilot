# FP-MCP-252 Result Summary

## Result

```text
FP_MCP_252_HTTP_FIRST_MCP_TOOL_BOUNDARY_REVIEW_COMPLETED
```

## Summary

FP-MCP-252 reviewed the MCP bridge tool surface after the OpenCode HTTP experiments FP-MCP-244 through FP-MCP-251. Source inventory found 49 registered tools in src/server.ts at bridge commit c11bbda. Eight tools are now classified as HTTP-primary for OpenCode lifecycle learning and future model execution orchestration: forgepilot_get_opencode_http_session_status, forgepilot_get_opencode_http_session_status_shape, forgepilot_run_opencode_http_minimal_session_canary, forgepilot_run_opencode_http_minimal_async_prompt_canary, forgepilot_run_opencode_http_wait_endpoint_probe, forgepilot_run_opencode_http_message_shape_probe, forgepilot_run_opencode_http_assistant_completion_probe, and forgepilot_read_opencode_http_assistant_completion. The evidence-backed lifecycle path is: POST /session for session creation, POST /session/{id}/prompt_async for prompt submission, and GET /session/{id}/message with role-aware assistant text parsing for completion. Terminal access remains secondary scaffolding for repo inspection, source edits, builds, commits, and diagnostics; it should not be the primary OpenCode model lifecycle mechanism now that HTTP behavior is observed. Remote runner and request/approval/pre-start tools remain safety-gated infrastructure rather than the primary local model lifecycle path. Existing OpenCode worker tools visible in the action surface should be treated as legacy or secondary pending a later migration decision, because HTTP session/prompt/message semantics are now directly observed and cleaner than terminal-based OpenCode invocation.

## Boundary

No execution was authorized. No approval was consumed. The disable switch was not cleared. The runner start endpoint was not contacted. OpenCode was not started. FP-027 did not run.
