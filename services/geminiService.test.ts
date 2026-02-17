import { describe, test, expect, mock, beforeAll, afterEach } from "bun:test";

// Define Mock Class with controllable behavior
class MockGoogleGenAI {
  static shouldFail = true;
  static mockResponse = "";

  constructor(options: any) {
    // No-op
  }

  get chats() {
    return {
      create: () => ({ sendMessageStream: async () => ({}) })
    };
  }

  get models() {
    return {
      generateContent: async () => {
        if (MockGoogleGenAI.shouldFail) {
          throw new Error("Simulated API Error");
        }
        return { text: MockGoogleGenAI.mockResponse };
      }
    };
  }
}

// Register Mock
mock.module("@google/genai", () => {
  return {
    GoogleGenAI: MockGoogleGenAI,
    Chat: class {},
    GenerateContentResponse: class {}
  };
});

const FALLBACK_STRATEGIES: Record<string, string[]> = {
    'Chef': [
      "Vérifiez l'état des stocks critiques maintenant.",
      "Briefing rapide : propreté du poste avant le rush.",
      "Annoncez les bons fort et clair ce soir.",
      "Marche en avant stricte : pas de croisement.",
      "Attention aux cuissons sur les viandes rouges."
    ],
    'Service': [
      "Vérifiez l'assignation des tables VIP.",
      "Sourire obligatoire, même dans le jus.",
      "Anticipez les carafes d'eau avant la demande.",
      "Vendez les suggestions du jour (Objectif +5).",
      "Communication fluide avec le pass cuisine."
    ],
    'Manager': [
      "Surveillez le ratio masse salariale en temps réel.",
      "Faites un tour de salle toutes les 30 minutes.",
      "Gérez les conflits clients immédiatement.",
      "Soutenez les équipes en difficulté (Runner).",
      "Vérifiez la propreté des sanitaires avant le service."
    ],
    'Owner': [
      "Observez l'ambiance générale de la salle.",
      "Notez 3 points d'amélioration physique.",
      "Saluez les habitués personnellement.",
      "Vérifiez l'affichage extérieur."
    ]
};

describe("generatePreShiftBriefing", () => {

  afterEach(() => {
    // Reset mock state
    MockGoogleGenAI.shouldFail = true;
    MockGoogleGenAI.mockResponse = "";
    delete process.env.API_KEY;
  });

  test("Scenario 1: Missing API Key -> Should use fallback", async () => {
    delete process.env.API_KEY;
    const mod = await import(`./geminiService.ts?case=missingKey_${Date.now()}`);
    const strategies = await mod.generatePreShiftBriefing("Chef");

    expect(strategies).toBeArray();
    expect(strategies).toHaveLength(3);
    strategies.forEach(s => expect(FALLBACK_STRATEGIES['Chef']).toContain(s));
  });

  test("Scenario 2: API Key Present but API Fails -> Should use fallback", async () => {
    process.env.API_KEY = "test-api-key";
    MockGoogleGenAI.shouldFail = true;

    const mod = await import(`./geminiService.ts?case=apiKeyError_${Date.now()}`);
    const strategies = await mod.generatePreShiftBriefing("Chef");

    expect(strategies).toBeArray();
    expect(strategies).toHaveLength(3);
    strategies.forEach(s => expect(FALLBACK_STRATEGIES['Chef']).toContain(s));
  });

  test("Scenario 3: Happy Path (API Success)", async () => {
    process.env.API_KEY = "valid-api-key";
    MockGoogleGenAI.shouldFail = false;
    // Mock response with 3 lines
    MockGoogleGenAI.mockResponse = "Strategy 1\nStrategy 2\nStrategy 3";

    const mod = await import(`./geminiService.ts?case=happyPath_${Date.now()}`);
    const strategies = await mod.generatePreShiftBriefing("Chef");

    expect(strategies).toEqual(["Strategy 1", "Strategy 2", "Strategy 3"]);
  });

  test("Scenario 4: Role Specific Fallbacks (Manager)", async () => {
     delete process.env.API_KEY;
     const mod = await import(`./geminiService.ts?case=manager_${Date.now()}`);
     const strategies = await mod.generatePreShiftBriefing("Manager");
     expect(strategies).toHaveLength(3);
     strategies.forEach(s => expect(FALLBACK_STRATEGIES['Manager']).toContain(s));
  });

  test("Scenario 5: Role Specific Fallbacks (Owner)", async () => {
     delete process.env.API_KEY;
     const mod = await import(`./geminiService.ts?case=owner_${Date.now()}`);
     const strategies = await mod.generatePreShiftBriefing("Owner");
     expect(strategies.length).toBeLessThanOrEqual(3);
     strategies.forEach(s => expect(FALLBACK_STRATEGIES['Owner']).toContain(s));
  });

  test("Scenario 6: Unknown Role -> Should use Manager fallback", async () => {
     delete process.env.API_KEY;
     const mod = await import(`./geminiService.ts?case=unknown_${Date.now()}`);
     const strategies = await mod.generatePreShiftBriefing("UnknownRole");
     expect(strategies).toHaveLength(3);
     strategies.forEach(s => expect(FALLBACK_STRATEGIES['Manager']).toContain(s));
  });

});
