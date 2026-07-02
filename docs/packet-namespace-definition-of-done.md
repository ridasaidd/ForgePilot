# Packet Namespace Definition of Done Standards

## Purpose

Packet namespace should imply verification burden.

This document defines the minimum completion standard for each packet family.

It complements:

```text
docs/packet-namespace-taxonomy.md
```

## Universal Definition of Done

Every packet, regardless of namespace, must have:

- committed packet file,
- explicit scope,
- explicit non-goals,
- committed evidence or verification artifact,
- final clean repository status,
- no hidden reliance on private chat memory.

## `FP-*` — Core ForgePilot Capability Done Standard

A core implementation packet is done when:

- implementation is committed,
- relevant tests/typecheck/build checks pass,
- migrations are idempotent where applicable,
- evidence is recorded under `runs/<packet>/`,
- safety boundaries are preserved,
- no non-admitted observation is silently promoted to evidence,
- final git status is clean.

Typical evidence:

- typecheck output,
- test output,
- CLI smoke output,
- migration idempotence result,
- direct read/write proof where applicable.

## `FP-META-*` — Standards / Governance Done Standard

A standards/governance packet is done when:

- the rule or standard is documented,
- examples are included,
- non-goals are explicit,
- relationship to existing standards is clear,
- progress checklist is updated if the standard affects project operation,
- no implementation code changes are made unless explicitly scoped,
- verification confirms documentation-only scope when applicable.

Typical evidence:

- created/updated docs,
- grep or review proof of required sections,
- verification artifact stating no code changes.

## `FP-MCP-*` — MCP Bridge / Tool Done Standard

An MCP packet is done when:

- ForgePilot and/or bridge implementation is committed,
- bridge build passes when bridge code changes,
- bridge service is restarted when runtime behavior changes,
- OpenAI Actions schema is manually refreshed when tools are added or changed,
- direct ChatGPT MCP proof is recorded after refresh,
- safety boundaries are recorded,
- final ForgePilot and bridge git statuses are clean.

Required sequence for new/changed MCP tools:

```text
implementation commit
→ bridge build
→ bridge service restart
→ manual OpenAI Actions schema refresh
→ direct MCP invocation proof
→ committed evidence
```

## `FP-OPS-*` — Operator Workflow / Runbook Done Standard

An operator workflow packet is done when:

- runbook/checklist/operator doc is committed,
- the operator action or workflow is stated as advisory or required,
- any manual action caveat is explicit,
- secrets are not recorded,
- progress checklist is updated when relevant,
- verification confirms no implementation code changes.

Typical evidence:

- doc path,
- checklist update,
- verification artifact,
- clean repository status.

## Boundary

These standards define minimum completion evidence.

They do not define routing, scoring, admission policy, or dashboard behavior.
