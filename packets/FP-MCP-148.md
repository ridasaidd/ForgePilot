# FP-MCP-148 — Terminal MCP Practical Hardening

## Task

Harden the newly introduced human-approved terminal MCP tool without changing its core approval model.

## Goal

Reduce blast radius and improve operational safety now that GPT can request approved terminal commands through MCP.

This packet is intentionally small and auditable. It does not attempt to redesign the entire security model.

## Context

FP-MCP-147 introduced `forgepilot_execute_terminal_command` in the MCP bridge.

The tool works and has been verified live, but first use revealed practical hardening needs:

1. terminal commands run as the normal `ridasaidd` user,
2. the server is behind Tailnet and proxy boundaries, but the MCP bridge process listens broadly,
3. the terminal tool currently has no terminal-specific kill switch,
4. the sanitized PATH does not reliably resolve Node or pnpm,
5. command policy should block container-engine commands because the user is in the docker group,
6. evidence creation is self-observing and needs a later batching/finalization rule.

## Scope

Implement only the following bridge-level changes:

1. Add terminal-specific disable switch:
   - environment variable: `FORGEPILOT_TERMINAL_EXECUTION_ENABLED`
   - when set to `false`, `forgepilot_execute_terminal_command` must refuse execution before running any shell command.

2. Improve sanitized PATH:
   - ensure `/home/ridasaidd/.nvm/versions/node/v24.4.1/bin` is present in the command PATH,
   - `pnpm build` should work without manually prefixing PATH.

3. Block container-engine commands:
   - docker,
   - podman,
   - nerdctl.

4. Preserve existing behavior:
   - MCP approval popup remains the approval surface,
   - workspace allowlist remains enforced,
   - existing hard blocks remain enforced,
   - stdout/stderr/evidence behavior remains intact,
   - runner start behavior is not weakened.

## Non-goals

- Do not change Auth0 behavior.
- Do not change Tailscale ACLs from code.
- Do not require a new Unix user in this packet.
- Do not redesign evidence batching in this packet.
- Do not weaken the MCP approval model.
- Do not expose new command execution surfaces.

## Acceptance Criteria

1. `pnpm build` passes in the MCP bridge repo.
2. `forgepilot_execute_terminal_command` remains exposed after service restart.
3. With terminal execution enabled or unset, a read-only command still works.
4. With `FORGEPILOT_TERMINAL_EXECUTION_ENABLED=false`, terminal command execution is refused.
5. `pnpm build` works through the terminal tool without a manual PATH prefix.
6. Container-engine commands are blocked and recorded as blocked evidence.
7. Existing behavior for workspace allowlist and command evidence is preserved.
8. Implementation summary and verification evidence are recorded under `runs/FP-MCP-148/`.

## Audit Notes

This packet should be audited after implementation. The audit should specifically check that the terminal kill switch is evaluated before command execution and that PATH hardening does not reintroduce secret-bearing environment variables.
