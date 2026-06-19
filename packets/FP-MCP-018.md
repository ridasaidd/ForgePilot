# FP-MCP-018 — Add Remote Runner Status Tool

## Task

Add a read-only MCP tool that reports configured remote runner status without starting OpenCode.

## Goal

Allow the staging MCP bridge to safely observe whether a private dev-side remote runner is configured and reachable before any execution-start tool exists.

FP-MCP-018 answers one question:

**Can the staging MCP bridge safely check remote runner status without gaining execution authority?**

This packet implements a read-only status tool.

It does not start OpenCode.

It does not call the OpenCode CLI.

It does not call the OpenCode API.

It does not start a remote runner run.

It does not create execution artifacts.

It does not mutate request artifacts.

It does not mutate Git.

It does not mutate SQLite.

---

## Scope Boundary

FP-MCP-018 may add:

* one read-only MCP tool
* remote runner status output schema
* remote runner environment configuration discovery
* bounded GET request to a configured `/runner/capabilities` endpoint
* sanitized runner reachability reason codes
* structured output
* readable JSON fallback

FP-MCP-018 must not add:

* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* remote runner start behavior
* remote runner job creation
* shell execution
* arbitrary URL fetching
* arbitrary HTTP proxying
* raw prompt transmission
* raw command transmission
* request artifact mutation
* execution artifact creation
* Git mutation
* SQLite mutation
* background workers
* retry loops

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

## Tool Added

Add MCP tool:

```text
forgepilot_get_remote_runner_status
```

Tool purpose:

```text
Read remote runner capability status. This tool may contact only the configured runner capabilities endpoint and never starts OpenCode.
```

---

## Input Schema

The tool must accept no user-controlled input.

Required input schema:

```text
{}
```

The tool must not accept:

* runner URL
* raw HTTP URL
* request body
* packet id
* request id
* prompt
* command
* model id
* run mode
* artifact path
* environment variables
* secrets
* approval token

The runner endpoint must be derived only from controlled environment configuration.

---

## Environment Configuration

The tool may read:

```text
FORGEPILOT_REMOTE_RUNNER_BASE_URL
FORGEPILOT_RUNNER_BASE_URL
```

The first non-empty value may be used as the base URL.

The base URL must be normalized by trimming whitespace and removing trailing slashes.

The tool may read an optional bearer token from:

```text
FORGEPILOT_REMOTE_RUNNER_TOKEN
FORGEPILOT_RUNNER_TOKEN
```

The token must not be returned in output.

The token must not be logged.

The token must not be included in artifacts.

---

## Allowed Remote Contact

The only allowed remote contact is:

```text
GET <configured-runner-base-url>/runner/capabilities
```

The tool must not contact:

* arbitrary user-supplied URLs
* arbitrary runner paths
* OpenCode directly
* model providers directly
* shell endpoints
* execution endpoints
* artifact endpoints
* start-run endpoints

---

## Open World Annotation

Because this tool may contact a configured runner endpoint outside the ChatGPT/account boundary, the tool must be annotated:

```text
openWorldHint: true
```

This is required even though the tool is read-only.

The tool must also be annotated:

```text
readOnlyHint: true
destructiveHint: false
idempotentHint: true
```

---

## Output Schema

The tool must return structured output with at least:

```text
bridgeHostRole
runnerHostRole
runnerConfigured
runnerReachable
runnerEndpointLabel
runnerVersion
runnerProtocolVersion
executionEnabled
liveRunnerChecked
statusSource
boundaryVersion
checkedAt
supportedOperations
supportedRunModes
allowedModels
reasons
```

Output must not include:

* full runner URL
* bearer token
* environment variable values
* secrets
* raw HTTP headers
* raw runner response if sensitive
* prompt text
* shell commands
* OpenCode configuration
* terminal output

---

## Expected Unconfigured Result

When no runner URL is configured, the expected result is:

```json
{
  "bridgeHostRole": "staging-control-plane",
  "runnerHostRole": "dev-execution-plane",
  "runnerConfigured": false,
  "runnerReachable": false,
  "runnerEndpointLabel": "not-configured",
  "runnerVersion": null,
  "runnerProtocolVersion": null,
  "executionEnabled": false,
  "liveRunnerChecked": false,
  "statusSource": "local environment configuration",
  "boundaryVersion": "FP-MCP-018",
  "supportedOperations": [],
  "supportedRunModes": ["DESIGN_ONLY"],
  "allowedModels": ["deepseek-v4-pro-high", "qwen-3.7-max"],
  "reasons": ["RUNNER_UNCONFIGURED"]
}
```

---

## Expected Configured Unreachable Result

When a runner URL is configured but unreachable, the tool must return:

```text
runnerConfigured: true
runnerReachable: false
executionEnabled: false
liveRunnerChecked: true
```

Recommended reason codes:

```text
RUNNER_UNREACHABLE
RUNNER_TIMEOUT
RUNNER_AUTH_FAILED
RUNNER_PROTOCOL_ERROR
```

---

## Expected Configured Reachable Result

When the configured runner capabilities endpoint responds with valid JSON, the tool may return:

```text
runnerConfigured: true
runnerReachable: true
executionEnabled: false
liveRunnerChecked: true
```

The runner may report:

```text
runnerVersion
runnerProtocolVersion
supportedOperations
```

These are observations only.

They do not grant execution authority.

---

## Execution Policy

FP-MCP-018 must always return:

```text
executionEnabled: false
```

A reachable runner does not mean execution is allowed.

A future packet must explicitly add execution-start authority.

---

## Timeout Boundary

The runner capabilities request must use a bounded timeout.

Recommended initial timeout:

```text
3000 milliseconds
```

Timeout must produce:

```text
runnerReachable: false
reasons: ["RUNNER_TIMEOUT"]
```

The tool must not retry automatically.

---

## Reason Codes

The tool may emit:

```text
RUNNER_UNCONFIGURED
RUNNER_UNREACHABLE
RUNNER_TIMEOUT
RUNNER_AUTH_FAILED
RUNNER_PROTOCOL_ERROR
```

Additional reason codes require a future packet or explicit implementation justification.

---

## Logging Boundary

FP-MCP-004 sanitized logging remains authoritative.

The tool must only log sanitized tool invocation/completion lines.

Allowed log shape:

```text
MCP tool invoked: forgepilot_get_remote_runner_status
MCP tool completed: forgepilot_get_remote_runner_status PASS durationMs=<number>
MCP tool completed: forgepilot_get_remote_runner_status FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

The tool must not log:

* runner URL
* runner token
* request headers
* response body
* environment variables
* tool output
* secrets
* prompts
* commands
* OpenCode configuration

---

## Trust Boundary

Remote runner status is not authorization.

Remote runner status is not admitted evidence of execution.

Remote runner status is an observation.

Execution remains disabled.

---

## Implementation Notes

The implementation may add helper functions for:

* reading runner base URL from environment
* building the fixed `/runner/capabilities` URL
* building optional authorization headers
* parsing string fields
* parsing string array fields
* fetching remote runner capabilities with timeout
* producing structured status output

The implementation should avoid broad refactors.

`src/server.ts` may grow temporarily until ForgePilot can execute the module refactor through the observed model-run path.

---

## Acceptance Criteria

* Tool `forgepilot_get_remote_runner_status` is added.
* Tool accepts no input.
* Tool uses structured output.
* Tool preserves readable JSON fallback.
* Tool is marked read-only.
* Tool is marked non-destructive.
* Tool is marked idempotent.
* Tool is marked open-world.
* Tool may contact only configured `/runner/capabilities`.
* Tool does not accept arbitrary URLs.
* Tool does not start OpenCode.
* Tool does not call OpenCode CLI.
* Tool does not call OpenCode API.
* Tool does not create runner jobs.
* Tool does not create execution artifacts.
* Tool does not mutate request artifacts.
* Tool does not mutate Git.
* Tool does not mutate SQLite.
* Tool returns `executionEnabled: false`.
* Tool returns `RUNNER_UNCONFIGURED` when no runner is configured.
* Tool does not expose secrets.
* Tool does not log secrets.
* Build passes.
* Test passes.
* Tool is visible in ChatGPT Actions.
* Tool can be invoked from ChatGPT.
* Initial unconfigured status is observed correctly.

---

## Verification Requirements

Verification must record:

* ForgePilot packet commit
* bridge implementation commit
* build/test result
* service restart result
* Actions refresh/tool visibility result
* live tool invocation result
* expected unconfigured runner result
* confirmation that execution remains disabled
* confirmation that no runner start occurred
* confirmation that no OpenCode execution occurred

Record artifacts under:

```text
runs/FP-MCP-018/
```

Recommended artifacts:

* `runs/FP-MCP-018/executor-result.md`
* `runs/FP-MCP-018/verification.txt`
