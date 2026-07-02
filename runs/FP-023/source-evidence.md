# FP-023 Source Evidence

## Bridge commit

```text
3cd682c Block OpenCode worker start when execution is disabled
```

## Changed behavior

`src/opencode-worker.ts` now defines:

```text
OpenCodeWorkerStartBlockedError
getOpenCodeWorkerStartGateReasons()
assertOpenCodeWorkerStartAllowed()
```

and `startOpenCodeWorker(...)` calls:

```text
assertOpenCodeWorkerStartAllowed();
```

before worker id allocation and before `spawn(OPENCODE_BIN, ...)`.

## Required reasons

```text
EXECUTION_DISABLED_GLOBAL
OPENCODE_EXECUTION_DISABLED
DISABLE_SWITCH_ACTIVE
EXECUTION_NOT_ALLOWED
```
