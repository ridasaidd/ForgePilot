# FP-MCP-246 — OpenCode HTTP Minimal Session Canary

## Checkpoint Type

```text
SESSION_LIFECYCLE_CANARY_RESULT
```

## Summary

The FP-MCP-246 minimal OpenCode HTTP session lifecycle canary ran successfully with cleanup enabled. It created one titled OpenCode session, observed /session/status before and after creation, read /session/{sessionID}, deleted only the created canary session, and observed /session/status after deletion. The canary returned sessionCreated=true, sessionDeleted=true, createHttpStatus=200, detailHttpStatus=200, deleteHttpStatus=200. It also confirmed promptSubmitted=false, messageEndpointCalled=false, waitEndpointCalled=false, runnerStartEndpointContacted=false, and opencodeStarted=false. The created session detail shape exposed top-level keys: cost, directory, id, path, projectID, slug, time, title, tokens, version. A key observation is that /session/status remained an empty object throughout: beforeSessionLikeEntryCount=0, afterCreateSessionLikeEntryCount=0, afterDeleteSessionLikeEntryCount=0, and sessionIdPresentAfterCreate=false. This suggests /session/status does not list idle/newly-created sessions and should not be treated as the only session-existence source.

## Claim

```text
FP_MCP_246_OPENCODE_HTTP_MINIMAL_SESSION_CANARY_SUCCEEDED_WITH_EMPTY_STATUS_MAP
```

## Caveats

- The canary mutated OpenCode session state by creating and then deleting one canary session; it did not mutate ForgePilot execution state.
- The session id was visible from POST /session and GET /session/{sessionID}, but it was not visible in /session/status after creation.
- The empty /session/status map after session creation means status likely tracks active/busy session execution state rather than all sessions; this requires further verification before using it as a completion source.
- No OpenCode prompt was submitted and no model call occurred.

## Boundaries

- No OpenCode prompt was submitted.
- No OpenCode message endpoint was called.
- No OpenCode wait endpoint was called.
- No ForgePilot runner start endpoint was contacted.
- No OpenCode process was started by this canary.
- No execution approval was created, consumed, or authorized.
- No local execution clearance was created.
- Only the canary-created session was deleted.

## Non-Execution Boundary

```text
execution authorized: false
approval consumed: false
disable switch cleared: false
runner start endpoint contacted: false
OpenCode started: false
FP-027 canary run: false
```

## Expected Result

```text
FP_MCP_246_OPENCODE_HTTP_MINIMAL_SESSION_CANARY_SUCCEEDED_WITH_EMPTY_STATUS_MAP
```
