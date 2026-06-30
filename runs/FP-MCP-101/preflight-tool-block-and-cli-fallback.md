# FP-MCP-101 Preflight Tool Block and Local CLI Fallback

Result: PASSED

Documented the guarded preflight MCP tool block observed in FP-MCP-100 and defined a local CLI fallback evidence contract.

No implementation was performed.

No approval evidence was created.

No approval was consumed.

No execution was enabled.

The runner start endpoint was not contacted.

OpenCode was not started.

## Background

FP-MCP-100 attempted to observe readiness for the FP-MCP-099 OpenCode implementation request.

Request under test:

- packetId: FP-MCP-099
- requestId: REQ-20260630T115752019Z-25b7c1b8
- modelId: deepseek-v4-pro-high
- runMode: DESIGN_ONLY

FP-MCP-100 successfully observed:

- disable switch status
- execution enablement status
- local request handoff validation
- authenticated remote runner validate-request

FP-MCP-100 did not observe guarded execution preflight.

The guarded preflight MCP tool call was blocked before reaching ForgePilot.

Therefore no ForgePilot preflight payload was returned.

## Classification

The FP-MCP-100 preflight result must be classified as:

- mcpToolObserved: false
- forgePilotPreflightObserved: false
- fallbackUsed: false
- result: NOT_OBSERVED
- reason: MCP_PREFLIGHT_TOOL_CALL_BLOCKED_BEFORE_FORGEPILOT

This is not equivalent to a ForgePilot preflight failure.

This is not equivalent to a ForgePilot preflight blocker.

This is a transport/platform invocation block outside ForgePilot.

## Distinctions

### ForgePilot preflight failure

A ForgePilot preflight failure occurs when ForgePilot receives the request, evaluates the preflight contract, and returns a failed or invalid preflight payload.

### ForgePilot preflight blocker

A ForgePilot preflight blocker occurs when ForgePilot receives the request, evaluates gates, and returns blocking reasons such as disable switch, missing approval, or execution not enabled.

### MCP/platform transport block

A transport block occurs when the MCP tool invocation does not reach ForgePilot.

No ForgePilot payload may be claimed.

### Local CLI fallback observation

A local CLI fallback observation occurs when the same preflight logic is executed on the ForgePilot host outside the MCP tool transport.

Fallback evidence must be clearly labeled as local fallback evidence.

## Local CLI fallback contract

A valid local CLI fallback must:

- run on the ForgePilot host
- use the same repository checkout
- use the same request artifact
- use the same request id
- use the same packet id
- use the same model id
- use the same run mode
- use the same validation logic as MCP preflight, or explicitly declare divergence
- never contact the runner start endpoint
- never start OpenCode
- never create a runner run id
- record whether runner capabilities were contacted
- record whether validate-request was contacted
- record startEndpointContacted as false
- record opencodeStarted as false
- record executionStarted as false
- record executionAllowedNow
- record all gate states
- record all reasons
- record command invoked
- record repo commit
- record working tree status
- record tool or script version identity if available

## Required fallback evidence fields

A fallback artifact should include:

- schemaVersion
- packetId
- requestId
- modelId
- runMode
- source: local CLI fallback
- transport: local shell
- mcpToolObserved: false
- fallbackUsed: true
- fallbackReason: MCP_PREFLIGHT_TOOL_CALL_BLOCKED_BEFORE_FORGEPILOT
- forgePilotPreflightObserved: true or false
- command
- repoPath
- repoCommit
- workingTreeClean
- requestArtifactPath
- requestArtifactSha256
- targetExecutionCommit, if available
- evidenceLedgerCommit, if available
- executionAllowedNow
- executionPermitted
- executionStarted
- startEndpointContacted
- opencodeStarted
- runnerRunId
- runnerCapabilitiesContacted
- validateRequestContacted
- gates
- reasons

## Trust classification

Local CLI fallback evidence should not be treated as identical to MCP-observed evidence.

Initial classification:

- evidence source: local CLI fallback
- transport: local shell
- trust tier: local observed artifact unless separately verified
- admission state: not automatically admitted
- comparison/admission requires explicit later policy

The fallback artifact can be useful evidence, but it must not pretend to be an MCP tool result.

## Safety invariants

A local CLI fallback must preserve:

- executionStarted: false
- startEndpointContacted: false
- opencodeStarted: false
- no approval created
- no approval consumed
- no runner run id created
- global disable switch unchanged
- runner execution unchanged
- OpenCode execution unchanged

## Required future implementation behavior

A future implementation packet should add a local command or script that can run guarded preflight validation outside MCP transport.

The command should produce a structured artifact under the packet run directory.

The command should be read-only unless explicitly authorized otherwise.

The command should fail closed if it cannot prove the request artifact, repo state, or safety gates.

## Recommended future command shape

Possible command shape:

    pnpm fp -- validate-execution-preflight \
      --packet FP-MCP-099 \
      --request REQ-20260630T115752019Z-25b7c1b8 \
      --output runs/FP-MCP-102/local-preflight.json

The exact command name is not defined by this packet.

## Safety result

Observed and preserved by this packet:

- no approval evidence created
- no approval consumed
- execution not enabled
- runner start endpoint not contacted
- OpenCode not started
- no runner run id created
- no production behavior changed

## Conclusion

FP-MCP-101 defines the evidence model for local guarded-preflight fallback when MCP transport blocks a preflight tool invocation before ForgePilot receives it.

The next smallest packet should implement the local fallback command or script as a non-executing validation path.
