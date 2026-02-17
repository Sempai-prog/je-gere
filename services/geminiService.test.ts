import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";

// Mock implementation
const mockGenerateContent = mock();
const mockChatsCreate = mock();

mock.module("@google/genai", () => {
  return {
    GoogleGenAI: class {
      constructor(params: any) {}
      get models() {
        return {
          generateContent: mockGenerateContent
        };
      }
      get chats() {
        return {
          create: mockChatsCreate
        };
      }
    }
  };
});

// Import the service AFTER mocking
// Using dynamic import to ensure mock is applied if not using top-level await or if imports are hoisted
const { generateInsight } = await import("./geminiService");

describe("generateInsight", () => {
  const originalApiKey = process.env.API_KEY;

  beforeEach(() => {
    mockGenerateContent.mockReset();
    process.env.API_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env.API_KEY = originalApiKey;
  });

  it("returns generated text on success", async () => {
    mockGenerateContent.mockResolvedValue({ text: "Super insight" });
    const result = await generateInsight("some context");
    expect(result).toBe("Super insight");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("handles 429 rate limit error", async () => {
    const error: any = new Error("Rate limit");
    error.status = 429;
    mockGenerateContent.mockRejectedValue(error);

    const result = await generateInsight("context");
    expect(result).toBe("Trafic dense. Monitoring local.");
  });

  it("handles general errors", async () => {
    mockGenerateContent.mockRejectedValue(new Error("Random error"));

    const result = await generateInsight("context");
    expect(result).toBe("Cadence à vérifier.");
  });

  it("handles missing API Key", async () => {
    process.env.API_KEY = "";
    const result = await generateInsight("context");
    expect(result).toBe("Système hors ligne");
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("handles empty response text", async () => {
    mockGenerateContent.mockResolvedValue({ text: "" });
    const result = await generateInsight("context");
    expect(result).toBe("Service nominal.");
  });
});
