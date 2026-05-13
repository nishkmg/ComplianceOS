// Session-level store for invoices created during this session.

export interface StoredInvoiceLine {
  description: string;
  hsn: string;
  qty: number;
  rate: number;
  gstRate: number;
}

export interface StoredInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerAddress: string;
  customerGstin: string;
  date: string;
  dueDate: string;
  fiscalYear: string;
  status: "draft" | "sent" | "paid" | "overdue";
  lines: StoredInvoiceLine[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
}

let invoices: StoredInvoice[] = [];

export function addInvoice(inv: StoredInvoice): void {
  invoices.push(inv);
}

export function getInvoices(): StoredInvoice[] {
  return invoices;
}

export function getInvoice(id: string): StoredInvoice | undefined {
  return invoices.find(inv => inv.id === id);
}

export function updateInvoice(id: string, updates: Partial<StoredInvoice>): StoredInvoice | undefined {
  const idx = invoices.findIndex(inv => inv.id === id);
  if (idx === -1) return undefined;
  invoices[idx] = { ...invoices[idx], ...updates };
  return invoices[idx];
}

export function deleteInvoice(id: string): boolean {
  const idx = invoices.findIndex(inv => inv.id === id);
  if (idx === -1) return false;
  invoices.splice(idx, 1);
  return true;
}
