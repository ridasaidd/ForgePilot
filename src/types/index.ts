// Type definitions — placeholder for V1 types.

export interface PacketMetrics {
  date: string;
  packet_id: string;
  task_type: string;
  packet_template: string;
  implementation_model: string;
  audit_model: string;
  result: string;
  first_pass_success: string;
  fix_attempts: number;
  escalated: string;
  escalated_to: string;
  audit_accepted: string;
  human_accepted: string;
  clarification_required: string;
  clarification_count: number;
  clarification_resolved: string;
  root_cause_level: string;
  root_cause_reason: string;
  duration_minutes: number;
  notes: string;
}
