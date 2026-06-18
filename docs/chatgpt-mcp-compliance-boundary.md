
ChatGPT MCP Compliance Boundary
Status

Documentation only.

This document defines the compliance and safety boundary for ForgePilot MCP tools exposed to ChatGPT.

It does not implement tools.

It does not add shell execution.

It does not add OpenCode execution.

It does not add write access.

It does not mutate files, Git, SQLite, or bridge behavior.

Purpose

ForgePilot MCP exists to expose constrained ForgePilot workflow actions to ChatGPT.

It must not become:

a shell
a server administration interface
a secret discovery path
an arbitrary filesystem reader
an arbitrary filesystem writer
a Git operator
a SQLite operator
an OpenCode prompt runner
a platform-safety bypass mechanism
Core Rule

ChatGPT may call named ForgePilot workflow tools.

ChatGPT must not receive generic execution authority.

Good shape:

forgepilot_get_opencode_status()

Possible future shape:

forgepilot_start_opencode_run(packet_id, model_id, run_mode)

Forbidden shape:

run_command(command)

Forbidden shape:

opencode_do_anything(prompt)

Forbidden shape:

db_exec(sql)
Read-Only Tools

Read-only tools must be side-effect-free.

They must not:

execute shell commands
start OpenCode
mutate files
mutate Git
mutate SQLite
expose secrets
expose environment variables
inspect arbitrary process state
read arbitrary filesystem paths
perform hidden writes

They may read approved ForgePilot repository paths only when explicitly allowed.

Approved roots:

packets/
runs/
docs/
metrics/
Write and Execution Tools

Write or execution-capable tools require a future packet before implementation.

They must:

be named ForgePilot workflow actions
use narrow structured inputs
reject arbitrary prompts
reject arbitrary commands
reject arbitrary paths
reject arbitrary SQL
require explicit user approval
record durable artifacts
record failure observations
clearly disclose side effects
fail closed when checks are incomplete

Execution-capable tools must not be represented as read-only.

User Approval

Any tool that can mutate state or trigger execution must require explicit user approval.

Approval must identify:

tool name
intended action
packet id, when applicable
model id, when applicable
run mode, when applicable
expected artifact directory
whether files may change
whether Git may change
whether SQLite may change
whether OpenCode may run

Approval must never be for arbitrary command execution.

Secret Handling

MCP tools must not expose:

OAuth secrets
Auth0 secrets
OpenCode secrets
provider API keys
environment variables
session tokens
refresh tokens
SSH private keys
.env contents
credentials
MFA codes
passwords

Errors must be sanitized.

Safe Logging

Allowed logs:

timestamp
tool name
success/failure
sanitized error code
duration
session initialized

Forbidden logs:

full prompts
full conversations
OAuth tokens
API keys
environment variables
file contents
secret-bearing config
passwords
MFA codes
private keys

Logging must support auditability without exposing sensitive data.

OpenCode Boundary

Future OpenCode tools must be constrained ForgePilot workflow actions.

They must not accept arbitrary prompts.

They must not accept arbitrary commands.

They must not write outside approved artifact paths.

They must not silently mutate Git.

They must not silently mutate SQLite.

They must not admit evidence directly.

OpenCode output is not evidence by default.

Evidence Boundary

MCP output is an observation.

MCP output is not admitted evidence unless ForgePilot explicitly records validation, audit, provenance, and admission state according to existing standards.

Failure Boundary

Failures must be explicit.

Possible failure classes:

platform safety block
connector unavailable
bridge validation rejection
forbidden tool request
unauthorized path
execution disabled
OpenCode unavailable
artifact missing
validation failed
audit required
admission not evaluated

Absence of failure must not imply success.

Forbidden Capabilities

The bridge must not expose:

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

