import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  Warehouse, 
  Barcode, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Truck, 
  ArrowUpRight,
  ShieldCheck,
  Search,
  RefreshCw,
  Printer
} from 'lucide-react';

export const WarehousePortalView: React.FC = () => {
  const { requisitions } = useProcurement();

  const [scannedEmNo, setScannedEmNo] = useState('HWBMTL21EC0101');
  const [scannedPartCode, setScannedPartCode] = useState('QDAB03583');
  const [workOrderInput, setWorkOrderInput] = useState('WO-248926091');
  const [issueQty, setIssueQty] = useState(2);
  const [issueSuccessNotice, setIssueSuccessNotice] = useState(false);

  // Physical inventory mock state
  const [inventoryList, setInventoryList] = useState([
    {
      qCode: 'QDAB03583',
      partName: 'Cảm biến quang vuông Panasonic CN-73-C2',
      location: 'Kho H1 - Giá B-04-02',
      physicalQty: 18,
      emsQty: 18,
      unitPrice: 45,
      agingDays: 14,
      status: 'MATCHED'
    },
    {
      qCode: 'QCAD38190',
      partName: 'Xylanh đôi dẫn hướng SMC MXQ16-100B',
      location: 'Kho H2 - Giá A-01-08',
      physicalQty: 6,
      emsQty: 6,
      unitPrice: 220,
      agingDays: 45,
      status: 'MATCHED'
    },
    {
      qCode: 'QDAD12236',
      partName: 'Board nguồn CPX V4 Trumpf 2912146',
      location: 'Kho H3 - Tủ đặc biệt E-02',
      physicalQty: 1,
      emsQty: 1,
      unitPrice: 3150,
      agingDays: 22,
      status: 'MATCHED'
    },
    {
      qCode: 'QCAC13053',
      partName: 'Ống dẫn khí nén SMC 6mm (Cuộn 100m)',
      location: 'Kho H1 - Giá C-03-01',
      physicalQty: 12,
      emsQty: 14,
      unitPrice: 85,
      agingDays: 8,
      status: 'DISCREPANCY'
    }
  ]);

  const handleIssueToLine = (e: React.FormEvent) => {
    e.preventDefault();
    setIssueSuccessNotice(true);
    setTimeout(() => setIssueSuccessNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Principle Callout Alert */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                UI-ROLE-04: Cổng Thủ Kho Nhà Máy HW (Warehouse Operations Portal)
              </h2>
              <Badge variant="success">Kho H1 - H3 (HW Plant)</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quét Barcode EM No 14 ký tự, xuất kho lắp máy theo Work Order, ghi nhận chi phí vận hành thực tế (Issue Expense).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Trạng thái máy quét Barcode:</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Máy Quét 2D Đã Sẵn Sàng
          </span>
        </div>
      </div>

      {/* 2-Column: Barcode Issuance vs Stock Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Barcode Issuance (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Barcode className="w-4 h-4 text-rose-500" />
              1. Quét Xuất Kho Lắp Máy (Direct Machine Issue)
            </h3>
            <span className="text-[11px] text-slate-400">Hạch toán tức thì</span>
          </div>

          {issueSuccessNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã xuất kho {issueQty} EA sang máy <strong>{scannedEmNo}</strong>! Chi phí $90 USD đã được hạch toán vào Work Order <strong>{workOrderInput}</strong>.</span>
            </div>
          )}

          <form onSubmit={handleIssueToLine} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                1. Mã Số Quản Lý Thiết Bị 14 Ký Tự (EM No): (*)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={scannedEmNo}
                  onChange={(e) => setScannedEmNo(e.target.value)}
                  className="w-full font-mono pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  placeholder="HWBMTL21EC0101"
                  required
                />
                <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">Factory: HW</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">Line: #201 (2F)</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">Máy: DB-01</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                2. Mã Phụ Tùng / Serial QCode: (*)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={scannedPartCode}
                  onChange={(e) => setScannedPartCode(e.target.value)}
                  className="w-full font-mono pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  placeholder="QDAB03583"
                  required
                />
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                Khớp: Cảm biến quang vuông Panasonic CN-73-C2 (Tồn kho: 18 EA)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  3. Số Lượng Xuất: (*)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={issueQty}
                  onChange={(e) => setIssueQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Mã Lệnh Sửa Chữa (Work Order): (*)
                </label>
                <input
                  type="text"
                  value={workOrderInput}
                  onChange={(e) => setWorkOrderInput(e.target.value)}
                  className="w-full font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  placeholder="WO-248926091"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Đơn vị nhận:</span>
                <strong className="text-slate-800 dark:text-slate-200">PO Module Technology Team 2</strong>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Kỹ sư nhận hàng:</span>
                <strong className="text-slate-800 dark:text-slate-200">Nguyen Van Thang (Process DB)</strong>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Ước tính chi phí hạch toán:</span>
                <strong className="text-rose-600 dark:text-rose-400 font-mono font-bold">${issueQty * 45} USD</strong>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-all text-xs"
            >
              <ArrowUpRight className="w-4 h-4" />
              Xác Nhận Xuất Kho & In Phiếu Giao Nhận
            </button>
          </form>
        </div>

        {/* Right Column: Physical vs System Reconciliation (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-500" />
                2. Đối Soát Tồn Kho Vật Lý vs Hệ Thống EMS (Reconciliation)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Đồng bộ dữ liệu thời gian thực giữa kiểm kê tại kho và hệ thống kế toán EMS.
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Đối Soát Lại
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Mã QCode & Tên</th>
                  <th className="py-2.5 px-3">Vị Trí Kệ</th>
                  <th className="py-2.5 px-2 text-center">Tồn Kho HW</th>
                  <th className="py-2.5 px-2 text-center">EMS Tồn</th>
                  <th className="py-2.5 px-3">Lưu Kho</th>
                  <th className="py-2.5 px-3 text-right">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {inventoryList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{item.qCode}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{item.partName}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                      {item.location}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.physicalQty} EA
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600 dark:text-slate-400">
                      {item.emsQty} EA
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.agingDays > 30 
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700' 
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {item.agingDays} Ngày
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {item.status === 'MATCHED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Khớp 100%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Lệch 2 EA
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Tổng giá trị kiểm kê kho tháng 11: <strong className="text-slate-900 dark:text-white font-mono font-bold">$286,400 USD</strong></span>
            <button className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-semibold">
              <Printer className="w-3.5 h-3.5" />
              In Biên Bản Kiểm Kê
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
