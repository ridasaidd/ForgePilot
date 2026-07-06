FP-MCP-376 — Sandbox Preview Reader Negative-Path Runtime Validation

Result

PASS.

Purpose

Validate that the public/read-only sandbox preview reader rejects malformed, traversal-style, absolute-path, and nonexistent artifact inputs safely.

This packet records runtime validation evidence only.

It does not implement a new MCP tool.

It does not create preview artifacts.

It does not execute commands.

It does not invoke bubblewrap.

It does not execute shell.

It does not contact runner start.

It does not start OpenCode.

It does not consume approval.

It does not clear disable switches.

It does not run FP-027.

Tool Under Test

Public/read-only reader:

forgepilot_read_sandboxed_command_preview

Contract:

Read and validate an existing sandbox preview artifact.

Expected constraints:

Only reads files under:
runs/<packetId>/sandbox-preview/<previewId>.json
Does not execute commands.
Does not run bubblewrap.
Does not spawn processes.
Does not contact runner start.
Does not start OpenCode.
Does not consume approval.

Positive Baseline From FP-MCP-374A

Canonical artifact:

runs/FP-MCP-373/sandbox-preview/PREVIEW-20260706T083445Z-a2a3ac3e.json

Canonical hash:

c0f67c844032743c5de58c83ab751afed089096d47fecd8d5e5b4c97cba1e370

Reader validation state:

VALID

Reader exposure:

forgepilot_read_sandboxed_command_preview: public / visible

Writer exposure:

forgepilot_create_sandboxed_command_preview: not visible in ChatGPT-safe/public Actions

Negative-Path Probes

Probe 1 — Traversal-style packet ID

Input:

packetId: ../FP-MCP-373
previewId: PREVIEW-20260706T083445Z-a2a3ac3e
includeArtifact: false

Result:

validationState: PATH_ERROR
validationErrors:
  - packetId does not match ForgePilot packet id pattern
artifactPath: ""
artifactHashSha256: ""
readOnlyContract: true
pathConstrained: true

Conclusion:

PASS.
Traversal-style packet ID was rejected before resolving an artifact path.

Probe 2 — Traversal-style preview ID

Input:

packetId: FP-MCP-373
previewId: ../PREVIEW-20260706T083445Z-a2a3ac3e
includeArtifact: false

Result:

validationState: PATH_ERROR
validationErrors:
  - previewId does not match PREVIEW-* pattern
artifactPath: ""
artifactHashSha256: ""
readOnlyContract: true
pathConstrained: true

Conclusion:

PASS.
Traversal-style preview ID was rejected before resolving an artifact path.

Probe 3 — Absolute-path packet ID

Input:

packetId: /home/ridasaidd/forgepilot
previewId: PREVIEW-20260706T083445Z-a2a3ac3e
includeArtifact: false

Result:

validationState: PATH_ERROR
validationErrors:
  - packetId does not match ForgePilot packet id pattern
artifactPath: ""
artifactHashSha256: ""
readOnlyContract: true
pathConstrained: true

Conclusion:

PASS.
Absolute-path packet ID was rejected before resolving an artifact path.

Probe 4 — Absolute-path preview ID

Input:

packetId: FP-MCP-373
previewId: /home/ridasaidd/forgepilot/runs/FP-MCP-373/sandbox-preview/PREVIEW-20260706T083445Z-a2a3ac3e
includeArtifact: false

Result:

validationState: PATH_ERROR
validationErrors:
  - previewId does not match PREVIEW-* pattern
artifactPath: ""
artifactHashSha256: ""
readOnlyContract: true
pathConstrained: true

Conclusion:

PASS.
Absolute-path preview ID was rejected before resolving an artifact path.

Probe 5 — Malformed packet ID

Input:

packetId: not-a-packet
previewId: PREVIEW-20260706T083445Z-a2a3ac3e
includeArtifact: false

Result:

validationState: PATH_ERROR
validationErrors:
  - packetId does not match ForgePilot packet id pattern
artifactPath: ""
artifactHashSha256: ""
readOnlyContract: true
pathConstrained: true

Conclusion:

PASS.
Malformed packet ID was rejected before resolving an artifact path.

Probe 6 — Well-shaped nonexistent preview ID

Input:

packetId: FP-MCP-373
previewId: PREVIEW-20990101T000000Z-deadbeef
includeArtifact: false

Result:

validationState: READ_ERROR
validationErrors:
  - artifact file not found or not accessible
artifactPath: runs/FP-MCP-373/sandbox-preview/PREVIEW-20990101T000000Z-deadbeef.json
artifactHashSha256: ""
readOnlyContract: true
pathConstrained: true

Conclusion:

PASS.
Well-shaped but nonexistent preview ID resolved only inside the constrained sandbox-preview path and returned READ_ERROR.

Probe 7 — Well-shaped nonexistent packet directory

Input:

packetId: FP-MCP-999
previewId: PREVIEW-20260706T083445Z-a2a3ac3e
includeArtifact: false

Result:

validationState: READ_ERROR
validationErrors:
  - artifact file not found or not accessible
artifactPath: runs/FP-MCP-999/sandbox-preview/PREVIEW-20260706T083445Z-a2a3ac3e.json
artifactHashSha256: ""
readOnlyContract: true
pathConstrained: true

Conclusion:

PASS.
Well-shaped but nonexistent packet directory resolved only inside the constrained sandbox-preview path and returned READ_ERROR.

Excluded Probe

One malformed preview-id probe was blocked by platform-side safety checks before reaching the MCP tool.

Classification:

EXCLUDED_FROM_MCP_EVIDENCE_PLATFORM_BLOCKED_BEFORE_TOOL_INVOCATION

This probe is not counted as ForgePilot MCP evidence.

Runtime Boundary After Negative-Path Probes

Read-only MCP runtime diagnostics after the probes reported:

checkedAt: 2026-07-06T09:58:14.850Z
pid: 887258
cwd: /home/ridasaidd/forgepilot-chatgpt-mcp
node: v24.4.1
platform: linux arm64

Boundary:

readOnly: true
secretsDumped: false
executionAuthorized: false
approvalConsumed: false
disableSwitchCleared: false
runnerStartEndpointContacted: false
opencodeStarted: false
fp027CanaryRun: false

Non-Execution Boundary

No command execution occurred.

No bubblewrap execution occurred.

No shell execution occurred.

No command execution MCP tool was exposed or used.

No runner start endpoint was contacted.

No OpenCode start occurred.

No approval was consumed.

No disable switch was cleared.

No FP-027 canary run occurred.

No preview artifact was created.

Classification

FP-MCP-376_NEGATIVE_PATH_RUNTIME_VALIDATION_PASS

Meaning

The public/read-only sandbox preview reader now has runtime evidence for both:

1. Positive-path validation of a canonical preview artifact.
2. Negative-path rejection of malformed, traversal-style, absolute-path, and nonexistent inputs.

The reader remained:

read-only
path-constrained
non-executing

The writer remained outside the ChatGPT-safe/public action surface.

Recommended Next Packet

FP-MCP-377 — Sandbox preview reader malformed-artifact fixture validation design

Goal:

Define how to validate malformed artifact contents safely without using the public reader to create or mutate fixtures.

Important:

FP-MCP-377 should be design-only unless explicitly scoped otherwise.
It should not create malformed artifacts through ChatGPT-safe tools.
It should not execute commands.
It should not invoke bubblewrap.
It should not contact runner start.
It should not start OpenCode.
