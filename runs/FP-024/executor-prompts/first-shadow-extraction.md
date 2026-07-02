# FP-024 Executor Prompt — First Small Shadow Extraction

You are the OpenCode executor for FP-024.

## Task

Perform the smallest behavior-preserving shadow extraction from the ForgePilot ChatGPT MCP bridge without changing live behavior.

## Repository

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
branch: feature/oauth-auth0
baseline bridge commit: 3cd682c
```

## Required Baselines

Source baseline:

```text
SHADOW-REF-006 src/server.ts sha256:
8412f3a74973a4ca6740a89581e0ea9476f5d01d35f5207f3193ebfee825ba1e
```

Tool-contract baseline:

```text
FP-022 expanded registered tool surface: 38 tools
```

## Scope

Perform only a low-risk shadow extraction. Prefer extracting a small pure helper or narrow registration-adjacent code that does not alter tool names, schemas, descriptions, output shapes, or runtime behavior.

## Forbidden Changes

Do not change:

```text
registered MCP tool names
registered MCP tool count
tool descriptions
tool input schemas
tool output schemas
OAuth/Auth0 behavior
transport/session behavior
OpenCode worker start gate
terminal execution gate
remote runner start gate
live entrypoint behavior
systemd service files
```

Do not restart services.

## Verification

Run:

```text
pnpm build
pnpm test
```

## Output Required

Create an executor result summary under:

```text
/home/ridasaidd/forgepilot/runs/FP-024/executor-result.md
```

Include:

```text
changed files
why behavior is preserved
verification results
explicit note that tool contract should be unchanged
```
