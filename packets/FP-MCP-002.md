# FP-MCP-002 — OpenCode Status Discovery Tool

## Task

Add a read-only ForgePilot MCP tool that reports constrained OpenCode executor readiness.

## Goal

Allow ChatGPT to discover whether an approved OpenCode executor station is available without exposing shell access, arbitrary process state, environment variables, secrets, filesystem access, Git mutation, SQLite mutation, or execution authority.

FP-MCP-002 answers one question:

**Can ChatGPT safely inspect OpenCode executor readiness without being able to execute OpenCode?**

This packet implements read-only discovery only.

It does not add executor start tools.

It does not add shell execution.

It does not add OpenCode run execution.

It does not add write tools.

---

## Scope Boundary

FP-MCP-002 may add one MCP tool:

* `forgepilot_get_opencode_status`

The tool may report:

* whether OpenCode discovery is configured
* whether executor status discovery is enabled
* configured executor station label
* configured OpenCode endpoint label, if safe
* supported ForgePilot run modes
* allowed model identifiers
* boundary document path
* boundary version
* execution enabled flag
* reason execution is disabled

The tool must not expose:

* shell output
* environment variables
* provider API keys
* Auth0 secrets
* OpenCode secrets
* raw OpenCode config files
* arbitrary process lists
* arbitrary filesystem paths
* user home directory contents
* server administration details
* Git mutation capability
* SQLite mutation capability
* OpenCode execution capability

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

FP-MCP-002 implements only the first safe step recommended by that boundary:

```text
forgepilot_get_opencode_status
```

This packet must preserve the FP-MCP-001 rule:

> ChatGPT must never receive a generic command runner.

---

## Required Tool Shape

The tool must be named:

```text
forgepilot_get_opencode_status
```

It must take no arbitrary command input.

It must not accept a prompt.

It must not accept a path.

It must not accept a shell command.

It must not accept Git arguments.

It must not accept SQL.

It must not start an OpenCode run.

---

## Required Response Shape

The response should be small JSON text.

Recommended fields:

```json
{
  "opencodeDiscoveryConfigured": true,
  "opencodeExecutionEnabled": false,
  "executorStationLabel": "local-opencode",
  "endpointLabel": "configured",
  "boundaryVersion": "FP-MCP-001",
  "boundaryDocument": "docs/opencode-executor-boundary.md",
  "supportedRunModes": [
    "DESIGN_ONLY"
  ],
  "allowedModels": [
    "deepseek-v4-pro-high",
    "qwen-3.7-max"
  ],
  "executionDisabledReason": "FP-MCP-002 is read-only discovery only. Executor start tools are not implemented."
}
```

The response must not include secrets.

The response must not include raw environment values.

The response must not include arbitrary filesystem paths outside approved ForgePilot-safe labels.

---

## Implementation Constraint

The first implementation should use static ForgePilot-safe configuration.

It should not inspect arbitrary server process state.

It should not call OpenCode CLI.

It should not call the OpenCode API unless a future packet explicitly allows that.

It should not execute shell commands.

It should not read environment variables for user-visible output.

This tool reports configured readiness policy, not live server administration state.

---

## Acceptance Criteria

* `forgepilot_get_opencode_status` exists.
* The tool is read-only.
* The tool accepts no arbitrary command input.
* The tool accepts no arbitrary prompt input.
* The tool accepts no arbitrary filesystem path input.
* The tool does not start OpenCode.
* The tool does not call shell execution.
* The tool does not mutate files.
* The tool does not mutate Git state.
* The tool does not mutate SQLite state.
* The tool does not expose secrets.
* The tool does not expose environment variables.
* The tool does not expose raw OpenCode config files.
* The tool returns a small JSON text payload.
* The tool references `docs/opencode-executor-boundary.md`.
* The tool reports execution as disabled.
* Existing read-only tools continue to work.
* The packet is justified by `PRINCIPLES.md`.
* The implementation preserves the FP-MCP-001 authority boundary.

---

## Verification Requirements

Run and record:

```bash
pnpm typecheck
pnpm test
```

Also verify through the ChatGPT MCP connector that:

* `forgepilot_get_opencode_status` is visible.
* `forgepilot_get_opencode_status` returns only constrained status data.
* existing tools still work:

  * `forgepilot_status`
  * `forgepilot_read_file`
  * `forgepilot_list_packets`
  * `forgepilot_list_runs`

