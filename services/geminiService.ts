// services/openAiService.ts
import OpenAI from 'openai';
import { OPENAI_API_KEY, OPENAI_MODEL } from '../constants';

// Initialisation du client OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Nécessaire si tu fais l'appel depuis le front-end (Vite)
});

// Interface de retour (Doit correspondre à ce que tu avais avant)
export interface GeneratedStory {
  title: string;
  content: string;
  imagePrompt: string;
  nextStepsSuggestion: string;
}

export const generateFullStory = async (topic: string, videoFormat: string): Promise<GeneratedStory> => {
  try {
    const systemPrompt = `
      Tu es un assistant créatif expert en narration.
      Tu dois générer une histoire basée sur le sujet fourni.
      IMPORTANT : Tu dois répondre UNIQUEMENT au format JSON strict.
      Ne mets pas de balises markdown comme \`\`\`json.
      
      Structure attendue du JSON :
      {
        "title": "Titre accrocheur",
        "content": "L'histoire complète...",
        "imagePrompt": "Description détaillée pour générer une image de couverture",
        "nextStepsSuggestion": "Une idée pour la suite de l'histoire"
      }
    `;

    const userPrompt = `Sujet de l'histoire : ${topic}. Format vidéo souhaité : ${videoFormat}.`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" }, // Force le mode JSON (très utile !)
    });

    const result = completion.choices[0].message.content;
    
    if (!result) throw new Error("Aucun contenu généré par OpenAI");

    // Parsing du JSON
    const parsedData = JSON.parse(result);

    return {
      title: parsedData.title,
      content: parsedData.content,
      imagePrompt: parsedData.imagePrompt,
      nextStepsSuggestion: parsedData.nextStepsSuggestion,
      // Ajoute ici les champs manquants si ton interface en demande d'autres (ex: imageUrl, videoUrl vides par défaut)
    } as GeneratedStory;

  } catch (error) {
    console.error("Erreur OpenAI generation:", error);
    throw error;
  }
};