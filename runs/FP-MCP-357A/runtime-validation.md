# FP-MCP-357A Runtime Validation Evidence

## Result

Runtime validation passed after FP-MCP-357.

## Source Extraction

FP-MCP-357 extracted the first inline registration block from src/server.ts into src/tool-groups/inline-before-phase1-list-tools.ts.

Source-level checks preserved:

- registeredToolCount: 78
- contractCount: 78
- defaultVisibleCount: 11
- chatgptSafeVisibleCount: 11
- devVisibleCount: 76
- allVisibleCount: 78
- duplicateRegisteredTools: []
- missingContracts: []
- extraContracts: []
- typecheck: PASS
- hardcoded packet-id lint: PASS
- git diff --check: PASS

## Runtime Diagnostics

Connector-side diagnostics after service restart observed:

- checkedAt: 2026-07-05T14:24:23.950Z
- pid: 864325
- cwd: /home/ridasaidd/forgepilot-chatgpt-mcp
- nodeVersion: v24.4.1
- platform: linux
- arch: arm64
- readOnly: true
- secretsDumped: false
- executionAuthorized: false
- approvalConsumed: false
- disableSwitchCleared: false
- runnerStartEndpointContacted: false
- opencodeStarted: false
- fp027CanaryRun: false

## Command Checks From Runtime Diagnostics

- node available: true
- node stdoutFirstLine: v24.4.1
- pnpm available: true
- pnpm stdoutFirstLine: 11.5.2
- opencode check skipped: OPENCODE_CHECK_SKIPPED

## Core Status

- branch: main
- commit: 11caa9b
- working tree clean: true

## Boundary

No OpenCode start, runner start, execution approval, disable-switch change, or canary run occurred.
