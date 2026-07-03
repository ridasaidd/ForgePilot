# FP-MCP-200 DeepSeek/OpenCode Implementation Prompt

You are implementing FP-MCP-200 in the MCP bridge repository.

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
958fc91 Add packet checkpoint recording tool
```

Before editing, verify:

```sh
git status --short
git log --oneline -5
pnpm build
```

If the working tree is dirty before you start, stop and report it. Do not overwrite unrelated work.

## Task

Harden the newly implemented MCP tool:

```text
forgepilot_record_packet_checkpoint
```

The current implementation exists in `src/server.ts`. Refactor it so packet checkpoint logic lives in a dedicated module while `src/server.ts` remains registration/glue code.

Preferred new module:

```text
src/packet-checkpoint.ts
```

## Design goal

Move ForgePilot MCP development toward this control model:

```text
MCP typed tools: primary ForgePilot operational surface
terminal: secondary scaffolding, debugging, development, and recovery
```

The checkpoint tool should replace repeated manual terminal workflows for routine packet/checkpoint/evidence/commit recording.

## Functional requirements

Preserve the existing behavior of `forgepilot_record_packet_checkpoint` from FP-MCP-199:

1. Accept structured fields rather than arbitrary shell commands.
2. Fail closed if the ForgePilot repository is dirty before writing.
3. Validate packet id format.
4. Validate confirmation literal.
5. Validate commit message includes the packet id.
6. Create packet/checkpoint artifacts in the ForgePilot repo.
7. Write a structured JSON record.
8. Write result summary and verification artifacts.
9. Record canonical evidence through the existing ForgePilot v1o path.
10. Stage only expected files.
11. Commit only expected files.
12. Verify clean state after commit.
13. Return commit sha, evidence id, admission event id, canonical state, boundary flags, and reasons.

## Required non-execution boundary

This tool must never:

```text
authorize execution
consume approval
clear disable switch
contact runner start endpoint
start OpenCode
run FP-027 or any canary
mutate existing approval artifacts
mutate existing request artifacts outside explicitly declared checkpoint artifacts
stage unrelated files
commit unrelated files
broaden terminal-command authority
```

These boundary claims must remain visible in the tool description/output.

## Refactor requirements

Move packet checkpoint implementation details from `src/server.ts` into `src/packet-checkpoint.ts`.

Suggested exports:

```ts
export const RECORD_PACKET_CHECKPOINT_CONFIRMATION = "RECORD_PACKET_CHECKPOINT";
export const ForgePilotRecordPacketCheckpointOutputSchema = ...;
export type PacketCheckpointInput = ...;
export async function recordPacketCheckpoint(input: PacketCheckpointInput): Promise<...>;
```

`src/server.ts` should only:

```text
import the schema/type/function
register forgepilot_record_packet_checkpoint
call recordPacketCheckpoint(input)
return structuredJsonResult(result)
```

Do not broadly refactor unrelated tools.

## Validation/hardening requirements

Add at least minimal internal validation for:

```text
packetId format
non-empty title
non-empty checkpointType
non-empty claim
non-empty summary
confirmation literal equals RECORD_PACKET_CHECKPOINT
commitMessage includes packetId
clean tree before writing
post-commit clean tree
```

Prefer simple explicit reason codes such as:

```text
INVALID_CONFIRMATION_LITERAL
INVALID_PACKET_ID
EMPTY_TITLE
EMPTY_CHECKPOINT_TYPE
EMPTY_CLAIM
EMPTY_SUMMARY
COMMIT_MESSAGE_NOT_PACKET_SCOPED
DIRTY_WORKING_TREE
POST_COMMIT_DIRTY_WORKING_TREE
```

## Testing / verification

Run:

```sh
pnpm build
```

If there is an existing test framework, use it. If no tests exist beyond build, do not introduce a large test framework in this packet.

Optionally add a very small pure-helper test only if the project already has an established pattern. Otherwise keep scope to build-verified refactor.

## Expected changed files

Likely:

```text
src/server.ts
src/packet-checkpoint.ts
```

Do not modify ForgePilot core from this implementation task.

## Expected output artifacts to produce in ForgePilot repo after implementation

After implementation, report enough information for GPT/operator to record evidence:

```text
bridge branch
bridge commit
changed files
build command
build result
summary of implementation
explicit non-execution boundary confirmation
any caveats
```

Do not record evidence yourself in ForgePilot unless explicitly asked by the operator. Your primary job is bridge implementation.

## Success result string

```text
FP_MCP_200_PACKET_CHECKPOINT_TOOL_REFACTORED_AND_HARDENED
```

## Stop conditions

Stop and report without modifying further if:

```text
working tree is dirty before start
build fails and fix is not obvious within scope
refactor requires changing execution/approval/disable/start semantics
required source files are unexpectedly absent
```
