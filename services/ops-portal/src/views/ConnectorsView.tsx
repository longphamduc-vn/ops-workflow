import React, { useState } from 'react';
import {
  Network,
  CheckCircle2,
  RotateCw,
  Activity,
  Shield,
  Layers,
} from 'lucide-react';

export const ConnectorsView: React.FC = () => {
  const [isRelogging, setIsRelogging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState<boolean | null>(null);

  const handleRelogin = () => {
    setIsRelogging(true);
    setTimeout(() => {
      setIsRelogging(false);
      alert('Đã tái tạo phiên đăng nhập Nexacro EMS thành công (/login.do). Session TTL được làm mới 30 phút.');
    }, 800);
  };

  const handlePing = () => {
    setPingSuccess(true);
    setTimeout(() => setPingSuccess(null), 3000);
  };

  return (
    <div className="space-y-5">
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-400" />
          Giám sát Connectors & Legacy EMS Gateway
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Tình trạng phiên kết nối, giới hạn gọi hàm (Token Bucket Rate Limiting) và danh sách dịch vụ whitelist
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Connector 1: Legacy Nexacro EMS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Connector: ems (Nexacro XML)</h3>
                <span className="text-[11px] text-slate-400 font-mono">http://localhost:9000</span>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Session Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Giao thức Payload:</span>
              <span className="font-mono text-slate-200">Nexacro XML Dataset Codec</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Session TTL còn lại:</span>
              <span className="font-mono text-emerald-400 font-bold">24 phút 18 giây</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Giới hạn Rate-Limit:</span>
              <span className="font-mono text-slate-200">max_concurrent=3, min_interval=100ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">SSL Verification:</span>
              <span className="font-mono text-amber-400 font-semibold">false (Bypass nội bộ)</span>
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
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleRelogin}
              disabled={isRelogging}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRelogging ? 'animate-spin' : ''}`} />
              {isRelogging ? 'Đang Relogin...' : 'Force Relogin Thủ công'}
            </button>

            <button
              onClick={handlePing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Ping Heartbeat
            </button>

            {pingSuccess && (
              <span className="text-xs text-emerald-400 font-semibold font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 18ms
              </span>
            )}
          </div>
        </div>

        {/* Connector 2: Generic HTTP REST */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Connector: http (REST APIs)</h3>
                <span className="text-[11px] text-slate-400 font-mono">External Webhooks & Microservices</span>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Ready
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Default Timeout:</span>
              <span className="font-mono text-slate-200">30s</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Retry Strategy:</span>
              <span className="font-mono text-slate-200">Exponential backoff (delay 2s, max 3)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">HMAC Webhook Signatures:</span>
              <span className="font-mono text-emerald-400 font-bold">SHA-256 (X-Signature active)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Dead Letter Queue (DLQ):</span>
              <span className="font-mono text-emerald-400 font-bold">0 events backlog</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Subscribers:
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div>• Component 3 (Incident Management): equipment.status.updated</div>
              <div>• Slack Ops Alerts: #ops-alerts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
