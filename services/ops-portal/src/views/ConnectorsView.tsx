import React, { useState, useEffect } from 'react';
import {
  Network,
  CheckCircle2,
  XCircle,
  RotateCw,
  Activity,
  Shield,
  Layers,
} from 'lucide-react';

interface ConnectorHealth {
  status: 'online' | 'offline' | 'checking';
  latencyMs?: number;
  lastChecked?: string;
  serviceInfo?: string;
}

export const ConnectorsView: React.FC = () => {
  const [emsHealth, setEmsHealth] = useState<ConnectorHealth>({ status: 'checking' });
  const [apiHealth, setApiHealth] = useState<ConnectorHealth>({ status: 'checking' });
  const [isRelogging, setIsRelogging] = useState(false);
  const [reloginMsg, setReloginMsg] = useState<{ text: string; success: boolean } | null>(null);

  const checkEmsHealth = async () => {
    setEmsHealth((prev) => ({ ...prev, status: 'checking' }));
    const t0 = performance.now();
    try {
      const res = await fetch('http://localhost:9000/health', { method: 'GET' });
      const lat = Math.round(performance.now() - t0);
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setEmsHealth({
          status: 'online',
          latencyMs: lat,
          lastChecked: new Date().toLocaleTimeString('en-US'),
          serviceInfo: data.service || 'ems-simulation',
        });
      } else {
        setEmsHealth({
          status: 'offline',
          latencyMs: lat,
          lastChecked: new Date().toLocaleTimeString('en-US'),
          serviceInfo: `HTTP ${res.status}`,
        });
      }
    } catch (_) {
      setEmsHealth({
        status: 'offline',
        lastChecked: new Date().toLocaleTimeString('en-US'),
        serviceInfo: 'Connection failed',
      });
    }
  };

  const checkApiHealth = async () => {
    setApiHealth((prev) => ({ ...prev, status: 'checking' }));
    const t0 = performance.now();
    try {
      const res = await fetch('/health', { method: 'GET' });
      const lat = Math.round(performance.now() - t0);
      if (res.ok) {
        setApiHealth({
          status: 'online',
          latencyMs: lat,
          lastChecked: new Date().toLocaleTimeString('en-US'),
          serviceInfo: 'FastAPI Opsflow Core Engine',
        });
      } else {
        setApiHealth({
          status: 'offline',
          latencyMs: lat,
          lastChecked: new Date().toLocaleTimeString('en-US'),
        });
      }
    } catch (_) {
      setApiHealth({
        status: 'offline',
        lastChecked: new Date().toLocaleTimeString('en-US'),
        serviceInfo: 'Engine unreachable',
      });
    }
  };

  useEffect(() => {
    checkEmsHealth();
    checkApiHealth();
  }, []);

  const handleRelogin = async () => {
    setIsRelogging(true);
    setReloginMsg(null);
    try {
      // Test real auth handshake against EMS simulation /login.do
      const res = await fetch('http://localhost:9000/login.do', {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
      });
      if (res.ok) {
        setReloginMsg({
          text: 'Successfully refreshed Nexacro EMS session. Gateway credentials validated.',
          success: true,
        });
        checkEmsHealth();
      } else {
        setReloginMsg({
          text: `EMS session refresh returned status ${res.status}.`,
          success: false,
        });
      }
    } catch (err: any) {
      setReloginMsg({
        text: `Error connecting to EMS gateway at http://localhost:9000: ${err.message}`,
        success: false,
      });
    } finally {
      setIsRelogging(false);
      setTimeout(() => setReloginMsg(null), 5000);
    }
  };

  return (
    <div className="space-y-5">
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-400" />
          Connectors & Legacy EMS Gateway Monitor
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Live connection session health, Token Bucket rate-limiting parameters, and service routing whitelist
        </p>
      </div>

      {reloginMsg && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            reloginMsg.success
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-red-950/40 border-red-800 text-red-300'
          }`}
        >
          {reloginMsg.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{reloginMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Connector 1: Legacy Nexacro EMS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  emsHealth.status === 'online'
                    ? 'bg-emerald-500 animate-pulse'
                    : emsHealth.status === 'checking'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-red-500'
                }`}
              ></span>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Connector: ems (Nexacro XML)</h3>
                <span className="text-[11px] text-slate-400 font-mono">http://localhost:9000</span>
              </div>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                emsHealth.status === 'online'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : emsHealth.status === 'checking'
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  : 'text-red-400 bg-red-500/10 border-red-500/20'
              }`}
            >
              {emsHealth.status === 'online' ? 'Online / Session Active' : emsHealth.status === 'checking' ? 'Checking...' : 'Disconnected'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Payload Protocol:</span>
              <span className="font-mono text-slate-200">Nexacro XML Dataset Codec</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Live Gateway Latency:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {emsHealth.latencyMs !== undefined ? `${emsHealth.latencyMs} ms` : '--'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Rate-Limit Bounds:</span>
              <span className="font-mono text-slate-200">max_concurrent=3, min_interval=100ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">SSL Verification:</span>
              <span className="font-mono text-amber-400 font-semibold">Self-Signed Bypass (Local Dev)</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Allowed Services Whitelist:
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
              <div>• /emscom/woSearchNav/retrieveWipEntity.lgdn</div>
              <div>• /emscom/woMasterNav/WoMasterRetInit.lgdn</div>
              <div>• /emsworkorder/wo50/wo580Nav/statusHistory.lgdn</div>
              <div>• /emsspareparts/sp101/sp110Nav/RetStockStatusList.lgdn</div>
              <div>• /emsspareparts/sp102/sp135Nav/retrieveItemInfoDetail.lgdn</div>
              <div>• /emsspareparts/sp302/sp330Nav/TargetStockSearchList.lgdn</div>
              <div>• /emscom/popupNav/retrieveItem.lgdn</div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleRelogin}
              disabled={isRelogging}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRelogging ? 'animate-spin' : ''}`} />
              {isRelogging ? 'Relogging...' : 'Force Re-login'}
            </button>

            <button
              onClick={checkEmsHealth}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Ping Heartbeat
            </button>

            {emsHealth.latencyMs !== undefined && (
              <span className="text-xs text-emerald-400 font-semibold font-mono flex items-center gap-1 ml-auto">
                <CheckCircle2 className="w-3.5 h-3.5" /> {emsHealth.latencyMs}ms
              </span>
            )}
          </div>
        </div>

        {/* Connector 2: Generic HTTP REST & Opsflow API */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  apiHealth.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}
              ></span>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Connector: http (REST APIs & Engine)</h3>
                <span className="text-[11px] text-slate-400 font-mono">http://localhost:8000</span>
              </div>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                apiHealth.status === 'online'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-red-400 bg-red-500/10 border-red-500/20'
              }`}
            >
              {apiHealth.status === 'online' ? 'Ready / Online' : 'Offline'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Engine Health Status:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {apiHealth.status === 'online' ? 'FastAPI 200 OK' : 'Unavailable'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Response Latency:</span>
              <span className="font-mono text-slate-200">
                {apiHealth.latencyMs !== undefined ? `${apiHealth.latencyMs} ms` : '--'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Retry Strategy:</span>
              <span className="font-mono text-slate-200">Exponential backoff (delay 2s, max 3)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Authentication:</span>
              <span className="font-mono text-blue-400 font-bold">X-API-Key (Bearer/Header Auth)</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Integrated Subsystems:
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div>• Opsflow Engine API: /api/v1/workflows & /api/v1/runs</div>
              <div>• Slack & Teams Webhooks: alerts dispatcher</div>
              <div>• SQLite Read-Models: procurement_stock_optimization, spare_parts_audit</div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={checkApiHealth}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              Ping Engine
            </button>

            {apiHealth.latencyMs !== undefined && (
              <span className="text-xs text-emerald-400 font-semibold font-mono flex items-center gap-1 ml-auto">
                <CheckCircle2 className="w-3.5 h-3.5" /> {apiHealth.latencyMs}ms
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
