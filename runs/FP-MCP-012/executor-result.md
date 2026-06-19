# FP-MCP-012 Executor Result

## Packet

FP-MCP-012 — Remote OpenCode Runner Boundary

## Repository State

ForgePilot repository:

```text
/home/ridasaidd/forgepilot
```

ForgePilot branch:

```text
main
```

ForgePilot packet commit:

```text
55881f6
```

Working tree after packet commit:

```text
clean
```

## Implementation Summary

FP-MCP-012 added a boundary-only packet defining the separation between the public staging MCP bridge and the private dev-side OpenCode runner.

Files added:

```text
packets/FP-MCP-012.md
```

The packet defines:

* staging/control-plane responsibilities
* dev/execution-plane responsibilities
* forbidden raw OpenCode proxy shapes
* forbidden raw shell proxy shapes
* allowed ForgePilot-shaped runner API concepts
* request artifact handoff rules
* runner authentication requirements
* runner network exposure restrictions
* capability discovery boundary
* artifact ownership rules
* failure and timeout behavior
* logging and redaction requirements
* trust boundary
* future packet ordering

## Scope Confirmation

FP-MCP-012 is boundary-only.

It did not add:

* remote runner HTTP endpoints
* runner services
* MCP execution-start tools
* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* raw network proxying
* generic tunnels
* background workers
* artifact synchronization
* Git mutation
* SQLite mutation
* runtime behavior changes

## Boundary Summary

FP-MCP-012 defines the safe infrastructure split:

```text
staging server = public/control-plane MCP bridge
dev server = private execution-plane OpenCode harness
```

Required authority chain:

```text
ChatGPT
→ staging MCP bridge
→ ForgePilot request artifact
→ private dev runner
→ constrained OpenCode harness
→ recorded run artifacts
```

Forbidden authority chains:

```text
ChatGPT
→ staging MCP bridge
→ raw OpenCode API
```

```text
ChatGPT
→ staging MCP bridge
→ raw shell on dev server
```

## Future Runner API Shape

FP-MCP-012 allows only ForgePilot-shaped future runner operations, such as:

```text
GET /runner/capabilities
POST /runner/validate-request
POST /runner/start-run
GET /runner/runs/<runId>/status
GET /runner/runs/<runId>/artifacts/<artifactName>
```

The packet does not implement these endpoints.

## Capability Discovery Boundary

FP-MCP-012 documents that capability discovery is observational and read-only.

Important distinction:

```text
discoveredModels != allowedModels
```

Discovery may report available models, but policy must determine allowed models.

## Connector Verification

ChatGPT MCP connector observed after packet commit:

```text
branch: main
commit: 55881f6
workingTreeClean: true
gitStatusShort: ""
```

## Result

FP-MCP-012 satisfies its remote-runner boundary-only scope.

Status:

```text
ACCEPTED_FOR_VERIFICATION
```

