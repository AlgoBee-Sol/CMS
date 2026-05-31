// =============================================================================
// Encryption Utility — AES-256-CBC for PII (CNIC) at-rest encryption
// =============================================================================

import crypto from "node:crypto";
import { env } from "../config/env.config.js";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // bytes

/**
 * Returns the 32-byte encryption key derived from the hex env var.
 * @returns {Buffer}
 */
function getKey() {
  const key = env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes).",
    );
  }
  return Buffer.from(key, "hex");
}

/**
 * Encrypt a plaintext string.
 * @param {string} plainText
 * @returns {string} Format: `iv_hex:cipherText_hex`
 */
export function encrypt(plainText) {
  if (!plainText) return plainText;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an encrypted string.
 * @param {string} encryptedText - Format: `iv_hex:cipherText_hex`
 * @returns {string} Decrypted plaintext
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;

  const [ivHex, cipherHex] = encryptedText.split(":");
  if (!ivHex || !cipherHex) {
    throw new Error("Invalid encrypted text format. Expected iv:cipherText");
  }

  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);

  let decrypted = decipher.update(cipherHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
