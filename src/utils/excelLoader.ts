import * as XLSX from 'xlsx';
import type { ClientRecord } from '../types';

// Try multiple URLs in case of CORS issues
const EXCEL_URLS = [
  'https://raw.githubusercontent.com/stalkerxz9-cloud/crm5/refs/heads/main/prc_clusters%20(2).xlsx',
  'https://github.com/stalkerxz9-cloud/crm5/raw/refs/heads/main/prc_clusters%20(2).xlsx',
];

function parseWorkbook(arrayBuffer: ArrayBuffer): { records: ClientRecord[]; headers: string[] } {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: null,
    raw: false,
    dateNF: 'dd.mm.yyyy',
  });

  if (!rawRows.length) return { records: [], headers: [] };

  const headers = Object.keys(rawRows[0]);
  const records: ClientRecord[] = rawRows.map((row, idx) => ({ _id: idx + 1, ...row }));
  return { records, headers };
}

export async function loadExcelFromBuffer(arrayBuffer: ArrayBuffer): Promise<{ records: ClientRecord[]; headers: string[] }> {
  return parseWorkbook(arrayBuffer);
}

export async function loadExcelData(): Promise<{ records: ClientRecord[]; headers: string[] }> {
  let lastError: Error | null = null;

  for (const url of EXCEL_URLS) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        continue;
      }
      const arrayBuffer = await response.arrayBuffer();
      return parseWorkbook(arrayBuffer);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastError ?? new Error('Не удалось загрузить файл Excel');
}
