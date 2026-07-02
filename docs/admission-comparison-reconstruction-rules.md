# Admission and Comparison Reconstruction Rules

## Purpose

ForgePilot reports need to reconstruct admission and comparison state without creating trust by summary.

Reconstruction is read-only.

It summarizes recorded state; it does not create admission, invalidate evidence, rank models globally, or route future work.

## Governing Question

```text
How may ForgePilot reconstruct admission and comparison state for reports?
```

## Reconstruction Inputs

A reconstruction report may use only committed artifacts or supported read-only query results.

Allowed inputs:

| Input | Use |
|---|---|
| `packets/<packet>.md` | packet intent and acceptance criteria |
| `runs/<packet>/verification*` | recorded verification output |
| `runs/<packet>/audit*` | recorded audit output when present |
| `runs/<packet>/comparison*` | recorded comparison result when present |
| `runs/<packet>/executor-result.md` | executor result artifact when present |
| `runs/<packet>/metrics.json` | observation only unless admitted |
| `runs/<packet>/**/telemetry.json` | observation only unless admitted |
| SQLite read-only query results | recorded persisted state only |
| `docs/forgepilot-progress-checklist.md` | checklist-derived index status only |

## Admission State Reporting Rules

Reports may show admission state exactly as recorded.

Allowed admission labels:

- `ADMITTED`
- `REJECTED`
- `PENDING`
- `QUARANTINED`
- `NOT_EVALUATED`
- `UNKNOWN`

If admission state is missing, the report must use `UNKNOWN` or `NOT_EVALUATED`, depending on the source.

A report must not infer `ADMITTED` from:

- passing tests,
- accepted audit text,
- committed metrics,
- telemetry existence,
- comparison result existence,
- checklist status.

## Comparison State Reporting Rules

Reports may summarize comparison artifacts only as bounded comparison records.

Allowed comparison labels:

- `SELECTED`
- `NOT_SELECTED`
- `TIE`
- `ACCEPTED`
- `REJECTED`
- `NO_COMPARISON_RECORDED`
- `UNKNOWN`

A comparison report must identify the comparison source artifact or query.

A comparison must not be treated as global model ranking.

## Source Precedence

When sources disagree, use this order:

1. Explicit admission/comparison database state from read-only query.
2. Committed admission/comparison artifact under `runs/<packet>/`.
3. Packet-specific verification/audit artifacts.
4. Progress checklist entry.
5. Packet existence.

Lower-precedence sources may provide context, but must not override higher-precedence state.

## Unknown and Missing State Handling

Missing evidence is not failure by itself.

Reports must distinguish:

| State | Meaning |
|---|---|
| `UNKNOWN` | source could not determine state |
| `NOT_EVALUATED` | source explicitly says no evaluation/admission has occurred |
| `NO_COMPARISON_RECORDED` | no comparison artifact or state was found |
| `PARTIAL` | some evidence exists but reconstruction is incomplete |
| `DEFERRED` | intentionally postponed |

## Historical Packet Handling

Historical packets remain valid historical evidence.

Reports may say:

```text
This packet predates current taxonomy or reconstruction rules.
```

Reports must not rename historical packet IDs or reinterpret old packet names as errors.

## Prohibited Inferences

Reconstruction reports must not claim:

- verification equals admission,
- audit acceptance equals admission,
- telemetry existence equals evidence value,
- comparison equals global model ranking,
- selected implementation means future routing preference,
- missing comparison means failure,
- historical namespace mismatch means packet invalidity,
- checklist status is proof by itself.

## Implementation Constraints for Later `FP-*` Packet

A later implementation should be read-only by default.

It should:

- collect admission/comparison candidates from artifacts and read-only queries,
- preserve source paths,
- report unknown state explicitly,
- include source precedence in output,
- include prohibited-inference caveats,
- avoid mutation or admission changes.

It must not:

- write admission events,
- update comparison outcomes,
- rewrite historical artifacts,
- rank models globally,
- route future work.

## Required Boundary Text

Any report using reconstructed admission/comparison state must include:

```text
Reconstruction is read-only. It summarizes recorded state and does not create admission, comparison, ranking, or routing authority.
```
