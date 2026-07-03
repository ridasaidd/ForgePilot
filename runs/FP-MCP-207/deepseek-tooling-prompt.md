# FP-MCP-207 DeepSeek/OpenCode Tooling Prompt

You are implementing FP-MCP-207 in the MCP bridge repository.

## Workspace

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

## Starting point

Start from bridge branch:

```text
feature/oauth-auth0
```

Expected latest bridge commit:

```text
085589d Fix checkpoint pnpm command resolution
```

Before editing, verify:

```sh
git status --short
git log --oneline -5
pnpm build
```

If the working tree is dirty before you start, stop and report it.

## Context

FP-MCP-201 through FP-MCP-205 exposed a runtime diagnostics tool gap:

- The checkpoint tool initially failed with `spawn pnpm ENOENT`.
- The tool was fixed to support `FORGEPILOT_PNPM_BIN` and fail closed.
- The next retest still returned `PNPM_COMMAND_NOT_FOUND`.
- Terminal debugging showed the running service had `FORGEPILOT_PNPM_BIN`, but the configured `pnpm` shim uses `#!/usr/bin/env node`.
- Adding the Node/NVM bin directory to service `PATH` fixed the issue.

FP-MCP-206 exposed a second tool gap:

- Gate orientation required manually calling multiple read-only tools:
  - capabilities
  - opencode status
  - remote runner status
  - disable switch status
  - execution enablement status
- The result then had to be summarized manually.

## Task

Implement two new read-only typed MCP tools:

```text
forgepilot_get_mcp_runtime_diagnostics
forgepilot_get_execution_gate_orientation
```

Both tools must be read-only and must not mutate files, database, approvals, requests, workers, or execution state.

## Tool 1: forgepilot_get_mcp_runtime_diagnostics

Purpose:

Report a bounded, non-secret view of the MCP bridge runtime environment needed to diagnose service-vs-terminal mismatches.

The tool should return structured fields such as:

```ts
{
  checkedAt: string,
  process: {
    pid: number,
    cwd: string,
    nodeExecPath: string,
    nodeVersion: string,
    platform: string,
    arch: string
  },
  configuredBinaries: {
    forgepilotPnpmBin: string | null,
    forgepilotOpencodeBin: string | null
  },
  pathDiagnostics: {
    pathPresent: boolean,
    pathEntriesCount: number,
    nodeBinDirOnPath: boolean,
    configuredPnpmDirOnPath: boolean | null,
    configuredOpencodeDirOnPath: boolean | null
  },
  commandChecks: {
    node: CommandCheck,
    pnpmLiteral: CommandCheck,
    pnpmConfigured: CommandCheck | null,
    opencodeLiteral?: CommandCheck,
    opencodeConfigured?: CommandCheck | null
  },
  shimDiagnostics: {
    pnpmConfiguredShebang: string | null,
    pnpmConfiguredUsesEnvNode: boolean | null
  },
  boundary: {
    readOnly: true,
    secretsDumped: false,
    executionAuthorized: false,
    approvalConsumed: false,
    disableSwitchCleared: false,
    runnerStartEndpointContacted: false,
    opencodeStarted: false,
    fp027CanaryRun: false
  },
  reasons: string[]
}
```

`CommandCheck` should include safe bounded observations only:

```ts
{
  configured: boolean,
  command: string,
  available: boolean,
  exitCode: number | null,
  timedOut: boolean,
  stdoutFirstLine?: string,
  stderrFirstLine?: string,
  errorCode?: string,
  reason?: string
}
```

Safety rules:

- Do not dump full `process.env`.
- Do not print tokens, secrets, Authorization headers, API keys, cookies, or raw env wholesale.
- It is acceptable to report presence/value of explicitly allowlisted non-secret vars:
  - `FORGEPILOT_PNPM_BIN`
  - `FORGEPILOT_OPENCODE_BIN`
- For `PATH`, do not dump the full raw string by default. Report booleans/counts and whether required directories are present.
- If you include path entries, include only sanitized entries and avoid anything secret-like. Prefer not to include full PATH unless already part of explicit tool contract.
- Command checks may run only version/help commands and must not start OpenCode jobs:
  - `node --version`
  - `pnpm --version`
  - configured pnpm `--version`
  - optionally opencode version/status command only if known safe and non-starting; otherwise omit or mark unchecked.
- Use timeouts.
- All errors must be returned as structured observations, not thrown unless the tool itself cannot initialize.

Reason codes to consider:

```text
PATH_MISSING
CONFIGURED_PNPM_BIN_MISSING
CONFIGURED_PNPM_BIN_NOT_EXECUTABLE
CONFIGURED_PNPM_BIN_USES_ENV_NODE
NODE_BIN_DIR_NOT_ON_PATH
CONFIGURED_PNPM_DIR_NOT_ON_PATH
PNPM_LITERAL_NOT_FOUND
PNPM_CONFIGURED_CHECK_FAILED
OPENCODE_CHECK_SKIPPED
```

## Tool 2: forgepilot_get_execution_gate_orientation

Purpose:

Aggregate the existing read-only gate orientation calls into one typed tool so GPT does not manually call and summarize multiple tools each time.

Inputs:

```ts
{
  packetId?: string,
  requestId?: string,
  approvalId?: string,
  modelId?: string,
  runMode?: string
}
```

Suggested output:

```ts
{
  checkedAt: string,
  packetId?: string,
  requestId?: string,
  approvalId?: string,
  modelId?: string,
  runMode?: string,
  summary: {
    runnerReachable: boolean,
    runnerStartCapabilityCallable: boolean,
    executionAllowedNow: boolean,
    globalDisableActive: boolean,
    runnerExecutionEnabled: boolean,
    opencodeExecutionEnabled: boolean,
    humanApprovalPresent: boolean | null,
    requestArtifactPresent: boolean | null,
    preflightPassableNow: boolean | null
  },
  components: {
    opencodeCapabilities: object,
    opencodeStatus: object,
    remoteRunnerStatus: object,
    disableSwitchStatus: object,
    executionEnablementStatus: object,
    requestArtifact?: object | null,
    guardedStartPreflight?: object | null
  },
  blockingReasons: string[],
  nextRequiredActions: string[],
  boundary: {
    readOnly: true,
    executionAuthorized: false,
    approvalConsumed: false,
    disableSwitchCleared: false,
    runnerStartEndpointContacted: false,
    opencodeStarted: false,
    fp027CanaryRun: false,
    requestArtifactCreated: false,
    approvalArtifactCreated: false
  }
}
```

Implementation guidance:

- Reuse existing internal functions if available; do not duplicate large logic unnecessarily.
- If existing tools are only registered inline in `src/server.ts`, extract shared read-only helpers where practical.
- If extracting is too broad, implement a conservative aggregator using the same underlying modules/functions already used by the registered tools.
- The tool must not contact the runner start endpoint.
- It may contact only the runner capabilities endpoint if the existing `forgepilot_get_remote_runner_status` path already does so.
- It must not create request artifacts or approvals.
- If `requestId` is provided, it may read the request artifact and preflight report using existing read-only logic.
- If no request is provided, request/preflight fields should be null/unchecked, not fabricated.

Reason/next action examples:

```text
GLOBAL_DISABLE_ACTIVE
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
HUMAN_APPROVAL_NOT_RECORDED
REQUEST_ARTIFACT_NOT_PROVIDED
REQUEST_ARTIFACT_NOT_FOUND
PREFLIGHT_NOT_EVALUATED
FRESH_REQUEST_REQUIRED
FRESH_APPROVAL_REQUIRED
DISABLE_SWITCH_CLEARANCE_REQUIRED
```

## Deferred tool gap

Do not implement a safe request-path orchestration tool in this packet.

You may add a TODO note or brief design note if helpful, but do not create a write-path tool that creates packets, request artifacts, approvals, or starts anything.

## Required non-execution boundary

This implementation must never:

```text
authorize execution
consume approval
clear disable switch
contact runner start endpoint
start OpenCode
run FP-027 or any canary
create request artifacts
create approval artifacts
change approval semantics
change disable-switch semantics
change request-artifact semantics
broaden terminal-command authority
perform broad unrelated refactors
```

## Validation requirements

Run:

```sh
pnpm build
```

If there are tests available and relevant, run the narrow relevant tests. Do not introduce a large unrelated test framework.

Do not live-test execution gates with start/approval/consumption tools.

Read-only live validation is acceptable:

```text
call/compile the runtime diagnostics helper if locally easy
call/compile the gate orientation helper if locally easy
```

But do not start OpenCode, contact start endpoint, consume approval, clear disable switch, or run FP-027.

## Expected changed files

Likely:

```text
src/server.ts
```

Maybe:

```text
src/runtime-diagnostics.ts
src/execution-gate-orientation.ts
```

Prefer extracting dedicated modules rather than making `src/server.ts` much larger.

## Expected output report

When complete, report:

```text
changed files
bridge commit
build command and result
new tools added
runtime diagnostics fields implemented
gate orientation fields implemented
whether any helper extraction was done
explicit non-execution boundary confirmation
caveats
```

## Success result string

```text
FP_MCP_207_RUNTIME_DIAGNOSTICS_AND_GATE_ORIENTATION_TOOLS_IMPLEMENTED
```

## Stop conditions

Stop and report without further modification if:

```text
working tree is dirty before start
implementation requires write-path orchestration
implementation requires changing execution/approval/disable/start semantics
implementation requires broad unrelated refactor
build fails and fix is not clearly within scope
```
