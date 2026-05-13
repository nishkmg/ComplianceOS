// Session-level store for journal entries created during this session.
// Survives SPA navigation; resets on full page reload.

export interface JournalLine {
  accountName: string;
  accountCode: string;
  debit: number;
  credit: number;
}

export interface StoredEntry {
  id: string;
  entryNumber: string;
  date: string;
  narration: string;
  fiscalYear: string;
  type: string;
  reference: string;
  status: 'draft' | 'posted' | 'voided';
  lines: JournalLine[];
  createdAt: string;
}

let entries: StoredEntry[] = [];
let nextSeqByFy: Record<string, number> = {};

export function getNextSeq(fy: string): number {
  nextSeqByFy[fy] = (nextSeqByFy[fy] || 1) + 1;
  return nextSeqByFy[fy] - 1;
}

export function addEntry(e: StoredEntry): void {
  entries.push(e);
}

export function getEntries(): StoredEntry[] {
  return entries;
}

export function getEntry(id: string): StoredEntry | undefined {
  return entries.find(e => e.id === id);
}

export function updateEntry(id: string, updates: Partial<StoredEntry>): StoredEntry | undefined {
  const idx = entries.findIndex(e => e.id === id);
  if (idx === -1) return undefined;
  entries[idx] = { ...entries[idx], ...updates };
  return entries[idx];
}

export function deleteEntry(id: string): boolean {
  const idx = entries.findIndex(e => e.id === id);
  if (idx === -1) return false;
  entries.splice(idx, 1);
  return true;
}
