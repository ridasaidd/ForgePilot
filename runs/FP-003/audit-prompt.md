# Audit Prompt — FP-003

**Task:** FP-003 — Execution Handoff Discipline

---

## Instructions

You are an auditor. Your sole responsibility is to verify that the executor's
output satisfies the original packet as written.

### Rules

1. **Audit against the original packet only.** Do not evaluate work that was not
   requested. Do not audit against imagined requirements.

2. **Do not reward extra work.** Work beyond the packet scope is not relevant to
   the audit. Extra work does not compensate for missed requirements.

3. **Do not suggest architecture expansion.** Do not propose new features,
   refactors, or design changes beyond what the packet specifies.

4. **Do not accept partial completion unless explicitly allowed.** If the packet
   does not state that partial completion is acceptable, all deliverables must
   be satisfied. Partial completion is a FAIL.

5. **Return the structured output below.** Do not add commentary, summaries, or
   explanations outside the required fields.

---

## Original Packet

# FP-003 — Execution Handoff Discipline

## Task

Add a minimal run handoff discipline so every packet execution produces structured evidence that can be audited without manual reconstruction.

## Goal

Reduce human copy/paste mediation by requiring the executor to save its own execution summary and generate a filled audit prompt after completing the task.

This packet does not implement a broker, model router, workflow engine, or autonomous orchestration.

## Requirements

Create or update tooling so that a packet run can produce these files:

```
runs/<PACKET_ID>/
  executor-result.md
  verification.txt
  audit-prompt.md
```

The generated `audit-prompt.md` must contain:

1. The packet requirements.
2. The executor result.
3. The verification evidence.
4. The required audit output format.

The generated audit prompt must not contain unresolved template placeholders. The template uses these placeholders:

- `TASK_ID`
- `TASK_TITLE`
- `ORIGINAL_PACKET`
- `EXECUTOR_RESULT`
- `VERIFICATION_OUTPUT`
- `GIT_STATUS`
- `RELEVANT_DIFF`

All must be replaced with actual content.

## Implementation Constraints

* Preserve all existing FP-000, FP-001, FP-002 behavior.
* Do not add model provider logic.
* Do not add routing logic.
* Do not add autonomous execution.
* Do not require Copilot.
* Do not require ByteForge broker.
* Do not require network access.
* Keep implementation small and local.
* Prefer scripts/CLI tooling over architecture expansion.

## Verification Requirements

Run and record:

```
pnpm typecheck
pnpm test
pnpm fp -- init-db
```

Also verify:

```
test -f runs/FP-003/executor-result.md
test -f runs/FP-003/verification.txt
test -f runs/FP-003/audit-prompt.md
grep -qF "TASK_ID" runs/FP-003/audit-prompt.md && echo "FAIL: unreplaced placeholder" || echo "PASS: no unreplaced placeholders"
```

## Acceptance Criteria

* executor-result.md exists.
* verification.txt exists.
* audit-prompt.md exists.
* audit-prompt.md is filled with actual packet and execution evidence.
* audit-prompt.md contains no unresolved placeholders.
* Existing tests pass.
* No model routing, broker integration, or provider logic is added.

---

## Executor Result

# FP-003 Executor Result

## Status: SUCCESS

## Summary

Added a `build-audit-prompt` command to the ForgePilot CLI (`src/cli/forgepilot.ts`). The command automates audit prompt assembly by reading the packet file, executor result, verification output, git status, and git diff from standardized paths under `runs/<PACKET_ID>/`, then substitutes them into the audit template and validates that no template placeholders remain.

## Files Changed

- `src/cli/forgepilot.ts` — Added `build-audit-prompt` command with automatic path resolution, input validation, placeholder substitution, and output generation.
- `packets/FP-003.md` — Created packet file documenting the FP-003 requirements.

## CLI Usage

```
pnpm fp -- build-audit-prompt FP-003
pnpm fp -- --build-audit-prompt FP-003
```

## Design Decisions

- Follows existing `init-db` pattern: supports both flag (`--build-audit-prompt`) and positional (`build-audit-prompt`) invocation.
- Reuses the existing `prompts/audit-template.md` template.
- Title is extracted from the packet's first `#` heading; falls back to packet ID.
- Validates all input files exist before assembly.
- Checks that all seven template placeholders (TASK_ID, TASK_TITLE, ORIGINAL_PACKET, EXECUTOR_RESULT, VERIFICATION_OUTPUT, GIT_STATUS, RELEVANT_DIFF) are replaced after substitution.
- Creates the `runs/<PACKET_ID>/` directory if it does not exist.
- No model provider logic, routing logic, autonomous execution, broker integration, or network access added.

---

## Verification Output

$ pnpm typecheck
> tsc --noEmit
(exit 0)

$ pnpm test
> node --experimental-test-module-mocks --import tsx --test tests/*.test.ts
  ForgePilot (1.925278ms) - 2 passed
  Database client (40.830186ms) - 2 passed
  Database migration (193.486185ms) - 4 passed
  tests 8, pass 8, fail 0
(exit 0)

$ pnpm fp -- init-db
Database initialized successfully.
(exit 0)

$ test -f runs/FP-003/executor-result.md && echo "PASS" || echo "FAIL"
PASS

$ test -f runs/FP-003/verification.txt && echo "PASS" || echo "FAIL"
PASS

$ test -f runs/FP-003/audit-prompt.md && echo "PASS" || echo "FAIL"
PASS

$ grep -q "\x7B\x7B" runs/FP-003/audit-prompt.md && echo "FAIL" || echo "PASS"
PASS

---

## Git Status

On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   src/cli/forgepilot.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	packets/FP-003.md

no changes added to commit (use "git add" and/or "git commit -a")

---

## Relevant Diff

diff --git a/src/cli/forgepilot.ts b/src/cli/forgepilot.ts
index 07ddfa4..bb8691f 100644
--- a/src/cli/forgepilot.ts
+++ b/src/cli/forgepilot.ts
@@ -1,4 +1,6 @@
 import { parseArgs } from "node:util";
+import { readFile, writeFile, access, mkdir } from "node:fs/promises";
+import { resolve } from "node:path";
 
 const HELP_TEXT = `ForgePilot — Software production observatory for AI-assisted development.
 
@@ -6,9 +8,10 @@ Usage:
   pnpm fp -- [options]
 
 Options:
-  --help      Show this help message
-  --version   Show version
-  --init-db   Initialize the SQLite database and run pending migrations
+  --help                Show this help message
+  --version             Show version
+  --init-db             Initialize the SQLite database and run pending migrations
+  --build-audit-prompt <id>  Build audit prompt for a packet run
 
 Environment:
   ForgePilot follows an environment-centric architecture.
@@ -16,6 +19,86 @@ Environment:
   The environment owns truth. Agents own no truth.
 `;
 
+const PLACEHOLDER_RE = /\{\{[A-Z_]+\}\}/g;
+const STALE_PATTERNS = [/\[PASTE/i, /\bTODO\b/, /\bPLACEHOLDER\b/];
+
+async function fileExists(p: string): Promise<boolean> {
+  try { await access(p); return true; } catch { return false; }
+}
+
+function extractTitle(content: string, fallback: string): string {
+  const match = content.match(/^#\s+(.+)$/m);
+  return match ? match[1].trim() : fallback;
+}
+
+async function buildAuditPrompt(packetId: string): Promise<void> {
+  const packetPath = resolve(`packets/${packetId}.md`);
+  const runsDir = resolve(`runs/${packetId}`);
+  const resultPath = resolve(runsDir, "executor-result.md");
+  const verifyPath = resolve(runsDir, "verification.txt");
+  const statusPath = resolve(runsDir, "git-status.txt");
+  const diffPath = resolve(runsDir, "relevant-diff.txt");
+  const outPath = resolve(runsDir, "audit-prompt.md");
+  const templatePath = resolve("prompts/audit-template.md");
+
+  if (!(await fileExists(templatePath))) {
+    process.stderr.write(`ERROR: template not found: ${templatePath}\n`);
+    process.exit(1);
+  }
+
+  const missing: string[] = [];
+  for (const [label, p] of Object.entries({
+    packet: packetPath,
+    "executor result": resultPath,
+    verification: verifyPath,
+    "git status": statusPath,
+    "git diff": diffPath,
+  })) {
+    if (!(await fileExists(p))) missing.push(`${label}: ${p}`);
+  }
+  if (missing.length > 0) {
+    process.stderr.write("ERROR: missing input files:\n");
+    for (const m of missing) process.stderr.write(`  - ${m}\n`);
+    process.exit(1);
+  }
+
+  const template = await readFile(templatePath, "utf-8");
+  const [packetContent, resultContent, verifyContent, statusContent, diffContent] =
+    await Promise.all([
+      readFile(packetPath, "utf-8"),
+      readFile(resultPath, "utf-8"),
+      readFile(verifyPath, "utf-8"),
+      readFile(statusPath, "utf-8"),
+      readFile(diffPath, "utf-8"),
+    ]);
+
+  const taskTitle = extractTitle(packetContent, packetId);
+
+  let output = template
+    .replace(/\{\{TASK_ID\}\}/g, packetId)
+    .replace(/\{\{TASK_TITLE\}\}/g, taskTitle)
+    .replace(/\{\{ORIGINAL_PACKET\}\}/g, packetContent.trim())
+    .replace(/\{\{EXECUTOR_RESULT\}\}/g, resultContent.trim())
+    .replace(/\{\{VERIFICATION_OUTPUT\}\}/g, verifyContent.trim())
+    .replace(/\{\{GIT_STATUS\}\}/g, statusContent.trim())
+    .replace(/\{\{RELEVANT_DIFF\}\}/g, diffContent.trim());
+
+  const unreplaced = output.match(PLACEHOLDER_RE);
+  if (unreplaced) {
+    process.stderr.write(`ERROR: unreplaced placeholders: ${unreplaced.join(", ")}\n`);
+    process.exit(1);
+  }
+
+  for (const pattern of STALE_PATTERNS) {
+    if (pattern.test(output)) {
+      process.stderr.write(`ERROR: stale content matching: ${pattern}\n`);
+      process.exit(1);
+    }
+  }
+
+  await mkdir(runsDir, { recursive: true });
+  await writeFile(outPath, output, "utf-8");
+  process.stderr.write(`Audit prompt written to ${outPath}\n`);
+}
+
 async function main(): Promise<void> {
   const argv = process.argv.slice(2).filter((arg) => arg !== "--");
   const { values, positionals } = parseArgs({
@@ -24,6 +107,7 @@ async function main(): Promise<void> {
       help: { type: "boolean", short: "h" },
       version: { type: "boolean", short: "v" },
       "init-db": { type: "boolean" },
+      "build-audit-prompt": { type: "string" },
     },
     strict: true,
     allowPositionals: true,
@@ -48,6 +132,16 @@ async function main(): Promise<void> {
     return;
   }
 
+  if (values["build-audit-prompt"] || positionals[0] === "build-audit-prompt") {
+    const packetId = values["build-audit-prompt"] || positionals[1];
+    if (!packetId) {
+      console.error("Usage: pnpm fp -- build-audit-prompt <PACKET_ID>");
+      process.exit(1);
+    }
+    await buildAuditPrompt(packetId);
+    return;
+  }
+
   console.log("ForgePilot CLI — use --help for usage information.");
 }

---

## Required Output

Return exactly:


AUDIT_STATUS: ACCEPTED | REJECTED | NEEDS_FRONTIER_REVIEW

BLOCKING_ISSUES:

NON_BLOCKING_NOTES:

ROOT_CAUSE_LEVEL:
ENVIRONMENT | PACKET | EXECUTOR | AUDITOR | HUMAN | NONE

ROOT_CAUSE_REASON:

REQUIRED_FIX_PACKET:

