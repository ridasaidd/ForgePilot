# FP-MCP-013 — OpenCode Capability Discovery Boundary

## Task

Define the safety boundary for discovering OpenCode runner and model capabilities through ForgePilot MCP.

## Goal

Establish how ChatGPT may safely inspect available OpenCode runner capabilities without gaining execution authority or changing ForgePilot policy.

FP-MCP-013 answers one question:

**How can ForgePilot observe OpenCode capabilities while keeping policy, permission, and execution separate?**

This packet is boundary-only.

It does not add a capability discovery tool.

It does not add a remote runner API.

It does not start OpenCode.

It does not call the OpenCode CLI.

It does not call the OpenCode API.

It does not execute shell commands.

It does not mutate model policy.

It does not mutate Git.

It does not mutate SQLite.

---

## Scope Boundary

FP-MCP-013 may define:

* capability discovery concepts
* safe capability fields
* forbidden capability fields
* discovery source precedence
* discovered model handling
* allowed model handling
* stale capability handling
* runner reachability handling
* local versus remote discovery boundaries
* structured output requirements
* failure reason codes
* logging requirements
* future tool behavior constraints

FP-MCP-013 must not implement:

* MCP discovery tools
* remote runner endpoints
* OpenCode CLI calls
* OpenCode API calls
* shell execution
* model policy updates
* model allowlist mutation
* execution start
* artifact creation
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

## Relationship to Earlier MCP Packets

### FP-MCP-002

FP-MCP-002 added static OpenCode status discovery.

FP-MCP-013 extends the concept from static status to capability discovery boundaries.

### FP-MCP-006

FP-MCP-006 validates request models against the allowed model policy.

FP-MCP-013 must not weaken that allowlist.

### FP-MCP-011

FP-MCP-011 defines the execution-start boundary.

FP-MCP-013 does not add execution start.

### FP-MCP-012

FP-MCP-012 defines the remote runner boundary.

FP-MCP-013 defines what capabilities may be discovered from that runner.

---

## Core Rule

Capability discovery is observation.

Capability discovery is not policy.

Capability discovery is not authorization.

Capability discovery is not execution.

The central rule:

```text
discoveredModels != allowedModels
```

A model that is discovered from OpenCode or a dev runner must not automatically become allowed for execution.

---

## Capability Categories

ForgePilot may distinguish these capability categories:

```text
bridgeCapabilities
runnerCapabilities
opencodeCapabilities
policyCapabilities
```

### bridgeCapabilities

Capabilities of the staging MCP bridge.

Examples:

```text
mcpToolsAvailable
structuredOutputsEnabled
requestArtifactsSupported
executionStartToolAvailable
```

### runnerCapabilities

Capabilities of the private dev-side ForgePilot runner.

Examples:

```text
runnerReachable
runnerVersion
runnerProtocolVersion
executionEnabled
supportedOperations
```

### opencodeCapabilities

Capabilities observed from the OpenCode harness.

Examples:

```text
opencodeHarnessConfigured
opencodeHarnessReachable
discoveredModels
supportedRunModes
```

### policyCapabilities

Capabilities permitted by ForgePilot policy.

Examples:

```text
allowedModels
allowedRunModes
executionPolicyVersion
```

---

## Discovery Source Precedence

Capability discovery may use multiple sources.

Recommended source precedence:

```text
1. ForgePilot policy configuration
2. request-boundary constants
3. dev runner capability endpoint
4. OpenCode harness read-only capability source
5. static fallback
```

A source may provide observations, but only policy sources may define permissions.

---

## Safe Capability Fields

A future capability discovery result may include:

```text
bridgeHostRole
runnerHostRole
runnerReachable
runnerVersion
runnerProtocolVersion
opencodeHarnessConfigured
opencodeHarnessReachable
executionEnabled
supportedOperations
supportedRunModes
discoveredModels
allowedModels
blockedModels
statusSource
boundaryVersion
checkedAt
reasons
```

The result should be structured.

---

## Forbidden Capability Fields

Capability discovery must not expose:

* API keys
* OAuth tokens
* runner tokens
* environment variables
* raw OpenCode config
* raw provider credentials
* SSH keys
* private filesystem paths beyond approved safe labels
* full prompts
* private conversations
* terminal output
* unrestricted logs
* raw HTTP responses from OpenCode
* raw error stacks

Capability discovery should expose safe labels and policy summaries, not secrets or internals.

---

## Discovered Models

`discoveredModels` are models visible to the runner or OpenCode harness.

They are observations.

They may be useful for:

* diagnosis
* planning future policy updates
* understanding local runner availability
* detecting drift between OpenCode and ForgePilot policy

They must not be used directly for execution approval.

---

## Allowed Models

`allowedModels` are models ForgePilot policy permits.

Allowed models may be defined by:

* explicit source-controlled policy
* admitted configuration artifact
* packet-defined constants
* future validated policy store

Allowed models must not be inferred solely from OpenCode discovery.

---

## Blocked Models

A future capability result may report blocked models.

A blocked model may be:

* discovered but not allowed
* explicitly disabled
* unsupported by current run mode
* missing required trust/policy classification
* temporarily unavailable
* disabled due to cost or safety policy

Example:

```json
{
  "discoveredModels": [
    "deepseek-v4-pro-high",
    "qwen-3.7-max",
    "kimi-k2.6"
  ],
  "allowedModels": [
    "deepseek-v4-pro-high",
    "qwen-3.7-max"
  ],
  "blockedModels": [
    "kimi-k2.6"
  ]
}
```

---

## Execution Enabled Flag

A future capability discovery result may include:

```text
executionEnabled: boolean
```

This field is observational and policy-derived.

If `executionEnabled` is false, execution-start tools must not start OpenCode.

If `executionEnabled` is true, execution still requires:

* valid request artifact
* exact approval token
* clean repository
* base commit match
* allowed model
* allowed run mode
* safe artifact directory
* runner availability

`executionEnabled: true` is not sufficient by itself.

---

## Runner Reachability

Capability discovery may check whether the private runner is reachable.

Reachability result examples:

```text
runnerReachable: true
runnerReachable: false
```

If the runner is unreachable, the discovery tool may still return policy capabilities and static fallback fields.

Runner unreachable must not be treated as execution failure because no execution was requested.

Recommended reason code:

```text
RUNNER_UNREACHABLE
```

---

## Staleness

Capability discovery may become stale.

A future discovery result should include:

```text
checkedAt
statusSource
```

Future implementation may include:

```text
ttlSeconds
stale
```

If capability data is stale, it must not be used as execution authorization.

---

## Remote Discovery Boundary

If discovery queries a dev runner, the staging bridge may only call a narrow capability operation.

Allowed shape:

```text
get_runner_capabilities()
```

Forbidden shapes:

```text
proxy_runner_request(path, body)
proxy_opencode_request(path, body)
run_remote_shell(command)
send_probe_prompt(prompt)
```

Remote discovery must be read-only.

---

## OpenCode API Discovery

A future implementation may use an OpenCode API only if the endpoint is verified.

The packet does not assume a specific OpenCode API route.

OpenCode API discovery must be:

* read-only
* bounded by timeout
* authenticated if needed
* sanitized before returning
* reduced to safe fields
* unable to start runs
* unable to send prompts
* unable to mutate config

Raw OpenCode API responses must not be returned directly to ChatGPT.

---

## CLI Discovery

A future implementation may use an OpenCode CLI read-only discovery command only if such a command is verified.

CLI discovery must not:

* start a run
* send a prompt
* execute shell commands beyond the known fixed read-only command
* expose raw terminal output without sanitization
* accept user-controlled CLI arguments

If CLI discovery is used, the command must be fixed by implementation, not supplied by ChatGPT.

---

## Static Fallback

If live discovery is unavailable, the system may return static fallback capability data.

Static fallback must be clearly marked:

```text
statusSource: "static fallback"
```

Static fallback must not claim live runner reachability.

---

## Failure Reason Codes

Future implementation should use stable reason codes.

Recommended reason codes:

```text
RUNNER_UNREACHABLE
RUNNER_AUTH_FAILED
RUNNER_TIMEOUT
RUNNER_PROTOCOL_ERROR
OPENCODE_UNREACHABLE
OPENCODE_DISCOVERY_UNAVAILABLE
DISCOVERY_SOURCE_UNCONFIGURED
DISCOVERY_RESULT_STALE
DISCOVERY_SANITIZATION_FAILED
POLICY_UNAVAILABLE
```

Raw exception messages must not be returned if they expose internals.

---

## Structured Output Requirement

A future capability discovery tool must follow FP-MCP-008 and FP-MCP-009.

Required result pattern:

```text
outputSchema defines the shape
structuredContent carries the object
content carries readable fallback text
```

---

## Tool Annotation Requirement for Future Discovery Tool

A future capability discovery tool must be read-only.

Recommended annotations:

```text
readOnlyHint: true
destructiveHint: false
idempotentHint: true
openWorldHint: false
```

---

## Logging Requirement

FP-MCP-004 sanitized logging remains authoritative.

Capability discovery must not log:

* runner tokens
* request bodies containing secrets
* raw OpenCode config
* environment variables
* provider credentials
* prompts
* terminal output
* raw API responses containing sensitive data

Allowed log shape remains:

```text
MCP tool invoked: <tool_name>
MCP tool completed: <tool_name> PASS durationMs=<number>
MCP tool completed: <tool_name> FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

---

## Policy Change Boundary

Capability discovery must not update ForgePilot policy.

Changing `allowedModels` requires a separate policy packet or admitted configuration artifact.

Capability discovery may produce evidence that suggests a policy change.

It may not perform that policy change.

---

## Acceptance Criteria

* Capability discovery is defined as observation.
* `discoveredModels != allowedModels` is documented.
* Bridge capabilities are documented.
* Runner capabilities are documented.
* OpenCode capabilities are documented.
* Policy capabilities are documented.
* Safe fields are documented.
* Forbidden fields are documented.
* Discovery source precedence is documented.
* Runner reachability behavior is documented.
* Staleness handling is documented.
* Remote discovery boundary is documented.
* OpenCode API discovery constraints are documented.
* CLI discovery constraints are documented.
* Static fallback behavior is documented.
* Failure reason codes are documented.
* Structured output requirement is documented.
* Future tool annotation requirement is documented.
* Logging restrictions are documented.
* Policy mutation is forbidden.
* No discovery tool is added.
* No remote runner endpoint is added.
* No OpenCode API call is added.
* No OpenCode CLI call is added.
* No shell execution is added.
* No model policy mutation is added.
* No execution-start behavior is added.
* No Git mutation is added.
* No SQLite mutation is added.

---

## Future Implementation Packet

The future implementation packet may be:

```text
FP-MCP-014 — Add OpenCode Capability Discovery Tool
```

That packet may add a read-only MCP tool such as:

```text
forgepilot_get_opencode_capabilities
```

Only if it satisfies the FP-MCP-013 boundary.

---

## Verification Requirements

Because FP-MCP-013 is boundary-only, verification should confirm:

* packet exists
* packet is committed
* no bridge code changed
* no MCP tools changed
* no runtime behavior changed
* no remote runner endpoint was added
* no OpenCode API call was added
* no OpenCode CLI call was added
* no shell execution was added
* no model policy mutation was added
* ForgePilot repository remains clean after commit

Record artifacts under:

```text
runs/FP-MCP-013/
```

Recommended artifacts:

* `runs/FP-MCP-013/executor-result.md`
* `runs/FP-MCP-013/verification.txt`

