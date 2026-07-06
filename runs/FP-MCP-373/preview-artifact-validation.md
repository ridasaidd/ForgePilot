# FP-MCP-373 Sandbox Preview Artifact Validation

**Preview ID:** PREVIEW-20260706T083445Z-a2a3ac3e
**Artifact Path:** runs/FP-MCP-373/sandbox-preview/PREVIEW-20260706T083445Z-a2a3ac3e.json
**Artifact SHA-256:** c0f67c844032743c5de58c83ab751afed089096d47fecd8d5e5b4c97cba1e370
**Proposed Command argv:** ["pwd"]
**Proposed Command executed:** false

## Validation Results

Total: 46 | Passed: 46 | Failed: 0

- PASS: Preview artifact created successfully
- PASS: Result status is AUDITOR_REVIEW_REQUIRED
- PASS: Result nonExecutionBoundary.commandExecuted is false
- PASS: Result nonExecutionBoundary.bubblewrapExecuted is false
- PASS: 1: Preview artifact exists
- PASS: 2: Preview artifact is valid JSON
- PASS: 3: schemaVersion is forgepilot.sandboxPreview.v1
- PASS: 4: status is AUDITOR_REVIEW_REQUIRED
- PASS: 5: auditorReview.required is true
- PASS: 6: auditorReview.reviewState is PENDING
- PASS: 7: proposedCommand.argv equals ["pwd"]
- PASS: 8: proposedCommand.shell is null
- PASS: 9: proposedCommand.requiresNetwork is false
- PASS: 10: networkPolicy.networkEnabled is false
- PASS: 11: networkPolicy.openWorldHint is false
- PASS: 12: sandboxPolicy.sandboxEngine is bubblewrap
- PASS: 13: sandboxPolicy.isolationClaim is REDUCED_RISK_NOT_VM_ISOLATION
- PASS: 14: sandboxPolicy.requiredCaveat exact match
- PASS: 15: workspacePolicy.model is COPIED_WORKSPACE_ONLY
- PASS: 16: workspacePolicy.realRepositoryWritable is false
- PASS: 17: workspacePolicy.realRepositoryMounted is false
- PASS: 18: mountPolicy.secretsMounted is false
- PASS: 19: mountPolicy.dockerSocketMounted is false
- PASS: 20: mountPolicy.hostHomeMounted is false
- PASS: 21: outputPolicy.redactKnownSecretPatterns is true
- PASS: 22: outputPolicy.onRedactionFailureDiscovered is MANUAL_INCIDENT_REVIEW_REQUIRED
- PASS: 23: outputPolicy.storeRawOutput is false
- PASS: 24: evidencePolicy.previewIsEvidence is false
- PASS: 25: evidencePolicy.futureSandboxOutputAutoAdmitted is false
- PASS: 26: evidencePolicy.futureSandboxOutputInitialAdmissionState is NOT_EVALUATED
- PASS: 27: evidencePolicy.futureSandboxOutputInitialTrustTier is TIER_0_UNTRUSTED
- PASS: 28: nonExecutionBoundary.previewOnly is true
- PASS: 29: nonExecutionBoundary.commandExecuted is false
- PASS: 30: nonExecutionBoundary.bubblewrapExecuted is false
- PASS: 31: nonExecutionBoundary.shellExecuted is false
- PASS: 32: nonExecutionBoundary.runnerStartEndpointContacted is false
- PASS: 33: nonExecutionBoundary.opencodeStarted is false
- PASS: 34: nonExecutionBoundary.approvalConsumed is false
- PASS: 35: nonExecutionBoundary.disableSwitchCleared is false
- PASS: 36: nonExecutionBoundary.fp027CanaryRun is false
- PASS: 37: redaction-failure invalidation rule covered (redactKnownSecretPatterns=true, onRedactionFailureDiscovered=MANUAL_INCIDENT_REVIEW_REQUIRED)
- PASS: 38: sandbox-output-auto-admitted invalidation rule covered (futureSandboxOutputAutoAdmitted=false)
- PASS: 39: Artifact hash recorded (SHA-256, 64 hex chars)
- PASS: 40a: No stdout field (command not executed)
- PASS: 40b: No stderr field (command not executed)
- PASS: 40c: No exitCode field (command not executed)

## Non-Execution Boundary

| Field | Value |
|-------|-------|
| execution authorized | false |
| command executed | false |
| bubblewrap executed | false |
| shell executed | false |
| approval consumed | false |
| disable switch cleared | false |
| runner start endpoint contacted | false |
| OpenCode started | false |
| FP-027 canary run | false |
| preview only | true |
