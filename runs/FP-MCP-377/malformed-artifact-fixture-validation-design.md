FP-MCP-377 — Sandbox Preview Reader Malformed-Artifact Fixture Validation Design

Result

DESIGN ONLY.

Purpose

Define how ForgePilot should validate malformed sandbox preview artifact contents safely.

FP-MCP-376 validated negative path and identifier rejection:

* traversal-style packet IDs
* traversal-style preview IDs
* absolute-path packet IDs
* absolute-path preview IDs
* malformed packet IDs
* well-shaped nonexistent preview IDs
* well-shaped nonexistent packet directories

FP-MCP-377 defines the next validation layer:

malformed artifact contents

This packet does not create fixtures.

This packet does not mutate existing preview artifacts.

This packet does not execute commands.

This packet does not invoke bubblewrap.

This packet does not execute shell.

This packet does not contact runner start.

This packet does not start OpenCode.

This packet does not consume approval.

This packet does not clear disable switches.

This packet does not run FP-027.

Background

The sandbox preview reader now has runtime evidence for:

1. Positive-path validation of the canonical FP-MCP-373 preview artifact.
2. Negative-path rejection of malformed, traversal-style, absolute-path, and nonexistent input identifiers.

The next necessary validation class is malformed content validation.

Malformed content validation answers:

If an artifact exists at an allowed path but its contents violate the sandbox preview schema or safety contract, does the reader reject it safely?

Existing Canonical Valid Artifact

Canonical valid artifact:

runs/FP-MCP-373/sandbox-preview/PREVIEW-20260706T083445Z-a2a3ac3e.json

Canonical hash:

c0f67c844032743c5de58c83ab751afed089096d47fecd8d5e5b4c97cba1e370

Reader validation state:

VALID

This artifact must remain unchanged.

It must not be edited, overwritten, replaced, or repurposed for malformed-artifact testing.

Fixture Design Principle

Malformed artifact fixtures must be separate from canonical artifacts.

They must be deliberately named, isolated, and non-canonical.

They must be recorded as validation fixtures, not execution previews.

They must never be interpreted as proposed real commands.

They must never become admitted evidence.

They must never be used to request execution.

Recommended Fixture Packet

Malformed artifact fixtures should be placed under a dedicated validation packet directory:

runs/FP-MCP-378/sandbox-preview-fixtures/

or another explicitly scoped fixture directory chosen by the implementation packet.

They should not be placed in:

runs/FP-MCP-373/sandbox-preview/

Reason:

FP-MCP-373 contains the canonical smoke-test preview artifact.
Adding malformed fixtures there would blur canonical preview evidence with validator test data.

Recommended Fixture Naming

Each fixture should have an explicit invalid-purpose name.

Examples:

INVALID-MISSING-SCHEMA-VERSION.json
INVALID-WRONG-SCHEMA-VERSION.json
INVALID-MISSING-PROPOSED-COMMAND.json
INVALID-COMMAND-EXECUTED-TRUE.json
INVALID-BUBBLEWRAP-EXECUTED-TRUE.json
INVALID-SHELL-EXECUTED-TRUE.json
INVALID-PREVIEW-IS-EVIDENCE-TRUE.json
INVALID-MISSING-BUBBLEWRAP-CAVEAT.json
INVALID-WRONG-REDACTION-FAILURE-POLICY.json
INVALID-MALFORMED-JSON.json

Important:

These names intentionally do not match PREVIEW-*.

If the current reader only accepts PREVIEW-* IDs, then FP-MCP-378 must decide whether to:

1. Add a fixture-only reader mode.
2. Add a fixture validator tool.
3. Temporarily place fixtures behind PREVIEW-* names inside an explicitly marked fixture packet.
4. Validate malformed fixture files through unit tests only, not through ChatGPT-safe runtime tools.

The safest default is:

malformed fixture validation should begin in bridge unit tests, not public ChatGPT-safe runtime.

Required Fixture Metadata

Every malformed fixture directory should include a README file stating:

These files are intentionally invalid validation fixtures.
They are not proposed commands.
They are not execution requests.
They are not evidence.
They must not be executed.
They must not be admitted.
They exist only to test validator rejection behavior.

Required Validation Cases

Case 1 — Malformed JSON

Fixture content:

invalid JSON syntax

Expected reader or validator result:

validationState: INVALID
validationErrors includes JSON parse failure
commandExecuted: null
readOnlyContract: true
pathConstrained: true

Case 2 — Missing schemaVersion

Mutation:

remove schemaVersion

Expected result:

validationState: INVALID
validationErrors includes missing schemaVersion

Case 3 — Wrong schemaVersion

Mutation:

schemaVersion: forgepilot.sandboxPreview.v999

Expected result:

validationState: INVALID
validationErrors includes unsupported schemaVersion

Case 4 — Missing proposedCommand

Mutation:

remove proposedCommand

Expected result:

validationState: INVALID
validationErrors includes missing proposedCommand

Case 5 — Empty proposedCommand.argv

Mutation:

proposedCommand.argv: []

Expected result:

validationState: INVALID
validationErrors includes missing or empty argv

Case 6 — commandExecuted true

Mutation:

nonExecutionBoundary.commandExecuted: true

Expected result:

validationState: INVALID
validationErrors includes commandExecuted must be false

Case 7 — bubblewrapExecuted true

Mutation:

nonExecutionBoundary.bubblewrapExecuted: true

Expected result:

validationState: INVALID
validationErrors includes bubblewrapExecuted must be false

Case 8 — shellExecuted true

Mutation:

nonExecutionBoundary.shellExecuted: true

Expected result:

validationState: INVALID
validationErrors includes shellExecuted must be false

Case 9 — runnerStartEndpointContacted true

Mutation:

nonExecutionBoundary.runnerStartEndpointContacted: true

Expected result:

validationState: INVALID
validationErrors includes runnerStartEndpointContacted must be false

Case 10 — opencodeStarted true

Mutation:

nonExecutionBoundary.opencodeStarted: true

Expected result:

validationState: INVALID
validationErrors includes opencodeStarted must be false

Case 11 — approvalConsumed true

Mutation:

nonExecutionBoundary.approvalConsumed: true

Expected result:

validationState: INVALID
validationErrors includes approvalConsumed must be false

Case 12 — disableSwitchCleared true

Mutation:

nonExecutionBoundary.disableSwitchCleared: true

Expected result:

validationState: INVALID
validationErrors includes disableSwitchCleared must be false

Case 13 — fp027CanaryRun true

Mutation:

nonExecutionBoundary.fp027CanaryRun: true

Expected result:

validationState: INVALID
validationErrors includes fp027CanaryRun must be false

Case 14 — previewOnly false

Mutation:

nonExecutionBoundary.previewOnly: false

Expected result:

validationState: INVALID
validationErrors includes previewOnly must be true

Case 15 — missing bubblewrap caveat

Mutation:

remove sandboxPolicy.requiredCaveat

Expected result:

validationState: INVALID
validationErrors includes missing required bubblewrap caveat

Required caveat text:

Bubblewrap reduces blast radius. Bubblewrap shares the host kernel. Bubblewrap does not provide VM-level isolation.

Case 16 — wrong isolation claim

Mutation:

sandboxPolicy.isolationClaim: VM_LEVEL_ISOLATION

Expected result:

validationState: INVALID
validationErrors includes invalid isolation claim

Required value:

REDUCED_RISK_NOT_VM_ISOLATION

Case 17 — network enabled true

Mutation:

networkPolicy.networkEnabled: true

Expected result:

validationState: INVALID
validationErrors includes network must be disabled for current preview policy

Case 18 — wrong redaction failure policy

Mutation:

outputPolicy.onRedactionFailureDiscovered: IGNORE

Expected result:

validationState: INVALID
validationErrors includes invalid redaction failure policy

Required value:

MANUAL_INCIDENT_REVIEW_REQUIRED

Case 19 — previewIsEvidence true

Mutation:

evidencePolicy.previewIsEvidence: true

Expected result:

validationState: INVALID
validationErrors includes previewIsEvidence must be false

Case 20 — futureSandboxOutputAutoAdmitted true

Mutation:

evidencePolicy.futureSandboxOutputAutoAdmitted: true

Expected result:

validationState: INVALID
validationErrors includes futureSandboxOutputAutoAdmitted must be false

Case 21 — initial admission state not NOT_EVALUATED

Mutation:

evidencePolicy.futureSandboxOutputInitialAdmissionState: ADMITTED

Expected result:

validationState: INVALID
validationErrors includes initial admission state must be NOT_EVALUATED

Case 22 — initial trust tier not TIER_0_UNTRUSTED

Mutation:

evidencePolicy.futureSandboxOutputInitialTrustTier: TIER_3_REPRODUCIBLE

Expected result:

validationState: INVALID
validationErrors includes initial trust tier must be TIER_0_UNTRUSTED

Fixture Execution Boundary

Malformed artifact fixtures must never be executed.

The validation mechanism must never infer execution intent from a fixture.

The validation mechanism must never pass fixture proposedCommand.argv to shell, child_process, bubblewrap, OpenCode, or runner start.

Public Runtime Boundary

If malformed fixture validation is exposed to ChatGPT-safe runtime later, it must remain read-only and path-constrained.

It must not allow arbitrary path reads.

It must not accept absolute paths.

It must not allow traversal.

It must not create fixtures.

It must not mutate fixtures.

It must not write validation results.

It must not execute or approve anything.

Recommended Implementation Sequence

FP-MCP-378 — Malformed artifact fixture implementation in bridge tests

Recommended scope:

* add malformed fixture samples in the bridge test suite only
* validate they are rejected by internal validator logic
* do not expose fixture creation to ChatGPT-safe
* do not create runtime artifacts in ForgePilot core
* preserve canonical FP-MCP-373 artifact unchanged

FP-MCP-379 — Runtime malformed fixture validation, only if needed

Recommended scope:

* add a read-only fixture validator or fixture mode if runtime evidence is needed
* constrain fixture paths to a dedicated fixture directory
* preserve public reader path constraints
* preserve non-execution boundary

Acceptance Criteria For Future Implementation

A future malformed-artifact validation implementation is acceptable only if:

1. Canonical FP-MCP-373 artifact remains unchanged.
2. Fixtures are isolated from canonical preview artifacts.
3. Fixture files are explicitly marked invalid.
4. All malformed content cases are rejected.
5. Rejection does not execute any command.
6. Rejection does not invoke bubblewrap.
7. Rejection does not execute shell.
8. Rejection does not contact runner start.
9. Rejection does not start OpenCode.
10. Rejection does not consume approval.
11. Rejection does not clear disable switches.
12. Rejection does not run FP-027.
13. Rejection does not admit evidence.
14. The writer remains hidden from ChatGPT-safe/public Actions.
15. Any public runtime validator remains read-only and path-constrained.

Non-Execution Boundary

No command execution occurred.

No bubblewrap execution occurred.

No shell execution occurred.

No runner start endpoint was contacted.

No OpenCode start occurred.

No approval was consumed.

No disable switch was cleared.

No FP-027 canary run occurred.

No fixture was created.

No preview artifact was created.

Classification

FP-MCP-377_DESIGN_ONLY_MALFORMED_ARTIFACT_FIXTURE_VALIDATION

Recommended Next Packet

FP-MCP-378 — Malformed artifact fixture implementation in bridge tests

Recommended scope:

* bridge tests only
* malformed fixtures isolated from canonical artifacts
* no public fixture creation
* no runtime execution
* no bubblewrap
* no shell
* no runner start
* no OpenCode
* no approval consumption
* no disable switch clearing
