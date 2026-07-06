# FP-MCP-374 — Sandbox preview artifact reader / validator exposure

## Checkpoint Type

    MCP_SANDBOX_PREVIEW_READER_VALIDATOR_IMPLEMENTATION_RESULT

## Summary

This packet records the MCP bridge implementation of a read-only sandbox preview artifact reader and validator.

The bridge now contains a ChatGPT-safe tool that reads and validates existing sandbox preview artifacts under a constrained path pattern.

The tool does not create preview artifacts.

The tool does not execute commands.

It does not invoke bubblewrap.

It does not execute shell strings.

It does not contact runner start.

It does not start OpenCode.

It does not consume approval.

It does not clear disable switches.

It does not run FP-027.

## Claim

    FP-MCP-374 implements a ChatGPT-safe, read-only, path-constrained sandbox preview artifact reader/validator while preserving the non-execution boundary and keeping the preview writer dev-only.

## Source Baseline

    coreBaseCommit: 77556d4
    bridgeBranch: feature/oauth-auth0
    bridgeBaseCommit: 233a737
    bridgeResultCommit: 2f8ee75
    bridgeResultCommitMessage: Add sandbox preview artifact reader

## Bridge Files Changed

Modified files:

- src/sandbox-preview.ts
- src/tool-groups/sandbox-preview-tools.ts
- src/tool-registry/tool-contracts.ts
- scripts/check-tool-contracts.mjs
- scripts/hardcoded-packet-id-allowlist.json
- scripts/test-fp-mcp-372.ts

New file:

- scripts/test-fp-mcp-374.ts

## Tool Added

    forgepilot_read_sandboxed_command_preview

Surface:

    chatgpt-safe

Side effect class:

    READ_ONLY

## Tool Purpose

The tool reads and validates an existing sandbox preview artifact at:

    runs/<PACKET_ID>/sandbox-preview/<PREVIEW_ID>.json

The tool must not accept arbitrary absolute paths.

The tool must not accept path traversal.

The tool must not read outside the constrained sandbox preview artifact path.

## Writer Tool Preserved

The existing preview writer remains dev-only:

    forgepilot_create_sandboxed_command_preview

Writer surface:

    dev

Writer ChatGPT-safe visibility:

    false

## Tool Contract Visibility

Before FP-MCP-374:

    total: 79
    chatgpt-safe: 12
    dev-visible: 77
    all-visible: 79

After FP-MCP-374:

    total: 80
    chatgpt-safe: 13
    dev-visible: 78
    all-visible: 80

Contract check result:

    registeredToolCount: 80
    contractCount: 80
    chatgptSafeVisibleCount: 13
    exact match: true

## Validation Target

The reader validates the FP-MCP-373 smoke-test preview artifact:

    runs/FP-MCP-373/sandbox-preview/PREVIEW-20260706T083445Z-a2a3ac3e.json

Expected hash:

    c0f67c844032743c5de58c83ab751afed089096d47fecd8d5e5b4c97cba1e370

Validation result:

    VALID

Computed hash:

    c0f67c844032743c5de58c83ab751afed089096d47fecd8d5e5b4c97cba1e370

Hash match:

    true

## Verification Results

    pnpm build: PASS
    tsc --noEmit: PASS
    scripts/check-tool-contracts.mjs: PASS
    scripts/check-hardcoded-packet-ids.mjs: PASS
    scripts/test-fp-mcp-372.ts: PASS
    scripts/test-fp-mcp-373.ts: PASS
    scripts/test-fp-mcp-374.ts: PASS
    git diff --check: PASS

Test results:

    FP-MCP-372: 68 passed, 0 failed
    FP-MCP-373: 46 passed, 0 failed
    FP-MCP-374: 60 passed, 0 failed

Hardcoded packet-id lint:

    174 references matched

## Static Non-Execution Grep Results

    child_process: 0 matches
    spawn(: 0 matches
    exec(: 0 matches
    execFile(: 0 matches
    execSync: 0 matches
    bwrap execution primitive: 0 matches
    startRemoteRunnerRequest: 0 matches
    OpenCode start paths: 0 matches

Bubblewrap:

    appears only as schema/policy string literals

## Reader Validation Coverage

The FP-MCP-374 test suite verifies:

- FP-MCP-373 preview artifact validates as VALID
- artifact hash matches expected SHA-256
- response includes proposed argv ["pwd"]
- proposed command is not executed
- commandExecuted is false
- bubblewrapExecuted is false
- shellExecuted is false
- runnerStartEndpointContacted is false
- opencodeStarted is false
- fp027CanaryRun is false
- malformed packetId is rejected
- malformed previewId is rejected
- path traversal is rejected
- non-json preview path is rejected
- missing file returns a controlled error
- malformed JSON is controlled
- missing bubblewrap caveat is INVALID
- VM isolation claim is INVALID
- networkEnabled true is INVALID
- futureSandboxOutputAutoAdmitted true is INVALID
- commandExecuted true is INVALID
- reader is ChatGPT-safe only because it is read-only and path constrained
- writer remains dev-only and not ChatGPT-safe
- no execution primitives are introduced

## Schema Properties Preserved

The reader validates that preview artifacts preserve the FP-MCP-371/371A schema requirements:

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

    command executed: false
    bubblewrap executed: false
    shell executed: false
    approval consumed: false
    disable switch cleared: false
    runner start endpoint contacted: false
    OpenCode started: false
    FP-027 canary run: false

## Caveats

- This packet records bridge implementation only.
- This packet does not claim the new reader is live in the running MCP service until runtime validation is performed.
- Runtime validation should be recorded separately.
- This packet does not authorize sandbox execution.
- This packet does not authorize any command execution tool.

## Recommended Next Packet

    FP-MCP-374A — Runtime validation for sandbox preview reader exposure

That packet should restart the MCP bridge and verify:

- runtime safe boundary remains intact
- ChatGPT-safe/public Actions include forgepilot_read_sandboxed_command_preview
- ChatGPT-safe/public Actions do not include forgepilot_create_sandboxed_command_preview
- preview reader can validate the FP-MCP-373 artifact
- preview writer remains dev-only
- no command execution
- no bubblewrap execution
- no runner start contact
- no OpenCode start
- no FP-027 canary run

## Expected Result

    FP-MCP-374 records that the bridge implements a ChatGPT-safe, read-only sandbox preview artifact reader/validator while preserving the non-execution boundary.
