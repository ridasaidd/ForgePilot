# FP-MCP-012 — Remote OpenCode Runner Boundary

## Task

Define the boundary between the public ForgePilot MCP bridge on the staging server and the private OpenCode runner on the dev server.

## Goal

Establish how ChatGPT may eventually request OpenCode execution through ForgePilot when the OpenCode harness lives on a different machine than the MCP bridge.

FP-MCP-012 answers one question:

**How may the staging MCP bridge communicate with a private dev-side OpenCode runner without becoming a raw OpenCode or shell proxy?**

This packet is boundary-only.

It does not add a remote runner API.

It does not add a runner service.

It does not add MCP execution tools.

It does not start OpenCode.

It does not call the OpenCode CLI.

It does not call the OpenCode API.

It does not execute shell commands.

It does not add network tunneling.

It does not mutate Git.

It does not mutate SQLite.

---

## Scope Boundary

FP-MCP-012 may define:

* staging server responsibilities
* dev server responsibilities
* control-plane versus execution-plane separation
* forbidden proxy shapes
* allowed remote runner API shapes
* request artifact handoff rules
* runner authentication requirements
* runner network exposure requirements
* capability discovery boundaries
* execution-start forwarding requirements
* status/readback requirements
* logging and redaction requirements
* artifact ownership rules
* failure and timeout behavior
* future packet ordering

FP-MCP-012 must not implement:

* remote runner HTTP endpoints
* MCP execution-start tools
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* raw network proxying
* generic tunnels
* background workers
* artifact synchronization
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

## Deployment Model

ForgePilot MCP currently has two relevant infrastructure roles:

```text
staging server = public/control-plane MCP bridge
dev server = private execution-plane OpenCode harness
```

The staging server is reachable by ChatGPT through the MCP bridge.

The dev server owns or can reach the OpenCode harness.

The staging server must not become the executor.

The dev server must not expose raw OpenCode or shell authority to ChatGPT.

---

## Core Rule

ChatGPT must never control OpenCode directly.

ChatGPT may only create, inspect, and approve ForgePilot-shaped requests.

A future staging bridge may forward a validated request to a dev-side ForgePilot runner.

The dev-side runner may decide whether to start OpenCode according to ForgePilot rules.

Required authority chain:

```text
ChatGPT
→ staging MCP bridge
→ ForgePilot request artifact
→ private dev runner
→ constrained OpenCode harness
→ recorded run artifacts
```

Forbidden authority chain:

```text
ChatGPT
→ staging MCP bridge
→ raw OpenCode API
```

Forbidden authority chain:

```text
ChatGPT
→ staging MCP bridge
→ raw shell on dev server
```

---

## Control Plane

The staging server is the control plane.

The control plane may:

* authenticate ChatGPT MCP requests
* expose public MCP tools
* create request artifacts
* list request artifacts
* read request artifacts
* validate request intent
* forward approved ForgePilot-shaped requests to the dev runner in future packets
* read runner status through a narrow API in future packets
* read recorded run artifacts through constrained ForgePilot tools

The control plane must not:

* execute OpenCode directly
* proxy arbitrary OpenCode API calls
* proxy arbitrary shell commands
* forward arbitrary prompts
* forward arbitrary file paths
* expose dev server internals
* expose secrets
* own the OpenCode harness
* infer execution success from lack of failure

---

## Execution Plane

The dev server is the execution plane.

The execution plane may:

* host the OpenCode harness
* host a private ForgePilot runner service
* validate request artifacts received from the control plane
* start OpenCode only from approved request artifacts
* write run artifacts
* capture terminal output
* report structured run status
* expose narrow status/readback endpoints to the control plane

The execution plane must not:

* expose a public raw OpenCode API
* expose a public shell API
* accept arbitrary prompts from ChatGPT
* accept arbitrary commands from ChatGPT
* accept arbitrary filesystem paths from ChatGPT
* mutate request artifacts without recording state transitions
* silently overwrite run artifacts
* hide execution failures

---

## Forbidden Proxy Shapes

The staging bridge must not implement:

```text
proxy_opencode(path, method, body)
```

```text
run_remote_shell(command)
```

```text
send_prompt_to_opencode(prompt)
```

```text
start_model(modelId, prompt)
```

```text
write_remote_file(path, content)
```

```text
read_remote_file(path)
```

```text
tunnel_to_dev(host, port)
```

These shapes collapse the ForgePilot boundary and turn the bridge into a generic executor.

---

## Allowed Future Runner API Shape

A future private runner API may expose only ForgePilot-shaped operations.

Recommended endpoint concepts:

```text
GET /runner/capabilities
POST /runner/validate-request
POST /runner/start-run
GET /runner/runs/<runId>/status
GET /runner/runs/<runId>/artifacts/<artifactName>
```

The exact transport is not defined by FP-MCP-012.

The API may be HTTP, local-only HTTP, SSH-forced-command, Unix socket, or another constrained transport, but it must preserve the same authority boundary.

---

## Runner API Operation: Capabilities

A future capabilities operation may report:

```text
runnerReachable
runnerVersion
opencodeHarnessConfigured
opencodeHarnessReachable
supportedRunModes
discoveredModels
allowedModels
executionEnabled
statusSource
```

Important distinction:

```text
discoveredModels != allowedModels
```

A discovered model is merely visible to the runner.

An allowed model is permitted by ForgePilot policy.

Discovery must not automatically grant execution authority.

---

## Runner API Operation: Validate Request

A future validate operation may accept:

```text
packetId
requestId
```

It may not accept:

* raw prompt
* raw command
* model override
* run-mode override
* raw path
* arbitrary JSON execution payload

The runner must read and validate the request artifact.

---

## Runner API Operation: Start Run

A future start operation may accept:

```text
packetId
requestId
approval
```

It must require the exact approval token defined by the execution-start boundary.

It must not accept:

* raw prompt
* raw command
* model override
* run-mode override
* raw path
* arbitrary environment variables
* secrets

The request artifact remains the execution input.

---

## Runner API Operation: Run Status

A future status operation may report:

```text
runId
packetId
requestId
modelId
runMode
status
startedAt
finishedAt
executionStarted
executionFinished
artifactDir
reasons
```

Status must be explicit.

No success may be inferred from missing failure.

---

## Runner API Operation: Artifact Readback

A future artifact readback operation may expose only known run artifacts.

Allowed artifact names should be enumerated.

Recommended initial artifact allowlist:

```text
executor-result.md
verification.txt
terminal-output.txt
command-log.json
metrics.json
execution-state.json
```

The API must not accept arbitrary paths.

The API must not expose secrets.

The API must not expose unrestricted terminal streams.

---

## Network Exposure Rule

The dev runner should not be publicly reachable.

Recommended exposure options:

```text
private network only
Tailscale-only
WireGuard-only
SSH forced-command
mutual TLS
loopback behind a reverse tunnel with strict endpoint allowlist
```

The staging bridge may reach the dev runner only through an explicitly configured private channel.

The runner endpoint must not be discoverable as a public generic service.

---

## Authentication and Authorization

The staging bridge must authenticate to the dev runner.

The dev runner must reject unauthenticated requests.

Recommended requirements:

* dedicated runner token or mTLS identity
* token stored outside Git
* token not exposed through MCP tools
* token not logged
* token not returned in tool output
* least-privilege runner identity
* separate credentials from ChatGPT OAuth/Auth0

ChatGPT authentication to staging is not sufficient by itself to authorize dev execution.

---

## Request Artifact Handoff

A future remote runner flow must preserve the request artifact as the authority source.

Allowed handoff options:

```text
staging passes packetId + requestId; dev reads shared repo/artifact store
staging passes packetId + requestId; dev fetches artifact through constrained internal endpoint
staging passes packetId + requestId + artifact digest; dev verifies artifact content
```

Forbidden handoff:

```text
staging sends raw prompt
staging sends arbitrary generated execution JSON
staging sends raw command list
staging sends arbitrary file bundle
```

---

## Artifact Ownership

Run artifacts should be written by the execution plane.

Request artifacts may be created by the control plane.

Recommended split:

```text
control plane:
runs/<packetId>/opencode-requests/<requestId>.json

execution plane:
runs/<packetId>/<modelId>-<runMode>/
```

If the two servers do not share a filesystem, a future packet must define artifact synchronization explicitly.

FP-MCP-012 does not define synchronization implementation.

---

## Capability Discovery Boundary

Remote capability discovery must be read-only.

It may report:

* whether runner is reachable
* whether OpenCode harness is configured
* discovered models
* allowed models
* supported run modes
* execution enabled/disabled
* runner version
* boundary version

It must not:

* start OpenCode
* load arbitrary prompts
* run shell commands
* expose secrets
* expose raw OpenCode config
* mutate allowlists

Capability discovery may inform ChatGPT, but it must not update policy automatically.

---

## Policy Boundary

ForgePilot policy remains authoritative.

Runner-discovered capabilities are observations.

They are not policy.

Allowed models must come from ForgePilot policy or an explicitly admitted configuration artifact.

The bridge must not treat runner-discovered models as automatically allowed.

---

## Failure and Timeout Behavior

A future staging-to-dev call must have bounded timeouts.

Failures must be explicit.

Recommended reason codes:

```text
RUNNER_UNREACHABLE
RUNNER_AUTH_FAILED
RUNNER_TIMEOUT
RUNNER_PROTOCOL_ERROR
RUNNER_REJECTED_REQUEST
RUNNER_CAPABILITY_UNAVAILABLE
RUNNER_EXECUTION_DISABLED
```

The staging bridge must not retry execution-start requests blindly.

Retries must be explicitly defined in a future packet.

---

## Logging Requirement

FP-MCP-004 sanitized logging remains authoritative.

The staging bridge must not log:

* runner tokens
* request artifact contents
* prompts
* terminal output
* file contents
* secrets
* environment variables
* raw OpenCode configuration
* raw runner responses containing sensitive data

The dev runner must follow equivalent sanitized logging.

Allowed log shape remains:

```text
runner operation invoked: <operation_name>
runner operation completed: <operation_name> PASS durationMs=<number>
runner operation completed: <operation_name> FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

---

## Trust Boundary

The dev runner is not automatically trusted simply because it is private.

Runner outputs must still be recorded as observations.

Runner-produced artifacts must still be verified before admission into observatory outputs.

A successful runner response is not the same as admitted evidence.

---

## Future Packet Ordering

Recommended next packets after FP-MCP-012:

```text
FP-MCP-013 — OpenCode Capability Discovery Boundary
FP-MCP-014 — Add OpenCode Capability Discovery Tool
FP-MCP-015 — Remote Runner Request Validation Tool
FP-MCP-016 — Add OpenCode Execution Start Tool
```

The exact numbering may change, but capability discovery should happen before execution start.

---

## Acceptance Criteria

* Staging/control-plane role is documented.
* Dev/execution-plane role is documented.
* Raw OpenCode proxying is forbidden.
* Raw shell proxying is forbidden.
* Generic network tunneling is forbidden.
* ForgePilot-shaped runner API concept is documented.
* Capability discovery boundary is documented.
* Request artifact handoff boundary is documented.
* Runner authentication requirements are documented.
* Runner network exposure restrictions are documented.
* Artifact ownership rules are documented.
* Failure and timeout behavior is documented.
* Logging restrictions are documented.
* Trust boundary is documented.
* Future packet ordering is documented.
* No remote runner API is implemented.
* No MCP execution tool is implemented.
* No OpenCode execution is added.
* No shell execution is added.
* No network tunnel is added.
* No Git mutation is added.
* No SQLite mutation is added.

---

## Verification Requirements

Because FP-MCP-012 is boundary-only, verification should confirm:

* packet exists
* packet is committed
* no bridge code changed
* no MCP tools changed
* no runtime behavior changed
* no remote runner service was added
* no OpenCode execution was added
* no shell execution was added
* ForgePilot repository remains clean after commit

Record artifacts under:

```text
runs/FP-MCP-012/
```

Recommended artifacts:

* `runs/FP-MCP-012/executor-result.md`
* `runs/FP-MCP-012/verification.txt`

