FP-MCP-380 — Bubblewrap Read-Only Host Capability Observation

Result

PASS WITH EXECUTION NOT PROVEN.

Purpose

Record read-only host observations relevant to future bubblewrap runtime validation.

This packet observes whether the host appears to have bubblewrap available and whether basic namespace-related host settings are present.

This packet does not invoke bubblewrap.

This packet does not check bwrap --version.

This packet does not run a bubblewrap smoke test.

This packet does not execute sandboxed commands.

This packet does not contact runner start.

This packet does not start OpenCode.

This packet does not consume approval.

This packet does not clear disable switches.

This packet does not run FP-027.

Prior Design Packet

FP-MCP-379 defined the separation between:

1. Read-only bubblewrap host capability observations.
2. Execution-adjacent bubblewrap invocations.

FP-MCP-380 performs category 1 only.

Observation Context

Host:

Linux rpsrv 6.12.87+rpt-rpi-2712 #1 SMP PREEMPT Debian 1:6.12.87-1+rpt1~bookworm (2026-05-12) aarch64 GNU/Linux

Service/user context:

user: ridasaidd
uid: 1000
gid: 1000
pwd: /home/ridasaidd/forgepilot

Bubblewrap Path Discovery

Observation:

bwrapDiscovered: true
bwrapPath: /usr/bin/bwrap

Interpretation:

A bwrap binary is discoverable in the observed host user context.

Important caveat:

This does not prove bwrap can run.
This does not prove bwrap can create namespaces.
This does not prove the intended runner service can invoke bwrap.
This does not prove sandbox policy correctness.
This does not prove canary readiness.

User Namespace Observations

Observed:

kernel.unprivileged_userns_clone: unavailable
user.max_user_namespaces: 31949

Interpretation:

/proc/sys/user/max_user_namespaces is readable and nonzero.
/proc/sys/kernel/unprivileged_userns_clone is unavailable on this host.

Important caveat:

These values are compatibility signals only.
They do not prove bwrap execution works.
A later approved smoke test is still required.

Boundary Observation

Observed boundary:

bwrapInvoked: false
bwrapVersionChecked: false
bwrapSmokeTestRun: false
sandboxCommandExecuted: false
runnerStartEndpointContacted: false
opencodeStarted: false
approvalConsumed: false
disableSwitchCleared: false
fp027CanaryRun: false

Non-Execution Boundary

No bubblewrap invocation occurred.

No bwrap --version command was run.

No bubblewrap smoke test was run.

No sandboxed command was executed.

No shell execution was required by this record.

No runner start endpoint was contacted.

No OpenCode start occurred.

No approval was consumed.

No disable switch was cleared.

No FP-027 canary run occurred.

Classification

FP-MCP-380_BUBBLEWRAP_READONLY_HOST_CAPABILITY_OBSERVATION_PASS_EXECUTION_NOT_PROVEN

Meaning

FP-MCP-380 establishes that bubblewrap appears to be installed at:

/usr/bin/bwrap

It does not establish that bubblewrap works.

It does not establish that the first sandbox canary can run.

It only moves the system from:

bubblewrap specified but not observed

to:

bubblewrap binary path observed, execution not proven

Recommended Next Packet

FP-MCP-381 — Bubblewrap binary invocation approval design

Goal:

Define the approval and evidence requirements for the first intentional bwrap binary invocation.

Important:

Even `bwrap --version` invokes the bwrap binary.
The first bwrap invocation must be explicitly scoped and approved.

Boundary for FP-MCP-381:

design-only
no bwrap invocation
no command execution
no shell
no runner start
no OpenCode
no approval consumption
no disable switch clearing
no FP-027
