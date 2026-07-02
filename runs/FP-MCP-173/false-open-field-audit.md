# FP-MCP-173 False-Open Field Audit

## Scope

Checked these OpenCode readiness field names in `src/server.ts`:

```text
opencodeDiscoveryConfigured
opencodeHarnessConfigured
opencodeConfigured
opencodeAvailable
```

## Findings

```text
opencodeDiscoveryConfigured:
  line 187 schema
  line 1312 producer
  no consumer found

opencodeHarnessConfigured:
  line 206 schema
  line 1337 producer
  line 8958 guarded preflight configured predicate

opencodeConfigured:
  line 8957 guarded preflight local predicate
  line 8959 guarded preflight configured predicate
  line 8964 guarded preflight readiness conjunction
  line 9192 guarded preflight OPENCODE_NOT_CONFIGURED reason
  line 9306 guarded preflight report field

opencodeAvailable:
  line 8960 guarded preflight configured predicate
```

## False-open assessment

No false-open consumer was found for this configured-field mismatch.

The observed failure mode is false-closed:

```text
opencodeDiscoveryConfigured is true, but guarded preflight does not read it, so configured discovery is mislabeled as OPENCODE_NOT_CONFIGURED.
```

The readiness pass condition still also requires:

```text
opencodeExecutionEnabled === true
```

That value remains false, so this mismatch did not create a permissive execution path.

## Important boundary

This audit does not prove live OpenCode is reachable or functional.

It proves only that the `OPENCODE_NOT_CONFIGURED` label was produced by a field-name mismatch, and that no false-open consumer of this mismatch was found in the checked source.
