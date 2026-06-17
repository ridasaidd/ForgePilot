# FP-META-013 — Model Execution Evidence Review

## Task

Review and consolidate model execution evidence from recent ForgePilot benchmark packets.

## Goal

Convert observed model behavior from recent packet executions into structured project knowledge without creating routing, ranking, recommendation, leaderboard, cost optimization, or automatic model-selection behavior.

FP-META-013 answers one question:

> What did ForgePilot learn from recent model execution evidence?

It does not answer:

> Which model is globally better?

## Scope

This packet reviews evidence from:

* FP-010
* FP-011
* FP-012

The review may include:

* packet-level execution summaries
* audit summaries
* correction summaries
* observed model behavior patterns
* implementation fidelity observations
* scope-discipline observations
* evidence-model alignment observations
* cost and correction-effort observations, when explicitly recorded
* limitations of the evidence

The review must remain descriptive and evidence-bound.

## Out of Scope

This packet must not add, change, or implement:

* model routing
* automatic model selection
* global model ranking
* leaderboards
* dashboards
* reports
* provider recommendation
* cost optimization logic
* local model benchmarking
* workflow orchestration changes
* packet execution policy changes
* SQLite schema changes
* migrations
* CLI behavior
* aggregation logic
* admission logic
* validation logic
* telemetry ingestion logic

## Governing Principles

This packet is constrained by:

* ForgePilot records observations, not narratives.
* Trust cannot be retroactively created.
* ForgePilot does not optimize for favorable outcomes.
* Only admitted evidence may influence observatory outputs.
* Classification follows observation.

## Core Rule

Model behavior observations are evidence records about specific packet executions.

They are not global truths.

They must not become routing policy, ranking policy, or provider preference.

## Evidence Sources

The executor must inspect available repository evidence for FP-010, FP-011, and FP-012, including when present:

* packet files
* executor result artifacts
* audit artifacts
* post-fix audit artifacts
* comparison result artifacts
* metrics artifacts
* relevant commits
* verification outputs

The executor must distinguish between:

* directly recorded evidence
* audit conclusions
* comparison conclusions
* inferred patterns
* unsupported speculation

Unsupported speculation must not be presented as evidence.

## Required Review Axes

The evidence review must evaluate each compared model only within the packet evidence available.

At minimum, the review must consider:

1. Packet alignment
2. Scope discipline
3. Schema fidelity
4. Evidence-model fidelity
5. Test behavior
6. Correction burden
7. Audit outcome
8. Cost or token burden, if available
9. Remaining uncertainty

## Required Output

The executor must create:

```text
docs/model-execution-evidence-review.md
runs/FP-META-013/evidence-review.md
runs/FP-META-013/model-behavior-observations.json
runs/FP-META-013/verification.txt
```

## Required Document Content

`docs/model-execution-evidence-review.md` must include:

1. Purpose
2. Scope
3. Evidence sources reviewed
4. Packet-by-packet summary
5. Cross-packet observations
6. Model behavior observations
7. Limitations
8. Non-decisions
9. Recommended next questions

## Required Run Artifact Content

`runs/FP-META-013/evidence-review.md` must include:

1. Packet list reviewed
2. Per-packet execution summaries
3. Per-packet audit summaries
4. Per-packet correction summaries
5. Observed behavior patterns
6. Evidence limitations
7. Final conclusion

## Required JSON Content

`runs/FP-META-013/model-behavior-observations.json` must contain structured observations.

The JSON must include:

```json
{
  "packet_id": "FP-META-013",
  "reviewed_packets": [],
  "models": [],
  "observations": [],
  "limitations": [],
  "non_decisions": []
}
```

The executor may add fields, but must not remove these required top-level keys.

Each observation must identify:

* the packet or packet range it is based on
* the model or models involved
* the observation type
* the evidence basis
* the confidence level
* whether it is directly observed or inferred

## Required Conclusions

The review must explicitly state that any observed model pattern is limited to the reviewed packets.

The review may state conclusions such as:

* one model showed stronger alignment on schema-bound evidence tasks
* one model required more correction to satisfy protocol fidelity
* one model produced broader initial implementations
* one model showed stronger audit utility

Only if supported by repository evidence.

The review must not state:

* one model is globally better
* one model should always be used
* one provider is preferred
* routing should change
* cost should determine selection
* future packets should automatically select a model

## Acceptance Criteria

1. `docs/model-execution-evidence-review.md` exists.
2. `runs/FP-META-013/evidence-review.md` exists.
3. `runs/FP-META-013/model-behavior-observations.json` exists.
4. `runs/FP-META-013/verification.txt` exists.
5. The review covers FP-010, FP-011, and FP-012.
6. The review separates direct evidence from inference.
7. The review includes packet-by-packet summaries.
8. The review includes cross-packet observations.
9. The review includes limitations.
10. The review includes non-decisions.
11. The JSON artifact contains the required top-level keys.
12. JSON observations include evidence basis and confidence level.
13. The review does not create global model rankings.
14. The review does not create routing recommendations.
15. The review does not create cost optimization rules.
16. No SQLite schema, migration, CLI, routing, dashboard, report, or workflow behavior is added.
17. Existing tests continue to pass.
18. The executor runs project verification.
19. The review is evidence-bound and does not present unsupported speculation as fact.

## Verification

The executor must run:

```bash
pnpm typecheck
pnpm test
```

The executor must record the verification result in:

```text
runs/FP-META-013/verification.txt
```

## Notes

This packet is intentionally reflective.

It is a pause point after FP-010, FP-011, and FP-012.

Its purpose is to preserve what has been learned before deciding the next implementation direction.

