# FP-MCP-163 — Structured Approval Integration for Pre-Execution Evidence

## Task

Integrate structured human approval evidence into the pre-execution evidence checks used before any remote run handoff.

## Goal

Use the canonical human approval validator consistently across guarded status, pre-execution evidence, and snapshot checks.

## Background

FP-MCP-162 proved that structured popup approval is accepted by guarded status.

The remaining gap is that the older pre-execution evidence checks still report approval-related blockers even when guarded status accepts the same approval artifact.

## Safety Boundary

This packet must not enable execution, consume approval, contact the runner handoff endpoint, start OpenCode, mutate request artifacts, or override disable policy.

## Required Behavior

1. Pre-execution evidence checks may accept a provided approval id.
2. Approval acceptance must use `validateHumanApprovalRecord`.
3. Snapshot checks must observe the pre-execution evidence result.
4. Existing artifact hash checks must remain intact.
5. All execution side-effect fields must remain false.
