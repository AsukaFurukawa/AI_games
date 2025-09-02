// AI Service for integrating with Hugging Face AI APIs
// This service provides a unified interface using free Hugging Face models

export interface AIResponse {
  text: string;
  confidence: number;
  model: string;
  tokens: number;
}

export interface AIGameContext {
  gameType: 'story' | 'mystery' | 'rpg' | 'puzzle';
  gameState: any;
  conversationHistory: string[];
  playerInput: string;
  gameRules: string[];
}

// Hugging Face AI API configuration (100% FREE!)
const HUGGING_FACE_CONFIG = {
  name: 'Hugging Face',
  baseUrl: 'https://api-inference.huggingface.co/models',
  models: {
    story: 'openai-community/gpt2', // Fixed: full model path
    mystery: 'distilgpt2', // This one is correct
    rpg: 'microsoft/DialoGPT-medium', // This one is correct
    puzzle: 'openai-community/gpt2' // Fixed: full model path
  },
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_HUGGING_FACE_TOKEN || ''}`,
    'Content-Type': 'application/json'
  }
};

// Game-specific prompts and rules optimized for Hugging Face models
const GAME_PROMPTS = {
  story: {
    system: `You are an AI storyteller in a collaborative story game. Players take turns adding to the story. 
    Your role is to respond to their contributions, build upon them, and guide the narrative forward. 
    Be creative, engaging, and maintain story coherence. Keep responses under 100 words.`,
    examples: [
      'Player: "The dragon appeared from the mist"',
      'AI: "The dragon\'s scales gleamed like obsidian in the moonlight. Its ancient eyes held wisdom beyond mortal understanding. What does the dragon do next?"'
    ]
  },
  mystery: {
    system: `You are an AI detective in a mystery game. Players are solving a case together. 
    Analyze their observations, provide logical insights, and guide them toward the solution. 
    Be mysterious but helpful. Keep responses under 100 words.`,
    examples: [
      'Player: "I found a broken window"',
      'AI: "Interesting! The glass fragments suggest the break-in happened from outside. The size of the shards could tell us about the intruder\'s method. What else did you notice?"'
    ]
  },
  rpg: {
    system: `You are an AI dungeon master in a fantasy RPG. Players role-play their characters in your world. 
    Describe environments, respond to actions, and create immersive experiences. 
    Be descriptive and maintain game balance. Keep responses under 100 words.`,
    examples: [
      'Player: "I want to search the tavern"',
      'AI: "The tavern\'s dim interior reveals worn wooden tables and the lingering scent of ale. Patrons huddle in corners, speaking in hushed tones. What specifically are you looking for?"'
    ]
  },
  puzzle: {
    system: `You are an AI puzzle master. Players are solving brain teasers together. 
    Provide hints, confirm progress, and guide them toward solutions without giving away answers. 
    Be encouraging and logical. Keep responses under 100 words.`,
    examples: [
      'Player: "I think the answer is 42"',
      'AI: "You\'re thinking in the right direction! The number 42 is significant, but there\'s a pattern you haven\'t quite uncovered yet. Look at the sequence again."'
    ]
  }
};

class AIService {
  private fallbackResponses: boolean = true;

  constructor() {
    this.checkAPIKey();
  }

  private checkAPIKey(): void {
    const token = HUGGING_FACE_CONFIG.headers.Authorization;
    const hasValidToken = token && token.length > 20; // Basic validation
    
    if (!hasValidToken) {
      console.warn('No Hugging Face API key found. Using fallback responses.');
      this.fallbackResponses = true;
    } else {
      console.log('✅ Hugging Face API key found! Using real AI responses.');
      this.fallbackResponses = false;
    }
  }

  async generateGameResponse(context: AIGameContext): Promise<AIResponse> {
    try {
      const model = HUGGING_FACE_CONFIG.models[context.gameType];
      
      if (!model) {
        throw new Error('Invalid game type');
      }

      const response = await this.callHuggingFace(model, context);
      return response;
    } catch (error) {
      console.error('Hugging Face API call failed:', error);
      
      if (this.fallbackResponses) {
        return this.generateFallbackResponse(context);
      }
      
      throw error;
    }
  }

  private async callHuggingFace(model: string, context: AIGameContext): Promise<AIResponse> {
    const prompt = this.buildPrompt(context);
    
    try {
      console.log(`Calling Hugging Face API for model: ${model}`);
      console.log(`Prompt: ${prompt.substring(0, 100)}...`);
      
      const response = await fetch(`${HUGGING_FACE_CONFIG.baseUrl}/${model}`, {
        method: 'POST',
        headers: HUGGING_FACE_CONFIG.headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.8,
            do_sample: true,
            return_full_text: false,
            top_p: 0.9,
            repetition_penalty: 1.1
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Hugging Face API response error:', response.status, errorText);
        throw new Error(`Hugging Face API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Hugging Face API response:', data);
      
      // Handle different response formats from Hugging Face
      let generatedText = '';
      if (Array.isArray(data) && data[0]?.generated_text) {
        generatedText = data[0].generated_text;
      } else if (data.generated_text) {
        generatedText = data.generated_text;
      } else if (data[0]?.generated_text) {
        generatedText = data[0].generated_text;
      } else {
        // Try to extract text from the response
        generatedText = JSON.stringify(data);
        console.log('Unexpected Hugging Face response format:', data);
      }

      // Clean up the response text
      generatedText = this.cleanResponseText(generatedText, prompt);

      return {
        text: generatedText,
        confidence: 0.85,
        model: model,
        tokens: prompt.length + generatedText.length
      };
    } catch (error) {
      console.error('Hugging Face API call failed:', error);
      throw error;
    }
  }

  private cleanResponseText(text: string, originalPrompt: string): string {
    // Remove the original prompt from the response
    let cleanedText = text.replace(originalPrompt, '').trim();
    
    // Remove any incomplete sentences at the end
    if (cleanedText && !cleanedText.endsWith('.') && !cleanedText.endsWith('!') && !cleanedText.endsWith('?')) {
      const lastSentenceEnd = Math.max(
        cleanedText.lastIndexOf('.'),
        cleanedText.lastIndexOf('!'),
        cleanedText.lastIndexOf('?')
      );
      if (lastSentenceEnd > 0) {
        cleanedText = cleanedText.substring(0, lastSentenceEnd + 1);
      }
    }
    
    // Limit length to reasonable size
    if (cleanedText.length > 200) {
      cleanedText = cleanedText.substring(0, 200).trim();
      const lastSpace = cleanedText.lastIndexOf(' ');
      if (lastSpace > 0) {
        cleanedText = cleanedText.substring(0, lastSpace) + '...';
      }
    }
    
    return cleanedText || 'The story continues...';
  }

  private buildPrompt(context: AIGameContext): string {
    const gamePrompt = GAME_PROMPTS[context.gameType];
    const history = context.conversationHistory.slice(-3).join('\n'); // Last 3 messages for context
    
    return `${gamePrompt.system}

Game Context: ${context.gameType.toUpperCase()} GAME
${context.gameRules.join('\n')}

Recent Conversation:
${history}

Player Input: ${context.playerInput}

AI Response:`;
  }

  private generateFallbackResponse(context: AIGameContext): AIResponse {
    const fallbackResponses = {
      story: [
        `"${context.playerInput}"... That's a fascinating turn of events! The story continues as this new element adds depth to our narrative. What happens next in this unfolding tale?`,
        `Brilliant addition! "${context.playerInput}" creates an unexpected twist that changes everything. The world you're building is becoming more complex and intriguing.`,
        `Excellent storytelling! "${context.playerInput}" adds a whole new layer to our story. The plot thickens, and the characters must now face this new challenge.`
      ],
      mystery: [
        `Interesting observation! "${context.playerInput}" could be a crucial clue. This might connect to evidence we found earlier. What other details should we examine?`,
        `Hmm, "${context.playerInput}"... This could change our theory about the case. We need to look at this from a different angle. Any other thoughts?`,
        `Good thinking! "${context.playerInput}" opens up new possibilities. This could be the missing piece we've been looking for.`
      ],
      rpg: [
        `"${context.playerInput}" - A bold choice! Your character's actions have consequences in this world. The environment responds to your decisions. What's your next move, adventurer?`,
        `Adventure awaits! "${context.playerInput}" sets you on a path that could lead to great rewards or dangerous challenges. Where will your journey take you next?`,
        `Your character's decision to "${context.playerInput}" shows true courage! The fantasy realm responds to your choices, and new opportunities emerge.`
      ],
      puzzle: [
        `"${context.playerInput}" - That's an interesting approach! This could be part of the solution, but we might need to consider it from another perspective.`,
        `Hmm, "${context.playerInput}"... You're thinking in the right track! This is definitely related to the puzzle, but there's a twist we haven't uncovered yet.`,
        `Excellent reasoning! "${context.playerInput}" brings us closer to solving this. The pieces are starting to fit together.`
      ]
    };

    const responses = fallbackResponses[context.gameType];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      text: randomResponse,
      confidence: 0.7,
      model: 'fallback',
      tokens: randomResponse.length
    };
  }

  // Method to check if Hugging Face API is available
  isHuggingFaceAvailable(): boolean {
    const token = HUGGING_FACE_CONFIG.headers.Authorization;
    return token && token.length > 20;
  }

  // Method to get current model for a game type
  getModelForGameType(gameType: string): string {
    return HUGGING_FACE_CONFIG.models[gameType as keyof typeof HUGGING_FACE_CONFIG.models] || 'openai-community/gpt2';
  }

  // Method to get available game types
  getAvailableGameTypes(): string[] {
    return Object.keys(HUGGING_FACE_CONFIG.models);
  }

  private generateResponse(playerInput: string, context: string): string {
    const input = playerInput.toLowerCase();
    
    // Handle location-based responses
    if (input.includes('look') || input.includes('examine') || input.includes('where')) {
      return this.describeLocation();
    }
    
    // Handle NPC interactions
    if (input.includes('talk') || input.includes('ask') || input.includes('speak')) {
      return this.handleNPCTalk(input);
    }
    
    // Handle movement
    if (input.includes('go') || input.includes('move') || input.includes('walk')) {
      return this.handleMovement(input);
    }
    
    // Handle combat
    if (input.includes('fight') || input.includes('attack') || input.includes('battle')) {
      return this.handleCombat(input);
    }
    
    // Handle inventory
    if (input.includes('inventory') || input.includes('items') || input.includes('check')) {
      return this.handleInventory(input);
    }
    
    // Handle quests
    if (input.includes('quest') || input.includes('mission') || input.includes('help')) {
      return this.handleQuests(input);
    }
    
    // Default creative response
    return this.generateCreativeResponse(playerInput, context);
  }

  // Generate interactive choices for the RPG game
  public generateChoices(): string[] {
    const currentLoc = this.locations[this.gameState.currentScene];
    const choices = [];
    
    // Always show basic actions
    choices.push('🔍 Look around');
    choices.push('📦 Check inventory');
    choices.push('❓ Ask about quests');
    
    // Add location-specific choices
    if (this.gameState.currentScene === 'tavern') {
      choices.push('🍺 Order a drink');
      choices.push('🏠 Rent a room');
      choices.push('💬 Talk to innkeeper');
      choices.push('🗺️ Ask about the area');
    } else if (this.gameState.currentScene === 'market') {
      choices.push('🛒 Browse shops');
      choices.push('💰 Buy supplies');
      choices.push('💬 Talk to merchant');
      choices.push('🏰 Ask about the castle');
    } else if (this.gameState.currentScene === 'forest') {
      choices.push('🌲 Explore deeper');
      choices.push('🔍 Search for clues');
      choices.push('⚔️ Hunt for food');
      choices.push('💬 Talk to ranger');
    } else if (this.gameState.currentScene === 'dungeon') {
      choices.push('⚔️ Search for treasure');
      choices.push('🔍 Investigate rooms');
      choices.push('💀 Fight monsters');
      choices.push('💬 Talk to prisoner');
    }
    
    // Add movement choices
    choices.push('🚶 Move to another location');
    
    // Add combat choices if in danger
    if (this.gameState.health < 50) {
      choices.push('💊 Use healing potion');
      choices.push('🏃 Run away');
    }
    
    return choices;
  }

  // Get current location info for the UI
  public getCurrentLocationInfo(): any {
    const currentLoc = this.locations[this.gameState.currentScene];
    return {
      name: currentLoc.name,
      description: currentLoc.description,
      exits: currentLoc.exits,
      npcs: currentLoc.npcs,
      items: currentLoc.items
    };
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types for use in components
export type { AIGameContext, AIResponse };
