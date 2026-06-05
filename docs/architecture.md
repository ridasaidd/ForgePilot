# ForgePilot Architecture

ForgePilot is a software production observatory for AI-assisted development.

Its purpose is to collect evidence about what causes successful AI-assisted software delivery.

Workflow is the primary unit of optimization.

The environment is persistent.

Agents are replaceable.

ForgePilot environment owns truth.

Agents own no truth.

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

## Truth Architecture

ForgePilot maintains two sources of truth:

* **SQLite** — Runtime and environment truth. All operational state, packet results, and metrics live in SQLite.
* **Markdown** — Policy and knowledge truth. Architecture decisions, policies, hypotheses, and workflow definitions live in Markdown.

---

## Agent Model

ForgePilot is not an agent framework.

Agents in ForgePilot are disposable participants in a measured process. They do not own state. They do not remember between invocations. They read from the environment, perform work, persist results, and exit.

This design ensures:

* Reproducibility — every execution starts from known state
* Observability — every action is recorded in the environment
* Replaceability — any agent can be replaced with a different model or implementation
* Measurability — every agent's contribution can be isolated and measured

---

## Evolution

### ForgePilot V0

Manual Workflow + Spreadsheet

### ForgePilot V1

Same Workflow + SQLite

### ForgePilot V2

Evidence-Based Routing

### ForgePilot V3

Adaptive Routing

---

## Project Structure

```
forgepilot/
  src/
    cli/          — CLI entry point
    db/           — SQLite schema, client, and migrations
    core/         — Workflow engine (V2+)
    executors/    — Implementation executors (V2+)
    auditors/     — Audit executors (V2+)
    routing/      — Evidence-based routing (V2+)
    types/        — Shared TypeScript types
  docs/           — Architecture, bootstrap, policies, metrics
  metrics/        — CSV metrics log (V0)
  tests/          — Test suite
```

---

## Constraints

* ForgePilot is not an agent framework.
* ForgePilot is not a benchmark system.
* ForgePilot is not a model router.
* ForgePilot follows an environment-centric architecture.
* Agents read state, perform work, persist results, and exit.
* ForgePilot environment owns truth.
* Agents own no truth.
