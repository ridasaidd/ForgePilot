# FP-010 Comparison Result

## Packet

FP-010 — SQLite Evidence Persistence

## Compared Implementations

| Model | Branch | Executor Commit | Auditor | Audit Verdict |
|---|---|---:|---|---|
| DeepSeek V4 Pro High | `eval/fp-010/deepseek-v4-pro-high` | `6268129` | Qwen 3.7 Max | ACCEPTED |
| Qwen 3.7 Max | `eval/fp-010/qwen-3.7-max` | `d73108c` | DeepSeek V4 Pro High | ACCEPTED |

## Result

**Winner: Qwen 3.7 Max**

## Summary

Both implementations satisfy FP-010 and both audits returned ACCEPTED.

The deciding factor is schema integration quality.

Qwen's implementation models `packet_id` as an integer foreign key to the existing `packets(id)` table. This is more relationally consistent with ForgePilot's SQLite design because evidence records are directly tied to the canonical packet table rather than storing a standalone string identifier.

DeepSeek's implementation is also valid and simpler to use directly with human-readable packet identifiers such as `FP-010`, but it is less integrated with the existing database model.

## DeepSeek Implementation Assessment

### Strengths

- Simple evidence schema.
- Uses human-readable `packet_id` text such as `FP-010`.
- Globally unique `run_id`.
- Strong test coverage: 28 FP-010 tests.
- Explicit validation of state axes.
- Artifact paths and provenance fields persist correctly.
- Qwen audit returned ACCEPTED.

### Weaknesses

- `packet_id` is stored as text rather than referencing the existing `packets(id)` table.
- Less relationally integrated with the existing SQLite persistence model.
- Does not enforce packet existence through a database relationship.

## Qwen Implementation Assessment

### Strengths

- `packet_id` is an integer foreign key to `packets(id)`.
- Evidence records are tied to canonical packet records.
- Per-packet `run_id` uniqueness matches the idea that runs belong to packets.
- Provides retrieval by packet ID, run ID, and evidence ID.
- Preserves separate trust, validation, and admission axes.
- DeepSeek audit explicitly reviewed and accepted the schema choices.
- All verification passed: 188 tests, 0 failures.

### Weaknesses

- Human-readable packet identifier such as `FP-010` is not stored directly in `evidence_records`.
- Retrieval by run ID returns an array because `run_id` is unique only within a packet.
- Future reporting may need joins to display packet names or packet paths.

## State Axis Comparison

Both implementations correctly preserve the required state boundaries:

| Axis | Required Default | Required Values | DeepSeek | Qwen |
|---|---|---|---|---|
| `trust_tier` | `TIER_0_UNTRUSTED` | TIER_0 through TIER_3 | PASS | PASS |
| `validation_state` | `INCOMPLETE` | VALID, INVALID, INCOMPLETE, DEFERRED | PASS | PASS |
| `admission_state` | `NOT_EVALUATED` | NOT_EVALUATED, REJECTED, PENDING, ADMITTED, QUARANTINED | PASS | PASS |

Both implementations correctly exclude `NOT_EVALUATED` from `validation_state` and include it only in `admission_state`.

## Scope Boundary Comparison

Both implementations preserved FP-010 scope boundaries.

Neither implementation added:

- routing,
- model ranking,
- cost optimization,
- task classification,
- admission policy logic,
- dashboards,
- reports,
- leaderboards.

## Verification Summary

| Model | Typecheck | Tests | FP-010 Tests | Audit |
|---|---|---:|---:|---|
| DeepSeek V4 Pro High | PASS | 184 / 184 | 28 | ACCEPTED |
| Qwen 3.7 Max | PASS | 188 / 188 | 24 | ACCEPTED |

The difference in total test count reflects branch-local test additions and should not be treated as direct superiority by itself. The comparison outcome is based primarily on schema design fitness.

## Decision Rationale

Qwen is selected because its implementation better fits ForgePilot's existing SQLite architecture.

The existing database already has a `packets` table, so structured evidence records should reference canonical packet rows instead of duplicating packet identity as free text.

This better supports future stages:

- FP-011 validation and admission integration,
- evidence joins,
- packet-level reports,
- model comparison records,
- eventual observatory queries.

## Outcome

- DeepSeek V4 Pro High: ACCEPTED
- Qwen 3.7 Max: ACCEPTED
- Comparison outcome: QWEN_SELECTED

## Notes for Future Packets

Future persistence packets should prefer foreign-key relationships to existing canonical tables when those tables already represent the entity being referenced.

If human-readable packet identifiers are needed in reports, they should be retrieved by joining through the `packets` table rather than duplicating the identifier in evidence records.
