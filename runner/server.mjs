#!/usr/bin/env node

import { createHash, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const RUNNER_PROTOCOL_VERSION = "forgepilot-runner-v1";
const BOUNDARY_VERSION = "FP-MCP-024";
const RUNNER_VERSION = "0.1.0-fp-mcp-024";

const DEFAULT_REPO = "/home/ridasaidd/forgepilot";
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 8791;

const ALLOWED_MODELS = ["deepseek-v4-pro-high", "qwen-3.7-max"];
const ALLOWED_RUN_MODES = ["DESIGN_ONLY"];

const WORKSPACE_ALLOWLIST = Object.freeze({
  forgepilot: "/home/ridasaidd/forgepilot",
  "forgepilot-chatgpt-mcp": "/home/ridasaidd/forgepilot-chatgpt-mcp"
});

const repoRoot = process.env.FORGEPILOT_REPO || DEFAULT_REPO;
const host = process.env.FORGEPILOT_RUNNER_HOST || DEFAULT_HOST;
const port = Number.parseInt(
  process.env.FORGEPILOT_RUNNER_PORT || String(DEFAULT_PORT),
  10
);
const runnerToken = process.env.FORGEPILOT_RUNNER_TOKEN || "";
const opencodeBin =
  process.env.FORGEPILOT_OPENCODE_BIN ||
  "/home/ridasaidd/.nvm/versions/node/v24.4.1/bin/opencode";
const executionEnabled =
  process.env.FORGEPILOT_RUNNER_EXECUTION_ENABLED === "true";

function getOpenCodeModelForModelId(modelId) {
  if (typeof modelId !== "string" || modelId.length === 0) {
    return null;
  }

  const envKey = `FORGEPILOT_OPENCODE_MODEL_${modelId
    .toUpperCase()
    .replaceAll("-", "_")
    .replaceAll(".", "_")}`;

  const configured = process.env[envKey];

  return typeof configured === "string" && configured.trim().length > 0
    ? configured.trim()
    : null;
}

function resolveTargetWorkspace(targetWorkspaceId) {
  if (typeof targetWorkspaceId !== "string") {
    return null;
  }

  const trimmed = targetWorkspaceId.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const resolved = WORKSPACE_ALLOWLIST[trimmed];

  if (resolved === undefined) {
    return null;
  }

  return resolved;
}

async function stageTaskBundle(opencodeWorkingDirectory, runnerRunId, packetId, requestArtifactPath) {
  const bundleDir = path.join(
    opencodeWorkingDirectory,
    ".forgepilot",
    "tasks",
    runnerRunId
  );
  const outputsDir = path.join(bundleDir, "outputs");

  await mkdir(outputsDir, { recursive: true });

  const packetSrc = path.join(repoRoot, "packets", `${packetId}.md`);
  const packetContent = await readFile(packetSrc, "utf8");
  await writeFile(path.join(bundleDir, "packet.md"), packetContent);

  const requestSrc = path.join(repoRoot, requestArtifactPath);
  const requestContent = await readFile(requestSrc, "utf8");
  await writeFile(path.join(bundleDir, "request.json"), requestContent);

  const instructions = [
    `ForgePilot staged task execution instructions.`,
    ``,
    `Packet: ${packetId}`,
    `Runner run ID: ${runnerRunId}`,
    ``,
    `Read packet.md to understand the task requirements.`,
    `Read request.json for the execution context details.`,
    `Produce all DESIGN_ONLY implementation/evidence artifacts in the outputs/ directory.`,
    ``,
    `Do not read outside the current workspace.`,
    `Do not expose secrets.`,
    `Preserve ForgePilot evidence discipline.`
  ].join("\n");

  await writeFile(path.join(bundleDir, "instructions.md"), instructions);

  return {
    bundleDir,
    bundleRelativePath: `.forgepilot/tasks/${runnerRunId}`,
    files: ["packet.md", "request.json", "instructions.md", "outputs/"]
  };
}

function nowIso() {
  return new Date().toISOString();
}

function jsonResponse(res, statusCode, body) {
  const payload = `${JSON.stringify(body, null, 2)}\n`;

  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload)
  });

  res.end(payload);
}

function textResponse(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });

  res.end(body);
}

function logOperationStart(operationName) {
  console.error(`Runner operation invoked: ${operationName}`);
}

function logOperationEnd(operationName, startedAt, ok, errorCode = null) {
  const durationMs = Date.now() - startedAt;

  if (ok) {
    console.error(
      `Runner operation completed: ${operationName} PASS durationMs=${durationMs}`
    );
  } else {
    console.error(
      `Runner operation completed: ${operationName} FAIL errorCode=${errorCode || "UNKNOWN"} durationMs=${durationMs}`
    );
  }
}

function safeEqualString(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getBearerToken(req) {
  const header = req.headers.authorization;

  if (typeof header !== "string") {
    return null;
  }

  if (!header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length);
}

function requireAuth(req) {
  if (runnerToken.length === 0) {
    return {
      ok: false,
      statusCode: 503,
      reason: "RUNNER_AUTH_UNCONFIGURED"
    };
  }

  const provided = getBearerToken(req);

  if (provided === null || !safeEqualString(provided, runnerToken)) {
    return {
      ok: false,
      statusCode: 401,
      reason: "RUNNER_AUTH_FAILED"
    };
  }

  return {
    ok: true,
    statusCode: 200,
    reason: null
  };
}

function readRequestBody(req, maxBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let body = "";
    let bytes = 0;

    req.setEncoding("utf8");

    req.on("data", (chunk) => {
      bytes += Buffer.byteLength(chunk);

      if (bytes > maxBytes) {
        reject(new Error("REQUEST_BODY_TOO_LARGE"));
        req.destroy();
        return;
      }

      body += chunk;
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function readJsonBody(req) {
  const body = await readRequestBody(req);

  if (body.trim().length === 0) {
    return {};
  }

  const parsed = JSON.parse(body);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    throw new Error("RUNNER_PROTOCOL_ERROR");
  }

  return parsed;
}

function isValidPacketId(packetId) {
  return /^FP-[A-Z]+-[0-9]{3}$/.test(packetId);
}

function isValidRequestId(requestId) {
  return /^REQ-[0-9]{8}T[0-9]{9}Z-[a-f0-9]{8}$/.test(requestId);
}

function normalizeRepoRelativePath(inputPath) {
  return inputPath.replaceAll("\\", "/");
}

function hasUnsafePathSegment(repoRelativePath) {
  return repoRelativePath
    .split("/")
    .some((segment) => segment === "" || segment === "." || segment === "..");
}

function isSafeRequestArtifactPath(packetId, requestId, requestArtifactPath) {
  const normalized = normalizeRepoRelativePath(requestArtifactPath);
  const expectedPrefix = `runs/${packetId}/opencode-requests/`;
  const expectedSuffix = `${requestId}.json`;

  if (path.isAbsolute(normalized)) {
    return false;
  }

  if (normalized !== requestArtifactPath) {
    return false;
  }

  if (hasUnsafePathSegment(normalized)) {
    return false;
  }

  if (!normalized.startsWith(expectedPrefix)) {
    return false;
  }

  if (!normalized.endsWith(expectedSuffix)) {
    return false;
  }

  return true;
}

function isSafeArtifactDir(packetId, modelId, runMode, artifactDir) {
  const normalized = normalizeRepoRelativePath(artifactDir);
  const expected = `runs/${packetId}/${modelId}-${runMode}/`;

  if (path.isAbsolute(normalized)) {
    return false;
  }

  if (normalized !== artifactDir) {
    return false;
  }

  if (hasUnsafePathSegment(normalized.slice(0, -1))) {
    return false;
  }

  return normalized === expected;
}

async function sha256RepoFile(repoRelativePath) {
  const normalized = normalizeRepoRelativePath(repoRelativePath);
  const absolute = path.join(repoRoot, normalized);
  const resolved = path.resolve(absolute);
  const resolvedRepo = path.resolve(repoRoot);

  if (!resolved.startsWith(`${resolvedRepo}${path.sep}`)) {
    throw new Error("UNSAFE_REQUEST_ARTIFACT_PATH");
  }

  const content = await readFile(resolved);
  return createHash("sha256").update(content).digest("hex");
}

async function readJsonRepoFile(repoRelativePath) {
  const normalized = normalizeRepoRelativePath(repoRelativePath);
  const absolute = path.join(repoRoot, normalized);
  const resolved = path.resolve(absolute);
  const resolvedRepo = path.resolve(repoRoot);

  if (!resolved.startsWith(`${resolvedRepo}${path.sep}`)) {
    throw new Error("UNSAFE_REQUEST_ARTIFACT_PATH");
  }

  const content = await readFile(resolved, "utf8");
  return JSON.parse(content);
}

async function gitObservation(args) {
  const result = await execFileAsync("git", args, {
    cwd: repoRoot,
    timeout: 5_000,
    maxBuffer: 1024 * 1024
  });

  return result.stdout.trim();
}

async function gitSucceeds(args) {
  try {
    await execFileAsync("git", args, {
      cwd: repoRoot,
      timeout: 5_000,
      maxBuffer: 1024 * 1024
    });

    return true;
  } catch {
    return false;
  }
}

async function resolveCommitShort(commit) {
  if (typeof commit !== "string" || commit.trim().length === 0) {
    return null;
  }

  try {
    return await gitObservation([
      "rev-parse",
      "--verify",
      "--short",
      `${commit}^{commit}`
    ]);
  } catch {
    return null;
  }
}

async function commitIsAncestor(ancestorCommit, descendantCommit) {
  if (ancestorCommit === null || descendantCommit === null) {
    return false;
  }

  return await gitSucceeds([
    "merge-base",
    "--is-ancestor",
    ancestorCommit,
    descendantCommit
  ]);
}

async function findArtifactCommit(requestArtifactPath) {
  if (requestArtifactPath === null) {
    return null;
  }

  try {
    const output = await gitObservation([
      "log",
      "--diff-filter=A",
      "--format=%h",
      "--",
      requestArtifactPath
    ]);

    const [artifactCommit] = output
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return artifactCommit || null;
  } catch {
    return null;
  }
}

async function getCurrentCommit() {
  return gitObservation(["rev-parse", "--short", "HEAD"]);
}

async function getGitStatusShort() {
  return gitObservation(["status", "--short"]);
}

function getStringField(object, key) {
  const value = object[key];
  return typeof value === "string" ? value : null;
}

function getBooleanField(object, key) {
  const value = object[key];
  return typeof value === "boolean" ? value : null;
}

function hasForbiddenExecutionFields(body) {
  const forbidden = [
    "prompt",
    "command",
    "shell",
    "modelOverride",
    "runModeOverride",
    "artifactDirOverride",
    "env",
    "secrets",
    "providerCredentials"
  ];

  return forbidden.some((key) => Object.prototype.hasOwnProperty.call(body, key));
}

function baseValidateResult(body, reasons) {
  return {
    valid: false,
    accepted: false,
    runnerConfigured: runnerToken.length > 0,
    runnerContacted: true,
    executionEnabled,
    executionStarted: false,
    packetId: typeof body.packetId === "string" ? body.packetId : "",
    requestId: typeof body.requestId === "string" ? body.requestId : "",
    requestArtifactPath:
      typeof body.requestArtifactPath === "string"
        ? body.requestArtifactPath
        : null,
    requestArtifactSha256:
      typeof body.requestArtifactSha256 === "string"
        ? body.requestArtifactSha256
        : null,
    baseCommit:
      typeof body.baseCommit === "string"
        ? body.baseCommit
        : null,
    currentCommit: null,
    requestBaseCommit: null,
    creationCommit: null,
    artifactCommit: null,
    creationCommitExists: false,
    artifactCommitExists: false,
    creationCommitAncestorOfArtifactCommit: false,
    artifactCommitReachableFromHead: false,
    artifactDir: null,
    modelId: null,
    runMode: null,
    runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
    boundaryVersion: BOUNDARY_VERSION,
    statusSource: "private dev runner validation policy",
    checkedAt: nowIso(),
    reasons: [...new Set(reasons)]
  };
}

async function validateRequestArtifact(body) {
  const reasons = [];

  if (hasForbiddenExecutionFields(body)) {
    reasons.push("FORBIDDEN_EXECUTION_FIELD");
  }

  const packetId = getStringField(body, "packetId");
  const requestId = getStringField(body, "requestId");
  const requestArtifactPath = getStringField(body, "requestArtifactPath");
  const requestArtifactSha256 = getStringField(body, "requestArtifactSha256");
  const baseCommit = getStringField(body, "baseCommit");

  if (packetId === null || !isValidPacketId(packetId)) {
    reasons.push("INVALID_PACKET_ID");
  }

  if (requestId === null || !isValidRequestId(requestId)) {
    reasons.push("INVALID_REQUEST_ID");
  }

  if (
    packetId === null ||
    requestId === null ||
    requestArtifactPath === null ||
    !isSafeRequestArtifactPath(packetId, requestId, requestArtifactPath)
  ) {
    reasons.push("UNSAFE_REQUEST_ARTIFACT_PATH");
  }

  if (requestArtifactSha256 === null || !/^[a-f0-9]{64}$/.test(requestArtifactSha256)) {
    reasons.push("REQUEST_DIGEST_MISMATCH");
  }

  if (baseCommit === null || !/^[a-f0-9]{7,40}$/.test(baseCommit)) {
    reasons.push("BASE_COMMIT_MISMATCH");
  }

  if (reasons.length > 0) {
    return baseValidateResult(body, reasons);
  }

  let actualDigest;

  try {
    actualDigest = await sha256RepoFile(requestArtifactPath);
  } catch {
    return baseValidateResult(body, ["UNKNOWN_REQUEST"]);
  }

  if (actualDigest !== requestArtifactSha256) {
    reasons.push("REQUEST_DIGEST_MISMATCH");
  }

  let artifact;

  try {
    artifact = await readJsonRepoFile(requestArtifactPath);
  } catch {
    reasons.push("INVALID_REQUEST_ARTIFACT");
    return baseValidateResult(body, reasons);
  }

  if (
    typeof artifact !== "object" ||
    artifact === null ||
    Array.isArray(artifact)
  ) {
    reasons.push("INVALID_REQUEST_SCHEMA");
    return baseValidateResult(body, reasons);
  }

  const artifactPacketId = getStringField(artifact, "packetId");
  const artifactRequestId = getStringField(artifact, "requestId");
  const artifactBaseCommit = getStringField(artifact, "baseCommit");
  const artifactStatus = getStringField(artifact, "status");
  const artifactModelId = getStringField(artifact, "modelId");
  const artifactRunMode = getStringField(artifact, "runMode");
  const artifactDir = getStringField(artifact, "artifactDir");
  const artifactExecutionStarted = getBooleanField(artifact, "executionStarted");

  if (artifactPacketId !== packetId) {
    reasons.push("REQUEST_PACKET_MISMATCH");
  }

  if (artifactRequestId !== requestId) {
    reasons.push("REQUEST_ID_MISMATCH");
  }

  if (artifactStatus !== "REQUEST_RECORDED") {
    reasons.push("REQUEST_NOT_RECORDED");
  }

  if (artifactExecutionStarted !== false) {
    reasons.push("REQUEST_NOT_RECORDED");
  }

  if (artifactModelId === null || !ALLOWED_MODELS.includes(artifactModelId)) {
    reasons.push("DISALLOWED_MODEL");
  }

  if (artifactRunMode === null || !ALLOWED_RUN_MODES.includes(artifactRunMode)) {
    reasons.push("DISALLOWED_RUN_MODE");
  }

  if (
    artifactDir === null ||
    artifactModelId === null ||
    artifactRunMode === null ||
    !isSafeArtifactDir(packetId, artifactModelId, artifactRunMode, artifactDir)
  ) {
    reasons.push("UNSAFE_ARTIFACT_DIR");
  }

  try {
    await readFile(path.join(repoRoot, "packets", `${packetId}.md`), "utf8");
  } catch {
    reasons.push("UNKNOWN_PACKET");
  }

  let currentCommit = null;
  let gitStatusShort = null;

  try {
    currentCommit = await getCurrentCommit();
    gitStatusShort = await getGitStatusShort();
  } catch {
    reasons.push("CURRENT_COMMIT_UNAVAILABLE");
  }

  if (gitStatusShort !== null && gitStatusShort.length > 0) {
    reasons.push("DIRTY_WORKING_TREE");
  }

  const baseCommitReachableFromHead = await commitIsAncestor(
    baseCommit,
    currentCommit
  );

  if (currentCommit !== null && !baseCommitReachableFromHead) {
    reasons.push("BASE_COMMIT_MISMATCH");
  }

  const creationCommit = await resolveCommitShort(artifactBaseCommit);
  let artifactCommit = await findArtifactCommit(requestArtifactPath);
  artifactCommit =
    artifactCommit !== null ? await resolveCommitShort(artifactCommit) : null;

  const creationCommitExists = creationCommit !== null;
  const artifactCommitExists = artifactCommit !== null;
  const creationCommitAncestorOfArtifactCommit = await commitIsAncestor(
    creationCommit,
    artifactCommit
  );
  const artifactCommitReachableFromHead = await commitIsAncestor(
    artifactCommit,
    currentCommit
  );

  if (!creationCommitExists) {
    reasons.push("CREATION_COMMIT_MISSING");
  }

  if (!artifactCommitExists) {
    reasons.push("ARTIFACT_COMMIT_MISSING");
  }

  if (
    creationCommitExists &&
    artifactCommitExists &&
    !creationCommitAncestorOfArtifactCommit
  ) {
    reasons.push("CREATION_COMMIT_NOT_ANCESTOR_OF_ARTIFACT_COMMIT");
  }

  if (artifactCommitExists && !artifactCommitReachableFromHead) {
    reasons.push("ARTIFACT_COMMIT_NOT_REACHABLE_FROM_HEAD");
  }

  return {
    valid: reasons.length === 0,
    accepted: reasons.length === 0,
    runnerConfigured: runnerToken.length > 0,
    runnerContacted: true,
    executionEnabled,
    executionStarted: false,
    packetId,
    requestId,
    requestArtifactPath,
    requestArtifactSha256,
    baseCommit,
    currentCommit,
    requestBaseCommit: artifactBaseCommit,
    creationCommit,
    artifactCommit,
    baseCommitReachableFromHead,
    creationCommitExists,
    artifactCommitExists,
    creationCommitAncestorOfArtifactCommit,
    artifactCommitReachableFromHead,
    artifactDir,
    modelId: artifactModelId,
    runMode: artifactRunMode,
    runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
    boundaryVersion: BOUNDARY_VERSION,
    statusSource: "private dev runner validation policy",
    checkedAt: nowIso(),
    reasons: [...new Set(reasons)]
  };
}

function capabilitiesResult() {
  const reasons = [];

  if (runnerToken.length === 0) {
    reasons.push("RUNNER_AUTH_UNCONFIGURED");
  }

  if (!executionEnabled) {
    reasons.push("EXECUTION_DISABLED");
  }

  return {
    runnerConfigured: runnerToken.length > 0,
    runnerHostRole: "dev-execution-plane",
    runnerVersion: RUNNER_VERSION,
    runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
    executionEnabled,
    opencodeHarnessConfigured: executionEnabled,
    opencodeHarnessReachable: executionEnabled,
    supportedOperations: executionEnabled
      ? ["capabilities", "validate-request", "start-run"]
      : ["capabilities", "validate-request"],
    startCapabilityAdvertised: true,
    startCapabilityCallable: executionEnabled,
    startCapabilityVersion: "guarded-start-capability-v1",
    startOperationName: executionEnabled ? "start-run" : "start-disabled-stub",
    startEndpointPresent: true,
    startEndpointState: executionEnabled ? "CALLABLE_GUARDED" : "PRESENT_DISABLED",
    startRequiresApprovalEvidence: true,
    startRequiresPreflight: true,
    startRequiresDisableSwitchClear: true,
    startRequiresRequestArtifactHash: true,
    startRequiresTargetExecutionCommit: true,
    startRequiresEvidenceLedgerValidation: true,
    startRecordsPreStartState: executionEnabled,
    startRecordsPostStartState: executionEnabled,
    startReturnsRunnerRunId: executionEnabled,
    startDisabledReason: executionEnabled ? null : "START_ENDPOINT_PRESENT_DISABLED",
    startBlockingReasons: executionEnabled
      ? []
      : [
          "START_ENDPOINT_DISABLED",
          "START_NOT_CALLABLE",
          "RUNNER_EXECUTION_DISABLED",
          "OPENCODE_EXECUTION_DISABLED"
        ],
    supportedRunModes: ALLOWED_RUN_MODES,
    allowedModels: ALLOWED_MODELS,
    supportedWorkspaces: Object.keys(WORKSPACE_ALLOWLIST),
    defaultWorkspace: "forgepilot",
    workspaceRoutingEnabled: true,
    statusSource: executionEnabled
      ? "private dev runner guarded execution policy"
      : "private dev runner static policy",
    checkedAt: nowIso(),
    reasons
  };
}

async function handleCapabilities(req, res) {
  const operation = "capabilities";
  const startedAt = Date.now();
  logOperationStart(operation);

  const auth = requireAuth(req);

  if (!auth.ok) {
    logOperationEnd(operation, startedAt, false, auth.reason);
    jsonResponse(res, auth.statusCode, {
      runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
      boundaryVersion: BOUNDARY_VERSION,
      checkedAt: nowIso(),
      reasons: [auth.reason]
    });
    return;
  }

  logOperationEnd(operation, startedAt, true);
  jsonResponse(res, 200, capabilitiesResult());
}

async function handleValidateRequest(req, res) {
  const operation = "validate-request";
  const startedAt = Date.now();
  logOperationStart(operation);

  const auth = requireAuth(req);

  if (!auth.ok) {
    logOperationEnd(operation, startedAt, false, auth.reason);
    jsonResponse(res, auth.statusCode, {
      valid: false,
      accepted: false,
      runnerConfigured: runnerToken.length > 0,
      runnerContacted: true,
      executionEnabled,
      executionStarted: false,
      runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
      boundaryVersion: BOUNDARY_VERSION,
      statusSource: "private dev runner authentication policy",
      checkedAt: nowIso(),
      reasons: [auth.reason]
    });
    return;
  }

  let body;

  try {
    body = await readJsonBody(req);
  } catch {
    logOperationEnd(operation, startedAt, false, "RUNNER_PROTOCOL_ERROR");
    jsonResponse(res, 400, {
      valid: false,
      accepted: false,
      runnerConfigured: runnerToken.length > 0,
      runnerContacted: true,
      executionEnabled,
      executionStarted: false,
      runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
      boundaryVersion: BOUNDARY_VERSION,
      statusSource: "private dev runner protocol policy",
      checkedAt: nowIso(),
      reasons: ["RUNNER_PROTOCOL_ERROR"]
    });
    return;
  }

  const result = await validateRequestArtifact(body);
  logOperationEnd(
    operation,
    startedAt,
    result.valid === true,
    result.valid === true ? null : result.reasons[0] || "RUNNER_REJECTED_REQUEST"
  );

  jsonResponse(res, 200, result);
}

async function handleStartRun(req, res) {
  const operation = "start-run";
  const startedAt = Date.now();
  logOperationStart(operation);

  const auth = requireAuth(req);

  if (!auth.ok) {
    logOperationEnd(operation, startedAt, false, auth.reason);
    jsonResponse(res, auth.statusCode, {
      valid: false,
      accepted: false,
      runnerConfigured: runnerToken.length > 0,
      runnerContacted: true,
      executionEnabled,
      executionStarted: false,
      opencodeStarted: false,
      runnerRunId: null,
      startEndpointContacted: true,
      runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
      boundaryVersion: BOUNDARY_VERSION,
      statusSource: "private dev runner authentication policy",
      checkedAt: nowIso(),
      reasons: [auth.reason]
    });
    return;
  }

  let body;

  try {
    body = await readJsonBody(req);
  } catch {
    logOperationEnd(operation, startedAt, false, "RUNNER_PROTOCOL_ERROR");
    jsonResponse(res, 400, {
      valid: false,
      accepted: false,
      executionEnabled,
      executionStarted: false,
      opencodeStarted: false,
      runnerRunId: null,
      startEndpointContacted: true,
      runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
      boundaryVersion: BOUNDARY_VERSION,
      statusSource: "private dev runner guarded start protocol policy",
      checkedAt: nowIso(),
      reasons: ["RUNNER_PROTOCOL_ERROR"]
    });
    return;
  }

  if (!executionEnabled) {
    logOperationEnd(operation, startedAt, false, "START_ENDPOINT_DISABLED");

    jsonResponse(res, 403, {
      valid: false,
      accepted: false,
      executionEnabled: false,
      executionStarted: false,
      opencodeStarted: false,
      runnerRunId: null,
      startEndpointContacted: true,
      startEndpointState: "PRESENT_DISABLED",
      startCapabilityCallable: false,
      executionAllowedNow: false,
      approvalConsumed: false,
      approvalConsumptionPath: null,
      preStartEvidenceCreated: false,
      postStartEvidenceCreated: false,
      requestArtifactMutated: false,
      runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
      boundaryVersion: BOUNDARY_VERSION,
      statusSource: "private dev runner disabled start stub policy",
      checkedAt: nowIso(),
      reasons: [
        "START_ENDPOINT_DISABLED",
        "START_NOT_CALLABLE",
        "EXECUTION_NOT_ALLOWED",
        "RUNNER_EXECUTION_DISABLED",
        "OPENCODE_EXECUTION_DISABLED"
      ]
    });
    return;
  }

  const requestedTargetWorkspaceId =
    getStringField(body, "targetWorkspaceId") ?? "forgepilot";
  const opencodeWorkingDirectory = resolveTargetWorkspace(
    requestedTargetWorkspaceId
  );

  if (opencodeWorkingDirectory === null) {
    logOperationEnd(operation, startedAt, false, "DISALLOWED_WORKSPACE");

    jsonResponse(res, 403, {
      valid: false,
      accepted: false,
      executionEnabled: true,
      executionStarted: false,
      opencodeStarted: false,
      runnerRunId: null,
      startEndpointContacted: true,
      startEndpointState: "CALLABLE_GUARDED",
      startCapabilityCallable: true,
      executionAllowedNow: false,
      approvalConsumed: false,
      approvalConsumptionPath: null,
      preStartEvidenceCreated: false,
      preStartEvidencePath: null,
      postStartEvidenceCreated: false,
      postStartEvidencePath: null,
      requestArtifactMutated: false,
      targetWorkspaceId: requestedTargetWorkspaceId,
      opencodeWorkingDirectory: null,
      runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
      boundaryVersion: BOUNDARY_VERSION,
      statusSource: "private dev runner guarded workspace resolution policy",
      checkedAt: nowIso(),
      reasons: ["DISALLOWED_WORKSPACE"]
    });
    return;
  }

  const validation = await validateRequestArtifact(body);

  if (validation.valid !== true) {
    logOperationEnd(
      operation,
      startedAt,
      false,
      validation.reasons?.[0] || "RUNNER_REJECTED_REQUEST"
    );

    jsonResponse(res, 200, {
      ...validation,
      accepted: false,
      executionEnabled,
      executionStarted: false,
      opencodeStarted: false,
      runnerRunId: null,
      startEndpointContacted: true,
      startEndpointState: "CALLABLE_GUARDED",
      startCapabilityCallable: true,
      executionAllowedNow: false,
      approvalConsumed: false,
      approvalConsumptionPath: null,
      preStartEvidenceCreated: false,
      postStartEvidenceCreated: false,
      requestArtifactMutated: false,
      statusSource: "private dev runner guarded start validation policy",
      checkedAt: nowIso()
    });
    return;
  }

  const runnerRunId = `RUN-${new Date()
    .toISOString()
    .replace(/[-:.]/g, "")
    .replace("T", "T")
    .replace("Z", "Z")}-${Math.random().toString(16).slice(2, 10)}`;

  const artifactDir =
    typeof validation.artifactDir === "string"
      ? validation.artifactDir
      : `runs/${validation.packetId}/${validation.modelId}-${validation.runMode}/`;

  const absoluteArtifactDir = path.join(repoRoot, artifactDir);
  await mkdir(absoluteArtifactDir, { recursive: true });

  const taskBundle = await stageTaskBundle(
    opencodeWorkingDirectory,
    runnerRunId,
    validation.packetId,
    validation.requestArtifactPath
  );

  const preStartStatePath = path.join(absoluteArtifactDir, `${runnerRunId}-pre-start.json`);
  const postStartStatePath = path.join(absoluteArtifactDir, `${runnerRunId}-post-start.json`);
  const stdoutPath = path.join(absoluteArtifactDir, `${runnerRunId}-opencode.stdout.log`);
  const stderrPath = path.join(absoluteArtifactDir, `${runnerRunId}-opencode.stderr.log`);

  const message = [
    `ForgePilot guarded DESIGN_ONLY execution request.`,
    `Packet: ${validation.packetId}`,
    `Request: ${validation.requestId}`,
    `Model: ${validation.modelId}`,
    `Run mode: ${validation.runMode}`,
    `Target commit: ${validation.requestBaseCommit || validation.baseCommit}`,
    ``,
    `Read ${taskBundle.bundleRelativePath}/instructions.md.`,
    `The packet has been staged at ${taskBundle.bundleRelativePath}/packet.md.`,
    `The request artifact has been staged at ${taskBundle.bundleRelativePath}/request.json.`,
    `Write outputs to ${taskBundle.bundleRelativePath}/outputs/.`,
    `Do not read outside the current workspace.`,
    `Do not expose secrets. Preserve ForgePilot evidence discipline.`
  ].join("\n");

  await writeFile(
    preStartStatePath,
    `${JSON.stringify(
      {
        schemaVersion: "FP-MCP-142",
        artifactType: "runner-pre-start-state",
        packetId: validation.packetId,
        requestId: validation.requestId,
        runnerRunId,
        executionEnabled,
        startEndpointContacted: true,
        executionStarted: false,
        opencodeStarted: false,
        targetWorkspaceId: requestedTargetWorkspaceId,
        opencodeWorkingDirectory,
        taskBundleCreated: true,
        taskBundlePath: taskBundle.bundleDir,
        taskBundleRelativePath: taskBundle.bundleRelativePath,
        taskBundleFiles: taskBundle.files,
        recordedAt: nowIso()
      },
      null,
      2
    )}\n`
  );

  const stdoutFd = await import("node:fs").then((fs) => fs.openSync(stdoutPath, "a"));
  const stderrFd = await import("node:fs").then((fs) => fs.openSync(stderrPath, "a"));

  const opencodeModel = getOpenCodeModelForModelId(validation.modelId);
  const opencodeArgs = [
    "run",
    "--dir",
    opencodeWorkingDirectory,
    "--title",
    `ForgePilot ${validation.packetId} ${runnerRunId}`
  ];

  if (opencodeModel !== null) {
    opencodeArgs.push("--model", opencodeModel);
  }

  opencodeArgs.push(message);

  const child = spawn(
    opencodeBin,
    opencodeArgs,
    {
      cwd: repoRoot,
      detached: true,
      stdio: ["ignore", stdoutFd, stderrFd]
    }
  );

  child.on("error", async (error) => {
    try {
      await writeFile(
        postStartStatePath,
        `${JSON.stringify(
          {
            schemaVersion: "FP-MCP-142",
            artifactType: "runner-post-start-state",
            packetId: validation.packetId,
            requestId: validation.requestId,
            runnerRunId,
            executionEnabled,
            startEndpointContacted: true,
            executionStarted: false,
            opencodeStarted: false,
            opencodeBin,
            opencodeModel,
            opencodeArgs,
            targetWorkspaceId: requestedTargetWorkspaceId,
            opencodeWorkingDirectory,
            taskBundleCreated: true,
            taskBundlePath: taskBundle.bundleDir,
            taskBundleRelativePath: taskBundle.bundleRelativePath,
            errorCode: error && typeof error.code === "string" ? error.code : "OPENCODE_SPAWN_ERROR",
            errorMessage: error && typeof error.message === "string" ? error.message : "OpenCode spawn failed",
            stdoutPath,
            stderrPath,
            recordedAt: nowIso()
          },
          null,
          2
        )}\n`
      );
    } catch {
      // Preserve runner liveness even if failure evidence cannot be written.
    }
  });

  child.unref();

  await writeFile(
    postStartStatePath,
    `${JSON.stringify(
      {
        schemaVersion: "FP-MCP-142",
        artifactType: "runner-post-start-state",
        packetId: validation.packetId,
        requestId: validation.requestId,
        runnerRunId,
        executionEnabled,
        startEndpointContacted: true,
        executionStarted: true,
        opencodeStarted: true,
        opencodePid: child.pid ?? null,
        opencodeBin,
        opencodeModel,
        opencodeArgs,
        targetWorkspaceId: requestedTargetWorkspaceId,
        opencodeWorkingDirectory,
        taskBundleCreated: true,
        taskBundlePath: taskBundle.bundleDir,
        taskBundleRelativePath: taskBundle.bundleRelativePath,
        stdoutPath,
        stderrPath,
        recordedAt: nowIso()
      },
      null,
      2
    )}\n`
  );

  logOperationEnd(operation, startedAt, true);

  jsonResponse(res, 200, {
    valid: true,
    accepted: true,
    executionEnabled,
    executionStarted: true,
    opencodeStarted: true,
    runnerRunId,
    startEndpointContacted: true,
    startEndpointState: "CALLABLE_GUARDED",
    startCapabilityCallable: true,
    executionAllowedNow: true,
    approvalConsumed: false,
    approvalConsumptionPath: null,
    preStartEvidenceCreated: true,
    preStartEvidencePath: preStartStatePath,
    postStartEvidenceCreated: true,
    postStartEvidencePath: postStartStatePath,
    taskBundleCreated: true,
    taskBundlePath: taskBundle.bundleDir,
    taskBundleRelativePath: taskBundle.bundleRelativePath,
    requestArtifactMutated: false,
    packetId: validation.packetId,
    requestId: validation.requestId,
    artifactDir,
    runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
    boundaryVersion: "FP-MCP-142",
    statusSource: "private dev runner guarded OpenCode start policy",
    checkedAt: nowIso(),
    reasons: []
  });
}

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  try {
    if (req.method === "GET" && requestUrl.pathname === "/runner/health") {
      textResponse(res, 200, "ok\n");
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/runner/capabilities") {
      await handleCapabilities(req, res);
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/runner/validate-request") {
      await handleValidateRequest(req, res);
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/runner/start-run") {
      await handleStartRun(req, res);
      return;
    }

    jsonResponse(res, 404, {
      runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
      boundaryVersion: BOUNDARY_VERSION,
      checkedAt: nowIso(),
      reasons: ["RUNNER_PROTOCOL_ERROR"]
    });
  } catch {
    jsonResponse(res, 500, {
      runnerProtocolVersion: RUNNER_PROTOCOL_VERSION,
      boundaryVersion: BOUNDARY_VERSION,
      checkedAt: nowIso(),
      reasons: ["RUNNER_PROTOCOL_ERROR"]
    });
  }
});

server.listen(port, host, () => {
  console.error(
    `ForgePilot private dev runner skeleton listening on http://${host}:${port}`
  );
});
