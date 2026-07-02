import fs from "node:fs";
import path from "node:path";

export const PROJECT_REPORT_BOUNDARY =
  "This project report is an index over committed evidence and checklist state. It is not evidence by itself.";

export interface ChecklistCapability {
  capability: string;
  status: string;
  evidence: string;
  notes: string;
  boundary: string;
}

export interface PacketInventoryEntry {
  namespace: string;
  count: number;
  packets: string[];
}

export interface ProjectReport {
  report_type: "PROJECT_SUMMARY_V1";
  boundary: string;
  v1_completion_definition: string | null;
  v1_completion_status: "COMPLETE" | "NOT_COMPLETE";
  v1_completion_reason: string;
  checklist_source: string;
  checklist_status_counts: Record<string, number>;
  checklist_capabilities: ChecklistCapability[];
  incomplete_capabilities: ChecklistCapability[];
  deferred_capabilities: ChecklistCapability[];
  packet_inventory: PacketInventoryEntry[];
  recent_packets: string[];
  governing_docs: string[];
  next_recommended_work: Array<{
    work_item: string;
    current_status: string;
    recommended_namespace: string;
    reason: string;
  }>;
  caveats: string[];
}

interface BuildProjectReportOptions {
  rootDir?: string;
}

function readIfExists(pathname: string): string | null {
  return fs.existsSync(pathname) ? fs.readFileSync(pathname, "utf-8") : null;
}

function parseMarkdownTableRows(section: string): string[][] {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .filter((line) => !/^\|\s*-+/.test(line))
    .map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 2);
}

function extractSection(content: string, heading: string): string {
  const start = content.indexOf(`## ${heading}`);
  if (start === -1) return "";
  const rest = content.slice(start);
  const next = rest.slice(1).search(/\n##\s+/);
  return next === -1 ? rest : rest.slice(0, next + 1);
}

function stripMarkdown(value: string): string {
  return value.replace(/`/g, "").trim();
}

function parseCapabilities(checklist: string): ChecklistCapability[] {
  const section = extractSection(checklist, "V1 Capability Checklist");
  const rows = parseMarkdownTableRows(section);
  return rows
    .filter((cells) => cells[0] !== "Capability")
    .filter((cells) => cells.length >= 5)
    .map((cells) => ({
      capability: stripMarkdown(cells[0]),
      status: stripMarkdown(cells[1]),
      evidence: stripMarkdown(cells[2]),
      notes: stripMarkdown(cells[3]),
      boundary: stripMarkdown(cells[4]),
    }));
}

function parseRecommendations(checklist: string): ProjectReport["next_recommended_work"] {
  const section = extractSection(checklist, "Recommended Namespace Guidance");
  const rows = parseMarkdownTableRows(section);
  return rows
    .filter((cells) => cells[0] !== "Future capability / work item")
    .filter((cells) => cells.length >= 4)
    .filter((cells) => stripMarkdown(cells[1]) !== "COMPLETE")
    .map((cells) => ({
      work_item: stripMarkdown(cells[0]),
      current_status: stripMarkdown(cells[1]),
      recommended_namespace: stripMarkdown(cells[2]),
      reason: stripMarkdown(cells[3]),
    }));
}

function extractV1CompletionDefinition(checklist: string): string | null {
  const match = checklist.match(/ForgePilot V1 is complete when ([\s\S]*?)\n\n/);
  return match ? `ForgePilot V1 is complete when ${match[1].trim()}` : null;
}

function namespaceForPacket(filename: string): string {
  if (/^FP-META-/.test(filename)) return "FP-META";
  if (/^FP-MCP-/.test(filename)) return "FP-MCP";
  if (/^FP-OPS-/.test(filename)) return "FP-OPS";
  if (/^FP-\d+/.test(filename)) return "FP";
  return "OTHER";
}

function buildPacketInventory(rootDir: string): PacketInventoryEntry[] {
  const packetsDir = path.join(rootDir, "packets");
  if (!fs.existsSync(packetsDir)) return [];
  const grouped = new Map<string, string[]>();
  for (const entry of fs.readdirSync(packetsDir)) {
    if (!entry.endsWith(".md")) continue;
    const namespace = namespaceForPacket(entry);
    const list = grouped.get(namespace) ?? [];
    list.push(entry.replace(/\.md$/, ""));
    grouped.set(namespace, list);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([namespace, packets]) => ({
      namespace,
      count: packets.length,
      packets: packets.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    }));
}

function statusCounts(capabilities: ChecklistCapability[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const capability of capabilities) {
    counts[capability.status] = (counts[capability.status] ?? 0) + 1;
  }
  return counts;
}

function incompleteCapabilities(capabilities: ChecklistCapability[]): ChecklistCapability[] {
  return capabilities.filter((capability) => capability.status !== "COMPLETE" && capability.status !== "DEFERRED");
}

function deferredCapabilities(capabilities: ChecklistCapability[]): ChecklistCapability[] {
  return capabilities.filter((capability) => capability.status === "DEFERRED");
}

function determineV1Status(capabilities: ChecklistCapability[]): { status: "COMPLETE" | "NOT_COMPLETE"; reason: string } {
  const incomplete = incompleteCapabilities(capabilities);
  if (incomplete.length === 0 && capabilities.length > 0) {
    return { status: "COMPLETE", reason: "All non-deferred checklist capabilities are marked COMPLETE." };
  }
  return {
    status: "NOT_COMPLETE",
    reason: `${incomplete.length} non-deferred checklist capabilities are not COMPLETE.`,
  };
}

export function buildProjectReport(options: BuildProjectReportOptions = {}): ProjectReport {
  const rootDir = options.rootDir ?? process.cwd();
  const checklistPath = path.join(rootDir, "docs", "forgepilot-progress-checklist.md");
  const checklist = readIfExists(checklistPath);
  if (!checklist) {
    throw new Error("progress checklist not found: docs/forgepilot-progress-checklist.md");
  }

  const capabilities = parseCapabilities(checklist);
  const v1 = determineV1Status(capabilities);
  const incomplete = incompleteCapabilities(capabilities);
  const deferred = deferredCapabilities(capabilities);
  const inventory = buildPacketInventory(rootDir);
  const recentPackets = inventory.flatMap((entry) => entry.packets).slice(-15);

  return {
    report_type: "PROJECT_SUMMARY_V1",
    boundary: PROJECT_REPORT_BOUNDARY,
    v1_completion_definition: extractV1CompletionDefinition(checklist),
    v1_completion_status: v1.status,
    v1_completion_reason: v1.reason,
    checklist_source: "docs/forgepilot-progress-checklist.md",
    checklist_status_counts: statusCounts(capabilities),
    checklist_capabilities: capabilities,
    incomplete_capabilities: incomplete,
    deferred_capabilities: deferred,
    packet_inventory: inventory,
    recent_packets: recentPackets,
    governing_docs: [
      "docs/forgepilot-progress-checklist.md",
      "docs/packet-namespace-taxonomy.md",
      "docs/packet-namespace-definition-of-done.md",
      "docs/evidence-boundary-doctrine.md",
      "docs/reporting-evidence-rules.md",
      "docs/project-summary-reporting-rules.md",
      "docs/manual-action-ledger.md",
    ].filter((rel) => fs.existsSync(path.join(rootDir, rel))),
    next_recommended_work: parseRecommendations(checklist),
    caveats: [
      PROJECT_REPORT_BOUNDARY,
      "Checklist status is an index, not proof by itself.",
      "Packet inventory does not imply execution, success, or current relevance.",
      "This report does not admit evidence, rank models, route work, or infer quality.",
    ],
  };
}

export function formatProjectReportText(report: ProjectReport): string {
  const lines = [
    "Project Report: ForgePilot",
    `Report Type: ${report.report_type}`,
    `V1 Completion Status: ${report.v1_completion_status}`,
    `V1 Completion Reason: ${report.v1_completion_reason}`,
    `Boundary: ${report.boundary}`,
    "Checklist Status Counts:",
    ...Object.entries(report.checklist_status_counts).sort().map(([status, count]) => `  - ${status}: ${count}`),
    "Incomplete Capabilities:",
    ...(report.incomplete_capabilities.length === 0
      ? ["  - none"]
      : report.incomplete_capabilities.map((capability) =>
          `  - ${capability.capability}: ${capability.status} | evidence: ${capability.evidence} | boundary: ${capability.boundary}`
        )),
    "Deferred Capabilities:",
    ...(report.deferred_capabilities.length === 0
      ? ["  - none"]
      : report.deferred_capabilities.map((capability) =>
          `  - ${capability.capability}: ${capability.status} | evidence: ${capability.evidence} | boundary: ${capability.boundary}`
        )),
    "Packet Inventory:",
    ...report.packet_inventory.map((entry) => `  - ${entry.namespace}: ${entry.count}`),
    "Governing Docs:",
    ...report.governing_docs.map((doc) => `  - ${doc}`),
    "Next Recommended Work:",
    ...(report.next_recommended_work.length === 0
      ? ["  - none"]
      : report.next_recommended_work.map((item) => `  - ${item.work_item}: ${item.current_status}, ${item.recommended_namespace} (${item.reason})`)),
    "Caveats:",
    ...report.caveats.map((caveat) => `  - ${caveat}`),
  ];

  return `${lines.join("\n")}\n`;
}
