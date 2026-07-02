import fs from "node:fs";
import path from "node:path";

export const REPORT_OBSERVATION_BOUNDARY =
  "Observation only. Not admitted evidence. Not routing input.";

export interface PacketReportArtifact {
  path: string;
  kind: string;
}

export interface PacketReportWorkerTelemetrySummary {
  available: boolean;
  count: number;
  admission_states: string[];
  validation_states: string[];
  worker_statuses: string[];
  terminal_states: string[];
  observation_boundary: string;
}

export interface PacketReport {
  packet_id: string;
  packet_path: string;
  packet_exists: boolean;
  packet_title: string | null;
  labels: string[];
  artifacts: PacketReportArtifact[];
  artifact_counts: {
    total: number;
    verification: number;
    operational_proof: number;
    telemetry_or_metrics: number;
    result: number;
  };
  worker_telemetry: PacketReportWorkerTelemetrySummary;
  caveats: string[];
  reporting_rules_path: string;
  evidence_boundary: string;
}

interface WorkerTelemetryQueryResult {
  rows?: Array<{
    worker_status?: string | null;
    terminal_state?: string | null;
    validation_state?: string | null;
    admission_state?: string | null;
  }>;
}

export interface BuildPacketReportOptions {
  packetId: string;
  rootDir?: string;
  workerTelemetryQuery?: (packetId: string) => WorkerTelemetryQueryResult;
}

function requirePacketId(packetId: string): string {
  const trimmed = packetId.trim();
  if (!trimmed) {
    throw new Error("packetId is required");
  }
  if (trimmed.includes("/") || trimmed.includes("\\") || trimmed.includes("..")) {
    throw new Error(`invalid packetId: ${packetId}`);
  }
  return trimmed;
}

function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function artifactKind(relativePath: string): string {
  const base = path.basename(relativePath).toLowerCase();
  if (base.includes("verification")) return "verification";
  if (base.includes("direct-mcp") || base.includes("smoke") || base.includes("query-result")) {
    return "operational_proof";
  }
  if (base.includes("telemetry") || base.includes("metrics")) return "telemetry_or_metrics";
  if (base.includes("result")) return "result";
  return "artifact";
}

function unique(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v && v.trim())))).sort();
}

function buildWorkerTelemetrySummary(
  packetId: string,
  workerTelemetryQuery?: (packetId: string) => WorkerTelemetryQueryResult
): PacketReportWorkerTelemetrySummary {
  if (!workerTelemetryQuery) {
    return {
      available: false,
      count: 0,
      admission_states: [],
      validation_states: [],
      worker_statuses: [],
      terminal_states: [],
      observation_boundary: REPORT_OBSERVATION_BOUNDARY,
    };
  }

  const result = workerTelemetryQuery(packetId);
  const rows = result.rows ?? [];
  return {
    available: rows.length > 0,
    count: rows.length,
    admission_states: unique(rows.map((r) => r.admission_state)),
    validation_states: unique(rows.map((r) => r.validation_state)),
    worker_statuses: unique(rows.map((r) => r.worker_status)),
    terminal_states: unique(rows.map((r) => r.terminal_state)),
    observation_boundary: REPORT_OBSERVATION_BOUNDARY,
  };
}

export function buildPacketReport(options: BuildPacketReportOptions): PacketReport {
  const packetId = requirePacketId(options.packetId);
  const rootDir = options.rootDir ?? process.cwd();
  const packetRelPath = `packets/${packetId}.md`;
  const packetPath = path.join(rootDir, packetRelPath);

  if (!fs.existsSync(packetPath)) {
    throw new Error(`packet not found: ${packetRelPath}`);
  }

  const packetContent = fs.readFileSync(packetPath, "utf-8");
  const packetTitle = extractTitle(packetContent);

  const runDir = path.join(rootDir, "runs", packetId);
  const artifacts = walkFiles(runDir)
    .map((fullPath) => path.relative(rootDir, fullPath).split(path.sep).join("/"))
    .filter((rel) => !rel.includes("/terminal-commands/"))
    .sort()
    .map((rel) => ({ path: rel, kind: artifactKind(rel) }));

  const counts = {
    total: artifacts.length,
    verification: artifacts.filter((a) => a.kind === "verification").length,
    operational_proof: artifacts.filter((a) => a.kind === "operational_proof").length,
    telemetry_or_metrics: artifacts.filter((a) => a.kind === "telemetry_or_metrics").length,
    result: artifacts.filter((a) => a.kind === "result").length,
  };

  const workerTelemetry = buildWorkerTelemetrySummary(packetId, options.workerTelemetryQuery);

  const labels = ["INTENT_RECORDED"];
  if (counts.total > 0) labels.push("RUN_ARTIFACTS_PRESENT");
  if (counts.verification > 0) labels.push("VERIFICATION_ARTIFACT_PRESENT");
  if (counts.operational_proof > 0) labels.push("OPERATIONAL_PROOF_ARTIFACT_PRESENT");
  if (workerTelemetry.available) labels.push("OBSERVED_NOT_ADMITTED");

  const caveats = [
    "Report is an index over committed artifacts and read-only observations; it is not evidence by itself.",
    REPORT_OBSERVATION_BOUNDARY,
    "Verification artifacts do not imply admission unless an admission artifact or state explicitly says so.",
    "This report does not rank models, route work, infer quality, or admit evidence.",
  ];

  return {
    packet_id: packetId,
    packet_path: packetRelPath,
    packet_exists: true,
    packet_title: packetTitle,
    labels,
    artifacts,
    artifact_counts: counts,
    worker_telemetry: workerTelemetry,
    caveats,
    reporting_rules_path: "docs/reporting-evidence-rules.md",
    evidence_boundary: REPORT_OBSERVATION_BOUNDARY,
  };
}

export function formatPacketReportText(report: PacketReport): string {
  const lines = [
    `Packet Report: ${report.packet_id}`,
    `Title: ${report.packet_title ?? "(no title found)"}`,
    `Packet Path: ${report.packet_path}`,
    `Labels: ${report.labels.join(", ")}`,
    `Artifacts: ${report.artifact_counts.total}`,
    `  Verification: ${report.artifact_counts.verification}`,
    `  Operational Proof: ${report.artifact_counts.operational_proof}`,
    `  Telemetry/Metrics: ${report.artifact_counts.telemetry_or_metrics}`,
    `  Result: ${report.artifact_counts.result}`,
    `Worker Telemetry Observations: ${report.worker_telemetry.count}`,
    `Evidence Boundary: ${report.evidence_boundary}`,
    `Reporting Rules: ${report.reporting_rules_path}`,
    "Caveats:",
    ...report.caveats.map((c) => `  - ${c}`),
  ];

  if (report.artifacts.length > 0) {
    lines.push("Artifacts:");
    lines.push(...report.artifacts.map((a) => `  - ${a.path} [${a.kind}]`));
  }

  return `${lines.join("\n")}\n`;
}
