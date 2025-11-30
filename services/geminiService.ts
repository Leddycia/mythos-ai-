import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { StoryRequest, GeneratedStory, StoryGenre, MediaType, ImageStyle, VideoFormat } from '../types';
import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, GEMINI_API_KEY } from '../constants';

// --- SERVICE AUDIO ELEVENLABS ---

export const generateElevenLabsAudio = async (text: string): Promise<string> => {
    const cleanText = text
        .replace(/[*#_]/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/^(Introduction|Conclusion|Titre|Concept|Résumé)\s*:/gmi, '')
        .trim();

    try {
        // Utilisation directe de la constante ou fallback sur env
        const apiKey = ELEVENLABS_API_KEY || import.meta.env.VITE_ELEVENLABS_API_KEY;

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text: cleanText,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                }
            }),
        });

        if (!response.ok) {
            console.warn("ElevenLabs limit reached or error, falling back...");
            return ""; 
        }

        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error("Erreur génération audio ElevenLabs:", error);
        return "";
    }
};

// --- SERVICE IMAGE GRATUIT (Pollinations.ai) ---

const generateFreeImage = async (prompt: string, style: ImageStyle): Promise<string> => {
    const enhancedPrompt = `${prompt}, ${style} style, high quality, detailed, 8k resolution, cinematic lighting`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&model=flux&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Url = reader.result as string;
                resolve(base64Url);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Erreur génération image gratuite:", error);
        return "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000";
    }
}

// --- SERVICE VIDEO (SIMULATION) ---

const simulateVideoFromImage = async (base64ImageWithHeader: string): Promise<string> => {
    console.log("Simulation vidéo active...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return base64ImageWithHeader;
}

// --- MOCK DATA FOR DEMO MODE ---
const getMockStory = (topic: string): GeneratedStory => ({
    title: `Démo : ${topic}`,
    content: `Ceci est une histoire de démonstration générée car la clé API Google Gemini n'a pas été détectée.
    
    MythosAI fonctionne normalement en se connectant à l'intelligence artificielle de Google. En attendant que vous configuriez votre clé API, voici un exemple de ce à quoi ressemble une leçon.
    
    Le sujet demandé était : **${topic}**.`,
    imagePrompt: "Futuristic artificial intelligence glowing brain interface, digital art",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1000",
    isVideoSimulated: true,
    nextStepSuggestion: "Voulez-vous que je vous explique comment fonctionne une API plus en détail ?"
});

// --- FONCTIONS EXPORTÉES ---

export const regenerateAudio = async (text: string): Promise<string | undefined> => {
    return await generateElevenLabsAudio(text);
};

export const regenerateStoryImage = async (
  currentPrompt: string, 
  style: ImageStyle,
  mediaType: MediaType,
  videoFormat?: VideoFormat
): Promise<{ imageUrl: string; videoUrl?: string; videoError?: string; videoFormat?: VideoFormat; isVideoSimulated?: boolean }> => {
  
  let imageUrl = "";
  try {
      imageUrl = await generateFreeImage(currentPrompt, style);
  } catch (e) {
      imageUrl = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000";
  }

  let videoUrl: string | undefined;
  let isVideoSimulated = false;

  if (mediaType === MediaType.VIDEO && imageUrl) {
      videoUrl = await simulateVideoFromImage(imageUrl);
      isVideoSimulated = true;
  }

  return { imageUrl, videoUrl, videoFormat, isVideoSimulated };
};

export const generateFullStory = async (request: StoryRequest): Promise<GeneratedStory> => {
  // 1. RECUPERATION DE LA CLÉ API
  // CORRECTION ICI : On utilise le nom exact qui est dans le .env
  const apiKey = GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

  // 2. MODE DÉMO / FALLBACK
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      console.warn("⚠️ CLÉ MANQUANTE : Passage en mode DÉMO.");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return getMockStory(request.topic);
  }

  // CORRECTION ICI : Utilisation de la bonne classe GoogleGenerativeAI
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const culturePrompt = request.includeHaitianCulture
      ? "IMPORTANT: Intégrez naturellement des références haïtiennes (lieux, proverbes, culture) dans le récit sans le forcer."
      : "";

    const isEducational = request.genre === StoryGenre.EDUCATIONAL;
    const isVideoMode = request.mediaType === MediaType.VIDEO;
    const isConversation = request.isFollowUp;

    let systemInstruction = "";
    let taskDescription = "";
    let constraints = "";
    let historyContext = "";

    if (request.conversationHistory && request.conversationHistory.length > 0) {
        const historyStr = request.conversationHistory.map(turn => 
            `${turn.role === 'user' ? 'Élève/Utilisateur' : 'Professeur Mythos'}: "${turn.text}"`
        ).join('\n');
        
        historyContext = `HISTORIQUE:\n${historyStr}\nINSTRUCTION: Répondez à la dernière intervention.`;
    }

    const narrativeConstraints = `
    RÈGLES :
    1. Pas de titres explicites.
    2. Ton naturel.
    3. Pas de listes à puces excessives.
    `;

    if (isVideoMode) {
        constraints = `CONTRAINTE VIDEO (15s): Texte COURT (Max 40 mots). Script dynamique. ${narrativeConstraints}`;
    } else {
        constraints = `Soyez complet mais conversationnel. ${narrativeConstraints}`;
    }

    if (isEducational) {
        if (isConversation) {
             systemInstruction = `Vous êtes "Professeur Mythos". Répondez aux questions, soyez encourageant. Finissez par une question ouverte.`;
             taskDescription = `L'utilisateur dit : "${request.topic}". Répondez.`;
        } else {
            systemInstruction = `Guide pédagogue. Expliquez le concept et proposez une suite.`;
            taskDescription = `Expliquez : "${request.topic}".`;
        }
    } else {
        if (isConversation) {
             systemInstruction = "Maître du Donjon. Continuez l'histoire selon la réponse du joueur.";
             taskDescription = `L'utilisateur dit : "${request.topic}". Continuez l'histoire.`;
        } else {
            systemInstruction = "Conteur captivant. Racontez une histoire et proposez une suite.";
            taskDescription = `Racontez une histoire sur : "${request.topic}".`;
        }
    }

    const prompt = `
      ${systemInstruction}
      ${historyContext}
      TÂCHE : ${taskDescription}
      ${constraints}
      Public : ${request.ageGroup}, Langue : ${request.language}
      ${culturePrompt}
      Générez aussi un prompt image en ANGLAIS.
      
      Retournez JSON :
      { "title": "...", "content": "...", "imagePrompt": "...", "nextStepSuggestion": "..." }
    `;

    // CORRECTION ICI : Utilisation de genAI.getGenerativeModel
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash', // Ou 'gemini-pro' selon ta préférence
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT, // CORRECTION : SchemaType au lieu de Type
                properties: {
                    title: { type: SchemaType.STRING },
                    content: { type: SchemaType.STRING },
                    imagePrompt: { type: SchemaType.STRING },
                    nextStepSuggestion: { type: SchemaType.STRING },
                },
                required: ["title", "content", "imagePrompt", "nextStepSuggestion"],
            }
        }
    });

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const textData = JSON.parse(textResponse);

    const title = textData.title || request.topic;
    const content = textData.content || "Contenu non disponible.";
    const imagePromptText = textData.imagePrompt || `Illustration of ${request.topic}`;
    const nextStepSuggestion = textData.nextStepSuggestion || "Continuer...";

    // === 2. IMAGE GENERATION ===
    let imageUrl: string | undefined;
    if (request.mediaType !== MediaType.TEXT_ONLY) {
        try {
            const cultureStyle = request.includeHaitianCulture ? "Caribbean aesthetic, vibrant colors, " : "";
            const finalImagePrompt = `${imagePromptText}, ${cultureStyle}`;
            imageUrl = await generateFreeImage(finalImagePrompt, request.imageStyle);
        } catch (imgError) {
            imageUrl = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000";
        }
    }

    // === 3. VIDEO GENERATION ===
    let videoUrl: string | undefined;
    let isVideoSimulated = false;
    if (request.mediaType === MediaType.VIDEO && imageUrl) {
         videoUrl = await simulateVideoFromImage(imageUrl);
         isVideoSimulated = true;
    }

    // === 4. AUDIO GENERATION ===
    let audioUrl: string | undefined;
    try {
        audioUrl = await generateElevenLabsAudio(content);
    } catch (audioError) {
        console.warn("Audio generation failed");
    }

    return {
        title,
        content,
        imageUrl, 
        audioUrl,
        videoUrl,
        imagePrompt: imagePromptText,
        videoFormat: request.videoFormat,
        isVideoSimulated,
        nextStepSuggestion
    };

  } catch (error: any) {
    console.error("Content generation failed:", error);
    // Si l'erreur est liée à la clé ou aux quotas, fallback
    if (error.message?.includes('API key') || error.message?.includes('403') || error.message?.includes('401')) {
        return getMockStory(request.topic);
    }
    throw new Error("Une erreur est survenue. Le mode démo a été activé.");
  }
};