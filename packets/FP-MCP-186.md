# FP-MCP-186 — Post-Refresh Live Confirmation of FP-MCP-184 Disabled-Reason Normalization

## Task

After MCP service restart and action refresh, live-confirm that the running `validate_execution_preflight` surface no longer emits the legacy aggregate `EXECUTION_DISABLED` reason for runner/OpenCode-disabled state.

## Context

FP-MCP-184 source-normalized `validateExecutionPreflight` to emit precise disabled reasons instead of the legacy aggregate reason.

FP-MCP-185 attempted live confirmation before the service refresh and correctly recorded a stale-runtime observation because the live surface still emitted:

```text
EXECUTION_DISABLED
```

The MCP service was then restarted and actions were refreshed. This packet records the post-refresh live confirmation.

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

The response included the normalized precise reasons:

```text
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
```

The response did not include the legacy aggregate reason:

```text
EXECUTION_DISABLED
```

Therefore FP-MCP-184 disabled-reason normalization is live-confirmed on the refreshed MCP service surface.

## Actual Result

```text
VALIDATE_EXECUTION_PREFLIGHT_DISABLED_REASON_NORMALIZATION_LIVE_CONFIRMED_NO_LEGACY_EXECUTION_DISABLED
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

The runner capabilities/validation surface may be contacted by validation, but the runner start endpoint was not contacted and OpenCode was not started.

## Next Required Work

FP-MCP-183 canary enablement remains a separate deliberate decision boundary. A fresh tuple is still required before any consuming action can be authorized.
