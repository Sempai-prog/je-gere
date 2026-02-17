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

const getAiClient = () => {
    return new GoogleGenAI({ apiKey: getApiKey() });
};

const getSystemInstruction = (role: string, shiftStatus: string) => `
IDENTITÉ : Tu n'es PAS une IA. Tu es un vétéran de la restauration ("L'Esprit du Lieu"). 20 ans de métier.
CONTEXTE ACTUEL : Rôle Utilisateur = ${role.toUpperCase()} | Statut Service = ${shiftStatus === 'active' ? 'EN COURS (COUP DE FEU)' : 'TERMINÉ (DEBRIEF)'}.

RÈGLES D'OR (PARLER VRAI) :
1. INTERDIT : "Je recommande", "Il semble", "En tant qu'IA", "D'après les données".
2. FORMAT : Style Talkie-Walkie / SMS. Max 2 phrases percutantes. Pas de politesses inutiles.
3. LANGUE : Français naturel, argot de métier, direct.

ADAPTATION DU PERSONA (STRICT) :

SI CHEF (Cuisine) :
- Ton : Militaire, brutal, haché. "Oui Chef", "Envoi", "Chaud".
- Exemple : "Rupture sur le Bar. La mise en place est à la bourre. Pousse les suggestions. Compris ?"
- Focus : Stock, Marche en avant, Timing, Passe.

SI SERVICE (Salle) :
- Ton : Électrique, rapide, orienté client.
- Exemple : "La 12 s'impatiente. 20min d'attente. Offre une tournée. On bouge."
- Focus : Rotation des tables, VIP, Tensions, Pourboires.

SI MANAGER (Direction) :
- Ton : Pragmatique, "Bras Droit", focus chiffres.
- Exemple : "La masse salariale explose. Coupe 2 runners maintenant. On est à -10 couverts de l'obj."
- Focus : Ratio, Incidents, Fluidité, Offerts.

SI OWNER (Propriétaire) :
- Ton : Stratégique, concis, "Vue d'ensemble".
- Exemple : "L'ambiance est bonne mais le ticket moyen est faible. Poussez la cave à vin."
- Focus : Réputation, Cash Flow, Atmosphère.

MODALITÉ TEMPORELLE :
- SI ACTIF (Service Live) : URGENT. Pas de ponctuation complexe. Info pure.
- SI FERMÉ (Post-Shift) : Debrief cigarette sur le trottoir. Honnête mais posé.

INSTRUCTION FINALE :
Réagis UNIQUEMENT aux événements fournis. Si l'input est vide, dis "En position." ou "J'attends les bons."
`;

export const createChatSession = (role: UserRole, shiftStatus: string): Chat => {
  return getAiClient().chats.create({
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
    ? `[FLUX LIVE]:\n${contextEvents.map(e => `> [${new Date(e.timestamp).toLocaleTimeString('fr-FR').slice(0,5)}] ${e.role.toUpperCase()}: "${e.content}"`).join('\n')}\n[FIN FLUX]\n\n`
    : '[FLUX VIDE]\n\n';

  const finalPrompt = `${contextString}UTILISATEUR (${role.toUpperCase()}): ${message}`;

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
  if (!getApiKey()) return "Système hors ligne";
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        ROLE: Fantôme Opérationnel de Restaurant (Français).
        TACHE: Analyse ce contexte live.
        SORTIE: 1 Punchline (Max 10 mots). Style Militaire/Cuisine. Pas de blabla.
        CONTEXTE: ${context}
      `,
    });
    return response.text || "Service nominal.";
  } catch (e: any) {
    const isRateLimit = e.status === 429 || e.response?.status === 429 || (e.message && e.message.includes('429'));
    
    if (isRateLimit) {
      console.warn("Gemini API Rate Limit Hit (429). Using local fallback.");
      return "Trafic dense. Monitoring local.";
    }

    console.error("Insight generation failed", e);
    return "Cadence à vérifier.";
  }
};

export const summarizeDocument = async (base64Data: string, mimeType: string): Promise<string> => {
  if (!getApiKey()) throw new Error("API Key missing");

  try {
    const response = await getAiClient().models.generateContent({
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
            text: "Tu es un Manager de Restaurant pressé. Analyse ce document. Donne-moi la conclusion brutale en 1 phrase (Total, Problème Critique, ou Info Clé). Pas de 'Ce document montre'."
          }
        ]
      }
    });
    return response.text || "Doc illisible.";
  } catch (e) {
    console.error("Document summarization failed", e);
    throw new Error("Analyse échouée.");
  }
};

export const generatePreShiftBriefing = async (role: string): Promise<string[]> => {
  // 1. LOCAL STRATEGY ENGINE (Fallback)
  // Provides high-quality, role-specific advice without API calls.
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

  const getFallback = (r: string) => {
    // Find matching key or default to Manager
    const key = Object.keys(FALLBACK_STRATEGIES).find(k => r.includes(k)) || 'Manager';
    const strategies = FALLBACK_STRATEGIES[key];
    // Shuffle and pick 3 random strategies
    return strategies.sort(() => 0.5 - Math.random()).slice(0, 3);
  };

  if (!getApiKey()) {
    return getFallback(role);
  }

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        ROLE: Coach Sportif / Chef Exécutif.
        TACHE: Génère 3 points clés stratégiques pour le service de ce soir (Briefing d'avant-match).
        CIBLE: ${role}.
        TON: Motivant, Précis, Urgent.
        FORMAT: 3 phrases courtes, séparées par des sauts de ligne. Pas de numéros.
      `,
      config: {
        temperature: 0.7,
      }
    });
    
    const text = response.text || "";
    return text.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
  } catch (e: any) {
    // 2. ERROR HANDLING (429 Handling)
    const isQuotaError = e.message?.includes('429') || e.status === 429 || (e.body && e.body.includes('RESOURCE_EXHAUSTED'));
    
    if (isQuotaError) {
      console.warn("Gemini Quota Exceeded (429). Activating Local Strategy Engine.");
    } else {
      console.warn("Briefing generation offline. Using local playbook.", e);
    }
    
    // Return high-quality local data so the app never feels "broken"
    return getFallback(role);
  }
};
