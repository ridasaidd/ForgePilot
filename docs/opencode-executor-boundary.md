# OpenCode Executor Boundary

## Status

Design only.

This document defines the authority boundary for future OpenCode executor tools exposed through the ForgePilot ChatGPT MCP bridge.

It does not implement executor tools.

It does not add shell execution, filesystem mutation, Git mutation, SQLite mutation, OpenCode execution, or autonomous workflow behavior.

---

## Goal

Define how ChatGPT may request scoped OpenCode executor work through ForgePilot MCP without receiving arbitrary execution authority.

This document answers one question:

**How may ChatGPT request a ForgePilot-scoped OpenCode run without becoming a shell, filesystem, Git, database, or server operator?**

---

## Non-Goals

This document does not define or implement:

* OpenCode API calls
* OpenCode CLI invocation
* shell command execution
* arbitrary prompt execution
* file writing
* Git branch creation
* Git commits
* Git push
* SQLite writes
* metrics ingestion
* evidence admission
* model routing
* autonomous execution
* background workers
* retry orchestration
* artifact validation implementation

Those concerns require future packets.

Any proposal that gives ChatGPT generic execution authority must be rejected.

---

## Core Principle

ChatGPT must never receive a generic command runner.

ChatGPT may only request a named ForgePilot workflow action whose scope, inputs, outputs, authority, and artifact locations are constrained by ForgePilot.

Bad tool shape:

```text
run_command(command)
```

Bad tool shape:

```text
opencode_do_anything(prompt)
```

Good tool shape:

```text
forgepilot_start_opencode_run(packet_id, model_id, run_mode)
```

ChatGPT requests a ForgePilot-scoped executor run.

OpenCode acts as an executor station.

ForgePilot records artifacts and observations.

Admission remains separate.

---

## Governing Principles

This boundary is constrained by:

* P01 — ForgePilot records observations, not narratives.
* P02 — Trust cannot be retroactively created.
* P03 — ForgePilot does not optimize for favorable outcomes.
* P04 — Only admitted evidence may influence observatory outputs.
* P05 — Do not build infrastructure for evidence that does not yet exist.
* P06 — Classification follows observation.

---

## Relationship to Existing Standards

This boundary depends on:

* FP-META-014 — Metrics Trust and Validation Standards
* FP-META-015 — Telemetry Authority and Field Ownership Standards
* FP-META-016 — Persistence Standards

FP-META-014 defines whether records are safe to use as evidence.

FP-META-015 defines who is authoritative for each telemetry field.

FP-META-016 defines how records and lifecycle transitions survive over time.

This document defines how ChatGPT may request executor activity without receiving execution authority.

---

## Current MCP Security Baseline

The current MCP bridge exposes only read-only ForgePilot tools.

Current verified tools:

* `forgepilot_status`
* `forgepilot_read_file`
* `forgepilot_list_packets`
* `forgepilot_list_runs`

Current allowed read roots:

* `packets/`
* `runs/`
* `docs/`
* `metrics/`

The current bridge must not be treated as server access.

MCP access is tool-shaped access.

The bridge must continue to deny:

* arbitrary filesystem access
* home directory access
* environment variable access
* SSH key access
* `.env` access
* MCP bridge repository access
* shell output access
* OpenCode execution state unless exposed by a future constrained tool

---

## Proposed Tool Set

Future executor support should be introduced in phases.

### Phase 0 — Read-Only OpenCode Discovery

Recommended first tool:

```text
forgepilot_get_opencode_status
```

Purpose:

Report whether ForgePilot can see an approved OpenCode executor station.

This tool must be read-only.

It may return:

* availability status
* configured executor station identifier
* configured model allowlist
* supported run modes
* whether execution is currently disabled
* last known health check timestamp
* boundary version

It must not return:

* environment variables
* shell output
* arbitrary process lists
* OpenCode secrets
* provider API keys
* raw OpenCode config files
* unrestricted server details

### Phase 1 — Start Scoped Executor Run

Possible future tool:

```text
forgepilot_start_opencode_run(packet_id, model_id, run_mode)
```

Purpose:

Request a ForgePilot-scoped OpenCode executor run for a known packet.

This tool must not accept arbitrary prompts.

This tool must not accept arbitrary shell commands.

This tool must not accept arbitrary file paths.

This tool must not accept arbitrary Git operations.

The tool may create a run request only if all required boundary checks pass.

### Phase 2 — Read Run Status

Possible future tool:

```text
forgepilot_get_opencode_run_status(run_id)
```

Purpose:

Read the current lifecycle state of a ForgePilot-scoped OpenCode run.

This tool must be read-only.

It may return:

* run id
* packet id
* model id
* run mode
* lifecycle state
* artifact directory
* start timestamp
* completion timestamp when available
* failure reason when available

It must not expose:

* raw shell logs outside approved artifacts
* secrets
* arbitrary process state
* unrestricted OpenCode session data

### Phase 3 — Read Run Artifacts

Possible future tool:

```text
forgepilot_read_opencode_run_artifacts(run_id, artifact_kind)
```

Purpose:

Read approved artifacts produced by a ForgePilot-scoped OpenCode run.

Allowed artifact kinds may include:

* executor result
* verification output
* metrics artifact
* audit output
* comparison output
* run manifest

The tool must read only from the approved run artifact directory.

---

## Required Run Boundary

Every executor request must be bound to:

* `packet_id`
* `model_id`
* `run_mode`
* `base_commit`
* `requested_by`
* `requested_at`
* `allowed_repo`
* `allowed_artifact_dir`
* `boundary_version`

A run must not begin without a known packet.

A run must not begin without a known model.

A run must not begin without an allowed run mode.

A run must not begin from an unknown repository state.

A run must not begin if the ForgePilot working tree is dirty, unless a future explicit policy allows dirty-tree runs.

A run must not write outside its approved artifact path and approved working branch policy.

---

## Authority Boundary

ChatGPT may request executor work.

ChatGPT may not decide that executor output is evidence.

ChatGPT may not admit records.

ChatGPT may not override validation.

ChatGPT may not modify metrics directly.

ChatGPT may not write SQLite records directly.

ChatGPT may not mutate Git directly.

ChatGPT may not choose arbitrary filesystem targets.

ChatGPT may not provide arbitrary execution instructions.

ForgePilot owns the workflow boundary.

OpenCode owns executor activity.

Validation owns validation results.

Audit owns audit judgments.

Admission owns evidence eligibility.

Persistence owns lifecycle preservation.

---

## Required User Approval

Executor tools must require explicit user approval before starting any run.

Read-only discovery may be allowed without additional approval.

The first execution-capable tool must not auto-run from passive conversation context.

A valid execution request must identify:

* packet id
* model id
* run mode
* expected artifact directory
* whether the run may modify a branch
* whether the run may create artifacts
* whether the run may invoke tests

User approval must be tied to the named ForgePilot action, not to arbitrary command execution.

---

## Model Allowlist

Executor tools must use a model allowlist.

A request must fail if `model_id` is not allowed.

The allowlist should identify:

* provider
* model id
* display name
* permitted run modes
* executor role eligibility
* auditor role eligibility, if applicable
* maximum authority level
* telemetry source expectations

Example conceptual allowlist entries:

```text
deepseek-v4-pro-high
qwen-3.7-max
```

Model names must not be free-form authority grants.

A model being available in OpenCode does not automatically make it eligible for ForgePilot execution.

---

## Execution Modes

Execution modes must be named and constrained.

Possible run modes:

```text
DESIGN_ONLY
EXECUTE_PACKET
AUDIT_RUN
VERIFY_RUN
COMPARE_RUNS
READ_ONLY_ANALYSIS
```

Initial execution-capable support should avoid broad modes.

Recommended initial mode:

```text
DESIGN_ONLY
```

or no execution mode at all until `forgepilot_get_opencode_status` is accepted.

Each run mode must define:

* allowed inputs
* allowed outputs
* allowed artifact types
* whether file changes are permitted
* whether tests may run
* whether Git mutation is permitted
* whether SQLite mutation is permitted
* whether network access is permitted
* required validation artifacts

---

## Forbidden Capabilities

The MCP bridge must not expose tools shaped like:

```text
shell_exec(command)
run_command(command)
opencode_do_anything(prompt)
write_file(path, content)
git_exec(args)
git_push(...)
db_exec(sql)
read_any_file(path)
write_any_file(path, content)
dump_env()
list_home_directory()
read_ssh_key(...)
```

The bridge must not expose:

* arbitrary shell execution
* arbitrary filesystem read
* arbitrary filesystem write
* arbitrary Git mutation
* arbitrary SQLite mutation
* arbitrary database queries
* arbitrary OpenCode prompts
* environment variable dumping
* secret discovery
* SSH key access
* server administration
* package installation
* systemd control
* reverse proxy control
* Auth0 configuration mutation

---

## Artifact Requirements

Every executor run must produce durable artifacts.

Minimum artifact requirements:

* run manifest
* executor request record
* executor result artifact
* verification output when verification is part of the run
* metrics artifact when metrics are collected
* failure artifact when execution fails

The run manifest must include:

* run id
* packet id
* model id
* run mode
* requested by
* requested at
* base commit
* run branch, if applicable
* artifact directory
* boundary version
* tool version
* OpenCode station identifier, if available
* lifecycle state

Artifacts must be stored under a ForgePilot-approved run path.

Executor output must not be considered evidence merely because it exists.

---

## Evidence Rules

OpenCode output is not evidence by default.

Executor output may become evidence only after:

1. Required artifacts exist.
2. Provenance requirements are satisfied.
3. Validation passes.
4. Audit occurs where required.
5. Admission is explicitly recorded.

A run may produce signal without producing evidence.

A failed run may produce useful signal.

A successful OpenCode process exit is not equivalent to evidence admission.

A model claim is not evidence unless supported by admitted artifacts.

ChatGPT must not describe non-admitted output as observatory evidence.

---

## Failure Rules

A failed executor request must produce a failure observation when possible.

Failure states should distinguish:

* boundary rejection
* invalid packet id
* invalid model id
* unsupported run mode
* dirty working tree
* OpenCode unavailable
* execution failed
* artifact missing
* validation failed
* audit required
* admission not evaluated

Failure must not be silently converted into success.

Absence of failure must not imply success.

Each gate should record explicit passage or explicit failure.

---

## Lifecycle Model

Executor runs should move through explicit lifecycle states.

Possible lifecycle states:

```text
REQUESTED
BOUNDARY_CHECKED
REJECTED_BY_BOUNDARY
APPROVED
QUEUED
RUNNING
ARTIFACTS_RECORDED
VALIDATION_PENDING
VALIDATED
AUDIT_PENDING
AUDITED
ADMISSION_PENDING
ADMITTED
REJECTED
FAILED
QUARANTINED
CANCELLED
```

These states must not be collapsed into one generic status field.

A run may complete execution while still being non-admitted.

A run may be valid as an execution event but invalid as evidence.

---

## First Implementation Recommendation

The first implementation should not start OpenCode runs.

The first implementation should add only:

```text
forgepilot_get_opencode_status
```

This tool should be read-only.

It should prove that the MCP bridge can expose OpenCode executor readiness without exposing execution authority.

Only after that boundary is accepted should ForgePilot add:

```text
forgepilot_start_opencode_run
```

Execution should begin with the narrowest possible run mode and a strict model allowlist.

---

## Acceptance Criteria

* The document defines ChatGPT’s executor request boundary.
* The document rejects generic command execution.
* The document rejects arbitrary prompt execution.
* The document rejects arbitrary filesystem access.
* The document rejects arbitrary Git mutation.
* The document rejects arbitrary SQLite mutation.
* The document defines a proposed future tool set.
* The document defines required run boundaries.
* The document defines authority boundaries.
* The document defines user approval requirements.
* The document defines model allowlist requirements.
* The document defines execution mode requirements.
* The document defines forbidden tool shapes.
* The document defines artifact requirements.
* The document defines evidence rules.
* The document defines failure rules.
* The document recommends read-only OpenCode discovery before execution.
* The document does not implement executor tools.
* The document does not add OpenCode integration.
* The document does not add shell execution.
* The document does not add write tools.

---

## Open Questions

1. Should `forgepilot_get_opencode_status` read OpenCode status from the CLI, server API, or a ForgePilot-maintained config file?

2. Should execution requests require a clean ForgePilot working tree in all cases?

3. Should the first execution mode be `DESIGN_ONLY`, or should execution wait until packet execution semantics are separately defined?

4. Should `run_id` be generated by ForgePilot before OpenCode starts, or derived from OpenCode session metadata after execution begins?

5. Should OpenCode telemetry be ingested during execution, after execution, or only after artifact validation?

6. Should ChatGPT be allowed to request audits, or only executor runs?

7. Should model allowlists live in ForgePilot config, packet standards, SQLite, or MCP bridge config?

8. Should the MCP bridge itself create run directories, or should it delegate all artifact path creation to ForgePilot tooling?

9. What is the minimum artifact set required before a run can be considered validation-ready?

10. What explicit user approval language should be required before `forgepilot_start_opencode_run` is allowed?

---

## Boundary Summary

ChatGPT may request.

ForgePilot scopes.

OpenCode executes.

Artifacts record.

Validation checks.

Audit judges.

Admission decides.

Persistence preserves.

No single tool may collapse those responsibilities.

