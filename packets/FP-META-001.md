# FP-META-001 — Audit Prompt Builder

Purpose:

Reduce human copy/paste errors in the V0 packet/audit workflow.

Scope:

Create:

- packets/
- prompts/audit-template.md
- scripts/build-audit-prompt.mjs
- runs/.gitkeep

Requirements:

- Store packet prompts on disk as Markdown.
- Generate audit prompts from packet, executor result, verification output, git status, and relevant diff files.
- Fail if required input files are missing.
- Fail if unreplaced placeholders remain.
- Fail if output contains stale placeholder markers from unfinished prompt assembly.
- Add package script: build:audit-prompt.

Constraints:

- Do not add dependencies.
- Do not add AI integration.
- Do not add routing.
- Do not add database logic.
- Do not add workflow engine.
- Do not add metrics automation.
- Do not add GitHub Actions.

Acceptance criteria:

- packets/FP-META-001.md exists.
- prompts/audit-template.md exists.
- scripts/build-audit-prompt.mjs exists.
- runs/.gitkeep exists.
- pnpm typecheck succeeds.
- pnpm test succeeds.
- build:audit-prompt generates an audit prompt from valid input files.
- build:audit-prompt fails on missing input files.
- build:audit-prompt fails on unreplaced placeholders.
