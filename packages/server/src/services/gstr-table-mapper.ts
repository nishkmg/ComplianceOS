// @ts-nocheck
/**
 * GSTR Table Mapper Service
 * Maps internal accounting data to GST portal JSON structures
 * 
 * References:
 * - GSTR-1: Outward supplies
 * - GSTR-2B: ITC statement (auto-drafted)
 * - GSTR-3B: Monthly summary return
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

interface TaxAmount {
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
}

interface InvoiceLine {
  hsnCode: string;
  taxableValue: number;
  tax: TaxAmount;
  rate: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  recipientGstin: string;
  recipientName: string;
  placeOfSupply: string; // State code
  isInterState: boolean;
  invoiceValue: number;
  taxableValue: number;
  tax: TaxAmount;
  lines: InvoiceLine[];
  reverseCharge: boolean;
  documentType: 'invoice' | 'bill_of_supply' | 'delivery_note';
}

interface CreditDebitNote {
  id: string;
  noteNumber: string;
  noteDate: string;
  originalInvoiceNumber: string;
  originalInvoiceDate: string;
  recipientGstin: string;
  recipientName: string;
  placeOfSupply: string;
  isInterState: boolean;
  noteValue: number;
  taxableValue: number;
  tax: TaxAmount;
  reason: string;
}

interface Purchase {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  supplierGstin: string;
  supplierName: string;
  placeOfSupply: string;
  isInterState: boolean;
  invoiceValue: number;
  taxableValue: number;
  tax: TaxAmount;
  lines: InvoiceLine[];
  reverseCharge: boolean;
  importType?: 'goods' | 'services' | null;
}

interface ITCReversal {
  id: string;
  reversalType: 'rule_43' | 'rule_44' | 'section_17_5' | 'other';
  reason: string;
  amount: {
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

function getStateNameFromCode(code: string): string {
  const stateMap: Record<string, string> = {
    '01': 'Jammu and Kashmir',
    '02': 'Himachal Pradesh',
    '03': 'Punjab',
    '04': 'Chandigarh',
    '05': 'Uttarakhand',
    '06': 'Haryana',
    '07': 'Delhi',
    '08': 'Rajasthan',
    '09': 'Uttar Pradesh',
    '10': 'Bihar',
    '11': 'Sikkim',
    '12': 'Arunachal Pradesh',
    '13': 'Nagaland',
    '14': 'Manipur',
    '15': 'Mizoram',
    '16': 'Tripura',
    '17': 'Meghalaya',
    '18': 'Assam',
    '19': 'West Bengal',
    '20': 'Jharkhand',
    '21': 'Odisha',
    '22': 'Chhattisgarh',
    '23': 'Madhya Pradesh',
    '24': 'Gujarat',
    '25': 'Daman and Diu',
    '26': 'Dadra and Nagar Haveli',
    '27': 'Maharashtra',
    '28': 'Andhra Pradesh',
    '29': 'Karnataka',
    '30': 'Goa',
    '31': 'Lakshadweep',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '35': 'Andaman and Nicobar Islands',
    '36': 'Telangana',
    '37': 'Andhra Pradesh (New)',
    '38': 'Ladakh',
  };
  return stateMap[code] || 'Unknown';
}

function isRegisteredPerson(gstin: string | null): boolean {
  if (!gstin) return false;
  // Unregistered persons have specific GSTIN formats or null
  // For exports, GSTIN may be null or marked as URP
  return gstin.length === 15 && !gstin.startsWith('URP');
}

function isExportInvoice(invoice: Invoice | CreditDebitNote): boolean {
  return invoice.placeOfSupply === '96'; // State code for Outside India
}

// ─────────────────────────────────────────────────────────────────────────────
// GSTR-1 Mapper (Outward Supplies)
// ─────────────────────────────────────────────────────────────────────────────

interface GSTR1Result {
  ret_period: {
    month: string;
    year: string;
  };
  gstin: string;
  tables: {
    b2b?: {
      ctin: string;
      pos: string;
      inv: Array<{
        inum: string;
        idt: string;
        val: string;
        pos: string;
        rchrg: 'Y' | 'N';
        inv_typ?: 'R';
        itms: Array<{
          num: number;
          itm_det: {
            txval: string;
            rt: string;
            iamt: string;
            camt: string;
            samt: string;
            csamt: string;
          };
        }>;
      }>;
    }[];
    b2cl?: {
      pos: string;
      inv: Array<{
        inum: string;
        idt: string;
        val: string;
        pos: string;
        rchrg: 'Y' | 'N';
        itms: Array<{
          num: number;
          itm_det: {
            txval: string;
            rt: string;
            iamt: string;
            camt: string;
            samt: string;
            csamt: string;
          };
        }>;
      }>;
    }[];
    b2cs?: {
      pos: string;
      sply_ty: 'INTRA' | 'INTER';
      txval: string;
      iamt: string;
      camt: string;
      samt: string;
      csamt: string;
      rt: string;
    }[];
    cdnr?: {
      ctin: string;
      pos: string;
      nt: Array<{
        nt_num: string;
        nt_dt: string;
        rsn: string;
        val: string;
        pos: string;
        rchrg: 'Y' | 'N';
        ntty: 'C' | 'D';
        itms: Array<{
          num: number;
          itm_det: {
            txval: string;
            rt: string;
            iamt: string;
            camt: string;
            samt: string;
            csamt: string;
          };
        }>;
      }>;
    }[];
    cdnur?: {
      pos: string;
      nt: Array<{
        nt_num: string;
        nt_dt: string;
        rsn: string;
        val: string;
        pos: string;
        rchrg: 'Y' | 'N';
        ntty: 'C' | 'D';
        itms: Array<{
          num: number;
          itm_det: {
            txval: string;
            rt: string;
            iamt: string;
            camt: string;
            samt: string;
            csamt: string;
          };
        }>;
      }>;
    }[];
    exp?: {
      exp_typ: 'WPAY' | 'WOPAY';
      inv: Array<{
        inum: string;
        idt: string;
        val: string;
        port_code: string;
        sbp_code: string;
        itms: Array<{
          num: number;
          itm_det: {
            txval: string;
            rt: string;
            iamt: string;
            camt: string;
            samt: string;
            csamt: string;
          };
        }>;
      }>;
    }[];
  };
}

export function mapToGSTR1(
  invoices: Invoice[],
  creditNotes: CreditDebitNote[],
  debitNotes: CreditDebitNote[],
  periodMonth: string,
  periodYear: string,
  gstin: string = ''
): GSTR1Result {
  const result: GSTR1Result = {
    ret_period: { month: periodMonth, year: periodYear },
    gstin,
    tables: {},
  };

  // ─── Table B2B: B2B Invoices (Registered recipients) ───────────────────────
  const b2bInvoices = invoices.filter(
    (inv) =>
      isRegisteredPerson(inv.recipientGstin) &&
      !isExportInvoice(inv) &&
      inv.invoiceValue <= 250000
  );

  if (b2bInvoices.length > 0) {
    const b2bMap = new Map<string, NonNullable<GSTR1Result['tables']['b2b']>[number]>();

    for (const inv of b2bInvoices) {
      const key = inv.recipientGstin;
      if (!b2bMap.has(key)) {
        b2bMap.set(key, {
          ctin: inv.recipientGstin,
          pos: inv.placeOfSupply,
          inv: [],
        });
      }

      const recipient = b2bMap.get(key)!;
      recipient.inv.push({
        inum: inv.invoiceNumber,
        idt: inv.invoiceDate,
        val: formatCurrency(inv.invoiceValue),
        pos: inv.placeOfSupply,
        rchrg: inv.reverseCharge ? 'Y' : 'N',
        inv_typ: 'R',
        itms: inv.lines.map((line, idx) => ({
          num: idx + 1,
          itm_det: {
            txval: formatCurrency(line.taxableValue),
            rt: line.rate.toString(),
            iamt: formatCurrency(line.tax.igst),
            camt: formatCurrency(line.tax.cgst),
            samt: formatCurrency(line.tax.sgst),
            csamt: formatCurrency(line.tax.cess),
          },
        })),
      });
    }

    result.tables.b2b = Array.from(b2bMap.values());
  }

  // ─── Table B2CL: Large Value B2C (>₹2.5L) ──────────────────────────────────
  const b2clInvoices = invoices.filter(
    (inv) =>
      !isRegisteredPerson(inv.recipientGstin) &&
      !isExportInvoice(inv) &&
      inv.invoiceValue > 250000
  );

  if (b2clInvoices.length > 0) {
    const b2clMap = new Map<string, NonNullable<GSTR1Result['tables']['b2cl']>[number]>();

    for (const inv of b2clInvoices) {
      const key = inv.placeOfSupply;
      if (!b2clMap.has(key)) {
        b2clMap.set(key, {
          pos: inv.placeOfSupply,
          inv: [],
        });
      }

      const posGroup = b2clMap.get(key)!;
      posGroup.inv.push({
        inum: inv.invoiceNumber,
        idt: inv.invoiceDate,
        val: formatCurrency(inv.invoiceValue),
        pos: inv.placeOfSupply,
        rchrg: inv.reverseCharge ? 'Y' : 'N',
        itms: inv.lines.map((line, idx) => ({
          num: idx + 1,
          itm_det: {
            txval: formatCurrency(line.taxableValue),
            rt: line.rate.toString(),
            iamt: formatCurrency(line.tax.igst),
            camt: formatCurrency(line.tax.cgst),
            samt: formatCurrency(line.tax.sgst),
            csamt: formatCurrency(line.tax.cess),
          },
        })),
      });
    }

    result.tables.b2cl = Array.from(b2clMap.values());
  }

  // ─── Table B2CS: Small Value B2C (≤₹2.5L) ──────────────────────────────────
  const b2csInvoices = invoices.filter(
    (inv) =>
      !isRegisteredPerson(inv.recipientGstin) &&
      !isExportInvoice(inv) &&
      inv.invoiceValue <= 250000
  );

  if (b2csInvoices.length > 0) {
    // Aggregate by POS and tax rate
    const b2csMap = new Map<string, NonNullable<GSTR1Result['tables']['b2cs']>[number]>();

    for (const inv of b2csInvoices) {
      for (const line of inv.lines) {
        const key = `${inv.placeOfSupply}-${line.rate}`;
        const splyTy = inv.isInterState ? 'INTER' : 'INTRA';

        if (!b2csMap.has(key)) {
          b2csMap.set(key, {
            pos: inv.placeOfSupply,
            sply_ty: splyTy,
            txval: '0',
            iamt: '0',
            camt: '0',
            samt: '0',
            csamt: '0',
            rt: line.rate.toString(),
          });
        }

        const agg = b2csMap.get(key)!;
        agg.txval = formatCurrency(
          parseFloat(agg.txval) + line.taxableValue
        );
        agg.iamt = formatCurrency(parseFloat(agg.iamt) + line.tax.igst);
        agg.camt = formatCurrency(parseFloat(agg.camt) + line.tax.cgst);
        agg.samt = formatCurrency(parseFloat(agg.samt) + line.tax.sgst);
        agg.csamt = formatCurrency(parseFloat(agg.csamt) + line.tax.cess);
      }
    }

    result.tables.b2cs = Array.from(b2csMap.values());
  }

  // ─── Table CDNR: Credit/Debit Notes to Registered Persons ──────────────────
  const allNotes = [...creditNotes, ...debitNotes];
  const cdnrNotes = allNotes.filter(
    (note) => isRegisteredPerson(note.recipientGstin) && !isExportInvoice(note)
  );

  if (cdnrNotes.length > 0) {
    const cdnrMap = new Map<string, NonNullable<GSTR1Result['tables']['cdnr']>[number]>();

    for (const note of cdnrNotes) {
      const key = note.recipientGstin;
      if (!cdnrMap.has(key)) {
        cdnrMap.set(key, {
          ctin: note.recipientGstin,
          pos: note.placeOfSupply,
          nt: [],
        });
      }

      const recipient = cdnrMap.get(key)!;
      recipient.nt.push({
        nt_num: note.noteNumber,
        nt_dt: note.noteDate,
        rsn: note.reason,
        val: formatCurrency(note.noteValue),
        pos: note.placeOfSupply,
        rchrg: false ? 'Y' : 'N',
        ntty: creditNotes.includes(note as CreditDebitNote) ? 'C' : 'D',
        itms: (note as any).lines?.map((line: any, idx: any) => ({
          num: idx + 1,
          itm_det: {
            txval: formatCurrency(line.taxableValue),
            rt: line.rate.toString(),
            iamt: formatCurrency(line.tax.igst),
            camt: formatCurrency(line.tax.cgst),
            samt: formatCurrency(line.tax.sgst),
            csamt: formatCurrency(line.tax.cess),
          },
        })) || [],
      });
    }

    result.tables.cdnr = Array.from(cdnrMap.values());
  }

  // ─── Table CDNUR: Credit/Debit Notes to Unregistered Persons ───────────────
  const cdnurNotes = allNotes.filter(
    (note) =>
      !isRegisteredPerson(note.recipientGstin) && !isExportInvoice(note)
  );

  if (cdnurNotes.length > 0) {
    const cdnurMap = new Map<string, NonNullable<GSTR1Result['tables']['cdnur']>[number]>();

    for (const note of cdnurNotes) {
      const key = note.placeOfSupply;
      if (!cdnurMap.has(key)) {
        cdnurMap.set(key, {
          pos: note.placeOfSupply,
          nt: [],
        });
      }

      const posGroup = cdnurMap.get(key)!;
      posGroup.nt.push({
        nt_num: note.noteNumber,
        nt_dt: note.noteDate,
        rsn: note.reason,
        val: formatCurrency(note.noteValue),
        pos: note.placeOfSupply,
        rchrg: false ? 'Y' : 'N',
        ntty: creditNotes.includes(note as CreditDebitNote) ? 'C' : 'D',
        itms: (note as any).lines?.map((line: any, idx: any) => ({
          num: idx + 1,
          itm_det: {
            txval: formatCurrency(line.taxableValue),
            rt: line.rate.toString(),
            iamt: formatCurrency(line.tax.igst),
            camt: formatCurrency(line.tax.cgst),
            samt: formatCurrency(line.tax.sgst),
            csamt: formatCurrency(line.tax.cess),
          },
        })) || [],
      });
    }

    result.tables.cdnur = Array.from(cdnurMap.values());
  }

  // ─── Table EXP: Export Invoices ────────────────────────────────────────────
  const exportInvoices = invoices.filter((inv) => isExportInvoice(inv));

  if (exportInvoices.length > 0) {
    const expMap = new Map<string, NonNullable<GSTR1Result['tables']['exp']>[number]>();

    for (const inv of exportInvoices) {
      // WPAY = With Payment of tax, WOPAY = Without Payment of tax (under bond/LUT)
      const expTyp = inv.tax.igst > 0 ? 'WPAY' : 'WOPAY';
      const key = expTyp;

      if (!expMap.has(key)) {
        expMap.set(key, {
          exp_typ: expTyp,
          inv: [],
        });
      }

      const expGroup = expMap.get(key)!;
      expGroup.inv.push({
        inum: inv.invoiceNumber,
        idt: inv.invoiceDate,
        val: formatCurrency(inv.invoiceValue),
        port_code: '', // To be filled from shipping bill
        sbp_code: '', // Shipping bill port code
        itms: inv.lines.map((line, idx) => ({
          num: idx + 1,
          itm_det: {
            txval: formatCurrency(line.taxableValue),
            rt: line.rate.toString(),
            iamt: formatCurrency(line.tax.igst),
            camt: formatCurrency(line.tax.cgst),
            samt: formatCurrency(line.tax.sgst),
            csamt: formatCurrency(line.tax.cess),
          },
        })),
      });
    }

    result.tables.exp = Array.from(expMap.values());
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// GSTR-2B Mapper (ITC Statement - Auto-drafted)
// ─────────────────────────────────────────────────────────────────────────────

interface GSTR2BResult {
  ret_period: {
    month: string;
    year: string;
  };
  gstin: string;
  tables: {
    '3A'?: Array<{
      gstin: string;
      tradeNam: string;
      inv: Array<{
        inum: string;
        idt: string;
        txval: string;
        iamt: string;
        camt: string;
        samt: string;
        csamt: string;
        rt: string;
      }>;
    }>;
    '3B'?: Array<{
      gstin: string;
      tradeNam: string;
      inv: Array<{
        inum: string;
        idt: string;
        txval: string;
        iamt: string;
        camt: string;
        samt: string;
        csamt: string;
        rt: string;
      }>;
    }>;
    '3C'?: Array<{
      gstin: string;
      tradeNam: string;
      inv: Array<{
        inum: string;
        idt: string;
        txval: string;
        iamt: string;
        camt: string;
        samt: string;
        csamt: string;
        rt: string;
      }>;
    }>;
    '4'?: Array<{
      ipt: 'ISD' | 'IMPG' | 'IMPS' | 'SEZ' | 'NXCH' | 'OTH';
      txval: string;
      iamt: string;
      camt: string;
      samt: string;
      csamt: string;
    }>;
    '5'?: Array<{
      doctype: 'B2B' | 'ISD' | 'IMPG' | 'IMPS' | 'CDNR';
      gstin: string;
      tradeNam: string;
      inv: Array<{
        inum: string;
        idt: string;
        txval: string;
        iamt: string;
        camt: string;
        samt: string;
        csamt: string;
        rt: string;
      }>;
    }>;
  };
}

export function mapToGSTR2B(
  purchases: Purchase[],
  imports: Purchase[],
  periodMonth: string,
  periodYear: string,
  gstin: string = ''
): GSTR2BResult {
  const result: GSTR2BResult = {
    ret_period: { month: periodMonth, year: periodYear },
    gstin,
    tables: {},
  };

  // ─── Table 3A: ITC from Goods (Intra-state) ────────────────────────────────
  const intraStateGoods = purchases.filter(
    (p) => !p.isInterState && p.importType === 'goods'
  );

  if (intraStateGoods.length > 0) {
    const table3AMap = new Map<
      string,
      NonNullable<GSTR2BResult['tables']['3A']>[number]
    >();

    for (const purchase of intraStateGoods) {
      const key = purchase.supplierGstin;
      if (!table3AMap.has(key)) {
        table3AMap.set(key, {
          gstin: purchase.supplierGstin,
          tradeNam: purchase.supplierName,
          inv: [],
        });
      }

      const supplier = table3AMap.get(key)!;
      for (const line of purchase.lines) {
        supplier.inv.push({
          inum: purchase.invoiceNumber,
          idt: purchase.invoiceDate,
          txval: formatCurrency(line.taxableValue),
          iamt: formatCurrency(line.tax.igst),
          camt: formatCurrency(line.tax.cgst),
          samt: formatCurrency(line.tax.sgst),
          csamt: formatCurrency(line.tax.cess),
          rt: line.rate.toString(),
        });
      }
    }

    result.tables['3A'] = Array.from(table3AMap.values());
  }

  // ─── Table 3B: ITC from Goods (Inter-state) ────────────────────────────────
  const interStateGoods = purchases.filter(
    (p) => p.isInterState && p.importType === 'goods'
  );

  if (interStateGoods.length > 0) {
    const table3BMap = new Map<
      string,
      NonNullable<GSTR2BResult['tables']['3B']>[number]
    >();

    for (const purchase of interStateGoods) {
      const key = purchase.supplierGstin;
      if (!table3BMap.has(key)) {
        table3BMap.set(key, {
          gstin: purchase.supplierGstin,
          tradeNam: purchase.supplierName,
          inv: [],
        });
      }

      const supplier = table3BMap.get(key)!;
      for (const line of purchase.lines) {
        supplier.inv.push({
          inum: purchase.invoiceNumber,
          idt: purchase.invoiceDate,
          txval: formatCurrency(line.taxableValue),
          iamt: formatCurrency(line.tax.igst),
          camt: formatCurrency(line.tax.cgst),
          samt: formatCurrency(line.tax.sgst),
          csamt: formatCurrency(line.tax.cess),
          rt: line.rate.toString(),
        });
      }
    }

    result.tables['3B'] = Array.from(table3BMap.values());
  }

  // ─── Table 3C: ITC from Services ───────────────────────────────────────────
  const services = purchases.filter((p) => p.importType === 'services');

  if (services.length > 0) {
    const table3CMap = new Map<
      string,
      NonNullable<GSTR2BResult['tables']['3C']>[number]
    >();

    for (const purchase of services) {
      const key = purchase.supplierGstin;
      if (!table3CMap.has(key)) {
        table3CMap.set(key, {
          gstin: purchase.supplierGstin,
          tradeNam: purchase.supplierName,
          inv: [],
        });
      }

      const supplier = table3CMap.get(key)!;
      for (const line of purchase.lines) {
        supplier.inv.push({
          inum: purchase.invoiceNumber,
          idt: purchase.invoiceDate,
          txval: formatCurrency(line.taxableValue),
          iamt: formatCurrency(line.tax.igst),
          camt: formatCurrency(line.tax.cgst),
          samt: formatCurrency(line.tax.sgst),
          csamt: formatCurrency(line.tax.cess),
          rt: line.rate.toString(),
        });
      }
    }

    result.tables['3C'] = Array.from(table3CMap.values());
  }

  // ─── Table 4: ITC Ineligible (Section 17(5)) ───────────────────────────────
  // Marked purchases as ineligible per Section 17(5) blocked credits
  const ineligiblePurchases = purchases.filter(
    (p) =>
      p.lines.some((line) => {
        // Common Section 17(5) scenarios:
        // - Food & beverages, outdoor catering
        // - Beauty treatment, health services
        // - Personal use vehicles
        // - Works contract for construction (except plant & machinery)
        // - Goods for personal use
        const blockedHsn = [
          '996331', // Catering services
          '8703', // Motor vehicles for personal use
        ];
        return blockedHsn.some((hsn) => line.hsnCode.startsWith(hsn));
      })
  );

  if (ineligiblePurchases.length > 0) {
    const table4Map = new Map<string, NonNullable<GSTR2BResult['tables']['4']>[number]>();

    for (const purchase of ineligiblePurchases) {
      // Determine input type
      let ipt: NonNullable<GSTR2BResult['tables']['4']>[number]['ipt'] = 'OTH';
      if (purchase.importType === 'goods' && purchase.isInterState) {
        ipt = 'IMPG';
      } else if (purchase.importType === 'services') {
        ipt = 'IMPS';
      }

      const key = ipt;
      if (!table4Map.has(key)) {
        table4Map.set(key, {
          ipt,
          txval: '0',
          iamt: '0',
          camt: '0',
          samt: '0',
          csamt: '0',
        });
      }

      const agg = table4Map.get(key)!;
      for (const line of purchase.lines) {
        agg.txval = formatCurrency(
          parseFloat(agg.txval) + line.taxableValue
        );
        agg.iamt = formatCurrency(parseFloat(agg.iamt) + line.tax.igst);
        agg.camt = formatCurrency(parseFloat(agg.camt) + line.tax.cgst);
        agg.samt = formatCurrency(parseFloat(agg.samt) + line.tax.sgst);
        agg.csamt = formatCurrency(parseFloat(agg.csamt) + line.tax.cess);
      }
    }

    result.tables['4'] = Array.from(table4Map.values());
  }

  // ─── Table 5: Reverse Charge ───────────────────────────────────────────────
  const reverseChargePurchases = purchases.filter((p) => p.reverseCharge);

  if (reverseChargePurchases.length > 0) {
    const table5Map = new Map<
      string,
      NonNullable<GSTR2BResult['tables']['5']>[number]
    >();

    for (const purchase of reverseChargePurchases) {
      const key = `${purchase.supplierGstin}-B2B`;
      if (!table5Map.has(key)) {
        table5Map.set(key, {
          doctype: 'B2B',
          gstin: purchase.supplierGstin,
          tradeNam: purchase.supplierName,
          inv: [],
        });
      }

      const supplier = table5Map.get(key)!;
      for (const line of purchase.lines) {
        supplier.inv.push({
          inum: purchase.invoiceNumber,
          idt: purchase.invoiceDate,
          txval: formatCurrency(line.taxableValue),
          iamt: formatCurrency(line.tax.igst),
          camt: formatCurrency(line.tax.cgst),
          samt: formatCurrency(line.tax.sgst),
          csamt: formatCurrency(line.tax.cess),
          rt: line.rate.toString(),
        });
      }
    }

    result.tables['5'] = Array.from(table5Map.values());
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// GSTR-3B Mapper (Monthly Summary Return)
// ─────────────────────────────────────────────────────────────────────────────

interface GSTR3BResult {
  ret_period: {
    month: string;
    year: string;
  };
  gstin: string;
  tables: {
    '3.1'?: Array<{
      supply_type: 'outward_supply' | 'reverse_charge';
      tax_rate: string;
      taxable_value: string;
      igst: string;
      cgst: string;
      sgst: string;
      cess: string;
    }>;
    '3.2'?: Array<{
      pos: string;
      place_of_supply_name: string;
      inter_state_supplies: string;
      igst: string;
    }>;
    '4'?: {
      itc_avail: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        total: string;
      };
      itc_reversed: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        total: string;
      };
      net_itc: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        total: string;
      };
    };
    '5'?: Array<{
      reversal_type: 'rule_43' | 'rule_44' | 'section_17_5' | 'other';
      reason: string;
      igst: string;
      cgst: string;
      sgst: string;
      cess: string;
      total: string;
    }>;
    '6.1'?: {
      interest_amount: string;
      interest_rate: string;
    };
    '6.2'?: {
      late_fee_amount: string;
    };
    '6.3'?: {
      penalty_amount: string;
    };
  };
}

export function mapToGSTR3B(
  sales: Invoice[],
  purchases: Purchase[],
  itcReversal: ITCReversal[],
  interest: {
    amount: number;
    rate: number;
    lateFee?: number;
    penalty?: number;
  },
  periodMonth: string,
  periodYear: string,
  gstin: string = ''
): GSTR3BResult {
  const result: GSTR3BResult = {
    ret_period: { month: periodMonth, year: periodYear },
    gstin,
    tables: {},
  };

  // ─── Table 3.1: Outward Supplies (Tax-wise summary) ────────────────────────
  const table31Map = new Map<
    string,
    NonNullable<GSTR3BResult['tables']['3.1']>[number]
  >();

  for (const sale of sales) {
    for (const line of sale.lines) {
      const key = `outward_supply-${line.rate}`;
      if (!table31Map.has(key)) {
        table31Map.set(key, {
          supply_type: 'outward_supply',
          tax_rate: line.rate.toString(),
          taxable_value: '0',
          igst: '0',
          cgst: '0',
          sgst: '0',
          cess: '0',
        });
      }

      const agg = table31Map.get(key)!;
      agg.taxable_value = formatCurrency(
        parseFloat(agg.taxable_value) + line.taxableValue
      );
      agg.igst = formatCurrency(parseFloat(agg.igst) + line.tax.igst);
      agg.cgst = formatCurrency(parseFloat(agg.cgst) + line.tax.cgst);
      agg.sgst = formatCurrency(parseFloat(agg.sgst) + line.tax.sgst);
      agg.cess = formatCurrency(parseFloat(agg.cess) + line.tax.cess);
    }
  }

  // Add reverse charge supplies
  const rcSales = sales.filter((s) => s.reverseCharge);
  for (const sale of rcSales) {
    for (const line of sale.lines) {
      const key = `reverse_charge-${line.rate}`;
      if (!table31Map.has(key)) {
        table31Map.set(key, {
          supply_type: 'reverse_charge',
          tax_rate: line.rate.toString(),
          taxable_value: '0',
          igst: '0',
          cgst: '0',
          sgst: '0',
          cess: '0',
        });
      }

      const agg = table31Map.get(key)!;
      agg.taxable_value = formatCurrency(
        parseFloat(agg.taxable_value) + line.taxableValue
      );
      agg.igst = formatCurrency(parseFloat(agg.igst) + line.tax.igst);
      agg.cgst = formatCurrency(parseFloat(agg.cgst) + line.tax.cgst);
      agg.sgst = formatCurrency(parseFloat(agg.sgst) + line.tax.sgst);
      agg.cess = formatCurrency(parseFloat(agg.cess) + line.tax.cess);
    }
  }

  result.tables['3.1'] = Array.from(table31Map.values());

  // ─── Table 3.2: Inter-state Supplies ───────────────────────────────────────
  const interStateSales = sales.filter((s) => s.isInterState);

  if (interStateSales.length > 0) {
    const table32Map = new Map<
      string,
      NonNullable<GSTR3BResult['tables']['3.2']>[number]
    >();

    for (const sale of interStateSales) {
      const key = sale.placeOfSupply;
      if (!table32Map.has(key)) {
        table32Map.set(key, {
          pos: sale.placeOfSupply,
          place_of_supply_name: getStateNameFromCode(sale.placeOfSupply),
          inter_state_supplies: '0',
          igst: '0',
        });
      }

      const agg = table32Map.get(key)!;
      agg.inter_state_supplies = formatCurrency(
        parseFloat(agg.inter_state_supplies) + sale.taxableValue
      );
      agg.igst = formatCurrency(
        parseFloat(agg.igst) + sale.tax.igst
      );
    }

    result.tables['3.2'] = Array.from(table32Map.values());
  }

  // ─── Table 4: ITC Eligible ─────────────────────────────────────────────────
  const eligiblePurchases = purchases.filter(
    (p) =>
      !p.lines.some((line) => {
        const blockedHsn = ['996331', '8703'];
        return blockedHsn.some((hsn) => line.hsnCode.startsWith(hsn));
      }) && !p.reverseCharge
  );

  let totalIgst = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalCess = 0;

  for (const purchase of eligiblePurchases) {
    for (const line of purchase.lines) {
      totalIgst += line.tax.igst;
      totalCgst += line.tax.cgst;
      totalSgst += line.tax.sgst;
      totalCess += line.tax.cess;
    }
  }

  const itcAvailTotal = totalIgst + totalCgst + totalSgst + totalCess;

  // Calculate ITC reversed
  let reversedIgst = 0;
  let reversedCgst = 0;
  let reversedSgst = 0;
  let reversedCess = 0;

  for (const reversal of itcReversal) {
    reversedIgst += reversal.amount.igst;
    reversedCgst += reversal.amount.cgst;
    reversedSgst += reversal.amount.sgst;
    reversedCess += reversal.amount.cess;
  }

  const itcReversedTotal = reversedIgst + reversedCgst + reversedSgst + reversedCess;
  const netIgst = totalIgst - reversedIgst;
  const netCgst = totalCgst - reversedCgst;
  const netSgst = totalSgst - reversedSgst;
  const netCess = totalCess - reversedCess;
  const netItcTotal = netIgst + netCgst + netSgst + netCess;

  result.tables['4'] = {
    itc_avail: {
      igst: formatCurrency(totalIgst),
      cgst: formatCurrency(totalCgst),
      sgst: formatCurrency(totalSgst),
      cess: formatCurrency(totalCess),
      total: formatCurrency(itcAvailTotal),
    },
    itc_reversed: {
      igst: formatCurrency(reversedIgst),
      cgst: formatCurrency(reversedCgst),
      sgst: formatCurrency(reversedSgst),
      cess: formatCurrency(reversedCess),
      total: formatCurrency(itcReversedTotal),
    },
    net_itc: {
      igst: formatCurrency(netIgst),
      cgst: formatCurrency(netCgst),
      sgst: formatCurrency(netSgst),
      cess: formatCurrency(netCess),
      total: formatCurrency(netItcTotal),
    },
  };

  // ─── Table 5: ITC Reversed ─────────────────────────────────────────────────
  if (itcReversal.length > 0) {
    result.tables['5'] = itcReversal.map((reversal) => ({
      reversal_type: reversal.reversalType,
      reason: reversal.reason,
      igst: formatCurrency(reversal.amount.igst),
      cgst: formatCurrency(reversal.amount.cgst),
      sgst: formatCurrency(reversal.amount.sgst),
      cess: formatCurrency(reversal.amount.cess),
      total: formatCurrency(
        reversal.amount.igst +
          reversal.amount.cgst +
          reversal.amount.sgst +
          reversal.amount.cess
      ),
    }));
  }

  // ─── Table 6.1-6.3: Interest and Late Fees ─────────────────────────────────
  if (interest.amount > 0) {
    result.tables['6.1'] = {
      interest_amount: formatCurrency(interest.amount),
      interest_rate: interest.rate.toString(),
    };
  }

  if (interest.lateFee && interest.lateFee > 0) {
    result.tables['6.2'] = {
      late_fee_amount: formatCurrency(interest.lateFee),
    };
  }

  if (interest.penalty && interest.penalty > 0) {
    result.tables['6.3'] = {
      penalty_amount: formatCurrency(interest.penalty),
    };
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export type {
  Invoice,
  CreditDebitNote,
  Purchase,
  ITCReversal,
  GSTR1Result,
  GSTR2BResult,
  GSTR3BResult,
};
