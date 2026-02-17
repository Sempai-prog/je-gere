import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { UserRole } from "../types";

// --- Mocking ---

// We need to define the mock *before* importing the module.
// We use a shared variable to control the mock behavior across tests.
let mockGenerateContent = mock(async (options: any) => {
  return { text: "Mocked API Response" };
});

// Mock the entire @google/genai module
mock.module("@google/genai", () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      constructor(options: any) {
        // We can assert on options later if needed
      }
      chats = {
        create: mock(() => ({
          sendMessageStream: mock(async function* () { yield { text: "chat response" }; })
        }))
      };
      models = {
        generateContent: mockGenerateContent
      };
    }
  };
});

// --- Tests ---

describe("generatePreShiftBriefing", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset mocks
    mockGenerateContent.mockClear();
    // Reset env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("should use fallback strategies when API_KEY is missing", async () => {
    // 1. Simulate Missing API Key
    process.env.API_KEY = "";

    // 2. Load fresh module
    // We use a query parameter to bypass module caching and force re-evaluation
    // of the top-level 'const API_KEY = getApiKey();'
    const mod = await import(`./geminiService.ts?v=${Date.now()}`);

    // 3. Call function
    const strategies = await mod.generatePreShiftBriefing("Chef");

    // 4. Assertions
    expect(strategies).toBeArray();
    expect(strategies).toHaveLength(3);
    // Verify content is NOT from the API mock
    expect(strategies[0]).not.toBe("Mocked API Response");

    // Verify API was NOT called
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  test("should use fallback strategies when API throws an error", async () => {
    // 1. Simulate API Key Present
    process.env.API_KEY = "test-api-key";

    // 2. Configure Mock to Throw Error
    mockGenerateContent.mockImplementation(async () => {
      throw new Error("API Error 500");
    });

    // 3. Load fresh module
    const mod = await import(`./geminiService.ts?v=${Date.now()}-error`);

    // 4. Call function
    const strategies = await mod.generatePreShiftBriefing("Service");

    // 5. Assertions
    expect(strategies).toBeArray();
    expect(strategies).toHaveLength(3);
    // Verify content is from fallback strategies
    // Service fallback includes "Sourire obligatoire"
    const serviceKeywords = ["Sourire", "VIP", "carafes", "suggestions", "Communication"];
    const found = strategies.some(s => serviceKeywords.some(kw => s.includes(kw)));
    expect(found).toBe(true);

    // Verify API WAS called
    expect(mockGenerateContent).toHaveBeenCalled();
  });

  test("should return API response when successful", async () => {
    // 1. Simulate API Key Present
    process.env.API_KEY = "test-api-key";

    // 2. Configure Mock to Return Success
    const apiResponseText = "Strategy 1\nStrategy 2\nStrategy 3";
    mockGenerateContent.mockImplementation(async () => {
      return { text: apiResponseText };
    });

    // 3. Load fresh module
    const mod = await import(`./geminiService.ts?v=${Date.now()}-success`);

    // 4. Call function
    const strategies = await mod.generatePreShiftBriefing("Manager");

    // 5. Assertions
    expect(strategies).toBeArray();
    expect(strategies).toHaveLength(3);
    expect(strategies).toEqual(["Strategy 1", "Strategy 2", "Strategy 3"]);

    // Verify API WAS called
    expect(mockGenerateContent).toHaveBeenCalled();
  });
});
