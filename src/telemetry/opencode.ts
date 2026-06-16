import fs from "node:fs";

export interface OpenCodeTelemetryArtifact {
  session_id: string | null;
  provider: string | null;
  model: string | null;
  model_variant: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  reasoning_tokens: number | null;
  cache_read_tokens: number | null;
  cache_write_tokens: number | null;
  cost: number | null;
  created_at: string | null;
  updated_at: string | null;
  duration_ms: number | null;
}

export interface OpenCodeTelemetryParseResult {
  parsed: boolean;
  artifact: OpenCodeTelemetryArtifact | null;
  error: string | null;
}

function safeString(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "string" && val.length > 0) return val;
  if (typeof val === "number") return String(val);
  return null;
}

function safeInteger(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number" && Number.isFinite(val) && val >= 0) return Math.round(val);
  return null;
}

function safeFloat(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number" && Number.isFinite(val)) return val;
  return null;
}

function safeIsoTimestamp(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "string" && val.length > 0) return val;
  return null;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = safeString(obj[k]);
    if (v !== null) return v;
  }
  return null;
}

function pickInteger(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = safeInteger(obj[k]);
    if (v !== null) return v;
  }
  return null;
}

function pickFloat(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = safeFloat(obj[k]);
    if (v !== null) return v;
  }
  return null;
}

function pickTimestamp(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = safeIsoTimestamp(obj[k]);
    if (v !== null) return v;
  }
  return null;
}

interface AggregatedTokenFields {
  input_tokens: number | null;
  output_tokens: number | null;
  reasoning_tokens: number | null;
  cache_read_tokens: number | null;
  cache_write_tokens: number | null;
}

function aggregateMessageTokens(messages: unknown): AggregatedTokenFields | null {
  if (!Array.isArray(messages)) return null;

  let input = 0;
  let output = 0;
  let reasoning = 0;
  let cacheRead = 0;
  let cacheWrite = 0;
  let hasAny = false;

  for (const msg of messages) {
    if (msg === null || typeof msg !== "object") continue;
    const m = msg as Record<string, unknown>;
    const usage = m.usage as Record<string, unknown> | undefined;

    const i = safeInteger(usage?.input_tokens ?? m.input_tokens ?? usage?.input);
    const o = safeInteger(usage?.output_tokens ?? m.output_tokens ?? usage?.output);
    const r = safeInteger(usage?.reasoning_tokens ?? m.reasoning_tokens ?? usage?.reasoning);
    const cr = safeInteger(usage?.cache_read_tokens ?? m.cache_read_tokens ?? usage?.cache_read);
    const cw = safeInteger(usage?.cache_write_tokens ?? m.cache_write_tokens ?? usage?.cache_write);

    if (i !== null) { input += i; hasAny = true; }
    if (o !== null) { output += o; hasAny = true; }
    if (r !== null) { reasoning += r; hasAny = true; }
    if (cr !== null) { cacheRead += cr; hasAny = true; }
    if (cw !== null) { cacheWrite += cw; hasAny = true; }
  }

  if (!hasAny) return null;

  return {
    input_tokens: input,
    output_tokens: output,
    reasoning_tokens: reasoning,
    cache_read_tokens: cacheRead,
    cache_write_tokens: cacheWrite,
  };
}

export function parseOpenCodeTelemetryArtifact(artifact: unknown): OpenCodeTelemetryParseResult {
  if (artifact === null || artifact === undefined || typeof artifact !== "object") {
    return { parsed: false, artifact: null, error: "Artifact is not a valid JSON object" };
  }

  const obj = artifact as Record<string, unknown>;

  const sessionId = pickString(obj, ["session_id", "id", "sessionId"]);

  const provider = pickString(obj, ["provider", "provider_id", "providerId"]);

  const model = pickString(obj, ["model", "model_id", "modelId"]);

  const modelVariant = pickString(obj, ["model_variant", "modelVariant", "variant"]);

  const usageRaw = obj.usage as Record<string, unknown> | undefined;
  const costRaw = obj.cost as Record<string, unknown> | undefined;

  const messagesAgg = aggregateMessageTokens(obj.messages);

  const inputTokens = pickInteger(usageRaw ?? ({} as Record<string, unknown>), [
    "input_tokens", "input", "prompt_tokens", "prompt",
  ]) ?? messagesAgg?.input_tokens ?? null;

  const outputTokens = pickInteger(usageRaw ?? ({} as Record<string, unknown>), [
    "output_tokens", "output", "completion_tokens", "completion",
  ]) ?? messagesAgg?.output_tokens ?? null;

  const reasoningTokens = pickInteger(usageRaw ?? ({} as Record<string, unknown>), [
    "reasoning_tokens", "reasoning",
  ]) ?? messagesAgg?.reasoning_tokens ?? null;

  const cacheReadTokens = pickInteger(usageRaw ?? ({} as Record<string, unknown>), [
    "cache_read_tokens", "cache_read", "cacheReadTokens",
  ]) ?? messagesAgg?.cache_read_tokens ?? null;

  const cacheWriteTokens = pickInteger(usageRaw ?? ({} as Record<string, unknown>), [
    "cache_write_tokens", "cache_write", "cacheWriteTokens",
  ]) ?? messagesAgg?.cache_write_tokens ?? null;

  const cost = pickFloat(costRaw ?? ({} as Record<string, unknown>), [
    "total", "total_cost", "totalCost",
  ]) ?? safeFloat(obj.cost);

  const createdAt = pickTimestamp(obj, ["created_at", "created", "createdAt"]);

  const updatedAt = pickTimestamp(obj, ["updated_at", "updated", "updatedAt"]);

  const durationMs = pickInteger(obj, ["duration_ms", "durationMs", "duration"]);

  return {
    parsed: true,
    artifact: {
      session_id: sessionId,
      provider,
      model,
      model_variant: modelVariant,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      reasoning_tokens: reasoningTokens,
      cache_read_tokens: cacheReadTokens,
      cache_write_tokens: cacheWriteTokens,
      cost,
      created_at: createdAt,
      updated_at: updatedAt,
      duration_ms: durationMs,
    },
    error: null,
  };
}

export function parseOpenCodeTelemetryFile(filePath: string): OpenCodeTelemetryParseResult {
  if (!fs.existsSync(filePath)) {
    return { parsed: false, artifact: null, error: `Artifact file not found: ${filePath}` };
  }

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch {
    return { parsed: false, artifact: null, error: `Failed to read artifact file: ${filePath}` };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { parsed: false, artifact: null, error: `Failed to parse artifact JSON from: ${filePath}` };
  }

  return parseOpenCodeTelemetryArtifact(json);
}
