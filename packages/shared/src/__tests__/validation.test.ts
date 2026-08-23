import { describe, it, expect } from "vitest";
import {
  isValidPAN,
  isValidAadhaar,
  isValidGSTIN,
  computeVerhoeffCheckDigit,
} from "../validation";

describe("isValidPAN", () => {
  it("accepts a valid person PAN", () => {
    expect(isValidPAN("ABCPD1234F")).toBe(true);
  });

  it("accepts a valid company PAN", () => {
    expect(isValidPAN("AAACC1234C")).toBe(true);
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(isValidPAN(" abcpd1234f ")).toBe(true);
    expect(isValidPAN("aaacc1234c")).toBe(true);
  });

  it("rejects malformed format", () => {
    expect(isValidPAN("ABCD1234F")).toBe(false); // too short
    expect(isValidPAN("ABCPD12345")).toBe(false); // trailing digit
    expect(isValidPAN("1BCPD1234F")).toBe(false); // leading digit
    expect(isValidPAN("")).toBe(false);
  });

  it("rejects unknown entity-type character in 4th position", () => {
    // Format-valid but 4th char X is not an entity type
    expect(isValidPAN("ABCXD1234F")).toBe(false);
    expect(isValidPAN("AAAXC1234C")).toBe(false);
  });
});

describe("isValidAadhaar", () => {
  it("accepts an 11-digit payload plus its Verhoeff check digit", () => {
    const payload = "23456789012";
    const check = computeVerhoeffCheckDigit(payload);
    expect(check).toBeGreaterThanOrEqual(0);
    expect(check).toBeLessThanOrEqual(9);
    const aadhaar = `${payload}${check}`;
    expect(isValidAadhaar(aadhaar)).toBe(true);
  });

  it("accepts a second constructed example with separators", () => {
    const payload = "98765432109";
    const aadhaar = `${payload}${computeVerhoeffCheckDigit(payload)}`;
    expect(isValidAadhaar(`${aadhaar.slice(0, 4)} ${aadhaar.slice(4, 8)} ${aadhaar.slice(8)}`)).toBe(true);
  });

  it("rejects a corrupted check digit", () => {
    const payload = "23456789012";
    const good = `${payload}${computeVerhoeffCheckDigit(payload)}`;
    const badDigit = (Number(good[11]) + 5) % 10;
    expect(isValidAadhaar(`${payload}${badDigit}`)).toBe(false);
  });

  it("rejects non-12-digit or leading 0/1 inputs", () => {
    expect(isValidAadhaar("123456789012")).toBe(false); // starts with 1
    expect(isValidAadhaar("034567890123".slice(0, 11))).toBe(false); // 11 digits
    expect(isValidAadhaar("2345678901234")).toBe(false); // 13 digits
    expect(isValidAadhaar("abcdefghijkm")).toBe(false);
    expect(isValidAadhaar("")).toBe(false);
  });
});

describe("isValidGSTIN", () => {
  it("accepts the known-valid GSTIN 27AAPFU0939F1ZV", () => {
    expect(isValidGSTIN("27AAPFU0939F1ZV")).toBe(true);
  });

  it("accepts lowercase / padded input", () => {
    expect(isValidGSTIN(" 27aapfu0939f1zv ")).toBe(true);
  });

  it("rejects a wrong checksum char", () => {
    expect(isValidGSTIN("27AAPFU0939F1ZW")).toBe(false);
    expect(isValidGSTIN("27AAPFU0939F1Z1")).toBe(false);
  });

  it("rejects structural violations", () => {
    expect(isValidGSTIN("27AAPFU0939F1Z")).toBe(false); // 14 chars
    expect(isValidGSTIN("27AAPFU0939F1ZVV")).toBe(false); // 16 chars
    expect(isValidGSTIN("27AAPFU0939F1ZA")).toBe(false); // structurally fine, bad checksum
    expect(isValidGSTIN("XXAAPFU0939F1ZV")).toBe(false); // state code not digits
    expect(isValidGSTIN("27AAPFU0939F0ZV")).toBe(false); // entity code can't be 0
  });

  it("checksum matches the standard mod-36 derivation for the known example", () => {
    // Recompute independently for first 14 chars of 27AAPFU0939F1ZV.
    const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      const v = charset.indexOf("27AAPFU0939F1Z"[i]);
      const product = v * (i % 2 === 0 ? 1 : 2);
      sum += Math.floor(product / 36) + (product % 36);
    }
    const expected = charset[(36 - (sum % 36)) % 36];
    expect(expected).toBe("V");
    expect(isValidGSTIN(`27AAPFU0939F1Z${expected}`)).toBe(true);
  });
});
