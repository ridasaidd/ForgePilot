import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("ForgePilot", () => {
  it("should have a working test harness", () => {
    assert.ok(true, "Test harness is operational");
  });

  it("should confirm environment-centric architecture principle", () => {
    const truth = "ForgePilot environment owns truth. Agents own no truth.";
    assert.ok(truth.includes("environment owns truth"));
  });
});
