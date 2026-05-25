import { getClusterColor } from '../utils/colors';

interface SidebarProps {
  total: number;
  clusters: (string | number)[];
  selectedCluster: string | number | 'all';
  onClusterChange: (c: string | number | 'all') => void;
  clusterField: string | null;
  clusterCounts: Record<string | number, number>;
}

const NAV_ITEMS = [
  { icon: '🏠', label: 'Главная', active: false },
  { icon: '👥', label: 'Контакты', active: false },
  { icon: '♿', label: 'Получатели ТСР', active: true },
  { icon: '📋', label: 'Заявки', active: false },
  { icon: '📊', label: 'Аналитика', active: false },
  { icon: '🗺️', label: 'Карта', active: false },
  { icon: '⚙️', label: 'Настройки', active: false },
];

export function Sidebar({ total, clusters, selectedCluster, onClusterChange, clusterField, clusterCounts }: SidebarProps) {
  return (
    <aside className="w-60 flex-shrink-0 bg-[#1e2131] flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-bold">ТСР</span>
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-tight">CRM Система</div>
          <div className="text-white/40 text-xs">Управление ТСР</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-3 mb-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all ${
                item.active
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {item.active && (
                <span className="ml-auto bg-blue-400/30 text-blue-200 text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {total}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Cluster filter */}
        {clusterField && clusters.length > 0 && (
          <div className="mt-4 px-3">
            <div className="text-white/30 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
              {clusterField}
            </div>
            <button
              onClick={() => onClusterChange('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg mb-0.5 text-sm transition-all ${
                selectedCluster === 'all'
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/8'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 flex-shrink-0" />
                <span>Все направления</span>
              </span>
              <span className="text-white/30 text-xs">{total}</span>
            </button>
            {clusters.map((cluster) => {
              const color = getClusterColor(cluster);
              return (
                <button
                  key={String(cluster)}
                  onClick={() => onClusterChange(cluster)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg mb-0.5 text-sm transition-all ${
                    selectedCluster === cluster
                      ? 'bg-white/15 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color.dot}`} />
                    <span className="truncate">{String(cluster)}</span>
                  </span>
                  <span className="text-white/30 text-xs flex-shrink-0 ml-1">{clusterCounts[cluster] ?? 0}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          АМ
        </div>
        <div className="min-w-0">
          <div className="text-white text-xs font-medium truncate">Менеджер ТСР</div>
          <div className="text-white/40 text-xs truncate">admin@tsr.ru</div>
        </div>
      </div>
    </aside>
  );
}
