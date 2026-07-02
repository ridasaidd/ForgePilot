# FP-MCP-173 Result Summary

## Result

```text
OPENCODE_NOT_CONFIGURED_CLASSIFIED_AS_READINESS_LABEL_FALSE_NEGATIVE_NO_FALSE_OPEN_CONSUMER_FOUND
```

## Core finding

`OPENCODE_NOT_CONFIGURED` was a misleading readiness label caused by a field-name mismatch.

```text
getOpenCodeStatus returns: opencodeDiscoveryConfigured: true
guarded preflight checks: opencodeHarnessConfigured | opencodeConfigured | opencodeAvailable
guarded preflight does not check: opencodeDiscoveryConfigured
```

## What this proves

```text
remote runner configured: true
remote runner reachable: true
start endpoint state: CALLABLE_GUARDED
OpenCode discovery configured: true
OpenCode execution enabled: false
live OpenCode checked: false
```

## What this does not prove

```text
OpenCode live instance reachable: NOT PROVEN
OpenCode live instance functional: NOT PROVEN
endpoint URL missing: NOT PROVEN
credentials missing: NOT PROVEN
service not running: NOT PROVEN
```

## False-open audit

No false-open consumer was found for the configured-field mismatch.

The mismatch currently fails closed because `opencodeExecutionEnabled` remains independently false.

## Classification

```text
readiness label false negative
not infrastructure absence proof
not live OpenCode proof
remote runner reachable
execution still disabled
canary not retried
```

## Next required work

```text
FP-MCP-174: OpenCode readiness predicate normalization/fix
```

The fix must preserve `liveOpenCodeChecked: false` as distinct from readiness labeling and must not imply OpenCode is live until that is separately checked.
