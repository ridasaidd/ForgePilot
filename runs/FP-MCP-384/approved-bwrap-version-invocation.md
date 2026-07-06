FP-MCP-384 — Approved bwrap Version Invocation

Result

PASS.

Purpose

Record the first approved intentional invocation of the bwrap binary.

The approved invocation was metadata-only:

["/usr/bin/bwrap", "--version"]

This packet invoked the bwrap binary.

This packet did not start a bubblewrap sandbox.

This packet did not execute a sandboxed command.

This packet did not invoke shell.

This packet did not contact runner start.

This packet did not start OpenCode.

This packet did not clear disable switches.

This packet did not run FP-027.

Approval Chain

Approved request packet:

FP-MCP-382 — Bubblewrap Version Invocation Request Artifact

Approval packet:

FP-MCP-383 — Human Approval for bwrap Version Invocation

Execution packet:

FP-MCP-384 — Approved bwrap Version Invocation

Approval ID:

APPROVAL-FP-MCP-383-BWRAP-VERSION-001

Approval consumed:

true

Approved Invocation

Approved argv:

["/usr/bin/bwrap", "--version"]

Approved argv canonical JSON:

["/usr/bin/bwrap","--version"]

Approved argv SHA-256:

5121fbf01f6c634ada5d36090c07fe18239eb4ca38298381fd80bb3cb774044c

Observed argv SHA-256:

5121fbf01f6c634ada5d36090c07fe18239eb4ca38298381fd80bb3cb774044c

Argv hash matched approval:

true

Approved binary path:

/usr/bin/bwrap

Binary path existed:

true

Execution Context

Host:

rpsrv

Working directory:

/home/ridasaidd/forgepilot

UID:

1000

GID:

1000

Runtime Result

Start timestamp:

2026-07-06T11:25:42.254875+00:00

End timestamp:

2026-07-06T11:25:42.256474+00:00

Duration:

1.572 ms

Exit code:

0

Timeout occurred:

false

Stdout truncated:

false

Stderr truncated:

false

STDOUT

bubblewrap 0.8.0

STDERR

<empty>

Boundary Before Invocation

Observed before invocation:

bwrapSandboxStartupAllowed: false
sandboxCommandExecutionAllowed: false
shellExecutionAllowed: false
runnerStartAllowed: false
opencodeStartAllowed: false
disableSwitchClearingAllowed: false
fp027CanaryAllowed: false

Boundary After Invocation

Observed after invocation:

bwrapBinaryInvoked: true
bwrapSandboxStarted: false
sandboxCommandExecuted: false
runnerStartEndpointContacted: false
opencodeStarted: false
approvalConsumed: true
disableSwitchCleared: false
fp027CanaryRun: false

Interpretation

FP-MCP-384 proves:

/usr/bin/bwrap can be invoked in the observed host/user context
the installed bubblewrap version is 0.8.0
the metadata-only bwrap invocation exited successfully

FP-MCP-384 does not prove:

bubblewrap can start a sandbox
user namespaces are fully usable for sandbox startup
the ForgePilot sandbox policy works
copied workspace mounting works
network isolation works
host mutation prevention works
runner integration works
OpenCode integration works
FP-027 canary readiness

Non-Execution / Non-Canary Boundary

No bubblewrap sandbox was started.

No sandboxed command was executed.

No shell execution occurred.

No runner start endpoint was contacted.

No OpenCode start occurred.

No disable switch was cleared.

No FP-027 canary run occurred.

Classification

FP-MCP-384_APPROVED_BWRAP_VERSION_INVOCATION_PASS

Recommended Next Packet

FP-MCP-385 — Minimal bwrap sandbox smoke-test design

Goal:

Design the first approved bubblewrap sandbox-starting test.

Important:

FP-MCP-385 should be design-only.
It should not run bwrap.
It should not start a sandbox.
It should not execute a sandboxed command.

The later smoke-test sequence should include:

FP-MCP-386 — Human approval for minimal bwrap smoke test
FP-MCP-387 — Approved minimal bwrap smoke test
