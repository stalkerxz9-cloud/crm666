// Direction/Cluster color mapping for actual data values
const DIRECTION_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Запад': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
  'Север': { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300', dot: 'bg-cyan-500' },
  'Восток': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  'Юг': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-500' },
  'Юго-Запад': { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300', dot: 'bg-violet-500' },
  'Юго-Восток': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  'Не определён': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', dot: 'bg-gray-400' },
  'Не найдено': { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300', dot: 'bg-red-400' },
  'Далеко (>500км)': { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300', dot: 'bg-rose-500' },
};

// Status colors
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Зарезервирован': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-500' },
  'Сформирован': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
  'Активный': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  'Плановая замена': { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300', dot: 'bg-sky-500' },
  'Ремонт': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
};

// Numeric cluster colors (fallback)
const NUM_COLORS = [
  { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-400' },
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300', dot: 'bg-violet-500' },
  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-500' },
  { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300', dot: 'bg-cyan-500' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', dot: 'bg-pink-500' },
  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300', dot: 'bg-teal-500' },
];

const DEFAULT_COLOR = { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', dot: 'bg-gray-400' };

export function getClusterColor(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return DEFAULT_COLOR;
  const str = String(value).trim();
  if (DIRECTION_COLORS[str]) return DIRECTION_COLORS[str];
  if (STATUS_COLORS[str]) return STATUS_COLORS[str];
  const num = parseInt(str, 10);
  if (!isNaN(num)) return NUM_COLORS[num % NUM_COLORS.length];
  // Hash the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  return NUM_COLORS[Math.abs(hash) % NUM_COLORS.length];
}

export function getStatusColor(status: string | null | undefined) {
  if (!status) return DEFAULT_COLOR;
  return STATUS_COLORS[String(status).trim()] ?? DEFAULT_COLOR;
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const words = String(name).trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return '?';
}

// Deterministic gradient based on ID (or text)
export const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
  'from-fuchsia-500 to-violet-600',
  'from-lime-500 to-green-600',
  'from-red-500 to-rose-600',
  'from-indigo-500 to-blue-600',
];

export function getAvatarGradient(id: number): string {
  return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];
}
