import fs from "node:fs";
import path from "node:path";

const modulePath = "file:///home/ridasaidd/forgepilot-chatgpt-mcp/src/opencode-worker.ts";
const packetId = `FP-023-DISABLED-REGRESSION-${Date.now()}`;
const workerRoot = path.join("/home/ridasaidd/forgepilot/runs", packetId, "opencode-workers");
const beforeExists = fs.existsSync(workerRoot);
const beforeEntries = beforeExists ? fs.readdirSync(workerRoot) : [];

const mod = await import(modulePath) as {
  startOpenCodeWorker: (input: Record<string, unknown>) => Promise<unknown>;
  getOpenCodeWorkerStartGateReasons: () => string[];
};

let blocked = false;
let errorName: string | null = null;
let errorMessage: string | null = null;
let reasons: string[] = [];

try {
  await mod.startOpenCodeWorker({
    packetId,
    targetWorkspaceId: "forgepilot-chatgpt-mcp",
    promptFile: "package.json",
    title: "FP-023 disabled no-spawn regression",
    modelId: "deepseek-v4-pro-high",
    timeoutSeconds: 1,
    approval: "START_OPENCODE_WORKER",
  });
} catch (error) {
  blocked = true;
  errorName = error instanceof Error ? error.name : null;
  errorMessage = error instanceof Error ? error.message : String(error);
  const maybeReasons = (error as { reasons?: unknown }).reasons;
  if (Array.isArray(maybeReasons)) reasons = maybeReasons.map(String);
}

const afterExists = fs.existsSync(workerRoot);
const afterEntries = afterExists ? fs.readdirSync(workerRoot) : [];
const requiredReasons = [
  "EXECUTION_DISABLED_GLOBAL",
  "OPENCODE_EXECUTION_DISABLED",
  "DISABLE_SWITCH_ACTIVE",
  "EXECUTION_NOT_ALLOWED",
];
const missingReasons = requiredReasons.filter((reason) => !reasons.includes(reason));
const result = {
  packet_id: "FP-023",
  regression_packet_id: packetId,
  before_worker_root_exists: beforeExists,
  before_worker_entries: beforeEntries,
  after_worker_root_exists: afterExists,
  after_worker_entries: afterEntries,
  blocked,
  error_name: errorName,
  error_message: errorMessage,
  reasons,
  required_reasons: requiredReasons,
  missing_reasons: missingReasons,
  no_worker_root_created: !afterExists,
  no_worker_id_allocated: !afterExists,
  no_pid_file_created: !afterExists || !afterEntries.some((entry) => entry.endsWith("pid.txt")),
  no_status_file_created: !afterExists || !afterEntries.some((entry) => entry.endsWith("status.json")),
  no_start_request_file_created: !afterExists || !afterEntries.some((entry) => entry.endsWith("start-request.json")),
  no_stdout_stderr_logs_created: !afterExists || !afterEntries.some((entry) => entry.endsWith("stdout.log") || entry.endsWith("stderr.log")),
  gate_reasons_function: mod.getOpenCodeWorkerStartGateReasons(),
};
const passed = blocked && !afterExists && missingReasons.length === 0;
const output = {
  ...result,
  result: passed
    ? "DISABLED_WORKER_START_REFUSED_BEFORE_ARTIFACT_OR_PROCESS_CREATION"
    : "DISABLED_WORKER_START_REGRESSION_FAILED",
};
fs.writeFileSync("runs/FP-023/regression-no-spawn-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
if (!passed) process.exit(1);
