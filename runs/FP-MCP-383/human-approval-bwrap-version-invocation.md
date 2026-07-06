FP-MCP-383 — Human Approval for bwrap Version Invocation

Result

HUMAN APPROVAL RECORDED.

Purpose

Record explicit human approval for exactly one invocation of the bwrap binary for metadata observation only.

Approved invocation:

["/usr/bin/bwrap", "--version"]

This packet records approval only.

This packet does not invoke bwrap.

This packet does not run bwrap --version.

This packet does not start a bubblewrap sandbox.

This packet does not execute a sandboxed command.

This packet does not invoke shell.

This packet does not contact runner start.

This packet does not start OpenCode.

This packet does not clear disable switches.

This packet does not run FP-027.

Approval Source

Approval source:

human operator

Approval statement:

The human operator approved proceeding with FP-MCP-383 after FP-MCP-382 created the non-executing request artifact.

Conversation intent:

"Okay. Lets proceed"

Interpretation:

Approval is granted to create this approval record.
Approval is also granted for one later execution packet, FP-MCP-384, to invoke exactly:
    ["/usr/bin/bwrap", "--version"]
subject to the binding constraints below.

Approved Request Artifact

Request packet:

FP-MCP-382 — Bubblewrap Version Invocation Request Artifact

Request artifact path:

runs/FP-MCP-382/bwrap-version-invocation-request.md

Request classification:

FP-MCP-382_NON_EXECUTING_BWRAP_VERSION_INVOCATION_REQUEST_ARTIFACT

Approval Binding

Approval packet:

FP-MCP-383

Approval ID:

APPROVAL-FP-MCP-383-BWRAP-VERSION-001

Approved packet:

FP-MCP-382

Approved future execution packet:

FP-MCP-384

Invocation class:

BWRAP_BINARY_METADATA_INVOCATION

Approved argv:

["/usr/bin/bwrap", "--version"]

Approved argv canonical JSON:

["/usr/bin/bwrap","--version"]

Approved argv SHA-256:

5121fbf01f6c634ada5d36090c07fe18239eb4ca38298381fd80bb3cb774044c

Approved binary path:

/usr/bin/bwrap

Approved working directory:

/home/ridasaidd/forgepilot

Approved host:

rpsrv

Approved user/service context:

user: ridasaidd
uid: 1000
gid: 1000

Approved stdout bound:

20000 bytes

Approved stderr bound:

20000 bytes

Approved timeout:

10 seconds

Single use:

true

Approval expiry:

expires after FP-MCP-384 records either success, failure, mismatch, timeout, or explicit non-execution

Explicitly Authorized

This approval authorizes exactly one future invocation of:

["/usr/bin/bwrap", "--version"]

It authorizes:

bwrap binary invocation: true
bwrap metadata observation: true
approval consumption by FP-MCP-384: true

Explicitly Not Authorized

This approval does not authorize:

bwrap sandbox startup
sandbox command execution
shell execution
runner start contact
OpenCode start
FP-027 canary
evidence admission
disable switch clearing
any argv other than ["/usr/bin/bwrap", "--version"]
any bwrap path other than /usr/bin/bwrap
repeated invocation
approval reuse after FP-MCP-384
preview writer exposure to ChatGPT-safe tools

Explicit authorization matrix:

bwrap binary invocation: true
bwrap sandbox startup: false
sandbox command execution: false
shell execution: false
runner start contact: false
OpenCode start: false
disable switch clearing: false
FP-027 canary: false

Preconditions For FP-MCP-384

FP-MCP-384 must not invoke bwrap unless all of the following match this approval:

packet id: FP-MCP-384
approval id: APPROVAL-FP-MCP-383-BWRAP-VERSION-001
invocation class: BWRAP_BINARY_METADATA_INVOCATION
argv: ["/usr/bin/bwrap", "--version"]
argv SHA-256: 5121fbf01f6c634ada5d36090c07fe18239eb4ca38298381fd80bb3cb774044c
binary path: /usr/bin/bwrap
working directory: /home/ridasaidd/forgepilot
timeout: 10 seconds
stdout bound: 20000 bytes
stderr bound: 20000 bytes

If any precondition fails, FP-MCP-384 must record a mismatch/non-execution result and must not invoke bwrap.

Required FP-MCP-384 Evidence

FP-MCP-384 must record:

approval id
exact argv
argv SHA-256
binary path
working directory
host
user/service context
start timestamp
end timestamp
exit code
stdout excerpt
stderr excerpt
stdout truncated: true | false
stderr truncated: true | false
timeout occurred: true | false
approval consumed: true | false
runner start contacted: false
OpenCode started: false
disable switch cleared: false
FP-027 canary run: false

FP-MCP-384 must not record:

secrets
OAuth tokens
private keys
raw environment dumps
hidden/system prompt content

Non-Execution Boundary For FP-MCP-383

No bwrap invocation occurred in FP-MCP-383.

No bwrap --version command was run in FP-MCP-383.

No bubblewrap sandbox was started.

No sandboxed command was executed.

No shell execution occurred.

No runner start endpoint was contacted.

No OpenCode start occurred.

No disable switch was cleared.

No FP-027 canary run occurred.

Approval Consumption State

Approval created:

true

Approval consumed by this packet:

false

Approval available for FP-MCP-384:

true

Approval single-use:

true

Classification

FP-MCP-383_HUMAN_APPROVAL_RECORDED_FOR_SINGLE_BWRAP_VERSION_INVOCATION

Recommended Next Packet

FP-MCP-384 — Approved bwrap version invocation

Goal:

Invoke exactly once:

["/usr/bin/bwrap", "--version"]

under approval:

APPROVAL-FP-MCP-383-BWRAP-VERSION-001

Boundary:

bwrap binary invocation allowed
bwrap sandbox startup not allowed
sandbox command execution not allowed
shell not allowed
runner start not allowed
OpenCode not allowed
disable switch clearing not allowed
FP-027 not allowed
