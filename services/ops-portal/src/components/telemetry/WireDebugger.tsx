import React from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';

interface WireDebuggerProps {
  stepId: string;
  isFailed?: boolean;
}

export const WireDebugger: React.FC<WireDebuggerProps> = ({ stepId, isFailed = true }) => {
  const [copiedReq, setCopiedReq] = React.useState(false);
  const [copiedRes, setCopiedRes] = React.useState(false);

  const sampleReqXml = `<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
  <Parameters>
    <Parameter id="_ems_userId">658359</Parameter>
    <Parameter id="_ems_organizationId">28753</Parameter>
    <Parameter id="_ems_language">EN</Parameter>
  </Parameters>
  <Dataset id="ds_input">
    <ColumnInfo>
      <Column id="wip_entity_id" type="string" size="32"/>
      <Column id="organization_id" type="string" size="16"/>
    </ColumnInfo>
    <Rows>
      <Row>
        <Col id="wip_entity_id">337389615</Col>
        <Col id="organization_id">28753</Col>
      </Row>
    </Rows>
  </Dataset>
</Root>`;

  const sampleResXml = isFailed
    ? `<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
  <Dataset id="ErrorCode">
    <ColumnInfo>
      <Column id="code" type="string" size="10"/>
      <Column id="message" type="string" size="256"/>
    </ColumnInfo>
    <Rows>
      <Row>
        <Col id="code">-1</Col>
        <Col id="message">SESSION_EXPIRED: Session invalidated by enterprise gateway or database error ORA-01017</Col>
      </Row>
    </Rows>
  </Dataset>
</Root>`
    : `<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
  <Dataset id="ds_output">
    <ColumnInfo>
      <Column id="wip_entity_id" type="string"/>
      <Column id="wip_entity_name" type="string"/>
      <Column id="status_type" type="string"/>
    </ColumnInfo>
    <Rows>
      <Row>
        <Col id="wip_entity_id">337389615</Col>
        <Col id="wip_entity_name">WO-ROBOT-001</Col>
        <Col id="status_type">RELEASED</Col>
      </Row>
    </Rows>
  </Dataset>
</Root>`;

  const copyText = (text: string, isReq: boolean) => {
    navigator.clipboard.writeText(text);
    if (isReq) {
      setCopiedReq(true);
      setTimeout(() => setCopiedReq(false), 2000);
    } else {
      setCopiedRes(true);
      setTimeout(() => setCopiedRes(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Diagnostics Alert Banner */}
      {isFailed && (
        <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-red-300">
              Phát hiện Lỗi Giao thức Nexacro XML (ErrorCode = -1):
            </span>
            <p className="text-red-200/90 mt-0.5">
              Máy chủ EMS trả về HTTP 500 kèm dataset báo lỗi phiên: <code className="bg-red-900/40 px-1 py-0.5 rounded text-amber-300">SESSION_EXPIRED</code>.
              Hệ thống đã tự động thử relogin vào <code className="bg-red-900/40 px-1 py-0.5 rounded">/login.do</code> qua connector <code className="text-blue-300">ems</code> 3 lần nhưng không thành công.
            </p>
          </div>
        </div>
      )}

      {/* Wire Request & Response Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Request Column */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
              <span className="font-bold text-blue-400 flex items-center gap-1.5 font-mono">
                <ArrowUpRight className="w-3.5 h-3.5" />
                [WIRE: REQ] Gói tin gửi đi ({stepId})
              </span>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono text-[10px] font-bold">
                  POST
                </span>
                <button
                  onClick={() => copyText(sampleReqXml, true)}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  {copiedReq ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="mt-2 text-xs font-mono text-slate-300 break-all space-y-1">
              <div>
                <span className="text-slate-400">Endpoint:</span> http://localhost:9000/emscom/woSearchNav/retrieveWipEntity.lgdn
              </div>
              <div className="text-[11px] text-slate-400">
                Content-Type: application/xml; charset=UTF-8
              </div>
              <div className="text-[11px] text-slate-400">
                Cookie: JSESSIONID=09F81827461827AA.jvm1; UserOrg=28753
              </div>
            </div>

            <div className="mt-3">
              <div className="text-[11px] font-mono text-slate-400 mb-1">Raw XML Dataset Body:</div>
              <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto custom-scrollbar max-h-60">
                {sampleReqXml}
              </pre>
            </div>
          </div>
        </div>

        {/* 2. Response Column */}
        <div className={`bg-slate-950 border rounded-xl p-4 flex flex-col justify-between ${
          isFailed ? 'border-red-900/60' : 'border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
              <span className={`font-bold flex items-center gap-1.5 font-mono ${
                isFailed ? 'text-red-400' : 'text-emerald-400'
              }`}>
                <ArrowDownLeft className="w-3.5 h-3.5" />
                [WIRE: RESP] Phản hồi từ máy chủ
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  isFailed ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {isFailed ? 'HTTP 500 / Nexacro Error' : 'HTTP 200 OK'}
                </span>
                <button
                  onClick={() => copyText(sampleResXml, false)}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  {copiedRes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="mt-2 text-xs font-mono text-slate-300 space-y-1">
              <div>
                <span className="text-slate-400">Latency:</span> <span className="text-amber-400 font-bold">1,250 ms</span>
                <span className="text-slate-700 mx-2">•</span>
                <span className="text-slate-400">Bytes:</span> 482 B
              </div>
            </div>

            <div className="mt-3">
              <div className="text-[11px] font-mono text-slate-400 mb-1">Raw XML Response Payload:</div>
              <pre className={`p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono overflow-x-auto custom-scrollbar max-h-60 ${
                isFailed ? 'text-red-300' : 'text-blue-300'
              }`}>
                {sampleResXml}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
