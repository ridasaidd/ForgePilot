# ForgePilot Metrics

## Purpose

ForgePilot is a software production observatory for AI-assisted development. Its purpose is to collect evidence about what causes successful AI-assisted software delivery.

## Versions

### ForgePilot V0 — Manual Workflow + Spreadsheet

Initial data collection phase. Tasks are executed manually and results are logged into a CSV spreadsheet (`metrics/packet-log.csv`). No automation.

### ForgePilot V1 — Same Workflow + SQLite

The manual workflow remains, but the CSV is replaced with a SQLite database. This enables structured querying of collected evidence.

### ForgePilot V2 — Evidence-Based Routing

Collected evidence is used to make routing decisions. Packet templates and model selection are informed by historical outcomes.

### ForgePilot V3 — Adaptive Routing

Routing decisions are made adaptively in real time based on a growing body of evidence. The system continuously improves its decision-making as more data is collected.

## Hypotheses

The following hypotheses guide the evidence collection and analysis:

### H1: Better model selection improves outcome quality

Selecting the right implementation and audit models for a given task type and packet template leads to better results, higher first-pass success rates, and shorter completion times.

### H2: Better clarification improves packet quality

High-quality clarifications (precise, resolved before execution) result in packets that are more complete, unambiguous, and likely to succeed on first pass.

### H3: Better packet quality improves execution outcome

Well-structured, clear packets lead to higher first-pass success rates, fewer fix attempts, and fewer escalations.

### H4: Better audit quality improves final acceptance quality

Thorough, accurate audits correlate with higher human acceptance rates and fewer undetected issues reaching the human reviewer.

### H5: Better workflow quality improves outcome quality

The overall workflow quality — encompassing model selection, clarification, packet quality, and audit quality — is the strongest predictor of successful outcomes.

## Root Cause Taxonomy

When a packet fails or requires rework, the root cause is classified into one of the following levels:

| Level       | Description |
|-------------|-------------|
| ENVIRONMENT | The failure is due to the execution environment (missing dependencies, configuration issues, runtime errors). |
| PACKET      | The failure is due to the packet itself (ambiguous requirements, missing context, incorrect scope). |
| EXECUTOR    | The failure is due to the executor (model limitations, implementation errors, misinterpreting the packet). |
| AUDITOR     | The failure is due to the auditor (missed issues, incorrect rejection, poor feedback quality). |
| HUMAN       | The failure is due to human input (incorrect clarifications, wrong acceptance, unclear requirements). |
