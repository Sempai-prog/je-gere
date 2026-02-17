import { describe, it, expect } from 'bun:test';
import { encryptData, decryptData } from '../services/storageService';

describe('Storage Service', () => {
  it('should encrypt data correctly', async () => {
    const data = { sensitive: 'business data', revenue: 1000000 };
    const encrypted = await encryptData(data);
    expect(encrypted.startsWith('ENC:')).toBe(true);
    expect(encrypted).not.toBe(JSON.stringify(data));
  });

  it('should decrypt encrypted data correctly', async () => {
    const data = { sensitive: 'business data', revenue: 1000000 };
    const encrypted = await encryptData(data);
    const decrypted = await decryptData(encrypted);
    expect(decrypted).toEqual(data);
  });

  it('should handle legacy plaintext data (migration)', async () => {
    const legacyData = { old: 'data' };
    const legacyJson = JSON.stringify(legacyData);
    const decrypted = await decryptData(legacyJson);
    expect(decrypted).toEqual(legacyData);
  });

  it('should handle null input', async () => {
    const decrypted = await decryptData(null);
    expect(decrypted).toBeNull();
  });

  it('should return null for malformed encrypted data', async () => {
    // This might throw or return null depending on implementation,
    // but my implementation returns null on error.
    const malformed = "ENC:invalid_base64:part";
    const decrypted = await decryptData(malformed);
    expect(decrypted).toBeNull();
  });
});
