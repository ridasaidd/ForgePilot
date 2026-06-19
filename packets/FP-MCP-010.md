# FP-MCP-010 — OpenCode Request Artifact Read Tool

## Task

Add read-only MCP tooling for inspecting existing ForgePilot OpenCode request artifacts.

## Goal

Allow ChatGPT to safely list and read durable OpenCode request artifacts created by FP-MCP-007 before any future execution-start capability exists.

FP-MCP-010 answers one question:

**Can ChatGPT inspect previously recorded OpenCode request artifacts without gaining execution authority?**

This packet adds read-only inspection capability only.

It does not start OpenCode.

It does not call the OpenCode CLI.

It does not call the OpenCode API.

It does not create request artifacts.

It does not modify request artifacts.

It does not mutate Git.

It does not mutate SQLite.

It does not execute shell commands other than the bridge's existing constrained repository status commands.

---

## Scope Boundary

FP-MCP-010 may add MCP tools that:

* list request artifacts under a specific packet
* read a specific request artifact by packet id and request id
* validate request artifact paths
* parse request artifact JSON
* return structured request artifact metadata
* return structured read/list results
* declare output schemas
* preserve readable text fallback content
* use sanitized invocation logging

FP-MCP-010 must not add:

* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell command execution tools
* arbitrary prompt execution
* arbitrary file read
* arbitrary file write
* request artifact creation
* request artifact mutation
* artifact deletion
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

## Relationship to Earlier MCP Packets

### FP-MCP-001

FP-MCP-001 defines the OpenCode executor authority boundary.

FP-MCP-010 does not alter that boundary.

### FP-MCP-005

FP-MCP-005 defines the OpenCode run request boundary.

FP-MCP-010 inspects request artifacts within that boundary.

### FP-MCP-006

FP-MCP-006 validates request intent before artifact creation.

FP-MCP-010 does not reclassify validation results.

It reads what was recorded.

### FP-MCP-007

FP-MCP-007 creates durable request artifacts.

FP-MCP-010 reads and lists those artifacts.

### FP-MCP-008

FP-MCP-008 defines output schema standards.

FP-MCP-010 must follow those standards.

### FP-MCP-009

FP-MCP-009 implemented structured outputs.

FP-MCP-010 must declare output schemas and return `structuredContent`.

---

## Tools to Add

FP-MCP-010 should add two read-only MCP tools:

```text
forgepilot_list_opencode_run_requests
forgepilot_read_opencode_run_request
```

---

## Tool: forgepilot_list_opencode_run_requests

### Purpose

List existing OpenCode request artifact files for a packet.

### Input

```text
packetId: string
limit?: number
```

### Behavior

The tool must:

* validate packet id format
* restrict listing to `runs/<packetId>/opencode-requests/`
* return an empty list if no request directory exists
* clamp `limit` to a safe maximum
* list only `.json` request artifacts
* sort deterministically
* return structured output
* preserve readable text fallback

### Output Fields

```text
packetId: string
path: string
count: number
requests: string[]
```

Optional future fields may include parsed request summaries, but FP-MCP-010 should prefer a simple filename list unless parsing is explicitly implemented.

### Authority

Read-only.

No artifact creation.

No execution.

---

## Tool: forgepilot_read_opencode_run_request

### Purpose

Read one existing OpenCode request artifact.

### Input

```text
packetId: string
requestId: string
```

### Behavior

The tool must:

* validate packet id format
* validate request id format
* restrict reads to `runs/<packetId>/opencode-requests/<requestId>.json`
* reject path traversal
* reject non-json files
* parse the JSON artifact
* return structured output
* preserve readable text fallback

### Output Fields

```text
packetId: string
requestId: string
requestArtifactPath: string
artifact: object
```

The returned `artifact` object should contain the parsed request artifact.

### Authority

Read-only.

No artifact creation.

No mutation.

No execution.

---

## Request ID Validation

Request IDs must follow the FP-MCP-007 format:

```text
REQ-<timestamp>Z-<hex>
```

Recommended validation expression:

```text
^REQ-[0-9]{8}T[0-9]{9}Z-[a-f0-9]{8}$
```

Example:

```text
REQ-20260619T084312145Z-a9960bd6
```

---

## Path Safety

All request artifact paths must be derived from validated structured fields.

Allowed read path shape:

```text
runs/<packetId>/opencode-requests/<requestId>.json
```

The tool must not accept a raw path input.

The tool must not read arbitrary files.

The tool must not allow:

* absolute paths
* `..`
* backslash traversal
* alternate extensions
* symlink expansion assumptions beyond existing repository permissions

---

## Output Schema Requirements

Both tools must declare output schemas.

### forgepilot_list_opencode_run_requests output schema

```text
packetId: string
path: string
count: number
requests: string[]
```

### forgepilot_read_opencode_run_request output schema

```text
packetId: string
requestId: string
requestArtifactPath: string
artifact: object
```

The implementation may use a permissive object schema for `artifact` because request artifacts may evolve by schema version.

---

## Structured Result Requirement

Both tools must return:

```ts
structuredContent: result
```

Both tools must preserve readable fallback content:

```ts
content: [
  {
    type: "text",
    text: JSON.stringify(result, null, 2)
  }
]
```

---

## Logging Requirement

FP-MCP-004 sanitized logging remains authoritative.

Logs must not include:

* packet id
* request id
* artifact content
* tool arguments
* structuredContent
* file content
* secrets
* environment variables
* prompts
* raw OpenCode configuration
* shell output

Logs should continue to use only:

```text
MCP tool invoked: <tool_name>
MCP tool completed: <tool_name> PASS durationMs=<number>
MCP tool completed: <tool_name> FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

---

## Failure Behavior

Expected validation failures may throw sanitized MCP errors or return structured failure objects.

Preferred behavior for FP-MCP-010:

* invalid packet id: throw safe validation error
* invalid request id: throw safe validation error
* forbidden path: throw safe validation error
* missing artifact: throw safe file-not-found error
* invalid JSON: throw safe parse error

Thrown errors must not expose secrets or raw internal data.

---

## Tool Annotation Requirements

Both tools must be annotated as read-only:

```text
readOnlyHint: true
destructiveHint: false
idempotentHint: true
openWorldHint: false
```

---

## Acceptance Criteria

* `forgepilot_list_opencode_run_requests` is added.
* `forgepilot_read_opencode_run_request` is added.
* Both tools are read-only.
* Both tools declare input schemas.
* Both tools declare output schemas.
* Both tools return `structuredContent`.
* Both tools preserve readable text fallback.
* Request artifact paths are derived from validated structured fields.
* Raw path input is not accepted.
* Packet id validation is enforced.
* Request id validation is enforced.
* Reads are restricted to `runs/<packetId>/opencode-requests/`.
* No OpenCode execution is added.
* No OpenCode CLI invocation is added.
* No OpenCode API invocation is added.
* No shell execution tool is added.
* No request artifact creation is added.
* No request artifact mutation is added.
* No Git mutation is added.
* No SQLite mutation is added.
* Sanitized logging remains preserved.
* Bridge build passes.
* Bridge tests pass.
* Tools appear after Actions refresh.
* Existing tools remain available.

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

* list request artifacts for `FP-MCP-007`
* read the known FP-MCP-007 request artifact
* confirm returned result is structured
* confirm no execution is started
* confirm existing tools remain available
* confirm repository safety boundaries remain intact

Record artifacts under:

```text
runs/FP-MCP-010/
```

Recommended artifacts:

* `runs/FP-MCP-010/executor-result.md`
* `runs/FP-MCP-010/verification.txt`

