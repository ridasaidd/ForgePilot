# Reporting Evidence Rules

## Purpose

ForgePilot reports must make project state inspectable without turning observations into conclusions.

A report is allowed to summarize committed evidence.

A report is not allowed to create trust, admission, comparison, routing, or completion by narrative.

## Governing Question

```text
What may a ForgePilot report claim?
```

## Reportable Facts

A report may claim a fact when it can point to a committed artifact or supported read-only query result.

Reportable facts include:

| Fact type | Report may say | Required source |
|---|---|---|
| Packet exists | A packet file exists. | `packets/<packet>.md` |
| Packet intent | The packet requested specific work. | packet text |
| Implementation exists | Files changed in a commit. | git commit / diff |
| Verification result | A check passed, failed, or was not run. | `runs/<packet>/verification*` or recorded command output |
| Operational proof | A live path was directly exercised. | direct smoke/query proof artifact |
| Observation exists | Telemetry, metrics, or result artifacts exist. | run artifact or read-only query result |
| Admission state | Evidence has a recorded admission state. | admission artifact/table/query |
| Comparison result | A comparison artifact exists. | comparison artifact/query |
| Manual action occurred | A manual action was reported and paired with observable proof. | manual ledger entry + proof artifact |
| Completion | Acceptance criteria were satisfied and evidence was committed. | packet + evidence + verification + clean-state record |

## Required Labels

Reports must label weaker evidence states clearly.

Use labels such as:

- `INTENT_RECORDED`
- `IMPLEMENTED`
- `VERIFIED`
- `OPERATIONALLY_PROVEN`
- `OBSERVED_NOT_ADMITTED`
- `ADMITTED`
- `REJECTED`
- `QUARANTINED`
- `NOT_EVALUATED`
- `COMPLETE`
- `PARTIAL`
- `BLOCKED`
- `DEFERRED`

## Non-Admitted Observation Rule

A report may display non-admitted observations only if it labels them as non-admitted.

Required wording pattern:

```text
Observation only. Not admitted evidence. Not routing input.
```

Reports must not use non-admitted observations to claim:

- quality,
- correctness,
- model superiority,
- readiness,
- admission,
- routing preference,
- optimization value.

## Admitted Evidence Constraint

A report may make evidence-backed conclusions only from admitted evidence.

If admission state is absent, unknown, or `NOT_EVALUATED`, the report must not treat the record as admitted.

Allowed:

```text
Telemetry row exists with admission_state NOT_EVALUATED.
```

Not allowed:

```text
Telemetry proves the worker is reliable.
```

## Verification Constraint

Verification means a defined check passed in an observed environment.

Verification does not mean:

- evidence was admitted,
- the packet is complete unless all acceptance criteria were satisfied,
- adjacent capabilities are complete,
- the model should be preferred.

## Packet Completion Constraint

A report may mark a packet `COMPLETE` only when committed evidence shows:

- packet exists,
- implementation or documentation exists as scoped,
- required verification passed or was explicitly not applicable,
- required operational proof passed where applicable,
- evidence artifact was committed,
- final clean repository status was recorded or observed.

If any required proof is missing, use `PARTIAL`, `BLOCKED`, or `DEFERRED` instead.

## Comparison Constraint

A report may summarize comparison artifacts, but must distinguish:

- candidate result,
- audit result,
- admitted evidence,
- comparison outcome,
- final selected outcome.

A comparison report must not infer model ranking beyond the bounded comparison artifact.

## Manual Action Reporting Constraint

Manual actions may be reported only with their observable proof.

Example:

```text
Manual action: OpenAI Actions schema refresh.
Observable proof: direct MCP tool invocation succeeded.
Evidence: runs/FP-MCP-157/direct-mcp-query-result.md.
```

Manual action claims must not include secrets or private credentials.

## Source Citation Expectations

Repo-local reports should identify sources using paths and, when useful, commits.

Recommended format:

```text
Source: docs/<file>.md
Source: packets/<packet>.md
Source: runs/<packet>/<artifact>
Source commit: <short-sha>
```

Reports should avoid unsupported phrases such as:

- apparently complete,
- seems working,
- probably verified,
- ready for routing,
- model X is better,
- evidence proves quality,
- accepted unless explicitly admitted.

## Prohibited Claims

Reports must not claim:

- a packet executed because a packet file exists,
- code works because it was committed,
- verification equals admission,
- observation equals evidence,
- admission equals routing permission,
- comparison equals global model ranking,
- checklist status is proof by itself,
- manual action succeeded without observable proof.

## Reporting Boundary

A ForgePilot report is an index over evidence.

It is not the evidence itself.

It must make the evidence easier to inspect without strengthening claims beyond the underlying artifacts.
