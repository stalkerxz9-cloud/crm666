import type { ClientRecord } from '../types';
import { formatFieldValue } from '../utils/fieldClassifier';
import { getClusterColor } from '../utils/colors';

interface StatsBarProps {
  records: ClientRecord[];
  headers: string[];
  clusterField: string | null;
}

export function StatsBar({ records, headers, clusterField }: StatsBarProps) {
  const expensesField = headers.find((h) => /расходы/i.test(h));
  const compensationField = headers.find((h) => /компенсации/i.test(h));
  const statusField = headers.find((h) => /статус сертификата/i.test(h));

  // Total expenses
  const totalExpenses = expensesField ? records.reduce((acc, r) => {
    const v = r[expensesField];
    if (!v) return acc;
    const n = parseFloat(String(v).replace(/\s/g, '').replace(/[^\d.-]/g, ''));
    return isNaN(n) ? acc : acc + n;
  }, 0) : null;

  // Total compensation
  const totalComp = compensationField ? records.reduce((acc, r) => {
    const v = r[compensationField];
    if (!v) return acc;
    const n = parseFloat(String(v).replace(/\s/g, '').replace(/[^\d.-]/g, ''));
    return isNaN(n) ? acc : acc + n;
  }, 0) : null;

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  if (statusField) {
    records.forEach((r) => {
      const s = String(r[statusField] ?? '').trim();
      if (s) statusCounts[s] = (statusCounts[s] ?? 0) + 1;
    });
  }

  // Cluster count
  const clusterCount = clusterField
    ? new Set(records.map((r) => r[clusterField as string]).filter(Boolean)).size
    : 0;

  const stats = [
    {
      label: 'Всего получателей',
      value: records.length.toLocaleString('ru-RU'),
      icon: '♿',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    ...(clusterField && clusterCount > 0 ? [{
      label: 'Направлений',
      value: String(clusterCount),
      icon: '🧭',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    }] : []),
    ...(totalExpenses !== null ? [{
      label: 'Расходы (итого)',
      value: formatFieldValue(totalExpenses, 'currency'),
      icon: '💰',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    }] : []),
    ...(totalComp !== null && totalComp > 0 ? [{
      label: 'Компенсация (итого)',
      value: formatFieldValue(totalComp, 'currency'),
      icon: '💳',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    }] : []),
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Main stats */}
      <div className="flex items-stretch divide-x divide-gray-100 overflow-x-auto">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 px-5 py-3 min-w-fit">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center text-lg flex-shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <div className={`text-base font-bold leading-tight ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">{stat.label}</div>
            </div>
          </div>
        ))}

        {/* Status breakdown pills */}
        {Object.keys(statusCounts).length > 0 && (
          <div className="flex items-center gap-2 px-5 py-3 ml-auto flex-shrink-0">
            {Object.entries(statusCounts).map(([status, count]) => {
              const c = getClusterColor(status);
              return (
                <span key={status} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  {status}: {count}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
