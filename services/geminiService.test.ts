import { describe, it, expect, mock, beforeEach, beforeAll } from "bun:test";

// Mock instances defined globally to be accessible in tests
const mockCreate = mock(() => ({
  sendMessage: mock(() => Promise.resolve({ response: { text: () => "Mock response" } })),
  sendMessageStream: mock()
}));

const mockGenerateContent = mock(() => Promise.resolve({
  response: { text: () => "Mock response" }
}));

// Mock GoogleGenAI class
mock.module("@google/genai", () => {
  return {
    GoogleGenAI: class {
      constructor() {
        this.chats = { create: mockCreate };
        this.models = { generateContent: mockGenerateContent };
      }
      // Ensure properties are available on instance if not set in constructor
      chats = { create: mockCreate };
      models = { generateContent: mockGenerateContent };
    }
  };
});

describe("geminiService", () => {
  let createChatSession: any;

  beforeAll(async () => {
    const mod = await import("./geminiService");
    createChatSession = mod.createChatSession;
  });

  beforeEach(() => {
    mockCreate.mockClear();
    mockGenerateContent.mockClear();
  });

  describe("createChatSession", () => {
    it("should configure session for Chef role correctly", () => {
      createChatSession("Chef", "active");
      expect(mockCreate).toHaveBeenCalled();
      const config = mockCreate.mock.calls[0][0].config;
      expect(config.systemInstruction).toContain("IDENTITÉ : Tu n'es PAS une IA");
      expect(config.systemInstruction).toContain("SI CHEF (Cuisine)");
      expect(config.temperature).toBe(0.6);
    });

    it("should configure session for Manager role correctly", () => {
      createChatSession("Manager", "active");
      const config = mockCreate.mock.calls[0][0].config;
      expect(config.systemInstruction).toContain("SI MANAGER (Direction)");
    });

    it("should configure session for Owner role correctly", () => {
      createChatSession("Owner", "active");
      const config = mockCreate.mock.calls[0][0].config;
      expect(config.systemInstruction).toContain("SI OWNER (Propriétaire)");
    });

    it("should configure session for Service role correctly", () => {
      createChatSession("Service", "active");
      const config = mockCreate.mock.calls[0][0].config;
      expect(config.systemInstruction).toContain("SI SERVICE (Salle)");
    });

     it("should handle shift status 'active'", () => {
      createChatSession("Chef", "active");
      const config = mockCreate.mock.calls[0][0].config;
      expect(config.systemInstruction).toContain("EN COURS (COUP DE FEU)");
    });

     it("should handle shift status 'ended'", () => {
      createChatSession("Chef", "ended");
      const config = mockCreate.mock.calls[0][0].config;
      expect(config.systemInstruction).toContain("TERMINÉ (DEBRIEF)");
    });
  });
});
