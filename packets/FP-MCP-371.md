# FP-MCP-371 — Sandboxed command preview artifact design

## Checkpoint Type

    MCP_SANDBOX_PREVIEW_ARTIFACT_DESIGN

## Summary

This packet records a non-executing draft design for future sandboxed command preview artifacts.

It is the first sandbox-phase packet after FP-MCP-369A and FP-MCP-370, and it intentionally demonstrates the new auditor-review process rule by flagging the schema for auditor review before any implementation work.

## Claim

    FP-MCP-371 defines a draft sandboxed command preview artifact schema and policy model without implementing MCP tooling, executing bubblewrap, executing shell commands, exposing execution capability, or admitting sandbox output as evidence.

## Design Artifact

    docs/mcp/sandboxed-command-preview-artifact-design.md

## Run Artifacts

    runs/FP-MCP-371/preview-artifact-design-record.md
    runs/FP-MCP-371/auditor-review-request.md

## Classification

    DRAFT_FOR_AUDITOR_REVIEW

## Process Rule Application

This packet introduces an execution-adjacent sandbox preview mechanism.

Under the FP-MCP-369A and FP-MCP-370 process rule, it must be reviewed by the auditor at draft stage before implementation.

This packet is the first demonstration of that rule.

## Core Design Decisions

- Preview is not execution.
- Preview is not approval.
- Preview is not evidence admission.
- Bubblewrap is reduced-risk sandboxing, not VM isolation.
- Copied workspace only.
- No real repository write mount.
- No host home mount.
- No secrets mount.
- No Docker socket mount.
- Network disabled by default.
- Timeout and output limits required.
- Exported artifacts require explicit paths.
- Future execution requires separate approval.
- Sandbox output is not admitted as evidence by default.
- Future sandbox output starts as NOT_EVALUATED and TIER_0_UNTRUSTED unless separately validated/admitted.

## Bubblewrap Caveat

Required wording carried forward:

    Bubblewrap reduces blast radius.
    Bubblewrap shares the host kernel.
    Bubblewrap does not provide VM-level isolation.

Any future preview artifact that omits this caveat or describes bubblewrap as full isolation is invalid.

## Required Auditor Question

    May this schema proceed to a later non-executing preview artifact writer implementation?

## Non-Goals

This packet does not:

- implement MCP tools
- execute commands
- invoke bubblewrap
- create approvals
- consume approvals
- contact runner start
- start OpenCode
- clear disable switches
- run FP-027 canary
- admit sandbox output as evidence
- restart MCP

## Non-Execution Boundary

    execution authorized: false
    approval consumed: false
    disable switch cleared: false
    runner start endpoint contacted: false
    OpenCode started: false
    FP-027 canary run: false

## Expected Result

    FP-MCP-371 records the sandboxed command preview artifact design and pauses for auditor review before implementation.
