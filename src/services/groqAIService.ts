interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class GroqAIService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private models = ['llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'llama-3.1-70b-versatile'];
  private currentModelIndex = 0;

  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    console.log('Groq API Key loaded:', this.apiKey ? 'Yes' : 'No');
    if (!this.apiKey) {
      console.warn('Groq API key not found in environment variables');
    }
  }

  async generateResponse(messages: GroqMessage[], gameContext?: string): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
    }

    try {
      const systemPrompt = this.getSystemPrompt(gameContext);
      const requestMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.models[this.currentModelIndex],
          messages: requestMessages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          model: this.models[this.currentModelIndex]
        });
        
        // Try next model if current one fails
        if (this.currentModelIndex < this.models.length - 1) {
          console.log(`Trying next model: ${this.models[this.currentModelIndex + 1]}`);
          this.currentModelIndex++;
          return this.generateResponse(messages, gameContext);
        }
        
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data: GroqResponse = await response.json();
      return data.choices[0]?.message?.content || this.getFallbackResponse(messages[messages.length - 1]?.content || '');
    } catch (error) {
      console.error('Groq API error:', error);
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
    }
  }

  private getSystemPrompt(gameContext?: string): string {
    const basePrompt = `You are an AI Game Assistant for AI GameVerse, a chat-based gaming platform. You're friendly, enthusiastic, and love helping users play games and have fun conversations.

Your capabilities:
- Play games through chat (Mystery Manor, Brain Teaser, Tic-Tac-Toe, Hangman, etc.)
- Have engaging conversations
- Provide game hints and explanations
- Be creative and entertaining

Game Detection Keywords:
- Mystery Manor: "mystery", "haunted", "manor", "investigation"
- Brain Teaser: "puzzle", "riddle", "brain teaser", "logic"
- Normal Games: "tic tac toe", "hangman", "rock paper scissors", "number guessing"

Always be helpful, encouraging, and make the experience fun!`;

    if (gameContext) {
      return `${basePrompt}\n\nCurrent Game Context: ${gameContext}`;
    }

    return basePrompt;
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Game detection fallback
    if (lowerMessage.includes('mystery') || lowerMessage.includes('haunted')) {
      return "🏚️ **Mystery Manor!** I'd love to help you solve mysteries in the haunted mansion! Let me start the game for you...";
    }
    
    if (lowerMessage.includes('puzzle') || lowerMessage.includes('riddle') || lowerMessage.includes('brain teaser')) {
      return "🧠 **Brain Teaser!** Get ready to challenge your mind with puzzles and riddles! Let me set up the game...";
    }
    
    if (lowerMessage.includes('tic tac toe') || lowerMessage.includes('hangman') || lowerMessage.includes('normal game')) {
      return "🎮 **Classic Games!** I can play tic-tac-toe, hangman, rock paper scissors, and more! Which one interests you?";
    }

    if (lowerMessage.includes('play') && lowerMessage.includes('game')) {
      return "🎮 **Let's Play!** I can help you with:\n• Mystery Manor (mystery solving)\n• Brain Teaser (puzzles & riddles)\n• Classic games (tic-tac-toe, hangman, etc.)\n\nWhat would you like to play?";
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return "🤖 **I'm your AI Game Assistant!**\n\n**I can:**\n• Play games with you through chat\n• Have fun conversations\n• Help solve puzzles\n• Provide entertainment\n\n**Just ask me to play any game!**";
    }

    // General conversation fallbacks
    const responses = [
      "That's interesting! Tell me more about that.",
      "I love chatting with you! What else is on your mind?",
      "That sounds fascinating! I'd love to hear more.",
      "You're so creative! What other ideas do you have?",
      "I'm here to help! Is there anything specific you'd like to know?",
      "That's a great point! What do you think about it?",
      "I'm always happy to chat! What's your favorite topic?",
      "You seem really knowledgeable! Tell me more.",
      "That's awesome! I love learning new things from you.",
      "You're making me think! What's your perspective on this?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  async generateGameContent(gameType: string, difficulty: string = 'medium'): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'user',
        content: `Generate a ${gameType} game content for difficulty level ${difficulty}. Make it engaging and fun!`
      }
    ];

    return await this.generateResponse(messages, `Generating ${gameType} game content`);
  }

  async getGameHint(gameType: string, currentState: string): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'user',
        content: `Provide a helpful hint for this ${gameType} game. Current state: ${currentState}`
      }
    ];

    return await this.generateResponse(messages, `Providing hint for ${gameType}`);
  }
}

export default new GroqAIService();
