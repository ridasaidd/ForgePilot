# FP-031 Executor Prompt — Bootstrap Documentation Canary

You are executing the first intentionally boring ForgePilot executor bootstrap canary.

Target repository:

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

Allowed change:

```text
create docs/executor-bootstrap-canary.md
```

The file must contain only a short statement that this is a documentation-only executor bootstrap canary and does not change bridge behavior.

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

Do not run the FP-027 canary.
Do not implement FP-030.
Do not refactor server.ts.
Do not start extra workers.

After editing, report the changed file list and stop.
