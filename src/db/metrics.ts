import { getDb } from "./client.js";

export interface PacketMetrics {
  total: number;
  successful: number;
  failed: number;
}

export function getPacketMetrics(): PacketMetrics {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM packets) as total,
        (SELECT COUNT(*) FROM packets WHERE status = 'completed') as successful,
        (SELECT COUNT(*) FROM packets WHERE status = 'failed') as failed`
    )
    .get() as { total: number; successful: number; failed: number };

  return row;
}
