#!/usr/bin/env node

import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const HOST = process.env.FORGEPILOT_RUNNER_TEST_HOST || "127.0.0.1";
const PORT = process.env.FORGEPILOT_RUNNER_TEST_PORT || "8799";
const BASE_URL = `http://${HOST}:${PORT}`;
const TOKEN = process.env.FORGEPILOT_RUNNER_TOKEN || "test-token";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const text = await response.text();

  let json = null;

  try {
    json = JSON.parse(text);
  } catch {
    // health endpoint is plain text
  }

  return {
    status: response.status,
    text,
    json
  };
}

async function waitForHealth() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const result = await request("/runner/health");

      if (result.status === 200 && result.text === "ok\n") {
        return;
      }
    } catch {
      // server not ready yet
    }

    await delay(100);
  }

  throw new Error("runner health check did not become ready");
}

async function run() {
  const child = spawn(process.execPath, ["runner/server.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      FORGEPILOT_REPO: process.env.FORGEPILOT_REPO || process.cwd(),
      FORGEPILOT_RUNNER_TOKEN: TOKEN,
      FORGEPILOT_RUNNER_HOST: HOST,
      FORGEPILOT_RUNNER_PORT: PORT,
      FORGEPILOT_RUNNER_EXECUTION_ENABLED: "false"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForHealth();

    const capabilitiesNoAuth = await request("/runner/capabilities");
    assert(
      capabilitiesNoAuth.status === 401,
      "capabilities without auth should return 401"
    );
    assert(
      capabilitiesNoAuth.json?.reasons?.includes("RUNNER_AUTH_FAILED"),
      "capabilities without auth should return RUNNER_AUTH_FAILED"
    );

    const capabilities = await request("/runner/capabilities", {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });

    assert(capabilities.status === 200, "capabilities with auth should return 200");
    assert(
      capabilities.json?.runnerProtocolVersion === "forgepilot-runner-v1",
      "capabilities should return forgepilot-runner-v1"
    );
    assert(
      capabilities.json?.executionEnabled === false,
      "capabilities should report execution disabled"
    );
    assert(
      capabilities.json?.opencodeHarnessReachable === false,
      "capabilities should report OpenCode harness not reachable"
    );

    const validateNoAuth = await request("/runner/validate-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    assert(
      validateNoAuth.status === 401,
      "validate-request without auth should return 401"
    );
    assert(
      validateNoAuth.json?.reasons?.includes("RUNNER_AUTH_FAILED"),
      "validate-request without auth should return RUNNER_AUTH_FAILED"
    );

    const validateUnsafePath = await request("/runner/validate-request", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        packetId: "FP-MCP-007",
        requestId: "REQ-20260619T084312145Z-a9960bd6",
        requestArtifactPath: "../secret.json",
        requestArtifactSha256:
          "0000000000000000000000000000000000000000000000000000000000000000",
        baseCommit: "0000000",
        boundaryVersion: "FP-MCP-024"
      })
    });

    assert(
      validateUnsafePath.status === 200,
      "validate-request unsafe path should return structured 200 rejection"
    );
    assert(
      validateUnsafePath.json?.valid === false,
      "validate-request unsafe path should be invalid"
    );
    assert(
      validateUnsafePath.json?.reasons?.includes("UNSAFE_REQUEST_ARTIFACT_PATH"),
      "validate-request should reject unsafe path"
    );

    const validateForbiddenField = await request("/runner/validate-request", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        packetId: "FP-MCP-007",
        requestId: "REQ-20260619T084312145Z-a9960bd6",
        requestArtifactPath:
          "runs/FP-MCP-007/opencode-requests/REQ-20260619T084312145Z-a9960bd6.json",
        requestArtifactSha256:
          "0000000000000000000000000000000000000000000000000000000000000000",
        baseCommit: "0000000",
        boundaryVersion: "FP-MCP-024",
        prompt: "do not accept this"
      })
    });

    assert(
      validateForbiddenField.json?.reasons?.includes("FORBIDDEN_EXECUTION_FIELD"),
      "validate-request should reject execution-shaped fields"
    );

    const startRun = await request("/runner/start-run", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    assert(startRun.status === 403, "start-run should return 403 when execution is disabled");
    assert(
      startRun.json?.executionStarted === false,
      "start-run should not start execution"
    );
    console.log("disabled start-run response:", JSON.stringify(startRun.json, null, 2));

    assert(
      startRun.json?.reasons?.length > 0,
      "start-run should report at least one disabled reason"
    );

    console.log("runner skeleton tests PASS");
  } finally {
    child.kill("SIGTERM");
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
