# FP-MCP-368 Bubblewrap Availability and Capability Diagnostic

## Timestamp
2026-07-06T00:15:20+02:00

## Host
Linux rpsrv 6.12.87+rpt-rpi-2712 #1 SMP PREEMPT Debian 1:6.12.87-1+rpt1~bookworm (2026-05-12) aarch64 GNU/Linux

## Current User
uid=1000(ridasaidd) gid=1000(ridasaidd) groups=1000(ridasaidd),4(adm),20(dialout),24(cdrom),27(sudo),29(audio),33(www-data),44(video),46(plugdev),60(games),100(users),102(input),105(render),110(netdev),992(docker),993(gpio),994(i2c),995(spi)

## bubblewrap discovery
bwrapPath: /usr/bin/bwrap
bwrapVersion:
bubblewrap 0.8.0

## Package discovery
ii  bubblewrap                           0.8.0-2+deb12u1                             arm64        utility for unprivileged chroot and namespace manipulation
ii  libwrap0:arm64                       7.6.q-32                                    arm64        Wietse Venema's TCP wrappers library

## Kernel unprivileged user namespace setting
kernel.unprivileged_userns_clone=UNAVAILABLE

## Namespace-related sysctls
/proc/sys/user/max_user_namespaces=31949
/proc/sys/user/max_pid_namespaces=31949
/proc/sys/user/max_net_namespaces=31949
/proc/sys/user/max_mnt_namespaces=31949

## bwrap help excerpt
usage: bwrap [OPTIONS...] [--] COMMAND [ARGS...]

    --help                       Print this help
    --version                    Print version
    --args FD                    Parse NUL-separated args from FD
    --unshare-all                Unshare every namespace we support by default
    --share-net                  Retain the network namespace (can only combine with --unshare-all)
    --unshare-user               Create new user namespace (may be automatically implied if not setuid)
    --unshare-user-try           Create new user namespace if possible else continue by skipping it
    --unshare-ipc                Create new ipc namespace
    --unshare-pid                Create new pid namespace
    --unshare-net                Create new network namespace
    --unshare-uts                Create new uts namespace
    --unshare-cgroup             Create new cgroup namespace
    --unshare-cgroup-try         Create new cgroup namespace if possible else continue by skipping it
    --userns FD                  Use this user namespace (cannot combine with --unshare-user)
    --userns2 FD                 After setup switch to this user namespace, only useful with --userns
    --disable-userns             Disable further use of user namespaces inside sandbox
    --assert-userns-disabled     Fail unless further use of user namespace inside sandbox is disabled
    --pidns FD                   Use this pid namespace (as parent namespace if using --unshare-pid)
    --uid UID                    Custom uid in the sandbox (requires --unshare-user or --userns)
    --gid GID                    Custom gid in the sandbox (requires --unshare-user or --userns)
    --hostname NAME              Custom hostname in the sandbox (requires --unshare-uts)
    --chdir DIR                  Change directory to DIR
    --clearenv                   Unset all environment variables
    --setenv VAR VALUE           Set an environment variable
    --unsetenv VAR               Unset an environment variable
    --lock-file DEST             Take a lock on DEST while sandbox is running
    --sync-fd FD                 Keep this fd open while sandbox is running
    --bind SRC DEST              Bind mount the host path SRC on DEST
    --bind-try SRC DEST          Equal to --bind but ignores non-existent SRC
    --dev-bind SRC DEST          Bind mount the host path SRC on DEST, allowing device access
    --dev-bind-try SRC DEST      Equal to --dev-bind but ignores non-existent SRC
    --ro-bind SRC DEST           Bind mount the host path SRC readonly on DEST
    --ro-bind-try SRC DEST       Equal to --ro-bind but ignores non-existent SRC
    --bind-fd FD DEST            Bind open directory or path fd on DEST
    --ro-bind-fd FD DEST         Bind open directory or path fd read-only on DEST
    --remount-ro DEST            Remount DEST as readonly; does not recursively remount
    --exec-label LABEL           Exec label for the sandbox
    --file-label LABEL           File label for temporary sandbox content
    --proc DEST                  Mount new procfs on DEST
    --dev DEST                   Mount new dev on DEST
    --tmpfs DEST                 Mount new tmpfs on DEST
    --mqueue DEST                Mount new mqueue on DEST
    --dir DEST                   Create dir at DEST
    --file FD DEST               Copy from FD to destination DEST
    --bind-data FD DEST          Copy from FD to file which is bind-mounted on DEST
    --ro-bind-data FD DEST       Copy from FD to file which is readonly bind-mounted on DEST
    --symlink SRC DEST           Create symlink at DEST with target SRC
    --seccomp FD                 Load and use seccomp rules from FD (not repeatable)
    --add-seccomp-fd FD          Load and use seccomp rules from FD (repeatable)
    --block-fd FD                Block on FD until some data to read is available
    --userns-block-fd FD         Block on FD until the user namespace is ready
    --info-fd FD                 Write information about the running container to FD
    --json-status-fd FD          Write container status to FD as multiple JSON documents
    --new-session                Create a new terminal session
    --die-with-parent            Kills with SIGKILL child process (COMMAND) when bwrap or bwrap's parent dies.
    --as-pid-1                   Do not install a reaper process with PID=1
    --cap-add CAP                Add cap CAP when running as privileged user
    --cap-drop CAP               Drop cap CAP when running as privileged user
    --perms OCTAL                Set permissions of next argument (--bind-data, --file, etc.)
    --size BYTES                 Set size of next argument (only for --tmpfs)
    --chmod OCTAL PATH           Change permissions of PATH (must already exist)

## Probe 1: minimal private tmp sandbox
BWRAP_PROBE_OK
/
uid=1000 gid=1000 groups=1000,65534
HOME_NOT_VISIBLE
probe1ExitCode:0

## Probe 2: copied workspace can be written without host repo mount
changed-inside-sandbox
workspace=/workspace
probe2ExitCode:0
hostCopiedWorkspaceProbeContent:changed-inside-sandbox

## Probe 3: network namespace disabled by unshare-all
procNetRoute:
Iface	Destination	Gateway 	Flags	RefCnt	Use	Metric	Mask		MTU	Window	IRTT                                                       
probe3ExitCode:0

## Probe 4: host home should not be visible
/home unavailable as expected
/home/ridasaidd unavailable as expected
probe4ExitCode:0

## Non-execution boundary
No MCP implementation was changed.
No MCP service was restarted.
No OpenCode start was attempted.
No runner start endpoint was contacted.
No approval was consumed.
No disable switch was cleared.
No FP-027 canary was run.
