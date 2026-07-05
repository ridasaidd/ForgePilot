# FP-MCP-368 — Bubblewrap availability and capability diagnostic

## Checkpoint Type

    MCP_SANDBOX_DIAGNOSTIC

## Summary

This packet records a diagnostic-only evaluation of bubblewrap availability and basic sandbox capability on the Raspberry Pi 5 host.

Bubblewrap is installed and functional.

The diagnostic confirmed that a minimal bubblewrap sandbox can run, that /home is not visible when not mounted, that a copied workspace can be mounted and mutated without touching the real ForgePilot repository, and that the network namespace created by --unshare-all contains no populated route table.

No MCP implementation was changed.

No new tool was exposed.

No MCP service was restarted.

No OpenCode or runner execution occurred.

## Claim

    Bubblewrap is available and supports the minimum sandbox primitives needed for future ForgePilot sandboxed command design work.

## Diagnostic Artifact

    runs/FP-MCP-368/bubblewrap-diagnostic.raw.md

## Structured Evidence

    host:
      hostname: rpsrv
      kernel: Linux 6.12.87+rpt-rpi-2712
      distroKernelBuild: Debian 1:6.12.87-1+rpt1~bookworm
      arch: aarch64
      platform: Raspberry Pi

    user:
      uid: 1000
      username: ridasaidd
      dockerGroupMember: true
      sudoGroupMember: true

    bubblewrap:
      found: true
      path: /usr/bin/bwrap
      version: 0.8.0
      package: bubblewrap 0.8.0-2+deb12u1 arm64
      packageDescription: utility for unprivileged chroot and namespace manipulation

    namespaceSettings:
      kernelUnprivilegedUsernsClone: UNAVAILABLE
      maxUserNamespaces: 31949
      maxPidNamespaces: 31949
      maxNetNamespaces: 31949
      maxMntNamespaces: 31949

    supportedFlagsObserved:
      - --unshare-all
      - --share-net
      - --unshare-user
      - --unshare-user-try
      - --unshare-ipc
      - --unshare-pid
      - --unshare-net
      - --unshare-uts
      - --unshare-cgroup
      - --unshare-cgroup-try
      - --disable-userns
      - --assert-userns-disabled
      - --uid
      - --gid
      - --hostname
      - --chdir
      - --clearenv
      - --setenv
      - --unsetenv
      - --bind
      - --bind-try
      - --ro-bind
      - --ro-bind-try
      - --proc
      - --dev
      - --tmpfs
      - --seccomp
      - --new-session
      - --die-with-parent
      - --cap-add
      - --cap-drop

    probes:
      minimalPrivateTmpSandbox:
        result: PASS
        exitCode: 0
        observedMarker: BWRAP_PROBE_OK
        homeVisible: false
      copiedWorkspaceWrite:
        result: PASS
        exitCode: 0
        workspacePathInsideSandbox: /workspace
        hostCopiedWorkspaceContentAfterRun: changed-inside-sandbox
        realRepoMounted: false
      networkNamespace:
        result: PASS
        exitCode: 0
        procNetRouteVisible: true
        routeTablePopulated: false
      hostHomeHidden:
        result: PASS
        exitCode: 0
        homeVisible: false
        userHomeVisible: false

    classification:
      bubblewrapAvailable: true
      minimumSandboxViable: true
      copiedWorkspaceModelViable: true
      noHomeMountPolicyViable: true
      noNetworkDefaultAppearsViable: true
      readyForPreviewDesignPacket: true

## Interpretation

The diagnostic supports the FP-MCP-367 design direction.

Bubblewrap can run on the Raspberry Pi host and can create a constrained command environment without exposing /home when not explicitly mounted.

The copied workspace model is viable: a temporary workspace can be mounted as /workspace and changed inside the sandbox without requiring the real ForgePilot repository to be mounted.

The network diagnostic showed an empty route table inside the sandbox created with --unshare-all. This supports a no-network default for future sandboxed command execution design.

## Caveats

- Bubblewrap is not full virtualization and still shares the host kernel.
- kernel.unprivileged_userns_clone was unavailable as a sysctl on this host, but the probes still passed.
- The copied workspace probe intentionally mutated a temporary copied workspace; this was not the real ForgePilot repository.
- This packet does not prove full security against kernel escape or runtime vulnerabilities.
- This packet does not implement resource limits, seccomp policy, command allowlists, artifact hashing, or MCP approval gates.
- This packet does not validate Node/pnpm execution inside the sandbox.
- This packet does not validate execution against a full copied ForgePilot repository.

## Non-Goals

This packet did not:

- implement a sandboxed command MCP tool
- expose terminal access
- change MCP contracts
- run OpenCode
- contact the runner start endpoint
- consume approval
- clear a disable switch
- run FP-027 canary
- restart the MCP service

## Recommended Next Packet

    FP-MCP-369 — Sandboxed command preview artifact

The next packet should remain non-executing and should define a preview/request artifact for sandboxed commands before any command execution tool is implemented.

## Non-Execution Boundary

    execution authorized: false
    approval consumed: false
    disable switch cleared: false
    runner start endpoint contacted: false
    OpenCode started: false
    FP-027 canary run: false

## Expected Result

    FP-MCP-368 records that bubblewrap is installed and minimally viable for future ForgePilot sandboxed command execution design work.
