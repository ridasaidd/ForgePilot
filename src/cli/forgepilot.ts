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
  --build-audit-prompt <id>     Build audit prompt for a packet run
  --build-execution-prompt <id> Build execution prompt for a packet
  --packet-metrics      Print summary of packet execution metrics
  --prompt-baselines    Print project name and available prompt baseline files
  --ingest-opencode-telemetry   Ingest OpenCode telemetry from a local artifact file.
                                 Requires: --packet-id (string, e.g. FP-004) or --packet-db-id (numeric),
                                           --execution-id, --artifact-path, --mode (direct|retroactive)
  --persist-worker-telemetry     Persist FP-MCP worker telemetry from telemetry.json.
                                 Requires: --artifact-path
  --read-worker-telemetry        Read persisted worker telemetry.
                                 Requires: --packet-id and --worker-id

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

async function buildExecutionPrompt(packetId: string): Promise<void> {
  const packetPath = resolve(`packets/${packetId}.md`);
  const runsDir = resolve(`runs/${packetId}`);
  const outPath = resolve(runsDir, "execution-prompt.md");
  const baselinePath = resolve("prompts/executor-baseline-v1.md");

  if (!(await fileExists(packetPath))) {
    process.stderr.write(`ERROR: packet not found: ${packetPath}\n`);
    process.exit(1);
  }

  if (!(await fileExists(baselinePath))) {
    process.stderr.write(`ERROR: baseline not found: ${baselinePath}\n`);
    process.exit(1);
  }

  const [packetContent, baselineContent] = await Promise.all([
    readFile(packetPath, "utf-8"),
    readFile(baselinePath, "utf-8"),
  ]);

  const taskTitle = extractTitle(packetContent, packetId);

  let output = baselineContent
    .replace(/\{\{TASK_ID\}\}/g, packetId)
    .replace(/\{\{TASK_TITLE\}\}/g, taskTitle)
    .replace(/\{\{ORIGINAL_PACKET\}\}/g, packetContent.trim());

  for (const placeholder of TEMPLATE_PLACEHOLDERS) {
    const unreplaced = output.includes(placeholder);
    if (unreplaced) {
      process.stderr.write(`ERROR: unreplaced placeholder in baseline: ${placeholder}\n`);
      process.exit(1);
    }
  }

  const header = `# Execution Prompt — {{PACKET_ID}}\n\n## Target Packet\n\npackets/{{PACKET_ID}}.md\n\n## Packet Content\n\n{{PACKET_CONTENT}}\n\n---\n\n`;

  output = header + output.trim();
  output = output
    .replace(/\{\{PACKET_ID\}\}/g, packetId)
    .replace(/\{\{PACKET_CONTENT\}\}/g, packetContent.trim());

  const unresolved = output.match(/\{\{[A-Z_]+\}\}/g);
  if (unresolved) {
    process.stderr.write(`ERROR: unresolved placeholders: ${unresolved.join(", ")}\n`);
    process.exit(1);
  }

  await mkdir(runsDir, { recursive: true });
  await writeFile(outPath, output, "utf-8");
  process.stderr.write(`Execution prompt written to ${outPath}\n`);
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
      "build-execution-prompt": { type: "string" },
      "packet-metrics": { type: "boolean" },
      "prompt-baselines": { type: "boolean" },
      "ingest-opencode-telemetry": { type: "boolean" },
      "packet-id": { type: "string" },
      "packet-db-id": { type: "string" },
      "execution-id": { type: "string" },
      "artifact-path": { type: "string" },
      "mode": { type: "string" },
      "persist-worker-telemetry": { type: "boolean" },
      "read-worker-telemetry": { type: "boolean" },
      "worker-id": { type: "string" },
      "json": { type: "boolean" },
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

  if (values["build-execution-prompt"] || positionals[0] === "build-execution-prompt") {
    const packetId = values["build-execution-prompt"] || positionals[1];
    if (!packetId) {
      console.error("Usage: pnpm fp -- build-execution-prompt <PACKET_ID>");
      process.exit(1);
    }
    await buildExecutionPrompt(packetId);
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

  if (values["packet-metrics"] || positionals[0] === "packet-metrics") {
    const { initAndMigrate } = await import("../db/migrate.js");
    initAndMigrate();
    const { getPacketMetrics } = await import("../db/metrics.js");
    const { closeDb } = await import("../db/client.js");
    const metrics = getPacketMetrics();
    closeDb();
    console.log(`Total packets: ${metrics.total}`);
    console.log(`Successful packets: ${metrics.successful}`);
    console.log(`Failed packets: ${metrics.failed}`);
    return;
  }

  if (values["prompt-baselines"] || positionals[0] === "prompt-baselines") {
    console.log("ForgePilot");
    console.log("Executor Baseline: prompts/executor-baseline-v1.md");
    console.log("Auditor Baseline: prompts/auditor-baseline-v1.md");
    return;
  }

  if (values["persist-worker-telemetry"] || positionals[0] === "persist-worker-telemetry") {
    const artifactPath = values["artifact-path"];
    if (!artifactPath) {
      console.error("ERROR: --artifact-path is required");
      process.exit(1);
    }

    const { initAndMigrate } = await import("../db/migrate.js");
    initAndMigrate();
    const { closeDb } = await import("../db/client.js");
    const { persistOpenCodeWorkerTelemetry } = await import("../db/opencode-worker-telemetry.js");

    try {
      const result = persistOpenCodeWorkerTelemetry(artifactPath);
      closeDb();
      if (values.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Worker telemetry persisted: ${result.row.packet_id}/${result.row.worker_id}`);
        console.log(`  Result: ${result.insertedOrUpdated}`);
        console.log(`  Admission State: ${result.row.admission_state}`);
      }
      return;
    } catch (error) {
      closeDb();
      console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }

  if (values["read-worker-telemetry"] || positionals[0] === "read-worker-telemetry") {
    const packetId = values["packet-id"];
    const workerId = values["worker-id"];
    if (!packetId || !workerId) {
      console.error("ERROR: --packet-id and --worker-id are required");
      process.exit(1);
    }

    const { initAndMigrate } = await import("../db/migrate.js");
    initAndMigrate();
    const { closeDb } = await import("../db/client.js");
    const { getPersistedOpenCodeWorkerTelemetry } = await import("../db/opencode-worker-telemetry.js");

    try {
      const row = getPersistedOpenCodeWorkerTelemetry(packetId, workerId);
      closeDb();
      if (values.json) {
        console.log(JSON.stringify(row, null, 2));
      } else {
        console.log(`Worker telemetry: ${row.packet_id}/${row.worker_id}`);
        console.log(`  Worker Status: ${row.worker_status}`);
        console.log(`  Validation State: ${row.validation_state}`);
        console.log(`  Admission State: ${row.admission_state}`);
      }
      return;
    } catch (error) {
      closeDb();
      console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }

  if (values["ingest-opencode-telemetry"] || positionals[0] === "ingest-opencode-telemetry") {
    const packetIdStr = values["packet-id"] as string | undefined;
    const packetDbIdStr = values["packet-db-id"] as string | undefined;
    const executionId = values["execution-id"] as string | undefined;
    const artifactPath = values["artifact-path"] as string | undefined;
    const mode = values["mode"] as string | undefined;

    if (!packetIdStr && !packetDbIdStr) {
      console.error("ERROR: --packet-id (e.g. FP-004) or --packet-db-id (numeric) is required");
      process.exit(1);
    }
    if (!executionId) {
      console.error("ERROR: --execution-id is required");
      process.exit(1);
    }
    if (!artifactPath) {
      console.error("ERROR: --artifact-path is required");
      process.exit(1);
    }
    if (!mode || (mode !== "direct" && mode !== "retroactive")) {
      console.error("ERROR: --mode must be 'direct' or 'retroactive'");
      process.exit(1);
    }

    const execIdNum = Number(executionId);
    if (!Number.isInteger(execIdNum) || execIdNum <= 0) {
      console.error("ERROR: --execution-id must be a positive integer");
      process.exit(1);
    }

    const { initAndMigrate } = await import("../db/migrate.js");
    initAndMigrate();

    const { getDb, closeDb } = await import("../db/client.js");
    const db = getDb();

    let packetIdNum: number | null = null;

    if (packetDbIdStr) {
      packetIdNum = Number(packetDbIdStr);
      if (!Number.isInteger(packetIdNum) || packetIdNum <= 0) {
        closeDb();
        console.error("ERROR: --packet-db-id must be a positive integer");
        process.exit(1);
      }
    } else if (packetIdStr) {
      const rows = db
        .prepare(
          "SELECT id FROM packets WHERE packet_path = ? OR packet_path LIKE ? OR title = ? OR title LIKE ?"
        )
        .all(
          `packets/${packetIdStr}.md`,
          `%${packetIdStr}%`,
          packetIdStr,
          `%${packetIdStr}%`
        ) as { id: number }[];

      if (rows.length === 1) {
        packetIdNum = rows[0].id;
      } else if (rows.length > 1) {
        closeDb();
        console.error(
          `ERROR: --packet-id '${packetIdStr}' matched ${rows.length} packets. ` +
          `Use --packet-db-id with a numeric id instead.`
        );
        process.exit(1);
      } else {
        closeDb();
        console.error(
          `ERROR: No packet found matching '${packetIdStr}'. ` +
          `Use --packet-db-id with a numeric packet id instead.`
        );
        process.exit(1);
      }
    }

    if (packetIdNum === null) {
      closeDb();
      console.error("ERROR: Could not resolve packet identifier");
      process.exit(1);
    }

    const execution = db
      .prepare("SELECT execution_id FROM packet_executions WHERE execution_id = ?")
      .get(execIdNum) as { execution_id: number } | undefined;

    if (!execution) {
      closeDb();
      console.error(`ERROR: Execution ${execIdNum} not found in database`);
      process.exit(1);
    }

    const { ingestOpenCodeTelemetry } = await import("../db/telemetry.js");
    const ingestionMode = mode === "retroactive" ? "RETROACTIVE_ARTIFACT" : "DIRECT_ARTIFACT";

    const result = ingestOpenCodeTelemetry({
      packet_id: packetIdNum,
      execution_id: execIdNum,
      telemetry_artifact_path: artifactPath,
      ingestion_mode: ingestionMode,
    });

    if (!result.ingested || !result.telemetry) {
      closeDb();
      console.error(`ERROR: ${result.error ?? "Failed to ingest telemetry"}`);
      process.exit(1);
    }

    closeDb();
    console.log(`Telemetry ingested successfully.`);
    console.log(`  Telemetry ID: ${result.telemetry.telemetry_id}`);
    console.log(`  Session ID: ${result.telemetry.opencode_session_id ?? "(null)"}`);
    console.log(`  Provider: ${result.telemetry.provider ?? "(null)"}`);
    console.log(`  Model: ${result.telemetry.model ?? "(null)"}`);
    console.log(`  Ingestion Mode: ${result.telemetry.ingestion_mode}`);
    console.log(`  Mapping Confidence: ${result.telemetry.mapping_confidence}`);
    console.log(`  Validation State: ${result.telemetry.validation_state}`);
    console.log(`  Admission State: ${result.telemetry.admission_state}`);
    return;
  }

  console.log("ForgePilot CLI — use --help for usage information.");
}

main();
