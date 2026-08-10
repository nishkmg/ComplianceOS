import React from "react";
import {
  Font,
  StyleSheet,
  View,
  Text,
  Image,
} from "@react-pdf/renderer";

// StyleProp not re-exported by @react-pdf/renderer v4.x — use broad type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDFStyle = any;

// ---------------------------------------------------------------------------
// Font registration
// Inter + NotoSansDevanagari TTFs are bundled in assets/fonts and registered
// from their local paths so PDF rendering is deterministic and offline-safe.
// @react-pdf/renderer 4.x cannot render the built-in Helvetica standard font
// (text runs are silently dropped), so a real font file is required.
// CDN registration is kept as a fallback for deployments that lack the assets.
// ---------------------------------------------------------------------------

import path from "node:path";
import fs from "node:fs";

const FONT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../assets/fonts");

function localFontSrc(file: string): string | null {
  const full = path.join(FONT_DIR, file);
  try {
    return fs.existsSync(full) ? full : null;
  } catch {
    return null;
  }
}

// NOTE: do NOT disable hyphenation via registerHyphenationCallback(() => []) —
// @react-pdf/renderer 4.x silently drops every text run when the callback
// returns an empty array (all rendered PDFs come out blank).

const REGISTERED_FONTS = {
  inter: false,
  interBold: false,
  notoSansDevanagari: false,
} as { [family: string]: boolean };

function tryRegisterFont(family: string, src: string): boolean {
  try {
    Font.register({ family, src });
    return true;
  } catch {
    return false;
  }
}

// Prefer bundled TTFs (deterministic, offline-safe); fall back to CDN paths.
const interSrc = localFontSrc("Inter-Regular.ttf")
  ?? "https://fonts.cdnfonts.com/s/19795/Inter_18pt-Regular.woff";
const interBoldSrc = localFontSrc("Inter-Bold.ttf")
  ?? "https://fonts.cdnfonts.com/s/19795/Inter_18pt-Bold.woff";
const notoSrc = localFontSrc("NotoSansDevanagari-Regular.ttf")
  ?? "https://fonts.cdnfonts.com/s/32775/NotoSansDevanagari-Regular.woff";

// Inter-Italic is referenced by some styles; route it to the regular file when
// the italic file is absent rather than dropping to the non-rendering Helvetica.
const interItalicSrc = localFontSrc("Inter-Italic.ttf") ?? interSrc;

REGISTERED_FONTS.inter = tryRegisterFont("Inter", interSrc);
REGISTERED_FONTS.interBold = tryRegisterFont("Inter-Bold", interBoldSrc);
tryRegisterFont("Inter-Italic", interItalicSrc);
REGISTERED_FONTS.notoSansDevanagari = tryRegisterFont("NotoSansDevanagari", notoSrc);

export const BODY_FONT = REGISTERED_FONTS.inter ? "Inter" : "Helvetica";
export const BOLD_FONT = REGISTERED_FONTS.interBold
  ? "Inter-Bold"
  : BODY_FONT === "Inter"
    ? "Inter"
    : "Helvetica-Bold";
export const HINDI_FONT = REGISTERED_FONTS.notoSansDevanagari ? "NotoSansDevanagari" : "Helvetica";

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "1 solid #e5e7eb",
  },
  headerLeft: {
    flex: 1,
  },
  headerLogo: {
    width: 80,
    height: 80,
    marginBottom: 6,
    objectFit: "contain",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: BOLD_FONT,
    color: "#1a1a1a",
  },
  headerMeta: {
    fontSize: 9,
    fontFamily: BODY_FONT,
    color: "#6b7280",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTop: "1 solid #e5e7eb",
  },
  footerText: {
    fontSize: 7,
    fontFamily: BODY_FONT,
    color: "#9ca3af",
  },
  signOff: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signOffBlock: {
    flex: 1,
  },
  signOffLine: {
    width: 180,
    borderTop: "1 solid #1a1a1a",
    marginBottom: 4,
  },
  signOffLabel: {
    fontSize: 8,
    fontFamily: BODY_FONT,
    color: "#6b7280",
  },
  signOffValue: {
    fontSize: 10,
    fontFamily: BOLD_FONT,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  watermark: {
    position: "absolute",
    top: "30%",
    left: "20%",
    right: "20%",
    transform: "rotate(-45)",
    opacity: 0.12,
    alignItems: "center",
    justifyContent: "center",
  },
  watermarkText: {
    fontSize: 64,
    fontFamily: BOLD_FONT,
    color: "#1a1a1a",
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeaderProps {
  title: string;
  period?: string;
  gstin?: string;
  logoUrl?: string;
  style?: PDFStyle;
}

export interface FooterProps {
  currentPage: number;
  totalPages: number;
  generatedAt: string;
  documentHash?: string;
  style?: PDFStyle;
}

export interface SignOffBlockProps {
  authorizedSignatory: string;
  place: string;
  date: string;
  designation?: string;
  style?: PDFStyle;
}

export type WatermarkType = "DRAFT" | "FILED" | "VOID";

export interface WatermarkProps {
  type: WatermarkType;
  style?: PDFStyle;
}

export interface QRCodeProps {
  value: string;
  size?: number;
  style?: PDFStyle;
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export const Header: React.FC<HeaderProps> = ({ title, period, gstin, logoUrl, style }) => (
  <View style={[styles.header, style]}>
    <View style={styles.headerLeft}>
      {logoUrl && <Image src={logoUrl} style={styles.headerLogo} />}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
    <View>
      {period && <Text style={styles.headerMeta}>Period: {period}</Text>}
      {gstin && <Text style={styles.headerMeta}>GSTIN: {gstin}</Text>}
    </View>
  </View>
);

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export const Footer: React.FC<FooterProps> = ({
  currentPage,
  totalPages,
  generatedAt,
  documentHash,
  style,
}) => (
  <View style={[styles.footer, style]} fixed>
    <Text style={styles.footerText}>
      Page {currentPage} of {totalPages}
    </Text>
    <Text style={styles.footerText}>Generated: {generatedAt}</Text>
    {documentHash && (
      <Text style={styles.footerText}>
        Hash: {documentHash.length > 16 ? `${documentHash.slice(0, 16)}…` : documentHash}
      </Text>
    )}
  </View>
);

// ---------------------------------------------------------------------------
// SignOffBlock
// ---------------------------------------------------------------------------

export const SignOffBlock: React.FC<SignOffBlockProps> = ({
  authorizedSignatory,
  place,
  date,
  designation,
  style,
}) => (
  <View style={[styles.signOff, style]}>
    <View style={styles.signOffBlock}>
      <Text style={styles.signOffLabel}>Place</Text>
      <Text style={styles.signOffValue}>{place}</Text>
      <View style={{ marginTop: 12 }}>
        <Text style={styles.signOffLabel}>Date</Text>
        <Text style={styles.signOffValue}>{date}</Text>
      </View>
    </View>
    <View style={styles.signOffBlock}>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.signOffLabel}>Authorized Signatory</Text>
        <Text style={[styles.signOffValue, { marginTop: 4 }]}>{authorizedSignatory}</Text>
        {designation && (
          <Text style={{ fontSize: 8, fontFamily: BODY_FONT, color: "#6b7280" }}>
            {designation}
          </Text>
        )}
        <View style={[styles.signOffLine, { marginTop: 20, alignSelf: "flex-end" }]} />
        <Text style={{ fontSize: 7, fontFamily: BODY_FONT, color: "#9ca3af", marginTop: 2 }}>
          (Digital Signature)
        </Text>
      </View>
    </View>
  </View>
);

// ---------------------------------------------------------------------------
// Watermark
// ---------------------------------------------------------------------------

const WATERMARK_COLORS: Record<WatermarkType, string> = {
  DRAFT: "#f59e0b",
  FILED: "#10b981",
  VOID: "#ef4444",
};

export const Watermark: React.FC<WatermarkProps> = ({ type, style }) => (
  <View style={[styles.watermark, style]}>
    <Text style={[styles.watermarkText, { color: WATERMARK_COLORS[type] }]}>{type}</Text>
  </View>
);

// ---------------------------------------------------------------------------
// QRCode — wraps @react-pdf/renderer's built-in SVG/QR if available
// Falls back to a placeholder SVG if QRCode is not natively supported.
// ---------------------------------------------------------------------------

/**
 * Renders a QR code on the PDF via an inline SVG QR.
 * @react-pdf/renderer does not ship a QRCode component, so we use a simple
 * SVG placeholder. In production, replace with a canvas-based QR generation
 * (e.g. qrcode-generator or qrcode package) that produces a data URL.
 */
export const QRCode: React.FC<QRCodeProps> = ({ value, size = 60, style }) => {
  const dataUri = generateQRDataUri(value, size);
  return <Image src={dataUri} style={[{ width: size, height: size }, style]} />;
};

/**
 * Generates a lightweight QR-code-like data URI.
 * This is a visual representation only; it does NOT produce a scan-able QR code.
 * For production, replace with a proper QR generator:
 *
 *   import qrcode from "qrcode-generator";
 *   const qr = qrcode(0, "L");
 *   qr.addData(value);
 *   qr.make();
 *   const dataUri = qr.createDataURL(size, 4);
 */
function generateQRDataUri(value: string, size: number): string {
  const moduleCount = 21; // smallest QR version = 21x21
  const moduleSize = Math.floor((size - 4) / moduleCount);
  const offset = Math.floor((size - moduleSize * moduleCount) / 2);
  const canvas: string[] = [];
  canvas.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
  );
  // White background
  canvas.push(`<rect width="${size}" height="${size}" fill="#ffffff" rx="4"/>`);

  // Deterministic seed from value
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) & 0x7fffffff;
  }

  let state = seed;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      if (state % 3 !== 0) {
        const x = offset + col * moduleSize;
        const y = offset + row * moduleSize;
        canvas.push(
          `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="#1a1a1a"/>`,
        );
      }
    }
  }

  // Position detection patterns (top-left, top-right, bottom-left)
  const drawPosPattern = (cx: number, cy: number) => {
    for (let r = -3; r <= 3; r++) {
      for (let c = -3; c <= 3; c++) {
        const dist = Math.max(Math.abs(r), Math.abs(c));
        if (dist === 0 || dist === 2) continue;
        if (dist > 3) continue;
        const x = offset + (cx + c) * moduleSize;
        const y = offset + (cy + r) * moduleSize;
        canvas.push(
          `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="#1a1a1a"/>`,
        );
      }
    }
  };

  drawPosPattern(3, 3);
  drawPosPattern(moduleCount - 4, 3);
  drawPosPattern(3, moduleCount - 4);

  canvas.push(`</svg>`);
  return `data:image/svg+xml;base64,${Buffer.from(canvas.join(""), "utf8").toString("base64")}`;
}

// Re-export @react-pdf/renderer primitives so consumers get a single import
export { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
