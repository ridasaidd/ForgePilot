# FP-MCP-190 — Enablement-Adjacent Platform Block Source/Contract Diagnosis

## Task

Diagnose the FP-MCP-187 platform block without retrying the blocked request-creation call, without rephrasing to avoid the trigger, and without manually constructing a request artifact.

## Context

FP-MCP-187 observed a platform-side block before ForgePilot received the first primary MCP call to create a fresh FP-MCP-183 request artifact. FP-MCP-188 classified that block separately as:

```text
ENABLEMENT_ADJACENT_REQUEST_CREATION_PLATFORM_BLOCK
```

FP-MCP-189 added the operator hypothesis that rapid tool calls and multi-operation terminal batches can trigger platform safety checks.

## Diagnosis Scope

Allowed work:

```text
inspect source/action schema wording
compare likely trigger surfaces
record observed blocks during diagnosis
document next safe path
```

Forbidden work:

```text
retry forgepilot_create_opencode_run_request
rephrase/restructure that call to avoid the trigger
manually construct a request artifact
create approval evidence
consume approval evidence
contact runner start endpoint
start OpenCode
run FP-027 canary
```

## Findings

The registered action schema for `forgepilot_create_opencode_run_request` says:

```text
Create a durable ForgePilot OpenCode run request artifact without starting OpenCode.
```

Its inputs are:

```text
packetId: Known ForgePilot packet id, for example FP-MCP-007.
modelId: Allowed OpenCode model id.
runMode: Allowed ForgePilot run mode. Initially only DESIGN_ONLY is allowed.
approval: Must exactly equal CREATE_REQUEST_ARTIFACT.
```

Its annotations are:

```text
readOnlyHint: false
destructiveHint: false
idempotentHint: false
openWorldHint: false
```

This is a create-only, non-destructive, non-open-world action. It does not start OpenCode, but it is still a mutating action with wording adjacent to execution enablement: `create`, `OpenCode run request`, `approval`, and request-artifact creation for a future runner handoff.

During FP-MCP-190 diagnosis, a combined bridge status/log terminal command was blocked before execution, while the same checks succeeded when split into single-purpose calls. A later single-purpose adjacent source-read command was also blocked. This supports cadence/multi-command sensitivity as a plausible contributor, but does not prove it is the only trigger.

## Interpretation

The FP-MCP-187 block is best classified as unresolved with multiple plausible contributors:

```text
cadence / rapid sequencing
combined terminal command shape
sensitive source/action wording
non-read-only mutation annotation
execution-authority-adjacent semantics
platform classifier uncertainty
```

The block cannot honestly be reduced to generic tool flakiness. It also cannot be proven to be an intended content safety block from available evidence. The correct state is unresolved and safety-relevant.

## Recommendation

Do not bypass the primary MCP path.

Two clean next paths remain:

```text
Path A: same-content future retry
- only with explicit operator authorization
- single tool call
- no batching
- no rephrasing
- record pass/block as a new observation

Path B: normal tool-contract adjustment packet
- only if repeated same-content attempts indicate the contract/action surface itself is persistently blocked
- change source/schema transparently through a normal packet
- restart/actions-refresh
- test as a new version, not a bypass
```

## Result

```text
FP_MCP_190_ENABLEMENT_ADJACENT_PLATFORM_BLOCK_DIAGNOSED_UNRESOLVED_SAFETY_RELEVANT_NO_RETRY_NO_BYPASS
```
