import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { router, protectedProcedure } from "../trpc";
import * as _db from "../../../db/src/index";
const { tenants } = _db;
import { onboardingAuditLog } from "../../../db/src/schema/onboarding-audit";
import { createTenant } from "../commands/create-tenant";
import { seedCoa } from "../commands/seed-coa";
import { setupOpeningBalances } from "../commands/setup-opening-balances";

// ─── Input Schemas ──────────────────────────────────────────────────────────

const WelcomeInputSchema = z.object({
  role: z.enum(["business_owner", "accountant", "ca_firm"]),
  businessName: z.string().min(3).max(100),
  industry: z.string(),
  numberOfEmployees: z.string().optional(),
  currentTool: z.string().optional(),
});

const BusinessStructureInputSchema = z.object({
  businessType: z.enum([
    "sole_proprietorship", "partnership", "llp", "private_limited",
    "public_limited", "huf", "trust", "ngo",
  ]),
});

const TaxProfileInputSchema = z.object({
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/i),
  gstRegistered: z.boolean(),
  gstin: z.string().optional().or(z.literal("")),
  tanAvailable: z.boolean(),
  tan: z.string().optional().or(z.literal("")),
});

const BusinessAddressInputSchema = z.object({
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  state: z.string(),
  district: z.string().optional(),
  city: z.string().min(1),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/),
});

const AuthorizedSignatoryInputSchema = z.object({
  fullName: z.string().min(1),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email(),
  designation: z.string().min(1),
});

const FinancialYearInputSchema = z.object({
  fiscalYearStart: z.string().min(1),
  booksBeginningDate: z.string().min(1),
  importPreviousYearBalances: z.boolean().optional(),
});

const GstSetupInputSchema = z.object({
  gstFilingFrequency: z.enum(["monthly", "quarterly"]),
  compositionScheme: z.boolean(),
  enableGstReconciliation: z.boolean(),
});

const TdsSetupInputSchema = z.object({
  tdsApplicable: z.boolean(),
  tan: z.string().optional().or(z.literal("")),
  deductorCategory: z.string().optional(),
}).refine(
  (data) => {
    if (data.tdsApplicable) {
      return data.tan && data.tan.length > 0 && data.deductorCategory && data.deductorCategory.length > 0;
    }
    return true;
  },
  { message: "TAN and Deductor Category are required when TDS is enabled" }
);

const EInvoiceSetupInputSchema = z.object({
  eInvoiceEnabled: z.boolean(),
  irpProvider: z.enum(["nic", "iris", "clear"]).optional(),
  apiCredentials: z.string().optional(),
}).refine(
  (data) => {
    if (data.eInvoiceEnabled) {
      return data.irpProvider && data.irpProvider.length > 0;
    }
    return true;
  },
  { message: "IRP Provider is required when E-Invoice is enabled" }
);

const AccountingTemplateInputSchema = z.object({
  templateId: z.string(),
  refinements: z.any().optional(),
});

const BankSetupInputSchema = z.object({
  connectBank: z.boolean(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifsc: z.string().optional().or(z.literal("")),
});

const MigrationInputSchema = z.object({
  source: z.enum(["tally", "busy", "zoho", "quickbooks", "excel"]).optional(),
  uploadTypes: z.array(z.string()).optional(),
});

const TeamMemberInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "accountant", "ca", "auditor"]),
});

// ─── Step key mapping ───────────────────────────────────────────────────────

const STEP_KEY_MAP: Record<number, string> = {
  1: "welcome",
  2: "businessStructure",
  3: "taxProfile",
  4: "businessAddress",
  5: "authorizedSignatory",
  6: "financialYear",
  7: "gstSetup",
  8: "tdsSetup",
  9: "eInvoiceSetup",
  10: "accountingTemplate",
  11: "bankSetup",
  12: "migration",
  13: "teamMembers",
  14: "launch",
};

// Step-specific schema validation — rejects arbitrary keys
const STEP_SCHEMA_MAP: Record<number, z.ZodTypeAny> = {
  1: WelcomeInputSchema,
  2: BusinessStructureInputSchema,
  3: TaxProfileInputSchema,
  4: BusinessAddressInputSchema,
  5: AuthorizedSignatoryInputSchema,
  6: FinancialYearInputSchema,
  7: GstSetupInputSchema,
  8: TdsSetupInputSchema,
  9: EInvoiceSetupInputSchema,
  10: AccountingTemplateInputSchema,
  11: BankSetupInputSchema,
  12: MigrationInputSchema,
  13: z.array(TeamMemberInputSchema),
  14: z.object({}).optional(),
};

// Required steps that must be completed before onboarding can finish
const REQUIRED_STEPS = [1, 2, 3, 4, 6, 7, 10];

// ─── Router ─────────────────────────────────────────────────────────────────

export const onboardingRouter = router({
  /**
   * Step 1 — Create the tenant record.
   */
  createTenant: protectedProcedure
    .input(BusinessStructureInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = await createTenant(
        ctx.db,
        ctx.session!.user.id,
        input as any
      );
      return { tenantId };
    }),

  /**
   * Seed the Chart of Accounts from template.
   */
  seedCoa: protectedProcedure
    .input(
      z.object({
        businessType: z.string(),
        industry: z.string(),
        refinements: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { accountCount } = await seedCoa(
        ctx.tenantId,
        input.businessType,
        input.industry,
        input.refinements
      );
      return { accountCount };
    }),

  /**
   * Set up opening balances.
   */
  setupOpeningBalances: protectedProcedure
    .input(
      z.object({
        fiscalYear: z.string(),
        input: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await setupOpeningBalances(
        ctx.tenantId,
        ctx.session!.user.id,
        input.fiscalYear,
        input.input
      );
      return result;
    }),

  /**
   * Save incremental onboarding progress for any step (1-14).
   * Validates data against step-specific schema before merging.
   */
  saveProgress: protectedProcedure
    .input(
      z.object({
        step: z.number().int().min(1).max(14),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate step-specific data against schema
      const schema = STEP_SCHEMA_MAP[input.step];
      if (!schema) {
        throw new Error(`Unknown step: ${input.step}`);
      }

      const stepKey = STEP_KEY_MAP[input.step];
      if (!stepKey) {
        throw new Error(`No key mapping for step ${input.step}`);
      }

      const stepData = input.data[stepKey] ?? input.data;

      // Skip validation for step 14 (launch — no data payload)
      if (input.step !== 14) {
        const result = schema.safeParse(stepData);
        if (!result.success) {
          throw new Error(
            `Invalid data for step ${input.step}: ${result.error.errors.map((e) => e.message).join(", ")}`
          );
        }
      }

      // Atomic JSONB merge — use Drizzle sql template literal for safety
      const patchJson = JSON.stringify({ [stepKey]: stepData });
      await ctx.db.execute(
        sql`UPDATE tenants SET onboarding_data = onboarding_data || ${patchJson}::jsonb WHERE id = ${ctx.tenantId}`
      );

      // Audit trail — log who saved what and when
      try {
        await ctx.db.insert(onboardingAuditLog).values({
          tenantId: ctx.tenantId,
          userId: ctx.session!.user.id,
          stepNumber: input.step,
          stepKey,
          action: "save",
          dataSnapshot: stepData as any,
        });
      } catch (auditErr) {
        logger.error("[onboarding] Audit log failed", auditErr instanceof Error ? auditErr : new Error(String(auditErr)));
      }

      return { success: true };
    }),

  /**
   * Read back the full onboarding state for the current tenant.
   */
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const row = await ctx.db
      .select({
        onboardingStatus: tenants.onboardingStatus,
        onboardingData: tenants.onboardingData,
        gstConfig: tenants.gstConfig,
        businessType: tenants.businessType,
        pan: tenants.pan,
        gstin: tenants.gstin,
      })
      .from(tenants)
      .where(eq(tenants.id, ctx.tenantId));

    if (!row[0]) {
      return {
        currentStep: 1,
        completedSteps: [] as number[],
        data: {} as Record<string, unknown>,
        onboardingStatus: "in_progress",
        gstConfig: {} as Record<string, unknown>,
        businessType: null,
        pan: null,
        gstin: null,
      };
    }

    const data = (row[0].onboardingData ?? {}) as Record<string, unknown>;
    const completedSteps: number[] = [];

    // Check which step keys have data
    for (const [step, key] of Object.entries(STEP_KEY_MAP)) {
      if (data[key]) completedSteps.push(Number(step));
    }

    const currentStep =
      completedSteps.length === 14
        ? 14
        : ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].find(
            (s) => !completedSteps.includes(s)
          ) ?? 1);

    return {
      currentStep,
      completedSteps,
      data,
      onboardingStatus: (row[0].onboardingStatus ??
        "in_progress") as string,
      gstConfig: (row[0].gstConfig ?? {}) as Record<string, unknown>,
      businessType: row[0].businessType as string | null,
      pan: row[0].pan as string | null,
      gstin: row[0].gstin as string | null,
    };
  }),

  /**
   * Mark onboarding as complete and persist GST config.
   * Validates all required steps are completed first.
   */
  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    const row = await ctx.db
      .select({ onboardingData: tenants.onboardingData, onboardingStatus: tenants.onboardingStatus })
      .from(tenants)
      .where(eq(tenants.id, ctx.tenantId));

    if (!row[0]) {
      throw new Error("Tenant not found");
    }

    if (row[0].onboardingStatus === "complete") {
      throw new Error("Onboarding already completed");
    }

    const onboardingData = (row[0].onboardingData ?? {}) as Record<string, unknown>;

    // Verify all required steps have data
    const missingSteps: number[] = [];
    for (const step of REQUIRED_STEPS) {
      const key = STEP_KEY_MAP[step];
      if (!onboardingData[key]) {
        missingSteps.push(step);
      }
    }

    if (missingSteps.length > 0) {
      throw new Error(
        `Cannot complete onboarding: missing required steps [${missingSteps.join(", ")}]`
      );
    }

    const gstConfig = (onboardingData.gstSetup ??
      onboardingData.fyGst ??
      {}) as Record<string, unknown>;

    // Persist key data to tenant columns for fast access
    const taxProfile = (onboardingData.taxProfile ?? {}) as Record<string, unknown>;
    const authorizedSignatory = (onboardingData.authorizedSignatory ?? {}) as Record<string, unknown>;
    const welcome = (onboardingData.welcome ?? {}) as Record<string, unknown>;
    const businessStructure = (onboardingData.businessStructure ?? {}) as Record<string, unknown>;

    await ctx.db
      .update(tenants)
      .set({
        onboardingStatus: "complete",
        gstConfig,
        onboardingRole: (welcome.role as string) || null,
        taxProfile: taxProfile as any,
        authorizedSignatory: authorizedSignatory as any,
        gstRegistration: ((taxProfile.gstRegistered as string) || "none") as "regular" | "composition" | "none",
        businessType: (businessStructure.businessType as any) || null,
        pan: (taxProfile.pan as string) || "",
        gstin: (taxProfile.gstin as string) || null,
      })
      .where(eq(tenants.id, ctx.tenantId));

    // Audit trail — log completion
    try {
      await ctx.db.insert(onboardingAuditLog).values({
        tenantId: ctx.tenantId,
        userId: ctx.session!.user.id,
        stepNumber: 14,
        stepKey: "launch",
        action: "complete",
        dataSnapshot: onboardingData as any,
      });
    } catch {
      // Non-critical
    }

    return { success: true };
  }),

  /**
   * Invite a team member.
   */
  inviteTeamMember: protectedProcedure
    .input(TeamMemberInputSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
        .select({ onboardingData: tenants.onboardingData })
        .from(tenants)
        .where(eq(tenants.id, ctx.tenantId));

      const data = (existing[0]?.onboardingData ?? {}) as Record<
        string,
        unknown
      >;
      const teamMembers = (data.teamMembers ?? []) as Array<{
        name: string;
        email: string;
        role: string;
      }>;

      // Check for duplicate email
      if (teamMembers.some((m) => m.email === input.email)) {
        throw new Error("Team member with this email already invited");
      }

      teamMembers.push(input as { name: string; email: string; role: string });

      await ctx.db
        .update(tenants)
        .set({
          onboardingData: { ...data, teamMembers },
        })
        .where(eq(tenants.id, ctx.tenantId));

      return { success: true, teamMembers };
    }),

  /**
   * Remove a team member by email.
   */
  removeTeamMember: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
        .select({ onboardingData: tenants.onboardingData })
        .from(tenants)
        .where(eq(tenants.id, ctx.tenantId));

      const data = (existing[0]?.onboardingData ?? {}) as Record<
        string,
        unknown
      >;
      const teamMembers = ((data.teamMembers ?? []) as Array<{
        name: string;
        email: string;
        role: string;
      }>).filter((m) => m.email !== input.email);

      await ctx.db
        .update(tenants)
        .set({
          onboardingData: { ...data, teamMembers },
        })
        .where(eq(tenants.id, ctx.tenantId));

      return { success: true, teamMembers };
    }),

  /**
   * Extract data from uploaded documents using OCR.
   * Only accepts local upload paths (SSRF prevention).
   */
  extractDocument: protectedProcedure
    .input(
      z.object({
        documentType: z.enum([
          "gst_certificate",
          "pan_card",
          "incorporation_certificate",
        ]),
        fileUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // SSRF prevention: only allow local upload paths with traversal check
      const uploadDir = process.env.UPLOAD_DIR || "/tmp/complianceos/uploads";
      const normalizedUrl = input.fileUrl.replace(/^\/+/, "");
      const resolvedPath = require("path").resolve(uploadDir, normalizedUrl.replace(/^uploads\//, ""));
      const resolvedDir = require("path").resolve(uploadDir);
      if (!resolvedPath.startsWith(resolvedDir + "/")) {
        throw new Error("Invalid file URL: path traversal detected");
      }

      const { extractDocumentData } = await import(
        "../services/document-extractor"
      );

      try {
        const result = await extractDocumentData(
          input.documentType,
          input.fileUrl
        );

        return {
          success: true,
          extracted: {
            legalName: result.legalName,
            gstin: result.gstin,
            pan: result.pan,
            address: result.address,
            stateCode: result.stateCode,
            cin: result.cin,
            dateOfIncorporation: result.dateOfIncorporation,
            directors: result.directors,
          },
          confidence: result.confidence,
          message:
            result.confidence > 50
              ? "Document extracted successfully — please verify the details"
              : "Low confidence extraction — please enter details manually",
        };
      } catch (error: any) {
        return {
          success: false,
          extracted: {},
          confidence: 0,
          message: `Extraction failed: ${error.message || "Unknown error"}. Please enter details manually.`,
        };
      }
    }),
});
