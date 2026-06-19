# FP-MCP-009 — Add MCP Structured Tool Outputs

## Task

Update the ForgePilot MCP bridge so existing tools declare output schemas and return structured tool results.

## Goal

Implement the FP-MCP-008 output schema standards by adding explicit output schemas and `structuredContent` to existing ForgePilot MCP tools without changing tool authority, tool inputs, validation rules, approval rules, or execution boundaries.

FP-MCP-009 answers one question:

**Can ForgePilot MCP tools expose structured, schema-backed outputs while preserving their existing safety boundaries?**

This packet implements structured outputs only.

It does not add new tool authority.

It does not start OpenCode.

It does not call the OpenCode CLI.

It does not call the OpenCode API.

It does not add shell execution.

It does not add arbitrary prompt execution.

It does not weaken path allowlists.

It does not weaken validation.

It does not weaken approval.

It does not mutate Git.

It does not mutate SQLite.

---

## Scope Boundary

FP-MCP-009 may update the bridge to add:

* output schema constants
* tool `outputSchema` declarations
* `structuredContent` returns
* compatibility-preserving text fallback returns
* shared schema helpers
* TypeScript types where useful

FP-MCP-009 must not add:

* new MCP tools
* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* arbitrary prompt execution
* broader filesystem access
* arbitrary file read
* arbitrary file write
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

## Relationship to FP-MCP-008

FP-MCP-008 defined the output schema standards.

FP-MCP-009 implements those standards for the current ForgePilot MCP bridge.

The implementation must preserve backward compatibility by continuing to return readable text content.

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

Each tool descriptor should declare a matching `outputSchema`.

---

## Authority Preservation Rule

Adding output schemas must not change tool authority.

The implementation must not:

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
* weaken logging redaction

Output schemas describe outputs only.

They do not grant new capabilities.

---

## Tools in Scope

FP-MCP-009 applies to the currently implemented ForgePilot MCP tools:

```text
forgepilot_status
forgepilot_get_opencode_status
forgepilot_list_packets
forgepilot_list_runs
forgepilot_validate_opencode_run_request
forgepilot_create_opencode_run_request
forgepilot_read_file
```

---

## Required Output Schema Constants

The implementation should add stable schema constants.

Recommended names:

```text
ForgePilotStatusOutputSchema
ForgePilotOpenCodeStatusOutputSchema
ForgePilotListPacketsOutputSchema
ForgePilotListRunsOutputSchema
ForgePilotValidateOpenCodeRunRequestOutputSchema
ForgePilotCreateOpenCodeRunRequestOutputSchema
ForgePilotReadFileOutputSchema
```

Shared schemas may be added for common fields.

Recommended shared schemas:

```text
ReasonCodeSchema
NullableStringSchema
```

---

## Required Tool Output Shapes

### forgepilot_status

Output fields:

```text
repo: string
repoPath: string
branch: string
commit: string
workingTreeClean: boolean
gitStatusShort: string
latestPackets: string[]
latestRuns: string[]
```

### forgepilot_get_opencode_status

Output fields:

```text
opencodeDiscoveryConfigured: boolean
opencodeExecutionEnabled: boolean
executorStationLabel: string
endpointLabel: string
boundaryVersion: string
boundaryDocument: string
supportedRunModes: string[]
allowedModels: string[]
statusSource: string
liveOpenCodeChecked: boolean
executionDisabledReason: string
```

### forgepilot_list_packets

Output fields:

```text
path: string
count: number
packets: string[]
```

### forgepilot_list_runs

Output fields:

```text
path: string
count: number
runs: string[]
```

### forgepilot_validate_opencode_run_request

Output fields:

```text
valid: boolean
executionEnabled: boolean
requiresApproval: boolean
packetExists: boolean
modelAllowed: boolean
runModeAllowed: boolean
workingTreeClean: boolean
baseCommit: string
wouldUseArtifactDir: string | null
boundaryVersion: string
statusSource: string
reasons: string[]
```

### forgepilot_create_opencode_run_request

Output fields:

```text
created: boolean
valid: boolean
executionEnabled: boolean
executionStarted: boolean
requiresApproval: boolean
approvalAccepted: boolean
requestId: string | null
requestArtifactPath: string | null
packetId: string
modelId: string
runMode: string
baseCommit: string | null
boundaryVersion: string
statusSource: string
reasons: string[]
```

### forgepilot_read_file

Output fields:

```text
path: string
content: string
truncated: boolean
returnedChars: number
totalChars: number
```

---

## Text Fallback Requirement

Every updated tool must continue returning readable text content.

Required fallback:

```ts
content: [
  {
    type: "text",
    text: JSON.stringify(result, null, 2)
  }
]
```

This preserves compatibility with current ChatGPT behavior and human debugging.

---

## Structured Content Requirement

Every updated tool must return:

```ts
structuredContent: result
```

The `structuredContent` object must match the declared `outputSchema`.

---

## Failure Response Requirement

Expected validation failures must remain structured success-level tool responses, not thrown exceptions.

Examples:

* unknown packet
* disallowed model
* disallowed run mode
* dirty working tree
* missing approval

These responses must include stable `reasons`.

Unexpected runtime exceptions may still throw MCP errors.

---

## Logging Requirement

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

## Existing Tool Annotation Preservation

Tool annotations must remain consistent with current authority.

Read-only tools must remain:

```text
readOnlyHint: true
destructiveHint: false
idempotentHint: true
openWorldHint: false
```

The request artifact creation tool must remain:

```text
readOnlyHint: false
destructiveHint: false
idempotentHint: false
openWorldHint: false
```

---

## Acceptance Criteria

* Existing MCP tools remain available.
* No new MCP tools are added.
* No MCP tools are removed.
* Every existing tool declares an output schema.
* Every existing tool returns `structuredContent`.
* Every existing tool preserves readable text fallback content.
* `structuredContent` matches the declared output schema.
* Read-only annotations are preserved.
* Write-capable artifact tool annotation is preserved.
* Input schemas are not broadened.
* Path allowlists are not broadened.
* Validation rules are not weakened.
* Approval rules are not weakened.
* Sanitized logging is preserved.
* No OpenCode execution is added.
* No shell execution is added.
* No arbitrary prompt execution is added.
* No Git mutation is added.
* No SQLite mutation is added.
* Bridge build passes.
* Bridge tests pass.
* Actions no longer report output schema warnings after refresh, or any remaining warning is documented.

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

Wait for propagation if needed.

Verify through ChatGPT MCP connector:

* tools remain visible
* output schemas are present in Actions UI
* `forgepilot_status` returns expected structured data
* `forgepilot_get_opencode_status` returns expected structured data
* `forgepilot_list_packets` returns expected structured data
* `forgepilot_list_runs` returns expected structured data
* `forgepilot_validate_opencode_run_request` returns expected structured data
* `forgepilot_create_opencode_run_request` still enforces approval and validation
* `forgepilot_read_file` returns expected structured data
* existing authority boundaries remain unchanged

Record artifacts under:

```text
runs/FP-MCP-009/
```

Recommended artifacts:

* `runs/FP-MCP-009/executor-result.md`
* `runs/FP-MCP-009/verification.txt`

