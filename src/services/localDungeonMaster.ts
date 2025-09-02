// Advanced AI Dungeon Master for Fantasy Quest RPG
// Features multiple worlds, branching storylines, and different endings

export interface GameChoice {
  id: string;
  text: string;
  action: string;
  icon: string;
  consequence?: string;
  nextScene?: string;
}

export interface LocationInfo {
  name: string;
  description: string;
  exits: string[];
  npcs: string[];
  items: string[];
  events: string[];
}

export interface GameWorld {
  id: string;
  name: string;
  description: string;
  theme: string;
  locations: { [key: string]: LocationInfo };
  npcs: { [key: string]: NPCDialog };
  quests: Quest[];
  items: { [key: string]: GameItem };
  enemies: { [key: string]: Enemy };
  endings: Ending[];
}

export interface NPCDialog {
  name: string;
  responses: { [key: string]: string };
  quests: string[];
  items: string[];
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  objectives: string[];
  rewards: string[];
  isCompleted: boolean;
  isFailed: boolean;
}

export interface GameItem {
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'key' | 'treasure';
  effect: string;
  value: number;
}

export interface Enemy {
  name: string;
  health: number;
  damage: number;
  description: string;
  loot: string[];
}

export interface Ending {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  isUnlocked: boolean;
}

export class LocalDungeonMaster {
  private gameState: any = {
    currentWorld: 'fantasy',
    currentLocation: 'tavern',
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    level: 1,
    experience: 0,
    gold: 100,
    inventory: ['rusty sword', 'healing potion', 'mana crystal'],
    equipped: {
      weapon: 'rusty sword',
      armor: 'leather vest'
    },
    activeQuests: ['The Missing Merchant', 'Ancient Artifacts'],
    completedQuests: [],
    reputation: {
      tavern: 50,
      market: 30,
      forest: 20,
      dungeon: 10
    },
    relationships: {
      'Innkeeper Greta': 70,
      'Merchant Alric': 40,
      'Ranger Elara': 60,
      'Wizard Thaddeus': 30
    },
    storyFlags: {
      merchantFound: false,
      artifactRevealed: false,
      darkRitualStopped: false,
      ancientSealBroken: false
    },
    worldState: {
      timeOfDay: 'morning',
      weather: 'clear',
      politicalClimate: 'stable',
      magicalDisturbance: 'low'
    }
  };

  private worlds: { [key: string]: GameWorld } = {
    fantasy: {
      id: 'fantasy',
      name: 'Mysticara',
      description: 'A realm of magic and wonder where ancient powers slumber beneath the surface.',
      theme: 'medieval fantasy',
      locations: {
    tavern: {
      name: 'The Whispering Tavern',
          description: 'A cozy tavern filled with the warm glow of candlelight. The air is thick with the scent of ale and roasted meat. Patrons huddle around wooden tables, speaking in hushed tones about recent disappearances and strange happenings in the forest.',
      exits: ['market', 'forest', 'dungeon'],
      npcs: ['Innkeeper Greta', 'Mysterious Traveler', 'Drunken Bard'],
          items: ['healing potion', 'map', 'key', 'strange amulet'],
          events: ['brawl', 'quest_offer', 'mysterious_visitor', 'prophecy']
    },
    market: {
      name: 'The Bustling Market',
          description: 'Colorful stalls line the cobblestone streets. Merchants call out their wares while customers haggle over prices. The air is filled with the sounds of commerce and gossip about the missing merchant and the ancient ruins.',
      exits: ['tavern', 'castle', 'forest'],
      npcs: ['Merchant Alric', 'Street Urchin', 'Guard Captain'],
          items: ['sword', 'armor', 'magic scroll', 'ancient coin'],
          events: ['theft', 'bargain', 'guard_patrol', 'rumor_mill']
    },
    forest: {
      name: 'The Enchanted Forest',
          description: 'Ancient trees tower overhead, their branches creating a natural canopy. Strange sounds echo through the shadows, and magical energy seems to pulse through the air. Footprints lead deeper into the woods.',
          exits: ['tavern', 'market', 'dungeon', 'ancient_ruins'],
          npcs: ['Forest Sprite', 'Lost Traveler', 'Ranger Elara'],
          items: ['herbs', 'magic crystal', 'ancient coin', 'torn map'],
          events: ['wild_encounter', 'magical_discovery', 'lost_path', 'ancient_whispers']
    },
    dungeon: {
      name: 'The Dark Dungeon',
          description: 'Cold stone walls echo with distant dripping water. Torches flicker, casting dancing shadows. The air is thick with the promise of danger and treasure. Ancient runes glow faintly on the walls.',
          exits: ['tavern', 'forest', 'ancient_chamber'],
      npcs: ['Prisoner', 'Ancient Guardian', 'Treasure Hunter'],
          items: ['gold', 'magic weapon', 'ancient artifact', 'dark tome'],
          events: ['trap', 'monster_encounter', 'treasure_find', 'ritual_discovery']
        },
        ancient_ruins: {
          name: 'The Ancient Ruins',
          description: 'Crumbling stone structures rise from the forest floor, covered in moss and vines. The air crackles with ancient magic, and strange symbols glow with an otherworldly light.',
          exits: ['forest', 'dungeon', 'temple'],
          npcs: ['Ancient Spirit', 'Archaeologist', 'Cultist'],
          items: ['ancient scroll', 'magic staff', 'ritual dagger', 'seal fragment'],
          events: ['spirit_encounter', 'archaeological_find', 'cult_ritual', 'ancient_awakening']
        },
        temple: {
          name: 'The Temple of the Ancients',
          description: 'A massive stone temple rises from the ruins, its walls covered in intricate carvings depicting ancient battles and forgotten gods. The air hums with powerful magic.',
          exits: ['ancient_ruins', 'inner_sanctum'],
          npcs: ['Temple Guardian', 'High Priest', 'Ancient One'],
          items: ['holy weapon', 'sacred text', 'divine essence', 'seal of power'],
          events: ['trial', 'divine_judgment', 'ancient_prophecy', 'seal_breaking']
        },
        inner_sanctum: {
          name: 'The Inner Sanctum',
          description: 'The heart of the temple, where ancient power slumbers. The air crackles with energy, and the fate of the world hangs in the balance.',
          exits: ['temple'],
          npcs: ['The Ancient One', 'Dark Entity'],
          items: ['world_seal', 'ancient_heart', 'power_crystal'],
          events: ['final_choice', 'world_transformation', 'destiny_fulfilled']
        }
      },
      npcs: {
        'Innkeeper Greta': {
          name: 'Innkeeper Greta',
          responses: {
            greeting: "Ah, a new face! Welcome to the Whispering Tavern. What can I get for you?",
            quest: "The missing merchant? He was asking about the old ruins. Strange business, that. Some say he found something he shouldn't have.",
            area: "The forest holds ancient secrets, and the dungeon... well, let's just say some things are better left buried.",
            prophecy: "The stars speak of great changes coming. The ancient seals are weakening, and the old powers are stirring."
          },
          quests: ['The Missing Merchant'],
          items: ['healing potion', 'room key']
        },
        'Merchant Alric': {
          name: 'Merchant Alric',
          responses: {
            greeting: "Best prices in town, my friend! What are you looking for?",
            quest: "That missing merchant? He bought a lot of supplies before he disappeared. Said something about ancient ruins.",
            castle: "The castle guards are always looking for brave souls to help with their problems. They pay well for successful missions.",
            artifacts: "Ancient artifacts fetch a high price, but they're dangerous. Some say they carry curses."
          },
          quests: ['Ancient Artifacts'],
          items: ['sword', 'armor', 'magic scroll']
        },
        'Ranger Elara': {
          name: 'Ranger Elara',
          responses: {
            greeting: "Greetings, traveler. The forest is not safe these days. Ancient forces are awakening.",
            quest: "I've seen the missing merchant's tracks leading toward the ancient ruins. But there's something else out there... something old.",
            forest: "The forest has changed. The trees whisper of ancient times, and the shadows hold secrets.",
            warning: "Beware the temple. The seals are weakening, and the ancient one stirs in its slumber."
          },
          quests: ['Forest Secrets'],
          items: ['herbs', 'magic crystal']
        }
      },
      quests: [
        {
          id: 'missing_merchant',
          name: 'The Missing Merchant',
          description: 'Find the merchant who disappeared while exploring the ancient ruins.',
          objectives: ['Search the forest for clues', 'Explore the ancient ruins', 'Discover what happened to the merchant'],
          rewards: ['Gold', 'Reputation', 'Ancient artifact'],
          isCompleted: false,
          isFailed: false
        },
        {
          id: 'ancient_artifacts',
          name: 'Ancient Artifacts',
          description: 'Collect ancient artifacts scattered throughout the ruins.',
          objectives: ['Find the ancient scroll', 'Locate the ritual dagger', 'Discover the seal fragment'],
          rewards: ['Magic items', 'Experience', 'Ancient knowledge'],
          isCompleted: false,
          isFailed: false
        },
        {
          id: 'seal_breaking',
          name: 'The Breaking Seal',
          description: 'Prevent the ancient seal from breaking and releasing dark forces.',
          objectives: ['Find the temple', 'Learn about the seal', 'Make the final choice'],
          rewards: ['World transformation', 'Multiple endings', 'Ultimate power'],
          isCompleted: false,
          isFailed: false
        }
      ],
      items: {
        'rusty sword': { name: 'Rusty Sword', description: 'A basic weapon with some wear', type: 'weapon', effect: '+5 damage', value: 10 },
        'healing potion': { name: 'Healing Potion', description: 'Restores health', type: 'consumable', effect: '+30 health', value: 25 },
        'mana crystal': { name: 'Mana Crystal', description: 'Restores magical energy', type: 'consumable', effect: '+25 mana', value: 30 },
        'ancient scroll': { name: 'Ancient Scroll', description: 'Contains forbidden knowledge', type: 'key', effect: 'Unlocks ancient secrets', value: 100 },
        'ritual dagger': { name: 'Ritual Dagger', description: 'Used in dark ceremonies', type: 'weapon', effect: '+15 damage, cursed', value: 75 },
        'seal fragment': { name: 'Seal Fragment', description: 'Part of an ancient seal', type: 'key', effect: 'Weakens the seal', value: 200 }
      },
      enemies: {
        'goblin': { name: 'Goblin', health: 30, damage: 8, description: 'A small, green creature with sharp teeth', loot: ['gold', 'crude weapon'] },
        'bandit': { name: 'Bandit', health: 45, damage: 12, description: 'A desperate outlaw seeking fortune', loot: ['gold', 'leather armor'] },
        'undead_warrior': { name: 'Undead Warrior', health: 60, damage: 18, description: 'A skeletal warrior risen from the dead', loot: ['ancient weapon', 'dark essence'] },
        'ancient_guardian': { name: 'Ancient Guardian', health: 100, damage: 25, description: 'A powerful construct protecting ancient secrets', loot: ['guardian core', 'ancient knowledge'] }
      },
      endings: [
        {
          id: 'hero_ending',
          name: 'Hero of Mysticara',
          description: 'You successfully prevent the seal from breaking and become a legendary hero.',
          requirements: ['Complete all quests', 'Maintain high reputation', 'Choose the light path'],
          isUnlocked: false
        },
        {
          id: 'dark_ending',
          name: 'Dark Lord',
          description: 'You embrace the dark power and become a feared ruler of the realm.',
          requirements: ['Collect dark artifacts', 'Break the seal', 'Choose the dark path'],
          isUnlocked: false
        },
        {
          id: 'neutral_ending',
          name: 'Wise Sage',
          description: 'You find balance between light and dark, becoming a wise sage.',
          requirements: ['Maintain neutral alignment', 'Learn ancient secrets', 'Choose the middle path'],
          isUnlocked: false
        },
        {
          id: 'destruction_ending',
          name: 'World Destroyer',
          description: 'The ancient forces are unleashed, destroying the world.',
          requirements: ['Break all seals', 'Release dark entities', 'Fail all quests'],
          isUnlocked: false
        }
      ]
    }
  };

  // Generate interactive choice buttons for the RPG game
  public generateChoices(): GameChoice[] {
    const currentWorld = this.worlds[this.gameState.currentWorld];
    const currentLoc = currentWorld.locations[this.gameState.currentLocation];
    const choices: GameChoice[] = [];
    
    // Always show basic actions
    choices.push({
      id: 'look',
      text: 'Look around',
      action: 'look',
      icon: '🔍',
      consequence: 'You examine your surroundings carefully.'
    });
    
    choices.push({
      id: 'inventory',
      text: 'Check inventory',
      action: 'inventory',
      icon: '📦',
      consequence: 'You review your possessions and status.'
    });
    
    choices.push({
      id: 'quests',
      text: 'Check quests',
      action: 'quests',
      icon: '❓',
      consequence: 'You review your active quests and objectives.'
    });
    
    // Add location-specific choices
    if (this.gameState.currentLocation === 'tavern') {
      choices.push({
        id: 'drink',
        text: 'Order a drink',
        action: 'order_drink',
        icon: '🍺',
        consequence: 'You enjoy a refreshing beverage and overhear local gossip.'
      });
      
      choices.push({
        id: 'room',
        text: 'Rent a room',
        action: 'rent_room',
        icon: '🏠',
        consequence: 'You rest in a cozy room, recovering your strength.'
      });
      
      choices.push({
        id: 'talk_innkeeper',
        text: 'Talk to innkeeper',
        action: 'talk_innkeeper',
        icon: '💬',
        consequence: 'The innkeeper shares valuable information about the area.'
      });
      
      choices.push({
        id: 'area_info',
        text: 'Ask about the area',
        action: 'area_info',
        icon: '🗺️',
        consequence: 'You learn about nearby locations and current events.'
      });
    } else if (this.gameState.currentLocation === 'market') {
      choices.push({
        id: 'browse',
        text: 'Browse shops',
        action: 'browse_shops',
        icon: '🛒',
        consequence: 'You examine the various goods available for purchase.'
      });
      
      choices.push({
        id: 'buy',
        text: 'Buy supplies',
        action: 'buy_supplies',
        icon: '💰',
        consequence: 'You purchase essential supplies for your journey.'
      });
      
      choices.push({
        id: 'talk_merchant',
        text: 'Talk to merchant',
        action: 'talk_merchant',
        icon: '💬',
        consequence: 'The merchant shares valuable information and quest details.'
      });
      
      choices.push({
        id: 'castle_info',
        text: 'Ask about the castle',
        action: 'castle_info',
        icon: '🏰',
        consequence: 'You learn about the castle and potential opportunities there.'
      });
    } else if (this.gameState.currentLocation === 'forest') {
      choices.push({
        id: 'explore',
        text: 'Explore deeper',
        action: 'explore_deeper',
        icon: '🌲',
        consequence: 'You venture deeper into the mysterious forest.'
      });
      
      choices.push({
        id: 'search',
        text: 'Search for clues',
        action: 'search_clues',
        icon: '🔍',
        consequence: 'You carefully search the area for any signs or clues.'
      });
      
      choices.push({
        id: 'hunt',
        text: 'Hunt for food',
        action: 'hunt_food',
        icon: '⚔️',
        consequence: 'You attempt to hunt for food to sustain yourself.'
      });
      
      choices.push({
        id: 'talk_ranger',
        text: 'Talk to ranger',
        action: 'talk_ranger',
        icon: '💬',
        consequence: 'The ranger shares knowledge about the forest and its dangers.'
      });
    } else if (this.gameState.currentLocation === 'dungeon') {
      choices.push({
        id: 'treasure',
        text: 'Search for treasure',
        action: 'search_treasure',
        icon: '💎',
        consequence: 'You search the dungeon for valuable treasures.'
      });
      
      choices.push({
        id: 'investigate',
        text: 'Investigate rooms',
        action: 'investigate_rooms',
        icon: '🔍',
        consequence: 'You carefully investigate the dungeon rooms for secrets.'
      });
      
      choices.push({
        id: 'fight',
        text: 'Fight monsters',
        action: 'fight_monsters',
        icon: '💀',
        consequence: 'You engage in combat with dungeon creatures.'
      });
      
      choices.push({
        id: 'talk_prisoner',
        text: 'Talk to prisoner',
        action: 'talk_prisoner',
        icon: '💬',
        consequence: 'The prisoner shares valuable information about the dungeon.'
      });
    } else if (this.gameState.currentLocation === 'ancient_ruins') {
      choices.push({
        id: 'explore_ruins',
        text: 'Explore ruins',
        action: 'explore_ruins',
        icon: '🏛️',
        consequence: 'You explore the ancient ruins for artifacts and knowledge.'
      });
      
      choices.push({
        id: 'search_artifacts',
        text: 'Search for artifacts',
        action: 'search_artifacts',
        icon: '🔮',
        consequence: 'You search specifically for ancient artifacts and relics.'
      });
      
      choices.push({
        id: 'study_symbols',
        text: 'Study symbols',
        action: 'study_symbols',
        icon: '📜',
        consequence: 'You study the ancient symbols for hidden meanings.'
      });
      
      choices.push({
        id: 'enter_temple',
        text: 'Enter temple',
        action: 'enter_temple',
        icon: '⛩️',
        consequence: 'You enter the ancient temple, drawn by its power.'
      });
    } else if (this.gameState.currentLocation === 'temple') {
      choices.push({
        id: 'face_trial',
        text: 'Face the trial',
        action: 'face_trial',
        icon: '⚖️',
        consequence: 'You face the temple\'s trial to prove your worth.'
      });
      
      choices.push({
        id: 'seek_guidance',
        text: 'Seek guidance',
        action: 'seek_guidance',
        icon: '🙏',
        consequence: 'You seek guidance from the temple\'s ancient spirits.'
      });
      
      choices.push({
        id: 'learn_secrets',
        text: 'Learn ancient secrets',
        action: 'learn_secrets',
        icon: '📚',
        consequence: 'You attempt to learn the temple\'s ancient secrets.'
      });
      
      choices.push({
        id: 'enter_sanctum',
        text: 'Enter inner sanctum',
        action: 'enter_sanctum',
        icon: '🚪',
        consequence: 'You enter the temple\'s most sacred area.'
      });
    } else if (this.gameState.currentLocation === 'inner_sanctum') {
      choices.push({
        id: 'light_path',
        text: 'Choose the light path',
        action: 'light_path',
        icon: '✨',
        consequence: 'You choose to preserve the seal and protect the world.',
        nextScene: 'hero_ending'
      });
      
      choices.push({
        id: 'dark_path',
        text: 'Choose the dark path',
        action: 'dark_path',
        icon: '🌑',
        consequence: 'You choose to break the seal and embrace dark power.',
        nextScene: 'dark_ending'
      });
      
      choices.push({
        id: 'balance_path',
        text: 'Choose the balance path',
        action: 'balance_path',
        icon: '⚖️',
        consequence: 'You choose to find balance between light and dark.',
        nextScene: 'neutral_ending'
      });
      
      choices.push({
        id: 'destroy_seal',
        text: 'Destroy the seal',
        action: 'destroy_seal',
        icon: '💥',
        consequence: 'You choose to destroy the seal, unleashing chaos.',
        nextScene: 'destruction_ending'
      });
    }
    
    // Add movement choices
    if (this.gameState.currentLocation !== 'inner_sanctum') {
    choices.push({
      id: 'move',
      text: 'Move to another location',
      action: 'move_location',
        icon: '🚶',
        consequence: 'You decide to travel to a different area.'
    });
    }
    
    // Add combat choices if in danger
    if (this.gameState.health < 50) {
      choices.push({
        id: 'heal',
        text: 'Use healing potion',
        action: 'use_healing_potion',
        icon: '💊',
        consequence: 'You use a healing potion to restore your health.'
      });
      
      choices.push({
        id: 'run',
        text: 'Run away',
        action: 'run_away',
        icon: '🏃',
        consequence: 'You quickly retreat from the danger to safety.'
      });
    }
    
    return choices;
  }

  // Get current location info for the UI
  public getCurrentLocationInfo(): LocationInfo {
    const currentWorld = this.worlds[this.gameState.currentWorld];
    const currentLoc = currentWorld.locations[this.gameState.currentLocation];
    return {
      name: currentLoc.name,
      description: currentLoc.description,
      exits: currentLoc.exits,
      npcs: currentLoc.npcs,
      items: currentLoc.items
    };
  }

  // Handle player choice selection
  public handleChoice(choiceId: string): string {
    const choice = this.generateChoices().find(c => c.id === choiceId);
    if (!choice) return "That's not a valid choice. Please try again.";
    
    let response = choice.consequence || "You perform the action.";
    
    switch (choiceId) {
      case 'look':
        response = this.describeLocation();
        break;
      
      case 'inventory':
        response = this.handleInventory();
        break;
      
      case 'quests':
        response = this.handleQuests();
        break;
      
      case 'order_drink':
        this.gameState.gold -= 2;
        this.gameState.reputation.tavern += 5;
        response = `You order a refreshing ale and overhear some interesting gossip about the missing merchant. The innkeeper seems pleased with your patronage. You now have ${this.gameState.gold} gold pieces.`;
        break;
      
      case 'rent_room':
        if (this.gameState.gold >= 5) {
          this.gameState.gold -= 5;
          this.gameState.health = Math.min(this.gameState.maxHealth, this.gameState.health + 20);
          this.gameState.reputation.tavern += 10;
          response = `You rent a cozy room for the night. Your health is restored to ${this.gameState.health}! The innkeeper appreciates your business. You now have ${this.gameState.gold} gold pieces.`;
        } else {
          response = "You don't have enough gold to rent a room. You need 5 gold pieces.";
        }
        break;
      
      case 'talk_innkeeper':
        response = this.handleNPCTalk('innkeeper');
        break;
      
      case 'area_info':
        response = "The innkeeper tells you about the surrounding areas: The market is bustling with trade, the forest holds ancient secrets, and the dungeon is said to contain great treasures but also great dangers. She also mentions that the missing merchant was asking about ancient ruins before he disappeared.";
        break;
      
      case 'browse_shops':
        response = "You browse the various stalls. You see weapons, armor, magical items, and everyday supplies. The merchants are eager to make deals, and you notice some items that might be useful for your quest.";
        break;
      
      case 'buy_supplies':
        if (this.gameState.gold >= 10) {
          this.gameState.gold -= 10;
          this.gameState.inventory.push('supplies');
          this.gameState.reputation.market += 5;
          response = `You buy some supplies for 10 gold. The merchant is pleased with the sale. You now have ${this.gameState.gold} gold pieces and your inventory contains: ${this.gameState.inventory.join(', ')}.`;
        } else {
          response = "You don't have enough gold to buy supplies. You need 10 gold pieces.";
        }
        break;
      
      case 'talk_merchant':
        response = this.handleNPCTalk('merchant');
        break;
      
      case 'castle_info':
        response = "The merchant tells you the castle guards are always looking for brave adventurers to help with various problems. They pay well for successful missions, and there's currently a bounty on information about the missing merchant.";
        break;
      
      case 'explore_deeper':
        response = "You venture deeper into the forest. The trees grow thicker and the shadows deeper. You hear strange sounds in the distance and feel a magical presence growing stronger. This area feels ancient and powerful.";
        break;
      
      case 'search_clues':
        const cluesFound = Math.random() > 0.3;
        if (cluesFound) {
          this.gameState.inventory.push('torn map');
          response = "You carefully search the area and find some footprints leading toward the dungeon and a torn piece of cloth that might belong to the missing merchant. You also discover a torn map that seems to show the location of ancient ruins.";
        } else {
          response = "You spend some time searching but don't find any immediate clues. However, you do notice that the forest seems unusually quiet, as if something is watching you.";
        }
        break;
      
      case 'hunt_food':
        const foodFound = Math.random() > 0.5;
        if (foodFound) {
          this.gameState.inventory.push('fresh meat');
          response = "You successfully hunt and find some fresh meat. The forest provides well for those who know how to hunt. Your inventory now contains: " + this.gameState.inventory.join(', ');
        } else {
          response = "You spend some time hunting but don't find any game. The forest seems unusually quiet today, and you get the feeling that the animals are hiding from something.";
        }
        break;
      
      case 'talk_ranger':
        response = this.handleNPCTalk('ranger');
        break;
      
      case 'search_treasure':
        const treasureFound = Math.random() > 0.6;
        if (treasureFound) {
          const treasure = ['gold coins', 'magic ring', 'ancient scroll'][Math.floor(Math.random() * 3)];
          this.gameState.inventory.push(treasure);
          response = `You find some treasure! You discover ${treasure}. The dungeon seems to reward those brave enough to explore its depths. Your inventory now contains: ${this.gameState.inventory.join(', ')}.`;
        } else {
          response = "You search the area but don't find any treasure. The dungeon seems to have been picked clean by previous adventurers, but you do notice some fresh footprints that suggest someone has been here recently.";
        }
        break;
      
      case 'investigate_rooms':
        response = "You investigate the nearby rooms. You find evidence of recent activity - fresh footprints, disturbed dust, and the remains of a campfire. Someone has been here recently, and you find a note mentioning 'ancient ruins' and 'the seal.'";
        break;
      
      case 'fight_monsters':
        response = this.handleCombat();
        break;
      
      case 'talk_prisoner':
        response = "The prisoner tells you they were captured while exploring the dungeon. They mention a secret passage that leads to a hidden chamber with ancient artifacts, and they warn you about 'the ancient one' that slumbers beneath the temple.";
        break;
      
      case 'explore_ruins':
        response = "You explore the ancient ruins, marveling at the craftsmanship of a civilization long forgotten. The air crackles with ancient magic, and you find several artifacts that seem to pulse with power. You also discover evidence that the missing merchant was here recently.";
        break;
      
      case 'search_artifacts':
        const artifactsFound = Math.random() > 0.4;
        if (artifactsFound) {
          this.gameState.inventory.push('ancient scroll');
          this.gameState.storyFlags.artifactRevealed = true;
          response = "You search specifically for ancient artifacts and discover an ancient scroll covered in mysterious runes. The scroll seems to contain information about an ancient seal and the power it holds. Your quest for ancient artifacts progresses!";
        } else {
          response = "You search for artifacts but don't find anything immediately. However, you do notice that the ruins seem to respond to your presence, as if they recognize you as someone worthy of their secrets.";
        }
        break;
      
      case 'study_symbols':
        response = "You study the ancient symbols carved into the stone. As you trace your fingers over them, they begin to glow with a soft light. You realize they're telling a story about an ancient power that was sealed away long ago, and the seal is weakening.";
        break;
      
      case 'enter_temple':
        this.gameState.currentLocation = 'temple';
        response = "You enter the ancient temple, drawn by its power and the secrets it holds. The air is thick with ancient magic, and you can feel the weight of centuries pressing down on you. This is where the fate of the world will be decided.";
        break;
      
      case 'face_trial':
        const trialSuccess = Math.random() > 0.3;
        if (trialSuccess) {
          this.gameState.level += 1;
          this.gameState.maxHealth += 10;
          this.gameState.maxMana += 5;
          response = `You successfully face the temple's trial! The ancient spirits recognize your worth and grant you power. You are now level ${this.gameState.level} with ${this.gameState.maxHealth} max health and ${this.gameState.maxMana} max mana.`;
        } else {
          this.gameState.health -= 20;
          response = `You attempt the trial but find it challenging. The ancient spirits test your resolve, and you take some damage in the process. Your health is now ${this.gameState.health}.`;
        }
        break;
      
      case 'seek_guidance':
        response = "You seek guidance from the temple's ancient spirits. They share visions of the past - showing you how the ancient seal was created to contain a dark power that threatened to destroy the world. They also show you glimpses of possible futures depending on your choices.";
        break;
      
      case 'learn_secrets':
        this.gameState.inventory.push('ancient knowledge');
        response = "You attempt to learn the temple's ancient secrets. The spirits share their wisdom with you, revealing the true nature of the seal and the consequences of breaking it. You gain ancient knowledge that will help you make the right choice.";
        break;
      
      case 'enter_sanctum':
        this.gameState.currentLocation = 'inner_sanctum';
        response = "You enter the temple's most sacred area - the inner sanctum. Here, the ancient seal pulses with power, and you can feel the weight of the world's fate in your hands. The ancient one stirs in its slumber, waiting for your decision.";
        break;
      
      case 'light_path':
        this.gameState.storyFlags.darkRitualStopped = true;
        response = "You choose to preserve the seal and protect the world. The ancient one's power is contained, and the world is safe. You have become a legendary hero, known throughout Mysticara as the protector of light. The ancient spirits bless you with their power.";
        break;
      
      case 'dark_path':
        this.gameState.storyFlags.ancientSealBroken = true;
        response = "You choose to break the seal and embrace dark power. The ancient one's power flows into you, making you incredibly powerful. You become a feared dark lord, ruling over Mysticara with an iron fist. The world trembles at your name.";
        break;
      
      case 'balance_path':
        this.gameState.storyFlags.darkRitualStopped = true;
        this.gameState.storyFlags.ancientSealBroken = false;
        response = "You choose to find balance between light and dark. You learn to harness both powers, becoming a wise sage who understands the nature of all things. You maintain the seal while learning its secrets, achieving true wisdom.";
        break;
      
      case 'destroy_seal':
        this.gameState.storyFlags.ancientSealBroken = true;
        response = "You choose to destroy the seal, unleashing chaos upon the world. The ancient one awakens in full power, and the world is plunged into darkness and destruction. You have become the world destroyer, though you may come to regret this choice.";
        break;
      
      case 'move_location':
        response = "Where would you like to go? You can see exits to: " + 
                   Object.keys(this.worlds[this.gameState.currentWorld].locations).map(exit => exit.charAt(0).toUpperCase() + exit.slice(1)).join(', ');
        break;
      
      case 'use_healing_potion':
        if (this.gameState.inventory.includes('healing potion')) {
          this.gameState.inventory = this.gameState.inventory.filter(item => item !== 'healing potion');
          this.gameState.health = Math.min(this.gameState.maxHealth, this.gameState.health + 30);
          response = `You use the healing potion. Your health is restored to ${this.gameState.health}!`;
        } else {
          response = "You don't have any healing potions in your inventory.";
        }
        break;
      
      case 'run_away':
        response = "You quickly retreat from the danger. Your heart pounds as you make your escape to safety. Sometimes discretion is the better part of valor.";
        break;
      
      default:
        response = "You're not sure what to do with that choice. Try selecting a different option.";
    }
    
    // Check if choice leads to a new scene
    if (choice.nextScene) {
      this.gameState.currentLocation = choice.nextScene;
    }
    
    return response;
  }

  private describeLocation(): string {
    const currentWorld = this.worlds[this.gameState.currentWorld];
    const currentLoc = currentWorld.locations[this.gameState.currentLocation];
    const exits = currentLoc.exits.map(exit => exit.charAt(0).toUpperCase() + exit.slice(1)).join(', ');
    
    return `${currentLoc.description}\n\nYou can see exits leading to: ${exits}. There are several people here: ${currentLoc.npcs.join(', ')}. The area contains items: ${currentLoc.items.join(', ')}. What would you like to do?`;
  }

  private handleNPCTalk(npcType: string): string {
    const npcMap = {
      'innkeeper': 'Innkeeper Greta',
      'merchant': 'Merchant Alric',
      'ranger': 'Ranger Elara'
    };
    
    const npcName = npcMap[npcType as keyof typeof npcMap];
    if (npcName && this.worlds[this.gameState.currentWorld].npcs[npcName]) {
      const npc = this.worlds[this.gameState.currentWorld].npcs[npcName];
      const responses = Object.values(npc.responses);
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    return "You try to strike up a conversation, but the person seems preoccupied with their own thoughts.";
  }

  private handleInventory(): string {
    const equipped = Object.entries(this.gameState.equipped).map(([slot, item]) => `${slot}: ${item}`).join(', ');
    return `Your inventory contains: ${this.gameState.inventory.join(', ')}.\n\nEquipped: ${equipped}\n\nStats: Health ${this.gameState.health}/${this.gameState.maxHealth}, Mana ${this.gameState.mana}/${this.gameState.maxMana}, Level ${this.gameState.level}, Gold ${this.gameState.gold}`;
  }

  private handleQuests(): string {
    const activeQuests = this.worlds[this.gameState.currentWorld].quests.filter(q => q.activeQuests.includes(q.id));
    const completedQuests = this.worlds[this.gameState.currentWorld].quests.filter(q => q.completedQuests.includes(q.id));
    
    let response = "Active Quests:\n";
    activeQuests.forEach(quest => {
      response += `- ${quest.name}: ${quest.description}\n  Objectives: ${quest.objectives.join(', ')}\n`;
    });
    
    if (completedQuests.length > 0) {
      response += "\nCompleted Quests:\n";
      completedQuests.forEach(quest => {
        response += `- ${quest.name}: Completed!\n`;
      });
    }
    
    return response;
  }

  private handleCombat(): string {
    const enemies = Object.keys(this.worlds[this.gameState.currentWorld].enemies);
    const enemy = enemies[Math.floor(Math.random() * enemies.length)];
    const enemyData = this.worlds[this.gameState.currentWorld].enemies[enemy];
    
    const damage = Math.floor(Math.random() * 20) + 10;
    this.gameState.health -= damage;
    
    if (this.gameState.health <= 0) {
      this.gameState.health = Math.min(this.gameState.maxHealth, 50);
      return `The ${enemyData.name} defeats you! You wake up back at the tavern, your wounds mysteriously healed. You've learned from this experience and are more cautious now.`;
    }
    
    const experience = Math.floor(Math.random() * 15) + 5;
    this.gameState.experience += experience;
    
    // Level up check
    if (this.gameState.experience >= this.gameState.level * 100) {
      this.gameState.level += 1;
      this.gameState.maxHealth += 10;
      this.gameState.maxMana += 5;
      this.gameState.health = this.gameState.maxHealth;
      this.gameState.mana = this.gameState.maxMana;
      return `You engage the ${enemyData.name} in combat! You take ${damage} damage but manage to drive it off. You gain ${experience} experience points and level up to ${this.gameState.level}! Your health and mana are fully restored.`;
    }
    
    return `You engage the ${enemyData.name} in combat! You take ${damage} damage but manage to drive it off. You gain ${experience} experience points. Your health is now ${this.gameState.health}.`;
  }

  public getGameState(): any {
    return { ...this.gameState };
  }

  public updateGameState(updates: any): void {
    this.gameState = { ...this.gameState, ...updates };
  }

  public changeLocation(newLocation: string): string {
    if (this.worlds[this.gameState.currentWorld].locations[newLocation]) {
      this.gameState.currentLocation = newLocation;
      const newLoc = this.worlds[this.gameState.currentWorld].locations[newLocation];
      return `You make your way to ${newLoc.name}. ${newLoc.description}\n\nWhat would you like to do here?`;
    }
    return "You're not sure where you want to go. You can see exits to: " + 
           Object.keys(this.worlds[this.gameState.currentWorld].locations).map(exit => exit.charAt(0).toUpperCase() + exit.slice(1)).join(', ');
  }

  public getWorlds(): string[] {
    return Object.keys(this.worlds);
  }

  public getCurrentWorld(): string {
    return this.gameState.currentWorld;
  }

  public getEndings(): Ending[] {
    return this.worlds[this.gameState.currentWorld].endings;
  }

  public checkEndingConditions(): Ending | null {
    const endings = this.worlds[this.gameState.currentWorld].endings;
    
    for (const ending of endings) {
      if (this.checkEndingRequirements(ending)) {
        ending.isUnlocked = true;
        return ending;
      }
    }
    
    return null;
  }

  private checkEndingRequirements(ending: Ending): boolean {
    switch (ending.id) {
      case 'hero_ending':
        return this.gameState.completedQuests.length >= 3 && 
               this.gameState.reputation.tavern >= 70 && 
               !this.gameState.storyFlags.ancientSealBroken;
      
      case 'dark_ending':
        return this.gameState.inventory.some(item => item.includes('dark') || item.includes('cursed')) &&
               this.gameState.storyFlags.ancientSealBroken;
      
      case 'neutral_ending':
        return this.gameState.level >= 5 && 
               this.gameState.inventory.includes('ancient knowledge') &&
               !this.gameState.storyFlags.ancientSealBroken;
      
      case 'destruction_ending':
        return this.gameState.storyFlags.ancientSealBroken && 
               this.gameState.health < 20;
      
      default:
        return false;
    }
  }
}

// Export singleton instance
export const localDungeonMaster = new LocalDungeonMaster();
