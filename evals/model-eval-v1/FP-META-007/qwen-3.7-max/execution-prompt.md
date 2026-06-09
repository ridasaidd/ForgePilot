# Execution Prompt — FP-META-007

**Model:** Qwen-3.7-Max
**Packet:** FP-META-007 — Evaluation Packet Quality Hardening
**Base commit:** e3ac874867fc000bfdd1d23a94505320a85ab987
**Branch:** eval/fp-meta-007/qwen-3.7-max
**Executor baseline:** EXECUTOR_BASELINE_V1
**Evaluation procedure:** model-eval-v1

---

## Packet

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
