// packages/server/src/services/ocr-engine.ts
//
// Pluggable OCR extraction engine.
//
// Two providers, selected at runtime:
//   - "tesseract" (default): Tesseract.js + regex parser. Offline, free, no keys.
//   - "llm": OpenAI-compatible vision endpoint (OpenAI, Gemini, OpenRouter,
//     local Ollama, …). Structured JSON extraction — far better on arbitrary
//     invoice/receipt layouts. Requires OCR_LLM_API_KEY.
//
// Provider selection: OCR_PROVIDER=llm uses the LLM only when an API key is
// configured; otherwise it falls back to Tesseract so the feature never breaks.
// PDFs are OCR'd with Tesseract first and the raw text is structured by the
// LLM (vision endpoints don't accept PDFs).
import { readFileContent } from "./file-upload";
import { processImageOcr } from "./ocr-processor";
import { parseInvoiceTextResult, parseReceiptTextResult, type ParsedInvoice, type ParsedReceipt } from "./ocr-parser";

export type ScanType = "invoice" | "receipt";
export type OcrProvider = "tesseract" | "llm";

export interface ExtractedScan {
  provider: OcrProvider;
  rawText: string;
  confidence: number;
  parsed: ParsedInvoice | ParsedReceipt;
}

const IMAGE_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export function resolveOcrProvider(): OcrProvider {
  if (process.env.OCR_PROVIDER === "llm") {
    return process.env.OCR_LLM_API_KEY ? "llm" : "tesseract";
  }
  return "tesseract";
}

function llmConfig() {
  return {
    baseUrl: process.env.OCR_LLM_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.OCR_LLM_API_KEY || "",
    model: process.env.OCR_LLM_MODEL || "gpt-4o-mini",
  };
}

const LLM_SYSTEM_PROMPT =
  "You extract structured data from Indian business documents (invoices, receipts, bills). " +
  "Return ONLY a JSON object, no markdown, no commentary. " +
  "Amounts are numbers (no currency symbols, no commas). Dates are ISO YYYY-MM-DD or null. " +
  "GSTIN is the 15-character Indian format or null. " +
  'For lineItems, quantity/unitPrice/gstRate may be 0 when not legible, but description should be the item text. ' +
  "Use your best judgment for fields that are not clearly present — null/0 rather than guesses.";

const LLM_USER_PROMPT = (scanType: ScanType) => `
Extract from the document the following JSON shape:

For "invoice":
{
  "type": "invoice",
  "vendorName": string|null,
  "vendorGstin": string|null,
  "invoiceNumber": string|null,
  "invoiceDate": string|null,
  "dueDate": string|null,
  "subtotal": number,
  "cgstTotal": number,
  "sgstTotal": number,
  "igstTotal": number,
  "total": number,
  "lineItems": [{ "description": string, "quantity": number, "unitPrice": number, "gstRate": number, "cgstAmount": number, "sgstAmount": number, "igstAmount": number, "amount": number }],
  "confidence": number
}

For "receipt":
{
  "type": "receipt",
  "vendorName": string|null,
  "vendorAddress": string|null,
  "vendorGstin": string|null,
  "receiptDate": string|null,
  "total": number,
  "expenseCategory": string|null,
  "confidence": number
}

Extraction type: ${scanType}
`;

interface LlmMessageContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

async function callLlm(messages: Array<{ role: "system" | "user"; content: LlmMessageContent[] | string }>): Promise<unknown> {
  const { baseUrl, apiKey, model } = llmConfig();
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`LLM OCR failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const data = await response.json().catch(() => null) as { choices?: Array<{ message?: { content?: string } }> } | null;
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("LLM OCR returned no content");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Some providers wrap JSON in markdown fences despite json_object
    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!fenced) throw new Error("LLM OCR returned malformed JSON");
    parsed = JSON.parse(fenced[1]);
  }
  return parsed;
}

function toNum(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function toStr(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function toDate(v: unknown): string | null {
  const s = toStr(v);
  if (!s) return null;
  return s.slice(0, 10);
}

function normalizeInvoice(raw: Record<string, unknown>): ParsedInvoice {
  const rawLines = Array.isArray(raw.lineItems) ? raw.lineItems : [];
  return {
    type: "invoice",
    vendorName: toStr(raw.vendorName),
    vendorGstin: toStr(raw.vendorGstin),
    invoiceNumber: toStr(raw.invoiceNumber),
    invoiceDate: toDate(raw.invoiceDate),
    dueDate: toDate(raw.dueDate),
    subtotal: toNum(raw.subtotal),
    cgstTotal: toNum(raw.cgstTotal),
    sgstTotal: toNum(raw.sgstTotal),
    igstTotal: toNum(raw.igstTotal),
    total: toNum(raw.total),
    lineItems: rawLines.map((l) => {
      const line = (l ?? {}) as Record<string, unknown>;
      return {
        description: toStr(line.description) ?? "",
        quantity: toNum(line.quantity),
        unitPrice: toNum(line.unitPrice),
        gstRate: toNum(line.gstRate),
        cgstAmount: toNum(line.cgstAmount),
        sgstAmount: toNum(line.sgstAmount),
        igstAmount: toNum(line.igstAmount),
        amount: toNum(line.amount),
      };
    }),
    confidence: toNum(raw.confidence) || 90,
  };
}

function normalizeReceipt(raw: Record<string, unknown>): ParsedReceipt {
  return {
    type: "receipt",
    vendorName: toStr(raw.vendorName),
    vendorAddress: toStr(raw.vendorAddress),
    vendorGstin: toStr(raw.vendorGstin),
    receiptDate: toDate(raw.receiptDate),
    total: toNum(raw.total),
    expenseCategory: toStr(raw.expenseCategory),
    confidence: toNum(raw.confidence) || 90,
  };
}

function normalizeParsed(raw: unknown, scanType: ScanType): ParsedInvoice | ParsedReceipt {
  const obj = (raw ?? {}) as Record<string, unknown>;
  if (scanType === "receipt" || obj.type === "receipt") return normalizeReceipt(obj);
  return normalizeInvoice(obj);
}

export async function processWithLLM(fileUrl: string, scanType: ScanType, rawText?: string): Promise<ExtractedScan> {
  const ext = fileUrl.split(".").pop()?.toLowerCase() ?? "";
  const mime = IMAGE_MIME[ext];
  let text = rawText ?? "";

  let content: LlmMessageContent[];
  if (mime && !text) {
    const buffer = await readFileContent(fileUrl);
    const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    content = [
      { type: "text", text: LLM_USER_PROMPT(scanType) },
      { type: "image_url", image_url: { url: dataUrl } },
    ];
  } else {
    // PDF (or any non-image): OCR locally first, structure the text with the LLM
    if (!text) {
      const ocr = await processImageOcr(fileUrl);
      text = ocr.rawText;
    }
    content = [
      {
        type: "text",
        text: `${LLM_USER_PROMPT(scanType)}\n\nDOCUMENT TEXT (OCR output, may contain errors):\n"""\n${text.slice(0, 60_000)}\n"""`,
      },
    ];
  }

  const raw = await callLlm([
    { role: "system", content: LLM_SYSTEM_PROMPT },
    { role: "user", content },
  ]);

  return {
    provider: "llm",
    rawText: text,
    confidence: toNum((raw as Record<string, unknown>)?.confidence) || 90,
    parsed: normalizeParsed(raw, scanType),
  };
}

export async function processWithTesseract(fileUrl: string, scanType: ScanType): Promise<ExtractedScan> {
  const { rawText, confidence } = await processImageOcr(fileUrl);
  const parsed = scanType === "receipt"
    ? parseReceiptTextResult(rawText, confidence)
    : parseInvoiceTextResult(rawText, confidence);
  return { provider: "tesseract", rawText, confidence, parsed };
}

export async function processScan(fileUrl: string, scanType: ScanType): Promise<ExtractedScan> {
  if (resolveOcrProvider() === "llm") {
    return processWithLLM(fileUrl, scanType);
  }
  return processWithTesseract(fileUrl, scanType);
}
