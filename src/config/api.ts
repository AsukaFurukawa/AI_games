export const API_CONFIG = {
  GEMINI_API_KEY: 'AIzaSyAPMuK1nh9v5DHgb81_UkVdbV9D4IUs_SE',
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || '',
  ELEVENLABS_API_KEY: process.env.REACT_APP_ELEVENLABS_API_KEY || '',
  ELEVENLABS_VOICE_ID: 'TRnaQb7q41oL7sV0w6Bu', // Your preferred voice ID
};

export const GAME_CONFIG = {
  MAX_PLAYERS_PER_ROOM: 8,
  DEFAULT_TIMEOUT: 30000,
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_INDICATOR_DELAY: 1000,
};

export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  LOADING_DELAY: 3000,
  PARTICLE_COUNT: 50,
  MAX_NOTIFICATIONS: 5,
};
