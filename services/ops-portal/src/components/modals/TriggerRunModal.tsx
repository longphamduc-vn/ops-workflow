import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCw,
  Code,
  Sliders,
} from 'lucide-react';
import { WorkflowSummary } from '../../types';
import { opsClient } from '../../api/client';

interface TriggerRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflows: WorkflowSummary[];
  defaultWorkflowName?: string;
  onRunStarted: (runId: string) => void;
}

export const TriggerRunModal: React.FC<TriggerRunModalProps> = ({
  isOpen,
  onClose,
  workflows,
  defaultWorkflowName,
  onRunStarted,
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>(
    defaultWorkflowName || (workflows[0]?.name ?? '')
  );
  const [idempotencyKey, setIdempotencyKey] = useState<string>(
    `req-${Math.random().toString(36).substring(2, 9)}`
  );
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [rawJsonMode, setRawJsonMode] = useState<boolean>(false);
  const [rawJson, setRawJson] = useState<string>('{}');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync inputs when workflow changes
  React.useEffect(() => {
    const wf = workflows.find((w) => w.name === selectedWorkflow);
    if (wf) {
      const defaults: Record<string, any> = {};
      Object.entries(wf.inputs).forEach(([k, v]) => {
        defaults[k] = v.default ?? '';
      });
      setInputValues(defaults);
      setRawJson(JSON.stringify(defaults, null, 2));
    }
  }, [selectedWorkflow, workflows]);

  if (!isOpen) return null;

  const currentWf = workflows.find((w) => w.name === selectedWorkflow);

  const handleInputChange = (key: string, val: any) => {
    const updated = { ...inputValues, [key]: val };
    setInputValues(updated);
    setRawJson(JSON.stringify(updated, null, 2));
  };

  const handleRawJsonChange = (val: string) => {
    setRawJson(val);
    try {
      const parsed = JSON.parse(val);
      setInputValues(parsed);
      setErrorMsg(null);
    } catch (_) {
      setErrorMsg('JSON không hợp lệ');
    }
  };

  const generateUuid = () => {
    setIdempotencyKey(`req-${Math.random().toString(36).substring(2, 9)}`);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      let inputsToSubmit = inputValues;
      if (rawJsonMode) {
        inputsToSubmit = JSON.parse(rawJson);
      }
      const res = await opsClient.triggerRun(selectedWorkflow, inputsToSubmit, idempotencyKey);
      onRunStarted(res.run_id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi kích hoạt workflow');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Kích hoạt Workflow Execution</h3>
              <p className="text-[11px] text-slate-400">Gửi lệnh chạy qua REST API v1 với Idempotency Key</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh] custom-scrollbar">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800 rounded-lg text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Workflow Selector */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Chọn Workflow mục tiêu:</label>
            <select
              value={selectedWorkflow}
              onChange={(e) => setSelectedWorkflow(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
            >
              {workflows.map((w) => (
                <option key={w.name} value={w.name}>
                  {w.name} (v{w.version}) — {w.trigger_type}
                </option>
              ))}
            </select>
          </div>

          {/* Idempotency Key */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Idempotency-Key (Chống gọi trùng lặp):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={idempotencyKey}
                onChange={(e) => setIdempotencyKey(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={generateUuid}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                <RotateCw className="w-3.5 h-3.5" /> Tạo mới
              </button>
            </div>
          </div>

          {/* Form vs Raw JSON Switcher */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-300">Tham số đầu vào (Inputs):</label>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRawJsonMode(false)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                    !rawJsonMode ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  <Sliders className="w-3 h-3" /> Form
                </button>
                <button
                  type="button"
                  onClick={() => setRawJsonMode(true)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                    rawJsonMode ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  <Code className="w-3 h-3" /> Raw JSON
                </button>
              </div>
            </div>

            {!rawJsonMode ? (
              <div className="space-y-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                {currentWf && Object.keys(currentWf.inputs).length > 0 ? (
                  Object.entries(currentWf.inputs).map(([key, schema]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between text-slate-400 font-mono mb-1">
                        <span>
                          {key} {schema.required && <span className="text-red-400">*</span>}
                        </span>
                        <span className="text-[10px] text-slate-500 font-sans">
                          {schema.type}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={inputValues[key] ?? ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        placeholder={schema.description || `Nhập ${key}...`}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-center py-2">Workflow này không yêu cầu tham số đầu vào.</div>
                )}
              </div>
            ) : (
              <textarea
                value={rawJson}
                onChange={(e) => handleRawJsonChange(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-emerald-400 text-xs focus:outline-none focus:border-blue-500 custom-scrollbar"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isSubmitting ? 'Đang kích hoạt...' : 'Kích hoạt Run'}
          </button>
        </div>
      </div>
    </div>
  );
};

