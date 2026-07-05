# FP-MCP-354 — Default safe MCP surface profile

## Checkpoint Type

```text
MCP_SURFACE_PROFILE_GATE_RESULT
```

## Summary

Bridge commit 533b590 added a centralized surface-profile helper, wired one registration wrapper into server creation before tool registration, and extended the contract checker to validate profile-visible counts. The checker reported 78 registered tools, 78 contracts, 11 default-safe contracts, default visible count 11, explicit safe visible count 11, dev visible count 76, all visible count 78, exact safe set match true, and no duplicate, missing, or extra contracts. Direct local TypeScript and packet-id lint checks passed after package-manager command forms were blocked by platform checks.

## Claim

```text
FP-MCP-354 implemented a manifest-backed MCP surface profile gate in the bridge. The default profile exposes 11 safe tools, the dev profile exposes 76 non-legacy tools, and the all profile exposes the full corrected 78-tool surface.
```

## Caveats

- Package-manager build/test command forms were blocked by platform checks during final verification, but equivalent direct local commands passed.
- The running service may still be using old loaded code until restart/action refresh.
- Runtime-visible surface has not yet been validated after restart/action refresh.
- The bridge branch remains ahead of origin until pushed manually.

## Boundaries

- Did not change tool handlers, names, descriptions, schemas, annotations, or approval literals.
- Did not move registrations.
- Did not remove tools from the explicit all profile.
- Did not perform operational runtime actions.
- Did not restart or refresh the service.
- Did not modify local runtime state files.

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
FP-MCP-354 implemented a manifest-backed MCP surface profile gate in the bridge. The default profile exposes 11 safe tools, the dev profile exposes 76 non-legacy tools, and the all profile exposes the full corrected 78-tool surface.
```
