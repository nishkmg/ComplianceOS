import { describe, it, expect, beforeEach, vi } from "vitest";
import { sendInvoice } from "../commands/send-invoice";
import { generateInvoicePdf } from "../services/pdf-generator";
import { EmailQueueService } from "../services/email-queue";
import { appendEvent } from "../lib/event-store";

// Mock dependencies
vi.mock("../services/pdf-generator", () => ({
  generateInvoicePdf: vi.fn(),
}));

vi.mock("../lib/event-store", () => ({
  appendEvent: vi.fn(),
}));

vi.mock("../services/email-queue", () => ({
  EmailQueueService: vi.fn().mockImplementation(() => ({
    enqueue: vi.fn().mockResolvedValue("email-queue-id"),
  })),
}));

vi.mock("@complianceos/db", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    invoices: { id: "id", tenantId: "tenant_id", status: "status", sentAt: "sent_at", pdfUrl: "pdf_url", invoiceNumber: "invoice_number", date: "date", customerName: "customer_name", customerEmail: "customer_email", customerState: "customer_state", customerAddress: "customer_address", subtotal: "subtotal", cgstTotal: "cgst_total", sgstTotal: "sgst_total", igstTotal: "igst_total", discountTotal: "discount_total", grandTotal: "grandTotal", fiscalYear: "fiscal_year", createdBy: "created_by", updatedAt: "updated_at" },
    invoiceLines: { id: "id", invoiceId: "invoice_id" },
  };
});

describe("sendInvoice command", () => {
  const mockDb = {
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
  };

  const tenantId = "550e8400-e29b-41d4-a716-446655440001";
  const actorId = "550e8400-e29b-41d4-a716-446655440002";
  const invoiceId = "550e8400-e29b-41d4-a716-446655440003";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(appendEvent).mockResolvedValue(undefined);
    vi.mocked(generateInvoicePdf).mockResolvedValue({
      buffer: Buffer.from("fake-pdf"),
      url: "/tmp/invoices/test-invoice.pdf",
    });
    // Reset mock implementation
    mockDb.select.mockClear();
    mockDb.update.mockClear();
  });

  function setupSelectMock(mockInvoice: any, mockLines: any[]) {
    let queryCount = 0;
    mockDb.select.mockImplementation(() => ({
      from: vi.fn((table) => {
        const whereClause = vi.fn().mockImplementation(() => {
          const queryResult: any = {
            limit: vi.fn().mockImplementation(async () => {
              queryCount++;
              // Return empty array if mockInvoice is null (not found case)
              return queryCount === 1 ? (mockInvoice ? [mockInvoice] : []) : mockLines;
            }),
            then: vi.fn((resolve) => {
              queryCount++;
              resolve(queryCount === 1 ? (mockInvoice ? [mockInvoice] : []) : mockLines);
            }),
          };
          return queryResult;
        });
        return { where: whereClause };
      }),
    }));
  }

  it("generates PDF, queues email, and marks invoice as sent", async () => {
    // Mock invoice fetch
    const mockInvoice = {
      id: invoiceId,
      tenantId,
      invoiceNumber: "INV-2026-001",
      date: "2026-04-22",
      dueDate: "2026-05-22",
      customerName: "Test Customer",
      customerEmail: "customer@example.com",
      customerState: "IN-TN",
      customerAddress: "123 Test St",
      status: "draft",
      subtotal: "1000.00",
      cgstTotal: "90.00",
      sgstTotal: "90.00",
      igstTotal: "0.00",
      discountTotal: "0.00",
      grandTotal: "1180.00",
      fiscalYear: "2026-27",
      createdBy: actorId,
    };

    const mockLines = [
      {
        id: "line-1",
        invoiceId,
        accountId: "550e8400-e29b-41d4-a716-446655440004",
        description: "Test Service",
        quantity: "1.00",
        unitPrice: "1000.00",
        amount: "1000.00",
        gstRate: "18.00",
        cgstAmount: "90.00",
        sgstAmount: "90.00",
        igstAmount: "0.00",
        discountPercent: "0.00",
        discountAmount: "0.00",
      },
    ];

    setupSelectMock(mockInvoice, mockLines);

    // Setup update mock
    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue({}),
    });

    const result = await sendInvoice(mockDb as any, tenantId, actorId, invoiceId);

    // Verify PDF generated
    expect(generateInvoicePdf).toHaveBeenCalled();

    // Verify invoice updated
    expect(mockDb.update).toHaveBeenCalled();

    // Verify email queued
    expect(EmailQueueService).toHaveBeenCalled();
    const emailServiceInstance = (EmailQueueService as any).mock.results[0].value;
    expect(emailServiceInstance.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        to: "customer@example.com",
        subject: expect.stringContaining("INV-2026-001"),
        attachments: expect.arrayContaining([
          expect.objectContaining({ filename: "Invoice-INV-2026-001.pdf" }),
        ]),
      }),
    );

    // Verify event appended
    expect(appendEvent).toHaveBeenCalledWith(
      expect.anything(),
      tenantId,
      "invoice",
      invoiceId,
      "invoice_sent",
      expect.objectContaining({
        invoiceId,
        pdfUrl: "/tmp/invoices/test-invoice.pdf",
      }),
      actorId,
    );

    // Verify return value
    expect(result).toEqual({
      invoiceId,
      pdfUrl: "/tmp/invoices/test-invoice.pdf",
      emailQueued: true,
    });
  });

  it("throws error if invoice not found", async () => {
    // Empty invoice array = not found
    setupSelectMock(null, []);

    await expect(
      sendInvoice(mockDb as any, tenantId, actorId, invoiceId),
    ).rejects.toThrow("Invoice not found");
  });

  it("throws error if invoice status is not draft or sent", async () => {
    setupSelectMock({ id: invoiceId, status: "posted" }, []);

    await expect(
      sendInvoice(mockDb as any, tenantId, actorId, invoiceId),
    ).rejects.toThrow(/status must be draft or sent/);
  });

  it("handles invoice without customer email gracefully", async () => {
    const mockInvoice = {
      id: invoiceId,
      tenantId,
      invoiceNumber: "INV-2026-003",
      date: "2026-04-22",
      dueDate: "2026-05-22",
      customerName: "Test Customer",
      customerEmail: null,
      customerState: "IN-TN",
      status: "draft",
      subtotal: "1000.00",
      cgstTotal: "90.00",
      sgstTotal: "90.00",
      igstTotal: "0.00",
      discountTotal: "0.00",
      grandTotal: "1180.00",
      fiscalYear: "2026-27",
      createdBy: actorId,
    };

    const mockLines: any[] = [];

    setupSelectMock(mockInvoice, mockLines);

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue({}),
    });

    const result = await sendInvoice(mockDb as any, tenantId, actorId, invoiceId);
    
    expect(result.pdfUrl).toBeDefined();
    expect(result.emailQueued).toBe(false);
    
    // Email service should not be called when no customer email
    expect(EmailQueueService).not.toHaveBeenCalled();
  });
});
