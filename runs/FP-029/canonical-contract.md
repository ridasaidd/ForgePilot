# FP-029 Canonical Contract

## Result

```text
CANONICAL_CONTRACT_DEFINED_IMPLEMENTATION_PENDING
```

## Core rule

There must be one canonical decision object.

The human-facing report and the live path must read the same object.

## Required fields

```text
scopeValid
packetAuthorized
requestArtifactValid
approvalRecorded
approvalValidated
approvalUsable
approvalConsumedForAttempt
windowValid
disableClearForScope
opencodeBoundaryForScope
secretBoundaryForScope
networkBoundaryForScope
controlReady
processTreePlanPresent
repoStateValid
requiredArtifactsCommitted
allowedNow
blockingReasons
```

## Completeness rule

Completeness must not mean file existence only.

It must require committed packet-specific constraints for packet, workspace, branch, commit, model, mode, prompt, single-worker limit, fresh approval, and process-tree verification.

## Approval rule

Recorded, validated, usable, and consumed are separate claims.

A recorded approval is not enough.

## Boundary rule

The FP-027 canary must define exact boundaries for OpenCode scope, secret exposure, and network exposure.

Runner endpoint configured is not enough by itself.

## Implementation boundary

A later packet must implement the canonical object and wire every relevant path to it.
