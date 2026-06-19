# FP-MCP-005 — OpenCode Run Request Boundary

## Task

Define the boundary for future ForgePilot MCP tools that validate or request OpenCode executor runs.

## Goal

Allow ChatGPT to help coordinate OpenCode work without receiving shell access, arbitrary prompt authority, arbitrary command execution, Git mutation authority, SQLite mutation authority, or unrestricted server control.

FP-MCP-005 answers one question:

**What is the safe shape of a ForgePilot-scoped OpenCode run request?**

This packet is documentation-only.

It does not add MCP tools.

It does not start OpenCode.

It does not add shell execution.

It does not add arbitrary prompt execution.

It does not add filesystem mutation.

It does not mutate Git.

It does not mutate SQLite.

It does not change bridge runtime behavior.

---

## Scope Boundary

FP-MCP-005 may define:

* OpenCode run request fields
* allowed model identifiers
* allowed run modes
* run request lifecycle states
* validation requirements
* approval requirements
* artifact directory rules
* execution-disabled behavior
* failure classifications
* future MCP tool shapes

FP-MCP-005 must not implement:

* `forgepilot_request_opencode_run`
* `forgepilot_start_opencode_run`
* shell execution
* OpenCode CLI invocation
* OpenCode API invocation
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

## Relationship to FP-MCP-001

FP-MCP-001 defines the OpenCode executor authority boundary.

FP-MCP-005 preserves the FP-MCP-001 rule:

> ChatGPT must never receive a generic command runner.

A valid OpenCode run request must be a ForgePilot workflow request, not a free-form command or free-form prompt.

Forbidden shape:

```text
run_command(command)
```

Forbidden shape:

```text
opencode_do_anything(prompt)
```

Allowed future shape:

```text
forgepilot_validate_opencode_run_request(packet_id, model_id, run_mode)
```

Possible later shape:

```text
forgepilot_create_opencode_run_request(packet_id, model_id, run_mode)
```

---

## Relationship to FP-MCP-002

FP-MCP-002 added read-only OpenCode status discovery.

FP-MCP-005 must preserve:

```text
opencodeExecutionEnabled: false
liveOpenCodeChecked: false
statusSource: static ForgePilot-safe configuration
```

until a future packet explicitly enables stronger behavior.

---

## Relationship to FP-MCP-003

FP-MCP-003 defines the ChatGPT MCP compliance boundary.

FP-MCP-005 inherits these rules:

* no hidden side effects
* no generic execution authority
* no secret exposure
* no arbitrary filesystem access
* no arbitrary prompt execution
* explicit user approval before execution-capable actions
* write/execution-capable tools must not be represented as read-only

---

## Relationship to FP-MCP-004

FP-MCP-004 added sanitized MCP tool invocation logging.

Future run request validation or creation tools must be logged using the same safe logging pattern:

```text
MCP tool invoked: <tool_name>
MCP tool completed: <tool_name> PASS durationMs=<number>
MCP tool completed: <tool_name> FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

Logs must not include:

* prompts
* conversations
* tool arguments
* file contents
* tool result contents
* secrets
* environment variables
* raw OpenCode configuration
* shell output

---

## Core Model

ChatGPT may request a ForgePilot-scoped OpenCode run.

ForgePilot validates the request.

The user approves execution-capable actions.

OpenCode acts as the executor station.

ForgePilot records artifacts and observations.

Admission remains separate.

The authority chain is:

```text
User
↓
ChatGPT coordination
↓
ForgePilot MCP boundary
↓
ForgePilot validation
↓
User approval where required
↓
OpenCode executor station
↓
ForgePilot artifacts
↓
Validation / audit / admission
```

ChatGPT must not directly control the executor.

---

## Run Request Fields

A future OpenCode run request must include:

* `packet_id`
* `model_id`
* `run_mode`
* `requested_by`
* `requested_at`
* `base_commit`
* `working_tree_state`
* `artifact_dir`
* `boundary_version`
* `approval_state`
* `execution_enabled`

Optional future fields may include:

* `request_id`
* `run_id`
* `executor_station_label`
* `expected_outputs`
* `verification_profile`
* `audit_required`
* `comparison_group`

The request must not include:

* `shell_command`
* `arbitrary_prompt`
* `arbitrary_path`
* `git_arguments`
* `sql`
* `environment_variables`
* `secrets`
* raw OpenCode config
* provider API keys

---

## Packet ID Rule

A run request must identify a known ForgePilot packet.

A request with an unknown packet id must fail validation.

A request must not be created for a missing packet.

A packet id must be normalized and constrained to the ForgePilot packet namespace.

Valid examples:

```text
FP-MCP-005
FP-META-016
FP-012
FP-EVAL-002
```

Invalid examples:

```text
../secrets
.env
/home/user/file
arbitrary task text
```

---

## Model ID Rule

A run request must use an allowed model id.

Model ids must not be free-form authority grants.

Allowed initial model ids:

```text
deepseek-v4-pro-high
qwen-3.7-max
```

A model available in OpenCode is not automatically eligible for ForgePilot execution.

Model eligibility must be defined by ForgePilot.

A request with an unknown or disallowed model id must fail validation.

---

## Run Mode Rule

A run request must use an allowed run mode.

Initial allowed run mode:

```text
DESIGN_ONLY
```

Future possible run modes:

```text
VERIFY_RUN
AUDIT_RUN
COMPARE_RUNS
EXECUTE_PACKET
```

A run mode must define:

* whether repo reads are allowed
* whether source writes are allowed
* whether artifact writes are allowed
* whether tests may run
* whether Git mutation is allowed
* whether SQLite mutation is allowed
* whether OpenCode may invoke shell internally
* whether network access is allowed
* required artifacts
* required failure artifacts

Run modes must not be implied by natural language.

---

## DESIGN_ONLY Mode

`DESIGN_ONLY` is the initial safe mode.

It may allow:

* reading approved ForgePilot repository context
* analyzing a known packet
* producing an executor result artifact
* producing a design proposal
* writing only to an approved run artifact directory, if a future tool explicitly permits artifact creation

It must not allow:

* source file modification
* Git commits
* Git push
* SQLite writes
* package installation
* system service control
* arbitrary shell command execution
* arbitrary prompt execution
* secret access
* `.env` access
* SSH key access
* unrestricted filesystem access

`DESIGN_ONLY` output is not admitted evidence by default.

---

## Working Tree Rule

A future execution-capable run request must check the ForgePilot working tree state before execution.

Default rule:

```text
working tree must be clean
```

A dirty working tree must cause validation failure unless a future explicit dirty-tree policy exists.

The working tree check must be recorded as an observation.

---

## Artifact Directory Rule

A run request must resolve to an approved artifact directory.

Recommended initial shape:

```text
runs/<packet_id>/<request_id>/
```

or:

```text
runs/<packet_id>/<model_id>-<run_mode>/
```

The artifact directory must be under:

```text
runs/
```

The artifact directory must not be user-supplied as an arbitrary path.

The artifact directory must not escape the ForgePilot repository.

The artifact directory must not overlap secret or configuration paths.

---

## Approval Rule

Execution-capable tools must require explicit user approval.

Approval must identify:

* packet id
* model id
* run mode
* execution-enabled state
* expected artifact directory
* whether repo reads may occur
* whether source files may change
* whether tests may run
* whether Git may change
* whether SQLite may change
* whether OpenCode may be invoked

Approval must not be inferred from passive conversation context.

Approval must not authorize arbitrary command execution.

Approval must not authorize arbitrary prompt execution.

---

## Execution Disabled Rule

Until a future packet explicitly enables execution, run request validation must report execution as disabled.

Recommended response field:

```text
executionEnabled: false
```

A disabled execution state may still allow validation-only tools.

It must not start OpenCode.

It must not create execution artifacts unless a future packet explicitly permits request artifact creation.

---

## Future Tool: Validation Only

The next safe MCP tool should be:

```text
forgepilot_validate_opencode_run_request(packet_id, model_id, run_mode)
```

This tool must be read-only.

It must not start OpenCode.

It must not create artifacts.

It must not write files.

It must not mutate Git.

It must not mutate SQLite.

It should return a constrained JSON result such as:

```json
{
  "valid": true,
  "executionEnabled": false,
  "requiresApproval": true,
  "packetExists": true,
  "modelAllowed": true,
  "runModeAllowed": true,
  "workingTreeClean": true,
  "wouldUseArtifactDir": "runs/FP-MCP-005/<request-id>/",
  "reasons": []
}
```

---

## Future Tool: Request Artifact Creation

A later tool may create a run request artifact only after the validation tool exists.

Possible shape:

```text
forgepilot_create_opencode_run_request(packet_id, model_id, run_mode)
```

This tool would write a request artifact but must not start OpenCode.

It must require explicit user approval.

It must write only under an approved run artifact directory.

It must record that execution has not started.

---

## Future Tool: Execution

A still later tool may request execution only after validation and request artifact creation have been accepted.

Possible shape:

```text
forgepilot_start_opencode_design_run(request_id)
```

This tool must not accept arbitrary prompts.

This tool must not accept shell commands.

This tool must operate only on a previously recorded valid request artifact.

This tool must require explicit user approval.

This tool must record durable artifacts.

---

## Lifecycle States

Run request lifecycle states should be explicit.

Recommended states:

* `DRAFT`
* `VALIDATION_REQUESTED`
* `VALID`
* `INVALID`
* `APPROVAL_REQUIRED`
* `APPROVED`
* `REJECTED_BY_USER`
* `REQUEST_RECORDED`
* `EXECUTION_DISABLED`
* `QUEUED`
* `RUNNING`
* `ARTIFACTS_RECORDED`
* `FAILED`
* `CANCELLED`
* `VALIDATION_PENDING`
* `AUDIT_PENDING`
* `ADMISSION_PENDING`
* `ADMITTED`
* `REJECTED`
* `QUARANTINED`

These states must not be collapsed into one generic status field.

A request may be valid but not approved.

A request may be approved but not executed.

A run may complete but not be admitted.

---

## Failure Classification

Failures should distinguish:

* `UNKNOWN_PACKET`
* `DISALLOWED_MODEL`
* `DISALLOWED_RUN_MODE`
* `DIRTY_WORKING_TREE`
* `EXECUTION_DISABLED`
* `APPROVAL_REQUIRED`
* `APPROVAL_MISSING`
* `INVALID_ARTIFACT_DIR`
* `OPENAI_PLATFORM_BLOCK`
* `CONNECTOR_UNAVAILABLE`
* `BRIDGE_VALIDATION_REJECTION`
* `OPENCODE_UNAVAILABLE`
* `ARTIFACT_MISSING`
* `VALIDATION_FAILED`
* `AUDIT_REQUIRED`
* `ADMISSION_NOT_EVALUATED`
* `UNKNOWN_ERROR`

Failure must not be silently converted into success.

Absence of failure must not imply success.

---

## Evidence Boundary

A run request is not evidence by default.

An OpenCode run result is not evidence by default.

MCP output is not evidence by default.

Evidence requires explicit ForgePilot validation, provenance, audit where required, and admission state.

Successful execution is not admission.

Successful model output is not admission.

---

## Acceptance Criteria

* The OpenCode run request boundary is documented.
* The packet remains documentation-only.
* No MCP tools are added.
* No OpenCode execution is added.
* No shell execution is added.
* No arbitrary prompt execution is added.
* No write tools are added.
* No Git mutation is added.
* No SQLite mutation is added.
* Run request fields are defined.
* Packet id rules are defined.
* Model id rules are defined.
* Run mode rules are defined.
* `DESIGN_ONLY` mode is defined.
* Working tree rules are defined.
* Artifact directory rules are defined.
* Approval rules are defined.
* Execution-disabled behavior is defined.
* Future validation-only tool shape is defined.
* Future request-artifact tool shape is defined.
* Future execution tool shape is constrained.
* Lifecycle states are defined.
* Failure classifications are defined.
* Evidence boundary is defined.

---

## Verification Requirements

Run and record:

```bash
pnpm typecheck
pnpm test
```

Also verify through the ChatGPT MCP connector that current read-only tools still work:

* `forgepilot_status`
* `forgepilot_get_opencode_status`
* `forgepilot_list_packets`
* `forgepilot_list_runs`
* `forgepilot_read_file`

Record artifacts under:

```text
runs/FP-MCP-005/
```

Recommended artifacts:

* `runs/FP-MCP-005/executor-result.md`
* `runs/FP-MCP-005/verification.txt`

