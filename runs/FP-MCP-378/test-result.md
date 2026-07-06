# FP-MCP-378 Malformed Artifact Fixture Test Result

## Result

PASS.

## Scope

Bridge test script only.

Fixtures were created under:

    runs/FP-MCP-378/sandbox-preview

These fixtures are intentionally invalid validator fixtures.

They are not proposed real commands.

They are not execution requests.

They are not admitted evidence.

## Baseline

Canonical artifact: runs/FP-MCP-373/sandbox-preview/PREVIEW-20260706T083445Z-a2a3ac3e.json
Canonical hash before/after: c0f67c844032743c5de58c83ab751afed089096d47fecd8d5e5b4c97cba1e370
Canonical remained valid: YES

## Validation Cases

Malformed JSON returned PARSE_ERROR.

Schema and policy violations returned INVALID.

Covered cases:

1. malformed JSON
2. missing schemaVersion
3. wrong schemaVersion
4. missing proposedCommand
5. empty proposedCommand.argv
6. commandExecuted true
7. bubblewrapExecuted true
8. shellExecuted true
9. runnerStartEndpointContacted true
10. opencodeStarted true
11. approvalConsumed true
12. disableSwitchCleared true
13. fp027CanaryRun true
14. previewOnly false
15. missing bubblewrap caveat
16. wrong isolation claim
17. network enabled true
18. wrong redaction failure policy
19. previewIsEvidence true
20. futureSandboxOutputAutoAdmitted true
21. initial admission state ADMITTED
22. initial trust tier TIER_3_REPRODUCIBLE

## Results: 92 passed, 0 failed

## Non-Execution Boundary

No command execution occurred.

No bubblewrap execution occurred.

No shell execution occurred.

No runner start endpoint was contacted.

No OpenCode start occurred.

No approval was consumed.

No disable switch was cleared.

No FP-027 canary run occurred.

## Classification

    FP-MCP-378_MALFORMED_ARTIFACT_FIXTURE_TEST_PASS
