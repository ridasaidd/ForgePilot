# FP-MCP-025 Executor Result

## Packet

FP-MCP-025 — Private Dev Runner Service Unit

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
387cee2
```

Implementation commit:

```text
ad6b9c3
```

Working tree after implementation commit:

```text
clean
```

## Implementation Summary

FP-MCP-025 added a user-level systemd service template for the FP-MCP-024 private dev runner skeleton.

Files added:

```text
runner/systemd/forgepilot-runner.service
runner/systemd/README.md
```

Service name:

```text
forgepilot-runner.service
```

Installed user service path:

```text
/home/ridasaidd/.config/systemd/user/forgepilot-runner.service
```

Repository service template path:

```text
runner/systemd/forgepilot-runner.service
```

Environment file path:

```text
/home/ridasaidd/.config/forgepilot-runner.env
```

Token status:

```text
configured outside Git, redacted from verification
```

## Service Configuration

The service runs:

```text
/home/ridasaidd/.nvm/versions/node/v24.4.1/bin/node /home/ridasaidd/forgepilot/runner/server.mjs
```

The service sets:

```text
FORGEPILOT_REPO=/home/ridasaidd/forgepilot
FORGEPILOT_RUNNER_HOST=127.0.0.1
FORGEPILOT_RUNNER_PORT=8791
FORGEPILOT_RUNNER_EXECUTION_ENABLED=false
```

The service reads token configuration from:

```text
EnvironmentFile=%h/.config/forgepilot-runner.env
```

## Service Verification

Initial service start with `/usr/bin/env node` failed with:

```text
status=127
```

The service was corrected to use the pinned Node path:

```text
/home/ridasaidd/.nvm/versions/node/v24.4.1/bin/node
```

After correction, the health endpoint returned:

```text
ok
```

Result:

```text
PASS
```

## Capabilities Verification

Command:

```bash
curl -sS \
  -H "Authorization: Bearer $FORGEPILOT_RUNNER_TOKEN" \
  http://127.0.0.1:8791/runner/capabilities
```

Observed key fields:

```json
{
  "runnerConfigured": true,
  "runnerHostRole": "dev-execution-plane",
  "runnerVersion": "0.1.0-fp-mcp-024",
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "executionEnabled": false,
  "opencodeHarnessConfigured": false,
  "opencodeHarnessReachable": false,
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
  "statusSource": "private dev runner static policy",
  "reasons": [
    "EXECUTION_DISABLED"
  ]
}
```

Result:

```text
PASS
```

## Start-Run Hard Rejection Verification

Command:

```bash
curl -sS -i \
  -X POST \
  -H "Authorization: Bearer $FORGEPILOT_RUNNER_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{}' \
  http://127.0.0.1:8791/runner/start-run
```

Observed status:

```text
HTTP/1.1 501 Not Implemented
```

Observed body:

```json
{
  "accepted": false,
  "executionStarted": false,
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "boundaryVersion": "FP-MCP-024",
  "statusSource": "private dev runner non-execution policy",
  "reasons": [
    "EXECUTION_NOT_IMPLEMENTED"
  ]
}
```

Result:

```text
PASS
```

## Auth Failure Verification

Command:

```bash
curl -sS -i http://127.0.0.1:8791/runner/capabilities
```

Observed status:

```text
HTTP/1.1 401 Unauthorized
```

Observed reason:

```text
RUNNER_AUTH_FAILED
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

The runner binds to localhost only.

It is not listening on:

```text
0.0.0.0:8791
```

## Non-Execution Confirmation

FP-MCP-025 did not add:

* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution endpoint
* public network exposure
* reverse tunnel
* firewall changes
* remote staging bridge configuration
* provider credentials
* execution enablement
* artifact-writing execution behavior
* Git mutation
* SQLite mutation

## Result

FP-MCP-025 satisfies its service-unit implementation scope.

The private dev runner skeleton now runs as a user-level service, binds to localhost only, requires authentication on protected endpoints, reports execution disabled, and hard-rejects start-run.

Status:

```text
ACCEPTED_FOR_VERIFICATION
```
