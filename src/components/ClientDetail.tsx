import type { ClientRecord } from '../types';
import { groupAndSortFields, formatFieldValue, findPrimaryField, classifyField } from '../utils/fieldClassifier';
import { getAvatarGradient, getInitials, getClusterColor, getStatusColor } from '../utils/colors';

interface ClientDetailProps {
  record: ClientRecord;
  headers: string[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number;
  total: number;
}

export function ClientDetail({ record, headers, onClose, onPrev, onNext, currentIndex, total }: ClientDetailProps) {
  const primaryField = findPrimaryField(headers);
  const fio = primaryField ? String(record[primaryField] ?? `Получатель #${record._id}`) : `Получатель #${record._id}`;
  const gradient = getAvatarGradient(record._id);
  const initials = getInitials(fio);
  const groupedFields = groupAndSortFields(headers);

  // Find cluster/direction field
  const clusterFieldKey = headers.find((h) => /кластер/i.test(h));
  const dirFieldKey = headers.find((h) => /направление/i.test(h));
  const statusFieldKey = headers.find((h) => /статус сертификата/i.test(h));
  const phoneFieldKey = headers.find((h) => /телефон/i.test(h));
  const numIdFieldKey = headers.find((h) => {
    const meta = classifyField(h);
    return meta.isSecondaryId;
  });

  const cluster = clusterFieldKey ? String(record[clusterFieldKey] ?? '') : '';
  const direction = dirFieldKey ? String(record[dirFieldKey] ?? '') : '';
  const status = statusFieldKey ? String(record[statusFieldKey] ?? '') : '';
  const phone = phoneFieldKey ? String(record[phoneFieldKey] ?? '') : '';
  const numId = numIdFieldKey ? String(record[numIdFieldKey] ?? '') : '';

  const clusterColor = getClusterColor(cluster || direction);
  const statusColor = getStatusColor(status);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Side Panel */}
      <div className="w-[700px] max-w-full bg-white flex flex-col h-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          {/* Nav row */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="text-xs text-gray-400">{currentIndex + 1} / {total}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onPrev}
                disabled={currentIndex === 0}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={onNext}
                disabled={currentIndex === total - 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Редактировать
              </button>
              <button className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
                ⋯
              </button>
            </div>
          </div>

          {/* Identity block */}
          <div className="px-5 py-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900">{fio}</h2>
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  {numId && (
                    <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">№ {numId}</span>
                  )}
                  {cluster && (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${clusterColor.bg} ${clusterColor.text} ${clusterColor.border}`}>
                      <span className={`w-2 h-2 rounded-full ${clusterColor.dot}`} />
                      {cluster}
                    </span>
                  )}
                  {status && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`} />
                      {status}
                    </span>
                  )}
                </div>
                {phone && (
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                    <span>📞</span>
                    <a href={`tel:${phone}`} className="hover:text-blue-600 transition-colors">{phone}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {[
                { icon: '📞', label: 'Звонок', color: 'border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100' },
                { icon: '✉️', label: 'Email', color: 'border-violet-200 text-violet-600 bg-violet-50 hover:bg-violet-100' },
                { icon: '📋', label: 'Задача', color: 'border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100' },
                { icon: '📝', label: 'Заметка', color: 'border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100' },
                { icon: '📌', label: 'Пометить', color: 'border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100' },
              ].map(({ icon, label, color }) => (
                <button
                  key={label}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${color}`}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="flex min-h-full">
            {/* Left: Main fields */}
            <div className="flex-1 p-5 space-y-4">
              {groupedFields.map((group) => (
                <div key={group.group} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  {/* Group header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {group.label}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {group.fields.length}
                    </span>
                  </div>

                  {/* Fields */}
                  <div className="divide-y divide-gray-50">
                    {group.fields.map((field) => {
                      const val = record[field.key];
                      const formatted = formatFieldValue(val, field.type);
                      const isEmpty = formatted === '—';

                      return (
                        <div
                          key={field.key}
                          className={`px-4 py-3 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors group/field ${isEmpty ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-start gap-2 w-44 flex-shrink-0">
                            <span className="text-sm mt-0.5">{field.icon}</span>
                            <span className="text-xs text-gray-500 leading-5">{field.label}</span>
                          </div>
                          <div className="flex-1 text-right">
                            {field.type === 'badge' ? (
                              <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${getClusterColor(val as string | number).bg} ${getClusterColor(val as string | number).text}`}>
                                {isEmpty ? '—' : formatted}
                              </span>
                            ) : (
                              <span className={`text-sm leading-snug break-words ${
                                isEmpty ? 'text-gray-300 italic' :
                                field.type === 'currency' ? 'text-emerald-600 font-bold' :
                                field.type === 'number' ? 'text-gray-800 font-medium' :
                                field.group === 'identity' ? 'text-gray-900 font-semibold' :
                                'text-gray-700'
                              }`}>
                                {isEmpty ? 'Не заполнено' : formatted}
                              </span>
                            )}
                          </div>
                          <button className="opacity-0 group-hover/field:opacity-100 p-0.5 text-gray-300 hover:text-blue-500 transition-all flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Right sidebar: Activity & Tags */}
            <div className="w-52 flex-shrink-0 border-l border-gray-200 bg-white p-4">
              {/* Tags */}
              <div className="mb-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Теги</div>
                <div className="flex flex-wrap gap-1.5">
                  {cluster && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${clusterColor.bg} ${clusterColor.text} ${clusterColor.border}`}>
                      {cluster}
                    </span>
                  )}
                  {status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                      {status}
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    Excel
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">История</div>
                <div className="space-y-3">
                  {[
                    { icon: '📥', text: 'Загружено из Excel', time: 'Сейчас', color: 'bg-blue-100 text-blue-600' },
                    { icon: '🎯', text: 'Кластер присвоен', time: 'Сегодня', color: 'bg-violet-100 text-violet-600' },
                    { icon: '✅', text: 'Заявка создана', time: 'Вчера', color: 'bg-emerald-100 text-emerald-600' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`w-6 h-6 rounded-full ${item.color} flex items-center justify-center text-xs flex-shrink-0 mt-0.5`}>
                        {item.icon}
                      </span>
                      <div>
                        <p className="text-xs text-gray-700 leading-tight">{item.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Связи</div>
                <button className="w-full text-left text-xs text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-2 group">
                  <span className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">📋</span>
                  Добавить заявку
                </button>
                <button className="w-full text-left text-xs text-blue-600 hover:text-blue-700 flex items-center gap-2 group">
                  <span className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">📎</span>
                  Прикрепить файл
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
