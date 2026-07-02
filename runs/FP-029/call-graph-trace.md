# FP-029 Call-Graph Trace

## Result

```text
DIRECT_PATH_FAILS_CLOSED_WITH_OWN_GATE
```

## Direct live worker path

The live worker tool registration calls the bridge worker module directly.

Observed source:

```text
src/tool-registrations/recent-tools.ts imports startOpenCodeWorker
src/tool-registrations/recent-tools.ts calls startOpenCodeWorker(...)
src/opencode-worker.ts exports startOpenCodeWorker(...)
```

Inside `startOpenCodeWorker`, the first checks are:

```text
approval string
non-empty packetId
assertOpenCodeWorkerStartAllowed()
```

`assertOpenCodeWorkerStartAllowed()` currently fails closed with:

```text
EXECUTION_DISABLED_GLOBAL
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```

## Does the direct path consult general status?

```text
No observed source path.
```

## Does the direct path consult guarded preflight?

```text
No observed source path.
```

## Meaning

The strict-looking general status flags are not what currently protect the direct live worker path.

The direct path is currently protected by the FP-023 hard fail-closed gate.

That is safe, but it is not scoped enablement.

## Remote / preflight path

The guarded preflight function is used by dry-run, evidence-validation, and remote-runner related paths.

Those semantics differ from the general status surface found in FP-028.

## Risk

If future scoped enablement wires one path to status and another to preflight, humans may inspect one surface while runtime decisions use another.
