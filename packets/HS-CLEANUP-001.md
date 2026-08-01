# HS-CLEANUP-001 — Post-Hermes ForgePilot Active-Tree Cleanup

Status: READY FOR EXECUTION
Decision authority: G0 human
Target repository: `/home/ridasaidd/forgepilot`
Target branch: `main`
Execution runtime: Hermes
Mutation class: repository cleanup with deletions, moves, and documentation updates

## 1. Objective

Reduce the live ForgePilot repository to the current post-Hermes architecture.

The active tree should contain the ForgePilot observatory, governance, evidence, admission, current methodology, current documentation, required compatibility readers, migrations, tests, and current Hermes-era records.

Pre-Hermes execution plumbing—especially the FP-MCP packet/run series—should no longer dominate the live tree. Preserve it permanently through Git before removing it from `main`.

## 2. Governing architecture

Use this separation:

- Project-local `AGENTS.md` and Hermes profile `SOUL.md` files define persistent behavior.
- Project-specific task packets live with the target project.
- Hermes owns orchestration, task graphs, worker lifecycle, verification coordination, synthesis coordination, and runtime execution state.
- ForgePilot owns immutable intent references, evidence interpretation, provenance, verification state, admission, governance decisions, and observatory claims.
- Git history preserves the pre-Hermes construction record. Historical existence does not require permanent presence in the current working tree.

Do not claim that Hermes retroactively completed, validated, invalidated, or admitted any prior packet.

## 3. Mandatory preservation boundary

Before any deletion or move:

1. Verify `main` is clean and exactly matches `origin/main`.
2. Record the exact starting commit.
3. Create and push an annotated preservation tag:

   `pre-hermes-active-tree-2026-08-01`

4. Tag message:

   `Complete ForgePilot active tree before post-Hermes cleanup`

5. Confirm the remote tag resolves to the exact starting commit.
6. Create a cleanup branch:

   `cleanup/post-hermes-active-tree`

Stop if the tag cannot be pushed or verified.

## 4. Default cleanup policy

### 4.1 Remove from the active tree by default

Remove these families unless a specific file passes the keep exception in section 5:

- `packets/FP-MCP-*.md`
- `runs/FP-MCP-*`
- legacy private runner implementation and deployment files under `runner/`
- obsolete OpenCode/guarded-runner orchestration documents
- obsolete MCP-owned worker start/wait/retry/checklist documents
- stale progress and steering files that point to FP-MCP-277 or the guarded-runner path
- generated OpenCode request renderings, prompts, stdout/stderr logs, retry notes, and design-only outputs belonging only to the superseded execution architecture
- duplicated or shadow copies of the MCP project under `instrument-projects/forgepilot-chatgpt-mcp/`, unless required by retained evidence or tests

Removal from `main` does not erase history; the preservation tag is the canonical pre-cleanup snapshot.

### 4.2 Keep in the active tree

Keep:

- `README.md`
- `PRINCIPLES.md`
- current `AGENTS.md`
- current ForgePilot source required by the observatory
- evidence, provenance, verification, comparison, admission, invalidation, and quarantine logic
- all applied migrations
- tests required by retained code and historical database compatibility
- current evidence and governance standards
- `runs/HS-001/`
- `runs/HS-META-001/`
- all G0 admission records
- current Hermes-era methodology and authority records
- non-MCP packet/run families only when they still define the observatory, evidence model, persistence, governance, evaluation, or admitted knowledge
- OpenCode compatibility readers only when required to read historical databases or retained fixtures

### 4.3 Do not keep historical FP-MCP content merely because it was once useful

A file must have a demonstrated current purpose to remain in the active tree.

Historical value alone is satisfied by the preservation tag and Git history unless the file is one of:

- a live G0 decision;
- an admitted artifact still referenced by current authority;
- a migration needed to reconstruct databases;
- a compatibility reader needed by current tests or retained data;
- a current governance or evidence standard;
- the sole live definition of a current invariant.

## 5. Keep exception for FP-MCP files

An FP-MCP file may remain only when the worker records all of:

1. Exact path.
2. Current inbound reference from retained source, tests, migration, active documentation, or a live G0 admission record.
3. Why Git history plus the preservation tag is insufficient.
4. Risk of removal.
5. Minimal retained form.

Conceptual usefulness or historical interest alone is not enough.

Prefer extracting an enduring rule into a current Hermes-era document over retaining an entire obsolete packet/run family. Do not rewrite historical claims as though they were newly proven.

## 6. Required workflow

Route:

`OC -> GC -> inventory worker(s) -> cleanup author/implementer -> independent verifier -> synthesizer -> G1 recommendation -> G0 merge decision`

OC remains a thin relay.

GC may use parallel workers for:

- tracked-path inventory;
- current reference graph;
- admission and migration protection;
- deletion/retention manifest;
- documentation contradiction review.

Use a challenger only if a concrete risk trigger is recorded. This cleanup is destructive and path-wide, so independent verification is mandatory.

## 7. Phase A — Produce exact manifests before mutation

Generate:

- `audits/hermes-transition/active-tree-before.txt`
- `audits/hermes-transition/path-inventory.json`
- `audits/hermes-transition/reference-graph.json`
- `audits/hermes-transition/keep-manifest.json`
- `audits/hermes-transition/remove-manifest.json`
- `audits/hermes-transition/manual-review.json`

Each removal entry must include:

- path;
- size;
- SHA-256 or Git blob ID;
- creating or last relevant commit;
- exact reason;
- inbound references;
- admission/migration/test status;
- preservation-tag reference;
- confidence.

The implementer may proceed only when the verifier confirms:

- every FP-MCP path is classified;
- every retained path has a current-purpose justification;
- no protected file appears in the remove manifest;
- no unknown/manual-review path is silently deleted.

## 8. Phase B — Apply cleanup on the cleanup branch

Apply the verified manifest.

Expected major actions:

1. Delete most or all `packets/FP-MCP-*.md`.
2. Delete most or all `runs/FP-MCP-*`.
3. Remove or archive-out-of-main the legacy `runner/` bundle.
4. Remove stale OpenCode/guarded-runner operational documents.
5. Remove obsolete progress/checklist pointers.
6. Remove or clearly isolate obsolete `instrument-projects/forgepilot-chatgpt-mcp/` content.
7. Remove generated debris that is part of deleted superseded families.
8. Keep migrations unchanged.
9. Keep historical OpenCode compatibility code only when tests or retained data require it.

Do not physically move old FP-MCP files into another directory on `main` merely to preserve them. The preservation tag already preserves the complete tree. The purpose is to make `main` smaller.

## 9. Current documentation replacement

Update the active architecture documents so they state:

- Hermes is the execution and swarm runtime.
- ForgePilot is the observatory and governance/evidence authority.
- G0 admits and owns consequences.
- G1 plans, reviews, and recommends.
- Project-specific packets live in the target project.
- ForgePilot records immutable packet references by repository, commit, path, and hash.
- OpenCode may be a model provider or historical compatibility surface, not the current orchestration harness.
- The private runner and FP-MCP execution architecture are operationally superseded.

Replace stale master-plan and progress-checklist claims. Preserve their historical versions only through Git history and the preservation tag unless a small explicit transition summary is needed in the active tree.

Create one concise current document:

`docs/post-hermes-architecture.md`

Create one concise transition pointer:

`docs/pre-hermes-history.md`

The history pointer should name the preservation tag and explain that removed files remain available there.

## 10. Packet location policy

Update current documentation to establish:

- Task packets are project-specific and belong in the target project.
- ForgePilot should not accumulate project-local execution packets.
- ForgePilot stores references and evidence, not duplicate packet bodies, unless the packet itself is an admitted ForgePilot governance artifact.
- Hermes Kanban task bodies should reference exact repository, commit, path, and SHA-256.
- `AGENTS.md` and `SOUL.md` are persistent behavioral instructions, not replacements for byte-exact task intent.

## 11. Validation

Run at minimum:

```bash
pnpm typecheck
pnpm test
pnpm run build:audit-prompt
```

Also run:

- fresh SQLite migration from zero;
- migration against a copy of the latest available database;
- historical OpenCode compatibility read tests;
- CLI smoke tests;
- missing-path and broken-reference scan;
- exact check that every retained G0 admission path/hash still resolves;
- exact check that no migration was removed or modified;
- exact check that no retained source or test references a deleted path;
- `git diff --check`;
- `git status --short`.

Record pre/post counts for:

- total tracked files;
- `packets/FP-MCP-*`;
- `runs/FP-MCP-*`;
- `runner/`;
- `instrument-projects/forgepilot-chatgpt-mcp/`;
- tests;
- migrations;
- G0 admission records.

## 12. Hard stop conditions

Stop and report without further mutation if:

- the starting tree is dirty;
- local `main` differs from `origin/main`;
- the preservation tag cannot be created, pushed, or verified;
- any removal candidate is referenced by a live G0 admission;
- a migration would be removed or rewritten;
- retained tests require a deleted path and no bounded replacement exists;
- the current database cannot be reconstructed;
- the exact deletion manifest was not independently verified;
- unrelated files change;
- completing the cleanup would require fabricating historical equivalence.

## 13. Commit and delivery

Use bounded commits on the cleanup branch.

Suggested sequence:

1. `Record post-Hermes cleanup inventories`
2. `Remove superseded FP-MCP active-tree history`
3. `Remove legacy runner and OpenCode orchestration docs`
4. `Document post-Hermes ForgePilot architecture`
5. `Repair references and compatibility boundaries`

Do not push directly to `main`.
Push the cleanup branch and open a pull request.
Do not merge automatically.

## 14. Final report

Report:

- starting commit;
- preservation tag and verified target;
- cleanup branch;
- exact deleted file count and byte count;
- exact retained FP-MCP exceptions;
- current architecture documents added or changed;
- tests and migration results;
- unresolved manual-review items;
- verifier verdict;
- G1 recommendation;
- pull-request link or branch reference;
- explicit statement that G0 merge approval remains separate.

## 15. Acceptance criteria

PASS only when:

1. The pre-cleanup tree is recoverable through the verified remote tag.
2. Most FP-MCP packet/run content is absent from the active branch.
3. The legacy runner and obsolete orchestration path are absent from the active branch unless a verified compatibility exception exists.
4. All current G0 admissions and admitted Hermes-era artifacts still resolve exactly.
5. Migrations remain complete and unchanged.
6. Current tests and compatibility checks pass.
7. Active documentation describes the Hermes-era architecture accurately.
8. Project-specific packet ownership is documented.
9. The cleanup diff contains no unrelated changes.
10. A human-readable and machine-readable deletion manifest exists.
11. Independent verification returns PASS.
12. The result is presented for a separate G0 merge decision.
