# FP-META-015 — Telemetry Authority and Field Ownership Standards

## Task

Define which system is authoritative for each ForgePilot metrics field.

## Goal

Prevent executor models, auditor models, or humans from guessing telemetry that should come from infrastructure.

FP-META-015 answers one question:

**Who is allowed to write each metrics field?**

This packet defines standards only.

It does not add SQLite schema, CLI behavior, OpenCode integration, telemetry ingestion, routing logic, aggregation logic, or workflow orchestration.

## Scope Boundary

FP-META-015 defines authority and ownership policy only.

It does not implement telemetry collection.

It does not call the OpenCode API.

It does not parse OpenCode exports.

It does not modify metrics persistence.

It does not add database tables or columns.

Any implementation beyond field authority standards must be rejected.

## Governing Principles

This packet is constrained by:

- P01 — ForgePilot records observations, not narratives.
- P02 — Trust cannot be retroactively created.
- P03 — ForgePilot does not optimize for favorable outcomes.
- P04 — Only admitted evidence may influence observatory outputs.
- P06 — Classification follows observation.

## Required Concepts

Define:

1. Field Authority
2. Field Owner
3. Field Source
4. Field Writer
5. Infrastructure-owned telemetry
6. Executor-owned observations
7. Auditor-owned judgments
8. Comparison-owned outcomes
9. Human-entered annotations
10. Unknown/unavailable values

## Required Field Ownership Matrix

Define ownership for at least:

- packet_id
- packet_category
- model_id
- auditor_model
- base_commit
- run_branch
- audit_result
- comparison_outcome
- first_pass_success
- fix_attempts
- human_intervention
- root_cause
- ambiguity_discovered
- escalation_occurrence
- execution_duration_seconds
- prompt_tokens
- completion_tokens
- reasoning_tokens
- total_tokens
- estimated_cost
- notes

## Required Authority Classes

Define these authority classes:

- EXECUTOR
- AUDITOR
- COMPARISON_PHASE
- INFRASTRUCTURE
- OPENCODE_TELEMETRY
- HUMAN_OPERATOR
- DERIVED
- UNKNOWN

## Required Rules

The standards must state:

- Models must not guess infrastructure telemetry.
- Token and cost fields must come from OpenCode telemetry when available.
- Session ID, provider, model variant, timestamps, and cost are infrastructure observations.
- A model may reference telemetry only if provided by an authoritative source.
- Missing telemetry must remain null or empty according to existing metrics rules.
- Human-entered telemetry is lower trust than infrastructure-exported telemetry.
- Field authority must be recorded before persistence rules are finalized.
- A field may be updated only by its owning lifecycle phase.
- Derived fields must identify their source fields.
- Conflicting values must prefer the authoritative source.

## OpenCode Telemetry Evidence

The standards must acknowledge that OpenCode session exports may provide:

- session id
- project id
- directory
- model id
- provider id
- model variant
- cost
- input tokens
- output tokens
- reasoning tokens
- cache tokens
- created timestamp
- updated timestamp
- message-level token usage
- changed file summaries
- tool activity

Do not implement OpenCode integration.

This packet defines how such telemetry should be classified and owned.

## Acceptance Criteria

- Field Authority is defined.
- Field Owner is defined.
- Field Source is defined.
- Field Writer is defined.
- Authority classes are defined.
- Required field ownership matrix is documented.
- OpenCode telemetry ownership is documented.
- Rules for unknown/unavailable values are documented.
- Rules for conflicting values are documented.
- Rules for derived fields are documented.
- The packet does not add SQLite implementation.
- The packet does not add OpenCode integration.
- The packet does not modify CLI behavior.
- The packet does not add routing behavior.
- The packet does not add aggregation behavior.
- The packet is justified by PRINCIPLES.md.

## Verification Requirements

Run and record:

```bash
pnpm typecheck
pnpm test
