# FP-MCP-371 Preview Artifact Design Record

## Result

Draft sandboxed command preview artifact design recorded.

## Artifact

- docs/mcp/sandboxed-command-preview-artifact-design.md

## Classification

    DRAFT_FOR_AUDITOR_REVIEW

## Scope

This packet defines the schema and policy requirements for future sandboxed command preview artifacts.

It does not implement preview tooling.

It does not implement sandbox execution.

It does not run bubblewrap.

It does not execute commands.

## Process Rule Demonstration

This packet is the first application of the FP-MCP-369A/370 process rule.

The preview artifact design introduces an execution-adjacent mechanism and is therefore explicitly flagged for auditor review at draft stage before implementation.

## Required Auditor Question

May this schema proceed to a later non-executing preview artifact writer implementation?

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

## Non-Execution Statement

No MCP implementation changed.

No sandbox preview tool was implemented.

No sandbox execution tool was implemented.

No bubblewrap command was executed.

No shell command was executed.

No command execution surface was exposed.

No OpenCode start, runner start contact, approval consumption, disable-switch clearing, FP-027 canary run, or MCP restart occurred.
