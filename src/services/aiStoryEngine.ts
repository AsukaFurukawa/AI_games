// AI Story Engine for Fantasy Quest - AI Dungeon Style
// Features: Dynamic storytelling, context awareness, choice-based gameplay

export interface StoryContext {
  currentScene: string;
  playerCharacter: PlayerCharacter;
  worldState: WorldState;
  storyMemory: StoryMemory[];
  recentActions: string[];
  mood: 'peaceful' | 'tense' | 'dangerous' | 'mysterious' | 'epic';
  timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
  weather: 'clear' | 'rainy' | 'stormy' | 'foggy' | 'magical';
  npcRelationships: { [key: string]: NPCState };
  activeQuests: QuestState[];
  inventory: InventoryItem[];
  location: LocationState;
  companions: CompanionState[];
}

export interface PlayerCharacter {
  name: string;
  race: string;
  class: string;
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  experience: number;
  experienceToNext: number;
  skills: { [key: string]: number };
  spells: string[];
  personality: string;
  background: string;
  goals: string[];
  fears: string[];
  relationships: { [key: string]: string };
}

export interface WorldState {
  currentEra: string;
  politicalClimate: string;
  magicalLevel: string;
  technologyLevel: string;
  majorEvents: string[];
  activeConflicts: string[];
  hiddenSecrets: string[];
  worldLore: { [key: string]: string };
}

export interface StoryMemory {
  id: string;
  type: 'conversation' | 'action' | 'discovery' | 'relationship' | 'quest';
  content: string;
  importance: number; // 1-10
  timestamp: Date;
  characters: string[];
  location: string;
  emotionalImpact: string;
}

export interface NPCState {
  name: string;
  role: string;
  personality: string;
  currentMood: string;
  relationship: number; // -100 to 100
  knowledge: string[];
  secrets: string[];
  currentLocation: string;
  schedule: { [key: string]: string };
  quests: string[];
}

export interface QuestState {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'hidden' | 'dynamic';
  objectives: QuestObjective[];
  rewards: QuestReward[];
  status: 'available' | 'active' | 'completed' | 'failed';
  timeLimit?: number;
  consequences: string[];
  branchingPaths: string[];
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'explore' | 'talk' | 'craft' | 'deliver' | 'discover';
  target: string;
  current: number;
  required: number;
  completed: boolean;
  alternativeSolutions: string[];
}

export interface QuestReward {
  type: 'experience' | 'gold' | 'item' | 'reputation' | 'skill' | 'spell' | 'relationship' | 'knowledge';
  value: number;
  itemId?: string;
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
  effects: string[];
  value: number;
  weight: number;
  quantity: number;
  storySignificance: string;
}

export interface LocationState {
  name: string;
  type: string;
  description: string;
  atmosphere: string;
  dangers: string[];
  opportunities: string[];
  hiddenFeatures: string[];
  npcs: string[];
  items: string[];
  connections: string[];
  currentEvents: string[];
}

export interface CompanionState {
  id: string;
  name: string;
  type: string;
  personality: string;
  skills: string[];
  currentMood: string;
  relationship: number;
  loyalty: number;
  goals: string[];
  fears: string[];
  secrets: string[];
}

export interface StoryResponse {
  narrative: string;
  choices: StoryChoice[];
  consequences: string[];
  worldChanges: WorldChange[];
  emotionalImpact: string;
  atmosphere: string;
  music: string;
  soundEffects: string[];
  visualEffects: string[];
}

export interface StoryChoice {
  id: string;
  text: string;
  type: 'action' | 'dialogue' | 'exploration' | 'combat' | 'stealth' | 'magic' | 'social';
  consequences: string[];
  requirements: string[];
  risks: string[];
  rewards: string[];
  icon: string;
}

export interface WorldChange {
  type: 'location' | 'relationship' | 'quest' | 'inventory' | 'reputation' | 'world';
  target: string;
  change: string;
  magnitude: number;
  duration: number;
}

export interface AIStoryEngine {
  context: StoryContext;
  storyHistory: string[];
  generateStory(userInput: string): Promise<StoryResponse>;
  updateContext(changes: WorldChange[]): void;
  generateChoices(context: StoryContext): StoryChoice[];
  processUserAction(action: string): void;
  generateNPCResponse(npcName: string, context: string): string;
  createDynamicQuest(context: StoryContext): QuestState;
  generateLocationDescription(location: string, context: StoryContext): string;
}

export class FantasyQuestStoryEngine implements AIStoryEngine {
  public context: StoryContext;
  private storyHistory: string[] = [];
  private groqApiKey: string;
  private basePrompt: string;

  constructor(groqApiKey: string) {
    this.groqApiKey = groqApiKey;
    this.basePrompt = this.initializeBasePrompt();
    this.context = this.initializeContext();
  }

  private initializeBasePrompt(): string {
    return `You are an AI Dungeon Master for "Fantasy Quest", a retro-style RPG inspired by 90s Nintendo Game Boy Advanced games like Pokemon, Final Fantasy, and Dragon Quest. You create IMMERSIVE, DYNAMIC storytelling that feels like playing a classic RPG.

CORE RULES (NEVER BREAK THESE):
1. ALWAYS generate 4-6 SPECIFIC, STORY-ADVANCING choices - NEVER generic ones like "explore" or "talk"
2. Each choice must be a complete action that directly impacts the plot
3. Remember EVERYTHING that happened before and build upon it
4. Create branching consequences that matter
5. Use rich sensory details (sounds, smells, visuals, atmosphere)
6. Make NPCs feel alive with unique personalities and goals

RESPONSE FORMAT (FOLLOW EXACTLY):
[2-3 paragraphs of rich narrative that advances the story based on player action]

CHOICES:
1. [Specific action that will change the story - be creative and unique]
2. [Specific action that will change the story - be creative and unique]
3. [Specific action that will change the story - be creative and unique]
4. [Specific action that will change the story - be creative and unique]

STYLE: Write like a 90s RPG with pixel art aesthetic, magical systems, and epic adventure. Each choice should feel like selecting from a classic RPG menu.`;
  }

  private initializeContext(): StoryContext {
    return {
      currentScene: "The Whispering Tavern - A cozy inn filled with the warm glow of candlelight and the murmur of travelers sharing tales",
      playerCharacter: {
        name: "Adventurer",
        race: "Human",
        class: "Battle Mage",
        level: 1,
        health: 100,
        maxHealth: 100,
        mana: 75,
        maxMana: 75,
        experience: 0,
        experienceToNext: 100,
        skills: { 
          "swordplay": 3, 
          "magic": 4, 
          "stealth": 2, 
          "persuasion": 2,
          "perception": 3,
          "survival": 2 
        },
        spells: [
          "Detect Magic (15 mana)",
          "Charm Person (25 mana)", 
          "Light (5 mana)",
          "Mage Hand (10 mana)"
        ],
        personality: "Brave and curious, seeking adventure and meaning",
        background: "A wandering battle mage from a distant land, drawn to this region by mysterious dreams",
        goals: ["Discover the truth about the ancient ruins", "Find the missing merchant", "Uncover the secrets of Mysticara"],
        fears: ["Losing companions", "Failing those who depend on them"],
        relationships: { "Innkeeper": "friendly", "Merchant": "concerned" }
      },
      worldState: {
        currentEra: "Age of Discovery",
        politicalClimate: "Tense - tensions between local lords and mysterious forces",
        magicalLevel: "High - magic is common but dangerous",
        technologyLevel: "Medieval with magical enhancements",
        majorEvents: ["Merchant disappearance", "Ancient ruins awakening", "Strange weather patterns"],
        activeConflicts: ["Local bandit activity", "Disputes over ancient artifacts"],
        hiddenSecrets: ["The ruins contain a sleeping ancient power", "The merchant knew something important"],
        worldLore: {
          "Mysticara": "A land where magic and reality blur, home to ancient civilizations and forgotten knowledge",
          "The Whispering Tavern": "Built on a ley line intersection, the tavern seems to know things before they happen"
        }
      },
      storyMemory: [
        {
          id: "start",
          type: "discovery",
          content: "Arrived at The Whispering Tavern seeking information about the missing merchant",
          importance: 8,
          timestamp: new Date(),
          characters: ["Adventurer", "Innkeeper"],
          location: "The Whispering Tavern",
          emotionalImpact: "Curiosity and concern"
        }
      ],
      recentActions: ["Arrived at tavern", "Met innkeeper"],
      mood: "mysterious",
      timeOfDay: "evening",
      weather: "clear",
      npcRelationships: {
        "Innkeeper": {
          name: "Mara",
          role: "Tavern owner and information broker",
          personality: "Wise, observant, knows more than she lets on",
          currentMood: "concerned but helpful",
          relationship: 25,
          knowledge: ["Local gossip", "Merchant routes", "Ancient legends"],
          secrets: ["Can sense magical disturbances", "Has prophetic dreams"],
          currentLocation: "The Whispering Tavern",
          schedule: { "morning": "preparing", "afternoon": "serving", "evening": "gossiping", "night": "observing" },
          quests: ["Find the missing merchant", "Investigate ancient ruins"]
        }
      },
      activeQuests: [
        {
          id: "missing_merchant",
          title: "The Missing Merchant",
          description: "A traveling merchant has disappeared near the ancient ruins. Find out what happened.",
          type: "main",
          objectives: [
            {
              id: "investigate_tavern",
              description: "Gather information at the tavern",
              type: "talk",
              target: "Innkeeper and patrons",
              current: 1,
              required: 3,
              completed: false,
              alternativeSolutions: ["Bribe for information", "Use intimidation", "Offer to help with other problems"]
            }
          ],
          rewards: [
            { type: "reputation", value: 50, description: "Gain trust of local community" },
            { type: "knowledge", value: 1, description: "Learn about ancient ruins" }
          ],
          status: "active",
          consequences: ["Merchant's fate revealed", "Ancient ruins connection discovered"],
          branchingPaths: ["Merchant is alive but trapped", "Merchant discovered ancient secret", "Merchant was kidnapped by bandits"]
        }
      ],
      inventory: [
        {
          id: "sword",
          name: "Steel Longsword",
          type: "weapon",
          rarity: "common",
          description: "A reliable weapon with a slight magical resonance",
          effects: ["+2 to combat rolls"],
          value: 50,
          weight: 3,
          quantity: 1,
          storySignificance: "Family heirloom with mysterious origins"
        }
      ],
      location: {
        name: "The Whispering Tavern",
        type: "Inn and gathering place",
        description: "A cozy tavern built on ancient ley lines, where secrets seem to whisper from the very walls",
        atmosphere: "Warm, mysterious, slightly magical",
        dangers: ["Information brokers", "Hidden agendas", "Magical eavesdropping"],
        opportunities: ["Gather intelligence", "Make connections", "Find quests"],
        hiddenFeatures: ["Secret passages", "Magical wards", "Hidden meeting rooms"],
        npcs: ["Mara (Innkeeper)", "Traveling merchants", "Local guards", "Mysterious strangers"],
        items: ["Ancient maps", "Magical trinkets", "Information"],
        connections: ["Market Square", "Ancient Ruins", "Forest Path", "Dungeon Entrance"],
        currentEvents: ["Merchant disappearance", "Increased magical activity", "Strange dreams among patrons"]
      },
      companions: []
    };
  }

  async generateStory(userInput: string): Promise<StoryResponse> {
    try {
      // Build context-aware prompt
      const fullPrompt = this.buildStoryPrompt(userInput);
      
      // Call Groq API for story generation
      const storyResponse = await this.callGroqAPI(fullPrompt);
      
      // Parse and enhance the response
      const enhancedResponse = this.enhanceStoryResponse(storyResponse, userInput);
      
      // Update context based on the story
      this.updateContext(enhancedResponse.worldChanges);
      
      // Add to story history
      this.storyHistory.push(userInput);
      this.storyHistory.push(enhancedResponse.narrative);
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error generating story:', error);
      return this.generateFallbackResponse(userInput);
    }
  }

  private buildStoryPrompt(userInput: string): string {
    const recentContext = this.storyHistory.slice(-5).join('\n');
    const currentMood = this.context.mood;
    const timeOfDay = this.context.timeOfDay;
    const weather = this.context.weather;
    
    return `${this.basePrompt}

CURRENT SITUATION:
Scene: ${this.context.currentScene}
Mood: ${currentMood} | Time: ${timeOfDay} | Weather: ${weather}
Player: ${this.context.playerCharacter.name} (${this.context.playerCharacter.race} ${this.context.playerCharacter.class})
Active Quests: ${this.context.activeQuests.map(q => q.title).join(', ')}

RECENT STORY EVENTS:
${recentContext}

PLAYER'S ACTION: "${userInput}"

IMPORTANT: Based on this action, create a compelling narrative that advances the story, then provide exactly 4 creative choices that will lead to different story branches. Each choice must be specific and impactful.`;
  }

  private async callGroqAPI(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are an expert fantasy storyteller and game master.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1500,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Groq API call failed:', error);
      throw error;
    }
  }

  private enhanceStoryResponse(rawResponse: string, userInput: string): StoryResponse {
    // Parse the AI response and extract actual choices
    const narrative = this.extractNarrative(rawResponse);
    const choices = this.parseChoicesFromAIResponse(rawResponse);
    const consequences = this.generateConsequences(userInput);
    const worldChanges = this.generateWorldChanges(userInput);
    
    return {
      narrative,
      choices,
      consequences,
      worldChanges,
      emotionalImpact: this.calculateEmotionalImpact(userInput),
      atmosphere: this.context.location.atmosphere,
      music: this.selectMusic(this.context.mood),
      soundEffects: this.generateSoundEffects(this.context.location),
      visualEffects: this.generateVisualEffects(this.context.mood)
    };
  }

  private extractNarrative(rawResponse: string): string {
    // Extract the narrative part from the AI response (everything before CHOICES:)
    const choicesIndex = rawResponse.indexOf('CHOICES:');
    if (choicesIndex !== -1) {
      return rawResponse.substring(0, choicesIndex).trim();
    }
    
    // Fallback: filter out choice-like lines
    const lines = rawResponse.split('\n');
    const narrativeLines = lines.filter(line => 
      line.trim() && 
      !line.includes('Choice') && 
      !line.includes('Option') && 
      !line.includes('1.') && 
      !line.includes('2.') && 
      !line.includes('3.') && 
      !line.includes('4.') &&
      !line.includes('5.') &&
      !line.includes('6.')
    );
    
    return narrativeLines.join('\n').trim() || rawResponse;
  }

  private parseChoicesFromAIResponse(rawResponse: string): StoryChoice[] {
    const choices: StoryChoice[] = [];
    
    // Look for the CHOICES: section
    const choicesIndex = rawResponse.indexOf('CHOICES:');
    if (choicesIndex === -1) {
      // Fallback to generic choices if AI didn't follow format
      return this.generateFallbackChoices();
    }
    
    // Extract the choices section
    const choicesSection = rawResponse.substring(choicesIndex);
    const lines = choicesSection.split('\n');
    
    let choiceNumber = 1;
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for numbered choices (1., 2., 3., etc.)
      if (/^\d+\./.test(trimmedLine)) {
        const choiceText = trimmedLine.replace(/^\d+\.\s*/, '').trim();
        if (choiceText) {
          choices.push({
            id: `choice_${choiceNumber}`,
            text: choiceText,
            type: this.determineChoiceType(choiceText),
            consequences: this.generateChoiceConsequences(choiceText),
            requirements: [],
            risks: this.generateChoiceRisks(choiceText),
            rewards: this.generateChoiceRewards(choiceText),
            icon: this.getChoiceIcon(choiceText)
          });
          choiceNumber++;
        }
      }
      
      // Stop if we have 6 choices or reach the end
      if (choices.length >= 6) break;
    }
    
    // If we didn't get enough choices from AI, add fallback ones
    while (choices.length < 4) {
      const fallbackChoice = this.generateFallbackChoices()[choices.length];
      if (fallbackChoice) {
        choices.push(fallbackChoice);
      }
    }
    
    return choices;
  }

  private determineChoiceType(choiceText: string): 'action' | 'dialogue' | 'exploration' | 'combat' | 'stealth' | 'magic' | 'social' {
    const text = choiceText.toLowerCase();
    
    if (text.includes('attack') || text.includes('fight') || text.includes('battle')) return 'combat';
    if (text.includes('talk') || text.includes('ask') || text.includes('conversation')) return 'dialogue';
    if (text.includes('sneak') || text.includes('stealth') || text.includes('hide')) return 'stealth';
    if (text.includes('spell') || text.includes('magic') || text.includes('cast')) return 'magic';
    if (text.includes('explore') || text.includes('search') || text.includes('investigate')) return 'exploration';
    if (text.includes('help') || text.includes('ally') || text.includes('team')) return 'social';
    
    return 'action';
  }

  private generateChoiceConsequences(choiceText: string): string[] {
    const text = choiceText.toLowerCase();
    const consequences = [];
    
    if (text.includes('cast') || text.includes('spell') || text.includes('magic')) {
      consequences.push("Mana consumption", "Magical effects triggered", "May attract magical attention");
    } else if (text.includes('attack') || text.includes('fight') || text.includes('battle')) {
      consequences.push("Combat initiated", "Experience gained", "Reputation affected");
    } else if (text.includes('sneak') || text.includes('stealth') || text.includes('hide')) {
      consequences.push("Stealth mechanics", "Hidden areas revealed", "Avoids confrontation");
    } else if (text.includes('talk') || text.includes('ask') || text.includes('charm')) {
      consequences.push("Relationship building", "Information gained", "Social skills improved");
    } else if (text.includes('explore') || text.includes('search') || text.includes('investigate')) {
      consequences.push("New areas discovered", "Items found", "Quests unlocked");
    } else if (text.includes('skill') || text.includes('check')) {
      consequences.push("Skill progression", "Success/failure chance", "Character development");
    }
    
    return consequences.length > 0 ? consequences : ["Story advances", "Character grows"];
  }

  private generateChoiceRisks(choiceText: string): string[] {
    const text = choiceText.toLowerCase();
    const risks = [];
    
    if (text.includes('cast') || text.includes('spell') || text.includes('magic')) {
      risks.push("Mana drain", "Magical backlash", "Attracts magical beings");
    } else if (text.includes('attack') || text.includes('fight') || text.includes('battle')) {
      risks.push("Health loss", "Enemy reinforcements", "Reputation damage");
    } else if (text.includes('sneak') || text.includes('stealth') || text.includes('hide')) {
      risks.push("Detection chance", "Trap activation", "Missed opportunities");
    } else if (text.includes('talk') || text.includes('ask') || text.includes('charm')) {
      risks.push("Information revealed", "Deception risk", "Relationship damage");
    } else if (text.includes('explore') || text.includes('search') || text.includes('investigate')) {
      risks.push("Dangerous encounters", "Resource consumption", "Time pressure");
    } else if (text.includes('skill') || text.includes('check')) {
      risks.push("Skill failure", "Resource cost", "Negative consequences");
    }
    
    return risks.length > 0 ? risks : ["Unknown outcomes", "Potential failure"];
  }

  private generateChoiceRewards(choiceText: string): string[] {
    const text = choiceText.toLowerCase();
    const rewards = [];
    
    if (text.includes('cast') || text.includes('spell') || text.includes('magic')) {
      rewards.push("Magical insights", "Spell mastery", "Mystical knowledge");
    } else if (text.includes('attack') || text.includes('fight') || text.includes('battle')) {
      rewards.push("Combat experience", "Weapon proficiency", "Battle reputation");
    } else if (text.includes('sneak') || text.includes('stealth') || text.includes('hide')) {
      rewards.push("Stealth mastery", "Hidden treasures", "Secret knowledge");
    } else if (text.includes('talk') || text.includes('ask') || text.includes('charm')) {
      rewards.push("Social connections", "Valuable information", "Alliance building");
    } else if (text.includes('explore') || text.includes('search') || text.includes('investigate')) {
      rewards.push("Rare items", "New locations", "Quest discoveries");
    } else if (text.includes('skill') || text.includes('check')) {
      rewards.push("Skill points", "Character growth", "Ability unlocks");
    }
    
    return rewards.length > 0 ? rewards : ["Experience gained", "Story progression"];
  }

  private getChoiceIcon(choiceText: string): string {
    const text = choiceText.toLowerCase();
    
    if (text.includes('attack') || text.includes('fight')) return "⚔️";
    if (text.includes('talk') || text.includes('ask')) return "💬";
    if (text.includes('sneak') || text.includes('stealth')) return "👁️";
    if (text.includes('spell') || text.includes('magic')) return "✨";
    if (text.includes('explore') || text.includes('search')) return "🔍";
    if (text.includes('help') || text.includes('ally')) return "🤝";
    
    return "🎯";
  }

  private generateFallbackChoices(): StoryChoice[] {
    // Only used if AI completely fails to provide choices
    return [
      {
        id: "fallback_1",
        text: "Cast 'Detect Magic' to scan the tavern for supernatural traces",
        type: "magic",
        consequences: ["Reveal hidden magical elements", "May attract magical attention"],
        requirements: ["Mana cost: 15"],
        risks: ["Could drain your mana", "May alert magical beings"],
        rewards: ["Magical insights", "Hidden secrets revealed"],
        icon: "✨"
      },
      {
        id: "fallback_2",
        text: "Use your 'Intimidate' skill to pressure Mara for information",
        type: "combat",
        consequences: ["Force information from Mara", "Damage relationship with innkeeper"],
        requirements: ["Skill check: Intimidation"],
        risks: ["Mara becomes hostile", "Other patrons may intervene"],
        rewards: ["Quick information", "Establishes dominance"],
        icon: "⚔️"
      },
      {
        id: "fallback_3",
        text: "Activate 'Eagle Eye' to search for hidden compartments and secret passages",
        type: "exploration",
        consequences: ["Discover hidden areas", "May trigger security measures"],
        requirements: ["Skill check: Perception"],
        risks: ["Could trigger traps", "May be caught snooping"],
        rewards: ["Secret areas", "Hidden treasures"],
        icon: "👁️"
      },
      {
        id: "fallback_4",
        text: "Use 'Charm Person' spell to make Mara more cooperative",
        type: "magic",
        consequences: ["Mara becomes friendly", "Temporary magical influence"],
        requirements: ["Mana cost: 25", "Spell slot"],
        risks: ["Spell may fail", "Mara could resist"],
        rewards: ["Complete cooperation", "Access to all information"],
        icon: "💫"
      }
    ];
  }

  generateChoices(context: StoryContext): StoryChoice[] {
    // This method is now deprecated - choices come from AI response parsing
    return this.generateFallbackChoices();
  }

  private generateConsequences(userInput: string): string[] {
    const consequences = [];
    
    if (userInput.toLowerCase().includes('fight') || userInput.toLowerCase().includes('attack')) {
      consequences.push("Combat situation created", "Reputation may be affected");
    }
    
    if (userInput.toLowerCase().includes('steal') || userInput.toLowerCase().includes('sneak')) {
      consequences.push("Stealth mechanics activated", "Risk of detection");
    }
    
    if (userInput.toLowerCase().includes('magic') || userInput.toLowerCase().includes('spell')) {
      consequences.push("Magical effects triggered", "Mana consumption");
    }
    
    return consequences.length > 0 ? consequences : ["Story progresses", "World reacts to your actions"];
  }

  private generateWorldChanges(userInput: string): WorldChange[] {
    const changes: WorldChange[] = [];
    
    // Add dynamic world changes based on user input
    if (userInput.toLowerCase().includes('tavern')) {
      changes.push({
        type: "location",
        target: "The Whispering Tavern",
        change: "Increased activity and interest",
        magnitude: 2,
        duration: 3
      });
    }
    
    if (userInput.toLowerCase().includes('merchant')) {
      changes.push({
        type: "quest",
        target: "missing_merchant",
        change: "New clues discovered",
        magnitude: 3,
        duration: 5
      });
    }
    
    return changes;
  }

  private calculateEmotionalImpact(userInput: string): string {
    if (userInput.toLowerCase().includes('help') || userInput.toLowerCase().includes('save')) {
      return "Heroic determination";
    } else if (userInput.toLowerCase().includes('fear') || userInput.toLowerCase().includes('run')) {
      return "Tension and anxiety";
    } else if (userInput.toLowerCase().includes('love') || userInput.toLowerCase().includes('care')) {
      return "Warmth and compassion";
    } else {
      return "Adventure and curiosity";
    }
  }

  private selectMusic(mood: string): string {
    const musicMap = {
      peaceful: "8-bit tavern melody (Pokemon-style)",
      tense: "8-bit suspense theme (Final Fantasy-style)",
      dangerous: "8-bit battle music (Dragon Quest-style)",
      mysterious: "8-bit mystical ambient (Zelda-style)",
      epic: "8-bit adventure theme (Chrono Trigger-style)"
    };
    return musicMap[mood] || "8-bit RPG adventure music";
  }

  private generateSoundEffects(location: LocationState): string[] {
    const baseSounds = ["8-bit ambient music", "Pixelated footsteps", "Retro UI sounds"];
    
    if (location.name.includes("Tavern")) {
      baseSounds.push("8-bit tavern music", "Pixel glass clinking", "8-bit crowd murmur", "Retro door creak");
    } else if (location.name.includes("Ruins")) {
      baseSounds.push("8-bit dungeon music", "Echoing footsteps", "Ancient wind sounds", "Mystical chimes");
    } else if (location.name.includes("Forest")) {
      baseSounds.push("8-bit nature music", "Bird chirps", "Rustling leaves", "Flowing water");
    }
    
    return baseSounds;
  }

  private generateVisualEffects(mood: string): string[] {
    const effects = [];
    
    if (mood === 'mysterious') {
      effects.push("Pixelated shadows", "8-bit mystical auras", "Retro particle effects", "Game Boy screen flicker");
    } else if (mood === 'dangerous') {
      effects.push("Red pixel overlay", "Screen shake effect", "8-bit warning flashes", "Retro danger symbols");
    } else if (mood === 'peaceful') {
      effects.push("Warm pixel lighting", "Gentle 8-bit animations", "Soft retro glows", "Pokemon-style sparkles");
    } else if (mood === 'epic') {
      effects.push("Epic 8-bit effects", "Retro power surges", "Pixelated energy waves", "Final Fantasy-style flashes");
    }
    
    return effects;
  }

  updateContext(changes: WorldChange[]): void {
    changes.forEach(change => {
      switch (change.type) {
        case 'location':
          this.updateLocation(change);
          break;
        case 'relationship':
          this.updateRelationship(change);
          break;
        case 'quest':
          this.updateQuest(change);
          break;
        case 'inventory':
          this.updateInventory(change);
          break;
        case 'reputation':
          this.updateReputation(change);
          break;
        case 'world':
          this.updateWorldState(change);
          break;
      }
    });
  }

  private updateLocation(change: WorldChange): void {
    // Update location state based on changes
    if (change.target === "The Whispering Tavern") {
      this.context.location.currentEvents.push(change.change);
    }
  }

  private updateRelationship(change: WorldChange): void {
    // Update NPC relationships
    if (this.context.npcRelationships[change.target]) {
      this.context.npcRelationships[change.target].relationship += change.magnitude;
    }
  }

  private updateQuest(change: WorldChange): void {
    // Update quest progress
    const quest = this.context.activeQuests.find(q => q.id === change.target);
    if (quest) {
      // Update quest objectives or status
    }
  }

  private updateInventory(change: WorldChange): void {
    // Update inventory items
  }

  private updateReputation(change: WorldChange): void {
    // Update player reputation
  }

  private updateWorldState(change: WorldChange): void {
    // Update world state
  }

  processUserAction(action: string): void {
    // Process user actions and update context
    this.context.recentActions.push(action);
    
    // Award experience for actions
    this.awardExperience(action);
    
    // Update story memory
    this.context.storyMemory.push({
      id: `action_${Date.now()}`,
      type: 'action',
      content: action,
      importance: 5,
      timestamp: new Date(),
      characters: [this.context.playerCharacter.name],
      location: this.context.location.name,
      emotionalImpact: this.calculateEmotionalImpact(action)
    });
  }

  private awardExperience(action: string): void {
    let expGained = 0;
    
    // Award experience based on action type
    if (action.toLowerCase().includes('cast') || action.toLowerCase().includes('spell')) {
      expGained = 15; // Magic actions
    } else if (action.toLowerCase().includes('fight') || action.toLowerCase().includes('attack')) {
      expGained = 20; // Combat actions
    } else if (action.toLowerCase().includes('stealth') || action.toLowerCase().includes('sneak')) {
      expGained = 12; // Stealth actions
    } else if (action.toLowerCase().includes('talk') || action.toLowerCase().includes('charm')) {
      expGained = 10; // Social actions
    } else if (action.toLowerCase().includes('explore') || action.toLowerCase().includes('search')) {
      expGained = 8; // Exploration actions
    } else {
      expGained = 5; // Default action
    }
    
    this.context.playerCharacter.experience += expGained;
    
    // Check for level up
    if (this.context.playerCharacter.experience >= this.context.playerCharacter.experienceToNext) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    this.context.playerCharacter.level++;
    this.context.playerCharacter.experience -= this.context.playerCharacter.experienceToNext;
    this.context.playerCharacter.experienceToNext = Math.floor(this.context.playerCharacter.experienceToNext * 1.5);
    
    // Increase stats
    this.context.playerCharacter.maxHealth += 10;
    this.context.playerCharacter.maxHealth = this.context.playerCharacter.maxHealth;
    this.context.playerCharacter.maxMana += 15;
    this.context.playerCharacter.mana = this.context.playerCharacter.maxMana;
    
    // Improve skills
    Object.keys(this.context.playerCharacter.skills).forEach(skill => {
      this.context.playerCharacter.skills[skill] += 1;
    });
    
    // Add new spells at certain levels
    if (this.context.playerCharacter.level === 3) {
      this.context.playerCharacter.spells.push("Fireball (30 mana)");
    } else if (this.context.playerCharacter.level === 5) {
      this.context.playerCharacter.spells.push("Invisibility (40 mana)");
    }
  }

  generateNPCResponse(npcName: string, context: string): string {
    const npc = this.context.npcRelationships[npcName];
    if (!npc) return "The NPC seems unfamiliar with you.";
    
    // Generate contextual NPC response
    return `${npc.name} responds with ${npc.personality.toLowerCase()} manner: "${this.generateContextualResponse(context, npc)}"`;
  }

  private generateContextualResponse(context: string, npc: NPCState): string {
    // Generate contextual responses based on NPC personality and knowledge
    const responses = {
      "Mara": [
        "Ah, you're asking about that? Let me tell you what I've heard...",
        "That's interesting. I might know something that could help you.",
        "Be careful with that information. Not everyone can be trusted."
      ]
    };
    
    const npcResponses = responses[npc.name as keyof typeof responses] || ["I'm not sure about that."];
    return npcResponses[Math.floor(Math.random() * npcResponses.length)];
  }

  createDynamicQuest(context: StoryContext): QuestState {
    // Create dynamic quests based on current context
    return {
      id: `quest_${Date.now()}`,
      title: "Dynamic Quest",
      description: "A quest that emerged from your actions",
      type: "dynamic",
      objectives: [],
      rewards: [],
      status: "available",
      consequences: [],
      branchingPaths: []
    };
  }

  generateLocationDescription(location: string, context: StoryContext): string {
    // Generate dynamic location descriptions
    return `You find yourself in ${location}. The atmosphere is ${context.mood}, and you can sense ${context.location.atmosphere}.`;
  }

  private generateFallbackResponse(userInput: string): StoryResponse {
    // Fallback response when AI fails
    return {
      narrative: `You ${userInput.toLowerCase()}. The world around you responds to your actions, and you can feel the story unfolding in new and unexpected ways.`,
      choices: this.generateFallbackChoices(),
      consequences: ["Story continues", "World adapts"],
      worldChanges: [],
      emotionalImpact: "Curiosity and anticipation",
      atmosphere: "Dynamic and responsive",
      music: "Adaptive fantasy music",
      soundEffects: ["Environmental ambience"],
      visualEffects: ["Dynamic lighting"]
    };
  }
}

// Export the story engine
export const createStoryEngine = (groqApiKey: string): FantasyQuestStoryEngine => {
  return new FantasyQuestStoryEngine(groqApiKey);
};
