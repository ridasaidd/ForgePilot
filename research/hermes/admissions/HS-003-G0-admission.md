# HS-003 — G0 Admission Record

## Decision

**ADMIT WITH LIMITATIONS**

## Date

2026-08-02

## Admitting Authority

G0 human governance

## Subject

HS-003 — Hermes Human Interaction and Control Plane Survey

## Canonical Packet

- Path: `research/hermes/experiments/HS-003-packet.md`
- Commit: `c0a3f4c8fbbf22f483f31efcfb88f3bcf7967297`
- SHA-256: `40ce36cc0633ca5d5946ed440ca9f7de6d96f69b4643a29f4832cb8186af3cc1`
- Size: `14,588 bytes`

## Canonical Deliverable

- Path: `research/hermes/experiments/HS-003-deliverable.md`
- Commit: `de3a98d3fed64078146e17065960ae7799d95863`
- SHA-256: `4261081f451808bfcb70b868d838d90d413d03d5c77bdfa39642256f0591c2ad`
- Size: `66,863 bytes`
- Lines: `741`

The repository copy above is the canonical admitted artifact. The stale workspace path recorded during synthesis is not canonical. The durable Hermes attachment and repository copy were verified byte-identical.

## Workflow Evidence

- Board: `hs-003`
- OC task: `t_53ab19cd`
- GC task: `t_7fa30ccb`
- Verifier task: `t_f19164b0`
- Verifier verdict: `PASS`
- Synthesizer task: `t_cdfcdf15`
- G1 review run: `run_04392cf3c4f44f4a8ebb4f3c33bda404`
- G1 recommendation: `ADMIT WITH LIMITATIONS`

## Admitted Knowledge Claims

1. Hermes 0.19.1 provides native Kanban controls for comments, unblock, rerun on the same task, archive, triage as status, recurrence inspection, dependency linking, assignment, and status changes.

2. A `needs_input` outcome terminates the active native run. Unblocking creates a new native run on the same task; it does not resume the original blocked run in place.

3. Task identity, dependency relationships, comments, events, run history, and attached evidence are preserved across blocked outcomes and reruns.

4. Block-loop primitives exist and use a recurrence limit of `2`, but documented end-to-end halt behavior is contradicted by local observation. The locally observed auto-decomposer can re-promote a triaged task and permit repeated dispatch.

5. Hermes supports remote notification and human-answer flows through messaging infrastructure at documentation and source levels, but no messaging platform was configured or live-tested during HS-003.

6. The current ForgePilot Hermes MCP exposes only a narrow subset of native control-plane mutations. Important lifecycle operations remain native to Hermes but are not exposed through the current adapter.

7. Keeping the Hermes dashboard open is not inherently required for governance because native CLI and messaging-oriented control paths exist. The current ForgePilot integration does not yet provide a complete asynchronous human-decision path.

8. The smallest justified next integration is a bounded ForgePilot adapter around existing Hermes capabilities, not a broad replacement control plane.

## Admission Limitations

- End-to-end block-loop containment is admitted at **MEDIUM confidence**.
- Messaging claims are documentation/source-supported and locally unconfigured, not live-verified.
- Same-run resume and worker-session resume are not admitted as supported.
- A distinct quarantine primitive is not admitted as supported; triage is the observed native mechanism.
- OC workflow rediscovery remains incompletely proven as one composite operation.
- The proposed adapter surface is admitted only as a design recommendation, not as implementation authorization.
- No live messaging test, messaging configuration, adapter implementation, Hermes patch, or service mutation is authorized by this admission.

## Recommended Next Step

Prepare a separate implementation packet for a minimal, approval-gated ForgePilot Hermes lifecycle adapter evaluating:

- recurrence inspection;
- pending human-decision listing;
- task comment;
- task edit with expected-state precondition;
- unblock with expected status;
- archive;
- one-shot redispatch.

Any future mutation tool must preserve exact board and task identity, expected-state checks, idempotency, explicit authorization, durable audit events, and prohibit generic shell or arbitrary database writes.

## G0 Statement

G0 admits HS-003 with the limitations above.

This decision admits the recorded knowledge claims into ForgePilot. It does not authorize implementation work or additional live experiments.
