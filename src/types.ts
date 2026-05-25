export interface ClientRecord {
  _id: number;
  [key: string]: unknown;
}

export type ViewMode = 'list' | 'kanban' | 'detail';

export interface FilterState {
  search: string;
  cluster?: string | number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}
