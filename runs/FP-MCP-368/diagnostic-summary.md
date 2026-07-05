# FP-MCP-368 Diagnostic Summary

## Result

PASS.

Bubblewrap is installed and minimally viable for future ForgePilot sandboxed command design.

## Source Artifact

- runs/FP-MCP-368/bubblewrap-diagnostic.raw.md

## Observed Host

- host: rpsrv
- kernel: Linux 6.12.87+rpt-rpi-2712
- arch: aarch64
- platform: Raspberry Pi

## Bubblewrap

- found: true
- path: /usr/bin/bwrap
- version: bubblewrap 0.8.0
- package: bubblewrap 0.8.0-2+deb12u1 arm64

## Namespace Settings

- kernel.unprivileged_userns_clone: unavailable
- max_user_namespaces: 31949
- max_pid_namespaces: 31949
- max_net_namespaces: 31949
- max_mnt_namespaces: 31949

## Probe Results

### Probe 1 — minimal private tmp sandbox

PASS.

Observed:

- BWRAP_PROBE_OK
- uid=1000
- HOME_NOT_VISIBLE
- exit code 0

### Probe 2 — copied workspace write

PASS.

Observed:

- sandbox wrote to /workspace/probe.txt
- host copied workspace reflected the sandbox change
- this was a temporary copied workspace, not the real repo
- exit code 0

### Probe 3 — network namespace

PASS.

Observed:

- /proc/net/route existed
- route table had header only
- no populated route entries
- exit code 0

### Probe 4 — host home hidden

PASS.

Observed:

- /home unavailable as expected
- /home/ridasaidd unavailable as expected
- exit code 0

## Classification

- bubblewrapAvailable: true
- minimumSandboxViable: true
- copiedWorkspaceModelViable: true
- hostHomeHiddenWhenNotMounted: true
- noNetworkDefaultAppearsViable: true

## Caveats

- Bubblewrap is not full virtualization.
- It shares the host kernel.
- This diagnostic does not validate full ForgePilot repo execution.
- This diagnostic does not validate pnpm/node inside the sandbox.
- This diagnostic does not implement MCP tooling.
- This diagnostic does not create command preview or execution artifacts.

## Non-Execution Statement

No MCP implementation changed.

No MCP service restart occurred.

No OpenCode start, runner start contact, approval consumption, disable-switch clearing, FP-027 canary run, or execution authorization occurred.
