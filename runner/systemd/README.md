# FP-MCP-025 Runner Service

This directory contains the user-level systemd service template for the private dev runner skeleton.

The service runs:

```text
node /home/ridasaidd/forgepilot/runner/server.mjs
```

The service binds to:

```text
127.0.0.1:8791
```

Execution remains disabled:

```text
FORGEPILOT_RUNNER_EXECUTION_ENABLED=false
```

## Secret Environment File

Create this file manually:

```text
~/.config/forgepilot-runner.env
```

Example content:

```bash
FORGEPILOT_RUNNER_TOKEN=<local-secret>
```

Do not commit the environment file.

## Install

```bash
mkdir -p ~/.config/systemd/user
cp runner/systemd/forgepilot-runner.service ~/.config/systemd/user/forgepilot-runner.service
systemctl --user daemon-reload
systemctl --user enable --now forgepilot-runner.service
systemctl --user status forgepilot-runner.service --no-pager -l
```

## Logs

```bash
journalctl --user -u forgepilot-runner.service -n 80 --no-pager
```

## Health

```bash
curl -sS http://127.0.0.1:8791/runner/health
```

Expected:

```text
ok
```

## Capabilities

```bash
set -a
source ~/.config/forgepilot-runner.env
set +a

curl -sS \
  -H "Authorization: Bearer $FORGEPILOT_RUNNER_TOKEN" \
  http://127.0.0.1:8791/runner/capabilities
```

Expected key fields:

```text
runnerProtocolVersion: forgepilot-runner-v1
runnerHostRole: dev-execution-plane
executionEnabled: false
opencodeHarnessReachable: false
```

## Start Run

Start-run is still not implemented in FP-MCP-025.

```bash
curl -sS -i \
  -X POST \
  -H "Authorization: Bearer $FORGEPILOT_RUNNER_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{}' \
  http://127.0.0.1:8791/runner/start-run
```

Expected:

```text
HTTP/1.1 501
EXECUTION_NOT_IMPLEMENTED
executionStarted: false
```
