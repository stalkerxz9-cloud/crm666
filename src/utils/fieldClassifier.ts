export interface FieldMeta {
  key: string;
  label: string;
  group: 'identity' | 'contact' | 'medical' | 'financial' | 'cluster' | 'geo' | 'dates' | 'other';
  icon: string;
  type: 'text' | 'number' | 'currency' | 'percent' | 'date' | 'badge' | 'tag';
  isPrimary?: boolean;
  isCluster?: boolean;
  isSecondaryId?: boolean;
}

// Specific mappings for columns we know about from prc_clusters
const KNOWN_FIELD_MAP: Record<string, Partial<FieldMeta>> = {
  'ФИО': { group: 'identity', icon: '👤', type: 'text', isPrimary: true, label: 'ФИО' },
  'Дата рождения': { group: 'dates', icon: '🎂', type: 'date', label: 'Дата рождения' },
  'Фактический адрес ПУ': { group: 'geo', icon: '📍', type: 'text', label: 'Фактический адрес' },
  'Телефон': { group: 'contact', icon: '📞', type: 'text', label: 'Телефон' },
  'Тип услуг': { group: 'medical', icon: '🔧', type: 'badge', label: 'Тип услуги' },
  'Дата рассмотрения': { group: 'dates', icon: '📅', type: 'date', label: 'Дата рассмотрения' },
  'Категория ТСР': { group: 'medical', icon: '🏷️', type: 'badge', label: 'Категория ТСР' },
  'Вид ТСР': { group: 'medical', icon: '♿', type: 'text', label: 'Вид ТСР' },
  'Кол-во по заявке': { group: 'financial', icon: '📦', type: 'number', label: 'Кол-во по заявке' },
  'Расходы (руб.)': { group: 'financial', icon: '💰', type: 'currency', label: 'Расходы (руб.)' },
  'Обеспечен с': { group: 'dates', icon: '📆', type: 'date', label: 'Обеспечен с' },
  'Сумма по направлениям': { group: 'financial', icon: '💵', type: 'currency', label: 'Сумма по направлениям' },
  'Статус сертификата': { group: 'medical', icon: '📋', type: 'badge', label: 'Статус сертификата' },
  'Сумма компенсации': { group: 'financial', icon: '💳', type: 'currency', label: 'Сумма компенсации' },
  'Кластер': { group: 'cluster', icon: '🎯', type: 'badge', isCluster: true, label: 'Кластер' },
  'Направление': { group: 'geo', icon: '🧭', type: 'badge', label: 'Направление' },
  'Расстояние от базы (км)': { group: 'geo', icon: '📏', type: 'number', label: 'Расстояние от базы' },
  'Метод определения': { group: 'geo', icon: '🔍', type: 'badge', label: 'Метод определения' },
};

// Fallback pattern matching for unknown columns
const PATTERNS: Array<{ pattern: RegExp; meta: Partial<FieldMeta> }> = [
  { pattern: /^(фио|имя|клиент|компания|name|client)/i, meta: { group: 'identity', icon: '👤', type: 'text', isPrimary: true } },
  { pattern: /дата рожд/i, meta: { group: 'dates', icon: '🎂', type: 'date' } },
  { pattern: /адрес/i, meta: { group: 'geo', icon: '📍', type: 'text' } },
  { pattern: /телефон|phone|тел/i, meta: { group: 'contact', icon: '📞', type: 'text' } },
  { pattern: /email|mail/i, meta: { group: 'contact', icon: '✉️', type: 'text' } },
  { pattern: /кластер|cluster/i, meta: { group: 'cluster', icon: '🎯', type: 'badge', isCluster: true } },
  { pattern: /направление|region/i, meta: { group: 'geo', icon: '🧭', type: 'badge' } },
  { pattern: /расстояние|distance|км/i, meta: { group: 'geo', icon: '📏', type: 'number' } },
  { pattern: /статус/i, meta: { group: 'medical', icon: '📋', type: 'badge' } },
  { pattern: /сумма|расходы|компенсация|amount|sum/i, meta: { group: 'financial', icon: '💰', type: 'currency' } },
  { pattern: /кол-?во|количество|qty/i, meta: { group: 'financial', icon: '📦', type: 'number' } },
  { pattern: /дата|date/i, meta: { group: 'dates', icon: '📅', type: 'date' } },
  { pattern: /тср|tcр/i, meta: { group: 'medical', icon: '♿', type: 'text' } },
  { pattern: /тип|вид|категория|метод/i, meta: { group: 'medical', icon: '🏷️', type: 'badge' } },
  { pattern: /руб|rub|\(руб/i, meta: { group: 'financial', icon: '💵', type: 'currency' } },
];

const GROUP_LABELS: Record<FieldMeta['group'], string> = {
  identity: 'Основная информация',
  contact: 'Контактные данные',
  medical: 'Сведения о ТСР',
  financial: 'Финансовые показатели',
  cluster: 'Кластер',
  geo: 'Местоположение',
  dates: 'Даты',
  other: 'Прочее',
};

const GROUP_ORDER: FieldMeta['group'][] = [
  'identity', 'cluster', 'medical', 'contact', 'financial', 'geo', 'dates', 'other',
];

export function classifyField(key: string): FieldMeta {
  // Exact match first
  const known = KNOWN_FIELD_MAP[key];
  if (known) {
    return {
      key,
      label: key,
      group: 'other',
      icon: '📌',
      type: 'text',
      ...known,
    };
  }

  // Pattern match
  for (const { pattern, meta } of PATTERNS) {
    if (pattern.test(key)) {
      return {
        key,
        label: formatLabel(key),
        group: 'other',
        icon: '📌',
        type: 'text',
        ...meta,
      };
    }
  }

  // Numeric-only key or __EMPTY_ (like an unnamed ID column)
  if (/^\d+$/.test(key.trim()) || /^__EMPTY/i.test(key.trim()) || key.trim() === '№' || key.trim() === 'N' || key.trim() === 'No') {
    return { key, label: '№', group: 'identity', icon: '🔢', type: 'number', isSecondaryId: true };
  }

  return { key, label: formatLabel(key), group: 'other', icon: '📌', type: 'text' };
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

export function groupAndSortFields(headers: string[]): { group: string; label: string; fields: FieldMeta[] }[] {
  const metas = headers.filter((h) => h !== '_id').map(classifyField);

  const grouped = GROUP_ORDER.map((groupKey) => ({
    group: groupKey,
    label: GROUP_LABELS[groupKey],
    fields: metas.filter((f) => f.group === groupKey),
  })).filter((g) => g.fields.length > 0);

  // Catch any "other" not matched
  const allGrouped = grouped.flatMap((g) => g.fields.map((f) => f.key));
  const ungrouped = metas.filter((f) => !allGrouped.includes(f.key));
  if (ungrouped.length > 0) {
    grouped.push({ group: 'other', label: GROUP_LABELS['other'], fields: ungrouped });
  }

  return grouped;
}

export function getGroupLabel(group: string): string {
  return GROUP_LABELS[group as FieldMeta['group']] ?? group;
}

export function findPrimaryField(headers: string[]): string | null {
  // First check known primary
  for (const h of headers) {
    const meta = classifyField(h);
    if (meta.isPrimary) return h;
  }
  return headers[0] ?? null;
}

export function findClusterField(headers: string[]): string | null {
  for (const h of headers) {
    const meta = classifyField(h);
    if (meta.isCluster) return h;
  }
  // Fallback: find "Направление"
  for (const h of headers) {
    if (/направление/i.test(h)) return h;
  }
  return null;
}

export function findSecondaryIdField(headers: string[]): string | null {
  for (const h of headers) {
    const meta = classifyField(h);
    if (meta.isSecondaryId) return h;
  }
  return null;
}

// Smart value formatting
export function formatFieldValue(value: unknown, type: FieldMeta['type']): string {
  if (value === null || value === undefined || value === '') return '—';
  const str = String(value).trim();
  if (!str || str === 'null' || str === 'undefined') return '—';

  switch (type) {
    case 'currency': {
      const num = parseFloat(str.replace(/\s/g, '').replace(/[^\d.-]/g, ''));
      if (isNaN(num)) return str;
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      }).format(num);
    }
    case 'percent': {
      const num = parseFloat(str.replace(/[^\d.-]/g, ''));
      if (isNaN(num)) return str;
      if (Math.abs(num) < 1 && !str.includes('%')) return `${(num * 100).toFixed(1)}%`;
      return `${num.toFixed(1)}%`;
    }
    case 'number': {
      const num = parseFloat(str.replace(/\s/g, '').replace(/[^\d.-]/g, ''));
      if (isNaN(num)) return str;
      return new Intl.NumberFormat('ru-RU').format(num);
    }
    default:
      return str;
  }
}
