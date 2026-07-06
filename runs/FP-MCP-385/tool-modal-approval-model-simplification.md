FP-MCP-385 — Tool Modal Approval Model Simplification

Result

DESIGN ONLY.

Purpose

Simplify the ForgePilot MCP human approval mechanism.

Manual approval markdown is not sustainable for normal sandboxed command execution.

The canonical human approval boundary for normal MCP execution should be the ChatGPT tool approval modal.

The human should not be required to manually author long approval records.

ForgePilot should generate evidence records automatically after approved execution.

Background

FP-MCP-382 created a non-executing request artifact for:

["/usr/bin/bwrap", "--version"]

FP-MCP-383 recorded a manual human approval artifact.

FP-MCP-384 executed the approved metadata-only bwrap invocation and recorded:

bwrap version: bubblewrap 0.8.0
bwrap binary invoked: true
bwrap sandbox started: false
sandbox command executed: false
approval consumed: true
FP-027 canary run: false

The FP-MCP-382 through FP-MCP-384 sequence was appropriate for the first intentional bwrap binary invocation because ForgePilot was crossing a new trust boundary.

However, this should not become the routine user experience.

Problem

The prior approval model required too much human-authored paperwork.

For normal sandboxed commands, requiring a long markdown approval artifact creates:

unnecessary friction
duplicated information
higher chance of copy/paste mistakes
slower iteration
worse ergonomics than existing AI-assisted development tools

The approval mechanism should behave more like Copilot, Codex, Claude Code, or similar tools:

the system proposes a bounded action
the tool approval modal shows the action
the human approves or denies
the system records the evidence automatically

Decision

For normal sandboxed command execution, the ChatGPT tool approval modal is the canonical human approval boundary.

A sandboxed command is approved if and only if the user approves the exact MCP tool call whose arguments identify the bounded request.

Manual approval markdown is deprecated for normal sandboxed commands.

Manual approval records remain acceptable for:

first-ever trust-boundary crossings
unusual high-risk operations
policy changes
canary execution class changes
incident review
post-hoc governance decisions

But they are not the default mechanism for normal sandboxed command execution.

Approval Model

The approval chain should become:

preview/request artifact
ChatGPT MCP tool call
tool approval modal
approved execution
automatic evidence record

The user approves the tool call.

ForgePilot records:

what was proposed
what was approved
what was executed
what output was produced
what safety boundaries held
what safety boundaries were not involved

Required Tool Call Shape

A sandbox execution tool call should expose compact, reviewable fields.

Recommended fields:

packetId
previewId
requestId
argv
argvHash
sandboxPolicyHash
expectedRepoCommit
workingDirectory
timeoutSeconds
networkEnabled
hostWritableMounts
hostHomeMounted
secretsMounted
realRepoMountedWritable
runnerStartAllowed
opencodeStartAllowed
fp027CanaryAllowed

The modal should make the meaningful risk properties visible.

The modal should not require the human to read or write long markdown.

Required Invariants

The tool must reject execution if:

preview artifact is missing
preview artifact is invalid
request artifact is missing
argv differs from artifact argv
argv hash differs from artifact hash
sandbox policy hash differs from artifact policy hash
expected repo commit differs from current repo commit
timeout exceeds allowed bound
network is enabled unexpectedly
host writable mounts are requested unexpectedly
host home is mounted unexpectedly
secrets are mounted unexpectedly
real repo is mounted writable unexpectedly
runner start is requested outside explicit scope
OpenCode start is requested outside explicit scope
FP-027 canary is requested outside explicit scope

The approval modal may approve the tool call, but the tool must still verify all invariants before execution.

Approval is necessary but not sufficient.

Bubblewrap Caveat

Bubblewrap reduces blast radius.

Bubblewrap shares the host kernel.

Bubblewrap does not provide VM-level isolation.

Therefore, tool-modal approval plus bubblewrap sandboxing is acceptable for bounded low-risk sandboxed commands, but it does not remove the need for:

mount policy checks
network policy checks
timeout checks
output bounds
artifact validation
provenance recording
automatic rejection conditions

Approval Classes

CLASS_0 — Design or request artifact only

No execution.

Approval modal usually not required.

CLASS_1 — Metadata binary invocation

Example:

/usr/bin/bwrap --version

First boundary crossing may require explicit manual record.

After boundary is established, use tool modal if repeated.

CLASS_2 — Minimal sandbox smoke test

Starts bubblewrap sandbox with a harmless fixed command.

Requires tool modal approval.

Manual approval markdown not required unless policy changes.

CLASS_3 — Bounded sandboxed command

Runs a command from a valid preview/request artifact.

Requires tool modal approval.

Manual approval markdown not required.

CLASS_4 — Canary / runner / OpenCode execution

Requires stronger tool modal payload and explicit scope.

Manual record may still be appropriate until the canary path is mature.

CLASS_5 — Dangerous or policy-violating request

Examples:

network enabled
host home mounted
secrets mounted
real repo mounted writable
privileged flags
runner start without explicit canary scope
OpenCode start without explicit canary scope
FP-027 canary without explicit canary scope

Default action:

reject or require separate governance packet

Human Approval Token

If a compact text approval is ever needed, it should be short and reference the artifact.

Examples:

APPROVE-ONCE <requestId>
APPROVE preview <previewId> for one sandbox run
APPROVE tool call shown in modal

The long evidence record should be generated by ForgePilot.

The human should not manually author the evidence.

Evidence Responsibility

Human responsibility:

approve or deny the bounded tool call

ForgePilot responsibility:

validate artifacts
validate hashes
enforce policy
execute only if approved and valid
capture bounded output
record evidence
record safety boundary states
record failures and mismatches
preserve provenance

Automatic Evidence Record

After an approved tool execution, ForgePilot should automatically record:

packet id
request id
preview id
tool name
tool call arguments
approval modal accepted: true
argv
argv hash
sandbox policy hash
repo commit before execution
repo commit after execution
working directory
timeout
exit code
stdout excerpt
stderr excerpt
truncation state
network policy
mount policy
approval consumed
runner start contacted
OpenCode started
FP-027 canary run
safety invariant results
final classification

UX Rule

The human approval action should be one click in the tool modal, not a manually maintained markdown page.

The system may produce markdown evidence after the fact.

Security Rule

Do not move safety into the user’s memory.

The tool must enforce safety mechanically.

The approval modal confirms intent.

The tool validator confirms admissibility.

The execution record confirms what happened.

Change To Previous Roadmap

Previous roadmap:

FP-MCP-385 — Minimal bwrap sandbox smoke-test design

Revised roadmap:

FP-MCP-385 — Tool modal approval model simplification
FP-MCP-386 — Minimal bwrap sandbox smoke-test tool design
FP-MCP-387 — Tool-modal approved minimal bwrap smoke test

Non-Execution Boundary

No bwrap invocation occurred.

No bwrap --version command was run.

No bubblewrap sandbox was started.

No sandboxed command was executed.

No shell execution occurred.

No runner start endpoint was contacted.

No OpenCode start occurred.

No approval was consumed.

No disable switch was cleared.

No FP-027 canary run occurred.

Classification

FP-MCP-385_TOOL_MODAL_APPROVAL_MODEL_SIMPLIFICATION_DESIGN

Recommended Next Packet

FP-MCP-386 — Minimal bwrap sandbox smoke-test tool design

Goal:

Design the MCP tool behavior for a minimal bubblewrap sandbox smoke test approved through the ChatGPT tool modal.

The tool should:

expose compact modal fields
require tool-modal approval
invoke bwrap only after approval
start the smallest possible sandbox
execute only a harmless fixed command
avoid shell
avoid network
avoid writable host mounts
avoid real repo writable mount
avoid OpenCode
avoid FP-027
automatically record evidence

The next packet should still be design-only unless explicitly scoped otherwise.
