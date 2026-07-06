FP-MCP-385A — System-wide Tool Modal Approval Addendum

Result

DESIGN ADDENDUM.

Purpose

Clarify that ChatGPT tool approval modal approval is the canonical human approval boundary system-wide for ForgePilot MCP.

This applies to all ForgePilot MCP state-changing or execution-capable tools, not only sandboxed command execution.

Background

FP-MCP-385 simplified the approval model for normal sandboxed command execution.

It established:

manual approval markdown is not sustainable
the ChatGPT tool approval modal should be the normal human approval boundary
ForgePilot should generate evidence automatically after approved execution

The human operator clarified that this model should apply system-wide.

Operator correction:

Approval through the tool approval modal should be system-wide.

FP-MCP-385A records that correction.

Decision

For ForgePilot MCP, human approval is the ChatGPT tool approval modal.

Manual approval markdown is not the normal approval mechanism.

The tool approval modal is canonical for all state-changing or execution-capable MCP tools.

This includes:

sandboxed command execution
bwrap binary invocation
bwrap sandbox smoke tests
request artifact creation when state-changing
preview artifact creation when state-changing
runner start actions
OpenCode start actions
canary execution
approval-consuming actions
disable-switch-clearing actions
write actions
repository mutation actions
evidence-admission actions if exposed through MCP
policy-changing actions if exposed through MCP

System-wide Approval Chain

The system-wide approval chain is:

MCP tool schema defines the allowed action shape
MCP tool call proposes a concrete action
ChatGPT tool approval modal shows the concrete action
human approves or denies the tool call
tool implementation verifies invariants mechanically
tool executes only if approved and valid
ForgePilot records evidence automatically

Key Rule

A ForgePilot MCP action is human-approved if and only if the user approves the concrete ChatGPT tool call for that action.

The approval must bind to the tool call arguments shown in the approval modal.

The tool implementation must reject the action if the approved arguments do not match required artifacts, hashes, policy constraints, or runtime preconditions.

Approval is necessary but not sufficient.

Tool-side validation remains mandatory.

Manual Approval Markdown

Manual approval markdown is deprecated for normal ForgePilot MCP operation.

Manual approval records may still be used for:

architecture decisions
governance decisions
first-ever trust-boundary crossings
incident review
retrospective audit notes
non-MCP historical records
human-readable explanations of why a tool was allowed

But manual approval markdown must not be required for normal tool approval.

Evidence Responsibility

The human is responsible for:

reviewing the tool approval modal
approving or denying the concrete tool call

ForgePilot is responsible for:

validating tool arguments
enforcing policy
checking request/preview artifacts
checking hashes
checking expected commits
checking mount/network/timeout policy
checking execution class
rejecting mismatches
recording execution evidence
recording approval modal acceptance
recording safety boundary states
recording failures and non-execution results

The human should not manually write long evidence records.

Required Tool Classes

Every ForgePilot MCP tool should be classified as one of:

READ_ONLY

Does not mutate state.

Does not execute external commands.

Does not start runner.

Does not start OpenCode.

Does not consume approval.

Usually no approval modal required.

STATE_CHANGING

Writes files, creates artifacts, updates state, or records evidence.

Requires tool approval modal unless explicitly classified as safe internal persistence.

EXECUTION_CAPABLE

Can invoke binaries, run commands, start sandbox, contact runner, start OpenCode, or run canary.

Requires tool approval modal.

POLICY_CHANGING

Changes approval policy, execution policy, safety policy, or tool visibility.

Requires tool approval modal and may require additional governance evidence.

DANGEROUS_OR_ESCALATED

Requests network, host writable mounts, secrets, host home mount, privileged behavior, real repo writable mount, runner start, OpenCode start, or canary execution outside expected scope.

Must reject by default or require a specifically scoped tool modal approval.

Modal Payload Requirements

For any state-changing or execution-capable tool, the modal payload should expose enough information for a competent operator to review the action.

Recommended fields, depending on tool class:

tool name
packet id
request id
preview id
action class
execution class
argv
argv hash
sandbox policy hash
expected repo commit
working directory
timeout seconds
network enabled
host writable mounts
host home mounted
secrets mounted
real repo mounted writable
runner start allowed
OpenCode start allowed
FP-027 canary allowed
output bounds
evidence output path

The modal payload should be compact.

The system-generated evidence record may be detailed.

Automatic Rejection Conditions

Tool approval modal acceptance must not bypass mechanical safety checks.

The tool must reject if:

tool arguments are malformed
request artifact is missing
preview artifact is missing
artifact validation fails
argv hash mismatch occurs
policy hash mismatch occurs
expected commit mismatch occurs
timeout exceeds limit
network is enabled unexpectedly
host writable mounts are requested unexpectedly
host home mount is requested unexpectedly
secrets mount is requested unexpectedly
real repo writable mount is requested unexpectedly
runner start is requested outside explicit modal scope
OpenCode start is requested outside explicit modal scope
FP-027 canary is requested outside explicit modal scope
approval-consuming action is not visible in the modal
disable switch clearing is requested outside explicit modal scope

Bubblewrap Caveat

Bubblewrap remains a containment layer, not a complete security boundary.

Bubblewrap reduces blast radius.

Bubblewrap shares the host kernel.

Bubblewrap does not provide VM-level isolation.

Therefore, system-wide modal approval does not remove the need for:

tool schemas
policy validation
mount restrictions
network restrictions
timeout restrictions
output bounds
artifact hashes
provenance records
automatic rejection conditions

UX Rule

The user approval experience should be:

inspect tool approval modal
approve or deny

It should not be:

manually author approval markdown
manually copy hashes into approval pages
manually duplicate request artifacts
manually maintain approval state

Audit Rule

ForgePilot should still produce detailed evidence after approved actions.

The difference is:

approval is captured by the tool modal
evidence is generated by the system

not:

approval is manually written by the human
evidence is hand-assembled before execution

Effect On Roadmap

FP-MCP-385 established modal approval for sandboxed commands.

FP-MCP-385A upgrades that rule to system-wide ForgePilot MCP approval.

Revised roadmap:

FP-MCP-385A — System-wide tool modal approval addendum
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

FP-MCP-385A_SYSTEM_WIDE_TOOL_MODAL_APPROVAL_ADDENDUM

Recommended Next Packet

FP-MCP-386 — Minimal bwrap sandbox smoke-test tool design

Goal:

Design the MCP tool behavior for a minimal bubblewrap sandbox smoke test approved through the ChatGPT tool approval modal.

The design should follow the system-wide approval rule:

tool approval modal is human approval
tool implementation enforces invariants
ForgePilot records evidence automatically
