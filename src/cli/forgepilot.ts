import { parseArgs } from "node:util";
import { readFile, writeFile, access, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const HELP_TEXT = `ForgePilot — Software production observatory for AI-assisted development.

Usage:
  pnpm fp -- [options]

Options:
  --help                Show this help message
  --version             Show version
  --init-db             Initialize the SQLite database and run pending migrations
  --build-audit-prompt <id>  Build audit prompt for a packet run

Environment:
  ForgePilot follows an environment-centric architecture.
  Agents read state, perform work, persist results, and exit.
  The environment owns truth. Agents own no truth.
`;

const TEMPLATE_PLACEHOLDERS = [
  "{{TASK_ID}}",
  "{{TASK_TITLE}}",
  "{{ORIGINAL_PACKET}}",
  "{{EXECUTOR_RESULT}}",
  "{{VERIFICATION_OUTPUT}}",
  "{{GIT_STATUS}}",
  "{{RELEVANT_DIFF}}",
];

async function fileExists(p: string): Promise<boolean> {
  try { await access(p); return true; } catch { return false; }
}

function extractTitle(content: string, fallback: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

async function buildAuditPrompt(packetId: string): Promise<void> {
  const packetPath = resolve(`packets/${packetId}.md`);
  const runsDir = resolve(`runs/${packetId}`);
  const resultPath = resolve(runsDir, "executor-result.md");
  const verifyPath = resolve(runsDir, "verification.txt");
  const statusPath = resolve(runsDir, "git-status.txt");
  const diffPath = resolve(runsDir, "relevant-diff.txt");
  const outPath = resolve(runsDir, "audit-prompt.md");
  const templatePath = resolve("prompts/audit-template.md");

  if (!(await fileExists(templatePath))) {
    process.stderr.write(`ERROR: template not found: ${templatePath}\n`);
    process.exit(1);
  }

  const missing: string[] = [];
  for (const [label, p] of Object.entries({
    packet: packetPath,
    "executor result": resultPath,
    verification: verifyPath,
    "git status": statusPath,
    "git diff": diffPath,
  })) {
    if (!(await fileExists(p))) missing.push(`${label}: ${p}`);
  }
  if (missing.length > 0) {
    process.stderr.write("ERROR: missing input files:\n");
    for (const m of missing) process.stderr.write(`  - ${m}\n`);
    process.exit(1);
  }

  const template = await readFile(templatePath, "utf-8");
  const [packetContent, resultContent, verifyContent, statusContent, diffContent] =
    await Promise.all([
      readFile(packetPath, "utf-8"),
      readFile(resultPath, "utf-8"),
      readFile(verifyPath, "utf-8"),
      readFile(statusPath, "utf-8"),
      readFile(diffPath, "utf-8"),
    ]);

  const taskTitle = extractTitle(packetContent, packetId);

  let output = template
    .replace(/\{\{TASK_ID\}\}/g, packetId)
    .replace(/\{\{TASK_TITLE\}\}/g, taskTitle)
    .replace(/\{\{ORIGINAL_PACKET\}\}/g, packetContent.trim())
    .replace(/\{\{EXECUTOR_RESULT\}\}/g, resultContent.trim())
    .replace(/\{\{VERIFICATION_OUTPUT\}\}/g, verifyContent.trim())
    .replace(/\{\{GIT_STATUS\}\}/g, statusContent.trim())
    .replace(/\{\{RELEVANT_DIFF\}\}/g, diffContent.trim());

  const unreplaced = TEMPLATE_PLACEHOLDERS.filter((ph) => output.includes(ph));
  if (unreplaced.length > 0) {
    process.stderr.write(`ERROR: unreplaced placeholders: ${unreplaced.join(", ")}\n`);
    process.exit(1);
  }

  await mkdir(runsDir, { recursive: true });
  await writeFile(outPath, output, "utf-8");
  process.stderr.write(`Audit prompt written to ${outPath}\n`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2).filter((arg) => arg !== "--");
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
      "init-db": { type: "boolean" },
      "build-audit-prompt": { type: "string" },
    },
    strict: true,
    allowPositionals: true,
  });

  if (values.help) {
    console.log(HELP_TEXT);
    return;
  }

  if (values.version) {
    console.log("forgepilot v0.1.0");
    return;
  }

  if (values["init-db"] || positionals.includes("init-db")) {
    const { initAndMigrate } = await import("../db/migrate.js");
    initAndMigrate();
    const { closeDb } = await import("../db/client.js");
    closeDb();
    console.log("Database initialized successfully.");
    return;
  }

  if (values["build-audit-prompt"] || positionals[0] === "build-audit-prompt") {
    const packetId = values["build-audit-prompt"] || positionals[1];
    if (!packetId) {
      console.error("Usage: pnpm fp -- build-audit-prompt <PACKET_ID>");
      process.exit(1);
    }
    await buildAuditPrompt(packetId);
    return;
  }

  console.log("ForgePilot CLI — use --help for usage information.");
}

main();
