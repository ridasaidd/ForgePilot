# FP-MCP-014 — Add OpenCode Capability Discovery Tool

## Task

Add a read-only ForgePilot MCP tool that reports OpenCode-related capability state without starting OpenCode or mutating policy.

## Goal

Implement the FP-MCP-013 capability discovery boundary by exposing a conservative, read-only capability discovery tool through the ForgePilot MCP bridge.

FP-MCP-014 answers one question:

**Can ChatGPT inspect ForgePilot/OpenCode capability state without gaining execution authority or changing model policy?**

This packet adds read-only capability discovery only.

It does not start OpenCode.

It does not call the OpenCode CLI.

It does not call the OpenCode API.

It does not call a remote runner endpoint.

It does not execute shell commands beyond existing constrained Git status operations already present in the bridge.

It does not mutate model policy.

It does not mutate Git.

It does not mutate SQLite.

---

## Scope Boundary

FP-MCP-014 may update the bridge to add:

* one read-only MCP capability discovery tool
* a structured output schema for the tool
* `structuredContent` result output
* readable text fallback content
* static/policy capability fields
* known allowed model and run-mode fields
* safe runner/bridge status labels
* stable reason codes

FP-MCP-014 must not add:

* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* remote runner API invocation
* shell execution tools
* arbitrary prompt execution
* arbitrary command execution
* model policy mutation
* model allowlist mutation
* request artifact creation
* run artifact creation
* Git mutation
* SQLite mutation
* background workers
* autonomous execution

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

## Relationship to FP-MCP-013

FP-MCP-013 defined capability discovery as observation.

FP-MCP-014 implements a conservative first version of that discovery.

The central rule remains:

```text
discoveredModels != allowedModels
```

The discovery tool may report both fields, but discovered models must not automatically become allowed models.

---

## Tool to Add

FP-MCP-014 should add:

```text
forgepilot_get_opencode_capabilities
```

---

## Tool Purpose

The tool reports safe ForgePilot/OpenCode capability state.

It should answer:

* What role is this bridge playing?
* Is execution currently enabled?
* What run modes are supported by policy?
* What models are allowed by policy?
* What models are discovered, if any?
* What runner capability source is being used?
* Is the OpenCode harness checked live?
* Is a remote runner checked live?
* Why is execution disabled, if disabled?

---

## Initial Implementation Strategy

FP-MCP-014 should use static and policy-derived capability information only.

Initial implementation must not call:

* OpenCode API
* OpenCode CLI
* remote runner endpoint
* shell commands for discovery

This avoids guessing OpenCode API routes before they are verified.

Recommended initial source:

```text
statusSource: "static ForgePilot capability policy"
```

Recommended live check flags:

```text
liveRunnerChecked: false
liveOpenCodeChecked: false
```

---

## Required Input Schema

The tool requires no input.

Input schema:

```ts
{}
```

---

## Required Output Fields

The tool should return:

```text
bridgeHostRole: string
runnerHostRole: string
runnerReachable: boolean
runnerVersion: string | null
runnerProtocolVersion: string | null
opencodeHarnessConfigured: boolean
opencodeHarnessReachable: boolean
executionEnabled: boolean
supportedOperations: string[]
supportedRunModes: string[]
discoveredModels: string[]
allowedModels: string[]
blockedModels: string[]
statusSource: string
boundaryVersion: string
checkedAt: string
liveRunnerChecked: boolean
liveOpenCodeChecked: boolean
reasons: string[]
```

---

## Recommended Initial Output Semantics

Initial conservative output should report:

```text
bridgeHostRole: "staging-control-plane"
runnerHostRole: "dev-execution-plane"
runnerReachable: false
runnerVersion: null
runnerProtocolVersion: null
opencodeHarnessConfigured: true
opencodeHarnessReachable: false
executionEnabled: false
supportedOperations:
  - "request-artifact-create"
  - "request-artifact-list"
  - "request-artifact-read"
  - "request-validation"
  - "static-capability-discovery"
supportedRunModes:
  - "DESIGN_ONLY"
discoveredModels:
  - "deepseek-v4-pro-high"
  - "qwen-3.7-max"
allowedModels:
  - "deepseek-v4-pro-high"
  - "qwen-3.7-max"
blockedModels: []
statusSource: "static ForgePilot capability policy"
boundaryVersion: "FP-MCP-014"
liveRunnerChecked: false
liveOpenCodeChecked: false
reasons:
  - "LIVE_RUNNER_NOT_CHECKED"
  - "LIVE_OPENCODE_NOT_CHECKED"
  - "EXECUTION_DISABLED"
```

If the implementation prefers `discoveredModels: []` because no live discovery occurs, that is acceptable if it clearly distinguishes static known models from live discovered models using an additional field such as `knownModels`.

However, the implementation should not claim live discovery.

---

## Structured Output Requirement

The tool must follow FP-MCP-008 and FP-MCP-009.

Required result pattern:

```ts
return {
  structuredContent: result,
  content: [
    {
      type: "text",
      text: JSON.stringify(result, null, 2)
    }
  ]
};
```

---

## Tool Annotation Requirement

The tool must be read-only:

```text
readOnlyHint: true
destructiveHint: false
idempotentHint: true
openWorldHint: false
```

---

## Safety Requirements

The tool must not expose:

* runner tokens
* OAuth tokens
* API keys
* environment variables
* raw OpenCode config
* raw provider credentials
* SSH keys
* private filesystem paths beyond approved safe labels
* prompts
* terminal output
* raw HTTP responses
* raw error stacks

---

## Policy Boundary

The tool must not update ForgePilot policy.

The tool must not mutate:

* allowed model list
* supported run modes
* request validation behavior
* execution enablement
* OpenCode configuration

The tool only reports capability state.

---

## Logging Requirement

FP-MCP-004 sanitized logging remains authoritative.

The tool must not log:

* model request arguments
* tool output
* structuredContent
* raw config
* secrets
* environment variables
* tokens
* prompts
* terminal output

Allowed log shape remains:

```text
MCP tool invoked: forgepilot_get_opencode_capabilities
MCP tool completed: forgepilot_get_opencode_capabilities PASS durationMs=<number>
MCP tool completed: forgepilot_get_opencode_capabilities FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

---

## Acceptance Criteria

* `forgepilot_get_opencode_capabilities` is added.
* The tool is read-only.
* The tool declares an input schema.
* The tool declares an output schema.
* The tool returns `structuredContent`.
* The tool preserves readable text fallback.
* The tool reports bridge/control-plane role.
* The tool reports runner/execution-plane role.
* The tool reports execution disabled unless a future packet enables it.
* The tool reports supported run modes.
* The tool reports allowed models.
* The tool distinguishes capability observation from policy.
* The tool does not call OpenCode API.
* The tool does not call OpenCode CLI.
* The tool does not call a remote runner endpoint.
* The tool does not execute shell commands for discovery.
* The tool does not mutate model policy.
* The tool does not mutate Git.
* The tool does not mutate SQLite.
* Sanitized logging is preserved.
* Existing tools remain available.
* Bridge build passes.
* Bridge tests pass.
* Tool appears after Actions refresh.

---

## Verification Requirements

In the bridge repo, run and record:

```bash
pnpm build
pnpm test
```

Restart the user service:

```bash
systemctl --user restart forgepilot-chatgpt-mcp-oauth.service
systemctl --user status forgepilot-chatgpt-mcp-oauth.service --no-pager
```

Refresh ChatGPT Actions.

Verify through ChatGPT MCP connector:

* `forgepilot_get_opencode_capabilities` is visible
* tool output is structured
* `executionEnabled` is false
* `liveRunnerChecked` is false
* `liveOpenCodeChecked` is false
* `allowedModels` are present
* `discoveredModels` does not grant policy
* existing tools remain available
* no execution is started

Record artifacts under:

```text
runs/FP-MCP-014/
```

Recommended artifacts:

* `runs/FP-MCP-014/executor-result.md`
* `runs/FP-MCP-014/verification.txt`
