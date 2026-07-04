# FP-MCP-277 — FP-027 Master Checklist Reconciliation

## Purpose

This checklist is the steering artifact for FP-027 guarded runner start work.

It is derived from admitted evidence, not from memory or from the master plan narrative. The master plan may orient future sessions, but the ledger proves current state and this checklist steers next action.

## Standing rule carried forward from FP-MCP-268

> Do not declare FP-027 satisfied by resemblance to any OpenCode HTTP execution path. It requires the guarded runner start path with the original boundary evidence present at the moment of runner contact.

Current FP-027 status: **OPEN_UNSATISFIED_END_TO_END**.

## Current tuple prepared by FP-MCP-276

- execution packet: `FP-MCP-276`
- request id: `REQ-20260704T115428653Z-fc0b6275`
- request artifact: `runs/FP-MCP-276/opencode-requests/REQ-20260704T115428653Z-fc0b6275.json`
- model: `deepseek-v4-pro-high`
- run mode: `DESIGN_ONLY`
- branch: `main`
- execution base commit: `3a62f84`
- latest known request artifact commit at FP-MCP-276 close: `dd90b96`
- target workspace: `forgepilot`

Important: if any new evidence commit is added before preview/clearance, use the then-current clean ForgePilot HEAD as `requestArtifactCommit`; do not reuse stale HEAD values.

## Status vocabulary

- `DONE`: admitted evidence satisfies the checklist item for current state.
- `BLOCKED`: item cannot proceed until a named blocker is removed.
- `NOT_STARTED`: item has not been attempted for the current fresh tuple.
- `OPEN`: standing condition remains unresolved.
- `COMPENSATED`: original requirement was not satisfied directly, but an admitted compensating control exists.

## Canonical checklist

| # | Checklist item | Status | Evidence anchor | Current blocker / next action |
|---:|---|---|---|---|
| 1 | Preserve FP-027 standing rule: no HTTP-path resemblance can satisfy guarded runner start. | DONE | FP-MCP-268, evidence 142 | Keep verbatim rule in all future FP-027 steering artifacts. |
| 2 | Confirm original FP-027 remains unsatisfied end-to-end. | OPEN | FP-MCP-268, evidence 142 | Requires actual guarded runner start path with boundary evidence at moment of runner contact. |
| 3 | Account for historical evidence IDs 103–141 and stale approval reuse window. | DONE | FP-MCP-268, evidence 142 | Do not reuse stale FP-MCP-233/FP-MCP-223 tuple. |
| 4 | Confirm popup-mediated MCP local clearance policy decision is explicit rather than accidental. | DONE | FP-MCP-268 carrying FP-MCP-236 decision | Popup-mediated clearance is allowed only under scoped, short-lived, single-use controls. |
| 5 | Define popup human-attention requirements before relying on popup clearance. | DONE | FP-MCP-269, evidence 143 | Requirements are recorded. |
| 6 | Verify platform popup itself satisfies human-attention requirements. | COMPENSATED | FP-MCP-270, evidence 144; FP-MCP-271, evidence 145; FP-MCP-273/274 | Actual popup was not compliant by itself; use preview/review manifest as compensating control. |
| 7 | Observe actual clearance popup and classify risk. | DONE | FP-MCP-271, evidence 145 | Popup partially informative, but missing full tuple and exposes `Always allow`. |
| 8 | Establish operator doctrine: popup is final brake, not review. | DONE | FP-MCP-272, evidence 146 | Operator must review before popup; `Always allow` forbidden for fresh-scoped high-significance actions. |
| 9 | Implement clearance review manifest preview tool. | DONE | FP-MCP-273, evidence 147; bridge commit `1ff559e` | Tool implemented and directly validated. |
| 10 | Live-surface preview tool in ChatGPT MCP. | DONE | FP-MCP-274, evidence 148 | Live read-only preview succeeded. |
| 11 | Confirm runner guarded start capability is reachable/callable. | DONE | FP-MCP-275, evidence 149 | Runner capability endpoint reachable; start capability callable but guarded. |
| 12 | Prepare fresh non-executing request artifact for current attempt. | DONE | FP-MCP-276, evidence 151 | Request `REQ-20260704T115428653Z-fc0b6275` exists. |
| 13 | Validate fresh request locally without runner start. | DONE | FP-MCP-276, evidence 151 | Local validation passed. |
| 14 | Validate fresh request via runner validate-request endpoint only. | DONE | FP-MCP-276, evidence 151 | Validate-request accepted; runner start endpoint not contacted. |
| 15 | Record fresh human approval evidence after operator review. | NOT_STARTED | FP-MCP-276 approval path prepared, evidence 151 | Requires explicit operator approval after reviewing request and manifest. |
| 16 | Validate fresh human approval evidence. | NOT_STARTED | — | Requires approval artifact ID. |
| 17 | Run clearance review manifest preview against fresh approved tuple. | NOT_STARTED | FP-MCP-273/274 tool available | Requires fresh approval artifact ID and current clean `requestArtifactCommit`. |
| 18 | Create popup-mediated local clearance for exact fresh tuple. | NOT_STARTED | FP-MCP-236 policy via FP-MCP-268; preview tool via FP-MCP-274 | Only after operator reviews manifest and chooses `Allow once`, not `Always allow`. |
| 19 | Validate local clearance status for exact fresh tuple. | NOT_STARTED | clearance observer exists from earlier work | Requires created local clearance. |
| 20 | Handle global disable switch through explicit gated decision. | BLOCKED | FP-MCP-275/276 show global disable active | Requires separate deliberate disable-switch clearance policy/action; not implicit. |
| 21 | Ensure runner execution and OpenCode execution are enabled only by explicit gate. | BLOCKED | FP-MCP-275/276 show runner/OpenCode execution disabled | Requires explicit enablement decision; no momentum-based enablement. |
| 22 | Record approved pre-start evidence. | NOT_STARTED | FP-MCP-276 preflight says missing | Requires fresh approval and readiness gates. |
| 23 | Capture process/state evidence immediately before runner start contact. | NOT_STARTED | FP-MCP-268 missing evidence list | Must be present at contact boundary, not reconstructed afterward. |
| 24 | Verify abort-readiness immediately before runner start contact. | NOT_STARTED | FP-MCP-268 missing evidence list | Must be live and checked at boundary. |
| 25 | Record explicit no-retry/no-chaining state-machine evidence at contact boundary. | NOT_STARTED | FP-MCP-268 missing evidence list | Must prevent accidental second start or chained retry. |
| 26 | Contact guarded runner start endpoint exactly once for the fresh tuple. | NOT_STARTED | — | Only after items 15–25 pass. |
| 27 | Immediately record approval consumption after successful start. | NOT_STARTED | FP-MCP-268 missing evidence list | Must be mechanical and tied to success boundary. |
| 28 | Capture post-start state/runner run ID evidence. | NOT_STARTED | runner requirements from FP-MCP-275 | Requires actual guarded start. |
| 29 | Verify canary result and boundary evidence. | NOT_STARTED | — | Requires actual guarded start result artifacts. |
| 30 | Admit or reject FP-027 result based on evidence, not narrative. | NOT_STARTED | ForgePilot evidence discipline | Requires verification/audit/admission path after actual canary. |

## Current next allowed action

The next allowed action is **operator review of the prepared request and manifest**, followed by either explicit approval or explicit hold/denial.

The next forbidden action is any runner start contact, OpenCode start, prompt submission, wait call, approval consumption, or disable-switch change before the missing checklist items are satisfied.

## Master plan follow-up

After this checklist is admitted, FP-MCP-278 should update the master plan as an orientation document only. It should point to the ledger and this checklist rather than restating live current state as if the plan were authoritative.

Known future gap to preserve in the master plan: the minimum admitted-evidence threshold for trustworthy routing per model/task-class is undetermined and requires its own later standard.
