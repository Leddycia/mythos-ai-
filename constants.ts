import { StoryGenre, AgeGroup, ImageStyle, MediaType, VideoFormat } from './types';

// --- CONSTANTES DE DONNÉES ---

export const STORY_GENRES = [
  { value: StoryGenre.EDUCATIONAL, label: 'Leçon / Explication de Cours' },
  { value: StoryGenre.FANTASY, label: 'Histoire Fantastique' },
  { value: StoryGenre.SCI_FI, label: 'Science-Fiction' },
  { value: StoryGenre.FOLKTALE, label: 'Conte & Légende' },
  { value: StoryGenre.MYSTERY, label: 'Mystère' },
  { value: StoryGenre.ADVENTURE, label: 'Aventure' },
];

export const AGE_GROUPS = [
  { value: AgeGroup.CHILD, label: 'Enfants (5-10 ans) - Simple & Ludique' },
  { value: AgeGroup.TEEN, label: 'Adolescents (11-17 ans) - Pertinent' },
  { value: AgeGroup.ADULT, label: 'Adultes (18+) - Expert & Détaillé' },
];

export const IMAGE_STYLES = [
  { value: ImageStyle.DIGITAL_ART, label: 'Art Numérique (Moderne)' },
  { value: ImageStyle.CARTOON, label: 'Animation 3D / Pixar' },
  { value: ImageStyle.REALISTIC, label: 'Photographies Réalistes' },
  { value: ImageStyle.WATERCOLOR, label: 'Aquarelle Douce' },
  { value: ImageStyle.OIL_PAINTING, label: 'Peinture à l\'huile Classique' },
  { value: ImageStyle.SKETCH, label: 'Esquisse au Crayon' },
  { value: ImageStyle.RETRO, label: 'Rétro / Vintage' },
];

export const MEDIA_TYPES = [
  { value: MediaType.TEXT_WITH_IMAGE, label: 'Leçon Illustrée (Texte + Image)' },
  { value: MediaType.TEXT_ONLY, label: 'Leçon Texte (Simple)' },
  { value: MediaType.VIDEO, label: 'Vidéo Explicative (Veo)' },
];

export const VIDEO_FORMATS = [
  { value: VideoFormat.MP4, label: 'MP4 (Standard Web)' },
  { value: VideoFormat.MOV, label: 'MOV (Haute Qualité)' },
];

export const LANGUAGES = [
  { value: 'Français', label: 'Français' },
  { value: 'Haitian Creole', label: 'Créole Haïtien' },
  { value: 'English', label: 'Anglais' },
  { value: 'Spanish', label: 'Espagnol' },
];

export const APP_NAME = "MythosAI";

// --- SÉCURITÉ & API ---
// Note : Les clés doivent être définies dans .env.local (local) et dans Vercel Settings (production)

// OpenAI (Remplace Gemini)
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
// Modèles recommandés : 'gpt-4o' (Rapide et intelligent) ou 'gpt-3.5-turbo' (Moins cher)
export const OPENAI_MODEL = "gpt-4o";

// ElevenLabs (Audio)
export const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || "";
export const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

// Vidéo (Pixazo) - Optionnel
export const VIDEO_API_KEY = import.meta.env.VITE_VIDEO_API_KEY || "";
export const VIDEO_API_URL = 'https://gateway.pixazo.ai/sora-video/v1/video/i2v/generate';