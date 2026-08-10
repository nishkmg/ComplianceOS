import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Mock Tesseract entirely — tests must stay offline and fast.
vi.mock("../services/ocr-processor", () => ({
  processImageOcr: vi.fn(async () => ({ rawText: "SAMPLE OCR TEXT\nTotal: 1000", confidence: 72 })),
}));

import { resolveOcrProvider, processScan, processWithLLM } from "../services/ocr-engine";
import { processImageOcr } from "../services/ocr-processor";

const FAKE_INVOICE_JSON = {
  type: "invoice",
  vendorName: "Acme Supplies Pvt Ltd",
  vendorGstin: "27AABCA1234A1Z5",
  invoiceNumber: "INV-2026-0088",
  invoiceDate: "2026-05-14",
  dueDate: "2026-06-13",
  subtotal: 1000,
  cgstTotal: 90,
  sgstTotal: 90,
  igstTotal: 0,
  total: 1180,
  lineItems: [
    { description: "Widget", quantity: 2, unitPrice: 500, gstRate: 18, cgstAmount: 90, sgstAmount: 90, igstAmount: 0, amount: 1000 },
  ],
  confidence: 95,
};

describe("resolveOcrProvider", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("defaults to tesseract", () => {
    delete process.env.OCR_PROVIDER;
    delete process.env.OCR_LLM_API_KEY;
    expect(resolveOcrProvider()).toBe("tesseract");
  });

  it("uses llm when OCR_PROVIDER=llm and a key is configured", () => {
    process.env.OCR_PROVIDER = "llm";
    process.env.OCR_LLM_API_KEY = "sk-test";
    expect(resolveOcrProvider()).toBe("llm");
  });

  it("falls back to tesseract when OCR_PROVIDER=llm but no key is set", () => {
    process.env.OCR_PROVIDER = "llm";
    delete process.env.OCR_LLM_API_KEY;
    expect(resolveOcrProvider()).toBe("tesseract");
  });
});

describe("processScan provider dispatch", () => {
  const original = { ...process.env };
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ocr-test-"));
    process.env.UPLOAD_DIR = dir;
    mkdirSync(join(dir, "tenant"), { recursive: true });
    writeFileSync(join(dir, "tenant/scan.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    writeFileSync(join(dir, "tenant/scan.pdf"), Buffer.from("%PDF-1.4 test"));
  });

  afterEach(() => {
    process.env = { ...original };
    rmSync(dir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("routes to the tesseract path by default", async () => {
    delete process.env.OCR_PROVIDER;
    delete process.env.OCR_LLM_API_KEY;
    const result = await processScan("/uploads/tenant/scan.png", "invoice");
    expect(result.provider).toBe("tesseract");
    expect(result.parsed.type).toBe("invoice");
    expect(result.parsed.total).toBe(1000);
  });

  it("routes to the llm path when configured", async () => {
    process.env.OCR_PROVIDER = "llm";
    process.env.OCR_LLM_API_KEY = "sk-test";
    process.env.OCR_LLM_BASE_URL = "https://llm.example.com/v1";
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => "",
      json: async () => ({ choices: [{ message: { content: JSON.stringify(FAKE_INVOICE_JSON) } }] }),
    })));

    const result = await processScan("/uploads/tenant/scan.png", "invoice");
    expect(result.provider).toBe("llm");
    expect(result.parsed.type).toBe("invoice");
    if (result.parsed.type !== "invoice") throw new Error("expected invoice");
    expect(result.parsed.total).toBe(1180);
    expect(result.parsed.vendorGstin).toBe("27AABCA1234A1Z5");
    expect(result.parsed.lineItems[0].description).toBe("Widget");
  });
});

describe("processWithLLM", () => {
  const original = { ...process.env };
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ocr-test-"));
    process.env.UPLOAD_DIR = dir;
    process.env.OCR_PROVIDER = "llm";
    process.env.OCR_LLM_API_KEY = "sk-test";
    process.env.OCR_LLM_BASE_URL = "https://llm.example.com/v1";
    mkdirSync(join(dir, "tenant"), { recursive: true });
    writeFileSync(join(dir, "tenant/scan.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    writeFileSync(join(dir, "tenant/scan.pdf"), Buffer.from("%PDF-1.4 test"));
  });

  afterEach(() => {
    process.env = { ...original };
    rmSync(dir, { recursive: true, force: true });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("sends an image_url payload for image files and normalizes the response", async () => {
    let sentBody: any = null;
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: RequestInit) => {
      sentBody = JSON.parse(String(init?.body));
      return {
        ok: true,
        status: 200,
        text: async () => "",
        json: async () => ({ choices: [{ message: { content: JSON.stringify(FAKE_INVOICE_JSON) } }] }),
      };
    }));

    const result = await processWithLLM("/uploads/tenant/scan.png", "invoice");
    expect(sentBody.model).toBe("gpt-4o-mini");
    const userContent = sentBody.messages[1].content;
    expect(userContent.some((c: any) => c.type === "image_url")).toBe(true);
    expect(userContent.some((c: any) => c.type === "image_url" && c.image_url.url.startsWith("data:image/png;base64,"))).toBe(true);
    expect(result.parsed.type).toBe("invoice");
    expect(result.parsed.total).toBe(1180);
    expect(result.confidence).toBe(95);
  });

  it("sends OCR text (not image) for PDFs and parses a receipt", async () => {
    let sentBody: any = null;
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: RequestInit) => {
      sentBody = JSON.parse(String(init?.body));
      return {
        ok: true,
        status: 200,
        text: async () => "",
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                type: "receipt",
                vendorName: "Swiggy",
                receiptDate: "2026-05-01",
                total: 499,
                expenseCategory: "Food",
                confidence: 90,
              }),
            },
          }],
        }),
      };
    }));

    const result = await processWithLLM("/uploads/tenant/scan.pdf", "receipt");
    const userContent = sentBody.messages[1].content;
    expect(userContent.some((c: any) => c.type === "image_url")).toBe(false);
    expect(String(userContent[0].text)).toContain("SAMPLE OCR TEXT");
    expect(processImageOcr).toHaveBeenCalled();
    expect(result.parsed.type).toBe("receipt");
    expect(result.parsed.total).toBe(499);
    expect(result.parsed.vendorName).toBe("Swiggy");
  });

  it("recovers JSON wrapped in markdown fences", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => "",
      json: async () => ({ choices: [{ message: { content: "```json\n" + JSON.stringify(FAKE_INVOICE_JSON) + "\n```" } }] }),
    })));
    const result = await processWithLLM("/uploads/tenant/scan.png", "invoice");
    expect(result.parsed.type).toBe("invoice");
    expect(result.parsed.total).toBe(1180);
  });

  it("throws on malformed JSON", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => "",
      json: async () => ({ choices: [{ message: { content: "not json at all" } }] }),
    })));
    await expect(processWithLLM("/uploads/tenant/scan.png", "invoice")).rejects.toThrow("malformed JSON");
  });

  it("throws on non-ok LLM response with status detail", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false,
      status: 401,
      text: async () => "invalid api key",
      json: async () => ({}),
    })));
    await expect(processWithLLM("/uploads/tenant/scan.png", "invoice")).rejects.toThrow(/401/);
  });

  it("tolerates string amounts and ₹ symbols in the model response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => "",
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              type: "invoice",
              vendorName: "Vendor",
              invoiceNumber: "INV-1",
              invoiceDate: "2026-04-01",
              subtotal: "₹1,000.00",
              cgstTotal: "90",
              sgstTotal: 90,
              igstTotal: "0",
              total: "1,180.00",
              lineItems: [],
              confidence: "88",
            }),
          },
        }],
      }),
    })));
    const result = await processWithLLM("/uploads/tenant/scan.png", "invoice");
    expect(result.parsed.type).toBe("invoice");
    if (result.parsed.type !== "invoice") throw new Error("expected invoice");
    expect(result.parsed.subtotal).toBe(1000);
    expect(result.parsed.total).toBe(1180);
    expect(result.confidence).toBe(88);
  });
});
