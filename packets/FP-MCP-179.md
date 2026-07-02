# FP-MCP-179 — Runner Capability Predicate Mismatch Classification

## Task

Classify the `UNEXPECTED_SUPPORTED_OPERATION` reason observed in FP-MCP-178 before any execution enablement decision.

This packet is classification-only. It must not enable execution, contact the runner start endpoint, consume approval, start OpenCode, mutate request artifacts, or retry the canary.

## Question

What triggers `UNEXPECTED_SUPPORTED_OPERATION`, and is it benign noise or a real schema/policy drift?

## Expected Result

```text
RUNNER_CAPABILITY_PREDICATE_MISMATCH_CLASSIFIED_FAILS_CLOSED_FIX_REQUIRED_BEFORE_ENABLEMENT
```
