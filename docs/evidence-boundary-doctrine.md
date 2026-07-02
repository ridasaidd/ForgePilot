# Evidence Boundary Doctrine

## Purpose

ForgePilot exists to separate intent, observation, verification, admission, comparison, and completion.

The doctrine below defines what may and may not be inferred at each boundary.

## Core Boundary Rules

```text
Discussion is not evidence.
A packet is not execution.
Implementation is not evidence by itself.
Verification is not admission.
Observation is not routing input.
Audit is not comparison.
Comparison is not routing.
Completion requires committed evidence.
```

## Boundary Levels

| Level | Meaning | What it proves | What it does not prove |
|---|---|---|---|
| Discussion | A design or plan was talked about. | Nothing operational. | It does not prove existence, correctness, or completion. |
| Packet | Work intent and success criteria were committed. | The task was defined. | It does not prove execution or correctness. |
| Implementation | Files changed and were committed. | Code or docs exist. | It does not prove they work. |
| Verification | Checks/tests/builds/smokes passed and were recorded. | A defined check passed in an observed environment. | It does not admit evidence or prove final outcome. |
| Operational proof | A live path was directly exercised, such as direct MCP invocation. | The operational surface worked for the tested case. | It does not imply broad correctness beyond the case. |
| Observation | A telemetry/metrics/result record was captured. | Something was observed. | It is not admitted evidence or routing input by itself. |
| Admission | Evidence was explicitly admitted/rejected/quarantined. | The evidence boundary was crossed according to rules. | It does not optimize or route by itself. |
| Comparison | Admitted evidence was compared. | A bounded comparison result exists. | It does not authorize future routing unless a later policy says so. |
| Completion | Packet evidence satisfies acceptance criteria and is committed. | The packet is complete. | It does not imply adjacent capabilities are complete. |

## ForgePilot Completion Rule

A capability is complete only when committed evidence proves the required boundaries for that capability.

For example:

- a documentation packet can be complete with committed docs plus verification that scope stayed documentation-only,
- an MCP tool packet is not complete until direct MCP proof is recorded after OpenAI Actions schema refresh,
- a persistence packet is not complete until write/read behavior is verified and evidence is recorded,
- telemetry query visibility does not make telemetry meaningful.

## Admitted Evidence Rule

Only admitted evidence may influence observatory outputs that claim evidence-backed conclusions.

Non-admitted observations may be displayed as observations, but must not be silently promoted to proof.

## Routing Boundary

No routing, ranking, cost optimization, or model-quality inference may be derived from telemetry unless a future packet explicitly defines and admits that policy.

## Reusable Pattern

For other projects, the transferable rule is:

```text
Intent → Execution → Observation → Verification → Admission → Comparison → Reporting
```

Never collapse these into one status field.
