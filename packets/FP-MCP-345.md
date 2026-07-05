# FP-MCP-345 — Capability-Separated Clearance Tool Surface Probe

## Status

IMPLEMENTED

## Type

MCP Tool Surface Refactor

## Purpose

Test the hypothesis that ChatGPT-hosted MCP safety blocks are worsened by mode-switched tools whose side-effect class changes based on arguments or gate state.

## Implementation Summary

The MCP bridge now exposes capability-separated clearance-stage tools:

- forgepilot_observe_next_gate
- forgepilot_preview_clearance_creation
- forgepilot_record_clearance_intent

The existing mode-switched wrapper remains compatible but is marked deprecated for ChatGPT-facing follow-on behavior.

## Bridge Commits

- f4de231 Implement FP-MCP-345 capability-separated clearance surface
- 83d0906 Hardening FP-MCP-345: intentPacketId, strengthened validation, preview eligibility, expiry bounds

## Audit Result

GPT audit result: ACCEPT WITH CAVEAT.

The implementation satisfies the capability-separation goal. The remaining caveat is that the full happy-path intent write could not be fully end-to-end tested with committed synthetic fixtures because of git HEAD circularity. Rejection paths and side-effect boundaries are tested, and live validation with real committed artifacts remains required.

## Boundary

The new ChatGPT-safe tools must not:

- create clearance
- create enablement
- consume approval
- clear disable switch
- contact runner start endpoint
- start OpenCode

## Result

Implementation accepted for live MCP behavior probe.
