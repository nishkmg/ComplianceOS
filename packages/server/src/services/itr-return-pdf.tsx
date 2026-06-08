import React from "react";
import { renderToBuffer, Document, Page, StyleSheet, View, Text } from "@react-pdf/renderer";
import type { Buffer } from "node:buffer";
import {
  Header,
  Footer,
  SignOffBlock,
  Watermark,
  QRCode,
  BODY_FONT,
  BOLD_FONT,
} from "./pdf-engine";
import { createStorageDriver, BUCKETS } from "../lib/storage";

const ic = (v: string | number | null | undefined): string =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 })
    .format(typeof v === "string" ? parseFloat(v) : (v ?? 0));

const pct = (v: string | number | null | undefined): string =>
  `${typeof v === "string" ? parseFloat(v) : (v ?? 0)}%`;

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 8, fontFamily: BODY_FONT, color: "#1a1a1a" },
  title: { fontSize: 16, fontFamily: BOLD_FONT, textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 9, fontFamily: BODY_FONT, textAlign: "center", color: "#6b7280", marginBottom: 16 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 10, fontFamily: BOLD_FONT, backgroundColor: "#f3f4f6", padding: "4 8", marginBottom: 6, borderBottom: "1 solid #d1d5db" },
  row: { flexDirection: "row", paddingVertical: 3, paddingHorizontal: 8, borderBottom: "0.5 solid #e5e7eb" },
  label: { width: "40%", fontSize: 8, color: "#374151" },
  value: { width: "60%", fontSize: 8, fontFamily: BOLD_FONT, color: "#1a1a1a" },
  table: { marginBottom: 8 },
  tableRow: { flexDirection: "row", paddingVertical: 2, paddingHorizontal: 8, borderBottom: "0.5 solid #e5e7eb" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f9fafb", paddingVertical: 3, paddingHorizontal: 8, borderBottom: "1 solid #d1d5db" },
  tableHeaderCell: { fontSize: 7, fontFamily: BOLD_FONT, color: "#374151" },
  tableCell: { fontSize: 7, color: "#1a1a1a" },
  tableCellRight: { fontSize: 7, textAlign: "right", color: "#1a1a1a" },
  colSno: { width: "8%" },
  colDesc: { width: "42%" },
  colAmount: { width: "25%", textAlign: "right" },
  colRef: { width: "25%", textAlign: "right" },
  totalRow: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 8, borderTop: "1 solid #1a1a1a", marginTop: 4, backgroundColor: "#f9fafb" },
  totalLabel: { width: "50%", fontSize: 8, fontFamily: BOLD_FONT },
  totalValue: { width: "50%", fontSize: 8, fontFamily: BOLD_FONT, textAlign: "right" },
  grid2: { flexDirection: "row", gap: 12 },
  grid2Col: { flex: 1 },
  verificationBox: { marginTop: 24, padding: 12, border: "1 solid #d1d5db", backgroundColor: "#f9fafb" },
  verificationTitle: { fontSize: 10, fontFamily: BOLD_FONT, marginBottom: 8 },
  watermark: { position: "absolute", top: "30%", left: "10%", right: "10%", transform: "rotate(-45)", opacity: 0.08, alignItems: "center" },
  watermarkText: { fontSize: 72, fontFamily: BOLD_FONT, color: "#1a1a1a" },
  stubSection: { marginTop: 32, paddingTop: 16, borderTop: "2 dashed #9ca3af" },
  stubTitle: { fontSize: 10, fontFamily: BOLD_FONT, textAlign: "center", marginBottom: 8 },
});

interface UploadResult { buffer: Buffer; url: string; storagePath: string }

async function uploadPdf(buffer: Buffer, returnId: string): Promise<UploadResult> {
  const storage = createStorageDriver();
  const storagePath = `itr-returns/${returnId}.pdf`;
  await storage.upload(BUCKETS.ITR_RETURNS, storagePath, buffer, "application/pdf");
  const url = await storage.signedUrl(BUCKETS.ITR_RETURNS, storagePath, 604_800);
  return { buffer, url, storagePath };
}

export async function renderAndUploadItrPdf(
  Component: React.FC<any>,
  props: Record<string, unknown>,
  returnId: string,
): Promise<UploadResult> {
  const buffer = await renderToBuffer(
    React.createElement(Component, props),
  );
  return uploadPdf(buffer, returnId);
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export const rupee = ic;

interface TaxpayerInfo {
  name: string;
  pan: string;
  aadhaar?: string;
  dob?: string;
  filingStatus?: string;
  address?: string;
  email?: string;
  phone?: string;
  employerName?: string;
  employerTan?: string;
}

interface ITRFinancialData {
  assessmentYear: string;
  financialYear: string;
  grossTotalIncome: string;
  totalDeductions: string;
  totalIncome: string;
  taxPayable: string;
  surcharge: string;
  cess: string;
  rebate87a: string;
  advanceTaxPaid: string;
  selfAssessmentTax: string;
  tdsTcsCredit: string;
  totalTaxPaid: string;
  balancePayable: string;
  refundDue: string;
}

interface ItrFormProps {
  taxpayer: TaxpayerInfo;
  financial: ITRFinancialData;
  schedules?: Array<{ fieldCode: string; fieldValue: string; description?: string }>;
  scheduleData?: Record<string, Record<string, unknown>>;
  generatedAt?: string;
  status?: string;
}

function BasicInfoSection({ taxpayer }: { taxpayer: TaxpayerInfo }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Part A — Personal Information</Text>
      <View style={s.row}><Text style={s.label}>Name</Text><Text style={s.value}>{taxpayer.name}</Text></View>
      <View style={s.row}><Text style={s.label}>PAN</Text><Text style={s.value}>{taxpayer.pan}</Text></View>
      {taxpayer.aadhaar && <View style={s.row}><Text style={s.label}>Aadhaar</Text><Text style={s.value}>{taxpayer.aadhaar}</Text></View>}
      {taxpayer.dob && <View style={s.row}><Text style={s.label}>Date of Birth</Text><Text style={s.value}>{taxpayer.dob}</Text></View>}
      {taxpayer.filingStatus && <View style={s.row}><Text style={s.label}>Filing Status</Text><Text style={s.value}>{taxpayer.filingStatus}</Text></View>}
      {taxpayer.address && <View style={s.row}><Text style={s.label}>Address</Text><Text style={s.value}>{taxpayer.address}</Text></View>}
      {taxpayer.email && <View style={s.row}><Text style={s.label}>Email</Text><Text style={s.value}>{taxpayer.email}</Text></View>}
      {taxpayer.phone && <View style={s.row}><Text style={s.label}>Phone</Text><Text style={s.value}>{taxpayer.phone}</Text></View>}
    </View>
  );
}

function IncomeComputationSection({ fin, showHeadwise = false }: { fin: ITRFinancialData; showHeadwise?: boolean }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Part B — Computation of Total Income & Tax Liability</Text>
      {showHeadwise && (
        <View>
          <View style={{ flexDirection: "row", paddingHorizontal: 8, paddingVertical: 2, borderBottom: "0.5 solid #e5e7eb" }}>
            <Text style={{ width: "60%", fontSize: 8, color: "#374151" }}>Head of Income</Text>
            <Text style={{ width: "40%", fontSize: 8, fontFamily: BOLD_FONT, textAlign: "right" }}>Amount (₹)</Text>
          </View>
          <View style={{ flexDirection: "row", paddingHorizontal: 8, paddingVertical: 2, borderBottom: "0.5 solid #e5e7eb" }}>
            <Text style={{ width: "60%", fontSize: 8, color: "#374151" }}>Gross Total Income</Text>
            <Text style={{ width: "40%", fontSize: 8, fontFamily: BOLD_FONT, textAlign: "right" }}>{ic(fin.grossTotalIncome)}</Text>
          </View>
          <View style={{ flexDirection: "row", paddingHorizontal: 8, paddingVertical: 2, borderBottom: "0.5 solid #e5e7eb" }}>
            <Text style={{ width: "60%", fontSize: 8, color: "#374151" }}>Less: Deductions (Chapter VI-A)</Text>
            <Text style={{ width: "40%", fontSize: 8, fontFamily: BOLD_FONT, textAlign: "right" }}>{ic(fin.totalDeductions)}</Text>
          </View>
        </View>
      )}
      <View style={s.row}><Text style={s.label}>Total Income</Text><Text style={s.value}>{ic(fin.totalIncome)}</Text></View>
      <View style={s.row}><Text style={s.label}>Tax on Total Income</Text><Text style={s.value}>{ic(fin.taxPayable)}</Text></View>
      <View style={s.row}><Text style={s.label}>Surcharge</Text><Text style={s.value}>{ic(fin.surcharge)}</Text></View>
      <View style={s.row}><Text style={s.label}>Health & Education Cess (4%)</Text><Text style={s.value}>{ic(fin.cess)}</Text></View>
      <View style={s.row}><Text style={s.label}>Rebate under Section 87A</Text><Text style={s.value}>{ic(fin.rebate87a)}</Text></View>
      <View style={[s.row, { backgroundColor: "#f0fdf4" }]}><Text style={s.label}>Net Tax Payable</Text><Text style={s.value}>{ic(fin.taxPayable)}</Text></View>
    </View>
  );
}

function TaxPaidSection({ fin }: { fin: ITRFinancialData }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Tax Paid & Balance</Text>
      <View style={s.row}><Text style={s.label}>Advance Tax</Text><Text style={s.value}>{ic(fin.advanceTaxPaid)}</Text></View>
      <View style={s.row}><Text style={s.label}>Self Assessment Tax</Text><Text style={s.value}>{ic(fin.selfAssessmentTax)}</Text></View>
      <View style={s.row}><Text style={s.label}>TDS/TCS Credit</Text><Text style={s.value}>{ic(fin.tdsTcsCredit)}</Text></View>
      <View style={s.row}><Text style={s.label}>Total Tax Paid</Text><Text style={s.value}>{ic(fin.totalTaxPaid)}</Text></View>
      <View style={s.row}><Text style={s.label}>Balance Payable</Text><Text style={[s.value, { color: "#dc2626" }]}>{ic(fin.balancePayable)}</Text></View>
      <View style={s.row}><Text style={s.label}>Refund Due</Text><Text style={[s.value, { color: "#16a34a" }]}>{ic(fin.refundDue)}</Text></View>
    </View>
  );
}

function VerificationBlock({ taxpayer, place, date }: { taxpayer: TaxpayerInfo; place: string; date: string }) {
  return (
    <View style={s.verificationBox}>
      <Text style={s.verificationTitle}>Verification</Text>
      <Text style={{ fontSize: 7, lineHeight: 1.5, marginBottom: 8 }}>
        I, {taxpayer.name}, son/daughter of ________, solemnly declare that to the best of my knowledge
        and belief, the information given in this return is correct and complete and the amount of tax
        paid is correctly shown in the return.
      </Text>
      <SignOffBlock authorizedSignatory={taxpayer.name} place={place} date={date} designation="Taxpayer" />
      {taxpayer.pan && (
        <View style={{ marginTop: 12, flexDirection: "row", justifyContent: "center" }}>
          <QRCode value={taxpayer.pan} size={48} />
        </View>
      )}
    </View>
  );
}

function ItrVStub({ taxpayer, financial, generatedAt }: { taxpayer: TaxpayerInfo; financial: ITRFinancialData; generatedAt?: string }) {
  const now = generatedAt || formatDate(new Date());
  return (
    <View style={s.stubSection} wrap={false}>
      <Text style={s.stubTitle}>ITR-V — Acknowledgment</Text>
      <Text style={{ fontSize: 7, textAlign: "center", marginBottom: 8, color: "#6b7280" }}>
        {taxpayer.name} | PAN: {taxpayer.pan} | AY: {financial.assessmentYear}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 8 }}>
        <QRCode value={`${taxpayer.pan}|${financial.assessmentYear}|${financial.financialYear}`} size={56} />
      </View>
      <View style={s.row}><Text style={s.label}>Total Income</Text><Text style={s.value}>{ic(financial.totalIncome)}</Text></View>
      <View style={s.row}><Text style={s.label}>Tax Payable</Text><Text style={s.value}>{ic(financial.taxPayable)}</Text></View>
      <View style={s.row}><Text style={s.label}>Status</Text><Text style={s.value}>Filed Electronically</Text></View>
      <View style={s.row}><Text style={s.label}>Date of Filing</Text><Text style={s.value}>{now}</Text></View>
      <View style={{ marginTop: 12 }}>
        <SignOffBlock authorizedSignatory={taxpayer.name} place="" date={now} designation="Taxpayer" />
      </View>
    </View>
  );
}

function ScheduleList({ schedules, title }: { schedules?: Array<{ fieldCode: string; fieldValue: string; description?: string }>; title: string }) {
  if (!schedules?.length) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {schedules.map((sc, i) => (
        <View key={i} style={s.row}>
          <Text style={s.label}>{sc.description || sc.fieldCode}</Text>
          <Text style={s.value}>{sc.fieldValue}</Text>
        </View>
      ))}
    </View>
  );
}

function CapitalGainsSchedule({ schedules }: { schedules?: Array<{ fieldCode: string; fieldValue: string; description?: string }> }) {
  const gains = schedules?.filter(s => s.fieldCode.startsWith("CG_")) ?? [];
  if (!gains.length) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Schedule — Capital Gains</Text>
      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderCell, s.colSno]}>S.No</Text>
        <Text style={[s.tableHeaderCell, s.colDesc]}>Nature</Text>
        <Text style={[s.tableHeaderCell, s.colAmount]}>Amount (₹)</Text>
      </View>
      {gains.map((g, i) => (
        <View key={i} style={s.tableRow}>
          <Text style={[s.tableCell, s.colSno]}>{i + 1}</Text>
          <Text style={[s.tableCell, s.colDesc]}>{g.description || g.fieldCode}</Text>
          <Text style={[s.tableCellRight, s.colAmount]}>{ic(g.fieldValue)}</Text>
        </View>
      ))}
    </View>
  );
}

function HousePropertySchedule({ schedules }: { schedules?: Array<{ fieldCode: string; fieldValue: string; description?: string }> }) {
  const hp = schedules?.filter(s => s.fieldCode.startsWith("HP_")) ?? [];
  if (!hp.length) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Schedule — House Property</Text>
      {hp.map((h, i) => (
        <View key={i} style={s.row}>
          <Text style={s.label}>{h.description || h.fieldCode}</Text>
          <Text style={s.value}>{ic(h.fieldValue)}</Text>
        </View>
      ))}
    </View>
  );
}

function ForeignAssetsSchedule({ scheduleData }: { scheduleData?: Record<string, Record<string, unknown>> }) {
  const fa = scheduleData?.FOREIGN_ASSETS as Record<string, unknown> | undefined;
  if (!fa) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Schedule FA — Foreign Assets</Text>
      {Object.entries(fa).map(([k, v], i) => (
        <View key={i} style={s.row}>
          <Text style={s.label}>{k}</Text>
          <Text style={s.value}>{String(v)}</Text>
        </View>
      ))}
    </View>
  );
}

function BusinessSchedule({ schedules, title = "Schedule — Business / Profession" }: { schedules?: Array<{ fieldCode: string; fieldValue: string; description?: string }>; title?: string }) {
  const bus = schedules?.filter(s => s.fieldCode.startsWith("BUS_") || s.fieldCode.startsWith("PL_")) ?? [];
  if (!bus.length) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {bus.map((b, i) => (
        <View key={i} style={s.row}>
          <Text style={s.label}>{b.description || b.fieldCode}</Text>
          <Text style={s.value}>{ic(b.fieldValue)}</Text>
        </View>
      ))}
    </View>
  );
}

function DepreciationSchedule({ schedules }: { schedules?: Array<{ fieldCode: string; fieldValue: string; description?: string }> }) {
  const dep = schedules?.filter(s => s.fieldCode.startsWith("DEP_")) ?? [];
  if (!dep.length) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Schedule — Depreciation</Text>
      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderCell, s.colSno]}>S.No</Text>
        <Text style={[s.tableHeaderCell, s.colDesc]}>Asset Class</Text>
        <Text style={[s.tableHeaderCell, s.colAmount]}>Amount (₹)</Text>
      </View>
      {dep.map((d, i) => (
        <View key={i} style={s.tableRow}>
          <Text style={[s.tableCell, s.colSno]}>{i + 1}</Text>
          <Text style={[s.tableCell, s.colDesc]}>{d.description || d.fieldCode}</Text>
          <Text style={[s.tableCellRight, s.colAmount]}>{ic(d.fieldValue)}</Text>
        </View>
      ))}
    </View>
  );
}

function PartnerSchedule({ schedules }: { schedules?: Array<{ fieldCode: string; fieldValue: string; description?: string }> }) {
  const partners = schedules?.filter(s => s.fieldCode.startsWith("PARTNER_")) ?? [];
  if (!partners.length) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Schedule — Partners' Capital Accounts</Text>
      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderCell, s.colSno]}>S.No</Text>
        <Text style={[s.tableHeaderCell, s.colDesc]}>Partner</Text>
        <Text style={[s.tableHeaderCell, s.colAmount]}>Capital (₹)</Text>
      </View>
      {partners.map((p, i) => (
        <View key={i} style={s.tableRow}>
          <Text style={[s.tableCell, s.colSno]}>{i + 1}</Text>
          <Text style={[s.tableCell, s.colDesc]}>{p.description || p.fieldCode}</Text>
          <Text style={[s.tableCellRight, s.colAmount]}>{ic(p.fieldValue)}</Text>
        </View>
      ))}
    </View>
  );
}

function BalanceSheetSchedule({ schedules }: { schedules?: Array<{ fieldCode: string; fieldValue: string; description?: string }> }) {
  const bs = schedules?.filter(s => s.fieldCode.startsWith("BS_")) ?? [];
  if (!bs.length) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Schedule — Balance Sheet</Text>
      {bs.map((b, i) => (
        <View key={i} style={s.row}>
          <Text style={s.label}>{b.description || b.fieldCode}</Text>
          <Text style={s.value}>{ic(b.fieldValue)}</Text>
        </View>
      ))}
    </View>
  );
}

function MatSchedule({ schedules }: { schedules?: Array<{ fieldCode: string; fieldValue: string; description?: string }> }) {
  const mat = schedules?.filter(s => s.fieldCode.startsWith("MAT_")) ?? [];
  if (!mat.length) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>MAT Computation (Section 115JB)</Text>
      {mat.map((m, i) => (
        <View key={i} style={s.row}>
          <Text style={s.label}>{m.description || m.fieldCode}</Text>
          <Text style={s.value}>{ic(m.fieldValue)}</Text>
        </View>
      ))}
    </View>
  );
}

function TrustSchedule({ schedules, scheduleData }: { schedules?: Array<{ fieldCode: string; fieldValue: string; description?: string }>; scheduleData?: Record<string, Record<string, unknown>> }) {
  const trust = schedules?.filter(s => s.fieldCode.startsWith("TRUST_")) ?? [];
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Schedule — Trust / Institution Details</Text>
      {trust.map((t, i) => (
        <View key={i} style={s.row}>
          <Text style={s.label}>{t.description || t.fieldCode}</Text>
          <Text style={s.value}>{ic(t.fieldValue)}</Text>
        </View>
      ))}
      {scheduleData?.TRUST_REGISTRATION && (
        <View style={{ marginTop: 4, paddingHorizontal: 8 }}>
          {Object.entries(scheduleData.TRUST_REGISTRATION as Record<string, unknown>).map(([k, v], i) => (
            <View key={i} style={s.row}>
              <Text style={s.label}>{k}</Text>
              <Text style={s.value}>{String(v)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function AccumulationSchedule({ scheduleData }: { scheduleData?: Record<string, Record<string, unknown>> }) {
  const acc = scheduleData?.ACCUMULATION as Record<string, unknown> | undefined;
  if (!acc) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Schedule — Accumulation of Income</Text>
      {Object.entries(acc).map(([k, v], i) => (
        <View key={i} style={s.row}>
          <Text style={s.label}>{k}</Text>
          <Text style={s.value}>{String(v)}</Text>
        </View>
      ))}
    </View>
  );
}

function PresumptiveSchedule({ schedules }: { schedules?: Array<{ fieldCode: string; fieldValue: string; description?: string }> }) {
  const ps = schedules?.filter(s => s.fieldCode.startsWith("PRESUM_")) ?? [];
  if (!ps.length) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Schedule — Presumptive Taxation</Text>
      {ps.map((p, i) => (
        <View key={i} style={s.row}>
          <Text style={s.label}>{p.description || p.fieldCode}</Text>
          <Text style={s.value}>{ic(p.fieldValue)}</Text>
        </View>
      ))}
    </View>
  );
}

function CompanyDetailsSection({ taxpayer }: { taxpayer: TaxpayerInfo }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Part A — Company Details</Text>
      <View style={s.row}><Text style={s.label}>Name</Text><Text style={s.value}>{taxpayer.name}</Text></View>
      <View style={s.row}><Text style={s.label}>PAN</Text><Text style={s.value}>{taxpayer.pan}</Text></View>
      {taxpayer.address && <View style={s.row}><Text style={s.label}>Registered Office</Text><Text style={s.value}>{taxpayer.address}</Text></View>}
      {taxpayer.email && <View style={s.row}><Text style={s.label}>Email</Text><Text style={s.value}>{taxpayer.email}</Text></View>}
    </View>
  );
}

function FirmDetailsSection({ taxpayer }: { taxpayer: TaxpayerInfo }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Part A — Firm / LLP / AOP / BOI Details</Text>
      <View style={s.row}><Text style={s.label}>Name</Text><Text style={s.value}>{taxpayer.name}</Text></View>
      <View style={s.row}><Text style={s.label}>PAN</Text><Text style={s.value}>{taxpayer.pan}</Text></View>
      {taxpayer.address && <View style={s.row}><Text style={s.label}>Address</Text><Text style={s.value}>{taxpayer.address}</Text></View>}
    </View>
  );
}

export const ITR1Document: React.FC<ItrFormProps> = ({ taxpayer, financial, schedules, generatedAt }) => (
  <Document title={`ITR-1 ${taxpayer.pan} ${financial.assessmentYear}`}>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>ITR-1 (SAHAJ)</Text>
      <Text style={s.subtitle}>Return for Individuals having Income from Salary, One House Property & Other Sources</Text>
      <Text style={{ fontSize: 7, textAlign: "center", marginBottom: 12, color: "#6b7280" }}>Assessment Year: {financial.assessmentYear} | Financial Year: {financial.financialYear}</Text>
      <BasicInfoSection taxpayer={taxpayer} />
      {taxpayer.employerName && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Employment Details</Text>
          <View style={s.row}><Text style={s.label}>Employer Name</Text><Text style={s.value}>{taxpayer.employerName}</Text></View>
          {taxpayer.employerTan && <View style={s.row}><Text style={s.label}>Employer TAN</Text><Text style={s.value}>{taxpayer.employerTan}</Text></View>}
        </View>
      )}
      <IncomeComputationSection fin={financial} showHeadwise />
      <HousePropertySchedule schedules={schedules} />
      <TaxPaidSection fin={financial} />
      <VerificationBlock taxpayer={taxpayer} place="" date={formatDate(generatedAt)} />
      <ItrVStub taxpayer={taxpayer} financial={financial} generatedAt={generatedAt} />
    </Page>
  </Document>
);

export const ITR2Document: React.FC<ItrFormProps> = ({ taxpayer, financial, schedules, scheduleData, generatedAt }) => (
  <Document title={`ITR-2 ${taxpayer.pan} ${financial.assessmentYear}`}>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>ITR-2</Text>
      <Text style={s.subtitle}>Return for Individuals & HUFs not having Income from Business or Profession</Text>
      <Text style={{ fontSize: 7, textAlign: "center", marginBottom: 12, color: "#6b7280" }}>Assessment Year: {financial.assessmentYear} | Financial Year: {financial.financialYear}</Text>
      <BasicInfoSection taxpayer={taxpayer} />
      <IncomeComputationSection fin={financial} showHeadwise />
      <CapitalGainsSchedule schedules={schedules} />
      <HousePropertySchedule schedules={schedules} />
      <ScheduleList schedules={schedules?.filter(s => s.fieldCode.startsWith("OS_"))} title="Schedule — Income from Other Sources" />
      <ForeignAssetsSchedule scheduleData={scheduleData} />
      <TaxPaidSection fin={financial} />
      <VerificationBlock taxpayer={taxpayer} place="" date={formatDate(generatedAt)} />
      <ItrVStub taxpayer={taxpayer} financial={financial} generatedAt={generatedAt} />
    </Page>
  </Document>
);

export const ITR3Document: React.FC<ItrFormProps> = ({ taxpayer, financial, schedules, scheduleData, generatedAt }) => (
  <Document title={`ITR-3 ${taxpayer.pan} ${financial.assessmentYear}`}>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>ITR-3</Text>
      <Text style={s.subtitle}>Return for Individuals & HUFs having Income from Business or Profession</Text>
      <Text style={{ fontSize: 7, textAlign: "center", marginBottom: 12, color: "#6b7280" }}>Assessment Year: {financial.assessmentYear} | Financial Year: {financial.financialYear}</Text>
      <BasicInfoSection taxpayer={taxpayer} />
      <IncomeComputationSection fin={financial} showHeadwise />
      <BusinessSchedule schedules={schedules} />
      <DepreciationSchedule schedules={schedules} />
      <BalanceSheetSchedule schedules={schedules} />
      <CapitalGainsSchedule schedules={schedules} />
      <HousePropertySchedule schedules={schedules} />
      <ScheduleList schedules={schedules?.filter(s => s.fieldCode.startsWith("OS_"))} title="Schedule — Other Sources" />
      <ForeignAssetsSchedule scheduleData={scheduleData} />
      <TaxPaidSection fin={financial} />
      <VerificationBlock taxpayer={taxpayer} place="" date={formatDate(generatedAt)} />
      <ItrVStub taxpayer={taxpayer} financial={financial} generatedAt={generatedAt} />
    </Page>
  </Document>
);

export const ITR4Document: React.FC<ItrFormProps> = ({ taxpayer, financial, schedules, generatedAt }) => (
  <Document title={`ITR-4 (SUGAM) ${taxpayer.pan} ${financial.assessmentYear}`}>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>ITR-4 (SUGAM)</Text>
      <Text style={s.subtitle}>Presumptive Income Scheme for Business & Profession</Text>
      <Text style={{ fontSize: 7, textAlign: "center", marginBottom: 12, color: "#6b7280" }}>Assessment Year: {financial.assessmentYear} | Financial Year: {financial.financialYear}</Text>
      <BasicInfoSection taxpayer={taxpayer} />
      <IncomeComputationSection fin={financial} showHeadwise />
      <PresumptiveSchedule schedules={schedules} />
      <HousePropertySchedule schedules={schedules} />
      <ScheduleList schedules={schedules?.filter(s => s.fieldCode.startsWith("OS_"))} title="Schedule — Other Sources" />
      <TaxPaidSection fin={financial} />
      <VerificationBlock taxpayer={taxpayer} place="" date={formatDate(generatedAt)} />
      <ItrVStub taxpayer={taxpayer} financial={financial} generatedAt={generatedAt} />
    </Page>
  </Document>
);

export const ITR5Document: React.FC<ItrFormProps> = ({ taxpayer, financial, schedules, generatedAt }) => (
  <Document title={`ITR-5 ${taxpayer.pan} ${financial.assessmentYear}`}>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>ITR-5</Text>
      <Text style={s.subtitle}>Return for Firms, LLPs, AOPs & BOIs</Text>
      <Text style={{ fontSize: 7, textAlign: "center", marginBottom: 12, color: "#6b7280" }}>Assessment Year: {financial.assessmentYear} | Financial Year: {financial.financialYear}</Text>
      <FirmDetailsSection taxpayer={taxpayer} />
      <IncomeComputationSection fin={financial} showHeadwise />
      <BusinessSchedule schedules={schedules} />
      <DepreciationSchedule schedules={schedules} />
      <BalanceSheetSchedule schedules={schedules} />
      <PartnerSchedule schedules={schedules} />
      <ScheduleList schedules={schedules?.filter(s => s.fieldCode.startsWith("REMUN_"))} title="Schedule — Remuneration to Partners" />
      <TaxPaidSection fin={financial} />
      <VerificationBlock taxpayer={taxpayer} place="" date={formatDate(generatedAt)} />
      <ItrVStub taxpayer={taxpayer} financial={financial} generatedAt={generatedAt} />
    </Page>
  </Document>
);

export const ITR6Document: React.FC<ItrFormProps> = ({ taxpayer, financial, schedules, generatedAt }) => (
  <Document title={`ITR-6 ${taxpayer.pan} ${financial.assessmentYear}`}>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>ITR-6</Text>
      <Text style={s.subtitle}>Return for Companies (Other than claiming exemption under Section 11)</Text>
      <Text style={{ fontSize: 7, textAlign: "center", marginBottom: 12, color: "#6b7280" }}>Assessment Year: {financial.assessmentYear} | Financial Year: {financial.financialYear}</Text>
      <CompanyDetailsSection taxpayer={taxpayer} />
      <IncomeComputationSection fin={financial} showHeadwise />
      <BusinessSchedule schedules={schedules} />
      <DepreciationSchedule schedules={schedules} />
      <BalanceSheetSchedule schedules={schedules} />
      <MatSchedule schedules={schedules} />
      <TaxPaidSection fin={financial} />
      <VerificationBlock taxpayer={taxpayer} place="" date={formatDate(generatedAt)} />
      <ItrVStub taxpayer={taxpayer} financial={financial} generatedAt={generatedAt} />
    </Page>
  </Document>
);

export const ITR7Document: React.FC<ItrFormProps> = ({ taxpayer, financial, schedules, scheduleData, generatedAt }) => (
  <Document title={`ITR-7 ${taxpayer.pan} ${financial.assessmentYear}`}>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>ITR-7</Text>
      <Text style={s.subtitle}>Return for Trusts, Institutions & Political Parties</Text>
      <Text style={{ fontSize: 7, textAlign: "center", marginBottom: 12, color: "#6b7280" }}>Assessment Year: {financial.assessmentYear} | Financial Year: {financial.financialYear}</Text>
      <BasicInfoSection taxpayer={taxpayer} />
      <IncomeComputationSection fin={financial} showHeadwise />
      <TrustSchedule schedules={schedules} scheduleData={scheduleData} />
      <AccumulationSchedule scheduleData={scheduleData} />
      <BusinessSchedule schedules={schedules} title="Schedule — Application of Income" />
      <ScheduleList schedules={schedules?.filter(s => s.fieldCode.startsWith("POLITICAL_"))} title="Schedule — Political Party Contributions" />
      <TaxPaidSection fin={financial} />
      <VerificationBlock taxpayer={taxpayer} place="" date={formatDate(generatedAt)} />
      <ItrVStub taxpayer={taxpayer} financial={financial} generatedAt={generatedAt} />
    </Page>
  </Document>
);

export const ITR_DOCUMENTS: Record<string, React.FC<ItrFormProps>> = {
  "ITR-1": ITR1Document,
  "ITR-2": ITR2Document,
  "ITR-3": ITR3Document,
  "ITR-4": ITR4Document,
  "ITR-5": ITR5Document,
  "ITR-6": ITR6Document,
  "ITR-7": ITR7Document,
};

export type { ItrFormProps, TaxpayerInfo, ITRFinancialData, UploadResult };
