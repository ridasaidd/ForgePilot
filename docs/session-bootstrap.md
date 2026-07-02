# Session Bootstrap Runbook

## Purpose

This runbook tells a new ForgePilot session how to enter the project safely without relying on private chat memory.

Use this before creating or executing any new packet.

## Bootstrap Sequence

1. Verify repository state.

```sh
git branch --show-current
git rev-parse --short HEAD
git status --short
```

2. Verify bridge state when MCP work may be involved.

```sh
git -C /home/ridasaidd/forgepilot-chatgpt-mcp branch --show-current
git -C /home/ridasaidd/forgepilot-chatgpt-mcp rev-parse --short HEAD
git -C /home/ridasaidd/forgepilot-chatgpt-mcp status --short
```

3. Read the progress checklist.

```text
docs/forgepilot-progress-checklist.md
```

4. Read the packet namespace taxonomy.

```text
docs/packet-namespace-taxonomy.md
```

5. Read the packet namespace definition-of-done standards.

```text
docs/packet-namespace-definition-of-done.md
```

6. Read the evidence boundary doctrine.

```text
docs/evidence-boundary-doctrine.md
```

7. If the task involves manual/external operator action, read the manual action ledger.

```text
docs/manual-action-ledger.md
```

## Packet Creation Gate

Before creating a packet, answer:

| Question | Required answer |
|---|---|
| What is the primary durable artifact? | doc, code, migration, MCP tool, runbook, evidence, etc. |
| Which namespace applies? | `FP-*`, `FP-META-*`, `FP-MCP-*`, or `FP-OPS-*` |
| What would prove completion? | committed evidence, verification output, direct MCP proof, documentation check |
| What is out of scope? | explicit non-goals |
| Does this require manual action? | if yes, record it through the manual action ledger pattern |

No packet should be created until namespace, success evidence, and non-goals are explicit.

## MCP Tool Change Rule

If an MCP tool is added or changed, the operational sequence is:

```text
bridge implementation commit
→ bridge build
→ bridge service restart
→ manual OpenAI Actions schema refresh
→ direct ChatGPT MCP proof
→ committed evidence
```

Bridge restart alone does not refresh ChatGPT's visible action schema.

## Evidence Rule

Do not infer completion from discussion, intention, or implementation alone.

Completion requires committed evidence.

## Safe Default

If uncertain, make the smallest documentation/control packet that clarifies the next step instead of building new implementation.
