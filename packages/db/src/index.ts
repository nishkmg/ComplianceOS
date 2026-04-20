import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
export type Database = typeof db;

// Re-export schema tables for convenient access
export const {
  // Enums
  businessTypeEnum,
  stateEnum,
  industryEnum,
  gstRegistrationEnum,
  roleEnum,
  moduleEnum,
  setByEnum,
  accountKindEnum,
  accountSubTypeEnum,
  tagEnum,
  reconciliationAccountEnum,
  referenceTypeEnum,
  jeStatusEnum,
  aggregateTypeEnum,
  eventTypeEnum,
  cashFlowCategoryEnum,
  fyStatusEnum,
  // Tenants
  tenants,
  tenantModuleConfig,
  // Users
  users,
  userTenants,
  // Accounts
  accounts,
  accountTags,
  cashFlowDefaultMapping,
  accountCashFlowOverrides,
  // Journal
  journalEntries,
  journalEntryLines,
  narrationCorrections,
  // Projections
  accountBalances,
  journalEntryView,
  fySummaries,
  // Fiscal Years
  fiscalYears,
  entryNumberCounters,
  // Projector State
  projectorState,
  reportCacheVersions,
  // Events
  eventStore,
  snapshots,
  // Invoices
  invoices,
  invoiceLines,
  invoiceView,
  creditNotes,
  invoiceConfig,
  // Payments
  payments,
  paymentAllocations,
  // Receivables
  receivablesSummary,
} = schema;
