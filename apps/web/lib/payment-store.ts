// Session-level store for payments created during this session.

export interface StoredPayment {
  id: string;
  paymentNumber: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  fiscalYear: string;
  status: "recorded" | "voided";
  type: "received" | "paid";
  createdAt: string;
}

let payments: StoredPayment[] = [];

export function addPayment(p: StoredPayment): void {
  payments.push(p);
}

export function getPayments(): StoredPayment[] {
  return payments;
}
