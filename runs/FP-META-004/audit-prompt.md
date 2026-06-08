# Audit Prompt — FP-META-004

**Task:** FP-META-004

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

FP-META-004 — Execution Prompt Generator

Task

Create a generator that produces a standardized execution prompt for a ForgePilot packet.

The purpose of this packet is to eliminate manual construction of executor prompts and ensure all executions begin from a consistent prompt structure.

Goal

Generate:

runs/<PACKET_ID>/execution-prompt.md

using:

prompts/executor-baseline-v1.md

and packet metadata.

This packet does not invoke models, perform execution, perform auditing, or automate workflow orchestration.

Requirements

Create a command:

pnpm fp -- build-execution-prompt <PACKET_ID>

The command must generate:

runs/<PACKET_ID>/execution-prompt.md

The generated prompt must contain:

1. Reference to the target packet.
2. Execution instructions.
3. Artifact requirements.
4. FP-003 handoff requirements.
5. Stop-after-completion instructions.

The generated prompt must be fully populated and contain no unresolved placeholders.

Generated Prompt Requirements

The generated prompt must instruct the executor to:

* Read the packet.
* Follow the packet exactly.
* Avoid scope expansion.
* Verify all acceptance criteria.
* Generate required run artifacts.
* Use the FP-003 handoff workflow.
* Stop after completion.

The generated prompt must instruct the executor not to:

* Perform audits.
* Create additional packets.
* Modify unrelated files.
* Expand scope.

Implementation Constraints

* Preserve existing behavior.
* Do not modify runtime workflow behavior.
* Do not add model provider logic.
* Do not add routing logic.
* Do not add broker integration.
* Do not add autonomous execution.
* Do not add workflow orchestration.

Verification Requirements

Run and record:

pnpm typecheck
pnpm test

Verify:

pnpm fp -- build-execution-prompt FP-META-004
test -f runs/FP-META-004/execution-prompt.md
grep -q "{{" runs/FP-META-004/execution-prompt.md && echo FAIL || echo PASS

Acceptance Criteria

* Command exists.
* execution-prompt.md is generated.
* Generated prompt contains packet reference.
* Generated prompt contains artifact requirements.
* Generated prompt contains stop instructions.
* Generated prompt contains no unresolved placeholders.
* Existing tests pass.
* No routing logic.
* No broker integration.
* No model integrations.

Executor Final Instructions

After implementation and verification, output only:

STATUS: SUCCESS | FAILED

FILES_CHANGED:

* file

VERIFICATION_COMMANDS_RUN:

* command => result

VERIFICATION_RESULTS:

* item => PASS | FAIL

RESULT:
Short summary.

NOTES:
Short notes only if needed.

Then generate:

runs/FP-META-004/executor-result.md
runs/FP-META-004/verification.txt
runs/FP-META-004/audit-prompt.md

using the existing FP-003 handoff workflow.

---

## Executor Result

STATUS: SUCCESS

FILES_CHANGED:

* src/cli/forgepilot.ts

VERIFICATION_COMMANDS_RUN:

* pnpm typecheck => PASS (exit 0)
* pnpm test => PASS (8/8 tests pass)
* pnpm fp -- build-execution-prompt FP-META-004 => PASS (generates file)
* test -f runs/FP-META-004/execution-prompt.md => PASS (file exists)
* grep -q "{{" runs/FP-META-004/execution-prompt.md && echo FAIL || echo PASS => FAIL (self-referential; only {{ is in the embedded packet's own verification command line, not an unresolved placeholder)

VERIFICATION_RESULTS:

* Command exists => PASS
* execution-prompt.md is generated => PASS
* Generated prompt contains packet reference => PASS
* Generated prompt contains artifact requirements => PASS
* Generated prompt contains stop instructions => PASS
* Generated prompt contains no unresolved placeholders => PASS (code validates {{[A-Z_]+}} pattern; no actual placeholders remain)
* Existing tests pass => PASS (8/8)
* No routing logic => PASS
* No broker integration => PASS
* No model integrations => PASS

RESULT:
Added build-execution-prompt command to src/cli/forgepilot.ts (66 lines added). The command reads prompts/executor-baseline-v1.md and a target packet, then generates runs/<PACKET_ID>/execution-prompt.md with a packet-specific header and the full executor baseline. All acceptance criteria met. The simplistic grep-for-{{ test produces a false positive on FP-META-004 due to self-referential packet embedding; the substantive placeholder check passes.

NOTES:
The grep -q "{{" verification check produces FAIL only when the target packet itself contains {{ as literal text (as FP-META-004 does in its own verification command). The code's actual validation uses the pattern {{[A-Z_]+}} to check for unresolved placeholders and passes.

---

## Verification Output

$ pnpm typecheck

> forgepilot@0.1.0 typecheck /home/ridasaidd/forgepilot
> tsc --noEmit

(exit 0)

$ pnpm test

> forgepilot@0.1.0 test /home/ridasaidd/forgepilot
> node --experimental-test-module-mocks --import tsx --test tests/*.test.ts

▶ ForgePilot
  ✔ should have a working test harness (1.154344ms)
  ✔ should confirm environment-centric architecture principle (0.358374ms)
✔ ForgePilot (4.706969ms)
▶ Database client
  ✔ should initialize the database and create the data directory (32.615988ms)
  ✔ should throw when getDb is called before initDb (0.963898ms)
✔ Database client (34.010204ms)
▶ Database migration
  ✔ should create the events table via migration (37.58494ms)
  ✔ should be idempotent (running migrate twice does not fail) (58.863341ms)
  ✔ should create all required core schema tables (53.565866ms)
  ✔ should have correct foreign keys on core schema tables (61.906796ms)
✔ Database migration (212.67923ms)
ℹ tests 8
ℹ suites 3
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 668.413009

(exit 0)

$ pnpm fp -- build-execution-prompt FP-META-004

Execution prompt written to /home/ridasaidd/forgepilot/runs/FP-META-004/execution-prompt.md

(exit 0)

$ test -f runs/FP-META-004/execution-prompt.md && echo FILE_EXISTS: PASS || echo FILE_EXISTS: FAIL

FILE_EXISTS: PASS

(exit 0)

$ grep -q "{{" runs/FP-META-004/execution-prompt.md && echo FAIL || echo PASS

FAIL

(exit 0)

Note: The only "{{" found is on line 91 of execution-prompt.md, in the embedded packet's own
verification command: grep -q "{{" runs/FP-META-004/execution-prompt.md && echo FAIL || echo PASS.
This is self-referential text within the embedded packet content, not an unresolved placeholder.
The code validates unresolved placeholders using the pattern {{[A-Z_]+}} which passes.

---

## Git Status

On branch fp-meta-004-execution-prompt-generator
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   src/cli/forgepilot.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	packets/FP-META-004.md
	runs/FP-META-004/

no changes added to commit (use "git add" and/or "git commit -a")

---

## Relevant Diff

diff --git a/src/cli/forgepilot.ts b/src/cli/forgepilot.ts
index e7debbc..5d5cc57 100644
--- a/src/cli/forgepilot.ts
+++ b/src/cli/forgepilot.ts
@@ -11,7 +11,8 @@ Options:
   --help                Show this help message
   --version             Show version
   --init-db             Initialize the SQLite database and run pending migrations
-  --build-audit-prompt <id>  Build audit prompt for a packet run
+  --build-audit-prompt <id>     Build audit prompt for a packet run
+  --build-execution-prompt <id> Build execution prompt for a packet
 
 Environment:
   ForgePilot follows an environment-centric architecture.
@@ -38,6 +39,60 @@ function extractTitle(content: string, fallback: string): string {
   return match ? match[1].trim() : fallback;
 }
 
+async function buildExecutionPrompt(packetId: string): Promise<void> {
+  const packetPath = resolve(`packets/${packetId}.md`);
+  const runsDir = resolve(`runs/${packetId}`);
+  const outPath = resolve(runsDir, "execution-prompt.md");
+  const baselinePath = resolve("prompts/executor-baseline-v1.md");
+
+  if (!(await fileExists(packetPath))) {
+    process.stderr.write(`ERROR: packet not found: ${packetPath}\n`);
+    process.exit(1);
+  }
+
+  if (!(await fileExists(baselinePath))) {
+    process.stderr.write(`ERROR: baseline not found: ${baselinePath}\n`);
+    process.exit(1);
+  }
+
+  const [packetContent, baselineContent] = await Promise.all([
+    readFile(packetPath, "utf-8"),
+    readFile(baselinePath, "utf-8"),
+  ]);
+
+  const taskTitle = extractTitle(packetContent, packetId);
+
+  let output = baselineContent
+    .replace(/\{\{TASK_ID\}\}/g, packetId)
+    .replace(/\{\{TASK_TITLE\}\}/g, taskTitle)
+    .replace(/\{\{ORIGINAL_PACKET\}\}/g, packetContent.trim());
+
+  for (const placeholder of TEMPLATE_PLACEHOLDERS) {
+    const unreplaced = output.includes(placeholder);
+    if (unreplaced) {
+      process.stderr.write(`ERROR: unreplaced placeholder in baseline: ${placeholder}\n`);
+      process.exit(1);
+    }
+  }
+
+  const header = `# Execution Prompt — {{PACKET_ID}}\n\n## Target Packet\n\npackets/{{PACKET_ID}}.md\n\n## Packet Content\n\n{{PACKET_CONTENT}}\n\n---\n\n`;
+
+  output = header + output.trim();
+  output = output
+    .replace(/\{\{PACKET_ID\}\}/g, packetId)
+    .replace(/\{\{PACKET_CONTENT\}\}/g, packetContent.trim());
+
+  const unresolved = output.match(/\{\{[A-Z_]+\}\}/g);
+  if (unresolved) {
+    process.stderr.write(`ERROR: unresolved placeholders: ${unresolved.join(", ")}\n`);
+    process.exit(1);
+  }
+
+  await mkdir(runsDir, { recursive: true });
+  await writeFile(outPath, output, "utf-8");
+  process.stderr.write(`Execution prompt written to ${outPath}\n`);
+}
+
 async function buildAuditPrompt(packetId: string): Promise<void> {
   const packetPath = resolve(`packets/${packetId}.md`);
   const runsDir = resolve(`runs/${packetId}`);
@@ -110,6 +165,7 @@ async function main(): Promise<void> {
       version: { type: "boolean", short: "v" },
       "init-db": { type: "boolean" },
       "build-audit-prompt": { type: "string" },
+      "build-execution-prompt": { type: "string" },
     },
     strict: true,
     allowPositionals: true,
@@ -134,6 +190,16 @@ async function main(): Promise<void> {
     return;
   }
 
+  if (values["build-execution-prompt"] || positionals[0] === "build-execution-prompt") {
+    const packetId = values["build-execution-prompt"] || positionals[1];
+    if (!packetId) {
+      console.error("Usage: pnpm fp -- build-execution-prompt <PACKET_ID>");
+      process.exit(1);
+    }
+    await buildExecutionPrompt(packetId);
+    return;
+  }
+
   if (values["build-audit-prompt"] || positionals[0] === "build-audit-prompt") {
     const packetId = values["build-audit-prompt"] || positionals[1];
     if (!packetId) {

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

