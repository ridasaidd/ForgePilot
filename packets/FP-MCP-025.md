# FP-MCP-025 — Private Dev Runner Service Unit

## Task

Add a user-level systemd service for the private dev runner skeleton.

## Goal

Make the FP-MCP-024 private dev runner skeleton persistently runnable on the private dev server while preserving the non-execution boundary.

FP-MCP-025 answers one question:

**Can the private dev runner skeleton be managed as a durable user service without enabling OpenCode execution?**

This packet may add service documentation and a user-level systemd unit.

This packet must not enable OpenCode execution.

This packet must not implement OpenCode invocation.

This packet must not expose the runner publicly.

---

## Scope Boundary

FP-MCP-025 may add:

* user-level systemd service unit template or checked-in service file
* runner environment file template
* service installation documentation
* service verification commands
* runner health verification documentation
* local capabilities verification documentation
* local validation verification documentation
* non-execution confirmation

FP-MCP-025 must not add:

* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution endpoints
* public network exposure
* reverse tunnel
* firewall changes
* remote staging bridge configuration
* runner token committed to Git
* real provider credentials
* execution enablement
* artifact-writing execution behavior
* Git mutation
* SQLite mutation

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

## Relationship to Earlier Packets

### FP-MCP-023

FP-MCP-023 defined the private dev runner service boundary.

### FP-MCP-024

FP-MCP-024 implemented the non-executing runner skeleton.

FP-MCP-025 makes that skeleton manageable as a local user service.

---

## Implementation Type

FP-MCP-025 is an implementation packet.

It may add a service unit and documentation.

It must not change runner execution behavior.

---

## Service Type

The runner service must be a user-level systemd service.

Recommended service name:

```text
forgepilot-runner.service
```

Recommended user service path:

```text
~/.config/systemd/user/forgepilot-runner.service
```

If a checked-in template is used, recommended repository path:

```text
runner/systemd/forgepilot-runner.service
```

---

## Service Command

The service should run:

```text
node /home/ridasaidd/forgepilot/runner/server.mjs
```

The service must not run OpenCode directly.

The service must not run shell scripts that invoke OpenCode.

---

## Environment Boundary

The service must use environment variables.

Required environment variables:

```text
FORGEPILOT_REPO=/home/ridasaidd/forgepilot
FORGEPILOT_RUNNER_HOST=127.0.0.1
FORGEPILOT_RUNNER_PORT=8791
FORGEPILOT_RUNNER_EXECUTION_ENABLED=false
```

The runner token must be configured outside committed source.

Recommended user environment file:

```text
~/.config/forgepilot-runner.env
```

Required secret variable:

```text
FORGEPILOT_RUNNER_TOKEN=<local-secret>
```

This file must not be committed.

---

## Execution Enablement

The service must explicitly set:

```text
FORGEPILOT_RUNNER_EXECUTION_ENABLED=false
```

Execution enablement must not be omitted.

Execution enablement must not default to true.

FP-MCP-025 must not introduce a service with execution enabled.

---

## Network Boundary

The service must bind to localhost by default:

```text
127.0.0.1:8791
```

FP-MCP-025 must not expose the runner on:

```text
0.0.0.0
```

FP-MCP-025 must not expose the runner through:

* public HTTP
* public HTTPS
* reverse proxy
* Cloudflare Tunnel
* Tailscale Funnel
* SSH remote forward
* ngrok
* arbitrary tunnel

Remote access requires a future packet.

---

## Authentication Boundary

Protected runner endpoints must continue to require bearer authentication.

The service unit must not include the token inline.

The service may reference:

```text
EnvironmentFile=%h/.config/forgepilot-runner.env
```

The environment file must be created manually by the operator.

The verification artifacts must not include the token.

---

## Service File Requirements

The service file should include:

```text
[Unit]
Description=ForgePilot Private Dev Runner Skeleton
After=network-online.target

[Service]
Type=simple
WorkingDirectory=/home/ridasaidd/forgepilot
Environment=FORGEPILOT_REPO=/home/ridasaidd/forgepilot
Environment=FORGEPILOT_RUNNER_HOST=127.0.0.1
Environment=FORGEPILOT_RUNNER_PORT=8791
Environment=FORGEPILOT_RUNNER_EXECUTION_ENABLED=false
EnvironmentFile=%h/.config/forgepilot-runner.env
ExecStart=/usr/bin/env node /home/ridasaidd/forgepilot/runner/server.mjs
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

If the Node path must be pinned, it may use the active Node path.

The chosen path must be documented.

---

## Verification Commands

Service installation should use:

```bash
mkdir -p ~/.config/systemd/user
cp runner/systemd/forgepilot-runner.service ~/.config/systemd/user/forgepilot-runner.service
systemctl --user daemon-reload
systemctl --user enable --now forgepilot-runner.service
systemctl --user status forgepilot-runner.service --no-pager -l
```

Service logs should use:

```bash
journalctl --user -u forgepilot-runner.service -n 80 --no-pager
```

---

## Local Health Verification

Health endpoint:

```bash
curl -sS http://127.0.0.1:8791/runner/health
```

Expected:

```text
ok
```

---

## Local Capabilities Verification

Capabilities endpoint:

```bash
curl -sS \
  -H "Authorization: Bearer $FORGEPILOT_RUNNER_TOKEN" \
  http://127.0.0.1:8791/runner/capabilities
```

Expected observations:

```text
runnerProtocolVersion: forgepilot-runner-v1
runnerHostRole: dev-execution-plane
executionEnabled: false
opencodeHarnessReachable: false
supportedOperations includes capabilities
supportedOperations includes validate-request
```

---

## Start-Run Verification

Start-run must remain hard-rejecting:

```bash
curl -sS -i \
  -X POST \
  -H "Authorization: Bearer $FORGEPILOT_RUNNER_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{}' \
  http://127.0.0.1:8791/runner/start-run
```

Expected:

```text
HTTP 501
EXECUTION_NOT_IMPLEMENTED
executionStarted: false
```

---

## Token Handling

Verification artifacts must not include the actual token.

Use redacted notation:

```text
FORGEPILOT_RUNNER_TOKEN=<redacted>
```

---

## Acceptance Criteria

* Service unit or service template is added.
* Service documentation is added or updated.
* Service runs runner skeleton only.
* Service binds to `127.0.0.1`.
* Service uses port `8791`.
* Service sets `FORGEPILOT_RUNNER_EXECUTION_ENABLED=false`.
* Service token is not committed.
* Environment file path is documented.
* Service can be enabled with `systemctl --user`.
* Service can be started with `systemctl --user`.
* Service reports active running state.
* Health endpoint returns `ok`.
* Capabilities endpoint requires authentication.
* Capabilities endpoint succeeds with bearer token.
* Capabilities reports execution disabled.
* Start-run remains hard-rejecting.
* No OpenCode execution is added.
* No OpenCode CLI invocation is added.
* No OpenCode API invocation is added.
* No shell execution endpoint is added.
* No public exposure is added.
* No tunnel is added.
* No provider credentials are committed.
* Existing runner tests pass.
* Repository remains clean after commit.

---

## Verification Requirements

Verification must record:

* packet commit
* implementation commit
* service unit path
* environment file path, token redacted
* service enable/start command result
* service status result
* health endpoint result
* capabilities auth failure result
* capabilities auth success result
* start-run hard rejection result
* confirmation that runner binds localhost only
* confirmation that execution remains disabled
* confirmation that no OpenCode execution occurred
* confirmation that no OpenCode CLI/API invocation was added
* confirmation that no public exposure was added
* clean tree confirmation

Record artifacts under:

```text
runs/FP-MCP-025/
```

Recommended artifacts:

* `runs/FP-MCP-025/executor-result.md`
* `runs/FP-MCP-025/verification.txt`
