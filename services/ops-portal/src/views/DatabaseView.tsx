import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  RefreshCw,
  Server,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  Copy,
  Check,
  X,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { opsClient } from '../api/client';
import { DatabaseTableMeta, DatabaseQueryResult } from '../types';

export const DatabaseView: React.FC = () => {
  const [tables, setTables] = useState<DatabaseTableMeta[]>([]);
  const [selectedDb, setSelectedDb] = useState<'all' | 'opsflow' | 'ems_sim'>('all');
  const [activeTable, setActiveTable] = useState<{ db: string; table: string } | null>(null);

  const [queryResult, setQueryResult] = useState<DatabaseQueryResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(25);
  const [pageOffset, setPageOffset] = useState<number>(0);
  const [orderBy, setOrderBy] = useState<string>('');
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>('desc');

  // JSON preview modal state
  const [activeJsonModal, setActiveJsonModal] = useState<{ title: string; data: any } | null>(null);
  const [copiedModalJson, setCopiedModalJson] = useState<boolean>(false);

  // Load all table metadata
  const loadTables = async () => {
    setLoading(true);
    try {
      const data = await opsClient.listDatabaseTables();
      setTables(data);
      if (data.length > 0 && !activeTable) {
        // Default to step_runs or runs if available
        const defaultTable =
          data.find((t) => t.table === 'step_runs') ||
          data.find((t) => t.table === 'runs') ||
          data[0];
        setActiveTable({ db: defaultTable.db, table: defaultTable.table });
      }
    } catch (err) {
      console.error('Failed to load database tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  // Fetch table data when active table, pagination, or search changes
  const loadTableData = async () => {
    if (!activeTable) return;
    setTableLoading(true);
    try {
      const res = await opsClient.queryDatabaseTable({
        db: activeTable.db,
        table: activeTable.table,
        limit: pageSize,
        offset: pageOffset,
        search: search.trim() || undefined,
        order_by: orderBy || undefined,
        order_dir: orderDir,
      });
      setQueryResult(res);
    } catch (err) {
      console.error('Failed to query database table:', err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (activeTable) {
      loadTableData();
    }
  }, [activeTable, pageOffset, pageSize, orderBy, orderDir]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageOffset(0);
    loadTableData();
  };

  const handleSelectTable = (db: string, table: string) => {
    setActiveTable({ db, table });
    setPageOffset(0);
    setSearch('');
    setOrderBy('');
  };

  const filteredTables = tables.filter((t) => {
    if (selectedDb === 'all') return true;
    return t.db === selectedDb;
  });

  const activeMeta = tables.find(
    (t) => t.db === activeTable?.db && t.table === activeTable?.table
  );

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedModalJson(true);
    setTimeout(() => setCopiedModalJson(false), 2000);
  };

  const totalPages = queryResult ? Math.ceil(queryResult.total / pageSize) : 1;
  const currentPage = Math.floor(pageOffset / pageSize) + 1;

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Database & Datasets Explorer
              <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {tables.length} tables registered
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Query SQLite tables, step execution records, published read models, and EMS catalog datasets.
            </p>
          </div>
        </div>

        {/* Database Filter Switches & Refresh */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setSelectedDb('all')}
              className={`px-2.5 py-1 rounded transition ${
                selectedDb === 'all'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedDb('opsflow')}
              className={`px-2.5 py-1 rounded transition ${
                selectedDb === 'opsflow'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Opsflow Engine DB
            </button>
            <button
              onClick={() => setSelectedDb('ems_sim')}
              className={`px-2.5 py-1 rounded transition ${
                selectedDb === 'ems_sim'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EMS Simulator DB
            </button>
          </div>

          <button
            onClick={() => {
              loadTables();
              loadTableData();
            }}
            disabled={loading || tableLoading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || tableLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Left Tables Sidebar */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 flex items-center justify-between">
            <span>Database Tables</span>
            <span>{filteredTables.length}</span>
          </div>

          <div className="space-y-1 max-h-[750px] overflow-y-auto custom-scrollbar">
            {filteredTables.map((t) => {
              const isSelected = activeTable?.db === t.db && activeTable?.table === t.table;
              return (
                <button
                  key={`${t.db}:${t.table}`}
                  onClick={() => handleSelectTable(t.db, t.table)}
                  className={`w-full text-left p-2.5 rounded-lg border transition text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/40 text-blue-300 font-semibold shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-mono text-xs truncate flex items-center gap-1.5">
                      {t.db === 'opsflow' ? (
                        <Layers className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      ) : (
                        <Server className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{t.table}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-sans truncate">
                      {t.db === 'opsflow' ? 'opsflow.db' : 'ems_simulation.db'}
                    </div>
                  </div>

                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700 flex-shrink-0">
                    {t.row_count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Data Table View */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          {/* Table Header & Search Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-slate-100">
                  {activeTable?.table || 'No table selected'}
                </span>
                <span className="px-2 py-0.2 rounded font-mono text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  {activeTable?.db === 'opsflow' ? 'Core DB' : 'EMS Simulator'}
                </span>
              </div>
              {activeMeta?.description && (
                <div className="text-xs text-slate-400 mt-1">{activeMeta.description}</div>
              )}
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter table rows..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 w-64"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
              </button>
            </form>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto custom-scrollbar border border-slate-800 rounded-lg bg-slate-950">
            {tableLoading ? (
              <div className="p-12 text-center text-slate-500 text-xs">Loading database records...</div>
            ) : !queryResult || queryResult.rows.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                {search ? 'No rows match the search query.' : 'This table is currently empty (0 rows).'}
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-semibold text-slate-400 font-mono">
                  <tr>
                    {queryResult.columns.map((col) => (
                      <th
                        key={col}
                        onClick={() => {
                          if (orderBy === col) {
                            setOrderDir(orderDir === 'asc' ? 'desc' : 'asc');
                          } else {
                            setOrderBy(col);
                            setOrderDir('desc');
                          }
                        }}
                        className="px-3 py-2.5 cursor-pointer hover:text-slate-200 transition whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1">
                          <span>{col}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-600" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                  {queryResult.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/60 transition">
                      {queryResult.columns.map((col) => {
                        const val = row[col];
                        const isJson = val !== null && typeof val === 'object';

                        return (
                          <td key={col} className="px-3 py-2 max-w-xs truncate text-slate-300">
                            {isJson ? (
                              <button
                                onClick={() =>
                                  setActiveJsonModal({
                                    title: `${activeTable?.table} [${col}]`,
                                    data: val,
                                  })
                                }
                                className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 flex items-center gap-1 transition"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View JSON</span>
                              </button>
                            ) : val === null || val === undefined ? (
                              <span className="text-slate-600 italic">null</span>
                            ) : typeof val === 'boolean' ? (
                              <span className={val ? 'text-emerald-400' : 'text-red-400'}>
                                {String(val)}
                              </span>
                            ) : col.includes('status') ? (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                  val === 'success' || val === 'Active'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : val === 'failed'
                                    ? 'bg-red-500/20 text-red-300'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {String(val)}
                              </span>
                            ) : (
                              <span title={String(val)}>{String(val)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {queryResult && queryResult.total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span>
                  Showing {pageOffset + 1}–
                  {Math.min(pageOffset + pageSize, queryResult.total)} of {queryResult.total} records
                </span>
                <span className="text-slate-700">•</span>
                <div className="flex items-center gap-1 font-sans">
                  <span>Page size:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPageOffset(0);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageOffset(Math.max(0, pageOffset - pageSize))}
                  disabled={pageOffset <= 0}
                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-slate-300 flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <span className="font-mono text-slate-400">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setPageOffset(pageOffset + pageSize)}
                  disabled={pageOffset + pageSize >= queryResult.total}
                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-slate-300 flex items-center gap-1 transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. JSON Inspection Modal */}
      {activeJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-3 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-sm text-slate-100 font-mono">
                  {activeJsonModal.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyText(JSON.stringify(activeJsonModal.data, null, 2))}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold flex items-center gap-1 transition"
                >
                  {copiedModalJson ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy JSON</span>
                </button>
                <button
                  onClick={() => setActiveJsonModal(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 max-h-[60vh] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
              {JSON.stringify(activeJsonModal.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

