# ForgePilot ChatGPT MCP Instrument Project

## Classification

`forgepilot-chatgpt-mcp` is an instrument project.

It is separate from ForgePilot core, but ForgePilot depends on it for ChatGPT-operated MCP orchestration.

## Repository

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

## Current Baseline

At workspace creation:

```text
branch: feature/oauth-auth0
commit: 3a16d68
working tree: clean
```

## Workspace Purpose

This workspace records project-specific work observed by ForgePilot for the MCP bridge.

It should contain bridge-specific packets, plans, runs, model outputs, audits, comparisons, and observations.

## Layout

```text
packets/
plans/
runs/
model-results/
audits/
comparisons/
observations/
```

## Boundary

Normal bridge engineering work belongs here.

Root ForgePilot packets are reserved for observatory rules, core behavior, or instrument-contract changes.

## First Candidate Project

The first candidate instrument-project task is the `server.ts` shadow refactor.

That refactor has not started in this workspace yet.


## Shadow Refactor Rules

The MCP bridge `server.ts` shadow refactor must follow:

```text
docs/shadow-refactor-rules.md
```

Concrete shadow-refactor packets should live under this instrument-project workspace, not root ForgePilot `packets/`, unless they change the MCP instrument contract.


## Project Checklist

The initial project checklist is:

```text
checklists/server-shadow-refactor.md
```

Checklist rules are defined in:

```text
docs/project-checklist-rules.md
```

The checklist is an evidence index and planning surface. It is not evidence by itself and does not authorize model execution without a scoped packet.
