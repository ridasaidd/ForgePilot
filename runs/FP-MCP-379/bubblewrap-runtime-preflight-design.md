FP-MCP-379 — Bubblewrap Runtime Preflight Design

Result

DESIGN ONLY.

Purpose

Define how ForgePilot should verify bubblewrap runtime availability and host compatibility before any actual sandbox execution or canary run.

This packet exists because previous sandbox-preview packets validated the preview/reader/validator layer, but did not invoke bubblewrap.

Current status:

bubblewrap is specified in the sandbox preview contract
bubblewrap has not been invoked
bubblewrap runtime availability has not been proven
bubblewrap isolation behavior has not been tested

Scope

This packet defines preflight categories only.

It does not run bubblewrap.

It does not execute commands.

It does not invoke shell.

It does not contact runner start.

It does not start OpenCode.

It does not consume approval.

It does not clear disable switches.

It does not run FP-027.

It does not create a canary execution request.

It does not approve execution.

Background

The sandbox preview subsystem now has evidence for:

1. A dev-only preview writer.
2. A public/read-only preview reader.
3. Positive validation of the canonical FP-MCP-373 preview artifact.
4. Negative-path rejection of traversal, absolute-path, malformed, and nonexistent inputs.
5. Malformed-content rejection via bridge fixture tests.
6. Preservation of non-execution boundary.

Relevant completed packets:

* FP-MCP-371 — sandboxed command preview artifact design
* FP-MCP-371A — sandbox preview schema auditor addendum
* FP-MCP-372 — non-executing sandbox preview artifact writer
* FP-MCP-372A — runtime validation for writer exposure
* FP-MCP-373 — sandbox preview writer smoke test
* FP-MCP-374 — sandbox preview reader / validator
* FP-MCP-375 — runtime validation record for reader exposure
* FP-MCP-376 — negative-path runtime validation
* FP-MCP-377 — malformed artifact fixture validation design
* FP-MCP-378 — malformed artifact fixture tests

The remaining gap before canary work:

bubblewrap itself is not yet runtime-validated.

Design Principle

Bubblewrap checks must be split into two categories:

1. Read-only host capability observations.
2. Execution-adjacent bubblewrap invocations.

These must not be collapsed.

Read-only observations may inspect whether the environment appears capable of running bubblewrap.

Execution-adjacent checks actually invoke bubblewrap and therefore require explicit scope, approval, and evidence handling.

Category A — Read-Only Bubblewrap Availability Observations

These observations do not run bubblewrap.

They inspect host state only.

Recommended read-only observations:

A1 — Binary discovery

Question:

Is a bwrap binary discoverable in the runner/service environment?

Example host-side command:

command -v bwrap

Evidence to record:

discovered: true | false
path: <path or null>

Boundary:

This does not execute bubblewrap.
This only resolves the executable path.

A2 — Package/version observation

Question:

What bubblewrap version is installed?

Potential command:

bwrap --version

Important caveat:

This invokes the bwrap binary, even though it is not sandbox execution.

Classification:

execution-adjacent binary invocation

Recommendation:

Do not include bwrap --version in a purely read-only preflight unless the packet explicitly allows binary invocation.

Alternative:

record package-manager metadata if available without invoking bwrap.

A3 — Service user observation

Question:

Which user/service context would run bwrap?

Evidence to record:

service name
user service vs system service
uid/gid if safe and non-secret
working directory
PATH availability

Boundary:

Do not dump environment variables.
Do not dump secrets.
Do not dump OAuth tokens.
Do not dump private keys.

A4 — Kernel/user namespace configuration

Question:

Does the host appear to allow unprivileged user namespaces?

Potential read-only files:

/proc/sys/kernel/unprivileged_userns_clone
/proc/sys/user/max_user_namespaces

Classification:

read-only host observation

Evidence to record:

file present: true | false
value: bounded small value only

Boundary:

Do not infer success from these values alone.
These values indicate possible compatibility, not proof that bwrap works.

A5 — OS/platform observation

Question:

What host platform is expected to run bwrap?

Evidence to record:

platform
architecture
kernel version if needed
distro if safely available

Boundary:

Non-secret host metadata only.

A6 — Runner/MCP separation observation

Question:

Which process is allowed to observe bwrap, and which process would eventually run it?

Expected separation:

MCP bridge: staging/control plane
runner: dev/execution plane

Boundary:

ChatGPT-safe MCP must not gain bwrap execution authority.

Category B — Execution-Adjacent Bubblewrap Checks

These checks invoke bubblewrap.

They must not run inside FP-MCP-379.

They require later explicit packet scope and approval.

B1 — bwrap version command

Potential command:

bwrap --version

Reason classified as execution-adjacent:

It invokes the bwrap binary.

Risk:

Low, but still a binary invocation.

Required future handling:

explicitly scoped packet
recorded output
no shell if avoidable
bounded stdout/stderr
no runner start unless intentionally scoped

B2 — Minimal bwrap smoke test

Potential command:

bwrap --ro-bind /usr /usr --proc /proc --dev /dev --tmpfs /tmp --unshare-all --die-with-parent -- true

Purpose:

Prove bwrap can start a minimal sandbox.

Risk:

Actual bubblewrap invocation.

Required future handling:

explicit approval
bounded command
no network
no host writable mounts
no secrets
no OpenCode
no FP-027

B3 — Workspace mount smoke test

Potential command concept:

copy workspace
mount copied workspace at /workspace
run pwd or true inside sandbox

Purpose:

Prove copied workspace can be mounted without mounting the real repo.

Risk:

Actual sandbox execution.

Required future handling:

explicit approval
expected command hash
copied workspace hash
no real repository writable mount
no host home mount
no secrets mount

B4 — Network-disabled smoke test

Purpose:

Prove network is disabled or unavailable under the selected bwrap policy.

Risk:

May require command execution inside sandbox.

Required future handling:

explicit approval
no external network contact
local-only diagnostic if possible
bounded output

B5 — Host mutation prevention test

Purpose:

Prove sandboxed command cannot mutate the real repository.

Risk:

Actual command execution.

Required future handling:

explicit approval
copied workspace only
host repo status before/after
no real repo writable mount

Required Boundary For First Bubblewrap Invocation

The first bwrap invocation must not be accidental.

It must require a packet that binds:

packet id
preview id
command argv
command hash
sandbox policy version
expected head commit
expected runner/service context
expected no-network policy
expected mount policy
approval id
approval expiry
single-use approval state

The first bwrap invocation must record:

exact argv
start timestamp
end timestamp
exit code
stdout excerpt
stderr excerpt
truncation state
artifact hashes
host mutation check result
non-execution-to-execution transition reason
approval consumed: true only if approval was intentionally consumed

Required Preflight Failure States

Future bwrap preflight should distinguish:

BWRAP_NOT_FOUND

Meaning:

bwrap binary could not be discovered.

Action:

do not proceed to canary.

BWRAP_VERSION_UNKNOWN

Meaning:

version could not be determined without allowed binary invocation.

Action:

require explicit binary-observation packet if version is needed.

USERNS_DISABLED_OR_UNKNOWN

Meaning:

user namespace settings appear incompatible or cannot be determined.

Action:

do not infer runtime failure without a scoped smoke test.

SERVICE_CONTEXT_UNKNOWN

Meaning:

cannot determine whether MCP service or runner service has bwrap access.

Action:

add read-only service-context observation.

BWRAP_SMOKE_TEST_REQUIRED

Meaning:

read-only observations are insufficient to prove execution compatibility.

Action:

require explicit approved bwrap smoke-test packet.

BWRAP_SMOKE_TEST_FAILED

Meaning:

bwrap was invoked under an approved test and failed.

Action:

record failure, do not proceed to canary.

Required Safety Statements For Future Packets

Any future bwrap-related packet must explicitly state whether it:

invokes bwrap: true | false
executes a command: true | false
invokes shell: true | false
mounts real repo writable: true | false
mounts host home: true | false
mounts secrets: true | false
enables network: true | false
contacts runner start: true | false
starts OpenCode: true | false
consumes approval: true | false
clears disable switch: true | false
runs FP-027: true | false

Recommended Next Packet

FP-MCP-380 — Bubblewrap read-only host capability observation

Scope:

read-only observation only

Allowed observations:

discover whether bwrap path exists without invoking bwrap
inspect bounded user namespace config files
inspect bounded service/runtime context
record MCP/runner separation
record that no bwrap invocation occurred

Not allowed:

bwrap --version
minimal bwrap smoke test
shell execution
runner start
OpenCode start
approval consumption
disable switch clearing
FP-027 canary

Recommended Later Packets

FP-MCP-381 — Bubblewrap binary invocation approval design

Define approval requirements for the first intentional bwrap binary invocation.

FP-MCP-382 — Bubblewrap version/smoke test request artifact

Create a non-executing request artifact for a minimal bwrap check.

FP-MCP-383 — Human approval for first bwrap invocation

Record explicit approval for the first bwrap invocation.

FP-MCP-384 — Approved minimal bwrap smoke test

Run the smallest approved bwrap test and record bounded output.

FP-MCP-385 — Canary execution plan

Plan the first ForgePilot canary only after bwrap smoke test evidence exists.

Non-Execution Boundary

No bwrap invocation occurred.

No command execution occurred.

No shell execution occurred.

No runner start endpoint was contacted.

No OpenCode start occurred.

No approval was consumed.

No disable switch was cleared.

No FP-027 canary run occurred.

No sandbox execution occurred.

Classification

FP-MCP-379_DESIGN_ONLY_BUBBLEWRAP_RUNTIME_PREFLIGHT
