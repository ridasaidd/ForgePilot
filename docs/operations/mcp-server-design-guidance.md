# MCP Server Design Guidance for ForgePilot

## Status

```text
SOURCE_BACKED_GUIDANCE
```

## Design Goal

ForgePilot's long-term control surface should be typed MCP operations, resources, and prompts.

Terminal access remains a secondary development/debugging control. It is useful for bootstrapping, inspection, emergency diagnosis, and implementation work, but it should not be the normal operational interface once ForgePilot's MCP layer is mature.

## Source-Backed Principles

### 1. Split Resources, Prompts, and Tools by control model

```text
Resources: application-driven context
Prompts: user-controlled workflows
Tools: model-controlled operations
```

ForgePilot mapping:

```text
Resources:
- packet summaries
- run summaries
- request artifact summaries
- evidence ledger views
- admission/invalidation state
- current safety status

Prompts:
- prepare packet review
- summarize evidence for operator decision
- compare two packet runs
- generate approval-readiness checklist

Tools:
- record non-executing artifacts
- validate preflight
- record approval evidence
- consume approval evidence
- start/abort worker only under explicit gates
```

### 2. Keep annotations truthful

```text
readOnlyHint: true only when the operation does not create, update, delete, or send data.
readOnlyHint: false for artifact creation, approval recording, consumption recording, terminal execution, worker start, and abort.
destructiveHint: true only for delete/overwrite/destructive operations.
openWorldHint: true only when publishing or reaching outside the current user/account boundary.
```

Annotations help the client frame calls, but ForgePilot must still enforce all safety boundaries server-side.

### 3. Treat mutating tools as evidence-producing operations

Every mutating ForgePilot MCP tool should return and/or persist:

```text
operation id
packet id
request id where applicable
created artifact path
boundary version
policy/status source
executionAuthorized
executionStarted
runnerStartEndpointContacted
opencodeStarted
approvalCreated
approvalConsumed
reasons
```

### 4. Preserve least authority

Do not expose broad terminal-like control as the primary interface.

Prefer narrow tools with small schemas and explicit boundary language.

Use terminal only when the typed surface is missing, broken, or under active development.

### 5. Keep execution gated

Execution must remain behind:

```text
fresh request artifact
scoped approval evidence
approval validity check
single-use consumption evidence
clean repository state
execution disable switch clearance
preflight pass
explicit start endpoint authorization
```

### 6. Use examples carefully

Reference MCP servers and public examples are useful for structure and SDK usage, but they are not production safety proofs.

ForgePilot should borrow patterns only after translating them into its own packet/evidence/admission model.

## Candidate Next Packets

```text
FP-MCP-194: ForgePilot MCP Resource Surface Specification
FP-MCP-195: ForgePilot MCP Prompt Surface Specification
FP-MCP-196: Terminal-to-Typed-Tool Migration Checklist
```
