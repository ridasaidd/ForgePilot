# FP-META-014 — Metrics Trust and Validation Standards

## Task

Define trust, validation, admission, provenance, demotion, and historical data standards for ForgePilot metrics artifacts.

## Goal

Ensure that metrics records can be trusted before they enter observatory outputs.

FP-META-014 answers one question:

**Is this metrics record safe to use as evidence?**

This packet defines standards only.

It does not add SQLite storage, CLI behavior, aggregation logic, routing logic, workflow orchestration, autonomous execution, or schema implementation.

---

## Scope Boundary

FP-META-014 defines policy only.

It does not define:

- SQLite schema
- Database tables
- Database columns
- Validation implementation
- CLI commands
- Aggregation behavior
- Routing behavior
- Storage lifecycle
- Persistence mechanics

Those concerns are delegated to future packets.

Any implementation proposal beyond policy definitions must be rejected.

---

## Governing Principles

This packet is constrained by:

- P01 — ForgePilot records observations, not narratives.
- P02 — Trust cannot be retroactively created.
- P03 — ForgePilot does not optimize for favorable outcomes.
- P04 — Only admitted evidence may influence observatory outputs.
- P06 — Classification follows observation.

---

## Core Model

Every metrics record has three independent axes:

1. Trust Tier
2. Validation State
3. Admission State

These axes must not be collapsed into one status field.

A record may be structurally valid but not admitted.
A record may be high-trust but incomplete.
A record may have signal value without evidence value.

---

## Trust Tier Definitions

### TIER_0_UNTRUSTED

The record exists, but provenance is missing or insufficient.

**Allowed use:**
- Storage
- Inspection
- Manual review

**Disallowed use:**
- Reporting
- Aggregation
- Routing
- Model comparison
- Observatory conclusions

---

### TIER_1_SELF_REPORTED

The record was produced by an executor, model, script, or participant without independent verification.

**Allowed use:**
- Storage
- Inspection
- Debugging
- Signal exploration

**Disallowed use unless admitted by explicit future rule:**
- Aggregation
- Routing
- Final comparison
- Observatory conclusions

---

### TIER_2_VERIFIED_ARTIFACT

The record is supported by durable artifacts such as committed files, test output, audit output, run metadata, or verification logs.

**Allowed use:**
- Admission if validation passes
- Reporting
- Aggregation
- Comparison
- Future routing analysis

---

### TIER_3_REPRODUCIBLE

The record is supported by artifacts and can be reproduced from repository state, commands, commits, and recorded outputs.

**Allowed use:**
- Highest-confidence admitted evidence
- Regression analysis
- Long-term routing signals
- Historical comparison

---

## Trust Tier Rules

Trust tier is assigned from provenance available at collection time.

Trust tier must not be elevated later based on human confidence, memory, interpretation, convenience, or narrative explanation.

Admission State is mutable.

Trust Tier is immutable after record creation except for downward correction when provenance defects are discovered.

Later review may annotate provenance.
Later review may demote or quarantine records.
Later review may not convert low-provenance historical data into high-trust evidence.

---

## Validation State Definitions

### VALID

The record satisfies all required structural, value, lifecycle, and provenance completeness checks for its trust tier.

### INVALID

The record contains impossible, contradictory, malformed, corrupted, or rule-breaking values.

**Examples:**
- Negative token counts
- `total_tokens` lower than known token components
- `first_pass_success = true` with `fix_attempts > 0`
- `comparison_outcome = WINNER` before comparison completion
- Unknown enum values

### INCOMPLETE

The record is not contradictory, but required information is missing.

**Examples:**
- Audit has not completed
- Comparison has not completed
- Provider usage data is unavailable
- Verification output is not yet recorded

### DEFERRED

The record cannot yet be fully evaluated because prerequisite records or phases do not exist.

**Examples:**
- Comparison outcome cannot be validated before all benchmark runs complete
- Routing signal cannot be evaluated before routing standards exist
- Regression status cannot be evaluated before historical baseline exists

---

## Admission State Definitions

### NOT_EVALUATED

The record has not yet been checked against FP-META-014 rules.

### REJECTED

The record failed validation and must not influence observatory outputs.

Rejected records may remain stored for debugging and audit history.

### PENDING

The record is incomplete or deferred, but not invalid.

Pending records must not influence observatory outputs.

### ADMITTED

The record is accepted as evidence.

Only admitted records may influence:
- Reports
- Aggregations
- Model comparisons
- Routing decisions
- Workflow conclusions

### QUARANTINED

The record was previously admitted but later found to have provenance, validation, corruption, or consistency issues.

Quarantined records must be excluded from all observatory outputs until re-evaluated.

---

## Provenance Completeness Requirements

Provenance completeness must be deterministic. It must not depend on judgment.

A metrics record is provenance-complete only if the required fields for its trust tier are present.

### Minimum Provenance Fields

Every metrics record must identify:

- `packet_id`
- `model_id`
- `base_commit`
- `run_branch`
- `metrics_artifact_path`
- `created_at` or equivalent collection timestamp
- `collection_phase`

### Verified Provenance Fields

For TIER_2 or higher, the record must also identify:

- Verification commands run
- Verification results
- Audit result source
- Executor result source
- Commit or artifact reference for changed files
- Metrics artifact location
- Recording phase responsible for each populated field

### Reproducible Provenance Fields

For TIER_3, the record must also identify:

- Exact repository commit
- Exact commands needed to reproduce verification
- Expected verification output location
- Run artifact directory
- Audit artifact directory
- Comparison artifact directory when applicable

---

## Admission Rules Matrix

| Trust Tier | Validation State | Admission State |
|---|---|---|
| TIER_0_UNTRUSTED | VALID | PENDING |
| TIER_0_UNTRUSTED | INVALID | REJECTED |
| TIER_0_UNTRUSTED | INCOMPLETE | PENDING |
| TIER_0_UNTRUSTED | DEFERRED | PENDING |
| TIER_1_SELF_REPORTED | VALID | PENDING |
| TIER_1_SELF_REPORTED | INVALID | REJECTED |
| TIER_1_SELF_REPORTED | INCOMPLETE | PENDING |
| TIER_1_SELF_REPORTED | DEFERRED | PENDING |
| TIER_2_VERIFIED_ARTIFACT | VALID | ADMITTED |
| TIER_2_VERIFIED_ARTIFACT | INVALID | REJECTED |
| TIER_2_VERIFIED_ARTIFACT | INCOMPLETE | PENDING |
| TIER_2_VERIFIED_ARTIFACT | DEFERRED | PENDING |
| TIER_3_REPRODUCIBLE | VALID | ADMITTED |
| TIER_3_REPRODUCIBLE | INVALID | REJECTED |
| TIER_3_REPRODUCIBLE | INCOMPLETE | PENDING |
| TIER_3_REPRODUCIBLE | DEFERRED | PENDING |

---

## Admission Rules

A record may be admitted only when:

1. Trust tier is `TIER_2_VERIFIED_ARTIFACT` or `TIER_3_REPRODUCIBLE`.
2. Validation state is `VALID`.
3. Provenance completeness requirements are satisfied.
4. The record does not contradict existing admitted evidence for the same run.
5. The record was produced by the correct lifecycle phase.

A record must not be admitted when:

1. Required provenance is missing.
2. The record is self-reported only.
3. The record is incomplete.
4. The record is deferred.
5. The record is invalid.
6. The record depends on narrative interpretation instead of recorded observation.

---

## TIER_1 Resolution Policy

A `TIER_1_SELF_REPORTED` record that remains `PENDING` has two resolution paths.

### Path A — Supersession

If a `TIER_2_VERIFIED_ARTIFACT` or `TIER_3_REPRODUCIBLE` record is later produced for the same run, the TIER_1 record is superseded.

The TIER_1 record is retained as signal but must not be promoted.

The TIER_2 or TIER_3 record becomes the authoritative record for that run.

### Path B — Manual Rejection

If no higher-tier record is produced for the same run, the TIER_1 record remains `PENDING` indefinitely.

It may be manually set to `REJECTED` during audit review.

It must not be admitted by any other mechanism.

A TIER_1 record must never be promoted to TIER_2 or higher.

Trust tier is immutable upward.

---

## Demotion Path

Previously admitted records may be demoted to `QUARANTINED`.

Demotion is allowed when later evidence shows:

- Missing provenance
- Corrupted artifact
- Incorrect lifecycle phase ownership
- Conflicting duplicate record
- Invalid enum value
- Impossible metric combination
- Audit artifact mismatch
- Comparison artifact mismatch
- Commit mismatch
- Branch mismatch
- Evidence source cannot be located

Demotion must not delete the record.

Demotion must preserve:

- Original admission state
- Admission timestamp
- Demotion timestamp
- Demotion reason
- Actor or process responsible for demotion
- Affected observatory outputs if known

Quarantined records must be excluded from:

- Reporting
- Aggregation
- Comparison
- Routing
- Workflow conclusions

---

## Historical Data Policy

Historical records may be stored, annotated, and inspected.

Historical records may be used as signal only if clearly marked as non-admitted.

Historical records must not be promoted to admitted evidence unless they satisfy the same deterministic provenance and validation rules as new records.

Trust cannot be created retroactively.

If historical provenance is incomplete, the record remains `TIER_0_UNTRUSTED` or `TIER_1_SELF_REPORTED`.

If historical records influenced prior outputs and are later quarantined, future outputs must exclude them.

ForgePilot may preserve prior outputs as historical artifacts but must not treat contaminated outputs as current observatory conclusions.

---

## Signal vs Evidence

Signal is stored information that may suggest something worth investigating.

Evidence is admitted information that may influence observatory outputs.

All evidence is signal. Not all signal is evidence.

Low-trust or incomplete records may provide signal.
Only admitted records provide evidence.

---

## Acceptance Criteria

- Trust Tier definitions are documented.
- Validation State definitions are documented.
- Admission State definitions are documented.
- Provenance completeness requirements are documented.
- Admission rules matrix is documented.
- TIER_1 resolution policy is documented.
- `ADMITTED` to `QUARANTINED` demotion path is documented.
- Historical data policy is documented.
- Signal and evidence distinction is documented.
- The packet does not redesign ForgePilot architecture.
- The packet does not add SQLite implementation.
- The packet does not add routing behavior.
- The packet does not add aggregation behavior.
- The packet is justified by `PRINCIPLES.md`.

---

## Verification Requirements

Run and record:

```bash
pnpm typecheck
pnpm test

