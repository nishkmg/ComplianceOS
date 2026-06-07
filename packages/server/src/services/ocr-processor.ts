import Tesseract from "tesseract.js";
import { readFile } from "fs/promises";
import { getFilePath } from "./file-upload";

export interface OcrResult {
  rawText: string;
  confidence: number;
}

export async function processImageOcr(fileUrl: string): Promise<OcrResult> {
  const filePath = getFilePath(fileUrl);
  const imageBuffer = await readFile(filePath);

  const result = await Tesseract.recognize(imageBuffer, "eng", {
    logger: () => {},
  });

  return {
    rawText: result.data.text,
    confidence: result.data.confidence,
  };
}