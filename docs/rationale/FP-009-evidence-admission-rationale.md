FP-009 Evidence Admission Rationale

Document Provenance

Produced: 2026-06-16
Method: Multi-model design review (Claude + GPT)
Status: Design rationale only — not an implementation packet
Related packet: packets/FP-009.md
Recommended path: docs/rationale/FP-009-evidence-admission-rationale.md

Purpose

This document records the design rationale behind FP-009: Evidence Admission Persistence.

FP-009 was not derived from a top-down schema design. It emerged from recursively applying one ForgePilot principle:

Everything that influences outputs must itself be trusted, validated, and provenance-complete.

The result is an event-sourced admission model where observations, admissions, review triggers, and invalidations are all treated as auditable records.

Core Scope Laws

FP-009 is governed by four scope laws:

1. Persistence is not admission.
2. Admission is an observation too.
3. The gate must be auditable by the same standards as what passes through it.
4. Invalidation begins with a recorded review trigger.

These laws prevent observation storage, evidence admission, and invalidation authority from collapsing into a single mutable state field.

Primary Invariant

Current evidence eligibility is derived from the valid event chain, never stored as mutable truth on the observation.

Observation rows must not contain fields such as:

is_evidence = true
evidence_status = "ADMITTED"

Those fields would cause the observation row to claim a current evidentiary state that may later become false.

Instead, evidentiary standing is derived from append-only events.

Event Chain

The minimal FP-009 event chain is:

stored observation
↓
evidence admission event
↓
admission review request
↓
admission invalidation event, if required
↓
derived evidence eligibility

The minimal persistence set is:

evidence_admission_events
admission_review_requests
admission_invalidation_events

The observation remains immutable. Admission does not mutate the observation. Invalidation does not mutate the admission. Current state is computed from the valid event chain.

Reasoning Chain

The design emerged by closing each loophole created by the previous layer.

Observations need provenance

ForgePilot records observations, not narratives. A stored classification or outcome observation is only useful if its provenance is preserved.

This leads to the first boundary:

Persistence is not admission.

FP-008 may store classification and outcome observations, but it must not decide whether those observations are usable as evidence.

Admissions need provenance too

If admission determines whether an observation may influence outputs, then admission itself influences outputs.

Therefore, admission cannot be treated as a privileged invisible action.

This leads to the second boundary:

Admission is an observation too.

An admission event must have its own actor, basis, trust tier, validation state, and provenance.

The gate must be audited

If the admission gate is not auditable, then ForgePilot has protected the observations while leaving the gatekeeper untrusted.

This leads to the third boundary:

The gate must be auditable by the same standards as what passes through it.

An admission decision cannot grant evidentiary status unless the admission event itself is trusted, validated, and provenance-complete.

Admissions can be wrong

An admission event may later be discovered to have incomplete provenance, an actor mismatch, a validation error, or another defect.

Because rows are immutable, ForgePilot must not rewrite the original observation or the admission event.

Instead, it must append an invalidation event that references the admission event.

This produces:

admission_invalidation_events

Invalidation targets the admission event, not the underlying observation.

Invalidation cannot be arbitrary

If invalidation events can appear without a recorded trigger, the beginning of the review chain is lost.

ForgePilot would know that something was invalidated, but not why the review began.

This leads to the fourth boundary:

Invalidation begins with a recorded review trigger.

An admission invalidation must be preceded by an admission review request.

This produces:

admission_review_requests

A review request does not invalidate anything by itself. It records that an admission event has been challenged, selected, or flagged for review.

Derived State

FP-009 must avoid storing current evidence eligibility as mutable truth on the original observation.

Instead, evidence eligibility is derived from the event chain:

observation exists
↓
valid admission event exists
↓
no later valid invalidation event defeats that admission
↓
observation is currently eligible as evidence

This preserves historical truth.

The observation row says only what was observed.

The admission event says that the observation was admitted.

The review request says why the admission was reviewed.

The invalidation event says whether the admission’s authority was removed.

No row is rewritten to fit the latest interpretation.

Trust Amplification Prevention

The FP-009 model prevents trust amplification.

A low-trust admission event cannot turn a high-quality observation into routing-grade evidence. Promotion requires earned provenance at each layer.

The evidentiary ladder is:

stored observation
→ validated observation
→ admitted evidence
→ routing-grade evidence

No rung may be skipped.

Anything that authorizes evidence must itself be evidence-grade.

Out of Scope

FP-009 does not define:

* reporting
* dashboards
* routing
* model selection
* aggregation
* automated review scheduling
* policy optimization
* scoring logic

FP-009 only defines the persistence boundary for admission, review triggers, and invalidation.

Summary

FP-009 exists to make evidence admission structurally enforceable.

It does not make observations truthful by mutation.

It records the chain of decisions that determine whether an observation may currently be used as evidence.

The observatory remains honest because no layer is immune from audit.
