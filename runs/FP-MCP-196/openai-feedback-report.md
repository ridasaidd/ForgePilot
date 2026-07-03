# Draft OpenAI Feedback Report — ChatGPT MCP Tool Call Safety Blocks

## Submission status

```text
NOT_SUBMITTED
```

This is a prepared report package for operator review before any submission to OpenAI support.

## Issue summary

We are developing and testing a custom MCP server for a local software-production observatory project. Two ChatGPT-to-MCP tool invocations were blocked by OpenAI platform safety checks before the MCP server received the calls. One block occurred on a scoped, human-approved request-artifact preparation path for a sandboxed execution test. A later block occurred on a benign single-purpose repository validation command after several MCP calls in sequence.

We are not asking for policy relaxation. We are trying to understand whether these are expected platform safety behaviors, false positives, cadence/rate-related behavior, action-schema/content-related behavior, or some combination.

## Exact block message

```text
This tool call was blocked by OpenAI's safety checks. Please double check what you are sending.
```

## Environment / account fields to fill before submission

```text
Account email: OPERATOR_TO_FILL
Plan: OPERATOR_TO_FILL
Workspace / Organization ID or name: OPERATOR_TO_FILL
ChatGPT client: ChatGPT web in mobile Safari on iOS, if still accurate at submission time
Approximate location/time zone: Europe/Stockholm
MCP server/project: ForgePilot ChatGPT MCP bridge
MCP transport/deployment details: OPERATOR_TO_FILL if relevant
Browser/device/network details: OPERATOR_TO_FILL
Screenshots/HAR: OPERATOR_TO_ATTACH_IF_AVAILABLE
```

Do not include passwords, one-time codes, secrets, raw API keys, `.env` contents, private credentials, or unnecessary personal data.

## Incident 1 — FP-MCP-187 request-artifact creation block

```text
Local evidence packet: FP-MCP-187
Local result: FP_MCP_187_FPMCP183_FRESH_TUPLE_REQUEST_CREATION_BLOCKED_BEFORE_FORGEPILOT_NO_ENABLEMENT
Approximate date/time: 2026-07-03 session; exact platform request timestamp unavailable in local MCP evidence because the call was blocked before ForgePilot received it
Associated OpenAI request ID: unavailable to operator from ChatGPT UI/tool response
Local MCP request evidence path: none, because the call did not reach the MCP bridge
```

Redacted task description:

```text
Creating a scoped, human-approved request artifact for a sandboxed execution test. The artifact was intended only to record preparation state and did not authorize execution, contact a runner, start OpenCode, or run a canary.
```

Attempted MCP tool call:

```text
tool: forgepilot_create_opencode_run_request
packetId: FP-MCP-183
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
approval: CREATE_REQUEST_ARTIFACT
```

Observed result:

```text
The platform blocked the tool call before ForgePilot received it. No request artifact was created, no approval was created or consumed, no runner start endpoint was contacted, no OpenCode process was started, and no FP-027 canary ran.
```

## Incident 2 — FP-MCP-195 single-purpose validation command block

```text
Local evidence packet: FP-MCP-195
Local recorded observation: single-purpose git diff --check invocation blocked before bridge execution after several MCP calls in sequence
Approximate bounded timestamp window: after 2026-07-03T08:26:26Z and before 2026-07-03T08:26:48Z
Associated OpenAI request ID: unavailable to operator from ChatGPT UI/tool response
Local MCP request evidence path: none for the blocked call, because it did not reach the MCP bridge
```

Redacted task description:

```text
Running a single-purpose repository whitespace/diff validation command while recording operational policy evidence. The command was read-only validation and was not related to execution enablement.
```

Attempted MCP terminal command:

```text
command: git diff --check
workspace: /home/ridasaidd/forgepilot
packetId: FP-MCP-195
```

Observed result:

```text
The platform blocked the terminal tool call before ForgePilot received it. The same session then recorded the block as an observation. This is consistent with, but does not confirm, a cadence or platform false-positive hypothesis. It is not evidence of ForgePilot bridge failure.
```

## Steps to reproduce observed pattern

The operator does not have a reliable reproduction. The observed pattern is:

```text
1. Use ChatGPT with a custom MCP server exposing typed ForgePilot tools.
2. Make several MCP tool calls in sequence during a single operational session.
3. Attempt either an enablement-adjacent create-only request-artifact tool call, or a single-purpose terminal validation command.
4. Intermittently, ChatGPT returns: "This tool call was blocked by OpenAI's safety checks. Please double check what you are sending."
5. The MCP server has no corresponding request evidence because the blocked call does not reach the bridge.
```

## Current local interpretation

```text
Root cause confirmed: false
Cadence confirmed as cause: false
Content/schema sensitivity confirmed as cause: false
OpenAI platform safety trigger unresolved: true
Local mitigation: conservative MCP invocation cadence; no rephrase/bypass rule; renamed capability equivalence rule
```

## Specific question for OpenAI

```text
Can OpenAI clarify why these ChatGPT-to-MCP tool calls were blocked, and whether the blocks were due to call cadence, tool schema/description/content, enablement-adjacent semantics, terminal-command semantics, or another safety signal?

If available, please advise how MCP server developers should design tool names, descriptions, schemas, annotations, and invocation cadence to reduce false positives while preserving OpenAI safety expectations.
```
