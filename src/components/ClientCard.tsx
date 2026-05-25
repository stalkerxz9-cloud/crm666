import type { ClientRecord } from '../types';
import { formatFieldValue, classifyField } from '../utils/fieldClassifier';
import { getClusterColor, getAvatarGradient, getInitials, getStatusColor } from '../utils/colors';

interface ClientCardProps {
  record: ClientRecord;
  headers: string[];
  primaryField: string | null;
  clusterField: string | null;
  onClick: () => void;
}

export function ClientCard({ record, headers, primaryField, clusterField, onClick }: ClientCardProps) {
  // Build display name - use ФИО + numeric ID
  const fio = primaryField ? String(record[primaryField] ?? '') : '';
  // Find numeric ID field
  const numIdField = headers.find((h) => {
    const meta = classifyField(h);
    return meta.isSecondaryId || /^\d+$/.test(h.trim());
  });
  const numId = numIdField ? record[numIdField] : null;
  const displayName = fio || `Получатель #${record._id}`;

  const cluster = clusterField ? record[clusterField] : null;
  const clusterColor = getClusterColor(cluster as string | number | null);
  const gradient = getAvatarGradient(record._id);
  const initials = getInitials(fio);

  // Key fields to show on card
  const addressField = headers.find((h) => /адрес/i.test(h));
  const serviceTypeField = headers.find((h) => /тип услуг/i.test(h));
  const tsrTypeField = headers.find((h) => /вид тср/i.test(h));
  const tsrCatField = headers.find((h) => /категория тср/i.test(h));
  const expensesField = headers.find((h) => /расходы/i.test(h));
  const compensationField = headers.find((h) => /компенсации/i.test(h));
  const statusField = headers.find((h) => /статус сертификата/i.test(h));
  const reviewDateField = headers.find((h) => /дата рассмотрения/i.test(h));
  const directionField = headers.find((h) => /направление/i.test(h));
  const distanceField = headers.find((h) => /расстояние/i.test(h));

  const serviceType = serviceTypeField ? String(record[serviceTypeField] ?? '') : '';
  const tsrType = tsrTypeField ? String(record[tsrTypeField] ?? '') : '';
  const tsrCat = tsrCatField ? record[tsrCatField] : null;
  const expenses = expensesField ? formatFieldValue(record[expensesField], 'currency') : null;
  const compensation = compensationField ? formatFieldValue(record[compensationField], 'currency') : null;
  const status = statusField ? String(record[statusField] ?? '') : '';
  const reviewDate = reviewDateField ? String(record[reviewDateField] ?? '') : '';
  const address = addressField ? String(record[addressField] ?? '') : '';
  const direction = directionField ? String(record[directionField] ?? '') : '';
  const distance = distanceField ? String(record[distanceField] ?? '') : '';

  const statusColor = getStatusColor(status);
  const serviceTypeColor = getClusterColor(serviceType);

  // Shorten address
  const shortAddress = address.length > 60 ? address.slice(0, 57) + '…' : address;
  // Shorten TSR type
  const shortTsrType = tsrType.length > 70 ? tsrType.slice(0, 67) + '…' : tsrType;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group flex flex-col"
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm`}>
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {displayName}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              {numId !== null && numId !== undefined && (
                <span className="text-xs text-gray-400 font-mono">#{String(numId)}</span>
              )}
              {cluster !== null && cluster !== undefined && String(cluster) !== '' && (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${clusterColor.bg} ${clusterColor.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${clusterColor.dot}`} />
                  {String(cluster)}
                </span>
              )}
            </div>
          </div>

          {/* Status badge */}
          {status && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor.bg} ${statusColor.text}`}>
              {status}
            </span>
          )}
        </div>
      </div>

      <div className="mx-4 border-t border-gray-100" />

      {/* Fields */}
      <div className="p-4 pt-3 space-y-2.5 flex-1">
        {/* Service type */}
        {serviceType && (
          <div className="flex items-center gap-2">
            <span className="text-xs">🔧</span>
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-xs text-gray-500 flex-shrink-0">Тип услуги</span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${serviceTypeColor.bg} ${serviceTypeColor.text}`}>
                {serviceType}
              </span>
            </div>
          </div>
        )}

        {/* TSR category */}
        {tsrCat !== null && tsrCat !== undefined && String(tsrCat) !== '' && (
          <div className="flex items-center gap-2">
            <span className="text-xs">🏷️</span>
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-xs text-gray-500 flex-shrink-0">Кат. ТСР</span>
              <span className="text-xs font-semibold text-gray-700">Категория {String(tsrCat)}</span>
            </div>
          </div>
        )}

        {/* TSR type */}
        {shortTsrType && shortTsrType !== '—' && (
          <div className="flex items-start gap-2">
            <span className="text-xs mt-0.5">♿</span>
            <span className="text-xs text-gray-600 leading-snug line-clamp-2">{shortTsrType}</span>
          </div>
        )}

        {/* Address */}
        {shortAddress && shortAddress !== '—' && (
          <div className="flex items-start gap-2">
            <span className="text-xs mt-0.5">📍</span>
            <span className="text-xs text-gray-500 leading-snug line-clamp-2">{shortAddress}</span>
          </div>
        )}

        {/* Review date */}
        {reviewDate && reviewDate !== '—' && (
          <div className="flex items-center gap-2">
            <span className="text-xs">📅</span>
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-xs text-gray-500">Дата рассмотрения</span>
              <span className="text-xs font-medium text-gray-700">{reviewDate}</span>
            </div>
          </div>
        )}

        {/* Direction + Distance */}
        {(direction || distance) && (
          <div className="flex items-center gap-2">
            <span className="text-xs">🧭</span>
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-xs text-gray-500">{direction || '—'}</span>
              {distance && distance !== '0' && distance !== '—' && (
                <span className="text-xs text-gray-600 font-medium">{distance} км</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Financial footer */}
      {(expenses || compensation) && (expenses !== '—' || compensation !== '—') && (
        <>
          <div className="mx-4 border-t border-gray-100" />
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            {expenses && expenses !== '—' && (
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-0.5">Расходы</div>
                <div className="text-sm font-bold text-emerald-600">{expenses}</div>
              </div>
            )}
            {compensation && compensation !== '—' && (
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-0.5">Компенсация</div>
                <div className="text-sm font-bold text-blue-600">{compensation}</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Bottom actions */}
      <div className="px-4 py-2.5 bg-gray-50 rounded-b-xl border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <span>📞</span>
            <span>Звонок</span>
          </button>
          <button
            className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <span>✉️</span>
            <span>Письмо</span>
          </button>
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
          Подробнее →
        </button>
      </div>
    </div>
  );
}
