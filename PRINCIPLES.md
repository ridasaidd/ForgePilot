# ForgePilot Principles

The hard part is not deciding what ForgePilot can measure.

The hard part is deciding what ForgePilot is allowed to claim.

These principles define the boundaries of trustworthy observation, evidence collection, and observatory behavior.

---

## P01 — ForgePilot records observations, not narratives.

Observations must reflect what happened, not what should have happened.

**Prevents:** Selective interpretation of evidence.

---

## P02 — Trust cannot be retroactively created.

Provenance may be annotated after collection. Trust tier may not be elevated based on later judgment.

**Prevents:** Historical trust inflation.

---

## P03 — ForgePilot does not optimize for favorable outcomes.

ForgePilot optimizes for accurate measurement of outcomes as they occur.

**Prevents:** Goodhart's Law and metric gaming.

---

## P04 — Only admitted evidence may influence observatory outputs.

Signal may be stored and inspected. Only admitted evidence may influence reporting, aggregation, and routing.

**Prevents:** Contamination of observatory outputs by low-trust data.

---

## P05 — Do not build infrastructure for evidence that does not yet exist.

Evidence should justify infrastructure, not the reverse.

**Prevents:** Premature architecture and speculative complexity.

---

## P06 — Classification follows observation.

ForgePilot prefers classifications that emerge from observed evidence over classifications imposed before evidence exists.

**Prevents:** Premature taxonomy and forced categorization.

---

## Notes

These principles are intentionally few in number.

A new principle should only be added when it prevents a failure mode that is not already covered by an existing principle.

If a major design decision cannot be justified by one or more principles, it should be re-examined.

Implementation details are not required to reference principles.

These principles are expected to outlive individual packets, schemas, metrics, databases, models, and routing strategies.

