# ForgePilot Private Dev Runner Skeleton

This directory contains the FP-MCP-024 private dev runner skeleton.

The skeleton is intentionally non-executing.

It implements:

```text
GET  /runner/health
GET  /runner/capabilities
POST /runner/validate-request
POST /runner/start-run
```

`/runner/start-run` is present only as a hard rejection endpoint and always returns:

```text
EXECUTION_NOT_IMPLEMENTED
```

## Boundaries

The runner skeleton does not:

* start OpenCode
* call the OpenCode CLI
* call the OpenCode API
* execute shell commands for user-provided content
* call model providers
* write execution artifacts
* mutate request artifacts
* mutate Git
* mutate SQLite

## Environment

Recommended local configuration:

```bash
export FORGEPILOT_REPO=/home/ridasaidd/forgepilot
export FORGEPILOT_RUNNER_TOKEN='replace-with-local-secret'
export FORGEPILOT_RUNNER_HOST=127.0.0.1
export FORGEPILOT_RUNNER_PORT=8791
export FORGEPILOT_RUNNER_EXECUTION_ENABLED=false
```

`FORGEPILOT_RUNNER_TOKEN` is required for protected endpoints.

Do not commit tokens.

## Run

```bash
node runner/server.mjs
```

## Test

```bash
FORGEPILOT_RUNNER_TOKEN=test-token node runner/test-runner.mjs
```

The test script starts the runner skeleton on `127.0.0.1:8791`, exercises authentication and non-execution behavior, then stops it.

## Endpoints

### GET /runner/health

No authentication required.

Returns:

```text
ok
```

### GET /runner/capabilities

Authentication required.

Returns static runner capability information.

Required protocol version:

```text
forgepilot-runner-v1
```

Execution is disabled by default.

### POST /runner/validate-request

Authentication required.

Validates a ForgePilot request artifact without starting execution.

Validation checks include:

* packet id syntax
* request id syntax
* request artifact path safety
* request artifact SHA-256 digest
* request artifact schema
* request artifact packet/request matching
* allowed model
* allowed run mode
* safe artifact directory
* packet file existence
* clean Git tree
* base commit match

### POST /runner/start-run

Authentication is not used in FP-MCP-024 because execution is not implemented.

The endpoint always returns `501` and:

```text
EXECUTION_NOT_IMPLEMENTED
```

A future packet must define the real execution behavior.
