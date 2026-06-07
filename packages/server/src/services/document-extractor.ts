import { readFile } from "fs/promises";
import { getFilePath } from "./file-upload";

export interface ExtractedDocumentData {
  legalName?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  stateCode?: string;
  cin?: string;
  dateOfIncorporation?: string;
  directors?: string[];
  confidence: number;
  rawText: string;
}

// ─── GST Certificate Extraction ────────────────────────────────────────────

function extractGstinData(text: string): Partial<ExtractedDocumentData> {
  const result: Partial<ExtractedDocumentData> = {};

  // GSTIN pattern: 2 digit state code + 10 char PAN + 1 digit entity code + Z + 1 digit checksum
  const gstinMatch = text.match(
    /\b\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z]\d\b/
  );
  if (gstinMatch) {
    result.gstin = gstinMatch[0];
    result.stateCode = gstinMatch[0].substring(0, 2);
  }

  // Legal name (typically after "Legal Name of Business" or similar)
  const legalNamePatterns = [
    /Legal\s+Name\s+(?:of\s+Business)?[:\s]+([A-Z][A-Z\s&]+?)(?:\n|$)/i,
    /Trade\s+Name[:\s]+([A-Z][A-Z\s&]+?)(?:\n|$)/i,
    /Registered\s+Name[:\s]+([A-Z][A-Z\s&]+?)(?:\n|$)/i,
  ];
  for (const pattern of legalNamePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.legalName = match[1].trim();
      break;
    }
  }

  // Address extraction
  const addressPatterns = [
    /Address\s+(?:of\s+Principal\s+Place)?[:\s]+(.+?)(?:\n\n|\nState)/is,
    /Principal\s+Place\s+(?:of\s+Business)?[:\s]+(.+?)(?:\n\n|\nState)/is,
  ];
  for (const pattern of addressPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.address = match[1].trim().replace(/\n/g, ", ");
      break;
    }
  }

  return result;
}

// ─── PAN Card Extraction ───────────────────────────────────────────────────

function extractPanData(text: string): Partial<ExtractedDocumentData> {
  const result: Partial<ExtractedDocumentData> = {};

  // PAN pattern: AAAAA9999A
  const panMatch = text.match(/\b[A-Z]{5}\d{4}[A-Z]\b/);
  if (panMatch) {
    result.pan = panMatch[0];
  }

  // Name (typically the largest text or after "Name")
  const namePatterns = [
    /Name\s*[:\s]+([A-Z][A-Z\s]+?)(?:\n|$)/i,
    /(?:^|\n)([A-Z]{2,}(?:\s+[A-Z]{2,})+)(?:\n)/m,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.legalName = match[1].trim();
      break;
    }
  }

  return result;
}

// ─── Incorporation Certificate Extraction ──────────────────────────────────

function extractIncorporationData(text: string): Partial<ExtractedDocumentData> {
  const result: Partial<ExtractedDocumentData> = {};

  // CIN (Corporate Identity Number)
  const cinMatch = text.match(
    /\b[A-Z]{1}\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}\b/
  );
  if (cinMatch) {
    result.cin = cinMatch[0];
  }

  // Company name
  const namePatterns = [
    /Company\s+Name[:\s]+([A-Z][A-Z\s&]+?)(?:\n|$)/i,
    /(?:Name\s+of\s+the\s+Company)[:\s]+([A-Z][A-Z\s&]+?)(?:\n|$)/i,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.legalName = match[1].trim();
      break;
    }
  }

  // Date of incorporation
  const datePatterns = [
    /Date\s+of\s+(?:Incorporation|Registration)[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /Incorporated\s+(?:on|dated)[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.dateOfIncorporation = match[1];
      break;
    }
  }

  // Directors (names after "Director" or "Director Name")
  const directorSection = text.match(
    /Directors?[:\s]+([\s\S]+?)(?:\n\s*\n|Registered\s+Office)/i
  );
  if (directorSection) {
    const directorLines = directorSection[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 2 && /^[A-Z]/.test(l));
    result.directors = directorLines.slice(0, 10); // Cap at 10
  }

  return result;
}

// ─── Main Extraction Function ──────────────────────────────────────────────

export async function extractDocumentData(
  documentType: "gst_certificate" | "pan_card" | "incorporation_certificate",
  fileUrl: string
): Promise<ExtractedDocumentData> {
  const filePath = getFilePath(fileUrl);
  const fileBuffer = await readFile(filePath);

  // Detect file type
  const isPdf =
    fileBuffer[0] === 0x25 &&
    fileBuffer[1] === 0x50 &&
    fileBuffer[2] === 0x44 &&
    fileBuffer[3] === 0x46;

  let rawText = "";
  let confidence = 0;

  if (isPdf) {
    // For PDFs, try to extract text directly first
    try {
      // Simple PDF text extraction (works for text-based PDFs)
      const textContent = fileBuffer.toString("utf-8");
      // Extract text between stream/endstream or BT/ET markers
      const textMatches = textContent.match(
        /BT[\s\S]*?ET/g
      );
      if (textMatches) {
        rawText = textMatches
          .map((m) => {
            const textParts = m.match(/\(([^)]+)\)/g);
            return textParts
              ? textParts.map((p) => p.slice(1, -1)).join(" ")
              : "";
          })
          .join("\n");
        confidence = 70;
      }
    } catch {
      // Fall through to OCR
    }

    // If no text extracted, convert PDF to image and OCR
    if (!rawText) {
      try {
        const { processImageOcr } = await import("./ocr-processor");
        // For now, treat as image (works for single-page PDFs)
        const ocrResult = await processImageOcr(fileUrl);
        rawText = ocrResult.rawText;
        confidence = ocrResult.confidence;
      } catch {
        rawText = "";
        confidence = 0;
      }
    }
  } else {
    // Image file — use Tesseract OCR
    try {
      const { processImageOcr } = await import("./ocr-processor");
      const ocrResult = await processImageOcr(fileUrl);
      rawText = ocrResult.rawText;
      confidence = ocrResult.confidence;
    } catch {
      rawText = "";
      confidence = 0;
    }
  }

  // Extract structured data based on document type
  let extracted: Partial<ExtractedDocumentData> = {};
  switch (documentType) {
    case "gst_certificate":
      extracted = extractGstinData(rawText);
      break;
    case "pan_card":
      extracted = extractPanData(rawText);
      break;
    case "incorporation_certificate":
      extracted = extractIncorporationData(rawText);
      break;
  }

  return {
    ...extracted,
    confidence,
    rawText,
  };
}
