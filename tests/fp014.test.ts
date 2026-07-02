import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  buildProjectReport,
  formatProjectReportText,
  PROJECT_REPORT_BOUNDARY,
} from "../src/reporting/project-report.js";

let testDir: string;

before(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "forgepilot-fp014-"));
});

after(() => {
  fs.rmSync(testDir, { recursive: true, force: true });
});

function writeFile(rel: string, content: string) {
  const full = path.join(testDir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
}

const checklist = `# ForgePilot Progress Checklist

## ForgePilot V1 Completion Definition

ForgePilot V1 is complete when packet intent, execution, telemetry, verification, audit, admission, comparison, and reporting can be reconstructed from committed evidence.

## V1 Capability Checklist

| Capability | Status | Evidence Packet(s) | Evidence / Notes | Boundary |
|---|---|---|---|---|
| Worker lifecycle | \`COMPLETE\` | \`FP-MCP-153\` | done | no routing |
| Reporting / summary view | \`PARTIAL\` | \`FP-013\` | single packet only | index only |
| Routing | \`DEFERRED\` | none | later | no routing |

## Recommended Namespace Guidance

| Future capability / work item | Current status | Recommended namespace | Reason |
|---|---|---|---|
| Project summary implementation | \`PARTIAL\` | \`FP-*\` | Core behavior. |
| Reporting via MCP | \`DEFERRED\` | \`FP-MCP-*\` | MCP exposure. |
`;

describe("FP-014: Project summary report", () => {
  it("summarizes checklist status and packet inventory without claiming completion", () => {
    writeFile("docs/forgepilot-progress-checklist.md", checklist);
    writeFile("docs/reporting-evidence-rules.md", "# Rules\n");
    writeFile("packets/FP-013.md", "# FP-013\n");
    writeFile("packets/FP-META-021.md", "# FP-META-021\n");
    writeFile("packets/FP-OPS-001.md", "# FP-OPS-001\n");
    writeFile("packets/FP-MCP-157.md", "# FP-MCP-157\n");

    const report = buildProjectReport({ rootDir: testDir });

    assert.equal(report.report_type, "PROJECT_SUMMARY_V1");
    assert.equal(report.boundary, PROJECT_REPORT_BOUNDARY);
    assert.equal(report.v1_completion_status, "NOT_COMPLETE");
    assert.equal(report.checklist_status_counts.COMPLETE, 1);
    assert.equal(report.checklist_status_counts.PARTIAL, 1);
    assert.equal(report.checklist_status_counts.DEFERRED, 1);
    assert.equal(report.checklist_capabilities.length, 3);
    assert.equal(report.incomplete_capabilities.length, 1);
    assert.equal(report.incomplete_capabilities[0].capability, "Reporting / summary view");
    assert.equal(report.incomplete_capabilities[0].evidence, "FP-013");
    assert.equal(report.incomplete_capabilities[0].boundary, "index only");
    assert.equal(report.deferred_capabilities.length, 1);
    assert.equal(report.deferred_capabilities[0].capability, "Routing");
    assert.ok(report.packet_inventory.some((entry) => entry.namespace === "FP" && entry.count === 1));
    assert.ok(report.packet_inventory.some((entry) => entry.namespace === "FP-META" && entry.count === 1));
    assert.ok(report.packet_inventory.some((entry) => entry.namespace === "FP-MCP" && entry.count === 1));
    assert.ok(report.packet_inventory.some((entry) => entry.namespace === "FP-OPS" && entry.count === 1));
    assert.ok(report.next_recommended_work.some((item) => item.work_item === "Project summary implementation"));
  });

  it("formats a readable text report", () => {
    const report = buildProjectReport({ rootDir: testDir });
    const text = formatProjectReportText(report);

    assert.match(text, /Project Report: ForgePilot/);
    assert.match(text, /V1 Completion Status: NOT_COMPLETE/);
    assert.match(text, /Boundary: This project report is an index/);
    assert.match(text, /Incomplete Capabilities:/);
    assert.match(text, /Reporting \/ summary view: PARTIAL/);
    assert.match(text, /Deferred Capabilities:/);
    assert.match(text, /Routing: DEFERRED/);
    assert.match(text, /Packet Inventory:/);
  });

  it("fails clearly when the checklist is missing", () => {
    const missingDir = fs.mkdtempSync(path.join(os.tmpdir(), "forgepilot-fp014-missing-"));
    try {
      assert.throws(
        () => buildProjectReport({ rootDir: missingDir }),
        /progress checklist not found/
      );
    } finally {
      fs.rmSync(missingDir, { recursive: true, force: true });
    }
  });
});
