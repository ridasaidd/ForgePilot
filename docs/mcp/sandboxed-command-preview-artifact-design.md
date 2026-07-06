# Sandboxed Command Preview Artifact Design

## Status

Draft for auditor review.

This document is the first sandbox-phase artifact after the FP-MCP-369A and FP-MCP-370 reconciliation gates.

It demonstrates the new process rule:

    Any new state machine, executor, gate, approval/clearance/enablement mechanism, execution-adjacent sequencing layer, or tool-surface category change must be flagged for auditor review at introduction time.

This document introduces a future preview artifact design for sandboxed commands.

It does not implement any MCP tool.

It does not execute commands.

It does not run bubblewrap.

It does not expose terminal access.

## Purpose

ForgePilot needs a way to preview proposed sandboxed commands before any command execution capability exists.

The preview artifact is a non-executing request/manifest object.

Its purpose is to answer:

- What command is being proposed?
- Why is it needed?
- What packet/request owns it?
- What sandbox policy would apply?
- What workspace copy would be used?
- What host paths are forbidden?
- Whether network is disabled.
- What output limits apply.
- What approval would be required before future execution.
- What artifacts would be produced if execution were later authorized.
- Why the preview itself does not admit evidence.

## Core Rule

A preview artifact is not execution.

A preview artifact is not approval.

A preview artifact is not evidence admission.

A preview artifact is an auditable statement of intended future sandboxed execution.

## Bubblewrap Classification

Bubblewrap is classified as reduced-risk sandboxing.

Required wording:

    Bubblewrap reduces blast radius.
    Bubblewrap shares the host kernel.
    Bubblewrap does not provide VM-level isolation.

This wording must appear in future sandbox preview artifacts.

Any preview artifact that describes bubblewrap as fully isolated is invalid.

## Preview Artifact Lifecycle

The preview artifact lifecycle is:

    DRAFT
      -> AUDITOR_REVIEW_REQUIRED
      -> APPROVED_FOR_FUTURE_EXECUTION_REQUEST
      -> SUPERSEDED / REJECTED / EXPIRED

Important:

- APPROVED_FOR_FUTURE_EXECUTION_REQUEST does not execute the command.
- It only means the preview artifact may be used as input to a later, separately gated execution packet.
- A later execution packet must still perform validation and require explicit approval.

## Proposed Artifact Name

Future preview artifacts should use this stable filename pattern:

    runs/<PACKET_ID>/sandbox-preview/<PREVIEW_ID>.json

Example:

    runs/FP-MCP-371/sandbox-preview/PREVIEW-20260706T090000000Z-example.json

## Preview ID Format

Preview IDs should be globally unique and timestamped:

    PREVIEW-YYYYMMDDTHHMMSSmmmZ-<short-random-suffix>

Example:

    PREVIEW-20260706T090000000Z-a1b2c3d4

## Required Top-Level Fields

A sandboxed command preview artifact must contain these top-level fields:

    schemaVersion
    previewId
    createdAt
    createdBy
    status
    auditorReview
    scope
    proposedCommand
    sandboxPolicy
    workspacePolicy
    mountPolicy
    networkPolicy
    resourcePolicy
    outputPolicy
    artifactPolicy
    approvalPolicy
    evidencePolicy
    riskClassification
    nonExecutionBoundary
    invalidIf

Required schema version:

    forgepilot.sandboxPreview.v1

Allowed status values:

    DRAFT
    AUDITOR_REVIEW_REQUIRED
    APPROVED_FOR_FUTURE_EXECUTION_REQUEST
    SUPERSEDED
    REJECTED
    EXPIRED

## Auditor Review Fields

Required auditor review fields:

    auditorReview.required: true
    auditorReview.reason: New execution-adjacent sandbox preview artifact design falls under FP-MCP-369A process rule.
    auditorReview.reviewState: PENDING | ACCEPTED | REJECTED | CHANGES_REQUESTED
    auditorReview.reviewedAt: null unless reviewed
    auditorReview.reviewedBy: null unless reviewed

Rules:

- Auditor review is required for v1.
- Missing auditor review invalidates the preview.
- This demonstrates the FP-MCP-369A/370 process rule at the first applicable sandbox-phase packet.

## Scope Fields

Required scope fields:

    packetId
    requestId
    targetWorkspaceId
    targetRepositoryPath
    branch
    expectedHeadCommit
    requiresCleanWorkingTree
    purpose

Rules:

- packetId is required.
- targetWorkspaceId is required.
- targetRepositoryPath is required but does not grant mount permission.
- expectedHeadCommit is required.
- requiresCleanWorkingTree must default to true.
- Preview validation must fail if the live repository does not match expected branch, head, or clean state.

## Proposed Command Fields

Required proposedCommand fields:

    argv
    shell
    workingDirectory
    purpose
    allowedCommandClass
    forbiddenCommandClass
    requiresNetwork
    expectedExitCodes
    maxRuntimeSeconds

Rules:

- argv must be preferred over shell strings.
- shell execution must be forbidden by default.
- shell must be null unless a later packet explicitly approves shell form.
- Commands must be classified.
- Commands requiring network are invalid under the default sandbox policy.

Allowed command classes for v1 design:

    READ_ONLY_DIAGNOSTIC
    BUILD_OR_TEST
    STATIC_ANALYSIS
    SCRIPTED_CHECK

## Sandbox Policy Fields

Required sandboxPolicy fields:

    sandboxEngine: bubblewrap
    sandboxEngineVersionObserved
    policyVersion: forgepilot.bubblewrap.policy.v1
    isolationClaim: REDUCED_RISK_NOT_VM_ISOLATION
    requiredCaveat
    disableFurtherUserNamespacesInsideSandbox
    dieWithParent
    newSession
    privateTmp
    privateProc
    privateDev

Required caveat value:

    Bubblewrap reduces blast radius. Bubblewrap shares the host kernel. Bubblewrap does not provide VM-level isolation.

Rules:

- isolationClaim must be REDUCED_RISK_NOT_VM_ISOLATION.
- The required caveat must be present verbatim.
- Missing caveat invalidates the preview.
- Any VM-equivalent isolation claim invalidates the preview.

## Workspace Policy Fields

Required workspacePolicy fields:

    model: COPIED_WORKSPACE_ONLY
    hostSourcePath
    sandboxWorkspacePath: /workspace
    copyExcludes
    realRepositoryWritable: false
    realRepositoryMounted: false
    copyCreatedAtExecutionTime: true
    copyHashRequired: true

Required copy excludes:

    .git
    node_modules
    .env
    .env.*
    secrets
    tmp

Rules:

- Real repository write mount is forbidden.
- Real repository mount is forbidden by default.
- The sandbox may operate only on a copied workspace.
- Copy hash must be recorded by a future execution artifact.

## Mount Policy Fields

Required mountPolicy fields:

    allowedMounts
    forbiddenMounts
    secretsMounted: false
    dockerSocketMounted: false
    hostHomeMounted: false

Allowed mount examples:

    sandbox-copied-workspace -> /workspace, rw
    /usr -> /usr, ro
    /bin -> /bin, ro
    /lib -> /lib, ro

Forbidden mounts:

    /home
    /home/ridasaidd
    /home/ridasaidd/.ssh
    /home/ridasaidd/.config
    /home/ridasaidd/.cache
    /var/run/docker.sock
    /run/user
    /etc/ssh
    /root
    /

Rules:

- Secrets must not be mounted.
- Docker socket must not be mounted.
- Host home must not be mounted.
- Broad root mount invalidates the preview.

## Network Policy Fields

Required networkPolicy fields:

    networkDefault: DISABLED
    networkEnabled: false
    openWorldHint: false
    allowedDomains: []
    allowedEndpoints: []
    requiresSeparateNetworkApproval: true

Rules:

- Network disabled is the default.
- networkEnabled true invalidates v1 preview artifacts unless a future packet defines a network policy.
- openWorldHint must be false when network is disabled.

## Resource Policy Fields

Required resourcePolicy fields:

    timeoutSeconds
    maxStdoutBytes
    maxStderrBytes
    maxCombinedOutputBytes
    maxArtifactBytes
    maxProcesses
    memoryLimitBytes
    cpuLimit
    onLimitExceeded: TERMINATE_AND_RECORD_TRUNCATION

Recommended v1 defaults:

    timeoutSeconds: 120
    maxStdoutBytes: 200000
    maxStderrBytes: 200000
    maxCombinedOutputBytes: 300000
    maxArtifactBytes: 10000000
    maxProcesses: 64

Rules:

- Timeouts are required.
- Output-size limits are required.
- Truncation must be explicit.
- Resource-limit failure is sandbox failure, not evidence failure.

## Output Policy Fields

Required outputPolicy fields:

    captureStdout: true
    captureStderr: true
    truncateOutput: true
    includeTruncationMarkers: true
    redactKnownSecretPatterns: true
    storeRawOutput: false
    storeExcerpt: true

Rules:

- Raw output storage must be false by default.
- Excerpts are allowed.
- Secret redaction must be attempted but must not be treated as a guarantee.

## Artifact Policy Fields

Required artifactPolicy fields:

    futureExecutionResultPath
    exportedArtifactsAllowed
    exportRequiresExplicitPaths
    exportEntireWorkspace: false
    hashExportedArtifacts: true
    recordChangedFilesSummary: true

Rules:

- Exporting the whole workspace is forbidden.
- Exported artifacts require explicit paths.
- Hashing exported artifacts is required.

## Approval Policy Fields

Required approvalPolicy fields:

    previewCreatesApproval: false
    futureExecutionRequiresApproval: true
    approvalMustBindPreviewId: true
    approvalMustBindCommandHash: true
    approvalMustBindPolicyVersion: true
    approvalMustBindExpectedHeadCommit: true
    approvalExpires: true
    approvalSingleUse: true

Rules:

- Preview does not create approval.
- Future execution requires separate approval.
- Approval must bind preview id, command hash, policy version, and expected head commit.
- Approval must be short-lived and single-use.

## Evidence Policy Fields

Required evidencePolicy fields:

    previewIsEvidence: false
    futureSandboxOutputAutoAdmitted: false
    futureSandboxOutputInitialAdmissionState: NOT_EVALUATED
    futureSandboxOutputInitialTrustTier: TIER_0_UNTRUSTED
    requiresSeparateValidation: true
    requiresSeparateAdmissionGate: true

Rules:

- Sandbox output must not be admitted by default.
- Sandbox output begins as not evaluated.
- Sandbox safety and evidence trustworthiness are separate axes.
- A successful sandbox run is not automatically trusted evidence.

## Risk Classification Fields

Required riskClassification fields:

    executionAdjacent: true
    hostMutationRisk: REDUCED_BY_COPY_ONLY_WORKSPACE
    secretExposureRisk: REDUCED_BY_FORBIDDEN_MOUNTS
    networkRisk: DISABLED_BY_DEFAULT
    kernelSharedRisk: PRESENT
    evidenceTrustRisk: NOT_ADMITTED_BY_DEFAULT
    requiresAuditorReview: true

## Non-Execution Boundary Fields

Required nonExecutionBoundary fields:

    previewOnly: true
    commandExecuted: false
    bubblewrapExecuted: false
    shellExecuted: false
    mcpToolImplemented: false
    mcpToolExposed: false
    chatgptSafeExecutionExposure: false
    runnerStartEndpointContacted: false
    opencodeStarted: false
    approvalConsumed: false
    disableSwitchCleared: false
    fp027CanaryRun: false

## Invalid-If Rules

A preview artifact is invalid if any of the following are true:

- bubblewrap described as full isolation
- required bubblewrap caveat missing
- real repository mounted read-write
- real repository mounted by default
- host home mounted
- secrets mounted
- Docker socket mounted
- network enabled without separate network policy
- shell command used without explicit future shell policy
- timeout missing
- output limits missing
- artifact export allows entire workspace
- approval not required for future execution
- approval does not bind preview id
- approval does not bind command hash
- sandbox output auto-admitted as evidence
- auditor review not required

## Future Tool Split

This design implies, but does not implement, a future tool split:

    forgepilot_preview_sandboxed_command
    forgepilot_execute_sandboxed_command
    forgepilot_read_sandboxed_command_result

Only the preview/read-result tools could be candidates for read-only surfaces, and only if they do not execute commands or create unsafe artifacts.

The execute tool must remain gated and must not be ChatGPT-safe.

## Auditor Review Requirement

This design must be reviewed by the auditor before any implementation packet.

FP-MCP-371 is therefore not an implementation approval.

FP-MCP-371 is a draft schema checkpoint.

## Non-Goals

This design does not:

- implement MCP tools
- execute commands
- invoke bubblewrap
- create approvals
- consume approvals
- contact runner start
- start OpenCode
- clear disable switches
- run FP-027 canary
- admit sandbox output as evidence

## Expected Next Step

After auditor review, a later packet may implement a preview artifact writer.

That later packet must still be non-executing unless separately authorized.
