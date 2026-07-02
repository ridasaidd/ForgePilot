# SHADOW-REF-001 — server.ts Structure Map

## Boundary

This artifact is read-only analysis.

It is not a refactor plan, not an implementation, not an audit, and not authorization to modify the live MCP bridge server.

## File Baseline

| Field | Value |
|---|---|
| Source repository | `/home/ridasaidd/forgepilot-chatgpt-mcp` |
| Branch | `feature/oauth-auth0` |
| Commit | `3a16d68` |
| File | `src/server.ts` |
| Size | `10,364` lines |
| Live entrypoint | `src/server.ts` |

Supporting outline artifacts:

```text
instrument-projects/forgepilot-chatgpt-mcp/runs/SHADOW-REF-001/server-outline.txt
instrument-projects/forgepilot-chatgpt-mcp/runs/SHADOW-REF-001/server-functions.txt
instrument-projects/forgepilot-chatgpt-mcp/runs/SHADOW-REF-001/server-tool-markers.txt
instrument-projects/forgepilot-chatgpt-mcp/runs/SHADOW-REF-001/create-mcp-server-window.txt
instrument-projects/forgepilot-chatgpt-mcp/runs/SHADOW-REF-001/server-line-windows.txt
```

## Top-Level Responsibility Summary

`src/server.ts` currently combines at least eight responsibilities:

1. repository/git helper utilities,
2. OpenCode and remote-runner policy/status helpers,
3. request artifact validation and creation,
4. execution preflight and dry-run evidence handling,
5. human approval evidence and approval-consumption handling,
6. guarded-start preflight/report/start logic,
7. MCP tool registration and tool response wrapping,
8. HTTP transport, OAuth/resource metadata, authorization, and server startup.

This makes the file a live entrypoint plus policy, validation, evidence, tool-registration, and transport implementation all in one file.

## Major Sections by Approximate Line Range

| Approx. lines | Area | Notes |
|---:|---|---|
| 1–28 | Imports and constants | MCP SDK, zod, HTTP, child process, filesystem/path/crypto, auth/OAuth metadata. |
| 29–146 | Git and repository file helpers | `git`, ancestor checks, artifact commit lookup, safe repo reads. |
| 147–1121 | Static policy/constants and likely schema/config surface | Large pre-helper region before structured result; should be reviewed carefully before extraction. |
| 1122–1320 | Result wrapping, packet validation, OpenCode status/capability, remote runner status | Readiness and static capability reporting. |
| 1487–2065 | OpenCode run request and remote-runner request validation | Request artifact validation, request id safety, remote runner validate endpoint. |
| 2341–2806 | Execution preflight gates and dry-run artifact directory helpers | Guard checks for execution, enablement, and blocked reasons. |
| 2814–3451 | Artifact read/write and dry-run verification | Repository artifact helpers and execution dry-run verification. |
| 3464–3815 | Execution enablement / disable switch status | Policy status and disable switch behavior. |
| 3821–4240 | Human approval validation helpers | Canonical approval text, secret-like material checks, approval ids, committed evidence checks. |
| 4240–5669 | Approval evidence recording and consumption | Real approval evidence, dry-run fixture, consumption artifacts, remote runner start URL and run id validation. |
| 5750–7282 | Runner start state and pre-start evidence | Start contract status, state snapshots, pre-start validation and dry-run recording. |
| 7302–8093 | Guarded-start evidence derivation and report | FP-MCP-124-specific guarded start helpers and preflight report. |
| 8093–9014 | Remote runner start request and request artifact creation preparation | Start request, expected artifacts, allowed/forbidden actions, boolean/string helpers. |
| 9014–9240 | OpenCode request artifact creation | Writes request artifacts and expected contract fields. |
| 9240–9280 | Tool error handling and logged tool wrapper | `sanitizeToolErrorCode`, `runLoggedTool`. |
| 9280–10268 | MCP server creation and tool registration | Registers all MCP tools and schemas. |
| 10268–10364 | HTTP transport, OAuth metadata/auth, and listen/startup | `getHeader`, `createServer`, `/mcp`, OAuth protected resource metadata, authorization, server listen. |

## MCP Tool Registration Areas

`createMcpServer()` starts around line 9280. Tool registration is concentrated from roughly 9288 to 10229.

Observed tool registrations:

| Approx. source line | Tool |
|---:|---|
| 9288 | `forgepilot_status` |
| 9331 | `forgepilot_get_opencode_status` |
| 9352 | `forgepilot_get_opencode_capabilities` |
| 9374 | `forgepilot_get_remote_runner_status` |
| 9396 | `forgepilot_list_packets` |
| 9430 | `forgepilot_list_runs` |
| 9463 | `forgepilot_validate_opencode_run_request` |
| 9489 | `forgepilot_create_opencode_run_request` |
| 9521 | `forgepilot_list_opencode_run_requests` |
| 9546 | `forgepilot_read_opencode_run_request` |
| 9571 | `forgepilot_validate_remote_runner_request` |
| 9596 | `forgepilot_validate_remote_runner_endpoint_request` |
| 9627 | `forgepilot_validate_execution_preflight` |
| 9657 | `forgepilot_record_execution_artifact_dry_run` |
| 9685 | `forgepilot_verify_execution_artifact_dry_run` |
| 9720 | `forgepilot_get_execution_enablement_status` |
| 9748 | `forgepilot_get_execution_disable_switch_status` |
| 9785 | `forgepilot_record_real_human_approval_evidence` |
| 9854 | `forgepilot_record_human_approval_consumption` |
| 9914 | `forgepilot_record_human_approval_evidence_dry_run_fixture` |
| 9956 | `forgepilot_validate_human_approval_record` |
| 9998 | `forgepilot_record_pre_start_evidence_dry_run` |
| 10033 | `forgepilot_validate_pre_start_evidence` |
| 10061 | `forgepilot_validate_start_request_state_snapshot` |
| 10090 | `forgepilot_record_start_state_snapshot_dry_run` |
| 10124 | `forgepilot_get_guarded_start_preflight_report` |
| 10154 | `forgepilot_start_remote_runner_request` |
| 10188 | `forgepilot_read_file` |
| 10229 | `forgepilot_execute_terminal_command` |

## Auth / OAuth / Session Areas

| Approx. lines | Area | Notes |
|---:|---|---|
| 10–11 | Auth/OAuth imports | `authorizeRequest`, protected resource metadata, WWW-Authenticate header. |
| 10274–10362 | HTTP server and auth gate | Handles OAuth protected resource metadata endpoints and `/mcp` auth. |
| 10302–10315 | Authorization decision | Calls `authorizeRequest(getHeader(req, "authorization"))`; sets `www-authenticate` in OIDC mode. |

Risk: auth and OAuth behavior must not be changed during early shadow refactor steps.

## Terminal Command Execution Areas

| Approx. lines | Area | Notes |
|---:|---|---|
| 10229–10268 | `forgepilot_execute_terminal_command` registration | User-approved terminal command MCP tool. |
| Supporting helpers earlier in file | command validation/evidence behavior | Needs deeper packet-specific review before extraction. |

Risk: terminal execution is high-risk because it is the active orchestration path from ChatGPT into ForgePilot and bridge workspaces.

## Telemetry / Evidence Areas

Evidence handling appears spread across multiple sections:

| Approx. lines | Area |
|---:|---|
| 79–106 | committed artifact discovery helpers |
| 2814–3451 | artifact read/write, dry-run recording, dry-run verification |
| 4240–5669 | human approval evidence and consumption artifacts |
| 5750–7282 | pre-start evidence and state snapshots |
| 7302–8093 | guarded-start evidence/readiness report |
| 9014–9240 | OpenCode request artifact creation |

Risk: evidence semantics are central to ForgePilot trust. Extraction should be mechanical and heavily verified.

## Validation / Error Handling Areas

| Approx. lines | Area |
|---:|---|
| 1134–1608 | packet id, request id, artifact path validation |
| 1487–2065 | OpenCode and remote-runner request validation |
| 2341–2806 | preflight gates and reason normalization |
| 3821–4240 | approval validity and secret-like material validation |
| 9240–9280 | tool error code sanitization and logged tool wrapper |

Risk: validation helpers are good extraction candidates, but only if moved without behavior changes and covered by smoke checks.

## Service Startup / Runtime Areas

| Approx. lines | Area |
|---:|---|
| 9280–10268 | MCP server creation and tool registration |
| 10268–10364 | HTTP server transport and listening |

Risk: startup and transport should be among the last things touched. The live entrypoint must remain unchanged until switch proof exists.

## Likely Extraction Seams

These are candidate seams only. They do not authorize implementation.

| Candidate seam | Why it may be extractable | Risk |
|---|---|---|
| Repository/git helpers | Early pure helper functions with limited dependencies. | Low to medium. Must preserve cwd/root assumptions. |
| Safe id/path validation helpers | Reused validation utilities. | Medium. Mistakes can create path traversal or evidence corruption risk. |
| OpenCode status/capability helpers | Distinct status/reporting area. | Low to medium. |
| Remote runner URL/header/capability helpers | Clustered functions around remote runner base URL and endpoints. | Medium. Network/contact boundaries must remain unchanged. |
| Request artifact helpers | Cohesive request artifact creation/list/read/validate functions. | Medium to high. Evidence path contracts must remain unchanged. |
| Execution preflight helpers | Logical cluster with gate/reason logic. | High. Policy semantics must be preserved. |
| Human approval helpers | Cohesive but safety-critical. | High. Approval text, secret checks, and committed evidence checks are sensitive. |
| Guarded-start report helpers | Large self-contained FP-MCP-124-derived region. | Medium to high. Needs dedicated tests/smoke. |
| Tool registration table | Could eventually be separated after helper extraction. | High. Tool schemas are public instrument contract. |
| HTTP transport/auth startup | Clear section but should be last. | Very high. Breaks MCP connectivity if wrong. |

## High-Risk Zones

1. **Auth/OAuth and `/mcp` transport** around lines 10274–10364.
2. **`forgepilot_execute_terminal_command` tool registration** around line 10229.
3. **Tool schemas and names** throughout `createMcpServer()` around lines 9280–10268.
4. **Human approval validation and consumption** around lines 3821–5669.
5. **Execution preflight and enablement/disable switch logic** around lines 2341–3815.
6. **Remote runner start request** around lines 8093–9014 and tool registration around 10154.
7. **Artifact path/id validation** around lines 1134–1608 and related write helpers.
8. **Any code that contacts remote runner endpoints** because contact/no-contact boundaries are part of tool promises.

## Suggested First Safe Analysis Follow-Up

The next checklist item should be:

```text
SR-002 — Identify high-risk zones
```

However, SR-002 can reuse this structure map as input and should be treated as read-only risk analysis, not refactor planning.

## Explicit Non-Refactor Statement

No MCP bridge files were changed by this structure map.

No `server-next.ts` was created.

No runtime entrypoint was changed.

No OpenAI Actions schema or MCP tool contract was changed.

No model implementation work was authorized.
