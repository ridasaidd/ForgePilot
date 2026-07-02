# FP-MCP-174 — OpenCode Readiness Predicate Normalization

## Task

Fix the guarded preflight OpenCode readiness predicate so it recognizes the configured discovery field produced by `getOpenCodeStatus()`.

This packet is a narrow readiness-label correction. It must not enable execution, contact the runner start endpoint, start OpenCode, consume approval, mutate request artifacts, or retry the canary.

## Source Finding

FP-MCP-173 found:

```text
getOpenCodeStatus returns: opencodeDiscoveryConfigured: true
guarded preflight checks: opencodeHarnessConfigured | opencodeConfigured | opencodeAvailable
guarded preflight does not check: opencodeDiscoveryConfigured
```

`opencodeDiscoveryConfigured` was a produced but orphaned field.

FP-MCP-174 explicitly wires that previously-orphaned field into the guarded preflight configured-status predicate.

## Caution

Wiring an existing field into a live decision path creates a new consumer and must be treated as a behavior change.

This fix must preserve these distinctions:

```text
configured/discovery status is not live OpenCode readiness
liveOpenCodeChecked: false remains false unless a live liveness probe actually runs
opencodeExecutionEnabled: false remains an independent blocker
OpenCode live instance reachable: not proven by this packet
```

## Required Behavior

After the fix:

1. Guarded preflight must recognize `opencodeDiscoveryConfigured: true` as configured/discovery status.
2. `OPENCODE_NOT_CONFIGURED` must not appear solely because guarded preflight ignored `opencodeDiscoveryConfigured`.
3. `opencodeReadiness` must still fail while `opencodeExecutionEnabled === false`.
4. The failure reason must remain `OPENCODE_EXECUTION_DISABLED` when execution is disabled.
5. The report must preserve `liveOpenCodeChecked: false` where applicable.
6. The fix must not imply live OpenCode is reachable or functional.
7. The fix must not enable execution or contact any runner start endpoint.

## Bootstrap Exception

FP-MCP-174 authorizes one narrow ChatGPT direct-source implementation exception limited to:

```text
normalizing the OpenCode configured/discovery readiness predicate
adding source/build verification
recording artifacts and V1-O evidence
```

It does not authorize:

```text
execution enablement
runner start endpoint contact
OpenCode start
canary retry
approval consumption
request artifact mutation
liveness probe implementation unless separately packeted
```

The exception terminates when:

```text
OPENCODE_READINESS_PREDICATE_SOURCE_VERIFIED_LABEL_NORMALIZED_EXECUTION_STILL_DISABLED
```

is recorded.

## Follow-up Requirement

After this packet, the next honest step before a third canary attempt is a safe liveness-only OpenCode probe if such a probe exists, or a packet to define one if it does not.

Expected follow-up:

```text
FP-MCP-175: OpenCode liveness-only probe definition or confirmation
```

## Expected Result

```text
OPENCODE_READINESS_PREDICATE_SOURCE_VERIFIED_LABEL_NORMALIZED_EXECUTION_STILL_DISABLED
```
