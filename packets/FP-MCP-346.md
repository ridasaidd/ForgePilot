# FP-MCP-346 — Capability-Separated Clearance Live Probe

## Checkpoint Type

```text
LIVE_PROBE_PACKET
```

## Summary

Create a packet checkpoint so structured approval and intent artifacts can be recorded under a known packet id during live probing of observe, preview, and clearance intent tools.

## Claim

```text
FP-MCP-346 establishes a non-executing live probe packet for testing the capability-separated clearance MCP surface.
```

## Caveats

- This packet does not create clearance.
- This packet does not enable execution.
- This packet does not call the deprecated guarded apply wrapper.
- This packet does not contact runner start or start OpenCode.

## Boundaries

- Non-executing live probe only.
- No approval consumption.
- No clearance creation.
- No enablement.
- No runner contact.
- No OpenCode start.

## Non-Execution Boundary

```text
execution authorized: false
approval consumed: false
disable switch cleared: false
runner start endpoint contacted: false
OpenCode started: false
FP-027 canary run: false
```

## Expected Result

```text
FP-MCP-346 establishes a non-executing live probe packet for testing the capability-separated clearance MCP surface.
```
