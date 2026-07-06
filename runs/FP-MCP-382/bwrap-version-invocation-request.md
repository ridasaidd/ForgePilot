FP-MCP-382 — Bubblewrap Version Invocation Request Artifact

Result

REQUEST ARTIFACT CREATED.

Purpose

Create a non-executing request artifact for the first intentional invocation of the bwrap binary.

The requested invocation is metadata-only:

["/usr/bin/bwrap", "--version"]

This packet does not invoke bwrap.

This packet does not run bwrap --version.

This packet does not start a bubblewrap sandbox.

This packet does not execute a sandboxed command.

This packet does not invoke shell.

This packet does not contact runner start.

This packet does not start OpenCode.

This packet does not consume approval.

This packet does not clear disable switches.

This packet does not run FP-027.

Prior Packets

FP-MCP-380

Observed that a bubblewrap binary is discoverable at:

/usr/bin/bwrap

But did not invoke it.

Classification:

FP-MCP-380_BUBBLEWRAP_READONLY_HOST_CAPABILITY_OBSERVATION_PASS_EXECUTION_NOT_PROVEN

FP-MCP-381

Defined the approval requirements for the first intentional bwrap binary invocation.

Classification:

FP-MCP-381_DESIGN_ONLY_BWRAP_BINARY_INVOCATION_APPROVAL

FP-MCP-382 implements the next non-executing request artifact described by FP-MCP-381.

Invocation Request

Packet ID:

FP-MCP-382

Invocation class:

BWRAP_BINARY_METADATA_INVOCATION

Requested argv:

["/usr/bin/bwrap", "--version"]

Requested argv canonical JSON:

["/usr/bin/bwrap","--version"]

Requested argv SHA-256:

5121fbf01f6c634ada5d36090c07fe18239eb4ca38298381fd80bb3cb774044c

Expected binary path:

/usr/bin/bwrap

Expected working directory:

/home/ridasaidd/forgepilot

Expected host:

rpsrv

Expected service/user context:

user: ridasaidd
uid: 1000
gid: 1000

Expected stdout bound:

20000 bytes

Expected stderr bound:

20000 bytes

Expected timeout:

10 seconds

Approval Requirement

This request does not authorize invocation.

A later packet must record explicit human approval before /usr/bin/bwrap --version is invoked.

Required future approval packet:

FP-MCP-383 — Human approval for bwrap version invocation

Required future execution packet:

FP-MCP-384 — Approved bwrap version invocation

Approval Binding Requirements

Future approval must bind:

approvalPacketId
approvalId
packetId: FP-MCP-382
invocationClass: BWRAP_BINARY_METADATA_INVOCATION
exact argv: ["/usr/bin/bwrap", "--version"]
argv SHA-256: 5121fbf01f6c634ada5d36090c07fe18239eb4ca38298381fd80bb3cb774044c
expected binary path: /usr/bin/bwrap
expected working directory: /home/ridasaidd/forgepilot
expected host: rpsrv
expected user: ridasaidd
expected stdout bound: 20000 bytes
expected stderr bound: 20000 bytes
expected timeout: 10 seconds
single-use: true
expiry: required

Explicitly Not Authorized

This request does not authorize:

bwrap sandbox startup
sandbox command execution
shell execution
runner start contact
OpenCode start
FP-027 canary
evidence admission
disable switch clearing
preview writer exposure to ChatGPT-safe

Allowed future invocation under approval:

bwrap binary invocation: true
bwrap sandbox startup: false
sandbox command execution: false
shell execution: false
runner start contact: false
OpenCode start: false
FP-027 canary: false

Expected Result Shape For Future Invocation

Future FP-MCP-384 result must record:

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
runner start contacted: false
OpenCode started: false
disable switch cleared: false
FP-027 canary run: false

The result must not include:

secrets
OAuth tokens
private keys
raw environment dumps
hidden/system prompt content

Failure Conditions For Future Invocation

Future FP-MCP-384 must not invoke bwrap if:

approval is missing
approval is expired
approval was already consumed
argv differs from the approved argv
argv hash differs from the approved hash
binary path differs from the approved path
working directory differs from the approved working directory
invocation class differs from BWRAP_BINARY_METADATA_INVOCATION

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

FP-MCP-382_NON_EXECUTING_BWRAP_VERSION_INVOCATION_REQUEST_ARTIFACT

Recommended Next Packet

FP-MCP-383 — Human approval for bwrap version invocation

Goal:

Record explicit human approval for exactly one invocation of:

["/usr/bin/bwrap", "--version"]

The approval must bind the argv hash and must not authorize sandbox startup, runner start, OpenCode, or FP-027.
