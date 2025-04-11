import CryptoJS from "crypto-js";

/**
 * Encrypts data using AES encryption
 * @param data - The data to encrypt
 * @param password - The password to use for encryption
 * @returns The encrypted data
 */
export function encrypt(data: string, password: string): string {
  try {
    return CryptoJS.AES.encrypt(data, password).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypts data using AES decryption
 * @param encryptedData - The encrypted data
 * @param password - The password used for encryption
 * @returns The decrypted data
 */
export function decrypt(encryptedData: string, password: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

// Aliases for consistent naming in the DataTable component
export const encryptData = encrypt;
export const decryptData = decrypt;
