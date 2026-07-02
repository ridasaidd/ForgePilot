# FP-MCP-168 Live Fault-Injection Confirmation

## Result

```text
CONSUMING_CLEARANCE_DRY_RUN_FAULT_INJECTION_LIVE_CONFIRMED_NO_RUNNER_CONTACT
```

## Bridge commit under test

```text
d2ecadc Add consuming clearance dry-run tool
```

## Runtime call

```text
forgepilot_dry_run_consuming_scoped_clearance
```

Tuple:

```text
packetId: FP-MCP-159
requestId: REQ-20260702T143631238Z-4e3b750e
approvalId: APPROVAL-20260702T181446995Z-26a9d4b7
attemptId: ATTEMPT-20260702T181500000Z-5e6f7a8b
faultInjectionMode: SIMULATE_INTERRUPTION_BEFORE_STUBBED_CONTACT_RESULT
```

## Live result

```text
scopedClearanceEligible: true
consumptionWouldBeAllowed: true
dryRunConsumptionArtifactRecorded: true
dryRunContactOutcomeArtifactRecorded: false
reconstructedAttemptState: CONSUMED_PENDING_RUNNER_CONTACT_STALE
simulatedInterruptionBeforeContactOutcome: true
simulatedAfterContactDeadline: true
```

## Artifact proof

```text
consumption artifact path: runs/FP-MCP-159/consuming-clearance-dry-runs/DRYRUN-20260702T181506743Z-5ff4bf7c/consumption.json
consumption artifact sha256: 0a71bbc059d8b1ae23134f9a59dc4015ffb66159a32ae902566b40f70ad232c5
outcome artifact: ABSENT
hash matches actual file: true
```

## Boundary preserved

```text
realApprovalConsumed: false
approvalConsumed: false
runnerStartEndpointContacted: false
startEndpointContacted: false
opencodeStarted: false
executionPermitted: false
runnerRunIdCreated: false
requestArtifactMutated: false
```

## Interpretation

The dry-run state machine successfully rehearsed the crash-window state:

```text
CONSUMED_PENDING_RUNNER_CONTACT_STALE
```

without contacting the runner or consuming the real approval.
