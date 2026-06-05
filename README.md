# ForgePilot

ForgePilot is a software production observatory for AI-assisted development.

Its purpose is not to create autonomous agents.

Its purpose is to measure, understand, and improve AI-assisted software development workflows.

ForgePilot treats workflow as the primary unit of optimization.

Models, executors, auditors, clarifiers, and tools are replaceable participants in a measured process.

The environment is persistent.

The workflow is permanent.

Agents are disposable.

ForgePilot environment owns truth.

Agents own no truth.

---

## Core Question

What causes successful AI-assisted software delivery?

ForgePilot does not assume that model quality is the primary determinant of success.

Instead, ForgePilot collects evidence about the relative contribution of:

* Clarification quality
* Packet quality
* Execution quality
* Audit quality
* Routing quality
* Model selection
* Workflow quality

---

## Evolution

### V0 — Evidence Collection

Manual workflow.

Spreadsheet-based metrics collection.

Human routing and human audit.

### V1 — Evidence Automation

Same workflow.

SQLite persistence.

CLI tooling.

Structured state and metrics.

### V2 — Evidence-Based Decisions

Metrics reporting.

Routing experiments.

Evidence-driven decision support.

### V3 — Adaptive Decisions

Adaptive routing.

Workflow optimization based on observed evidence.

---

## Environment-Centric Architecture

ForgePilot follows an environment-centric architecture.

Agents:

1. Read state
2. Perform work
3. Persist results
4. Exit

All durable state belongs to ForgePilot.

No important information should exist only in model context.

The environment is the primary coordination mechanism.

---

## Initial Research Hypotheses

### H1

Better model selection improves outcome quality.

### H2

Better clarification improves packet quality.

### H3

Better packet quality improves execution outcome.

### H4

Better audit quality improves final acceptance quality.

### H5

Better workflow quality improves outcome quality.

ForgePilot V1 collects evidence.

It does not attempt to prove these hypotheses yet.

---

## First Evidence Milestone

FP-META-000

The observatory begins operating when packet outcomes are recorded and analyzed.

The first implementation goal is not intelligent routing.

The first goal is evidence collection.

---

## Principle

Collect evidence.

Understand evidence.

Automate evidence collection.

Use evidence to improve workflow decisions.

Do not build infrastructure for evidence that does not yet exist.
