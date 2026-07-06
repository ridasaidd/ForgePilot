FP-MCP-386 — System-wide Tool Modal Approval Contract

Result

DESIGN CONTRACT.

Purpose

Define the concrete system-wide approval contract for ForgePilot MCP tools.

FP-MCP-385 established that manual approval markdown is not sustainable for normal sandboxed command execution.

FP-MCP-385A clarified that ChatGPT tool approval modal approval is system-wide for ForgePilot MCP state-changing or execution-capable tools.

FP-MCP-386 turns that principle into a concrete contract that future MCP tools must follow.

Core Decision

For ForgePilot MCP, the ChatGPT tool approval modal is the canonical human approval boundary for all state-changing or execution-capable tools.

The human approves the tool call.

The tool implementation enforces invariants.

ForgePilot records evidence automatically.

Manual approval markdown is deprecated for normal ForgePilot MCP operation.

Scope

This contract applies to all ForgePilot MCP tools that can:

write files
create artifacts
modify packet state
commit repository changes
push repository changes
invoke binaries
run commands
start bubblewrap
start runner
start OpenCode
run canaries
consume approval
clear disable switches
change policy
expose tools to ChatGPT-safe mode

Non-Scope

This packet does not implement tools.

This packet does not invoke bwrap.

This packet does not start a sandbox.

This packet does not execute commands.

This packet does not contact runner start.

This packet does not start OpenCode.

This packet does not commit changes through MCP.

This packet does not push changes through MCP.

This packet does not run FP-027.

Tool Classifications

Every ForgePilot MCP tool must declare exactly one primary class.

READ_ONLY

A READ_ONLY tool may inspect bounded state.

A READ_ONLY tool must not:

write files
mutate repository state
invoke external commands
start bwrap
start runner
start OpenCode
consume approval
clear disable switches
run canary

Approval modal normally not required.

Examples:

list packets
read packet
read run record
read repository status
read runtime diagnostics

STATE_CHANGING

A STATE_CHANGING tool writes bounded state but does not execute external commands.

Approval modal required unless the tool is explicitly internal-only and not exposed to ChatGPT-safe mode.

Examples:

create packet file
create run record
write request artifact
update packet metadata

REPO_MUTATING

A REPO_MUTATING tool changes git state.

Approval modal required.

Examples:

scoped git add
scoped git commit
scoped git push
branch creation
tag creation

EXECUTION_CAPABLE

An EXECUTION_CAPABLE tool invokes binaries, runs commands, starts bwrap, contacts runner, starts OpenCode, or runs canaries.

Approval modal required.

Examples:

bwrap version invocation
bwrap smoke test
sandboxed command execution
runner start
OpenCode start
FP-027 canary execution

POLICY_CHANGING

A POLICY_CHANGING tool changes approval policy, execution policy, tool visibility, or safety policy.

Approval modal required.

Examples:

expose writer to ChatGPT-safe
change command allowlist
change sandbox policy
clear disable switch
change runner capability flags

ESCALATED

An ESCALATED tool or request involves higher-risk properties.

Examples:

network enabled
host home mounted
secrets mounted
real repository mounted writable
privileged flags
Docker socket mounted
runner start
OpenCode start
canary execution
long timeout
unbounded output

Default action:

reject unless explicitly scoped by tool schema and visible modal fields.

Modal-visible Arguments

For any STATE_CHANGING, REPO_MUTATING, EXECUTION_CAPABLE, POLICY_CHANGING, or ESCALATED tool, the tool call arguments must expose enough information for the user to review the action in the modal.

The following fields should be present when applicable:

toolClass
packetId
requestId
previewId
action
targetPaths
expectedRepo
expectedBranch
expectedCommit
commitMessage
pushRemote
pushBranch
argv
argvHash
sandboxPolicyHash
workingDirectory
timeoutSeconds
stdoutByteLimit
stderrByteLimit
networkEnabled
hostWritableMounts
hostHomeMounted
secretsMounted
realRepoMountedWritable
dockerSocketMounted
runnerStartAllowed
opencodeStartAllowed
fp027CanaryAllowed
approvalConsumesState
evidenceOutputPath

The modal-visible arguments must not hide meaningful risk behind opaque labels.

Tool-side Validation

Tool approval modal acceptance is necessary but not sufficient.

After the user approves the modal, the tool must still validate:

packet id shape
request id shape
preview id shape
allowed path scope
artifact existence
artifact validation state
argv hash
sandbox policy hash
expected commit
expected branch
timeout bounds
output bounds
mount policy
network policy
execution class
tool visibility
approval-consuming behavior
disable-switch behavior
canary scope

If validation fails, the tool must not execute the requested action.

It must record or return a bounded non-execution result.

Required Rejection Conditions

A tool must reject if:

user did not approve the tool modal
tool arguments are malformed
packet id is invalid
target path escapes allowed roots
target path uses traversal
target path is absolute when relative is required
target artifact is missing
artifact validation fails
argv differs from request artifact
argv hash differs from request artifact
sandbox policy hash differs from request artifact
expected repo commit does not match current commit
current working tree cleanliness requirement is violated
requested timeout exceeds tool class limit
output bounds are missing or excessive
network is enabled outside explicit scope
host writable mounts are requested outside explicit scope
host home mount is requested outside explicit scope
secrets mount is requested
Docker socket mount is requested
real repository writable mount is requested outside explicit scope
runner start is requested outside explicit scope
OpenCode start is requested outside explicit scope
FP-027 canary is requested outside explicit scope
disable switch clearing is requested outside explicit scope
tool visibility change is requested outside explicit scope

Evidence Requirements

For every approved STATE_CHANGING, REPO_MUTATING, EXECUTION_CAPABLE, POLICY_CHANGING, or ESCALATED tool call, ForgePilot should automatically record evidence.

The evidence record should include:

tool name
tool class
packet id
request id if applicable
preview id if applicable
modal approval observed by platform
approved tool arguments
normalized action
validation result
start timestamp
end timestamp
affected paths
repo branch before
repo commit before
repo branch after
repo commit after
working tree before
working tree after
argv if applicable
argv hash if applicable
sandbox policy hash if applicable
timeout
exit code if applicable
stdout excerpt if applicable
stderr excerpt if applicable
truncation state if applicable
runner start contacted
OpenCode started
approval consumed
disable switch cleared
FP-027 canary run
final classification

Packet Lifecycle Implication

ForgePilot is packet-based.

Therefore, packet lifecycle tooling is core MCP functionality, not a convenience feature.

Future packet lifecycle tools must follow this approval contract.

Expected future packet tools:

create packet
create run record
update run record
create request artifact
commit scoped packet/run changes
push current branch
list packet lifecycle state
verify packet lifecycle evidence

All write/commit/push tools must be approved through the tool modal.

They must also mechanically enforce path scope and git scope.

Bubblewrap Implication

Bubblewrap may be used for future tool execution paths, including packet-management validation or smoke tests.

However:

bubblewrap approval still occurs through the tool modal
bubblewrap policy must be modal-visible where relevant
bubblewrap does not replace tool-side validation
bubblewrap does not replace path-scope checks
bubblewrap does not replace git-scope checks

Bubblewrap reduces blast radius.

Bubblewrap shares the host kernel.

Bubblewrap does not provide VM-level isolation.

UX Rule

Normal approval UX:

inspect tool modal
approve or deny

Not normal approval UX:

manually author approval markdown
manually copy hashes into approval markdown
manually duplicate request artifacts
manually maintain approval state

Non-Execution Boundary

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

FP-MCP-386_SYSTEM_WIDE_TOOL_MODAL_APPROVAL_CONTRACT

Recommended Next Packet

FP-MCP-387 — Packet lifecycle MCP tool design

Goal:

Design packet lifecycle MCP tools for:

packet creation
run artifact creation
scoped commit
scoped push

The tools must follow the FP-MCP-386 system-wide modal approval contract.

They should be scoped, packet-aware, and not generic arbitrary shell/git tools.
