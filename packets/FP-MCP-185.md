# FP-MCP-185 — Live Confirmation of FP-MCP-184 Disabled-Reason Normalization

## Task

After MCP service refresh, live-confirm whether the running `validate_execution_preflight` surface no longer emits the legacy aggregate `EXECUTION_DISABLED` reason for runner/OpenCode-disabled state.

## Expected Live-Confirmed Result

```text
VALIDATE_EXECUTION_PREFLIGHT_DISABLED_REASON_NORMALIZATION_LIVE_CONFIRMED_NO_LEGACY_EXECUTION_DISABLED
```

## Boundary

This packet does not authorize FP-MCP-183 enablement.

It must not create a fresh FP-MCP-183 tuple, consume approval evidence, contact the runner start endpoint, start OpenCode, run the FP-027 canary, or authorize execution.

Allowed work is limited to non-executing preflight observation, source/repo verification, artifact recording, and canonical admission of the observation that actually occurred.

## Live Observation

The running `validate_execution_preflight` surface was checked against the existing non-started FP-MCP-182 request artifact:

```text
requestId: REQ-20260702T210007524Z-4ba16774
requestPath: runs/FP-MCP-182/opencode-requests/REQ-20260702T210007524Z-4ba16774.json
```

The response still included the legacy aggregate reason:

```text
EXECUTION_DISABLED
```

The response also included the normalized precise reasons:

```text
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
```

Therefore FP-MCP-184 is not live-confirmed by this run. The observed runtime state is stale or not yet refreshed into the MCP service surface.

## Actual Result

```text
VALIDATE_EXECUTION_PREFLIGHT_DISABLED_REASON_NORMALIZATION_NOT_PROVEN_RUNTIME_STILL_EMITS_LEGACY_EXECUTION_DISABLED
```

## Safety Observation

The preflight remained non-executing:

```text
executionPermitted: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
approvalConsumed: false
```

The runner start endpoint was not contacted and OpenCode was not started.

## Next Required Work

Refresh/restart the MCP service so bridge commit `9e01c73` is loaded, then repeat this live confirmation. Do not proceed to FP-MCP-183 canary enablement until the live `validate_execution_preflight` surface no longer emits the legacy aggregate `EXECUTION_DISABLED` reason for runner/OpenCode-disabled state.
