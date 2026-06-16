# FP-META-016 — Persistence Standards

## Task

Define persistence standards for ForgePilot metrics and observatory records.

## Goal

Ensure that metrics records, trust decisions, authority decisions, validation results, admission states, and lifecycle changes are stored in a way that preserves evidence over time.

FP-META-016 answers one question:

**How does a ForgePilot record survive over time?**

This packet defines persistence policy only.

It does not add SQLite schema, database tables, migrations, CLI behavior, OpenCode integration, telemetry ingestion, aggregation logic, routing logic, workflow orchestration, or autonomous execution.

---

## Scope Boundary

FP-META-016 defines persistence standards only.

It does not define:

- SQLite schema
- Database tables
- Database columns
- Indexes
- Migrations
- SQL queries
- CLI commands
- OpenCode API calls
- Telemetry ingestion
- Aggregation behavior
- Routing behavior
- Workflow orchestration

Those concerns are delegated to future implementation packets.

Any implementation proposal beyond persistence standards must be rejected.

---

## Governing Principles

This packet is constrained by:

- P01 — ForgePilot records observations, not narratives.
- P02 — Trust cannot be retroactively created.
- P03 — ForgePilot does not optimize for favorable outcomes.
- P04 — Only admitted evidence may influence observatory outputs.
- P05 — Do not build infrastructure for evidence that does not yet exist.
- P06 — Classification follows observation.

---

## Relationship to Existing Standards

FP-META-016 depends on:

- FP-META-014 — Metrics Trust and Validation Standards
- FP-META-015 — Telemetry Authority and Field Ownership Standards

FP-META-014 defines whether a record is safe to use as evidence.

FP-META-015 defines who is authoritative for each field.

FP-META-016 defines how those records and decisions must be preserved over time.

---

## Core Model

ForgePilot persistence must preserve:

1. Record identity
2. Record lifecycle state
3. Field authority
4. Field source
5. Field value history
6. Trust tier
7. Validation state
8. Admission state
9. Provenance
10. Supersession and quarantine history

Persistence must not collapse these concepts into one mutable status field.

---

## Record Identity

Every persisted record must have a stable identity.

A persisted record must be identifiable without relying on narrative context.

Required identity concepts:

- `record_id`
- `run_id`
- `packet_id`
- `model_id`
- `run_branch`
- `base_commit`
- `artifact_path`
- `created_at`

### record_id

`record_id` uniquely identifies one persisted record.

It must remain stable for the lifetime of the record.

### run_id

`run_id` identifies one execution run.

Multiple artifacts may belong to the same run.

### packet_id

`packet_id` identifies the packet being executed, audited, compared, or recorded.

### artifact_path

`artifact_path` identifies the durable file or artifact associated with the record when applicable.

---

## Record Lifecycle States

A persisted record may move through lifecycle states.

Allowed lifecycle states:

- `CREATED`
- `POPULATED`
- `VALIDATED`
- `ADMITTED`
- `REJECTED`
- `QUARANTINED`
- `SUPERSEDED`
- `ARCHIVED`

### CREATED

The record exists but may not yet contain all required values.

### POPULATED

The record has been populated by one or more authoritative writers.

### VALIDATED

The record has passed validation checks appropriate to its trust tier and lifecycle phase.

### ADMITTED

The record is accepted as evidence and may influence observatory outputs.

### REJECTED

The record failed validation or admission requirements and must not influence observatory outputs.

### QUARANTINED

The record was previously admitted but later found to have provenance, validation, corruption, or consistency concerns.

### SUPERSEDED

The record has been replaced by a more authoritative or more complete record for the same run or field.

### ARCHIVED

The record is retained for historical inspection but is not active evidence.

---

## Lifecycle Rules

Lifecycle state must be persisted separately from:

- Trust Tier
- Validation State
- Admission State
- Field Authority
- Field Source

A lifecycle transition must preserve:

- previous state
- new state
- transition timestamp
- transition reason
- transition actor or process
- source artifact or evidence, when available

Lifecycle transitions must be append-only.

A lifecycle transition must not erase the previous lifecycle state.

---

## Field Persistence Rules

Every persisted field value must preserve:

- field name
- field value
- field authority
- field owner
- field source
- field writer
- recorded timestamp
- source artifact, when available
- previous value, when replaced
- replacement reason, when replaced

A field value must not be overwritten without preserving history.

A field value written by a non-authoritative source must not replace an authoritative value.

If a field value is unknown, unavailable, or not yet owned by the current lifecycle phase, it must remain `null` or empty according to existing metrics rules.

---

## Immutability Rules

The following values must be immutable after creation unless the record is explicitly quarantined or superseded:

- `record_id`
- `run_id`
- `packet_id`
- original `base_commit`
- original `run_branch`
- original `model_id`
- original source artifact path
- original creation timestamp

Trust Tier must not be elevated after collection.

Trust Tier may only be corrected downward if provenance defects are discovered.

Admission State may change according to FP-META-014 demotion and quarantine rules.

Field values may be superseded only through a recorded transition.

---

## Versioning Rules

Persistence must preserve historical versions of records and fields.

Versioning must record:

- version identifier
- previous version
- new version
- changed fields
- change timestamp
- change reason
- change actor or process
- source artifact or evidence

Version history must be inspectable.

A newer version must not erase the existence of an older version.

A corrected record must preserve the original record and correction rationale.

---

## Supersession Rules

A record may be superseded when a more authoritative or more complete record exists for the same run, packet, field, or artifact.

Supersession must preserve:

- superseded record id
- replacement record id
- supersession timestamp
- supersession reason
- authority basis for replacement
- affected fields

A superseded record may remain useful as signal.

A superseded record must not influence observatory outputs unless explicitly admitted independently.

---

## Quarantine Persistence Rules

A quarantined record must not be deleted.

Quarantine must preserve:

- original record id
- original admission state
- original trust tier
- quarantine timestamp
- quarantine reason
- actor or process responsible
- affected observatory outputs, if known
- evidence that triggered quarantine

Quarantined records must be excluded from:

- reporting
- aggregation
- comparison
- routing
- workflow conclusions

A quarantined record may be restored only through a documented revalidation process.

---

## Deletion Policy

ForgePilot must prefer preservation over deletion.

Hard deletion of observatory records is prohibited unless required for operational, legal, or security reasons.

When a record should no longer be active, use one of:

- `REJECTED`
- `QUARANTINED`
- `SUPERSEDED`
- `ARCHIVED`

Deletion must not be used as a normal lifecycle transition.

---

## Provenance Persistence Requirements

Persistence must preserve provenance sufficient to reconstruct:

- what was recorded
- when it was recorded
- who or what recorded it
- which authority class allowed it
- which source artifact supported it
- which lifecycle phase produced it
- whether it was admitted, rejected, quarantined, superseded, or archived

Provenance must be deterministic.

Provenance must not depend on memory, interpretation, or narrative explanation.

---

## Historical Data Policy

Historical records may be stored, inspected, annotated, superseded, quarantined, or archived.

Historical records must not be retroactively promoted to higher trust tiers unless they satisfy the same provenance and validation requirements as new records.

Historical records may provide signal.

Only admitted historical records may provide evidence.

If historical records are later found to be contaminated, they must be quarantined rather than deleted.

---

## Persistence and Metrics Artifacts

Existing metrics artifacts remain valid as file-based records.

File-based metrics artifacts may be used until database persistence is implemented.

When database persistence is later introduced:

- file artifacts must remain valid provenance sources
- database records must reference source artifacts where possible
- database records must not erase file artifact history
- ingestion must preserve field authority and provenance
- ingestion must not upgrade trust retroactively

---

## Acceptance Criteria

- Record identity rules are documented.
- Record lifecycle states are documented.
- Lifecycle transition rules are documented.
- Field persistence rules are documented.
- Immutability rules are documented.
- Versioning rules are documented.
- Supersession rules are documented.
- Quarantine persistence rules are documented.
- Deletion policy is documented.
- Provenance persistence requirements are documented.
- Historical data policy is documented.
- Relationship to file-based metrics artifacts is documented.
- The packet does not add SQLite implementation.
- The packet does not define database schema.
- The packet does not add CLI behavior.
- The packet does not add OpenCode integration.
- The packet does not add telemetry ingestion.
- The packet does not add routing behavior.
- The packet does not add aggregation behavior.
- The packet is justified by `PRINCIPLES.md`.

---

## Verification Requirements

Run and record:

```bash
pnpm typecheck
pnpm test
