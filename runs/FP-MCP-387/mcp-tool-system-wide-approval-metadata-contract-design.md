FP-MCP-387 — MCP Tool System-wide Approval Metadata Contract Design

Result

DESIGN ONLY.

Purpose

Design a bridge-level metadata contract so every ForgePilot MCP tool explicitly declares its system-wide approval behavior.

The goal is to make system-wide tool approval mechanical rather than informal.

FP-MCP-386 established the system-wide approval contract:

ChatGPT tool approval modal = canonical human approval boundary
tool implementation = mechanical invariant enforcement
ForgePilot = automatic evidence recording
manual approval markdown = not normal workflow

FP-MCP-387 defines the MCP tool metadata needed to implement that contract.

Core Decision

Every ForgePilot MCP tool must declare system-wide approval metadata.

Approval behavior must not be inferred from naming, convention, or documentation alone.

The MCP bridge must be able to answer, for each tool:

Is it read-only?
Can it write state?
Can it mutate git?
Can it invoke binaries?
Can it start bwrap?
Can it start runner?
Can it start OpenCode?
Can it run canary?
Does it require tool modal approval?
Does it require evidence output?
Is it safe to expose to ChatGPT-safe mode?

Scope

This packet designs the metadata contract only.

It does not implement bridge code.

It does not expose new tools.

It does not change tool visibility.

It does not create packet lifecycle tools.

It does not invoke bwrap.

It does not start a sandbox.

It does not execute commands.

It does not commit through MCP.

It does not push through MCP.

It does not start runner.

It does not start OpenCode.

It does not run FP-027.

Required Tool Metadata

Each ForgePilot MCP tool must declare:

toolName
toolClass
sideEffectClass
approvalRequirement
evidenceRequirement
visibilityClass
riskClass
modalReviewFields
invariantChecks
rejectionConditions

These fields are bridge contract metadata.

They are not only documentation.

They must be available for contract validation tests.

Tool Classes

Each tool must declare exactly one primary tool class.

READ_ONLY

The tool only reads bounded state.

It must not:

write files
mutate git
invoke external commands
start bwrap
start runner
start OpenCode
run canary
consume approval
clear disable switch

Approval requirement:

approvalRequirement: NONE

Evidence requirement:

evidenceRequirement: OPTIONAL

STATE_CHANGING

The tool writes bounded state but does not execute external binaries.

Examples:

create packet file
create run record
create request artifact
update packet metadata
write evidence record

Approval requirement:

approvalRequirement: TOOL_MODAL_REQUIRED

Evidence requirement:

evidenceRequirement: REQUIRED

REPO_MUTATING

The tool changes git state.

Examples:

scoped git add
scoped git commit
scoped git push
branch creation
tag creation

Approval requirement:

approvalRequirement: TOOL_MODAL_REQUIRED

Evidence requirement:

evidenceRequirement: REQUIRED

EXECUTION_CAPABLE

The tool invokes binaries, runs commands, starts sandbox, contacts runner, starts OpenCode, or runs canary.

Examples:

bwrap version invocation
bwrap smoke test
sandboxed command execution
runner start
OpenCode start
canary execution

Approval requirement:

approvalRequirement: TOOL_MODAL_REQUIRED

Evidence requirement:

evidenceRequirement: REQUIRED

POLICY_CHANGING

The tool changes approval policy, execution policy, tool visibility, or safety policy.

Examples:

expose writer to ChatGPT-safe
change command allowlist
change sandbox policy
clear disable switch
change runner capability flags

Approval requirement:

approvalRequirement: TOOL_MODAL_REQUIRED_ESCALATED

Evidence requirement:

evidenceRequirement: REQUIRED

ESCALATED

The tool or request crosses a higher-risk boundary.

Examples:

network enabled
host home mounted
secrets mounted
real repo mounted writable
Docker socket mounted
privileged flags
runner start
OpenCode start
canary execution
long timeout
unbounded output

Approval requirement:

approvalRequirement: TOOL_MODAL_REQUIRED_ESCALATED

Evidence requirement:

evidenceRequirement: REQUIRED

Side Effect Classes

Every tool must declare one or more side effect classes.

Allowed side effect classes:

READ_REPO
READ_RUNTIME
READ_REQUEST_ARTIFACT
READ_PREVIEW_ARTIFACT
WRITE_PACKET
WRITE_RUN_RECORD
WRITE_REQUEST_ARTIFACT
WRITE_PREVIEW_ARTIFACT
WRITE_EVIDENCE_RECORD
GIT_ADD_SCOPED
GIT_COMMIT_SCOPED
GIT_PUSH_CURRENT_BRANCH
INVOKE_BINARY
START_BWRAP
EXECUTE_SANDBOX_COMMAND
CONTACT_RUNNER_START
START_OPENCODE
RUN_CANARY
CHANGE_POLICY
CHANGE_TOOL_VISIBILITY
CLEAR_DISABLE_SWITCH

The bridge must reject unknown side effect classes.

Approval Requirement Values

Allowed approval requirements:

NONE

Used only for READ_ONLY tools.

TOOL_MODAL_REQUIRED

Used for normal state-changing, repo-mutating, or execution-capable tools.

TOOL_MODAL_REQUIRED_ESCALATED

Used for tools or requests that cross higher-risk boundaries.

NOT_EXPOSABLE

Used for tools that must not be exposed to ChatGPT-safe mode.

Examples:

secret dumping
arbitrary shell
arbitrary filesystem write
arbitrary git command
unbounded command execution

Evidence Requirement Values

Allowed evidence requirements:

OPTIONAL

Used for bounded read-only tools.

REQUIRED

Used for state-changing, repo-mutating, execution-capable, policy-changing, or escalated tools.

REQUIRED_ON_FAILURE

Allowed only for tools that normally perform validation without mutation but may detect violations.

Visibility Classes

Allowed visibility classes:

CHATGPT_SAFE

May be exposed to ChatGPT if metadata and implementation pass contract validation.

DEV_ONLY

May exist for local bridge development but must not be visible to ChatGPT-safe mode.

INTERNAL_ONLY

Used by bridge internals.

NOT_EXPOSABLE

Must never be exposed.

Modal Review Fields

For every tool requiring approval, metadata must declare which fields must be visible in the tool approval modal.

Required field categories:

Identity

toolName
toolClass
packetId
action

Artifact Binding

requestId
previewId
artifactPath
artifactHash

Repository Binding

repo
branch
expectedCommit
workingTreeRequirement
targetPaths

Execution Binding

argv
argvHash
workingDirectory
timeoutSeconds
stdoutByteLimit
stderrByteLimit

Sandbox Binding

sandboxPolicyHash
networkEnabled
hostWritableMounts
hostHomeMounted
secretsMounted
realRepoMountedWritable
dockerSocketMounted

High-risk Binding

runnerStartAllowed
opencodeStartAllowed
fp027CanaryAllowed
disableSwitchClearingAllowed
approvalConsumesState

The bridge contract should require fields only when applicable.

But a tool must not hide meaningful risk behind opaque fields.

Invariant Checks

Every approval-required tool must declare invariant checks.

Examples:

packet id matches expected pattern
request id matches expected pattern
preview id matches expected pattern
target paths are under allowed roots
target paths do not use traversal
target paths are not absolute unless explicitly allowed
artifact exists
artifact validates
artifact hash matches
argv hash matches
sandbox policy hash matches
expected commit matches
expected branch matches
working tree state matches requirement
timeout within bound
output bounds within limits
network policy accepted
mount policy accepted
runner start scope accepted
OpenCode start scope accepted
canary scope accepted
disable switch scope accepted

Rejection Conditions

The bridge must reject a tool call if:

tool metadata is missing
tool class is missing
side effect class is missing
approval requirement is missing
evidence requirement is missing
visibility class is missing
metadata class conflicts with implementation behavior
ChatGPT-safe tool requires approval but modal-visible fields are insufficient
ChatGPT-safe tool has NOT_EXPOSABLE side effects
READ_ONLY tool writes state
READ_ONLY tool invokes external commands
READ_ONLY tool consumes approval
STATE_CHANGING tool lacks approval requirement
REPO_MUTATING tool lacks scoped path/git restrictions
EXECUTION_CAPABLE tool lacks approval requirement
POLICY_CHANGING tool lacks escalated approval requirement
ESCALATED tool lacks escalated approval requirement
evidence-required tool lacks evidence output plan

Contract Validation Tests

The bridge must include tests that assert:

every registered tool has metadata
every metadata record has valid enum values
every ChatGPT-safe tool has allowed visibility class
every ChatGPT-safe write/execute/policy tool requires modal approval
every READ_ONLY tool has no write/execute side effect classes
every execution-capable tool declares evidence required
every repo-mutating tool declares scoped git behavior
every policy-changing tool declares escalated approval
no NOT_EXPOSABLE tool is ChatGPT-safe visible
no DEV_ONLY tool is ChatGPT-safe visible
writer tools are not accidentally exposed unless intentionally approved
tool count and visibility summaries are emitted in tests

Migration Requirements For Existing Tools

Existing tools must be migrated into this metadata model.

Known current ChatGPT-safe read-only tools should classify as READ_ONLY.

Examples:

forgepilot_status
forgepilot_get_mcp_runtime_diagnostics
forgepilot_get_opencode_status
forgepilot_get_opencode_capabilities
forgepilot_list_packets
forgepilot_read_file
forgepilot_list_opencode_run_requests
forgepilot_read_opencode_run_request
forgepilot_read_sandboxed_command_preview

Known dev-only or writer tools must be explicitly classified as DEV_ONLY or approval-required state-changing tools.

Example:

forgepilot_create_sandboxed_command_preview

Expected classification:

toolClass: STATE_CHANGING
sideEffectClass: WRITE_PREVIEW_ARTIFACT
approvalRequirement: TOOL_MODAL_REQUIRED if exposed
evidenceRequirement: REQUIRED
visibilityClass: DEV_ONLY until intentionally exposed

Relationship To Packet Lifecycle Tools

Packet lifecycle MCP tools must not be designed or implemented before this metadata contract exists in the bridge.

Packet lifecycle tools will be STATE_CHANGING or REPO_MUTATING.

Therefore they must be built on top of this system-wide approval metadata contract.

Expected future tools:

forgepilot_create_packet
forgepilot_write_run_record
forgepilot_commit_scoped_changes
forgepilot_push_current_branch

These tools must expose modal-visible scope and must record evidence automatically.

Relationship To bwrap

bwrap-backed tools must also follow this metadata contract.

A bwrap tool is EXECUTION_CAPABLE.

If it starts a sandbox, it must declare:

START_BWRAP
EXECUTE_SANDBOX_COMMAND if applicable
sandbox policy fields
network policy fields
mount policy fields
output bounds
evidence requirement

bwrap reduces blast radius.

bwrap shares the host kernel.

bwrap does not provide VM-level isolation.

Non-Execution Boundary

No bridge implementation occurred.

No tool visibility changed.

No bwrap invocation occurred.

No bubblewrap sandbox was started.

No sandboxed command was executed.

No shell execution occurred.

No runner start endpoint was contacted.

No OpenCode start occurred.

No repository mutation was performed by MCP.

No approval was consumed.

No disable switch was cleared.

No FP-027 canary run occurred.

Classification

FP-MCP-387_MCP_TOOL_SYSTEM_WIDE_APPROVAL_METADATA_CONTRACT_DESIGN

Recommended Next Packet

FP-MCP-388 — Implement MCP tool approval metadata contract

Goal:

Implement bridge-level tool metadata for system-wide approval classification.

The implementation should:

add metadata schema/types
annotate existing tools
enforce visibility rules
test metadata completeness
test ChatGPT-safe exposure rules
emit tool count/visibility summaries
preserve current read-only behavior
avoid exposing new write tools by accident
