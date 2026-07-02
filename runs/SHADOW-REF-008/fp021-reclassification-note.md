# SHADOW-REF-008 FP-021 Reclassification Note

FP-021 splits the two SHADOW-REF-008 blockers into separate findings:

```text
Finding 1: SHADOW-REF packet id rejected by validator
Disposition: VALIDATION_NAMESPACE_BUG

Finding 2: forgepilot_start_opencode_worker spawned OpenCode while execution status reported disabled
Disposition: SAFETY_GATE_FAILURE
```

The earlier SHADOW-REF-008 label `DEFERRED_INFRASTRUCTURE_FAILURE` remains appropriate only for the blocked extraction handoff as a whole.

It is not precise enough for the second finding.

The worker-start disabled-state bypass must be treated as a safety-gate failure and must block further extraction until fixed and regression-tested.
