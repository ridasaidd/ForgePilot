# Task Classification Standards

## Purpose

This document defines standards for classifying ForgePilot packets by task type, risk, constraint strictness, evidence sensitivity, blast radius, skill requirement, audit requirement, challenger requirement, and routing eligibility.

These standards answer one question:

**What kind of work is this packet asking a model to perform?**

This document defines classification policy only. It does not define SQLite storage, database schemas, CLI commands, routing logic, model selection behavior, autonomous execution, dashboards, reports, aggregation behavior, or task classification persistence implementation.

---

## Governing Principles

These standards are constrained by:

- **P01** — ForgePilot records observations, not narratives.
- **P02** — Trust cannot be retroactively created.
- **P03** — ForgePilot does not optimize for favorable outcomes.
- **P04** — Only admitted evidence may influence observatory outputs.
- **P05** — Do not build infrastructure for evidence that does not yet exist.
- **P06** — Classification follows observation.

---

## Core Model

Every packet must be classifiable across independent axes.

These axes must not be collapsed into one field.

A packet may be low-risk but high-complexity.
A packet may be documentation-only but trust-critical.
A packet may be implementation-heavy but low evidence sensitivity.
A packet may be exploratory and therefore unsuitable for automatic routing.

FP-006 defines nine independent classification axes:

1. **Task Class**
2. **Risk Level**
3. **Constraint Strictness**
4. **Evidence Sensitivity**
5. **Expected Blast Radius**
6. **Primary Skill Required**
7. **Audit Requirement**
8. **Challenger Requirement**
9. **Routing Eligibility**

Each axis answers a distinct question about the packet. No axis may be inferred from another axis.

---

## Axis Independence Rules

Classification axes are independent. The following examples illustrate lawful combinations:

- A packet may be `DOCUMENTATION` with `HIGH` risk because it defines evidence admission policy.
- A packet may be `STANDARDS` with `STRICT` constraint strictness because deviation is a defect.
- A packet may be `REFACTOR` with `HIGH` evidence sensitivity because it touches telemetry ingestion.
- A packet may be `RESEARCH` with `NOT_ELIGIBLE` routing eligibility because no comparable evidence exists.

Classification must not assume that task class implies risk, strictness, sensitivity, blast radius, skill, audit, challenger, or routing eligibility.

Each axis must be classified independently based on packet content and observatory context.

---

## Task Class

### Definition

Task Class describes the kind of work requested by the packet. It answers: what is the primary activity the packet asks the executor to perform?

Task Class must describe the packet's primary work, not the files touched.

A packet that touches database files but primarily defines standards is `STANDARDS`, not `PERSISTENCE` or `SCHEMA`.

### Controlled Vocabulary

| Value | Description |
|---|---|
| `STANDARDS` | Defines policy, rules, classifications, or standards. Does not implement runtime behavior, storage, or CLI. |
| `DOCUMENTATION` | Adds, updates, or restructures documentation. Does not change runtime behavior, schemas, or standards. |
| `PERSISTENCE` | Implements data storage, queries, or record lifecycle operations. |
| `SCHEMA` | Defines or modifies database schemas, migrations, or table structures. |
| `VALIDATION` | Implements validation logic, constraint checks, or admission verification. |
| `TELEMETRY` | Implements telemetry collection, ingestion, parsing, or export. |
| `CLI` | Implements command-line interface behavior, commands, or argument handling. |
| `TESTING` | Adds, updates, or restructures tests or test infrastructure. |
| `REFACTOR` | Restructures existing code without changing observable behavior. |
| `BUG_FIX` | Corrects a defect in existing behavior. |
| `AUDIT` | Implements audit logic, audit execution, or audit result recording. |
| `ROUTING` | Implements model routing, selection, recommendation, or broker logic. |
| `RESEARCH` | Explores, investigates, or analyzes without producing committed implementation. |
| `WORKFLOW` | Modifies workflow orchestration, lifecycle phase ordering, or process structure. |
| `UNKNOWN` | Task class cannot be determined from available packet information. |

### Assignment Rules

Task Class must be assigned before execution based on packet intent, not executor output.

Task Class must not be inferred from model output after execution.

A packet may define a primary task class and one or more secondary task classes when the packet spans multiple concerns. Secondary task classes are recorded separately and must not be collapsed into the primary task class.

If a packet is revised to change task class, the classification must be corrected through an explicit classification observation — not by overwriting the original classification.

---

## Risk Level

### Definition

Risk Level describes the potential damage if the packet is implemented incorrectly. It answers: what is the worst-case consequence of a wrong implementation?

### Controlled Vocabulary

| Value | Description |
|---|---|
| `LOW` | Incorrect implementation has minimal consequences. Errors are contained to the packet's immediate output and do not affect observatory trust, evidence quality, persistence integrity, or routing decisions. |
| `MEDIUM` | Incorrect implementation could cause limited data integrity issues, require manual correction, or affect a small number of future runs. Does not threaten observatory trust or routing evidence. |
| `HIGH` | Incorrect implementation could corrupt trust boundaries, cause false evidence, damage persistence integrity, or mislead future routing decisions. May require quarantine of affected records. |
| `CRITICAL` | Incorrect implementation could cause systemic evidence contamination, irreversible trust degradation, or cascading routing failures that propagate through future observatory outputs. |

### Evaluation Factors

Risk Level must consider:

- Data integrity impact
- Trust boundary impact
- Audit impact
- Persistence impact
- Routing impact
- Security or safety impact
- Likelihood of corrupting future evidence

### Minimum Risk Rules

A packet that changes evidence admission, trust tiers, telemetry ingestion, or routing behavior must not be `LOW` risk.

A packet that modifies the classification standards themselves must not be `LOW` risk.

---

## Constraint Strictness

### Definition

Constraint Strictness describes how tightly the executor must stay within the packet's explicit authorization. It answers: how much deviation from the packet is permitted?

### Controlled Vocabulary

| Value | Description |
|---|---|
| `LOOSE` | The executor has discretion to add reasonable supporting changes, improvements, or complementary work. Scope expansion is acceptable if it supports the packet's goal. |
| `NORMAL` | The executor should stay within the packet's scope. Minor supporting changes are acceptable if clearly useful and not prohibited by explicit constraints. |
| `STRICT` | Extra behavior beyond the packet's explicit authorization is a defect. The executor must implement exactly what the packet specifies and nothing more. Supporting changes require explicit authorization. |
| `FROZEN` | Architectural changes are forbidden unless the packet explicitly exists to change architecture. Even within-scope changes must prefer minimal modification. Modifying files not explicitly authorized by the packet is a defect. |

### Independence Rule

Constraint Strictness is independent of Risk Level.

A low-risk documentation packet may still be `STRICT`.
A high-risk persistence packet may be `NORMAL` if scope flexibility is authorized.

Constraint Strictness must not be inferred from Risk Level or Task Class.

---

## Evidence Sensitivity

### Definition

Evidence Sensitivity describes whether incorrect implementation can corrupt observatory evidence. It answers: if this packet is implemented wrong, can it produce false evidence?

### Controlled Vocabulary

| Value | Description |
|---|---|
| `NONE` | Incorrect implementation cannot affect observatory evidence quality. The packet's output does not touch evidence admission, trust classification, validation, provenance, metrics recording, or routing signals. |
| `LOW` | Incorrect implementation could affect non-critical metadata or annotations but cannot corrupt core evidence records, trust tiers, or admission states. |
| `MEDIUM` | Incorrect implementation could affect evidence quality for a limited scope of records. Corruption is detectable and reversible through audit and quarantine. |
| `HIGH` | Incorrect implementation can cause false evidence, missing evidence, or misclassified evidence. Corruption may propagate to downstream observatory outputs and routing decisions before detection. |

### Mandatory Evaluation Domains

Packets involving any of the following must be evaluated for evidence sensitivity:

- Metrics recording or population
- Telemetry collection, parsing, or ingestion
- Validation logic for evidence records
- Provenance tracking or verification
- Trust tier assignment or modification
- Evidence admission or rejection
- Evidence demotion or quarantine
- Routing signal generation or interpretation

A packet that can cause false evidence, missing evidence, or misclassified evidence should be `HIGH`.

---

## Expected Blast Radius

### Definition

Expected Blast Radius describes the expected scope of legitimate changes. It answers: how much of the codebase will this packet legitimately touch?

Expected Blast Radius is not a quality score. A large blast radius may be correct if authorized.

### Controlled Vocabulary

| Value | Description |
|---|---|
| `SINGLE_FILE` | Changes expected in one file only. |
| `MULTI_FILE_LOCAL` | Changes expected in multiple files within a single module or directory. |
| `CROSS_MODULE` | Changes expected across multiple modules or directories. |
| `DATABASE` | Changes include database schema, migrations, or storage layer modifications. |
| `WORKFLOW` | Changes include workflow orchestration, lifecycle phase ordering, or process structure. |
| `SYSTEMIC` | Changes may touch any part of the codebase and may restructure architectural boundaries. |

### Exceedance Rule

An implementation exceeding expected blast radius must be treated as a routing and audit signal.

Exceeding expected blast radius does not automatically make the implementation incorrect, but it indicates that the executor's scope judgment differed from the classification. This discrepancy must be recorded as evidence.

---

## Primary Skill Required

### Definition

Primary Skill Required describes the main capability needed to complete the packet. It answers: what kind of expertise does this packet demand from the executor?

### Controlled Vocabulary

| Value | Description |
|---|---|
| `SPECIFICATION_WRITING` | Ability to write precise, unambiguous specifications, rules, and policy documents. |
| `DATABASE_DESIGN` | Ability to design database schemas, tables, indexes, and storage structures. |
| `MIGRATION_DESIGN` | Ability to design safe, reversible data migrations. |
| `TELEMETRY_PARSING` | Ability to parse, interpret, and process telemetry data from external tools. |
| `VALIDATION_LOGIC` | Ability to implement correctness checks, constraint verification, and admission logic. |
| `CLI_IMPLEMENTATION` | Ability to implement command-line interfaces, argument parsing, and terminal output. |
| `TEST_DESIGN` | Ability to design test cases, test infrastructure, and test coverage strategy. |
| `AUDIT_REASONING` | Ability to evaluate work products against requirements, identify defects, and produce audit judgments. |
| `REFACTORING` | Ability to restructure code without changing behavior. |
| `DOCUMENTATION_STRUCTURE` | Ability to organize, structure, and write clear documentation. |
| `ROUTING_POLICY` | Ability to design and implement model routing, selection, and recommendation rules. |
| `UNKNOWN` | Primary skill cannot be determined from available packet information. |

### Usage Constraint

This classification exists to support future model-task matching.

It must not be used as a model preference by itself.

A model ranked high for `TEST_DESIGN` does not imply suitability for `DATABASE_DESIGN`.
A model ranked high for `DOCUMENTATION_STRUCTURE` does not imply suitability for `AUDIT_REASONING`.

Skill classification informs routing only in conjunction with admitted evidence showing that a model performs well on packets of that skill type.

---

## Audit Requirement

### Definition

Audit Requirement describes how much independent review the packet requires. It answers: how thoroughly must a second party verify this packet's implementation?

### Controlled Vocabulary

| Value | Description |
|---|---|
| `NONE` | No independent audit is required. Self-review or automated checks are sufficient. |
| `LIGHT` | A brief review confirming that stated deliverables exist and no prohibited changes were introduced. |
| `STANDARD` | A full audit reviewing correctness, constraint adherence, and acceptance criteria satisfaction. |
| `STRICT` | A thorough audit with detailed evidence collection, explicit verification of every acceptance criterion, and documentation of all findings. |
| `ADVERSARIAL` | An audit that actively searches for subtle semantic failures, edge cases, assumption violations, and reasoning errors — not only verifies that tests pass and deliverables exist. |

### Minimum Audit Rules

Packets that affect persistence, trust, admission, validation, telemetry, or routing must not use `NONE`.

Packets classified as `HIGH` evidence sensitivity should prefer `STRICT` or `ADVERSARIAL` audit.

Packets classified as `CRITICAL` risk should prefer `ADVERSARIAL` audit.

---

## Challenger Requirement

### Definition

Challenger Requirement describes whether a second executor should independently implement the same packet. It answers: should a different model attempt this same packet to provide comparison evidence?

### Controlled Vocabulary

| Value | Description |
|---|---|
| `NOT_REQUIRED` | A single executor run is sufficient. No challenger run is needed. |
| `OPTIONAL` | A challenger run is useful but not required. Challenger evidence may be collected if resources permit. |
| `REQUIRED` | A challenger run must be performed to provide comparison evidence. |
| `REQUIRED_DIVERSE` | A challenger run must be performed using a model selected for different behavior characteristics, not just similar capability. The challenger should maximize the chance of discovering different approaches, interpretations, or errors. |

### Usage Guidance

High-risk or evidence-sensitive packets should prefer challenger execution until sufficient routing evidence exists.

A challenger run with the same model is not `REQUIRED_DIVERSE`. Diversity requires intentionally different model characteristics.

Challenger evidence must be recorded and admitted before it can inform routing.

---

## Routing Eligibility

### Definition

Routing Eligibility describes whether historical evidence may be used to recommend an executor for this packet. It answers: can past model performance data help decide which model should run this packet?

### Controlled Vocabulary

| Value | Description |
|---|---|
| `NOT_ELIGIBLE` | Historical evidence must not be used to recommend or select a model. Execution model selection must be manual or arbitrary. |
| `ELIGIBLE_WITH_HUMAN_REVIEW` | Historical evidence may be presented as a recommendation, but a human must review and approve the model selection. |
| `ELIGIBLE_FOR_RECOMMENDATION` | Historical evidence may be used to produce a ranked recommendation. Human override is permitted but not required. |
| `ELIGIBLE_FOR_AUTOMATED_SELECTION` | Historical evidence may be used to automatically select the executor model without human review. |

### Eligibility Rules

Early ForgePilot packets are not eligible for automated selection until sufficient admitted evidence exists about which models perform well on which task classes, risk levels, and skill requirements.

Routing Eligibility must depend on admitted historical evidence, not anecdotal preference.

A packet may be `ELIGIBLE_FOR_RECOMMENDATION` only when admitted evidence demonstrates at least one measurable relationship between model selection and outcome quality for packets of similar classification.

A packet may be `ELIGIBLE_FOR_AUTOMATED_SELECTION` only when admitted evidence demonstrates consistent, reproducible model performance patterns across multiple classification dimensions.

Routing eligibility must not be elevated based on expectation, hope, or plan for future evidence.

---

## Classification Record Requirements

### Definition

A classification observation is the record that captures how a packet was classified before execution.

A classification observation must be a durable, inspectable record.

### Required Fields

Every classification observation must include:

| Field | Description |
|---|---|
| `packet_id` | The identifier of the packet being classified. |
| `task_class` | The primary task class assigned to the packet. Must be a value from the Task Class controlled vocabulary. |
| `secondary_task_classes` | Zero or more secondary task classes, if applicable. Must use values from the Task Class controlled vocabulary. |
| `risk_level` | The risk level assigned to the packet. Must be a value from the Risk Level controlled vocabulary. |
| `constraint_strictness` | The constraint strictness assigned to the packet. Must be a value from the Constraint Strictness controlled vocabulary. |
| `evidence_sensitivity` | The evidence sensitivity assigned to the packet. Must be a value from the Evidence Sensitivity controlled vocabulary. |
| `expected_blast_radius` | The expected blast radius assigned to the packet. Must be a value from the Expected Blast Radius controlled vocabulary. |
| `primary_skill_required` | The primary skill required for the packet. Must be a value from the Primary Skill Required controlled vocabulary. |
| `audit_requirement` | The audit requirement assigned to the packet. Must be a value from the Audit Requirement controlled vocabulary. |
| `challenger_requirement` | The challenger requirement assigned to the packet. Must be a value from the Challenger Requirement controlled vocabulary. |
| `routing_eligibility` | The routing eligibility assigned to the packet. Must be a value from the Routing Eligibility controlled vocabulary. |
| `classified_by` | The identifier of the actor who assigned the classification (human name, role, or process identifier). |
| `classification_source` | The source of the classification. Must distinguish human classification, model-assisted classification, and automated classification. |
| `rationale` | The reasoning behind the classification, including which packet content was examined and why each axis value was chosen. |
| `created_at` | Timestamp when the classification was created. |

### Classification Source Values

| Value | Description |
|---|---|
| `HUMAN` | Classification was assigned by a human operator based on packet review. |
| `MODEL_ASSISTED` | A model proposed the classification and a human reviewed and approved it. |
| `AUTOMATED` | Classification was assigned by an automated process based on deterministic rules applied to packet content. |

### Classification Observation Rules

Classification is an observation, not mutable state.

A classification observation must be created before execution.

The classification must be preserved as originally recorded even if later corrected.

Classification observations must not be overwritten in place.

---

## Correction and Revision

### Correction Model

Classification corrections must be append-only observations.

Previous classifications must not be overwritten, deleted, or modified.

A correction creates a new classification observation that references the previous one.

### Correction Record

A correction must include:

| Field | Description |
|---|---|
| `previous_classification_reference` | Identifier or reference to the classification being corrected. |
| `corrected_fields` | The specific axes whose values are being changed. |
| `new_values` | The new values for each corrected field. |
| `reason` | The justification for the correction — what was discovered that made the original classification incorrect. |
| `actor` | The identifier of the actor making the correction. |
| `created_at` | Timestamp when the correction was created. |

### Correction Rules

Correction is itself evidence. The fact that a classification was corrected, which fields were corrected, and why is observable data.

Frequent correction of classifications must be treated as a process signal. It may indicate:

- Unclear packet authoring
- Inadequate classification review
- Underspecified classification axes
- Shifting observatory goals

A correction must not be used to retroactively align a packet's classification with its execution outcome.

Classification must not be corrected from `DOCUMENTATION` to `STANDARDS` simply because the executor produced a standards document.

Classification must not be corrected from `LOW` to `HIGH` risk simply because the executor's implementation was poor.

Corrections must reflect improved understanding of the packet's intent and observatory context, not evaluation of the executor's performance.

---

## Routing Signal Relationship

### Classification and Routing

Task classification may inform routing only after being admitted as evidence.

A model win/loss must not be interpreted without task classification.

### Required Disaggregation

The following must not be aggregated without classification context:

- A model accepted on `TESTING` does not imply suitability for `PERSISTENCE`.
- A model accepted on `DOCUMENTATION` does not imply suitability for `TELEMETRY`.
- A model accepted on `STANDARDS` does not imply suitability for `ROUTING`.
- A model accepted after multiple scope corrections must not be treated the same as first-pass acceptance.

### Evidence Requirements for Routing

Before classification can inform routing:

1. Multiple packets of the same task class must have admitted execution evidence.
2. The evidence must show measurable model performance differences.
3. The performance differences must be stable across comparable packets.
4. The classification must itself be admitted as evidence (assigned by qualified source, not contradicted by execution observation).

### Classification Does Not Authorize Routing

Classification assignment does not itself authorize routing.

A packet classified as `ELIGIBLE_FOR_RECOMMENDATION` does not become eligible for routing simply because of the classification. The classification describes whether the packet could be eligible given sufficient evidence.

Routing eligibility requires admitted evidence, not classification labels.

### Principle Alignment

Classification and routing must respect P04: Only admitted evidence may influence observatory outputs.

Classification labels alone do not constitute evidence.
Classification labels combined with admitted execution evidence may constitute evidence.
Classification labels without admitted execution evidence must not influence routing.

---

## Classification and Principle P06

P06 states: Classification follows observation.

Task classification standards are a framework for classifying packets before execution. The standards define what to classify and how, but they do not pre-classify packets.

Each packet's classification is an observation made before its execution. The observation is recorded, preserved, and may be corrected — but it must not be fabricated retroactively or inferred from execution results.

The existence of classification standards does not violate P06 because the standards define the observation framework, not the observations themselves.

---

## Relationship to Other Standards

These standards complement:

- **Metrics Trust and Validation** (`docs/metrics-trust-and-validation.md`) — Defines trust tiers, validation states, and admission rules. Classification observations are subject to the same provenance, trust, and admission standards as other observatory records.

- **Telemetry Authority and Field Ownership** (`docs/telemetry-authority-and-field-ownership.md`) — Defines field authority and ownership. Classification fields must have defined authority, owner, source, and writer before persistence rules are applied.

- **Persistence Standards** (`docs/persistence-standards.md`) — Defines how records survive over time. Classification observations must be persisted as append-only records with full provenance.

- **Model Evaluation Harness** (`docs/model-evaluation-harness.md`) — Defines evaluation methodology. Task classification provides the `packet_category` field context that allows evaluation results to be compared meaningfully across packets of similar classification.

---

## Constraints

- This document defines classification policy only.
- This document does not add SQLite schema.
- This document does not add CLI behavior.
- This document does not add routing logic.
- This document does not add model selection behavior.
- This document does not add autonomous execution behavior.
- This document does not add dashboards or reports.
- This document does not add aggregation behavior.
- This document does not implement task classification persistence.
- This document does not infer task classification from executor output.
- This document does not collapse classification axes into one status.
- This document does not allow routing decisions without admitted evidence.
- This document does not redesign ForgePilot architecture.
