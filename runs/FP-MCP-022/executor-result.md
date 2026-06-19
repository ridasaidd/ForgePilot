# FP-MCP-022 Executor Result

## Packet

FP-MCP-022 — Add Remote Runner Start Tool

## Repository State

ForgePilot repository:

```text
/home/ridasaidd/forgepilot
```

ForgePilot branch:

```text
main
```

ForgePilot packet commit:

```text
325d4e1
```

Working tree after packet commit:

```text
clean
```

## Bridge State

Bridge repository:

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

Bridge branch:

```text
feature/oauth-auth0
```

Bridge implementation commit:

```text
a861366
```

Bridge implementation commit message:

```text
Add remote runner start tool
```

## Implementation Summary

FP-MCP-022 added a guarded MCP tool that may request the private dev runner to start an OpenCode run only after all required gates pass.

Tool added:

```text
forgepilot_start_remote_runner_request
```

The tool accepts only:

```text
packetId
requestId
approval
```

The tool requires exact approval:

```text
START_REMOTE_RUNNER_REQUEST
```

The tool does not accept:

* runner URL
* HTTP method
* raw HTTP body
* prompt
* command
* shell
* model override
* run-mode override
* artifact directory override
* arbitrary repository path
* environment variables
* secrets
* OpenCode options
* provider credentials

## Tool Metadata

The tool is execution-adjacent and intentionally not read-only.

Expected annotations:

```text
readOnlyHint: false
destructiveHint: false
idempotentHint: false
openWorldHint: true
```

ChatGPT displayed a confirmation window for the tool, which is expected for this metadata.

## Build and Test Result

Bridge verification:

```text
pnpm build: PASS
pnpm test: PASS
```

Service restart:

```text
PASS
```

## Live Tool Verification — Approval Failure

Tool discovered through ChatGPT Actions/MCP:

```text
forgepilot_start_remote_runner_request
```

Input:

```json
{
  "packetId": "FP-MCP-007",
  "requestId": "REQ-20260619T084312145Z-a9960bd6",
  "approval": "WRONG_APPROVAL"
}
```

Observed structured result:

```json
{
  "started": false,
  "accepted": false,
  "approvalAccepted": false,
  "runnerConfigured": false,
  "runnerContacted": false,
  "startEndpointContacted": false,
  "executionStarted": false,
  "packetId": "FP-MCP-007",
  "requestId": "REQ-20260619T084312145Z-a9960bd6",
  "requestArtifactPath": null,
  "requestArtifactSha256": null,
  "baseCommit": null,
  "runnerRunId": null,
  "artifactDir": null,
  "runnerProtocolVersion": null,
  "boundaryVersion": "FP-MCP-022",
  "statusSource": "ForgePilot remote-runner start policy",
  "checkedAt": "2026-06-19T13:48:14.363Z",
  "localValidationPassed": false,
  "remoteValidationPassed": false,
  "preStartStateRecorded": false,
  "postStartStateRecorded": false,
  "reasons": [
    "APPROVAL_REQUIRED"
  ]
}
```

Result:

```text
PASS
```

The tool stopped before local validation, remote validation, runner contact, start endpoint contact, state artifact writing, or OpenCode execution.

## Live Tool Verification — Correct Approval, Unsafe Environment

Input:

```json
{
  "packetId": "FP-MCP-007",
  "requestId": "REQ-20260619T084312145Z-a9960bd6",
  "approval": "START_REMOTE_RUNNER_REQUEST"
}
```

Observed structured result:

```json
{
  "started": false,
  "accepted": false,
  "approvalAccepted": true,
  "runnerConfigured": false,
  "runnerContacted": false,
  "startEndpointContacted": false,
  "executionStarted": false,
  "packetId": "FP-MCP-007",
  "requestId": "REQ-20260619T084312145Z-a9960bd6",
  "requestArtifactPath": "runs/FP-MCP-007/opencode-requests/REQ-20260619T084312145Z-a9960bd6.json",
  "requestArtifactSha256": "d6ceb2e10f58eb43b85bc485efeec5870db758837eb62d9181788860dacae90d",
  "baseCommit": "325d4e1",
  "runnerRunId": null,
  "artifactDir": "runs/FP-MCP-007/qwen-3.7-max-DESIGN_ONLY/",
  "runnerProtocolVersion": null,
  "boundaryVersion": "FP-MCP-022",
  "statusSource": "ForgePilot remote-runner start policy",
  "checkedAt": "2026-06-19T13:49:05.431Z",
  "localValidationPassed": false,
  "remoteValidationPassed": false,
  "preStartStateRecorded": false,
  "postStartStateRecorded": false,
  "reasons": [
    "RUNNER_UNCONFIGURED",
    "BASE_COMMIT_MISMATCH"
  ]
}
```

Result:

```text
PASS
```

The approval token was accepted, but the tool still failed closed because the runner is unconfigured and the old request artifact base commit does not match the current repository commit.

## Scope Confirmation

FP-MCP-022 did not add:

* remote runner implementation code
* OpenCode CLI invocation from the staging bridge
* OpenCode API invocation from the staging bridge
* shell execution from the staging bridge
* arbitrary HTTP proxying
* arbitrary URL fetching
* raw prompt transmission
* raw command transmission
* model override
* run-mode override
* arbitrary path execution
* request artifact mutation
* SQLite mutation
* automatic retries
* background execution from the staging bridge

## Safety Confirmation

The tests confirm:

```text
approval failure prevents all later gates
correct approval alone is insufficient
local validation failure prevents runner contact
unconfigured runner prevents runner contact
stale request artifact prevents start
startEndpointContacted remains false
executionStarted remains false
preStartStateRecorded remains false
postStartStateRecorded remains false
```

## Result

FP-MCP-022 satisfies its guarded remote runner start tool implementation scope in the current unconfigured environment.

Status:

```text
ACCEPTED_FOR_VERIFICATION
```
