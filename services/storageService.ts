const SECRET_PASSPHRASE = "JE_GERE_APP_v1_SECURE_KEY_2024";

// Simple PBKDF2 key derivation from a static passphrase
// In a real production app, the key should be managed via a proper key management service (KMS) or user input.
// Given the constraints (client-side only), this obfuscates data against casual inspection and untargeted XSS dumps.
async function getEncryptionKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_PASSPHRASE),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("JE_GERE_SALT_STATIC"),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Global key cache (promise) to avoid re-deriving on every call
let keyPromise: Promise<CryptoKey> | null = null;
const getKey = () => {
  if (!keyPromise) {
    keyPromise = getEncryptionKey();
  }
  return keyPromise;
};

// Safe Uint8Array to Base64
function toBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Safe Base64 to Uint8Array
function fromBase64(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// Returns base64 string: ENC:IV:CIPHERTEXT
export async function encryptData(data: any): Promise<string> {
  try {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encodedData
    );

    const encryptedArray = new Uint8Array(encryptedContent);

    // Combine IV and Ciphertext
    // Format: "ENC:[Base64IV]:[Base64Cipher]"
    const b64Iv = toBase64(iv);
    const b64Cipher = toBase64(encryptedArray);

    return `ENC:${b64Iv}:${b64Cipher}`;
  } catch (e) {
    console.error("Encryption failed", e);
    throw e;
  }
}

export async function decryptData(storedValue: string | null): Promise<any> {
  if (!storedValue) return null;

  try {
    // 1. Check for legacy format (JSON) or plain text
    // If it doesn't start with ENC:, assume it's legacy JSON.
    if (!storedValue.startsWith("ENC:")) {
      try {
        return JSON.parse(storedValue);
      } catch {
        // Not valid JSON, return as is or null?
        return storedValue;
      }
    }

    const parts = storedValue.split(":");
    if (parts.length !== 3) throw new Error("Invalid encrypted format");

    const b64Iv = parts[1];
    const b64Cipher = parts[2];

    const iv = fromBase64(b64Iv);
    const cipher = fromBase64(b64Cipher);

    const key = await getKey();

    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      cipher
    );

    const decryptedString = new TextDecoder().decode(decryptedContent);
    return JSON.parse(decryptedString);
  } catch (e) {
    console.warn("Decryption failed or invalid format", e);
    // In case of error (e.g. key mismatch or corruption), returning null is safer than crashing
    return null;
  }
}
