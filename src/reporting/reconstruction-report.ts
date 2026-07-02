import fs from "node:fs";
import path from "node:path";

export const RECONSTRUCTION_BOUNDARY =
  "Reconstruction is read-only. It summarizes recorded state and does not create admission, comparison, ranking, or routing authority.";

export interface ReconstructionArtifact {
  path: string;
  kind: "verification" | "audit" | "comparison" | "admission" | "executor_result";
}

export interface ReconstructionReport {
  packet_id: string;
  packet_path: string;
  packet_exists: boolean;
  source_artifacts: ReconstructionArtifact[];
  verification_state: "PRESENT" | "MISSING";
  audit_state: "PRESENT" | "MISSING";
  comparison_state: "PRESENT" | "NO_COMPARISON_RECORDED";
  admission_state: "PRESENT" | "NOT_EVALUATED" | "UNKNOWN";
  reconstructed_labels: string[];
  boundary: string;
  caveats: string[];
}

interface BuildReconstructionReportOptions {
  packetId: string;
  rootDir?: string;
}

function cleanPacketId(packetId: string): string {
  const trimmed = packetId.trim();
  if (!trimmed) throw new Error("packetId is required");
  if (trimmed.includes("/") || trimmed.includes("\\") || trimmed.includes("..")) {
    throw new Error(`invalid packetId: ${packetId}`);
  }
  return trimmed;
}

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(full));
    if (entry.isFile()) files.push(full);
  }
  return files;
}

function kindFor(rel: string): ReconstructionArtifact["kind"] | null {
  const base = path.basename(rel).toLowerCase();
  if (base.includes("verification")) return "verification";
  if (base.includes("audit")) return "audit";
  if (base.includes("comparison")) return "comparison";
  if (base.includes("admission")) return "admission";
  if (base === "executor-result.md") return "executor_result";
  return null;
}

export function buildReconstructionReport(options: BuildReconstructionReportOptions): ReconstructionReport {
  const packetId = cleanPacketId(options.packetId);
  const rootDir = options.rootDir ?? process.cwd();
  const packetPath = `packets/${packetId}.md`;
  const absolutePacketPath = path.join(rootDir, packetPath);
  if (!fs.existsSync(absolutePacketPath)) {
    throw new Error(`packet not found: ${packetPath}`);
  }

  const runDir = path.join(rootDir, "runs", packetId);
  const source_artifacts = walkFiles(runDir)
    .map((full) => path.relative(rootDir, full).split(path.sep).join("/"))
    .filter((rel) => !rel.includes("/terminal-commands/"))
    .map((rel) => ({ path: rel, kind: kindFor(rel) }))
    .filter((entry): entry is ReconstructionArtifact => entry.kind !== null)
    .sort((a, b) => a.path.localeCompare(b.path));

  const has = (kind: ReconstructionArtifact["kind"]) => source_artifacts.some((a) => a.kind === kind);
  const verification_state = has("verification") ? "PRESENT" : "MISSING";
  const audit_state = has("audit") ? "PRESENT" : "MISSING";
  const comparison_state = has("comparison") ? "PRESENT" : "NO_COMPARISON_RECORDED";
  const admission_state = has("admission") ? "PRESENT" : "NOT_EVALUATED";

  const reconstructed_labels = [
    verification_state === "PRESENT" ? "VERIFICATION_ARTIFACT_PRESENT" : "VERIFICATION_MISSING",
    audit_state === "PRESENT" ? "AUDIT_ARTIFACT_PRESENT" : "AUDIT_MISSING",
    comparison_state === "PRESENT" ? "COMPARISON_ARTIFACT_PRESENT" : "NO_COMPARISON_RECORDED",
    admission_state === "PRESENT" ? "ADMISSION_ARTIFACT_PRESENT" : "NOT_EVALUATED",
  ];

  return {
    packet_id: packetId,
    packet_path: packetPath,
    packet_exists: true,
    source_artifacts,
    verification_state,
    audit_state,
    comparison_state,
    admission_state,
    reconstructed_labels,
    boundary: RECONSTRUCTION_BOUNDARY,
    caveats: [
      RECONSTRUCTION_BOUNDARY,
      "Artifact presence does not imply admission or correctness.",
      "Comparison artifacts are bounded records, not global model rankings.",
      "Missing comparison is reported as missing, not as failure.",
    ],
  };
}

export function formatReconstructionReportText(report: ReconstructionReport): string {
  const lines = [
    `Reconstruction Report: ${report.packet_id}`,
    `Packet Path: ${report.packet_path}`,
    `Verification State: ${report.verification_state}`,
    `Audit State: ${report.audit_state}`,
    `Comparison State: ${report.comparison_state}`,
    `Admission State: ${report.admission_state}`,
    `Labels: ${report.reconstructed_labels.join(", ")}`,
    `Boundary: ${report.boundary}`,
    "Caveats:",
    ...report.caveats.map((c) => `  - ${c}`),
  ];
  if (report.source_artifacts.length > 0) {
    lines.push("Source Artifacts:");
    lines.push(...report.source_artifacts.map((a) => `  - ${a.path} [${a.kind}]`));
  }
  return `${lines.join("\n")}\n`;
}
