# FP-MCP-008 — MCP Output Schema Standards

## Task

Define standards for ForgePilot MCP tool output schemas and structured tool results.

## Goal

Address the OpenAI Actions warning:

```text
Output schema recommended
```

by defining how ForgePilot MCP tools should declare explicit output schemas and return structured results.

FP-MCP-008 answers one question:

**How should ForgePilot MCP tools expose machine-readable outputs without changing their authority boundaries?**

This packet is documentation-only.

It does not add MCP tools.

It does not remove MCP tools.

It does not change tool authority.

It does not add OpenCode execution.

It does not start OpenCode.

It does not add shell execution.

It does not mutate Git.

It does not mutate SQLite.

It does not create artifacts.

It does not change bridge runtime behavior.

---

## Scope Boundary

FP-MCP-008 may define:

* output schema standards
* structured result standards
* text fallback standards
* `_meta` usage rules
* output schema naming conventions
* required response fields for existing tools
* migration requirements for future implementation
* safety rules for structured outputs
* compatibility requirements for existing tools

FP-MCP-008 must not implement:

* output schema code changes
* new MCP tools
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* artifact creation
* arbitrary prompt execution
* write tools
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

## Reason for This Packet

OpenAI Actions reports:

```text
Output schema recommended
```

for ForgePilot MCP tools because the tools currently expose an input schema but do not declare explicit output schemas.

The tools currently return JSON-like data as text content.

Example current pattern:

```ts
return {
  content: [
    {
      type: "text",
      text: JSON.stringify(result, null, 2)
    }
  ]
};
```

This works, but the result is treated primarily as text.

The preferred future pattern is:

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

with a corresponding output schema declared in the tool descriptor.

---

## Core Rule

Every ForgePilot MCP tool that returns a structured object should declare an explicit output schema.

The returned structured object must match the declared output schema.

The human-readable text response may remain as a fallback.

Required future pattern:

```text
outputSchema defines the shape
structuredContent carries the object
content carries readable fallback text
_meta carries hidden UI/client-only metadata only when needed
```

---

## Authority Preservation Rule

Adding output schemas must not change tool authority.

Output schema migration must not:

* make read-only tools write-capable
* make write-capable tools execution-capable
* expose new filesystem access
* expose secrets
* expose environment variables
* expose raw shell output
* add OpenCode execution
* add arbitrary prompt execution
* change allowed inputs
* weaken validation rules
* weaken approval rules

Output schemas describe outputs.

They do not grant new authority.

---

## Model-Visible Result Channels

ForgePilot MCP tools may use these result channels:

```text
structuredContent
content
_meta
```

### structuredContent

`structuredContent` is model-visible and machine-readable.

It should contain the primary result object.

It must match the declared output schema.

It must not include secrets, hidden prompts, raw environment variables, credentials, or unbounded terminal output.

### content

`content` is model-visible and human-readable.

ForgePilot tools should preserve a readable text fallback for debugging and compatibility.

Recommended text fallback:

```text
JSON.stringify(result, null, 2)
```

### _meta

`_meta` is for client/component-only metadata when needed.

ForgePilot should avoid `_meta` until a concrete UI use case exists.

If `_meta` is used, it must not be relied on for evidence because it may not be visible to the model.

---

## Standard Output Fields

Where applicable, ForgePilot MCP tool outputs should use stable fields.

Common fields:

```text
boundaryVersion
statusSource
reasons
```

Execution-boundary fields:

```text
executionEnabled
executionStarted
requiresApproval
```

Validation fields:

```text
valid
packetExists
modelAllowed
runModeAllowed
workingTreeClean
```

Artifact fields:

```text
created
requestId
requestArtifactPath
artifactPath
```

Repository fields:

```text
repo
repoPath
branch
commit
workingTreeClean
gitStatusShort
```

File read fields:

```text
path
content
truncated
returnedChars
totalChars
```

---

## Stable Reason Codes

Tools that return `reasons` must use stable reason codes.

Examples:

```text
UNKNOWN_PACKET
INVALID_PACKET_ID
DISALLOWED_MODEL
DISALLOWED_RUN_MODE
DIRTY_WORKING_TREE
APPROVAL_REQUIRED
ARTIFACT_ALREADY_EXISTS
ARTIFACT_WRITE_FAILED
INVALID_ARTIFACT_PATH
FORBIDDEN_PATH
UNKNOWN_ERROR
```

Raw exception messages must not be returned as structured reasons if they may expose internals.

---

## Existing Tool Output Standards

FP-MCP-008 defines target output schema standards for the existing tool set.

### forgepilot_status

Required output fields:

```text
repo
repoPath
branch
commit
workingTreeClean
gitStatusShort
latestPackets
latestRuns
```

### forgepilot_get_opencode_status

Required output fields:

```text
opencodeDiscoveryConfigured
opencodeExecutionEnabled
executorStationLabel
endpointLabel
boundaryVersion
boundaryDocument
supportedRunModes
allowedModels
statusSource
liveOpenCodeChecked
executionDisabledReason
```

### forgepilot_list_packets

Required output fields:

```text
path
count
packets
```

### forgepilot_list_runs

Required output fields:

```text
path
count
runs
```

### forgepilot_read_file

Required output fields:

```text
path
content
truncated
returnedChars
totalChars
```

### forgepilot_validate_opencode_run_request

Required output fields:

```text
valid
executionEnabled
requiresApproval
packetExists
modelAllowed
runModeAllowed
workingTreeClean
baseCommit
wouldUseArtifactDir
boundaryVersion
statusSource
reasons
```

### forgepilot_create_opencode_run_request

Required output fields:

```text
created
valid
executionEnabled
executionStarted
requiresApproval
approvalAccepted
requestId
requestArtifactPath
packetId
modelId
runMode
baseCommit
boundaryVersion
statusSource
reasons
```

---

## Schema Naming Standard

Output schema constants should use stable names.

Recommended names:

```text
ForgePilotStatusOutputSchema
ForgePilotOpenCodeStatusOutputSchema
ForgePilotListPacketsOutputSchema
ForgePilotListRunsOutputSchema
ForgePilotReadFileOutputSchema
ForgePilotValidateOpenCodeRunRequestOutputSchema
ForgePilotCreateOpenCodeRunRequestOutputSchema
```

Shared helper schemas may be defined for repeated structures.

Examples:

```text
ReasonCodeSchema
BoundaryVersionSchema
StatusSourceSchema
```

---

## Compatibility Rule

The implementation packet that follows FP-MCP-008 must preserve backward compatibility.

Existing tools should continue returning readable text content.

The migration should add:

```text
structuredContent
outputSchema
```

not remove:

```text
content
```

This allows both humans and models to read the result.

---

## Output Schema Type Rules

Output schemas should be strict enough to be useful but not brittle.

Recommended type rules:

* booleans should be booleans
* counts should be numbers
* paths should be strings
* optional paths may be `null`
* arrays should declare item types
* `reasons` should be an array of strings
* known literal values may use enums where stable
* commit hashes may be strings
* tool-specific version fields should be strings

Avoid schemas that expose or require unstable internal implementation details.

---

## Safety Rules

Output schemas must not normalize unsafe data into trusted evidence.

Structured outputs must not include:

* secrets
* environment variables
* raw `.env` content
* SSH keys
* provider API keys
* OAuth tokens
* full prompts
* private conversations
* unbounded terminal output
* arbitrary file contents outside allowed roots
* raw stack traces
* unrestricted command output

When a tool reads file content, that content must remain constrained by existing path allowlists.

When a tool creates artifacts, response paths must remain derived from validated structured fields.

---

## Failure Output Rule

Failure responses should also match the declared output schema.

If a tool can return failure without throwing, the schema must support that failure shape.

For example:

```json
{
  "created": false,
  "valid": false,
  "executionEnabled": false,
  "executionStarted": false,
  "requiresApproval": true,
  "approvalAccepted": false,
  "requestId": null,
  "requestArtifactPath": null,
  "reasons": [
    "APPROVAL_REQUIRED"
  ]
}
```

Unexpected exceptions may still throw MCP errors, but expected validation failures should return structured failure objects.

---

## Logging Interaction

FP-MCP-004 sanitized logging remains authoritative.

Adding structured outputs must not cause logs to include:

* structuredContent
* content
* tool results
* tool arguments
* file contents
* secrets
* environment variables
* prompts
* raw OpenCode configuration
* shell output

Logs should continue to include only:

```text
MCP tool invoked: <tool_name>
MCP tool completed: <tool_name> PASS durationMs=<number>
MCP tool completed: <tool_name> FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

---

## Relationship to FP-MCP-001

FP-MCP-001 defines the OpenCode executor authority boundary.

FP-MCP-008 does not alter that boundary.

Output schemas must not introduce a generic command runner.

---

## Relationship to FP-MCP-002

FP-MCP-002 added OpenCode status discovery.

FP-MCP-008 defines the target output schema for that discovery result.

Execution must remain disabled.

---

## Relationship to FP-MCP-003

FP-MCP-003 defines the ChatGPT MCP compliance boundary.

FP-MCP-008 strengthens compliance by making tool outputs explicit and predictable.

---

## Relationship to FP-MCP-004

FP-MCP-004 added sanitized invocation logging.

FP-MCP-008 must not weaken logging redaction.

---

## Relationship to FP-MCP-005

FP-MCP-005 defines the OpenCode run request boundary.

FP-MCP-008 does not alter request boundary rules.

---

## Relationship to FP-MCP-006

FP-MCP-006 added request validation.

FP-MCP-008 defines the target structured output schema for the validation result.

---

## Relationship to FP-MCP-007

FP-MCP-007 added request artifact creation.

FP-MCP-008 defines the target structured output schema for artifact creation results.

---

## Acceptance Criteria

* Output schema standards are documented.
* `structuredContent` usage is documented.
* `content` fallback usage is documented.
* `_meta` usage is constrained.
* Authority preservation is documented.
* Existing tool output fields are documented.
* Stable reason code usage is documented.
* Compatibility requirements are documented.
* Safety restrictions are documented.
* Failure output requirements are documented.
* Logging restrictions are preserved.
* No MCP tools are added.
* No MCP tools are removed.
* No tool authority is changed.
* No OpenCode execution is added.
* No shell execution is added.
* No artifacts are created by this packet.
* No Git mutation is introduced by this packet.
* No SQLite mutation is introduced by this packet.

---

## Future Implementation Packet

The next implementation packet may be:

```text
FP-MCP-009 — Add MCP Structured Tool Outputs
```

That packet may update bridge code to add:

* output schemas
* `structuredContent`
* shared schema constants
* compatibility-preserving text fallbacks

That future implementation must not change authority boundaries.

---

## Verification Requirements

Because FP-MCP-008 is documentation-only, verification should confirm:

* packet exists
* packet is committed
* no bridge code changed
* no MCP tools changed
* no runtime behavior changed
* ForgePilot repository remains clean after commit

Record artifacts under:

```text
runs/FP-MCP-008/
```

Recommended artifacts:

* `runs/FP-MCP-008/executor-result.md`
* `runs/FP-MCP-008/verification.txt`

