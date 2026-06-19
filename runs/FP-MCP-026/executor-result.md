# FP-MCP-026 Executor Result

## Packet

FP-MCP-026 — Staging Bridge Remote Runner Wiring

## Repository State

ForgePilot repository:

```text
/home/ridasaidd/forgepilot
```

ForgePilot branch:

```text
main
```

Packet commit:

```text
5d01bfc
```

Working tree before verification artifact creation:

```text
clean
```

Local branch state before verification artifact creation:

```text
ahead of origin/main by 1 commit
```

The unpushed local commit is the FP-MCP-025 service-unit implementation:

```text
ad6b9c3 Add FP-MCP-025 runner service unit
```

## Topology Confirmed

The public ChatGPT MCP URL resolves through the staging proxy:

```text
ChatGPT
  -> https://forgepilot-mcp.byteforge.se/mcp
  -> Apache on pistaging
  -> ProxyPass to http://100.80.45.13:8790
  -> MCP bridge on rpsrv
```

The runner service runs on `rpsrv` and remains local-only:

```text
http://127.0.0.1:8791
```

This preserves the intended split:

```text
pistaging: HTTPS proxy only
rpsrv: MCP bridge + private runner
```

## Bridge Wiring

The active MCP bridge service was confirmed on `rpsrv`:

```text
forgepilot-chatgpt-mcp-oauth.service
```

Observed process:

```text
/home/ridasaidd/.nvm/versions/node/v24.4.1/bin/node /home/ridasaidd/forgepilot-chatgpt-mcp/dist/server.js
```

The bridge was wired to the runner through local service environment configuration:

```text
FORGEPILOT_REMOTE_RUNNER_BASE_URL=http://127.0.0.1:8791
FORGEPILOT_REMOTE_RUNNER_TOKEN=<redacted>
```

The token was configured outside Git.

## Runner Service Verification

Runner service:

```text
forgepilot-runner.service
```

Observed status:

```text
active (running)
```

Observed process:

```text
/home/ridasaidd/.nvm/versions/node/v24.4.1/bin/node /home/ridasaidd/forgepilot/runner/server.mjs
```

Runner log confirms:

```text
ForgePilot private dev runner skeleton listening on http://127.0.0.1:8791
```

Health endpoint:

```bash
curl -sS http://127.0.0.1:8791/runner/health
```

Observed:

```text
ok
```

Result:

```text
PASS
```

## Localhost Bind Verification

Command:

```bash
ss -ltnp | grep 8791
```

Observed:

```text
LISTEN ... 127.0.0.1:8791 ... users:(("MainThread",pid=603750,fd=21))
```

Result:

```text
PASS
```

The runner remains bound to localhost only.

It is not exposed as:

```text
0.0.0.0:8791
```

## MCP Remote Runner Status Verification

Tool:

```text
forgepilot_get_remote_runner_status
```

Observed structured result:

```json
{
  "bridgeHostRole": "staging-control-plane",
  "runnerHostRole": "dev-execution-plane",
  "runnerConfigured": true,
  "runnerReachable": true,
  "runnerEndpointLabel": "configured",
  "runnerVersion": "0.1.0-fp-mcp-024",
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "executionEnabled": false,
  "liveRunnerChecked": true,
  "statusSource": "remote runner capabilities endpoint",
  "boundaryVersion": "FP-MCP-018",
  "supportedOperations": [
    "capabilities",
    "validate-request"
  ],
  "supportedRunModes": [
    "DESIGN_ONLY"
  ],
  "allowedModels": [
    "deepseek-v4-pro-high",
    "qwen-3.7-max"
  ],
  "reasons": []
}
```

Result:

```text
PASS
```

The MCP bridge can now reach the private runner capabilities endpoint.

Execution remains disabled.

## Remote Validate Endpoint Verification

Tool:

```text
forgepilot_validate_remote_runner_endpoint_request
```

Input:

```json
{
  "packetId": "FP-MCP-007",
  "requestId": "REQ-20260619T084312145Z-a9960bd6"
}
```

Observed structured result:

```json
{
  "valid": false,
  "runnerConfigured": true,
  "runnerContacted": false,
  "runnerAccepted": false,
  "executionEnabled": false,
  "executionStarted": false,
  "packetId": "FP-MCP-007",
  "requestId": "REQ-20260619T084312145Z-a9960bd6",
  "requestArtifactPath": "runs/FP-MCP-007/opencode-requests/REQ-20260619T084312145Z-a9960bd6.json",
  "requestArtifactSha256": "d6ceb2e10f58eb43b85bc485efeec5870db758837eb62d9181788860dacae90d",
  "baseCommit": "5d01bfc",
  "runnerProtocolVersion": null,
  "boundaryVersion": "FP-MCP-020",
  "statusSource": "ForgePilot local pre-validation policy",
  "packetExists": true,
  "requestExists": true,
  "requestArtifactValid": true,
  "modelAllowed": true,
  "runModeAllowed": true,
  "workingTreeClean": true,
  "baseCommitMatches": false,
  "safeArtifactDir": true,
  "reasons": [
    "BASE_COMMIT_MISMATCH"
  ]
}
```

Result:

```text
PASS
```

The stale historical request failed local pre-validation before runner contact.

This is the expected safe result.

## Guarded Start Tool Verification

Tool:

```text
forgepilot_start_remote_runner_request
```

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
  "runnerConfigured": true,
  "runnerContacted": false,
  "startEndpointContacted": false,
  "executionStarted": false,
  "packetId": "FP-MCP-007",
  "requestId": "REQ-20260619T084312145Z-a9960bd6",
  "requestArtifactPath": "runs/FP-MCP-007/opencode-requests/REQ-20260619T084312145Z-a9960bd6.json",
  "requestArtifactSha256": "d6ceb2e10f58eb43b85bc485efeec5870db758837eb62d9181788860dacae90d",
  "baseCommit": "5d01bfc",
  "runnerRunId": null,
  "artifactDir": "runs/FP-MCP-007/qwen-3.7-max-DESIGN_ONLY/",
  "runnerProtocolVersion": null,
  "boundaryVersion": "FP-MCP-022",
  "statusSource": "ForgePilot remote-runner start policy",
  "localValidationPassed": false,
  "remoteValidationPassed": false,
  "preStartStateRecorded": false,
  "postStartStateRecorded": false,
  "reasons": [
    "BASE_COMMIT_MISMATCH"
  ]
}
```

Result:

```text
PASS
```

The start tool accepted the explicit approval token but still failed closed because local validation failed.

The tool did not contact `/runner/start-run`.

The tool did not start OpenCode.

## Safety Confirmation

FP-MCP-026 preserved the following boundaries:

```text
runnerConfigured: true
runnerReachable: true
runnerProtocolVersion: forgepilot-runner-v1
executionEnabled: false
runner localhost bind: 127.0.0.1:8791
remote validation stale request: rejected
guarded start stale request: rejected
startEndpointContacted: false
executionStarted: false
```

FP-MCP-026 did not add:

* new MCP tool
* new runner endpoint
* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution endpoint
* public runner exposure
* tunnel exposure
* provider credentials
* committed runner token
* Git mutation behavior
* SQLite mutation behavior

## Result

FP-MCP-026 successfully wires the staging MCP bridge to the private dev runner skeleton while preserving the non-execution boundary.

Status:

```text
ACCEPTED_FOR_VERIFICATION
```
