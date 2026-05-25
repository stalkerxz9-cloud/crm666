import type { ClientRecord } from '../types';
import { classifyField, formatFieldValue } from '../utils/fieldClassifier';
import { getAvatarGradient, getInitials, getClusterColor, getStatusColor } from '../utils/colors';

interface ClientListViewProps {
  records: ClientRecord[];
  headers: string[];
  primaryField: string | null;
  clusterField: string | null;
  onRowClick: (id: number) => void;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (col: string) => void;
}

// Smart columns for list view - TSR specific
function getListColumns(headers: string[], primaryField: string | null, clusterField: string | null): string[] {
  const priority = [
    primaryField,
    headers.find((h) => /тип услуг/i.test(h)),
    clusterField,
    headers.find((h) => /статус сертификата/i.test(h)),
    headers.find((h) => /расходы/i.test(h)),
    headers.find((h) => /направление/i.test(h)),
    headers.find((h) => /расстояние/i.test(h)),
    headers.find((h) => /дата рассмотрения/i.test(h)),
    headers.find((h) => /фактический адрес/i.test(h)),
  ];
  const result: string[] = [];
  for (const col of priority) {
    if (col && !result.includes(col)) result.push(col);
    if (result.length >= 8) break;
  }
  return result;
}

export function ClientListView({
  records,
  headers,
  primaryField,
  clusterField,
  onRowClick,
  sortBy,
  sortDir,
  onSort,
}: ClientListViewProps) {
  const visibleHeaders = getListColumns(headers, primaryField, clusterField);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <span className="text-5xl mb-3">🔍</span>
        <p className="text-sm font-medium text-gray-500">Получатели не найдены</p>
        <p className="text-xs mt-1 text-gray-400">Попробуйте изменить параметры поиска</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <th className="w-10 py-3 px-4 text-left">
              <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
            </th>
            <th className="w-10 py-3 px-2 text-left text-xs text-gray-400 font-medium">#</th>
            {visibleHeaders.map((h) => {
              const meta = classifyField(h);
              const isActive = sortBy === h;
              return (
                <th
                  key={h}
                  className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-800 hover:bg-gray-100 whitespace-nowrap select-none transition-colors"
                  onClick={() => onSort(h)}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                    {isActive ? (
                      <span className="text-blue-500 font-bold">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    ) : (
                      <span className="text-gray-300">↕</span>
                    )}
                  </span>
                </th>
              );
            })}
            <th className="py-3 px-4 text-center text-xs text-gray-400 uppercase tracking-wide w-20">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {records.map((record, rowIdx) => {
            const fio = primaryField
              ? String(record[primaryField] ?? `Получатель #${record._id}`)
              : `Получатель #${record._id}`;
            const gradient = getAvatarGradient(record._id);
            const initials = getInitials(fio);
            const clusterVal = clusterField ? record[clusterField] : null;
            const clusterColor = getClusterColor(clusterVal as string | null);

            return (
              <tr
                key={record._id}
                className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                onClick={() => onRowClick(record._id)}
              >
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
                </td>
                <td className="py-3 px-2 text-xs text-gray-400 font-mono">{rowIdx + 1}</td>
                {visibleHeaders.map((h) => {
                  const meta = classifyField(h);
                  const val = record[h];
                  const formatted = formatFieldValue(val, meta.type);
                  const isPrimary = h === primaryField;
                  const isCluster = h === clusterField;
                  const isStatus = /статус сертификата/i.test(h);
                  const isServiceType = /тип услуг/i.test(h);
                  const isCurrency = meta.type === 'currency';
                  const isAddress = /адрес/i.test(h);

                  if (isPrimary) {
                    return (
                      <td key={h} className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-[150px] group-hover:text-blue-600 transition-colors text-sm">
                              {formatted === '—' ? fio : formatted}
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  }

                  if (isCluster) {
                    return (
                      <td key={h} className="py-3 px-4">
                        {formatted !== '—' ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${clusterColor.bg} ${clusterColor.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${clusterColor.dot}`} />
                            {formatted}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                    );
                  }

                  if (isStatus) {
                    const sc = getStatusColor(String(val ?? ''));
                    return (
                      <td key={h} className="py-3 px-4">
                        {formatted !== '—' ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {formatted}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                    );
                  }

                  if (isServiceType) {
                    const sc = getClusterColor(String(val ?? ''));
                    return (
                      <td key={h} className="py-3 px-4">
                        {formatted !== '—' ? (
                          <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                            {formatted}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                    );
                  }

                  if (isCurrency) {
                    return (
                      <td key={h} className="py-3 px-4">
                        <span className="text-emerald-600 font-semibold text-sm">{formatted}</span>
                      </td>
                    );
                  }

                  if (isAddress) {
                    const addr = String(val ?? '');
                    return (
                      <td key={h} className="py-3 px-4 max-w-[200px]">
                        <span className="text-xs text-gray-500 block truncate" title={addr}>
                          {addr.length > 50 ? addr.slice(0, 47) + '…' : addr || '—'}
                        </span>
                      </td>
                    );
                  }

                  return (
                    <td key={h} className="py-3 px-4 max-w-[160px]">
                      <span className={`text-sm block truncate ${formatted === '—' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatted}
                      </span>
                    </td>
                  );
                })}

                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Открыть"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Редактировать"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
