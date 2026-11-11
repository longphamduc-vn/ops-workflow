export type RunStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'wait_approval';

export interface InputParamSchema {
  type: string;
  required?: boolean;
  default?: any;
  description?: string;
}

export interface WorkflowSummary {
  name: string;
  version: string;
  description?: string;
  trigger_type: string;
  inputs: Record<string, InputParamSchema>;
}

export interface WorkflowDetail extends WorkflowSummary {
  trigger: Record<string, any>;
  env: Record<string, string>;
  steps_count: number;
  publish_dataset?: string | null;
}

export interface RunRecord {
  run_id: string;
  workflow_name: string;
  status: RunStatus;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  error?: Record<string, any> | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface RunListResponse {
  items: RunRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface StepRunRecord {
  step_id: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  attempt: number;
  latency_ms: number;
  started_at?: string | null;
  completed_at?: string | null;
  error?: Record<string, any> | null;
}

export interface WireTelemetryItem {
  id: string;
  step_id: string;
  connector: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  request_body: string;
  response_status: number;
  response_body: string;
  latency_ms: number;
  error_highlight?: string;
}

