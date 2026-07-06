FP-MCP-381 — Bubblewrap Binary Invocation Approval Design

Result

DESIGN ONLY.

Purpose

Define the approval and evidence requirements for the first intentional invocation of the bwrap binary.

FP-MCP-380 observed that a bubblewrap binary appears to exist at:

/usr/bin/bwrap

But FP-MCP-380 did not invoke bubblewrap.

FP-MCP-381 defines what must be true before ForgePilot intentionally invokes bwrap for the first time.

Scope

This packet is design-only.

It does not invoke bwrap.

It does not run bwrap --version.

It does not run a bubblewrap smoke test.

It does not execute commands.

It does not invoke shell.

It does not contact runner start.

It does not start OpenCode.

It does not consume approval.

It does not clear disable switches.

It does not run FP-027.

It does not create an execution request.

It does not authorize canary execution.

Background

The sandbox-preview sequence has established:

1. A non-executing sandbox preview artifact schema.
2. A dev-only preview writer.
3. A public/read-only preview reader.
4. Positive validation of the canonical FP-MCP-373 preview artifact.
5. Negative-path reader validation.
6. Malformed-content fixture validation.
7. Read-only host observation that /usr/bin/bwrap is discoverable.

The remaining gap:

The first intentional bwrap invocation has not occurred.

Even a command such as:

bwrap --version

is a binary invocation and must be explicitly scoped.

Principle

The first bwrap invocation must be treated as an execution-adjacent event.

It must not happen as a side effect of diagnostics.

It must not happen from ChatGPT-safe public Actions.

It must not happen without explicit human approval.

It must not imply approval for sandboxed command execution.

It must not imply approval for FP-027 canary execution.

Invocation Classes

Class A — Binary metadata invocation

Example:

bwrap --version

Purpose:

observe installed bubblewrap version

Risk level:

low but nonzero

Classification:

BWRAP_BINARY_INVOKED
SANDBOX_NOT_STARTED

Approval required:

yes

Reason:

it invokes the bwrap binary

Class B — Minimal sandbox startup

Example:

bwrap <minimal policy> -- true

Purpose:

prove bubblewrap can start a minimal sandbox

Risk level:

execution-adjacent

Classification:

BWRAP_SANDBOX_STARTED
SANDBOX_COMMAND_EXECUTED

Approval required:

yes

Reason:

it starts a sandbox and runs a command inside it

Class C — Workspace sandbox startup

Example:

copied workspace mounted at /workspace
run pwd inside sandbox

Purpose:

prove copied workspace policy can support future canary execution

Risk level:

execution-adjacent / pre-canary

Classification:

BWRAP_WORKSPACE_SANDBOX_STARTED
SANDBOX_COMMAND_EXECUTED

Approval required:

yes

Reason:

it executes a command in a sandbox using ForgePilot workspace policy

Class D — Canary execution

Example:

FP-027 canary or equivalent guarded canary

Purpose:

validate full runner/canary path

Risk level:

canary execution

Classification:

CANARY_EXECUTION

Approval required:

yes, separate from Classes A-C

Reason:

canary execution is not authorized by bwrap smoke-test approval

Required Approval Binding For First bwrap Invocation

Any first bwrap invocation approval must bind:

approvalPacketId
approvalId
packetId
invocationClass
exact argv
argv hash
expected bwrap path
expected working directory
expected user/service context
expected host
expected stdout/stderr bounds
expected timeout
expected no runner start unless explicitly scoped
expected no OpenCode start
expected no FP-027 canary run
single-use state
expiry

The approval must explicitly say whether it allows:

bwrap binary invocation
bwrap sandbox startup
sandbox command execution
runner start contact
OpenCode start
approval consumption
disable switch clearing
FP-027 canary

For the first packet after FP-MCP-381, recommended allowed values are:

bwrap binary invocation: true
bwrap sandbox startup: false
sandbox command execution: false
runner start contact: false
OpenCode start: false
approval consumption: true only for the approval itself
disable switch clearing: false
FP-027 canary: false

Recommended First Invocation

The recommended first bwrap invocation should be metadata-only:

/usr/bin/bwrap --version

Rationale:

It confirms the binary can be invoked.
It does not request namespace creation.
It does not start a sandbox.
It does not run a sandbox command.
It produces bounded output.

Important:

This still invokes bwrap and therefore requires explicit approval.

Required Evidence For First bwrap Invocation

The result record must include:

packet id
approval packet id
approval id
exact argv
argv SHA-256
bwrap path
working directory
user/service context
start timestamp
end timestamp
exit code
stdout excerpt
stderr excerpt
stdout truncated: true | false
stderr truncated: true | false
timeout occurred: true | false
runner start contacted: true | false
OpenCode started: true | false
disable switch cleared: true | false
FP-027 canary run: true | false

The result record must not include:

secrets
OAuth tokens
private keys
raw environment dumps
hidden/system prompt content

Required Failure States

BWRAP_BINARY_NOT_FOUND_AT_APPROVED_PATH

Meaning:

approval expected /usr/bin/bwrap but it was not found there

Action:

do not substitute another path without new approval

BWRAP_ARGV_MISMATCH

Meaning:

actual argv did not exactly match approved argv

Action:

do not invoke bwrap

BWRAP_ARGV_HASH_MISMATCH

Meaning:

actual argv hash did not match approval-bound hash

Action:

do not invoke bwrap

BWRAP_APPROVAL_EXPIRED

Meaning:

approval expired before invocation

Action:

do not invoke bwrap

BWRAP_APPROVAL_ALREADY_CONSUMED

Meaning:

approval was already used

Action:

do not invoke bwrap

BWRAP_INVOCATION_FAILED

Meaning:

approved bwrap invocation ran but exited nonzero

Action:

record bounded failure output
do not proceed to sandbox smoke test

BWRAP_OUTPUT_TRUNCATED

Meaning:

output exceeded allowed bound

Action:

record truncation state
do not treat output as complete

Required Separation From Canary

Approval for the first bwrap binary invocation must not authorize:

minimal sandbox startup
workspace sandbox startup
runner start
OpenCode start
FP-027 canary
canary result admission

The first bwrap invocation is a prerequisite observation only.

It is not canary execution.

It is not evidence admission.

Recommended Next Packet

FP-MCP-382 — Bubblewrap version invocation request artifact

Scope:

create a non-executing request/approval target artifact for `/usr/bin/bwrap --version`

The packet should record:

exact argv
argv hash
expected path
expected no sandbox startup
expected no runner start
expected no OpenCode
expected no FP-027
required human approval before invocation

It should not invoke bwrap.

Later Packet Sequence

FP-MCP-383 — Human approval for bwrap version invocation

Record explicit human approval.

FP-MCP-384 — Approved bwrap version invocation

Invoke /usr/bin/bwrap --version exactly once under approval.

FP-MCP-385 — Minimal bwrap sandbox smoke-test design

Design the first sandbox-starting test.

FP-MCP-386 — Human approval for minimal bwrap smoke test

Record explicit human approval.

FP-MCP-387 — Approved minimal bwrap smoke test

Run the smallest approved bwrap sandbox test.

Only after those should ForgePilot proceed toward canary planning.

Non-Execution Boundary

No bwrap invocation occurred.

No bwrap --version command was run.

No bubblewrap smoke test was run.

No sandboxed command was executed.

No shell execution occurred.

No runner start endpoint was contacted.

No OpenCode start occurred.

No approval was consumed.

No disable switch was cleared.

No FP-027 canary run occurred.

Classification

FP-MCP-381_DESIGN_ONLY_BWRAP_BINARY_INVOCATION_APPROVAL
