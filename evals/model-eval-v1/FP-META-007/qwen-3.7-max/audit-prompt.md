# Audit Prompt — FP-META-007

**Task:** FP-META-007 — Evaluation Packet Quality Hardening

---

## Instructions

You are an auditor. Your sole responsibility is to verify that the executor's
output satisfies the original packet as written.

### Rules

1. **Audit against the original packet only.** Do not evaluate work that was not
   requested. Do not audit against imagined requirements.

2. **Do not reward extra work.** Work beyond the packet scope is not relevant to
   the audit. Extra work does not compensate for missed requirements.

3. **Do not suggest architecture expansion.** Do not propose new features,
   refactors, or design changes beyond what the packet specifies.

4. **Do not accept partial completion unless explicitly allowed.** If the packet
   does not state that partial completion is acceptable, all deliverables must
   be satisfied. Partial completion is a FAIL.

5. **Return the structured output below.** Do not add commentary, summaries, or
   explanations outside the required fields.

---

## Original Packet

# FP-META-007 — Evaluation Packet Quality Hardening

## Goal

Improve ForgePilot evaluation packet quality so future model benchmarks are less ambiguous and easier to compare.

## Problem

FP-EVAL-002 exposed an ambiguity: "Successful packets" was not mapped to a documented `packets.status` value.

This allowed two accepted implementations to interpret success differently:

- `status = 'completed'`
- `status = 'success'`

Future benchmark packets must define semantic terms clearly enough that accepted implementations are directly comparable.

## Requirements

Update the evaluation procedure documentation so future FP-EVAL packets must include:

1. Explicit domain vocabulary
2. Required status/value mappings
3. Allowed interpretation boundaries
4. Constraint adherence checklist
5. Comparison rubric
6. Ambiguity review before executor runs

## Acceptance Criteria

- Evaluation packet template/checklist documents status/value semantics.
- Future packets must define any status values used in success/failure metrics.
- Future comparisons must record:
  - correctness
  - constraint adherence
  - invasiveness
  - test quality
  - ambiguity discovered
- No source code changes required unless existing docs tooling requires it.
- Existing tests pass.

## Verification

Run:

pnpm typecheck
pnpm test

---

## Executor Result

# FP-META-007 Executor Result

## Status: SUCCESS

## Summary

Updated `docs/model-evaluation-harness.md` with a Comparison Rubric (five dimensions: correctness, constraint adherence, invasiveness, test quality, ambiguity discovered) and Packet Quality Requirements (explicit domain vocabulary, required status/value mappings, allowed interpretation boundaries, constraint adherence checklist, comparison rubric fields, ambiguity review). Updated `evals/model-eval-v1/README.md` with a Packet Quality Checklist covering status/value semantics, ambiguity review process, required packet sections, and comparison record requirements.

## Files Changed

- `docs/model-evaluation-harness.md` — Added "Comparison Rubric" section and "Packet Quality Requirements" section.
- `evals/model-eval-v1/README.md` — Added "Packet Quality Checklist" section with four subsections.

## Design Decisions

- Documentation only. No runtime, CLI, or code changes.
- Comparison Rubric placed after Measured Variables to define evaluation dimensions before Evaluation Rules reference them.
- Packet Quality Requirements placed before Constraints to keep methodology documentation grouped together.
- Packet Quality Checklist in README mirrors the harness doc requirements in checklist form for practical use.
- No model routing, broker integration, autonomous execution, or workflow orchestration added.

---

## Verification Output

$ pnpm typecheck
> tsc --noEmit
(exit 0)

$ pnpm test
> node --experimental-test-module-mocks --import tsx --test tests/*.test.ts
▶ ForgePilot
  ✔ should have a working test harness (3.215751ms)
  ✔ should confirm environment-centric architecture principle (1.410069ms)
✔ ForgePilot (5.850517ms)
▶ Database client
  ✔ should initialize the database and create the data directory (36.47004ms)
  ✔ should throw when getDb is called before initDb (0.781026ms)
✔ Database client (40.767654ms)
▶ Database migration
  ✔ should create the events table via migration (38.369669ms)
  ✔ should be idempotent (running migrate twice does not fail) (58.990825ms)
  ✔ should create all required core schema tables (56.990545ms)
  ✔ should have correct foreign keys on core schema tables (56.073054ms)
✔ Database migration (211.00943ms)
▶ CLI prompt-baselines
  ✔ should print ForgePilot and prompt baseline file paths (982.422608ms)
✔ CLI prompt-baselines (982.694926ms)
▶ Packet metrics
  ✔ should return zero counts when no packets exist (39.583551ms)
  ✔ should count completed and failed packets correctly (0.848507ms)
  ✔ CLI packet-metrics should print all three labels (954.989448ms)
  ✔ CLI packet-metrics should succeed with zero counts on empty db (55.419678ms)
✔ Packet metrics (1112.519921ms)
ℹ tests 13
ℹ suites 5
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2782.613528
(exit 0)

$ test -f docs/model-evaluation-harness.md && echo "PASS" || echo "FAIL"
PASS

$ test -f evals/model-eval-v1/README.md && echo "PASS" || echo "FAIL"
PASS

---

## Git Status

On branch eval/fp-meta-007/qwen-3.7-max
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   docs/model-evaluation-harness.md
	modified:   evals/model-eval-v1/README.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	runs/FP-META-007/

no changes added to commit (use "git add" and/or "git commit -a")

---

## Relevant Diff

diff --git a/docs/model-evaluation-harness.md b/docs/model-evaluation-harness.md
index bf6e483..cfa06ab 100644
--- a/docs/model-evaluation-harness.md
+++ b/docs/model-evaluation-harness.md
@@ -34,6 +34,20 @@ The following variables are recorded per evaluation run:
 
 ---
 
+## Comparison Rubric
+
+Every model comparison must evaluate and record these five dimensions:
+
+1. **Correctness** — Did the executor satisfy all stated requirements and acceptance criteria? Verified against the auditor's determination.
+2. **Constraint adherence** — Did the executor respect all implementation constraints? Verified by diff inspection for prohibited changes.
+3. **Invasiveness** — How much did the executor modify beyond the minimum necessary? Measured by file count, diff size, and whether existing modules were modified unnecessarily.
+4. **Test quality** — Are the executor's tests well-structured, do they cover stated requirements, and do they avoid coupling to implementation details?
+5. **Ambiguity discovered** — Did the packet contain ambiguous or underspecified requirements that led to divergent interpretations? Documented to improve future packet quality.
+
+Comparisons must record which dimensions favored each model with supporting reasoning.
+
+---
+
 ## Evaluation Rules
 
 The following rules govern all evaluation runs:
@@ -88,6 +102,42 @@ Per-model run storage isolates each model's run artifacts under `evals/model-eva
 
 ---
 
+## Packet Quality Requirements
+
+Future FP-EVAL benchmark packets must include the following to eliminate ambiguity and enable fair comparisons.
+
+### Explicit Domain Vocabulary
+
+Packets must define all domain-specific terms used in requirements and acceptance criteria. Qualitative labels such as "successful", "failed", "valid", or "clean" must be defined unambiguously. If a term maps to a programmatic value (database column, enum, constant), that mapping must be stated explicitly.
+
+### Required Status/Value Mappings
+
+Any status value used in success or failure metrics must be documented in the packet. If "successful" corresponds to a specific `packets.status` value, the packet must state which value or values constitute success. Packets must not rely on executor inference of undocumented mappings.
+
+### Allowed Interpretation Boundaries
+
+Packets must specify which interpretations are allowed and which are prohibited. If a requirement allows multiple valid approaches, those approaches must be enumerated or bounded. If a requirement has exactly one valid interpretation, that must be stated.
+
+### Constraint Adherence Checklist
+
+Every packet must include a constraint adherence checklist in its acceptance criteria. Each constraint must be independently verifiable. Example items:
+
+- No schema changes.
+- No migrations added.
+- Only allowed files modified.
+- No routing logic added.
+- No provider logic added.
+
+### Comparison Rubric Fields
+
+Every FP-EVAL packet must require the comparison record to include all five comparison rubric dimensions: correctness, constraint adherence, invasiveness, test quality, and ambiguity discovered.
+
+### Ambiguity Review
+
+Before executor runs begin, the packet author must perform an ambiguity review. Every status label, value mapping, and qualitative term must be traceable to a concrete programmatic artifact or an explicit definition. The review must confirm that no term can be interpreted in more than one way by a reasonable executor. Any disambiguations must be recorded in the packet itself.
+
+---
+
 ## Constraints
 
 * This harness defines methodology only. It does not add model routing.
diff --git a/evals/model-eval-v1/README.md b/evals/model-eval-v1/README.md
index 6e28308..2524e9d 100644
--- a/evals/model-eval-v1/README.md
+++ b/evals/model-eval-v1/README.md
@@ -35,6 +35,47 @@ This isolates run artifacts per model per packet, enabling fair and auditable co
 5. Record measured variables for each run.
 6. Compare results across models.
 
+## Packet Quality Checklist
+
+Before using a benchmark packet for model evaluation, verify the following.
+
+### Status/Value Semantics
+
+* Every status label used in the packet (e.g., "successful", "failed", "completed") must be defined explicitly.
+* If a status label maps to a database value, enum, or programmatic constant, that mapping must be stated in the packet.
+* No packet may rely on executor inference of undocumented status or value mappings.
+
+### Ambiguity Review
+
+The packet author must perform an ambiguity review before executor runs begin:
+
+* Identify every qualitative term in the packet (status labels, outcome descriptions, state transitions).
+* Confirm each term traces to a concrete programmatic artifact or an explicit definition.
+* Verify that no term can be interpreted in more than one way by a reasonable executor.
+* Document any disambiguations made during the review in the packet itself.
+
+### Required Packet Sections
+
+Every FP-EVAL benchmark packet must include:
+
+1. **Explicit domain vocabulary** — All domain-specific terms defined unambiguously.
+2. **Required status/value mappings** — Every status value used in metrics documented with its programmatic mapping.
+3. **Allowed interpretation boundaries** — Which interpretations are allowed and which are prohibited for each requirement.
+4. **Constraint adherence checklist** — All implementation constraints enumerated as independently verifiable acceptance criteria.
+5. **Comparison rubric reference** — Comparison must record correctness, constraint adherence, invasiveness, test quality, and ambiguity discovered.
+
+### Comparison Record Requirements
+
+Every model comparison must document these five dimensions with reasoning:
+
+1. **Correctness** — Whether each model satisfied all stated requirements.
+2. **Constraint adherence** — Whether each model respected all implementation constraints.
+3. **Invasiveness** — How much each model modified beyond the minimum necessary.
+4. **Test quality** — Whether each model's tests are well-structured and cover acceptance criteria.
+5. **Ambiguity discovered** — Any packet ambiguities that led to divergent model interpretations.
+
+---
+
 ## Contamination Prevention
 
 The following rules must be followed to ensure fair model comparisons:

---

## Required Output

Return exactly:


AUDIT_STATUS: ACCEPTED | REJECTED | NEEDS_FRONTIER_REVIEW

BLOCKING_ISSUES:

NON_BLOCKING_NOTES:

ROOT_CAUSE_LEVEL:
ENVIRONMENT | PACKET | EXECUTOR | AUDITOR | HUMAN | NONE

ROOT_CAUSE_REASON:

REQUIRED_FIX_PACKET:
