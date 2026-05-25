import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { loadExcelData } from './utils/excelLoader';
import { findPrimaryField, findClusterField, classifyField } from './utils/fieldClassifier';
import type { ClientRecord } from './types';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ClientCard } from './components/ClientCard';
import { ClientListView } from './components/ClientListView';
import { ClientDetail } from './components/ClientDetail';
import { StatsBar } from './components/StatsBar';

type ViewMode = 'list' | 'kanban';

export default function App() {
  const [records, setRecords] = useState<ClientRecord[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<string | number | 'all'>('all');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 24;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const primaryField = useMemo(() => findPrimaryField(headers), [headers]);
  const clusterField = useMemo(() => findClusterField(headers), [headers]);

  // Auto-load on mount
  useEffect(() => {
    handleLoad();
  }, []);

  // Keyboard shortcuts (added at bottom after declarations)

  async function handleLoad(file?: File) {
    setLoading(true);
    setError(null);
    try {
      let data: { records: ClientRecord[]; headers: string[] };
      if (file) {
        // Load from local file
        const { loadExcelFromBuffer } = await import('./utils/excelLoader') as typeof import('./utils/excelLoader');
        data = await loadExcelFromBuffer(await file.arrayBuffer());
      } else {
        data = await loadExcelData();
      }
      setRecords(data.records);
      setHeaders(data.headers);
      setLoaded(true);
      setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }

  // Clusters list
  const clusters = useMemo(() => {
    if (!clusterField) return [];
    const set = new Set<string | number>();
    records.forEach((r) => {
      const v = r[clusterField];
      if (v !== null && v !== undefined && v !== '') set.add(v as string | number);
    });
    return Array.from(set).sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return String(a).localeCompare(String(b));
    });
  }, [records, clusterField]);

  const clusterCounts = useMemo(() => {
    const counts: Record<string | number, number> = {};
    if (!clusterField) return counts;
    records.forEach((r) => {
      const v = r[clusterField] as string | number;
      if (v !== null && v !== undefined && v !== '') {
        counts[v] = (counts[v] ?? 0) + 1;
      }
    });
    return counts;
  }, [records, clusterField]);

  // Filtered + sorted records
  const filtered = useMemo(() => {
    let result = records;

    // Cluster filter
    if (selectedCluster !== 'all' && clusterField) {
      result = result.filter((r) => String(r[clusterField]) === String(selectedCluster));
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((r) =>
        headers.some((h) => {
          const v = r[h];
          return v !== null && v !== undefined && String(v).toLowerCase().includes(q);
        })
      );
    }

    // Sort
    if (sortBy) {
      const meta = classifyField(sortBy);
      result = [...result].sort((a, b) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        let cmp = 0;
        if (meta.type === 'currency' || meta.type === 'number' || meta.type === 'percent') {
          const an = parseFloat(String(av).replace(/[^\d.-]/g, ''));
          const bn = parseFloat(String(bv).replace(/[^\d.-]/g, ''));
          cmp = (isNaN(an) ? 0 : an) - (isNaN(bn) ? 0 : bn);
        } else {
          cmp = String(av).localeCompare(String(bv), 'ru');
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [records, selectedCluster, clusterField, search, sortBy, sortDir, headers]);

  // Paginated for kanban
  const paginated = useMemo(() => {
    if (viewMode === 'list') return filtered;
    return filtered.slice(0, page * PAGE_SIZE);
  }, [filtered, page, viewMode]);

  const handleSort = useCallback(
    (col: string) => {
      if (sortBy === col) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(col);
        setSortDir('asc');
      }
    },
    [sortBy]
  );

  const selectedRecord = useMemo(
    () => (selectedId !== null ? filtered.find((r) => r._id === selectedId) ?? null : null),
    [selectedId, filtered]
  );

  const selectedIndex = useMemo(
    () => (selectedId !== null ? filtered.findIndex((r) => r._id === selectedId) : -1),
    [selectedId, filtered]
  );

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) setSelectedId(filtered[selectedIndex - 1]._id);
  }, [selectedIndex, filtered]);

  const handleNext = useCallback(() => {
    if (selectedIndex < filtered.length - 1) setSelectedId(filtered[selectedIndex + 1]._id);
  }, [selectedIndex, filtered]);

  // Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200">
            <svg className="w-8 h-8 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-lg font-semibold text-gray-800 mb-2">Загрузка данных...</div>
          <div className="text-sm text-gray-500">Читаем Excel файл с GitHub</div>
          <div className="mt-5 w-48 mx-auto bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Error screen
  if (error && !loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Ошибка загрузки</h2>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => handleLoad()}
              className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Попробовать снова
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Загрузить файл вручную
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleLoad(f);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <Sidebar
        total={records.length}
        clusters={clusters}
        selectedCluster={selectedCluster}
        onClusterChange={(c) => {
          setSelectedCluster(c);
          setPage(1);
        }}
        clusterField={clusterField}
        clusterCounts={clusterCounts}
      />

      {/* Main content */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* TopBar */}
        <TopBar
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          viewMode={viewMode}
          onViewMode={setViewMode}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          headers={headers}
          total={records.length}
          filtered={filtered.length}
          onImport={() => fileInputRef.current?.click()}
        />

        {/* Stats */}
        {loaded && records.length > 0 && (
          <StatsBar records={filtered} headers={headers} clusterField={clusterField} />
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'list' ? (
            <div className="bg-white shadow-sm">
              <ClientListView
                records={filtered}
                headers={headers}
                primaryField={primaryField}
                clusterField={clusterField}
                onRowClick={(id) => setSelectedId(id)}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
              />
            </div>
          ) : (
            <div className="p-6">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <span className="text-5xl mb-4">🔍</span>
                  <p className="text-base font-medium text-gray-500">Клиенты не найдены</p>
                  <p className="text-sm mt-1 text-gray-400">Попробуйте изменить параметры поиска</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginated.map((record) => (
                      <ClientCard
                        key={record._id}
                        record={record}
                        headers={headers}
                        primaryField={primaryField}
                        clusterField={clusterField}
                        onClick={() => setSelectedId(record._id)}
                      />
                    ))}
                  </div>
                  {/* Load more */}
                  {paginated.length < filtered.length && (
                    <div className="mt-6 flex items-center justify-center gap-4">
                      <span className="text-sm text-gray-500">
                        Показано {paginated.length} из {filtered.length}
                      </span>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all shadow-sm"
                      >
                        Показать ещё
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between text-xs text-gray-400">
          <span>CRM Система ТСР • {records.length} получателей загружено из Excel</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            prc_clusters (2).xlsx
          </span>
        </div>
      </div>

      {/* Detail panel */}
      {selectedRecord && (
        <ClientDetail
          record={selectedRecord}
          headers={headers}
          onClose={() => setSelectedId(null)}
          onPrev={handlePrev}
          onNext={handleNext}
          currentIndex={selectedIndex}
          total={filtered.length}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleLoad(f);
        }}
      />
    </div>
  );
}
