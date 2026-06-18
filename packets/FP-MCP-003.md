# FP-MCP-003 — ChatGPT MCP Compliance Boundary

## Task

Define the compliance, safety, and platform-boundary rules for ForgePilot MCP tools exposed to ChatGPT.

## Goal

Ensure future ForgePilot MCP tools remain narrow, auditable, user-approved where necessary, and compliant with the expected boundaries of ChatGPT custom connectors/actions.

FP-MCP-003 answers one question:

**How does ForgePilot prevent its ChatGPT MCP bridge from becoming a hidden shell, unsafe automation layer, secret-exposure path, or platform-policy bypass mechanism?**

This packet is documentation-only.

It does not add tools.

It does not add OpenCode execution.

It does not add shell execution.

It does not add write access.

It does not mutate Git, SQLite, files, or bridge behavior.

---

## Scope Boundary

FP-MCP-003 may add documentation defining:

* MCP tool safety requirements
* platform compliance boundaries
* read-only tool requirements
* write/destructive tool requirements
* user approval requirements
* secret-handling rules
* logging rules
* forbidden tool shapes
* future execution-tool constraints

FP-MCP-003 must not implement:

* shell execution
* generic command execution
* OpenCode run execution
* arbitrary prompt execution
* filesystem mutation
* Git mutation
* SQLite mutation
* environment-variable exposure
* secret access
* server administration
* background execution
* autonomous workflow behavior

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

FP-MCP-003 extends that boundary with platform compliance requirements.

The FP-MCP-001 rule remains governing:

> ChatGPT must never receive a generic command runner.

Any MCP tool that gives ChatGPT arbitrary execution authority must be rejected.

---

## Relationship to FP-MCP-002

FP-MCP-002 added:

```text
forgepilot_get_opencode_status

That tool is compliant with this boundary because it:

is read-only
accepts no input
does not execute shell commands
does not call OpenCode
does not inspect processes
does not read environment variables
does not expose secrets
reports OpenCode execution as disabled
uses static ForgePilot-safe configuration

FP-MCP-003 preserves this pattern for future tools.

Core Compliance Rule

ForgePilot MCP tools must be named workflow actions, not general-purpose authority channels.

Allowed shape:

forgepilot_get_opencode_status()

Allowed future shape:

forgepilot_start_opencode_run(packet_id, model_id, run_mode)

Forbidden shape:

run_command(command)

Forbidden shape:

opencode_do_anything(prompt)

Forbidden shape:

read_any_file(path)

Forbidden shape:

db_exec(sql)

The bridge must expose only narrow ForgePilot-scoped actions whose authority, inputs, outputs, and side effects are explicitly defined before implementation.

Read-Only Tool Rules

A read-only MCP tool must:

be side-effect-free
avoid filesystem mutation
avoid Git mutation
avoid SQLite mutation
avoid shell execution
avoid OpenCode execution
avoid background jobs
avoid hidden writes
avoid secret exposure
avoid raw environment-variable exposure
avoid unrestricted filesystem reads
return only the minimum information needed for the tool purpose

A read-only tool may read approved ForgePilot repository paths only when explicitly allowed.

Approved read roots may include:

packets/
runs/
docs/
metrics/

Read-only tools must not read:

.env
SSH keys
OAuth secrets
provider API keys
home directory contents
raw OpenCode config files
system files
arbitrary user-supplied paths outside approved roots
Write or Execution-Capable Tool Rules

A write or execution-capable MCP tool must not be introduced without a future packet.

A write or execution-capable tool must:

have a specific ForgePilot workflow name
use narrow structured inputs
reject arbitrary prompts
reject arbitrary shell commands
reject arbitrary filesystem paths
reject arbitrary Git arguments
reject arbitrary SQL
require explicit user approval before execution
clearly describe side effects
record durable artifacts
record failure observations
preserve auditability
enforce model allowlists where models are involved
enforce run-mode allowlists where execution modes are involved
fail closed when boundary checks are incomplete

Execution-capable tools must not be marked or described as read-only.

User Approval Rule

Any tool that can mutate state or trigger external execution must require explicit user approval.

Approval must be tied to a named ForgePilot action.

Approval must not be inferred from passive conversation context.

A valid approval request must identify:

tool name
packet id, when applicable
model id, when applicable
run mode, when applicable
expected artifact directory
whether files may be changed
whether tests may run
whether Git state may change
whether SQLite state may change
whether OpenCode may be invoked
expected side effects

The user must not be asked to approve arbitrary command execution.

Secret Handling Rules

MCP tools must not expose:

OAuth client secrets
Auth0 secrets
OpenCode secrets
provider API keys
environment variables
session tokens
refresh tokens
SSH private keys
.env contents
raw config files containing secrets
credentials
MFA codes
passwords

Errors must be sanitized.

Tool outputs must not include secret-bearing paths or raw internal configuration.

Logging Rules

The bridge may log minimal operational metadata.

Allowed safe logs:

timestamp
tool name
success/failure
sanitized error code
session initialized
request id, if non-secret
duration

Forbidden logs:

full ChatGPT conversation text
OAuth tokens
API keys
environment variables
secret-bearing config
file contents
arbitrary tool arguments containing sensitive data
raw prompts for execution tools
private keys
passwords
MFA codes

Tool-call logging must support auditability without becoming a data-exposure path.

Recommended future log shape:

MCP tool invoked: forgepilot_status
MCP tool completed: forgepilot_status PASS

The log should not include raw file contents, secrets, or unrestricted arguments.

Platform Safety Boundary

The MCP bridge must not be used to:

bypass ChatGPT safety systems
bypass platform rate limits
mass-extract ChatGPT outputs
automate prohibited activity
disguise destructive actions as read-only operations
perform hidden side effects
provide unrestricted remote control of a server
turn ChatGPT into a shell operator
turn ChatGPT into a database operator
turn ChatGPT into a Git operator
turn ChatGPT into a secret-discovery tool

ForgePilot MCP must remain a constrained project interface.

Forbidden Tool Shapes

The bridge must not expose tools shaped like:

shell_exec(command)
run_command(command)
opencode_do_anything(prompt)
execute_prompt(prompt)
read_any_file(path)
write_file(path, content)
git_exec(args)
git_push(...)
db_exec(sql)
sqlite_query(sql)
dump_env()
list_home_directory()
read_ssh_key(...)
read_secret(...)
install_package(...)
systemctl_control(...)
reverse_proxy_control(...)
auth0_mutate(...)

A future packet may define a narrow replacement for a forbidden general shape only if the replacement is constrained by ForgePilot workflow boundaries.

Future OpenCode Tool Boundary

A future OpenCode execution tool may be considered only if it is shaped like a ForgePilot workflow action.

Possible future shape:

forgepilot_start_opencode_run(packet_id, model_id, run_mode)

Such a tool must:

require a known packet id
require an allowed model id
require an allowed run mode
require a clean working tree unless an explicit future dirty-tree policy exists
write only to approved artifact paths
record a request artifact
record an executor result artifact
record verification output when verification is part of the run
record failure artifacts when execution fails
avoid direct evidence admission
avoid hidden Git mutation
avoid hidden SQLite mutation
avoid arbitrary prompt execution

OpenCode output must not be treated as admitted evidence merely because it exists.

Evidence Boundary

MCP output is not evidence by default.

MCP output may become evidence only when ForgePilot standards require and record:

artifact existence
provenance completeness
validation result
audit result when required
explicit admission state

Read-only connector success is an observation.

It is not evidence admission.

A successful external tool call must not silently become trusted observatory evidence.

Failure Boundary

Failures must not be silently converted into success.

Failure states should distinguish:

platform safety block
connector unavailable
bridge validation rejection
forbidden tool request
unsupported input
unauthorized path
execution disabled
OpenCode unavailable
artifact missing
validation failed
audit required
admission not evaluated

Absence of failure must not imply success.

Each gate should record explicit passage or explicit failure.

Acceptance Criteria
A compliance boundary document is added.
The document preserves the FP-MCP-001 generic-command-runner prohibition.
The document preserves the FP-MCP-002 read-only discovery boundary.
The document defines read-only tool rules.
The document defines write/execution-capable tool rules.
The document defines user approval requirements.
The document defines secret-handling rules.
The document defines safe logging rules.
The document defines forbidden tool shapes.
The document defines platform safety boundaries.
The document defines future OpenCode execution constraints.
No MCP tools are added.
No shell execution is added.
No OpenCode execution is added.
No write tools are added.
No Git mutation is added.
No SQLite mutation is added.
No bridge runtime behavior is changed unless separately approved by a future packet.
Verification Requirements

Run and record:

pnpm typecheck
pnpm test

Also verify that the current MCP bridge remains read-only and that these tools still work:

forgepilot_status
forgepilot_read_file
forgepilot_list_packets
forgepilot_list_runs
forgepilot_get_opencode_status

