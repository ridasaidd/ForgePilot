# FP-MCP-026 — Staging Bridge Remote Runner Wiring

## Task

Wire the staging MCP bridge to the private dev runner service.

## Goal

Configure the staging/control-plane MCP bridge so it can discover and validate against the private dev runner endpoint while preserving the non-execution boundary.

FP-MCP-026 answers one question:

**Can the staging MCP bridge safely communicate with the private dev runner skeleton without enabling OpenCode execution?**

This packet may add bridge-side runner endpoint configuration.

This packet may update service environment documentation.

This packet must not enable execution.

This packet must not make the runner public.

This packet must not implement OpenCode execution.

---

## Scope Boundary

FP-MCP-026 may add:

* bridge environment configuration for runner base URL
* bridge environment configuration for runner token
* documentation for local runner wiring
* service restart instructions
* remote runner status verification
* remote runner validate-request verification
* start-tool fail-closed verification through the configured runner
* secret handling documentation
* localhost-only verification

FP-MCP-026 may modify:

* staging MCP bridge user service environment
* bridge README or local deployment notes
* ForgePilot verification artifacts

FP-MCP-026 must not add:

* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution endpoint
* public runner exposure
* tunnel exposure
* firewall changes
* reverse proxy
* runner start execution
* provider credentials
* execution enablement
* artifact-writing execution behavior
* Git mutation behavior
* SQLite mutation behavior

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

### FP-MCP-018

FP-MCP-018 added remote runner status discovery to the staging MCP bridge.

Before wiring, runner status reported unconfigured.

### FP-MCP-020

FP-MCP-020 added staging-side remote runner validate-request client.

Before wiring, remote validation reported unconfigured.

### FP-MCP-022

FP-MCP-022 added the guarded staging-side start tool.

After wiring, the start tool may contact the runner only after local validation and remote validation gates pass.

### FP-MCP-024

FP-MCP-024 implemented the private dev runner skeleton.

### FP-MCP-025

FP-MCP-025 installed the runner skeleton as a local user service.

FP-MCP-026 wires the staging bridge to that service.

---

## Implementation Type

FP-MCP-026 is an implementation and verification packet.

It configures existing components.

It should not add new MCP tools.

It should not add new runner endpoints.

---

## Target Topology

Initial local topology:

```text
ChatGPT
  -> staging MCP bridge on rpsrv
  -> http://127.0.0.1:8791 private dev runner skeleton on rpsrv
```

This is acceptable for the first wiring test because both services are currently on the same private server.

The runner must still bind to:

```text
127.0.0.1:8791
```

The bridge may point to:

```text
http://127.0.0.1:8791
```

---

## Required Bridge Environment

The staging MCP bridge service should receive:

```text
FORGEPILOT_REMOTE_RUNNER_BASE_URL=http://127.0.0.1:8791
FORGEPILOT_REMOTE_RUNNER_TOKEN=<same local runner token>
```

Alternative accepted variable names if already implemented:

```text
FORGEPILOT_RUNNER_BASE_URL
FORGEPILOT_RUNNER_TOKEN
```

The selected variables must match the bridge implementation.

The token must not be committed.

---

## Secret Boundary

Runner token may be shared between:

* private runner service environment
* staging MCP bridge service environment

The token must not be:

* committed to Git
* shown in verification artifacts
* logged
* returned in MCP tool output
* included in packet files
* included in README examples except as `<redacted>` or placeholder

---

## Bridge Service Configuration

The bridge service is expected to be:

```text
forgepilot-chatgpt-mcp-oauth.service
```

The bridge service is user-level:

```text
systemctl --user ...
```

The environment may be configured through a user environment file or service override.

Recommended override command:

```bash
systemctl --user edit forgepilot-chatgpt-mcp-oauth.service
```

Recommended override content:

```text
[Service]
Environment=FORGEPILOT_REMOTE_RUNNER_BASE_URL=http://127.0.0.1:8791
EnvironmentFile=%h/.config/forgepilot-runner.env
```

If the bridge expects a different token variable name than the runner environment file provides, add an explicit bridge environment file or variable mapping.

---

## Restart Boundary

After wiring, restart only the staging MCP bridge service:

```bash
systemctl --user daemon-reload
systemctl --user restart forgepilot-chatgpt-mcp-oauth.service
systemctl --user status forgepilot-chatgpt-mcp-oauth.service --no-pager -l
```

The runner service should remain running:

```bash
systemctl --user status forgepilot-runner.service --no-pager -l
```

---

## Required Verification — Runner Status

After wiring, this MCP tool should report runner configured and reachable:

```text
forgepilot_get_remote_runner_status
```

Expected observations:

```text
runnerConfigured: true
runnerReachable: true
runnerEndpointLabel: configured
runnerProtocolVersion: forgepilot-runner-v1
executionEnabled: false
liveRunnerChecked: true
reasons includes EXECUTION_DISABLED
```

The exact result may include additional non-execution reasons.

---

## Required Verification — Bridge Capabilities

After wiring, this MCP tool should include runner visibility:

```text
forgepilot_get_opencode_capabilities
```

Expected observations:

```text
runnerReachable: true
executionEnabled: false
supportedOperations includes static-capability-discovery
supportedOperations may include runner-discovered operations
allowedModels remains constrained
```

The bridge must not infer execution permission from runner reachability.

---

## Required Verification — Remote Validate Request

This MCP tool should contact the runner validation endpoint:

```text
forgepilot_validate_remote_runner_endpoint_request
```

Use known historical request:

```text
packetId: FP-MCP-007
requestId: REQ-20260619T084312145Z-a9960bd6
```

Expected result remains invalid because the request artifact base commit is stale.

Expected observations:

```text
runnerConfigured: true
runnerContacted: true
runnerAccepted: false
executionStarted: false
reasons includes BASE_COMMIT_MISMATCH
```

If the runner reports the stale request using a different reason combination, record the observed reasons.

---

## Required Verification — Start Tool Still Fails Closed

This MCP tool should remain guarded and non-executing:

```text
forgepilot_start_remote_runner_request
```

Use:

```text
packetId: FP-MCP-007
requestId: REQ-20260619T084312145Z-a9960bd6
approval: START_REMOTE_RUNNER_REQUEST
```

Expected:

```text
started: false
accepted: false
approvalAccepted: true
executionStarted: false
```

Because the request artifact is stale, the tool must not reach `/runner/start-run`.

Expected observations:

```text
localValidationPassed: false
remoteValidationPassed: false
startEndpointContacted: false
reasons includes BASE_COMMIT_MISMATCH
```

If a fresh request is later used, the runner still hard-rejects start-run with:

```text
EXECUTION_NOT_IMPLEMENTED
```

That fresh-request scenario requires a future packet or explicit verification step.

---

## Network Verification

Confirm the runner still binds only to localhost:

```bash
ss -ltnp | grep 8791
```

Expected:

```text
127.0.0.1:8791
```

Not allowed:

```text
0.0.0.0:8791
```

---

## Execution Boundary

FP-MCP-026 must preserve:

```text
runner executionEnabled: false
runner start-run: EXECUTION_NOT_IMPLEMENTED
staging bridge executionStarted: false
OpenCode CLI not invoked
OpenCode API not invoked
shell not executed
```

Runner reachability is not execution authority.

---

## Acceptance Criteria

* FP-MCP-026 packet is committed.
* Runner service remains active.
* Runner still binds to `127.0.0.1:8791`.
* Bridge service receives runner base URL configuration.
* Bridge service receives runner token without committing it.
* Bridge service restarts successfully.
* `forgepilot_get_remote_runner_status` reports runner configured.
* `forgepilot_get_remote_runner_status` reports runner reachable.
* Runner protocol version is `forgepilot-runner-v1`.
* Runner reports execution disabled.
* `forgepilot_validate_remote_runner_endpoint_request` contacts the runner.
* Remote validation does not start execution.
* Remote validation rejects stale historical request.
* `forgepilot_start_remote_runner_request` remains non-executing for stale request.
* Start tool does not contact `/runner/start-run` when local/remote validation fails.
* No new MCP tool is added.
* No runner endpoint is added.
* No OpenCode execution is added.
* No OpenCode CLI invocation is added.
* No OpenCode API invocation is added.
* No shell execution endpoint is added.
* No public exposure is added.
* No tunnel is added.
* No provider credentials are committed.
* No token is committed.
* Repository remains clean after verification.

---

## Verification Requirements

Verification must record:

* packet commit
* bridge wiring method
* bridge service restart result
* runner service status result
* runner localhost bind result
* remote runner status MCP result
* capability/status MCP result if used
* remote validate endpoint MCP result
* guarded start tool MCP result
* confirmation that execution remains disabled
* confirmation that `/runner/start-run` was not contacted in stale-request start test
* confirmation that OpenCode was not started
* confirmation that no secrets were committed
* clean tree confirmation

Record artifacts under:

```text
runs/FP-MCP-026/
```

Recommended artifacts:

* `runs/FP-MCP-026/executor-result.md`
* `runs/FP-MCP-026/verification.txt`
