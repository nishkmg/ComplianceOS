"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gstReturns = exports.gstLiabilityLedger = exports.gstItcLedger = exports.gstCashLedger = exports.statutoryLiabilities = exports.payrollSummary = exports.statutoryConfig = exports.payrollConfig = exports.payslips = exports.payrollAdvances = exports.payrollLines = exports.payrollRuns = exports.employeeSalaryStructures = exports.salaryComponents = exports.taxPreferences = exports.employeeDocuments = exports.employees = exports.productTaxCategories = exports.products = exports.inventoryConfig = exports.warehouseStock = exports.stockMovements = exports.inventoryLayers = exports.ocrScanResults = exports.emailQueue = exports.receivablesSummary = exports.paymentAllocations = exports.payments = exports.invoiceConfig = exports.creditNotes = exports.invoiceView = exports.invoiceLines = exports.invoices = exports.snapshots = exports.eventStore = exports.reportCacheVersions = exports.projectorState = exports.entryNumberCounters = exports.fiscalYears = exports.fySummaries = exports.journalEntryView = exports.accountBalances = exports.narrationCorrections = exports.journalEntryLines = exports.journalEntries = exports.accountCashFlowOverrides = exports.cashFlowDefaultMapping = exports.accountTags = exports.accounts = exports.db = void 0;
exports.fyStatusEnum = exports.cashFlowCategoryEnum = exports.eventTypeEnum = exports.aggregateTypeEnum = exports.jeStatusEnum = exports.referenceTypeEnum = exports.reconciliationAccountEnum = exports.tagEnum = exports.accountSubTypeEnum = exports.accountKindEnum = exports.setByEnum = exports.moduleEnum = exports.roleEnum = exports.gstRegistrationEnum = exports.industryEnum = exports.stateEnum = exports.businessTypeEnum = exports.userTenants = exports.users = exports.tenantModuleConfig = exports.tenants = exports.itrTaxSummaryProjection = exports.itrAdvanceTaxProjection = exports.itrAnnualIncomeProjection = exports.itrFieldMappings = exports.itrSnapshots = exports.itrConfig = exports.selfAssessmentLedger = exports.advanceTaxLedger = exports.itrSchedules = exports.itrReturnLines = exports.itrReturns = exports.gstConfig = exports.gstrTableMappings = exports.gstReturnLines = void 0;
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = __importDefault(require("postgres"));
const schema = __importStar(require("./schema/index"));
const connectionString = process.env.DATABASE_URL;
const client = (0, postgres_1.default)(connectionString);
exports.db = (0, postgres_js_1.drizzle)(client, { schema });
// Re-export schema tables for convenient access
exports.accounts = schema.accounts;
exports.accountTags = schema.accountTags;
exports.cashFlowDefaultMapping = schema.cashFlowDefaultMapping;
exports.accountCashFlowOverrides = schema.accountCashFlowOverrides;
exports.journalEntries = schema.journalEntries;
exports.journalEntryLines = schema.journalEntryLines;
exports.narrationCorrections = schema.narrationCorrections;
exports.accountBalances = schema.accountBalances;
exports.journalEntryView = schema.journalEntryView;
exports.fySummaries = schema.fySummaries;
exports.fiscalYears = schema.fiscalYears;
exports.entryNumberCounters = schema.entryNumberCounters;
exports.projectorState = schema.projectorState;
exports.reportCacheVersions = schema.reportCacheVersions;
exports.eventStore = schema.eventStore;
exports.snapshots = schema.snapshots;
exports.invoices = schema.invoices;
exports.invoiceLines = schema.invoiceLines;
exports.invoiceView = schema.invoiceView;
exports.creditNotes = schema.creditNotes;
exports.invoiceConfig = schema.invoiceConfig;
exports.payments = schema.payments;
exports.paymentAllocations = schema.paymentAllocations;
exports.receivablesSummary = schema.receivablesSummary;
exports.emailQueue = schema.emailQueue;
exports.ocrScanResults = schema.ocrScanResults;
exports.inventoryLayers = schema.inventoryLayers;
exports.stockMovements = schema.stockMovements;
exports.warehouseStock = schema.warehouseStock;
exports.inventoryConfig = schema.inventoryConfig;
exports.products = schema.products;
exports.productTaxCategories = schema.productTaxCategories;
exports.employees = schema.employees;
exports.employeeDocuments = schema.employeeDocuments;
exports.taxPreferences = schema.taxPreferences;
exports.salaryComponents = schema.salaryComponents;
exports.employeeSalaryStructures = schema.employeeSalaryStructures;
exports.payrollRuns = schema.payrollRuns;
exports.payrollLines = schema.payrollLines;
exports.payrollAdvances = schema.payrollAdvances;
exports.payslips = schema.payslips;
exports.payrollConfig = schema.payrollConfig;
exports.statutoryConfig = schema.statutoryConfig;
exports.payrollSummary = schema.payrollSummary;
exports.statutoryLiabilities = schema.statutoryLiabilities;
exports.gstCashLedger = schema.gstCashLedger;
exports.gstItcLedger = schema.gstItcLedger;
exports.gstLiabilityLedger = schema.gstLiabilityLedger;
exports.gstReturns = schema.gstReturns;
exports.gstReturnLines = schema.gstReturnLines;
exports.gstrTableMappings = schema.gstrTableMappings;
exports.gstConfig = schema.gstConfig;
exports.itrReturns = schema.itrReturns;
exports.itrReturnLines = schema.itrReturnLines;
exports.itrSchedules = schema.itrSchedules;
exports.advanceTaxLedger = schema.advanceTaxLedger;
exports.selfAssessmentLedger = schema.selfAssessmentLedger;
exports.itrConfig = schema.itrConfig;
exports.itrSnapshots = schema.itrSnapshots;
exports.itrFieldMappings = schema.itrFieldMappings;
exports.itrAnnualIncomeProjection = schema.itrAnnualIncomeProjection;
exports.itrAdvanceTaxProjection = schema.itrAdvanceTaxProjection;
exports.itrTaxSummaryProjection = schema.itrTaxSummaryProjection;
exports.tenants = schema.tenants;
exports.tenantModuleConfig = schema.tenantModuleConfig;
exports.users = schema.users;
exports.userTenants = schema.userTenants;
// Re-export enums
exports.businessTypeEnum = schema.businessTypeEnum;
exports.stateEnum = schema.stateEnum;
exports.industryEnum = schema.industryEnum;
exports.gstRegistrationEnum = schema.gstRegistrationEnum;
exports.roleEnum = schema.roleEnum;
exports.moduleEnum = schema.moduleEnum;
exports.setByEnum = schema.setByEnum;
exports.accountKindEnum = schema.accountKindEnum;
exports.accountSubTypeEnum = schema.accountSubTypeEnum;
exports.tagEnum = schema.tagEnum;
exports.reconciliationAccountEnum = schema.reconciliationAccountEnum;
exports.referenceTypeEnum = schema.referenceTypeEnum;
exports.jeStatusEnum = schema.jeStatusEnum;
exports.aggregateTypeEnum = schema.aggregateTypeEnum;
exports.eventTypeEnum = schema.eventTypeEnum;
exports.cashFlowCategoryEnum = schema.cashFlowCategoryEnum;
exports.fyStatusEnum = schema.fyStatusEnum;
//# sourceMappingURL=index.js.map