# FP-MCP-142 — MCP v1 OpenCode Launch Observation

## Outcome

The runner accepted the simplified MCP v1 start request and spawned OpenCode, but OpenCode exited immediately.

## Runner Result

```text
accepted: true
executionStarted: true
opencodeStarted: true
runnerRunId: RUN-20260701T104040288Z-15e213b9
```

## OpenCode stderr

```text
Error: Session not found
```

## Interpretation

The runner successfully reached process launch. The failure is the OpenCode command shape, not runner authorization.

The likely incorrect part is:

```text
opencode run --attach http://127.0.0.1:4096
```

For MCP v1, the next retry should use direct `opencode run` without `--attach`, unless OpenCode help indicates a different correct attach/session form.
