import {
  WorkflowSummary,
  RunListResponse,
  RunRecord,
  StepRunRecord,
  DatabaseTableMeta,
  DatabaseQueryResult,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const API_KEY = import.meta.env.VITE_API_KEY || 'test_api_key';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
};

// Mock data fallbacks for seamless standalone development & preview
const MOCK_WORKFLOWS: WorkflowSummary[] = [
  {
    name: 'equipment-status-lookup',
    version: '1.0',
    description: 'Look up equipment WIP entity status, work order master details, and maintenance history from Nexacro EMS',
    trigger_type: 'cron',
    inputs: {
      wip_entity_id: { type: 'string', required: true, default: '337389615', description: 'Target WIP Entity ID or Equipment Work Order ID' },
      organization_id: { type: 'string', required: true, default: '28753', description: 'Target EMS Organization Unit ID' },
      alert_channel: { type: 'string', required: false, default: '#ops-alerts', description: 'Destination notification channel' },
    },
  },
  {
    name: 'spare-parts-inventory-audit',
    version: '1.0',
    description: 'Audit warehouse spare parts inventory against minimum safety stock thresholds in EMS database',
    trigger_type: 'manual',
    inputs: {
      warehouse_id: { type: 'string', required: true, default: 'WH-MAIN-01', description: 'Target Warehouse Code' },
      category: { type: 'string', required: false, default: 'PNEUMATICS', description: 'Spare part category' },
    },
  },
  {
    name: 'procurement-rfq-stock-optimization',
    version: '1.2',
    description: 'End-to-end 9-step procurement flow: RFQ quotation check, 3-tier waterfall interlock & SG approval',
    trigger_type: 'manual',
    inputs: {
      q_code: { type: 'string', required: true, default: 'Q-2026-X89', description: 'Target Q-Code' },
      budget_code: { type: 'string', required: true, default: 'SG-OVER-03', description: 'Budget appropriation code' },
    },
  },
  {
    name: 'purchase-order-tracking',
    version: '1.0',
    description: 'Track PO statuses across 4 channels (Stock Transfer, Internal PO, Standard PO, Urgent PO)',
    trigger_type: 'cron',
    inputs: {
      po_number: { type: 'string', required: true, default: 'PO-2026-11002' },
    },
  },
  {
    name: 'spare-parts-inventory-sync',
    version: '1.0',
    description: 'Periodic ETL synchronization of EMS spare parts stock into normalized SQLite read-models',
    trigger_type: 'cron',
    inputs: {},
  },
  {
    name: 'target-stock-optimization',
    version: '1.1',
    description: 'Nightly batch re-calculation of dynamic target buffer stock levels across all manufacturing lines',
    trigger_type: 'cron',
    inputs: {},
  },
];

const MOCK_RUNS: RunRecord[] = [
  {
    run_id: 'run_01H9A8Z12',
    workflow_name: 'equipment-status-lookup',
    status: 'failed',
    inputs: { wip_entity_id: '337389615', organization_id: '28753', alert_channel: '#ops-alerts' },
    outputs: {},
    error: {
      kind: 'connector',
      step_id: 'get_wip_entity',
      message: "NexacroApiError: SESSION_EXPIRED (-1) - Please re-login with valid credentials",
    },
    created_at: new Date(Date.now() - 90000).toISOString(),
    started_at: new Date(Date.now() - 89000).toISOString(),
    completed_at: new Date(Date.now() - 85000).toISOString(),
  },
  {
    run_id: 'run_01H9A7X99',
    workflow_name: 'spare-parts-inventory-audit',
    status: 'success',
    inputs: { warehouse_id: 'WH-MAIN-01', category: 'PNEUMATICS' },
    outputs: { audited_items_count: 142, low_stock_alerts: 3 },
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    started_at: new Date(Date.now() - 15 * 60000 + 500).toISOString(),
    completed_at: new Date(Date.now() - 15 * 60000 + 3920).toISOString(),
  },
  {
    run_id: 'run_01H9A6W55',
    workflow_name: 'procurement-rfq-stock-optimization',
    status: 'wait_approval',
    inputs: { q_code: 'Q-2026-X89', budget_code: 'SG-OVER-03' },
    outputs: { rfq_price: 12500000, interlock_status: 'PASSED' },
    created_at: new Date(Date.now() - 32 * 60000).toISOString(),
    started_at: new Date(Date.now() - 32 * 60000 + 800).toISOString(),
  },
  {
    run_id: 'run_01H9A5M10',
    workflow_name: 'purchase-order-tracking',
    status: 'success',
    inputs: { po_number: 'PO-2026-11002' },
    outputs: { tracking_status: 'IN_TRANSIT', eta: '2026-11-15' },
    created_at: new Date(Date.now() - 50 * 60000).toISOString(),
    started_at: new Date(Date.now() - 50 * 60000 + 200).toISOString(),
    completed_at: new Date(Date.now() - 50 * 60000 + 1090).toISOString(),
  },
];

export const opsClient = {
  async getHealth(): Promise<{ status: string }> {
    try {
      const res = await fetch('/health');
      if (res.ok) return await res.json();
    } catch (_) {}
    return { status: 'ok' };
  },

  async listWorkflows(): Promise<WorkflowSummary[]> {
    try {
      const res = await fetch(`${API_BASE}/workflows`, { headers: defaultHeaders });
      if (res.ok) return await res.json();
    } catch (_) {}
    return MOCK_WORKFLOWS;
  },

  async listRuns(params?: { status?: string; workflow_name?: string; limit?: number; offset?: number }): Promise<RunListResponse> {
    try {
      const url = new URL(`${window.location.origin}${API_BASE}/runs`);
      if (params?.status && params.status !== 'all') url.searchParams.set('status', params.status);
      if (params?.workflow_name) url.searchParams.set('workflow_name', params.workflow_name);
      if (params?.limit) url.searchParams.set('limit', String(params.limit));
      if (params?.offset) url.searchParams.set('offset', String(params.offset));

      const res = await fetch(url.toString(), { headers: defaultHeaders });
      if (res.ok) return await res.json();
    } catch (_) {}

    let filtered = [...MOCK_RUNS];
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(r => r.status === params.status);
    }
    if (params?.workflow_name) {
      filtered = filtered.filter(r => r.workflow_name === params.workflow_name);
    }
    return {
      items: filtered,
      total: filtered.length,
      limit: params?.limit || 50,
      offset: params?.offset || 0,
    };
  },

  async getRun(runId: string): Promise<RunRecord | null> {
    try {
      const res = await fetch(`${API_BASE}/runs/${runId}`, { headers: defaultHeaders });
      if (res.ok) return await res.json();
    } catch (_) {}
    return MOCK_RUNS.find(r => r.run_id === runId) || null;
  },

  async getRunSteps(runId: string): Promise<StepRunRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/runs/${runId}/steps`, { headers: defaultHeaders });
      if (res.ok) return await res.json();
    } catch (_) {}

    // Mock steps only for the static prototype placeholder run_01H9A8Z12
    if (runId === 'run_01H9A8Z12') {
      return [
        {
          step_id: 'get_wip_entity',
          status: 'failed',
          attempt: 3,
          latency_ms: 1250,
          started_at: new Date(Date.now() - 89000).toISOString(),
          completed_at: new Date(Date.now() - 85000).toISOString(),
          error: {
            kind: 'connector',
            message: 'NexacroApiError: SESSION_EXPIRED (-1) on /woSearchNav/retrieveWipEntity.lgdn',
          },
        },
        {
          step_id: 'transform_wip_data',
          status: 'skipped',
          attempt: 0,
          latency_ms: 0,
        },
        {
          step_id: 'query_master_details',
          status: 'skipped',
          attempt: 0,
          latency_ms: 0,
        },
        {
          step_id: 'notify_slack',
          status: 'skipped',
          attempt: 0,
          latency_ms: 0,
        },
      ];
    }

    return [];
  },

  async getRunLogs(runId: string): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/runs/${runId}/logs`, { headers: defaultHeaders });
      if (res.ok) {
        return await res.text();
      }
      if (res.status === 404) {
        // Log file does not exist or has been deleted
        return '';
      }
      const errBody = await res.text();
      return `[ERROR ${res.status}] Failed to fetch logs: ${errBody}`;
    } catch (err: any) {
      console.warn('Network error fetching run logs:', err);
      return '';
    }
  },

  async triggerRun(workflowName: string, inputs: Record<string, any>, idempotencyKey?: string): Promise<{ run_id: string; status: string }> {
    const res = await fetch(`${API_BASE}/workflows/${workflowName}/runs`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify({ inputs, idempotency_key: idempotencyKey }),
    });
    if (!res.ok) {
      throw new Error(`Failed to trigger workflow: ${res.statusText}`);
    }
    return await res.json();
  },

  async replayRun(runId: string, options: { resume_from_failed?: boolean; new_run?: boolean } = {}): Promise<{ run_id: string; status: string }> {
    const res = await fetch(`${API_BASE}/runs/${runId}/replay`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        resume_from_failed: options.resume_from_failed ?? true,
        new_run: options.new_run ?? false,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to replay run: ${res.statusText}`);
    }
    return await res.json();
  },

  async cancelRun(runId: string): Promise<void> {
    await fetch(`${API_BASE}/runs/${runId}/cancel`, {
      method: 'POST',
      headers: defaultHeaders,
    });
  },

  async deleteRunLogs(runId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/runs/${runId}/logs`, {
        method: 'DELETE',
        headers: defaultHeaders,
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  },

  async deleteRun(runId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/runs/${runId}`, {
        method: 'DELETE',
        headers: defaultHeaders,
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  },

  async deleteAllRuns(): Promise<{ success: boolean; deleted_count: number; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/runs`, {
        method: 'DELETE',
        headers: defaultHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, deleted_count: data.deleted_count ?? 0, message: data.message };
      }
      return { success: false, deleted_count: 0, message: `Failed with status ${res.status}` };
    } catch (err: any) {
      return { success: false, deleted_count: 0, message: err.message || 'Connection error' };
    }
  },

  async listDatabaseTables(): Promise<DatabaseTableMeta[]> {
    try {
      const res = await fetch(`${API_BASE}/database/tables`, { headers: defaultHeaders });
      if (res.ok) return await res.json();
    } catch (_) {}
    return [];
  },

  async queryDatabaseTable(params: {
    db: string;
    table: string;
    limit?: number;
    offset?: number;
    search?: string;
    order_by?: string;
    order_dir?: string;
  }): Promise<DatabaseQueryResult | null> {
    try {
      const query = new URLSearchParams({
        db: params.db,
        table: params.table,
        limit: String(params.limit ?? 50),
        offset: String(params.offset ?? 0),
        order_dir: params.order_dir ?? 'desc',
      });
      if (params.search) query.append('search', params.search);
      if (params.order_by) query.append('order_by', params.order_by);

      const res = await fetch(`${API_BASE}/database/query?${query.toString()}`, {
        headers: defaultHeaders,
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return null;
  },
};

