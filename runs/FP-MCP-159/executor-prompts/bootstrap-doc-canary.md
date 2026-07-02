# FP-MCP-159 Executor Prompt — Documentation Bootstrap Canary

You are executing the first intentionally boring ForgePilot MCP bridge executor bootstrap canary.

Target repository:

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

Allowed change:

```text
create docs/executor-bootstrap-canary.md
```

File content must be short and must state:

```text
This file was created by the first scoped executor bootstrap canary.
It does not change bridge behavior.
It exists to prove executor-driven repository change mechanics under ForgePilot evidence controls.
```

Forbidden changes:

```text
src/**
package.json
pnpm-lock.yaml
configuration files
systemd files
scripts
tests
runtime behavior
tool schemas
OAuth/Auth0 behavior
worker start/stop behavior
runner behavior
```

Do not run FP-027.
Do not implement FP-030.
Do not retry FP-024.
Do not refactor server.ts.
Do not start extra workers.

After editing, report the changed file list and stop.
