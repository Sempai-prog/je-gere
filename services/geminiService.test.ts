import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";

// Mock the GoogleGenAI module
const mockGenerateContent = mock(async () => ({ text: "Mocked Summary" }));

mock.module("@google/genai", () => {
  return {
    GoogleGenAI: class {
      constructor(options: any) {}
      get models() {
        return {
          generateContent: mockGenerateContent
        };
      }
      get chats() {
        return {
           create: mock(() => ({ sendMessageStream: mock(async function* () {}) }))
        };
      }
    }
  };
});

describe("geminiService", () => {
  const originalApiKey = process.env.API_KEY;

  afterEach(() => {
    process.env.API_KEY = originalApiKey;
    mockGenerateContent.mockClear();
  });

  describe("summarizeDocument", () => {
    it("throws an error when API key is missing", async () => {
      process.env.API_KEY = ""; // Ensure empty

      // Dynamic import
      const { summarizeDocument } = await import("./geminiService");

      let error: any;
      try {
        await summarizeDocument("base64data", "image/png");
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error.message).toBe("API Key missing");
    });

    it("returns summary when API key is present", async () => {
      process.env.API_KEY = "test-api-key";

      const { summarizeDocument } = await import("./geminiService");

      const result = await summarizeDocument("base64data", "image/png");

      expect(result).toBe("Mocked Summary");
      expect(mockGenerateContent).toHaveBeenCalled();

      // Verify arguments
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.model).toBe("gemini-3-flash-preview");
      expect(callArgs.contents.parts[0].inlineData.mimeType).toBe("image/png");
    });
  });
});
