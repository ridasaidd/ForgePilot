import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  buildReconstructionReport,
  formatReconstructionReportText,
  RECONSTRUCTION_BOUNDARY,
} from "../src/reporting/reconstruction-report.js";

let testDir: string;

before(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "forgepilot-fp015-"));
});

after(() => {
  fs.rmSync(testDir, { recursive: true, force: true });
});

function writeFile(rel: string, content: string) {
  const full = path.join(testDir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
}

describe("FP-015: Reconstruction report", () => {
  it("reconstructs artifact presence without overclaiming", () => {
    writeFile("packets/FP-X.md", "# FP-X\n");
    writeFile("runs/FP-X/verification.txt", "PASS\n");
    writeFile("runs/FP-X/audit-result.md", "ACCEPTED\n");
    writeFile("runs/FP-X/comparison-result.md", "TIE\n");
    writeFile("runs/FP-X/terminal-commands/ignored.json", "{}\n");

    const report = buildReconstructionReport({ rootDir: testDir, packetId: "FP-X" });

    assert.equal(report.verification_state, "PRESENT");
    assert.equal(report.audit_state, "PRESENT");
    assert.equal(report.comparison_state, "PRESENT");
    assert.equal(report.admission_state, "NOT_EVALUATED");
    assert.equal(report.boundary, RECONSTRUCTION_BOUNDARY);
    assert.ok(report.reconstructed_labels.includes("NO_COMPARISON_RECORDED") === false);
    assert.ok(report.source_artifacts.every((a) => !a.path.includes("terminal-commands")));
  });

  it("reports unknown/missing comparison explicitly", () => {
    writeFile("packets/FP-Y.md", "# FP-Y\n");
    const report = buildReconstructionReport({ rootDir: testDir, packetId: "FP-Y" });

    assert.equal(report.verification_state, "MISSING");
    assert.equal(report.audit_state, "MISSING");
    assert.equal(report.comparison_state, "NO_COMPARISON_RECORDED");
    assert.equal(report.admission_state, "NOT_EVALUATED");
  });

  it("formats text output", () => {
    const report = buildReconstructionReport({ rootDir: testDir, packetId: "FP-X" });
    const text = formatReconstructionReportText(report);
    assert.match(text, /Reconstruction Report: FP-X/);
    assert.match(text, /Boundary: Reconstruction is read-only/);
    assert.match(text, /comparison-result.md \[comparison\]/);
  });

  it("fails clearly for a missing packet", () => {
    assert.throws(
      () => buildReconstructionReport({ rootDir: testDir, packetId: "FP-MISSING" }),
      /packet not found: packets\/FP-MISSING.md/
    );
  });
});
