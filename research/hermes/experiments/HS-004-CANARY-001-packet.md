# HS-004-CANARY-001 — OpenAI MCP 2026-07-28 Streamable HTTP Compatibility Canary

Status: READY_FOR_G0_REVIEW  
Packet ID: HS-004-CANARY-001  
Authority: G0  
Packet author and reviewer: G1  
Implementation approval: NOT GRANTED  
Implementation branch creation: NOT AUTHORIZED  
Infrastructure mutation: NOT AUTHORIZED  
ChatGPT app creation: NOT AUTHORIZED

## 1. Purpose

Determine whether the current OpenAI/ChatGPT MCP client negotiates and uses MCP protocol revision 2026-07-28 over Streamable HTTP, especially `subscriptions/listen`, and characterize behavior when that capability is unavailable.

This is a minimal isolated transport canary for the main ForgePilot MCP. Ops MCP is only a bounded inspection and development aid. The canary must not be implemented in Ops MCP and Ops MCP capabilities must not be broadened. The canary is independent of Hermes and must not call Hermes.

## 2. Central question

Does the current OpenAI/ChatGPT MCP client negotiate and use MCP 2026-07-28 Streamable HTTP, especially `subscriptions/listen`, and how does it behave when that capability is unavailable?

## 3. Governance state

This packet authorizes no implementation. G0 must explicitly approve these exact packet bytes and commit before the implementation branch may be created or any canary activity begins.

Proposed future implementation branch: `feature/hs-004-mcp-2026-07-28-canary`.

## 4. Frozen repository baselines

### 4.1 ForgePilot main

- Repository: `/home/ridasaidd/forgepilot`
- Branch: `main`
- HEAD: `80d37bf8d8ffd7f1561cbad14757410196ce608b`
- origin/main: `80d37bf8d8ffd7f1561cbad14757410196ce608b`
- Commit subject: `Record HS-003 G0 admission with limitations`

Existing untracked roots outside scope and required to remain untouched:

- `audits/`
- `research/hermes/experiments/HS-002-CANARY-001-final-report.md`
- `research/hermes/observations/`

### 4.2 Main MCP implementation base

- Repository: `/home/ridasaidd/forgepilot-chatgpt-mcp`
- Base branch: `feature/oauth-auth0`
- Full base commit: `d94b5dc0ce59af88680798adae577f6dbab77a01`
- Merge base with `feature/hermes-kanban-task-create`: `d94b5dc0ce59af88680798adae577f6dbab77a01`
- `feature/oauth-auth0` is an ancestor of `feature/hermes-kanban-task-create`.
- `feature/hermes-kanban-task-create` is not an ancestor of `feature/oauth-auth0`.

The future HS-004 branch must be created from the exact reviewed base above, never from the current Hermes Kanban branch.

## 5. Current transport baseline

- `@modelcontextprotocol/sdk` declared: `^1.29.0`
- Resolved: `1.29.0`
- Peer: `zod@4.4.3`
- Integrity: `sha512-zo37mZA9hJWpULgkRpowewez1y6ML5GsXJPY8FI0tBBCd77HEvza4jDqRKOXgHNn867PVGCyTdzqpz0izu5ZjQ==`

The current primary and Ops servers use sessionful SDK v1 `StreamableHTTPServerTransport` with:

- `sessionIdGenerator: randomUUID()`;
- `mcp-session-id` lookup;
- in-memory transport maps;
- authorization context bound to sessions;
- SDK `handleRequest(req, res)`;
- MCP endpoint at `/mcp`.

This is legacy sessionful Streamable HTTP relative to MCP 2026-07-28. The selected legacy control revision for this canary is `2025-06-18`.

## 6. Hermes baseline and exclusion

Hermes is not part of the canary transport implementation.

- Hermes Agent: `0.19.1`
- Upstream commit: `126ff707`
- Provider: `opencode-go`
- Default model: `deepseek-v4-flash`
- API mode: `chat_completions`
- Gateway health version: `0.19.1`
- Hermes 0.20.0 is not installed.

Exact authenticated `/v1/models` baseline artifact:

- SHA-256: `6a537c1872a4208369c0b3d19ba6638ab61cff7b774807ff58cb071be12089c6`
- Byte size: `174`

```json
{
  "object": "list",
  "data": [
    {
      "id": "hermes-agent",
      "object": "model",
      "created": 1785833881,
      "owned_by": "hermes",
      "permission": [],
      "root": "hermes-agent",
      "parent": null
    }
  ]
}
```

## 7. Official MCP specification pin

- Repository: `modelcontextprotocol/modelcontextprotocol`
- Commit: `f817239f4d6b1efff2c4dfc2f7af85c985d73076`
- Exact source path: `docs/specification/draft/basic/transports/streamable-http.mdx`
- Git blob SHA: `aabf97b271fb3f7df9ca041fff823cb6f8bc14a1`
- Exported artifact: `research/hermes/experiments/HS-004-CANARY-001/specification-streamable-http-2026-07-28.mdx`
- Exported artifact SHA-256: `541dab77420190a4805c098b6a887ed29d1eb287c2d77fca5e0e8db99e6b976f`
- Exported artifact byte size: `30808`
- Source identity record: `research/hermes/experiments/HS-004-CANARY-001/specification-source-identity.json`

Claims must be verified against the pinned bytes. The relevant model has no standalone HTTP GET stream endpoint, no protocol-level MCP sessions, one separate POST per client message, POSTed `subscriptions/listen` for long-lived change notifications, an SSE response that remains open, no `Last-Event-ID` resumption for the listen stream, mandatory modern protocol/method metadata, and genuinely separate legacy compatibility behavior.

## 8. Infrastructure baseline

- DNS provider: Cloudflare.
- Cloudflare zone configuration was not directly inspected.
- Public DNS observation host: `pistaging`.
- Observation time: `2026-08-04T10:17:07+01:00`.
- `forgepilot-mcp-canary.byteforge.se` returned no A, AAAA, or CNAME answer.
- No Apache canary vhost exists.
- No canary TLS certificate was reachable.
- No canary backend route exists.

Authoritative Apache host: `pistaging`.

- Apache listens publicly on ports 80 and 443.
- Existing primary MCP: `forgepilot-mcp.byteforge.se` → `http://100.80.45.13:8790/`.
- Existing Ops MCP: `forgepilot-ops-mcp.byteforge.se` → `http://100.80.45.13:8792/`.
- `100.80.45.13` is the `rpsrv` Tailscale address.

The primary MCP vhost includes `ProxyPreserveHost On`, `ProxyRequests Off`, `ProxyTimeout 1800`, `connectiontimeout=5`, `timeout=1800`, and forwarded HTTPS host/proto/port headers. No explicit SSE flush or anti-buffering directive was observed. End-to-end SSE buffering and flushing remains an execution-phase test and must not be inferred from configuration.

The proposed hostname is `forgepilot-mcp-canary.byteforge.se`. It is unprovisioned. Any DNS, Apache, certificate, backend route, service, or ChatGPT app work requires separate G0 approval.

## 9. Required non-inferences

- Successful `tools/list` or `tools/call` does not prove MCP 2026-07-28 support.
- An SSE response does not prove `subscriptions/listen`.
- A server successfully writing event bytes does not prove client receipt.
- Client receipt does not prove ChatGPT surfaced the event.
- Delivery during an active tool call does not prove idle or background listening.
- One delivery does not prove reconnect behavior.
- Polling or replay success does not prove subscription support.
- Ordinary MCP support does not prove support for this revision.
- A listen request without delivered evidence proves only that a listen request was attempted.
- Absence of a surfaced event does not prove absence of network receipt.

## 10. Isolated canary scope

The temporary TypeScript server contains only:

1. `compatibility_ping`;
2. `list_canary_events(afterSequence)`;
3. one append-only numbered JSONL ledger;
4. MCP 2026-07-28 `subscriptions/listen`;
5. sanitized diagnostic logging.

It must not call Hermes.

### 10.1 `compatibility_ping`

```json
{
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```

It returns harmless canary status only.

### 10.2 `list_canary_events`

```json
{
  "type": "object",
  "properties": {
    "afterSequence": {
      "type": "integer",
      "minimum": 0
    }
  },
  "required": ["afterSequence"],
  "additionalProperties": false
}
```

Ordering is deterministic and ascending by sequence.

### 10.3 Required event shape

```json
{
  "sequence": 1,
  "eventType": "CANARY_NOTIFICATION",
  "summary": "Harmless MCP subscription test event.",
  "createdAt": "..."
}
```

### 10.4 Ledger invariants

- sequence is monotonically increasing;
- sequence is never reused;
- `afterSequence` is exclusive;
- ordering is ascending sequence;
- streaming does not remove entries;
- replay survives stream disconnect;
- malformed state fails closed;
- duplicate, descending, partial, or invalid records fail closed;
- the ledger, not SSE, is the source of truth.

## 11. Compatibility modes

### Mode A — 2026-07-28 only

Accept only revision `2026-07-28`; use POST-only semantics; implement `subscriptions/listen`; require correct modern metadata; reject header/body mismatch, unsupported revisions, legacy initialize/session headers, and GET-stream behavior deterministically; never silently downgrade.

### Mode B — explicit dual-era fallback

Accept compliant `2026-07-28` requests and separately support legacy revision `2025-06-18`. Dispatch the eras through explicit non-overlapping paths, reject ambiguity, and log the selected revision and transport era.

### Mode C — legacy control

Reproduce known-working revision `2025-06-18`, provide ping and durable replay, and do not implement `subscriptions/listen` or claim modern support.

## 12. Diagnostic logging

Record bounded sanitized observations including observation sequence, timestamp, phase, mode, generated connection identifier, hashed request identifier, HTTP method/path, content type, Accept header, MCP protocol-version header, MCP method/name metadata, JSON-RPC method, body protocol version, client name/version, bounded client capabilities, response status/content type, stream open/close timestamps, stream duration, emitted notification sequence, write success, disconnect reason, and reconnect ordinal.

Never log Authorization, Cookie, Set-Cookie, access or refresh tokens, client secrets, raw session identifiers, complete IP addresses without separate justification, unbounded headers, or unbounded request bodies.

## 13. Isolation boundary

Allowed only after explicit implementation approval:

- one temporary TypeScript process;
- one separate localhost port selected and collision-checked in the implementation manifest;
- one separately approved temporary public hostname;
- one separate ChatGPT MCP app;
- the two harmless read-only tools;
- one canary ledger;
- sanitized diagnostic logs;
- writes only to enumerated canary paths.

Forbidden:

- production ForgePilot MCP endpoint modification;
- Ops MCP implementation or capability broadening;
- Hermes calls or mutations;
- production behavior changes;
- generic shell tools;
- arbitrary filesystem or database access;
- messaging setup;
- production credentials or sessions;
- writes outside approved paths;
- unrelated cleanup;
- WebSockets.

## 14. Required experiment phases

Every phase has fixed `PHASE_START`, `PHASE_END`, and `PHASE_ABORT` markers in both diagnostics and ledger.

1. Local protocol-conformance tests.
2. Local Mode A tests.
3. Local Mode B tests.
4. Local Mode C tests.
5. Public endpoint reachability without ChatGPT.
6. ChatGPT Mode C control connection.
7. ChatGPT Mode A connection attempt.
8. ChatGPT Mode B connection attempt.
9. Explicit `compatibility_ping`.
10. Explicit `list_canary_events(0)`.
11. Emit event during an active assistant turn.
12. Determine server write, client receipt, and ChatGPT surfacing separately.
13. Emit event after the turn is complete.
14. Characterize idle behavior.
15. Close the stream cleanly.
16. Characterize reconnect behavior.
17. Recover all events through durable replay.
18. Separately approved teardown.

A phase may begin only after the preceding phase has a terminal marker and its clean-tree check passes.

## 15. Primary classification and precedence

Exactly one primary classification is assigned using this precedence:

`SUPPORTED` > `ACTIVE_TURN_ONLY` > `LISTENING_NOT_SURFACED` > `TRANSPORT_SUPPORTED_CLIENT_NOT_LISTENING` > `NOT_SUPPORTED_WITH_FALLBACK` > `NOT_SUPPORTED`.

- `SUPPORTED`: compliant 2026-07-28 traffic and `subscriptions/listen` are observed; active-turn and post-turn events are received and surfaced without replay causing the observation; no legacy downgrade is required.
- `ACTIVE_TURN_ONLY`: compliant modern listen exists and an active-turn event is received or surfaced, but bounded post-turn/idle tests do not establish delivery or surfacing; replay proves the events existed.
- `LISTENING_NOT_SURFACED`: compliant modern listen exists and client receipt is proven, but ChatGPT surfacing is not observed.
- `TRANSPORT_SUPPORTED_CLIENT_NOT_LISTENING`: compliant modern non-listen traffic exists, but no compliant listen request appears during the fixed window; replay remains functional.
- `NOT_SUPPORTED_WITH_FALLBACK`: Mode A does not establish modern operation, while Mode B or C establishes legacy `2025-06-18` with ping and replay.
- `NOT_SUPPORTED`: neither modern operation nor the selected legacy control is established.

Protocol ambiguity prevents classification and triggers a stop. Reconnect is recorded separately as one of: `RECONNECT_NOT_OBSERVED`, `RECONNECT_GRACEFUL`, `RECONNECT_AFTER_REMOTE_CLOSE`, `RECONNECT_AFTER_NETWORK_FAILURE`, `RECONNECT_LOOP_ABORTED`, or `RECONNECT_AMBIGUOUS`.

## 16. Required evidence artifacts

Evidence directory: `research/hermes/experiments/HS-004-CANARY-001/`.

Required artifacts:

- `specification-streamable-http-2026-07-28.mdx`;
- `specification-source-identity.json`;
- `baseline.md`;
- `implementation-manifest.json`;
- `local-conformance-results.json`;
- `sanitized-request-log.jsonl`;
- `canary-event-ledger.jsonl`;
- `mode-a-result.md`;
- `mode-b-result.md`;
- `mode-c-result.md`;
- `chatgpt-observation-log.md`;
- `verification.md`;
- `synthesis.md`;
- `G1-recommendation.md`;
- `artifact-manifest.json`.

Only the two specification artifacts are created at packet-freeze time. No G0 admission record is pre-created.

## 17. Verification requirements

Require:

- packet SHA-256, size, and commit;
- hashes and sizes for all evidence artifacts;
- clean-tree checks before and after every phase;
- tests for header/body version mismatch;
- tests for unsupported revisions;
- tests for forbidden GET/session semantics in Mode A;
- tests for missing or mismatched modern method/name metadata;
- tests for SSE cancellation and close;
- tests for replay after stream failure;
- source review for mandatory secret redaction;
- independent verifier separate from implementer;
- confirmation that production MCP behavior did not change;
- confirmation that no request reached Hermes and no write escaped approved paths.

## 18. Stop conditions

Stop immediately on:

- unexpected production endpoint traffic;
- any request reaching Hermes;
- any secret or authorization material appearing in logs;
- writes outside approved paths;
- unresolved implementation-base ambiguity;
- uncontrolled reconnection loops;
- protocol ambiguity preventing classification;
- reverse-proxy buffering invalidating observations;
- production MCP behavior changes;
- any attempt to relabel the live Hermes baseline as 0.20.0;
- ledger ordering or replay failure;
- inability to correlate a stream with its request;
- infrastructure state differing from the approved implementation manifest.

## 19. Teardown

Teardown is a separate mutation requiring explicit G0 approval. It may remove only infrastructure and runtime items enumerated in the approved implementation manifest. Evidence artifacts and the final ledger remain preserved unless G0 explicitly orders otherwise.

## 20. Approval state

- Packet status: `READY_FOR_G0_REVIEW`
- G1 review: COMPLETE
- G0 implementation approval: NOT GRANTED
- Implementation branch creation: NOT AUTHORIZED
- Implementation: NOT AUTHORIZED
- Infrastructure mutation: NOT AUTHORIZED
- ChatGPT app creation: NOT AUTHORIZED
