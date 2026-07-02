# FP-MCP-172 Result Summary

## Result

```text
FP_027_CANARY_RESTART_HALTED_BY_GUARDED_PREFLIGHT_BEFORE_RUNNER_CONTACT
```

## What happened

The canary sequence was restarted from a fresh packet and fresh request artifact to avoid mutating previously admitted FP-MCP-159 evidence.

Fresh request:

```text
packetId: FP-MCP-172
requestId: REQ-20260702T184723318Z-b14aff46
modelId: deepseek-v4-pro-high
runMode: DESIGN_ONLY
repoCommit: 8eaadfd
```

Fresh approval:

```text
approvalId: APPROVAL-20260702T184751507Z-04fefaa6
```

## Lingering-state check

```text
old request: REQ-20260702T143631238Z-4e3b750e
old request sha256: bf251b29b2294963e54e6c075656d32cc0142c92a10a49cb80a4d7c2391ed3e9
real partial state found: false
approval consumed by premature call: false
runner contacted by premature call: false
runner run id created by premature call: false
```

## Prepared gates

```text
requestArtifact: PASSED
commitBinding: PASSED
modelAndRunMode: PASSED
humanApprovalEvidence: PASSED
preStartEvidence: PASSED
stateSnapshotEvidence: PASSED
evidenceLedgerReadiness: PASSED
```

## Blocking gates

```text
disableSwitch: FAILED
runnerCapabilityState: FAILED
opencodeReadiness: FAILED
```

Reasons:

```text
EXECUTION_DISABLED_GLOBAL
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
START_REQUEST_BLOCKED_BY_DISABLE_SWITCH
OPENCODE_NOT_CONFIGURED
UNEXPECTED_SUPPORTED_OPERATION
```

## Disposition

```text
runner_contact_attempted: false
start_tool_invoked: false
canary_worker_started: false
abort_readiness_check_needed: false
retry_attempted: false
```

The canary did not contact the runner. It halted correctly at guarded preflight.
