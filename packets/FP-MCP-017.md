# FP-MCP-017 — MCP Bridge Module Refactor Boundary

## Task

Define the safety boundary for refactoring the ForgePilot MCP bridge from a large single-file implementation into smaller modules.

## Goal

Allow the MCP bridge to become maintainable before additional runtime behavior is added, while preserving all existing tool behavior, schemas, annotations, authorization, logging, and safety boundaries.

FP-MCP-017 answers one question:

**How may the ForgePilot MCP bridge be split into modules without changing tool authority or runtime behavior?**

This packet is boundary-only.

It does not implement the refactor.

It does not add MCP tools.

It does not remove MCP tools.

It does not change tool behavior.

It does not change tool authority.

It does not start OpenCode.

It does not call the OpenCode CLI.

It does not call the OpenCode API.

It does not contact the remote runner.

It does not execute shell commands beyond existing behavior.

It does not mutate Git.

It does not mutate SQLite.

---

## Reason for This Packet

The MCP bridge implementation file has grown large.

Current observed concern:

```text
src/server.ts is approximately 1314 lines
```

Continuing to add runtime behavior to a large single file increases risk:

* accidental authority changes
* duplicated validation logic
* inconsistent output schemas
* logging drift
* path-safety mistakes
* difficult audits
* difficult model-generated patches
* larger blast radius for future execution-capable tools

Before adding remote runner start behavior, ForgePilot should define how the bridge may be split safely.

---

## Scope Boundary

FP-MCP-017 may define:

* module split goals
* allowed file/module layout
* behavior-preservation requirements
* public tool contract preservation
* schema preservation requirements
* authorization preservation requirements
* logging preservation requirements
* path safety preservation requirements
* validation helper preservation requirements
* test/build verification requirements
* audit requirements
* future implementation constraints

FP-MCP-017 must not implement:

* module refactor code
* new MCP tools
* tool removals
* tool behavior changes
* new OpenCode behavior
* remote runner behavior
* execution-start behavior
* shell execution
* Git mutation
* SQLite mutation
* runtime policy changes

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

## Core Rule

The refactor must be behavior-preserving.

The refactor may move code.

The refactor may rename internal helper functions if behavior is preserved.

The refactor may introduce module boundaries.

The refactor must not change public MCP contracts.

Required invariant:

```text
same tools
same inputs
same outputs
same schemas
same annotations
same authority
same logging policy
same path restrictions
same approval requirements
same execution-disabled state
```

---

## Existing Tool Contract Preservation

The following MCP tools must remain available after refactor:

```text
forgepilot_status
forgepilot_get_opencode_status
forgepilot_get_opencode_capabilities
forgepilot_list_packets
forgepilot_list_runs
forgepilot_validate_opencode_run_request
forgepilot_create_opencode_run_request
forgepilot_list_opencode_run_requests
forgepilot_read_opencode_run_request
forgepilot_validate_remote_runner_request
forgepilot_read_file
```

No tool may be added or removed by the refactor implementation packet unless a separate packet explicitly authorizes it.

---

## Public Contract Preservation

For every existing tool, the refactor must preserve:

* tool name
* description intent
* input schema
* output schema
* structuredContent shape
* readable text fallback
* annotations
* error behavior for expected validation failures
* sanitized logging behavior
* read/write authority

---

## Authority Preservation

The refactor must not change authority.

Specifically, it must not:

* make read-only tools write-capable
* make write-capable tools execution-capable
* add OpenCode execution
* add OpenCode CLI invocation
* add OpenCode API invocation
* add remote runner contact
* add shell execution
* broaden filesystem reads
* broaden filesystem writes
* weaken approval requirements
* weaken validation rules
* mutate model policy
* mutate Git
* mutate SQLite

---

## Recommended Module Layout

A future implementation may split `src/server.ts` into modules such as:

```text
src/server.ts
src/mcp/createServer.ts
src/mcp/toolRegistration.ts
src/mcp/schemas.ts
src/mcp/structuredResult.ts
src/forgepilot/git.ts
src/forgepilot/paths.ts
src/forgepilot/files.ts
src/forgepilot/opencodePolicy.ts
src/forgepilot/opencodeRequests.ts
src/forgepilot/capabilities.ts
src/forgepilot/remoteRunnerValidation.ts
src/logging/sanitizedToolLogging.ts
src/http/httpServer.ts
src/http/sessionTransports.ts
```

This layout is a recommendation, not a strict requirement.

The implementation packet may choose a smaller split if it reduces risk.

---

## Minimum Refactor Target

The first implementation should prefer a conservative split.

Recommended minimum:

```text
src/server.ts
src/schemas.ts
src/structuredResult.ts
src/forgepilot.ts
src/tools.ts
src/logging.ts
```

The implementation should avoid over-engineering.

The goal is safer future evolution, not architectural novelty.

---

## Auth and HTTP Boundary

OAuth/Auth0 and HTTP transport behavior must be preserved.

The refactor must not change:

* bearer/OIDC auth behavior
* OAuth protected resource metadata behavior
* `/mcp` route behavior
* session transport behavior
* host/port configuration
* Auth0 validation behavior
* unauthorized response behavior
* WWW-Authenticate behavior

Auth code may be moved only if behavior remains unchanged.

---

## Logging Boundary

FP-MCP-004 sanitized logging remains authoritative.

The refactor must preserve allowed log shape:

```text
MCP tool invoked: <tool_name>
MCP tool completed: <tool_name> PASS durationMs=<number>
MCP tool completed: <tool_name> FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

The refactor must not add logs containing:

* tool arguments
* tool outputs
* structuredContent
* file contents
* request artifact contents
* approval tokens
* secrets
* environment variables
* prompts
* terminal output
* raw OpenCode configuration
* raw runner responses

---

## Path Safety Boundary

The refactor must preserve allowed read roots:

```text
packets
runs
docs
metrics
```

It must preserve path normalization behavior.

It must not allow:

* absolute paths
* `..`
* path traversal
* arbitrary repository reads
* arbitrary repository writes
* non-derived request artifact paths
* user-supplied artifact directories

---

## Request Artifact Boundary

The refactor must preserve request artifact behavior.

Existing behavior to preserve:

* request artifact creation requires exact approval token
* request artifact paths are derived from packet id and request id
* request artifacts are created under `runs/<packetId>/opencode-requests/`
* request artifact creation uses non-overwrite behavior
* request artifact read/list tools are read-only
* remote runner validation does not contact runner
* old request artifacts may become ineligible due to base commit mismatch

---

## Capability Boundary

The refactor must preserve capability discovery behavior.

Existing behavior to preserve:

* capability discovery is read-only
* capability discovery uses static policy source
* executionEnabled remains false
* liveRunnerChecked remains false
* liveOpenCodeChecked remains false
* discoveredModels and allowedModels remain separate fields
* capability discovery does not mutate model policy

---

## Execution Boundary

The refactor must preserve the current execution boundary:

```text
No OpenCode execution exists.
No remote runner contact exists.
No shell execution tool exists.
```

Any change to this boundary requires a separate packet.

---

## Output Schema Boundary

The refactor must preserve all output schemas.

The refactor must preserve:

* `outputSchema`
* `structuredContent`
* readable JSON text fallback
* nullable string semantics
* reason code arrays
* current field names

No output field may be removed or renamed.

---

## Testing Requirements

A future implementation must run:

```bash
pnpm build
pnpm test
```

If tests are minimal, manual MCP tool verification must cover key tools:

```text
forgepilot_status
forgepilot_get_opencode_capabilities
forgepilot_validate_remote_runner_request
forgepilot_read_file
```

---

## MCP Verification Requirements

After implementation, verify through ChatGPT MCP connector that:

* existing tools remain visible
* structured outputs still work
* capability tool still reports executionEnabled false
* remote runner validation still rejects stale request artifact with BASE_COMMIT_MISMATCH
* request artifact read/list still works
* read_file path restrictions still work
* no new output schema warnings appear
* no execution-capable tool appears unexpectedly

---

## Refactor Failure Handling

If the refactor breaks build or tests, it must be rejected or fixed before recording success.

If MCP tool visibility changes unexpectedly, the refactor must be rejected or fixed.

If any tool authority changes, the refactor must be rejected.

If path safety changes, the refactor must be rejected.

If logging leaks tool arguments or outputs, the refactor must be rejected.

---

## AI-Assisted Refactor Boundary

A future implementation may be executed by an open-weight model through ForgePilot once execution capability exists.

If AI-assisted, the refactor task must be constrained:

Allowed:

* split modules
* preserve behavior
* preserve tool contracts
* preserve schemas
* preserve annotations
* preserve auth
* preserve logging
* preserve path safety
* preserve approval requirements

Forbidden:

* adding tools
* removing tools
* changing authority
* changing approval tokens
* changing allowed models
* changing run modes
* adding execution
* contacting runner
* broadening filesystem access
* changing auth behavior
* changing output fields

The AI output must still be audited.

A successful build is not sufficient evidence by itself.

---

## Acceptance Criteria

* Refactor boundary is documented.
* Behavior-preservation requirement is documented.
* Existing tool list is documented.
* Public contract preservation is documented.
* Authority preservation is documented.
* Recommended module layout is documented.
* Minimum refactor target is documented.
* Auth/HTTP boundary is documented.
* Logging boundary is documented.
* Path safety boundary is documented.
* Request artifact boundary is documented.
* Capability boundary is documented.
* Execution boundary is documented.
* Output schema boundary is documented.
* Testing requirements are documented.
* MCP verification requirements are documented.
* Refactor failure handling is documented.
* AI-assisted refactor boundary is documented.
* No module refactor is implemented.
* No MCP tools are added.
* No MCP tools are removed.
* No tool behavior is changed.
* No OpenCode execution is added.
* No remote runner contact is added.
* No shell execution is added.
* No Git mutation is added.
* No SQLite mutation is added.

---

## Future Implementation Packet

The future implementation packet may be:

```text
FP-MCP-018 — Split MCP Bridge Tool Modules
```

That packet may implement the module split if it satisfies FP-MCP-017.

---

## Verification Requirements

Because FP-MCP-017 is boundary-only, verification should confirm:

* packet exists
* packet is committed
* no bridge code changed
* no MCP tools changed
* no runtime behavior changed
* no OpenCode execution was added
* no remote runner contact was added
* no shell execution was added
* ForgePilot repository remains clean after commit

Record artifacts under:

```text
runs/FP-MCP-017/
```

Recommended artifacts:

* `runs/FP-MCP-017/executor-result.md`
* `runs/FP-MCP-017/verification.txt`
