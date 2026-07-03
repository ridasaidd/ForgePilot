# FP-MCP-199 — Dedicated Packet Checkpoint Recording Tool

## Task

Add a dedicated typed MCP tool for recording ForgePilot packet checkpoints so routine packet, artifact, evidence, and commit workflows no longer rely on repeated terminal heredocs.

## Goal

Move ForgePilot operation toward the intended control model:

```text
MCP tools: primary operational surface
terminal: secondary scaffolding, debugging, development, and recovery
```

## Problem

Recent packets repeatedly required manual terminal steps:

```text
create packet file
create run directory
write structured JSON record
write result summary
write verification artifact
record packet intent
insert evidence record
record generic admission event
stage expected files
commit expected files
verify clean state
verify evidence count
```

This creates avoidable risk:

```text
platform safety-check risk from repeated terminal invocations
shell quoting risk
copy/paste drift
wrong commit binding risk
missing artifact risk
inconsistent packet wording
manual staging mistakes
cadence drift
```

## Required Tool

Implement a non-executing typed MCP tool:

```text
forgepilot_record_packet_checkpoint
```

The tool records one packet checkpoint through a controlled algorithm.

## Required Inputs

The tool must accept structured fields rather than shell text:

```text
packetId
title
checkpointType
claim
summary
caveats
boundaries
artifacts or structuredRecord
commitMessage
approval confirmation literal
```

Exact schema may be refined during implementation, but the tool must not accept arbitrary shell commands.

## Required Algorithm

The tool should:

```text
1. Verify ForgePilot repository is clean, or fail closed.
2. Validate packet id format.
3. Validate commit message is packet-scoped.
4. Create packet file from a standard template.
5. Create run directory.
6. Write structured JSON record.
7. Write result summary.
8. Write verification artifact.
9. Validate JSON artifacts.
10. Record packet intent if needed.
11. Insert evidence record.
12. Record generic evidence_record admission event.
13. Stage only expected files.
14. Commit only expected files.
15. Verify repository is clean after commit.
16. Return commit sha, evidence id, admission event id, and boundary flags.
```

## Non-Execution Boundary

The tool must never:

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
```

## Expected Result

```text
FP_MCP_199_DEDICATED_PACKET_CHECKPOINT_TOOL_IMPLEMENTED
```
