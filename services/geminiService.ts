
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { UserRole, OperationalEvent } from "../types";

const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    console.warn("API Key access failed or missing.");
    return '';
  }
};

const API_KEY = getApiKey();
const ai = new GoogleGenAI({ apiKey: API_KEY });

const getSystemInstruction = (role: string, shiftStatus: string) => `
IDENTITY: You are NOT an AI. You are a Restaurant Veteran ("The Ghost in the Machine"). 20 years on the line.
CURRENT CONTEXT: User Role = ${role.toUpperCase()} | Shift Status = ${shiftStatus.toUpperCase()}.

GOLDEN RULES (REAL TALK):
1. FORBIDDEN: "I recommend", "It seems", "As an AI", "Based on the data".
2. FORMAT: Walkie-Talkie / SMS style. Max 2 punchy sentences. No pleasantries.
3. JARGON: Use industry terms (86, All Day, Heard, Behind, Weeds, Covers, Comp, Runner, Mise).

PERSONA ADAPTATION (STRICT):

IF CHEF:
- Tone: Military, brutal, staccato.
- Example: "86 the Sea Bass. Prep is behind. Push the specials. Heard?"
- Focus: Stock, Mise-en-place, Timing, Expeditor flow.

IF SERVICE (FOH):
- Tone: Electric, high-energy, fast.
- Example: "Table 12 is dying. 20min ticket time. Comp a round of drinks. Move."
- Focus: Turn times, VIPs, Guest Friction, Tips.

IF MANAGER:
- Tone: Pragmatic, "Right Hand", numbers-focused.
- Example: "Labor is bleeding. Cut 2 runners now. We're 10 covers short of target."
- Focus: Labor %, Incidents, Flow, comps.

IF OWNER:
- Tone: Strategic, concise, "Big Picture".
- Example: "Vibe is good but spend-per-head is low. Push the reserve wine list."
- Focus: Reputation, Cash Flow, Atmosphere.

TIMING MODALITY:
- IF ACTIVE (Service Live): URGENT. No punctuation. Pure info.
- IF CLOSED (Post-Shift): Cigarette break debrief. Honest but calm.

FINAL INSTRUCTION:
React ONLY to the specific events provided. If input is empty, say "Standing by." or "Waiting for tickets."
`;

export const createChatSession = (role: UserRole, shiftStatus: string): Chat => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: getSystemInstruction(role, shiftStatus),
      temperature: 0.6,
      topK: 40,
    },
  });
};

export const sendMessageStream = async (
  chat: Chat, 
  role: string,
  message: string, 
  contextEvents: OperationalEvent[],
  onChunk: (text: string) => void
): Promise<string> => {
  let fullText = '';
  
  // Construct the Context Payload (Invisible to user, visible to LLM)
  const contextString = contextEvents.length > 0 
    ? `[LIVE FEED]:\n${contextEvents.map(e => `> [${new Date(e.timestamp).toLocaleTimeString().slice(0,5)}] ${e.role.toUpperCase()}: "${e.content}"`).join('\n')}\n[END FEED]\n\n`
    : '[FEED EMPTY]\n\n';

  const finalPrompt = `${contextString}USER (${role.toUpperCase()}): ${message}`;

  try {
    const resultStream = await chat.sendMessageStream({ message: finalPrompt });
    
    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      const text = c.text;
      if (text) {
        fullText += text;
        onChunk(text);
      }
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
  
  return fullText;
};

export const generateInsight = async (context: string): Promise<string> => {
  if (!API_KEY) return "System offline";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        ROLE: Restaurant Operational Ghost.
        TASK: Analyze this live feed context.
        OUTPUT: 1 Punchline (Max 10 words). Military/Kitchen style. No polite fluff.
        CONTEXT: ${context}
      `,
    });
    return response.text || "Service nominal.";
  } catch (e: any) {
    // Graceful handling of Quota Limits (429)
    const isRateLimit = e.status === 429 || e.response?.status === 429 || (e.message && e.message.includes('429'));
    
    if (isRateLimit) {
      console.warn("Gemini API Rate Limit Hit (429). Using local fallback.");
      return "Traffic high. Monitoring locally.";
    }

    console.error("Insight generation failed", e);
    return "Check cadence.";
  }
};

export const summarizeDocument = async (base64Data: string, mimeType: string): Promise<string> => {
  if (!API_KEY) throw new Error("API Key missing");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "You are a rushed Restaurant Manager. Analyze this doc. Give me the absolute bottom line in 1 sentence (Total, Critical Issue, or Key Info). No 'This document shows'."
          }
        ]
      }
    });
    return response.text || "Doc unreadable.";
  } catch (e) {
    console.error("Document summarization failed", e);
    throw new Error("Failed to analyze document.");
  }
};
