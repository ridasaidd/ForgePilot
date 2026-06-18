# FP-MCP-004 — Safe MCP Tool Invocation Logging

## Task

Add safe, sanitized MCP tool invocation logging to the ForgePilot ChatGPT MCP bridge.

## Goal

Allow ForgePilot to distinguish between:

* ChatGPT/OpenAI platform-side tool blocks
* MCP session initialization
* bridge-side tool invocation
* bridge-side validation rejection
* bridge-side tool completion
* bridge-side tool failure

FP-MCP-004 answers one question:

**Did a ChatGPT MCP tool call reach the ForgePilot bridge, and did the bridge complete or reject it, without logging sensitive data?**

This packet may change bridge runtime behavior only to add safe operational logging.

It must not add new tools.

It must not add shell execution.

It must not add OpenCode execution.

It must not add write access.

It must not mutate ForgePilot repository data.

It must not mutate Git.

It must not mutate SQLite.

---

## Scope Boundary

FP-MCP-004 may update the ForgePilot ChatGPT MCP bridge to log:

* tool invocation start
* tool completion
* tool failure
* sanitized error code
* duration in milliseconds
* tool name
* timestamp

FP-MCP-004 must not log:

* full ChatGPT prompts
* full ChatGPT conversations
* MCP request bodies
* tool arguments
* file contents
* tool result contents
* OAuth tokens
* Auth0 secrets
* provider API keys
* environment variables
* OpenCode secrets
* SSH keys
* passwords
* MFA codes
* `.env` contents
* raw stack traces containing sensitive data
* arbitrary filesystem paths outside already approved safe labels

---

## Governing Principles

This packet is constrained by:

* P01 — ForgePilot records observations, not narratives.
* P02 — Trust cannot be retroactively created.
* P03 — ForgePilot does not optimize for favorable outcomes.
* P04 — Only admitted evidence may influence observatory outputs.
* P05 — Do not build infrastructure for evidence that does not yet exist.
* P06 — Classification follows observation.

---

## Relationship to FP-MCP-001

FP-MCP-001 defines the OpenCode executor authority boundary.

FP-MCP-004 must preserve the FP-MCP-001 rule:

> ChatGPT must never receive a generic command runner.

Logging must not become an execution path.

Logging must not expose shell access, OpenCode access, Git access, SQLite access, or server administration access.

---

## Relationship to FP-MCP-002

FP-MCP-002 added the read-only OpenCode status discovery tool:

```text
forgepilot_get_opencode_status

FP-MCP-004 may add logging around this tool invocation.

It must not change the tool response shape except where unavoidable.

It must preserve:

opencodeExecutionEnabled: false
liveOpenCodeChecked: false
statusSource: static ForgePilot-safe configuration
Relationship to FP-MCP-003

FP-MCP-003 defines the ChatGPT MCP compliance boundary.

FP-MCP-004 implements only the safe logging portion of that boundary.

The FP-MCP-003 logging rule remains governing:

Allowed logs:

timestamp
tool name
success/failure
sanitized error code
duration
session initialized

Forbidden logs:

full prompts
full conversations
OAuth tokens
API keys
environment variables
file contents
secret-bearing config
passwords
MFA codes
private keys
Required Log Shape

Recommended log lines:

MCP tool invoked: forgepilot_status
MCP tool completed: forgepilot_status PASS durationMs=12
MCP tool completed: forgepilot_read_file FAIL errorCode=FORBIDDEN_PATH durationMs=8

The log may include timestamps if the runtime does not already add them.

The log must not include tool arguments.

The log must not include tool results.

The log must not include file contents.

The log must not include raw prompts.

The log must not include secrets.

Required Tool Coverage

Logging must cover all current MCP tools:

forgepilot_status
forgepilot_read_file
forgepilot_list_packets
forgepilot_list_runs
forgepilot_get_opencode_status
Failure Classification

Failures should be logged with sanitized error codes.

Recommended examples:

UNKNOWN_ERROR
FORBIDDEN_PATH
INVALID_INPUT
TOOL_EXCEPTION

Raw exception messages should not be logged unless explicitly sanitized.

Stack traces should not be logged for normal tool-call failure logging.

Platform Block Distinction

If ChatGPT/OpenAI blocks a tool call before sending it to the MCP bridge, the bridge should show no matching tool invocation log.

If the bridge receives the call, the bridge should log:

MCP tool invoked: <tool_name>

This distinction is the main evidence goal of FP-MCP-004.

Acceptance Criteria
Safe MCP tool invocation logging is implemented in the bridge.
All current MCP tools log invocation start.
All current MCP tools log completion or failure.
Logs include tool name.
Logs include success/failure.
Logs include duration.
Failure logs use sanitized error codes.
Logs do not include tool arguments.
Logs do not include tool result contents.
Logs do not include file contents.
Logs do not include prompts or conversations.
Logs do not include environment variables.
Logs do not include secrets.
No new MCP tools are added.
No shell execution is added.
No OpenCode execution is added.
No filesystem mutation tools are added.
No Git mutation is added.
No SQLite mutation is added.
Existing tools continue to work.
forgepilot_get_opencode_status still reports execution disabled.
Verification Requirements

In the bridge repo, run and record:

pnpm build
pnpm test

Restart the user service:

systemctl --user restart forgepilot-chatgpt-mcp-oauth.service
systemctl --user status forgepilot-chatgpt-mcp-oauth.service --no-pager

Verify through ChatGPT MCP connector that these tools still work:

forgepilot_status
forgepilot_read_file
forgepilot_list_packets
forgepilot_list_runs
forgepilot_get_opencode_status

Verify service output shows sanitized tool-call logs similar to:

MCP tool invoked: forgepilot_status
MCP tool completed: forgepilot_status PASS

Record artifacts under:

runs/FP-MCP-004/

Recommended artifacts:

runs/FP-MCP-004/executor-result.md
runs/FP-MCP-004/verification.txt
