# FP-MCP-372 — Non-executing sandbox preview artifact writer implementation

## Checkpoint Type

    MCP_SANDBOX_PREVIEW_WRITER_IMPLEMENTATION_RESULT

## Summary

This packet records the MCP bridge implementation of a non-executing sandboxed command preview artifact writer.

The bridge now contains a tool that creates sandbox preview JSON artifacts only.

The implementation does not execute commands.

It does not invoke bubblewrap.

It does not execute shell strings.

It does not contact runner start.

It does not start OpenCode.

It does not consume approval.

It does not clear disable switches.

It does not run FP-027.

## Claim

    FP-MCP-372 implements a dev-surface sandbox preview artifact writer that writes preview artifacts only, while preserving the non-execution boundary and keeping ChatGPT-safe tool visibility unchanged.

## Source Baseline

    coreBaseCommit: b69c921
    bridgeBranch: feature/oauth-auth0
    bridgeBaseCommit: 32f49e6
    bridgeResultCommit: 9a65ec4
    bridgeResultCommitMessage: Add sandbox command preview artifact writer

## Bridge Files Changed

New files:

- src/sandbox-preview.ts
- src/tool-groups/sandbox-preview-tools.ts
- scripts/test-fp-mcp-372.ts

Modified files:

- src/tool-registry/tool-contracts.ts
- src/tool-registry/register-tools.ts
- scripts/check-tool-contracts.mjs
- scripts/hardcoded-packet-id-allowlist.json

## Tool Added

    forgepilot_create_sandboxed_command_preview

Surface:

    dev

ChatGPT-safe visibility:

    false

## Tool Purpose

The tool creates a non-executing sandbox preview artifact under:

    runs/<PACKET_ID>/sandbox-preview/<PREVIEW_ID>.json

The preview artifact describes a proposed future sandboxed command and its required policy constraints.

It does not execute the proposed command.

## Tool Contract Visibility

    chatgpt-safe: 12
    gated: 30
    dev: 32
    legacy: 5
    total: 79

Contract check result:

    registeredToolCount: 79
    contractCount: 79
    chatgptSafeVisibleCount: 12
    devVisibleCount: 77
    allVisibleCount: 79
    exact match: true

## Verification Results

    pnpm build: PASS
    tsc --noEmit: PASS
    scripts/check-tool-contracts.mjs: PASS
    scripts/check-hardcoded-packet-ids.mjs: PASS
    scripts/test-fp-mcp-372.ts: PASS
    git diff --check: PASS

Test result:

    68 passed
    0 failed

Hardcoded packet-id lint:

    173 references matched

## Test Coverage Summary

The FP-MCP-372 deterministic test suite verifies:

- valid preview artifact creation
- required fields are present
- status is AUDITOR_REVIEW_REQUIRED
- bubblewrap caveat appears verbatim
- onRedactionFailureDiscovered is MANUAL_INCIDENT_REVIEW_REQUIRED
- previewIsEvidence is false
- futureSandboxOutputAutoAdmitted is false
- futureSandboxOutputInitialTrustTier is TIER_0_UNTRUSTED
- networkEnabled is false
- openWorldHint is false
- host home, secrets, and Docker socket mounts are forbidden
- shell input is rejected or normalized to null according to schema rules
- requiresNetwork input is rejected
- auditor review is required and pending
- non-execution boundary flags are false
- tool is not ChatGPT-safe
- safe surface count remains 12
- new tool is absent from safe list
- invalid command class is rejected
- empty argv is rejected
- auditor review reason references the process rule

## Static Non-Execution Grep Results

    child_process: NOT FOUND
    spawn(: NOT FOUND
    exec / execFile / execSync: NOT FOUND
    startRemoteRunnerRequest: NOT FOUND
    opencode start paths: NOT FOUND

Bubblewrap grep:

    bubblewrap: FOUND only as string literals in policy/caveat/non-execution fields
    bwrap: NOT FOUND as execution primitive

## Implementation Boundary

The implementation imports only:

- fs.promises
- path
- crypto createHash/randomUUID

No process creation primitives are used.

No child_process import exists.

No spawn/exec path exists.

No bubblewrap invocation exists.

No runner-start path exists.

No OpenCode start path exists.

## Schema Properties Preserved

The preview writer preserves the FP-MCP-371/371A schema requirements:

- Preview is not execution.
- Preview is not approval.
- Preview is not evidence admission.
- Bubblewrap is reduced-risk sandboxing, not VM isolation.
- Copied workspace only.
- No real repository write mount.
- No host home mount.
- No secrets mount.
- No Docker socket mount.
- Network disabled by default.
- Timeout and output limits required.
- Exported artifacts require explicit paths.
- Future execution requires separate approval.
- Sandbox output is not admitted as evidence by default.
- Future sandbox output starts as NOT_EVALUATED and TIER_0_UNTRUSTED unless separately validated/admitted.
- Later-discovered redaction failure requires manual incident review.

## Non-Execution Boundary

    execution authorized: false
    command executed: false
    bubblewrap executed: false
    shell executed: false
    approval consumed: false
    disable switch cleared: false
    runner start endpoint contacted: false
    OpenCode started: false
    FP-027 canary run: false

## Caveats

- This packet implements preview artifact writing only.
- This packet does not validate runtime service exposure after restart.
- This packet does not claim the new tool is live in the running MCP service.
- This packet does not authorize sandbox execution.
- This packet does not authorize ChatGPT-safe exposure.
- This packet does not authorize any command execution tool.

## Recommended Next Packet

    FP-MCP-372A — Runtime validation for sandbox preview writer exposure

That packet should build/restart the MCP bridge and verify:

- runtime safe boundary remains intact
- ChatGPT-safe count remains 12
- new tool is not visible in ChatGPT-safe
- dev/all profile contract counts match expectations
- no OpenCode start
- no runner start contact
- no FP-027 canary run

## Expected Result

    FP-MCP-372 records that the bridge implements a non-executing sandbox preview artifact writer on the dev surface while preserving the non-execution boundary.
