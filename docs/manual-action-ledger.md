# Manual Action Ledger

## Purpose

Some ForgePilot-relevant actions happen outside the repository and cannot be performed or observed automatically by ForgePilot.

Those actions must not live only in chat memory.

This document defines the pattern for recording them safely.

## Manual Action Examples

| Manual action | Why it matters |
|---|---|
| OpenAI Actions schema refresh | New MCP tools are not visible to ChatGPT until refreshed manually. |
| OAuth app configuration | External auth state may affect bridge behavior. |
| Service/account configuration | External state may affect runtime behavior. |
| Operator approval | Human approval may be required before execution. |
| External dashboard/API setting change | The repo may not observe the change directly. |

## Recording Pattern

A manual action record should include:

```text
Packet:
Manual action:
Performed by:
Approximate time:
External system:
Why required:
How success was observed:
Evidence artifact:
Secrets recorded: no
Follow-up required:
```

Never record secrets, tokens, private keys, session cookies, or account recovery material.

## Required Evidence After Manual Action

A manual action by itself is not enough.

Record an observable proof afterward whenever possible.

Example:

```text
Manual action: OpenAI Actions schema refresh
Observable proof: ChatGPT can list and invoke the new MCP tool
Evidence artifact: runs/<packet>/direct-mcp-*.md
```

## Known Manual Action: OpenAI Actions Schema Refresh

New MCP tools require this sequence:

```text
bridge implementation commit
→ bridge build
→ bridge service restart
→ manual OpenAI Actions schema refresh
→ direct ChatGPT MCP proof
→ committed evidence
```

This was observed during `FP-MCP-157`.

## Ledger Boundary

The ledger records that a manual action was required and how success was observed.

It does not prove success unless paired with committed evidence.
