// Session-level store for accounts created during this session.
// Survives SPA navigation; resets on full page reload.

export interface StoredAccount {
  id: string;
  code: string;
  name: string;
  kind: string;
  subtype: string;
  description: string;
  createdAt: string;
}

let accounts: StoredAccount[] = [];

export function addAccount(a: StoredAccount): void {
  accounts.push(a);
}

export function getAccounts(): StoredAccount[] {
  return accounts;
}
