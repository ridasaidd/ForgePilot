FP-MCP-375 — Record Sandbox Preview Reader Runtime Validation

Result

PASS.

Purpose

Record the FP-MCP-374A runtime validation result for sandbox preview reader exposure.

This packet records evidence only.

It does not implement a new MCP tool.

It does not execute commands.

It does not invoke bubblewrap.

It does not start OpenCode.

It does not contact the runner start endpoint.

It does not consume approval.

It does not clear disable switches.

It does not run FP-027.

Prior Packets

FP-MCP-371

Defined the sandboxed command preview artifact design.

Required auditor review before implementation.

Preserved the bubblewrap caveat:

Bubblewrap reduces blast radius.
Bubblewrap shares the host kernel.
Bubblewrap does not provide VM-level isolation.

FP-MCP-371A

Auditor accepted the FP-MCP-371 schema for later non-executing writer implementation.

Added:

outputPolicy.onRedactionFailureDiscovered

Required value:

MANUAL_INCIDENT_REVIEW_REQUIRED

FP-MCP-372

Implemented the non-executing sandbox preview artifact writer.

Writer tool:

forgepilot_create_sandboxed_command_preview

Surface:

dev

ChatGPT-safe visibility:

false

Bridge result commit:

9a65ec4

Core record commit:

29750d4

FP-MCP-372A

Validated runtime exposure after FP-MCP-372.

Confirmed writer was not visible in ChatGPT-safe/public Actions.

Runtime PID after restart:

884582

Core record commit:

9fa8df9

FP-MCP-373

Performed sandbox preview writer smoke test.

Created canonical preview artifact:

runs/FP-MCP-373/sandbox-preview/PREVIEW-20260706T083445Z-a2a3ac3e.json

Canonical artifact hash:

c0f67c844032743c5de58c83ab751afed089096d47fecd8d5e5b4c97cba1e370

Proposed command:

["pwd"]

Proposed command executed:

false

Core result commit:

77556d4

FP-MCP-374

Implemented sandbox preview artifact reader / validator.

Reader tool:

forgepilot_read_sandboxed_command_preview

Surface:

chatgpt-safe

Side effect class:

READ_ONLY

Bridge result commit:

2f8ee75

Bridge commit message:

Add sandbox preview artifact reader

Core record commit:

73c0992

FP-MCP-374 generated validation artifacts addendum

Recorded additional preview artifacts generated during FP-MCP-374 testing as FP-MCP-374 test byproducts.

Core commit:

049505a

Canonical FP-MCP-373 artifact remains:

runs/FP-MCP-373/sandbox-preview/PREVIEW-20260706T083445Z-a2a3ac3e.json

Canonical hash remains:

c0f67c844032743c5de58c83ab751afed089096d47fecd8d5e5b4c97cba1e370

Runtime Validation Observations

Pre-refresh state

Before MCP service restart / Actions refresh, ChatGPT-safe/public Actions exposed 12 ForgePilot_MCP tools and did not expose:

forgepilot_read_sandboxed_command_preview

The writer was also not exposed:

forgepilot_create_sandboxed_command_preview

Pre-refresh classification:

RUNTIME_VALIDATION_BLOCKED_READER_NOT_VISIBLE_IN_CURRENT_CHATGPT_SAFE_SCHEMA

Service restart

The MCP bridge user service was restarted from the host.

Correct service:

systemctl --user restart forgepilot-chatgpt-mcp.service

Runner service was not restarted:

forgepilot-runner.service

Runtime PID change

Before restart:

884582

After restart:

887258

Conclusion:

MCP bridge runtime restart confirmed.

Post-refresh runtime diagnostics

Read-only MCP runtime diagnostics reported:

checkedAt: 2026-07-06T09:16:33.028Z
pid: 887258
cwd: /home/ridasaidd/forgepilot-chatgpt-mcp
node: v24.4.1
platform: linux arm64

Safe boundary:

readOnly: true
secretsDumped: false
executionAuthorized: false
approvalConsumed: false
disableSwitchCleared: false
runnerStartEndpointContacted: false
opencodeStarted: false
fp027CanaryRun: false

Post-refresh ChatGPT-safe/public Actions exposure

After MCP restart and ChatGPT Actions refresh, the reader became visible:

forgepilot_read_sandboxed_command_preview

Visibility:

public

The writer remained hidden:

forgepilot_create_sandboxed_command_preview

Exposure result:

reader visible: true
writer visible: false

Canonical Preview Artifact Reader Validation

The reader tool was called against the canonical FP-MCP-373 preview artifact.

Reader tool:

forgepilot_read_sandboxed_command_preview

Input:

packetId: FP-MCP-373
previewId: PREVIEW-20260706T083445Z-a2a3ac3e
includeArtifact: false

Artifact path:

runs/FP-MCP-373/sandbox-preview/PREVIEW-20260706T083445Z-a2a3ac3e.json

Reader result:

validationState: VALID
validationErrors: []

Artifact hash:

c0f67c844032743c5de58c83ab751afed089096d47fecd8d5e5b4c97cba1e370

Schema version:

forgepilot.sandboxPreview.v1

Status:

AUDITOR_REVIEW_REQUIRED

Proposed command argv:

["pwd"]

Sandbox isolation claim:

REDUCED_RISK_NOT_VM_ISOLATION

Required bubblewrap caveat present:

true

Network enabled:

false

Redaction failure policy:

MANUAL_INCIDENT_REVIEW_REQUIRED

Evidence policy:

previewIsEvidence: false
futureSandboxOutputAutoAdmitted: false
futureSandboxOutputInitialAdmissionState: NOT_EVALUATED
futureSandboxOutputInitialTrustTier: TIER_0_UNTRUSTED

Reader contract:

readOnlyContract: true
pathConstrained: true

Non-Execution Boundary

Reader-reported non-execution boundary:

commandExecuted: false
bubblewrapExecuted: false
shellExecuted: false
runnerStartEndpointContacted: false
opencodeStarted: false
approvalConsumed: false
disableSwitchCleared: false
fp027CanaryRun: false
previewOnly: true

Runtime-reported non-execution boundary:

readOnly: true
secretsDumped: false
executionAuthorized: false
approvalConsumed: false
disableSwitchCleared: false
runnerStartEndpointContacted: false
opencodeStarted: false
fp027CanaryRun: false

Classification

FP-MCP-374A_RUNTIME_VALIDATION_PASS

State transition:

previous: BLOCKED_READER_NOT_VISIBLE
current: PASS_READER_VISIBLE_AND_VALIDATED_CANONICAL_PREVIEW

Meaning

The sandbox preview subsystem now supports a safe split:

1. A dev/internal path can create sandbox command preview artifacts.
2. ChatGPT-safe/public Actions can read and validate existing preview artifacts.
3. ChatGPT-safe/public Actions cannot create preview artifacts.
4. ChatGPT-safe/public Actions cannot execute commands.
5. The preview artifact remains non-evidence by default.
6. Any future sandbox execution path remains separate and must require explicit approval and separate validation/admission.

Non-Goals Preserved

This packet does not mean ForgePilot can run sandboxed commands.

This packet does not authorize command execution.

This packet does not add a runner start path.

This packet does not expose the preview writer to ChatGPT-safe/public Actions.

This packet does not auto-admit preview output as evidence.

Unresolved Caveats

Bridge git state was expected as:

branch: feature/oauth-auth0
commit: 2f8ee75
working tree: clean

The running MCP diagnostics confirmed the runtime cwd:

/home/ridasaidd/forgepilot-chatgpt-mcp

However, bridge git status was not directly verified by a read-only MCP bridge-status tool in this ChatGPT session.

GPT-house update should be performed separately from the host if not already recorded.

Recommended Next Packet

FP-MCP-376 — Sandbox preview reader negative-path runtime validation

Goal:

* Prove the reader rejects path traversal.
* Prove the reader rejects arbitrary absolute paths.
* Prove the reader rejects malformed packet IDs or preview IDs.
* Prove the reader remains read-only under negative inputs.
* Preserve writer invisibility.
* Preserve non-execution boundary.

Important:

FP-MCP-376 should be negative-path validation only.
It should not create new preview artifacts.
It should not execute commands.
It should not invoke bubblewrap.
It should not contact runner start.
It should not start OpenCode.
