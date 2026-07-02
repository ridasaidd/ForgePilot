# FP-MCP-159 — Executor Bootstrap Documentation Canary

## Task

Run the first deliberately boring executor-driven MCP bridge repository change.

## Goal

Prove that a scoped executor can land one harmless bridge documentation change before FP-030 implementation.

## Allowed Change

Create exactly one file in the bridge repository:

```text
docs/executor-bootstrap-canary.md
```

The file must state that it is a documentation-only executor bootstrap canary and does not change bridge behavior.

## Forbidden Changes

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

## Scope

```text
workspace: forgepilot-chatgpt-mcp
branch: feature/oauth-auth0
model: deepseek-v4-pro-high
runMode: DESIGN_ONLY
single worker only
no source edits
no behavior changes
no service restart
```

## Acceptance Criteria

1. Executor starts only through approved scoped path.
2. Bridge tree is clean before start.
3. Exactly one documentation file is added.
4. No source files change.
5. No tool contracts change.
6. Executor stops cleanly or is controllable.
7. Bridge tree is clean after evidence capture.
8. Execution is disabled again afterward.
9. V1-O records the attempt.

## Non-Goals

FP-MCP-159 does not implement FP-030, run FP-027, retry FP-024, refactor server.ts, or change bridge runtime behavior.
