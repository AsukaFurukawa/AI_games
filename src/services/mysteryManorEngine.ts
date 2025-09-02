// Mystery Manor - Interactive Horror Puzzle Game Engine
// Features: Room-based exploration, chat-based puzzle solving, progressive horror

export interface ManorRoom {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  isUnlocked: boolean;
  requiredItems: string[];
  horrorLevel: number; // 1-10
  ambientSounds: string[];
  visualEffects: string[];
  puzzles: ManorPuzzle[];
  connections: string[]; // Other room IDs
  npcs: ManorNPC[];
  items: ManorItem[];
  secrets: ManorSecret[];
  atmosphere: 'mysterious' | 'eerie' | 'terrifying' | 'nightmarish';
  timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface ManorPuzzle {
  id: string;
  name: string;
  description: string;
  type: 'logic' | 'environmental' | 'audio' | 'visual' | 'story' | 'survival';
  difficulty: number; // 1-10
  isSolved: boolean;
  requiredItems: string[];
  clues: string[];
  solution: string;
  consequences: string[];
  horrorElements: string[];
  timeLimit?: number; // in seconds
  attempts: number;
  maxAttempts: number;
}

export interface ManorNPC {
  id: string;
  name: string;
  role: string;
  personality: string;
  currentMood: 'friendly' | 'neutral' | 'suspicious' | 'hostile' | 'terrifying';
  knowledge: string[];
  secrets: string[];
  currentLocation: string;
  dialogue: { [key: string]: string[] };
  isAlive: boolean;
  isGhost: boolean;
  fearFactor: number; // 1-10
}

export interface ManorItem {
  id: string;
  name: string;
  description: string;
  type: 'key' | 'tool' | 'clue' | 'weapon' | 'artifact' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'cursed';
  effects: string[];
  location: string;
  isHidden: boolean;
  isCursed: boolean;
  storySignificance: string;
}

export interface ManorSecret {
  id: string;
  name: string;
  description: string;
  type: 'lore' | 'puzzle' | 'treasure' | 'horror' | 'escape';
  isRevealed: boolean;
  requirements: string[];
  consequences: string[];
  horrorLevel: number;
}

export interface PlayerState {
  currentRoom: string;
  inventory: string[];
  discoveredSecrets: string[];
  solvedPuzzles: string[];
  fearLevel: number; // 1-10
  sanity: number; // 100-0
  health: number; // 100-0
  timeInMansion: number; // minutes
  encounters: string[];
  relationships: { [npcId: string]: number }; // -100 to 100
  storyProgress: number; // 0-10, tracks story advancement
  bookKnowledge: string[]; // tracks books read
  supernaturalAwareness: number; // 0-10, increases with book reading
  ritualProgress: number; // 0-100, tracks ritual completion
}

export interface GameResponse {
  narrative: string;
  roomDescription: string;
  availableActions: string[];
  puzzles: ManorPuzzle[];
  items: ManorItem[];
  npcs: ManorNPC[];
  atmosphere: string;
  ambientSounds: string[];
  visualEffects: string[];
  fearLevel: number;
  sanity: number;
  isGameOver: boolean;
  ending?: string;
}

export interface ManorEngine {
  currentRoom: ManorRoom;
  playerState: PlayerState;
  rooms: { [key: string]: ManorRoom };
  processAction(action: string): Promise<GameResponse>;
  moveToRoom(roomId: string): Promise<GameResponse>;
  solvePuzzle(puzzleId: string, solution: string): Promise<GameResponse>;
  interactWithNPC(npcId: string, action: string): Promise<GameResponse>;
  examineItem(itemId: string): Promise<GameResponse>;
  useItem(itemId: string, target: string): Promise<GameResponse>;
  getGameState(): GameResponse;
}

export class MysteryManorEngine implements ManorEngine {
  public currentRoom: ManorRoom;
  public playerState: PlayerState;
  public rooms: { [key: string]: ManorRoom };
  private gameTime: number = 0;
  private horrorEvents: string[] = [];
  private jumpScareChance: number = 0.1;

  constructor() {
    this.rooms = this.initializeRooms();
    this.playerState = this.initializePlayerState();
    this.currentRoom = this.rooms['foyer'];
  }

  private initializeRooms(): { [key: string]: ManorRoom } {
    return {
      'foyer': {
        id: 'foyer',
        name: 'Grand Foyer',
        description: 'A grand entrance hall with marble floors and a sweeping staircase.',
        longDescription: 'You stand in the grand foyer of Blackwood Manor. Marble floors reflect the dim light from ornate chandeliers above. A sweeping staircase leads to the upper floors, while portraits of stern ancestors watch your every move. The air is thick with dust and something else... something that makes your skin crawl.',
        isUnlocked: true,
        requiredItems: [],
        horrorLevel: 2,
        ambientSounds: ['Distant creaking', 'Wind through windows', 'Clock ticking'],
        visualEffects: ['Flickering shadows', 'Dust motes in light', 'Portrait eyes following'],
        puzzles: [
          {
            id: 'foyer_portrait',
            name: 'The Watching Portrait',
            description: 'One of the portraits seems to be watching you. Its eyes follow your movements.',
            type: 'visual',
            difficulty: 3,
            isSolved: false,
            requiredItems: [],
            clues: ['The portrait\'s eyes move', 'There\'s something behind it', 'Look closely at the frame'],
            solution: 'examine portrait frame',
            consequences: ['Portrait reveals hidden passage', 'Gain access to library', 'Fear level increases'],
            horrorElements: ['Moving eyes', 'Hidden passage', 'Supernatural presence'],
            attempts: 0,
            maxAttempts: 5
          }
        ],
        connections: ['library', 'dining_room'],
        npcs: [],
                 items: [
           {
             id: 'foyer_key',
             name: 'Ornate Key',
             description: 'A beautifully crafted key with intricate patterns.',
             type: 'key',
             rarity: 'uncommon',
             effects: ['Unlocks library door'],
             location: 'foyer',
             isHidden: true,
             isCursed: false,
             storySignificance: 'Belonged to the manor\'s original owner'
           },
           {
             id: 'shining_novel',
             name: 'The Shining',
             description: 'Stephen King\'s masterpiece about a haunted hotel. The pages seem to whisper.',
             type: 'clue',
             rarity: 'rare',
             effects: ['Reveals psychic abilities', 'Increases fear resistance'],
             location: 'foyer',
             isHidden: false,
             isCursed: true,
             storySignificance: 'Contains knowledge of the supernatural'
           },
           {
             id: 'hill_house',
             name: 'The Haunting of Hill House',
             description: 'Shirley Jackson\'s classic ghost story. The cover feels cold to the touch.',
             type: 'clue',
             rarity: 'uncommon',
             effects: ['Reveals ghost behavior', 'Increases perception'],
             location: 'foyer',
             isHidden: false,
             isCursed: false,
             storySignificance: 'Explains the manor\'s haunting patterns'
           }
         ],
        secrets: [
          {
            id: 'foyer_secret',
            name: 'Hidden Passage',
            description: 'A secret passage behind the portrait leads to the library.',
            type: 'puzzle',
            isRevealed: false,
            requirements: ['Solve portrait puzzle'],
            consequences: ['Access to library', 'Discover manor\'s secrets'],
            horrorLevel: 4
          }
        ],
        atmosphere: 'mysterious',
        timeOfDay: 'evening'
      },
             'library': {
         id: 'library',
         name: 'Ancient Library',
         description: 'A vast library filled with dusty tomes and forbidden knowledge.',
         longDescription: 'Rows of ancient bookshelves stretch into the darkness. The air is thick with the smell of old paper and something more sinister. Strange symbols are carved into the wooden shelves, and some books seem to whisper when you get too close. A large desk sits in the center, covered in scattered papers and a single, burning candle. The books here seem to pulse with dark energy.',
         isUnlocked: false,
         requiredItems: ['foyer_key'],
         horrorLevel: 5,
         ambientSounds: ['Pages rustling', 'Distant whispers', 'Candle flickering', 'Book thumps', 'Voices from books'],
         visualEffects: ['Moving shadows', 'Glowing symbols', 'Floating dust', 'Book pages turning', 'Book covers breathing'],
         puzzles: [
           {
             id: 'library_books',
             name: 'The Whispering Books',
             description: 'Some books seem to whisper secrets when arranged in the right order.',
             type: 'audio',
             difficulty: 6,
             isSolved: false,
             requiredItems: [],
             clues: ['Books whisper when touched', 'There\'s a pattern in the titles', 'Listen carefully to the order'],
             solution: 'arrange books by publication date',
             consequences: ['Reveals hidden message', 'Unlocks study door', 'Books stop whispering'],
             horrorElements: ['Whispering books', 'Hidden messages', 'Supernatural knowledge'],
             attempts: 0,
             maxAttempts: 3
           }
         ],
         connections: ['foyer', 'study', 'secret_chamber'],
         npcs: [
           {
             id: 'librarian_ghost',
             name: 'The Librarian',
             role: 'Former librarian',
             personality: 'Scholarly but disturbed',
             currentMood: 'suspicious',
             knowledge: ['Book locations', 'Manor history', 'Hidden passages', 'Book curses'],
             secrets: ['How he died', 'What he discovered', 'Why he stays', 'The cursed collection'],
             currentLocation: 'library',
             dialogue: {
               'greet': ['"Ah, a new reader... Welcome to my collection."', '"The books have been waiting for someone like you."'],
               'ask_history': ['"This manor has seen many dark deeds..."', '"The books tell stories that would drive you mad."'],
               'ask_help': ['"I can help you find what you seek... for a price."', '"Knowledge comes with consequences."'],
               'ask_books': ['"These books... they\'re not just stories. They\'re windows into other worlds."', '"Each book has claimed a reader\'s soul. Choose wisely."']
             },
             isAlive: false,
             isGhost: true,
             fearFactor: 7
           }
         ],
         items: [
           {
             id: 'ancient_tome',
             name: 'Ancient Tome',
             description: 'A leather-bound book with strange symbols on the cover.',
             type: 'clue',
             rarity: 'rare',
             effects: ['Reveals manor secrets', 'Increases fear level'],
             location: 'library',
             isHidden: false,
             isCursed: true,
             storySignificance: 'Contains the manor\'s darkest secrets'
           },
           {
             id: 'poe_collection',
             name: 'Poe Collection',
             description: 'A collection of Edgar Allan Poe\'s works bound in black leather.',
             type: 'clue',
             rarity: 'uncommon',
             effects: ['Reveals gothic secrets', 'Increases atmosphere'],
             location: 'library',
             isHidden: false,
             isCursed: false,
             storySignificance: 'Contains tales of madness and death'
           },
           {
             id: 'lovecraft_tome',
             name: 'Lovecraft Tome',
             description: 'A book with tentacled creatures on the cover that seems to move.',
             type: 'clue',
             rarity: 'legendary',
             effects: ['Reveals cosmic horrors', 'Severely decreases sanity'],
             location: 'library',
             isHidden: true,
             isCursed: true,
             storySignificance: 'Contains knowledge of the Old Ones'
           }
         ],
         secrets: [
           {
             id: 'library_secret',
             name: 'Forbidden Knowledge',
             description: 'The library contains books that drive readers to madness.',
             type: 'lore',
             isRevealed: false,
             requirements: ['Read ancient tome'],
             consequences: ['Sanity decreases', 'Access to hidden knowledge'],
             horrorLevel: 8
           }
         ],
         atmosphere: 'eerie',
         timeOfDay: 'evening'
       },
       'study': {
         id: 'study',
         name: 'The Study',
         description: 'A cozy study with leather chairs and a fireplace.',
         longDescription: 'A warm study with deep leather chairs arranged around a crackling fireplace. Bookshelves line the walls, filled with classic literature and mystery novels. The air is thick with the smell of leather and tobacco, but there\'s an underlying scent of something... wrong. The fireplace casts dancing shadows that seem to move independently.',
         isUnlocked: false,
         requiredItems: ['library_key'],
         horrorLevel: 4,
         ambientSounds: ['Fire crackling', 'Clock ticking', 'Distant footsteps', 'Paper rustling'],
         visualEffects: ['Dancing fire shadows', 'Clock hands moving backwards', 'Books falling from shelves'],
         puzzles: [
           {
             id: 'study_clock',
             name: 'The Backwards Clock',
             description: 'A grandfather clock that ticks backwards and seems to control time in the room.',
             type: 'environmental',
             difficulty: 7,
             isSolved: false,
             requiredItems: ['clock_key'],
             clues: ['Clock ticks backwards', 'Time seems distorted', 'Look for the key'],
             solution: 'use clock key on clock',
             consequences: ['Time returns to normal', 'Reveals hidden passage', 'Unlocks basement'],
             horrorElements: ['Time distortion', 'Hidden passage', 'Supernatural clock'],
             attempts: 0,
             maxAttempts: 3
           }
         ],
         connections: ['library', 'basement'],
         npcs: [],
         items: [
           {
             id: 'clock_key',
             name: 'Clock Key',
             description: 'A small brass key that fits the grandfather clock.',
             type: 'key',
             rarity: 'uncommon',
             effects: ['Unlocks clock mechanism', 'Controls time distortion'],
             location: 'study',
             isHidden: true,
             isCursed: false,
             storySignificance: 'Controls the study\'s temporal anomalies'
           },
           {
             id: 'christie_mystery',
             name: 'Agatha Christie Mystery',
             description: 'A well-worn copy of "And Then There Were None" with notes in the margins.',
             type: 'clue',
             rarity: 'uncommon',
             effects: ['Reveals mystery clues', 'Increases detective skills'],
             location: 'study',
             isHidden: false,
             isCursed: false,
             storySignificance: 'Contains clues about the manor\'s victims'
           }
         ],
         secrets: [
           {
             id: 'study_secret',
             name: 'Temporal Anomaly',
             description: 'The study exists outside normal time, allowing glimpses into the past and future.',
             type: 'puzzle',
             isRevealed: false,
             requirements: ['Solve clock puzzle'],
             consequences: ['Access to basement', 'Time travel visions'],
             horrorLevel: 6
           }
         ],
         atmosphere: 'mysterious',
         timeOfDay: 'evening'
       },
       'basement': {
         id: 'basement',
         name: 'The Basement',
         description: 'A dark, damp basement with stone walls and mysterious machinery.',
         longDescription: 'Stone walls drip with condensation, and the air is thick with the smell of earth and decay. Strange machinery hums in the darkness, its purpose unclear. The floor is covered in ancient symbols that glow with a sickly green light. This place feels ancient, older than the manor itself. Something powerful slumbers here.',
         isUnlocked: false,
         requiredItems: ['clock_key'],
         horrorLevel: 9,
         ambientSounds: ['Machinery humming', 'Water dripping', 'Distant screams', 'Ancient chanting'],
         visualEffects: ['Glowing symbols', 'Floating particles', 'Shadow creatures', 'Reality distortion'],
         puzzles: [
           {
             id: 'basement_ritual',
             name: 'The Ancient Ritual',
             description: 'Ancient symbols on the floor form a ritual circle that must be activated.',
             type: 'story',
             difficulty: 9,
             isSolved: false,
             requiredItems: ['ancient_tome', 'lovecraft_tome'],
             clues: ['Symbols glow when approached', 'Books contain the ritual', 'Combine knowledge'],
             solution: 'perform the ritual',
             consequences: ['Reveals manor\'s true purpose', 'Unlocks final secret', 'Game ending'],
             horrorElements: ['Ancient magic', 'Cosmic horror', 'Reality bending'],
             attempts: 0,
             maxAttempts: 1
           }
         ],
         connections: ['study'],
         npcs: [
           {
             id: 'ancient_entity',
             name: 'The Ancient One',
             role: 'Elder entity',
             personality: 'Beyond human comprehension',
             currentMood: 'terrifying',
             knowledge: ['The manor\'s true purpose', 'Cosmic secrets', 'Reality itself'],
             secrets: ['Why the manor exists', 'What it feeds on', 'How to escape'],
             currentLocation: 'basement',
             dialogue: {
               'greet': ['"You have come far, mortal. But you are not ready for what lies beyond."', '"The manor has chosen you. There is no escape."'],
               'ask_purpose': ['"This place is a prison, a feeding ground, a gateway to realms beyond your understanding."', '"Every soul that enters feeds the ancient hunger."'],
               'ask_escape': ['"Escape? There is no escape. Only transformation or destruction."', '"You will become one with the manor, or you will be consumed."']
             },
             isAlive: false,
             isGhost: false,
             fearFactor: 10
           }
         ],
         items: [],
         secrets: [
           {
             id: 'basement_secret',
             name: 'The Manor\'s Heart',
             description: 'The basement contains the true heart of Blackwood Manor - an ancient entity that feeds on human souls.',
             type: 'horror',
             isRevealed: false,
             requirements: ['Complete ritual'],
             consequences: ['True ending', 'Manor\'s secrets revealed'],
             horrorLevel: 10
           }
         ],
         atmosphere: 'nightmarish',
         timeOfDay: 'night'
       }
    };
  }

  private initializePlayerState(): PlayerState {
    return {
      currentRoom: 'foyer',
      inventory: [],
      discoveredSecrets: [],
      solvedPuzzles: [],
      fearLevel: 1,
      sanity: 100,
      health: 100,
      timeInMansion: 0,
      encounters: [],
      relationships: {},
      storyProgress: 0, // New: tracks story advancement
      bookKnowledge: [], // New: tracks books read
      supernaturalAwareness: 0, // New: increases with book reading
      ritualProgress: 0 // New: tracks ritual completion
    };
  }

  async processAction(action: string): Promise<GameResponse> {
    const lowerAction = action.toLowerCase();
    
    // Process different types of actions
    if (lowerAction.includes('move') || lowerAction.includes('go') || lowerAction.includes('enter')) {
      return await this.handleMovement(action);
    } else if (lowerAction.includes('examine') || lowerAction.includes('look') || lowerAction.includes('inspect')) {
      return this.handleExamination(action);
    } else if (lowerAction.includes('use') || lowerAction.includes('take') || lowerAction.includes('pick')) {
      return this.handleItemInteraction(action);
    } else if (lowerAction.includes('talk') || lowerAction.includes('ask') || lowerAction.includes('speak')) {
      return this.handleNPCInteraction(action);
    } else if (lowerAction.includes('solve') || lowerAction.includes('puzzle') || lowerAction.includes('clue')) {
      return await this.handlePuzzleSolving(action);
    } else if (lowerAction.includes('read')) {
      return this.handleBookReading(action);
    } else {
      return await this.handleGenericAction(action);
    }
  }

  private async handleMovement(action: string): Promise<GameResponse> {
    // Extract room name from action
    const roomNames = Object.keys(this.rooms);
    const targetRoom = roomNames.find(room => 
      action.toLowerCase().includes(room.toLowerCase())
    );

    if (targetRoom && this.canEnterRoom(targetRoom)) {
      return await this.moveToRoom(targetRoom);
    } else if (targetRoom) {
      return this.createResponse(
        `You try to enter the ${targetRoom}, but something blocks your way.`,
        this.currentRoom,
        ['examine the obstacle', 'look for another way', 'check your inventory']
      );
    } else {
      return this.createResponse(
        `You're not sure where you want to go. The mansion seems to shift around you.`,
        this.currentRoom,
        ['explore current room', 'check available exits', 'examine surroundings']
      );
    }
  }

  private handleExamination(action: string): GameResponse {
    const room = this.currentRoom;
    const lowerAction = action.toLowerCase();
    
    if (lowerAction.includes('portrait') || lowerAction.includes('frame') || lowerAction.includes('painting')) {
      // This is the key story element - make it meaningful!
      if (room.id === 'foyer') {
        const portraitPuzzle = room.puzzles.find(p => p.id === 'foyer_portrait');
        if (portraitPuzzle && !portraitPuzzle.isSolved) {
          return this.createResponse(
            `You examine the portrait closely. The stern ancestor's eyes seem to follow your every move, and as you look deeper, you notice something strange about the frame. There are tiny symbols carved into the wood that seem to glow faintly in the dim light. This isn't just a painting - it's hiding something important. The symbols look ancient and powerful.`,
            room,
            ['touch the symbols', 'examine the frame more closely', 'try to move the portrait', 'search for more clues']
          );
        } else {
          return this.createResponse(
            `The portrait frame is now open, revealing a hidden compartment behind it. The symbols have stopped glowing, and you can see a passage or mechanism that wasn't there before.`,
            room,
            ['enter the passage', 'examine the mechanism', 'search the compartment']
          );
        }
      } else {
        return this.createResponse(
          `You examine the portrait, but it's just an ordinary painting here.`,
          room,
          ['examine other objects', 'search for clues', 'look around']
        );
      }
    } else if (lowerAction.includes('book') || lowerAction.includes('shelf')) {
      if (room.id === 'foyer') {
        return this.createResponse(
          `You examine the bookshelves. Several classic horror novels catch your eye: "The Shining" by Stephen King seems to whisper secrets, "The Haunting of Hill House" by Shirley Jackson feels unnaturally cold, and there are other titles that seem to pulse with dark energy. These aren't just books - they're gateways to knowledge that could help you survive the manor.`,
          room,
          ['read The Shining', 'read The Haunting of Hill House', 'examine other books', 'search for hidden items']
        );
      } else if (room.id === 'library') {
        return this.createResponse(
          `You examine the ancient bookshelves. The air is thick with forbidden knowledge. You see the Ancient Tome with glowing symbols, a collection of Edgar Allan Poe's works that seem to whisper tales of madness, and something even darker - a book with tentacled creatures on the cover that seems to move when you're not looking directly at it.`,
          room,
          ['read Ancient Tome', 'read Poe Collection', 'examine Lovecraft Tome', 'arrange books by date']
        );
      } else if (room.id === 'study') {
        return this.createResponse(
          `The study's bookshelves contain classic mystery novels and literature. You notice a well-worn copy of Agatha Christie's "And Then There Were None" with handwritten notes in the margins. The notes seem to tell a story of their own - someone has been documenting the manor's victims.`,
          room,
          ['read Christie Mystery', 'examine the notes', 'look for other books', 'examine the clock']
        );
      }
    } else if (lowerAction.includes('room') || lowerAction.includes('surroundings')) {
      return this.createResponse(
        room.longDescription,
        room,
        ['examine specific objects', 'search for clues', 'try to leave', 'listen to the room']
      );
    } else if (lowerAction.includes('key') && this.playerState.inventory.includes('foyer_key')) {
      return this.createResponse(
        `You examine the ornate key you found. It's made of dark metal with intricate engravings that seem to tell a story. The key feels warm to the touch, as if it's alive with some kind of energy. This could definitely unlock something important in the mansion.`,
        room,
        ['try the key on doors', 'examine the engravings', 'search for the lock', 'put the key away']
      );
    } else if (lowerAction.includes('clock') && room.id === 'study') {
      return this.createResponse(
        `You examine the grandfather clock. Its hands are moving backwards, and the ticking sound seems to echo from another time. The clock face has strange symbols around it, and you notice a small keyhole at the bottom. This clock is definitely not normal - it seems to control time itself in this room.`,
        room,
        ['look for the clock key', 'examine the symbols', 'listen to the ticking', 'try to stop the clock']
      );
    } else {
      return this.createResponse(
        `You examine the area, but nothing seems out of the ordinary... yet. However, you get the distinct feeling that you're missing something important. The mansion seems to be waiting for you to discover its secrets.`,
        room,
        ['look more carefully', 'search for hidden items', 'examine specific objects', 'listen for sounds']
      );
    }
  }

  private handleItemInteraction(action: string): GameResponse {
    const room = this.currentRoom;
    
    if (action.toLowerCase().includes('key') && this.playerState.inventory.includes('foyer_key')) {
      if (room.id === 'foyer') {
        // Unlock library
        this.rooms['library'].isUnlocked = true;
        return this.createResponse(
          `You use the ornate key on the library door. It clicks open with a sound that echoes through the mansion. The door swings open to reveal darkness beyond.`,
          room,
          ['enter library', 'examine the door', 'return to foyer']
        );
      }
    } else if (action.toLowerCase().includes('take') || action.toLowerCase().includes('pick')) {
      const item = room.items.find(i => !i.isHidden && action.toLowerCase().includes(i.name.toLowerCase()));
      if (item) {
        this.playerState.inventory.push(item.id);
        room.items = room.items.filter(i => i.id !== item.id);
        return this.createResponse(
          `You pick up the ${item.name}. ${item.description}`,
          room,
          ['examine the item', 'use the item', 'continue exploring']
        );
      }
    }
    
    return this.createResponse(
      `You're not sure how to use that here.`,
      room,
      ['examine your inventory', 'look for usable items', 'ask for help']
    );
  }

  private handleNPCInteraction(action: string): GameResponse {
    const room = this.currentRoom;
    const npc = room.npcs[0]; // For now, assume one NPC per room
    
    if (!npc) {
      return this.createResponse(
        `You speak, but only silence answers. The mansion seems to absorb your words.`,
        room,
        ['call out louder', 'listen carefully', 'examine the room']
      );
    }
    
    const lowerAction = action.toLowerCase();
    
    // Dynamic NPC responses based on story progress and book knowledge
    if (lowerAction.includes('talk') || lowerAction.includes('ask') || lowerAction.includes('speak')) {
      
      // Different responses based on which books you've read
      if (this.playerState.bookKnowledge.includes('hill_house')) {
        // Ghost communication unlocked
        if (lowerAction.includes('history')) {
          return this.createResponse(
            `"I can now tell you the truth," ${npc.name} whispers, his form becoming more solid. "I was the manor's librarian for 30 years, until I discovered its true purpose. It's not just haunted - it's a living entity that feeds on human souls. I died trying to escape, but now I'm trapped here, helping others understand the danger."`,
            room,
            ['ask about escape routes', 'ask about other victims', 'ask about the manor\'s hunger', 'ask about the books']
          );
        } else if (lowerAction.includes('escape')) {
          return this.createResponse(
            `"There are three ways out," ${npc.name} says. "The first is through the portrait puzzle - it leads to the library. The second is through the clock in the study - it controls time itself. The third... the third is through the basement ritual, but that path leads to madness or transformation."`,
            room,
            ['ask about portrait puzzle', 'ask about clock puzzle', 'ask about basement ritual', 'ask about transformation']
          );
        } else if (lowerAction.includes('books')) {
          return this.createResponse(
            `"The books are the key to everything," ${npc.name} explains. "Each one you read unlocks new abilities and reveals more of the manor's secrets. But be careful - some knowledge comes with a terrible price. The Lovecraft Tome, for instance, can drive you mad, but it also grants ultimate power."`,
            room,
            ['ask about specific books', 'ask about the price', 'ask about ultimate power', 'ask about madness']
          );
        }
      } else {
        // Normal responses before ghost communication
        if (lowerAction.includes('history')) {
          return this.createResponse(
            `"The manor has a dark past," ${npc.name} whispers. "Built on ancient ground, it has seen things that would drive you mad. The books... they contain knowledge that should have stayed buried."`,
            room,
            ['ask about the books', 'ask about the ground', 'ask about the knowledge']
          );
        } else if (lowerAction.includes('help')) {
          return this.createResponse(
            `"I can help you navigate this place," ${npc.name} says, his form flickering. "But every answer comes with a price. Your sanity, perhaps. Or your soul."`,
            room,
            ['accept the help', 'refuse the help', 'ask about the price']
          );
        }
      }
      
      // Generic response for other questions
      return this.createResponse(
        `"What would you like to know?" ${npc.name} asks, his voice echoing strangely.`,
        room,
        ['ask about history', 'ask for help', 'ask about the manor', 'ask about escape']
      );
    }
    
    return this.createResponse(
      `You speak, but only silence answers. The mansion seems to absorb your words.`,
      room,
      ['call out louder', 'listen carefully', 'examine the room']
    );
  }

  private async handlePuzzleSolving(action: string): Promise<GameResponse> {
    const room = this.currentRoom;
    const puzzle = room.puzzles.find(p => !p.isSolved);
    
    if (puzzle) {
      if (action.toLowerCase().includes(puzzle.solution.toLowerCase())) {
        return await this.solvePuzzle(puzzle.id, action);
      } else {
        puzzle.attempts++;
        if (puzzle.attempts >= puzzle.maxAttempts) {
          return this.createResponse(
            `Your attempts to solve the puzzle seem to anger something in the room. The air grows colder, and you hear distant whispers growing louder.`,
            room,
            ['try a different approach', 'examine the clues again', 'ask for help']
          );
        }
        return this.createResponse(
          `That doesn't seem quite right. The puzzle remains unsolved, and you feel like you're being watched.`,
          room,
          ['try again', 'examine the clues', 'look for more hints']
        );
      }
    }
    
    return this.createResponse(
      `You're not sure what puzzle you're trying to solve.`,
      room,
      ['examine the room', 'look for puzzles', 'explore further']
    );
  }

  private handleBookReading(action: string): GameResponse {
    const room = this.currentRoom;
    const lowerAction = action.toLowerCase();
    
    // Handle reading specific books with dynamic story progression
    if (lowerAction.includes('shining')) {
      if (!this.playerState.bookKnowledge.includes('shining')) {
        this.playerState.bookKnowledge.push('shining');
        this.playerState.supernaturalAwareness += 2;
        this.playerState.storyProgress += 1;
        this.playerState.fearLevel = Math.min(10, this.playerState.fearLevel + 1);
        
        // Unlock new abilities and story elements
        this.unlockNewStoryElements('shining');
        
        return this.createResponse(
          `🔥 "The Shining" reveals its secrets! You gain PSYCHIC SIGHT - you can now see supernatural entities and hidden passages. The manor's true nature becomes clear: it's a living entity that feeds on fear. New story paths have opened up!`,
          room,
          ['use psychic sight', 'examine supernatural entities', 'search for hidden passages', 'read another book']
        );
      } else {
        return this.createResponse(
          `You've already absorbed "The Shining"'s knowledge. Your psychic abilities are at their peak.`,
          room,
          ['use psychic sight', 'examine other books', 'search for clues']
        );
      }
    } else if (lowerAction.includes('hill house')) {
      if (!this.playerState.bookKnowledge.includes('hill_house')) {
        this.playerState.bookKnowledge.push('hill_house');
        this.playerState.supernaturalAwareness += 1;
        this.playerState.storyProgress += 1;
        
        // Unlock ghost communication
        this.unlockNewStoryElements('hill_house');
        
        return this.createResponse(
          `👻 "The Haunting of Hill House" grants you GHOST COMMUNICATION! You can now speak with spirits and understand the manor's haunting patterns. The librarian ghost becomes more talkative and reveals new secrets!`,
          room,
          ['talk to librarian', 'ask about manor history', 'communicate with spirits', 'read another book']
        );
      } else {
        return this.createResponse(
          `You've mastered ghost communication. The spirits are now your allies.`,
          room,
          ['talk to librarian', 'examine other books', 'search for clues']
        );
      }
    } else if (lowerAction.includes('ancient tome')) {
      if (!this.playerState.bookKnowledge.includes('ancient_tome')) {
        this.playerState.bookKnowledge.push('ancient_tome');
        this.playerState.supernaturalAwareness += 3;
        this.playerState.storyProgress += 2;
        this.playerState.sanity = Math.max(0, this.playerState.sanity - 15);
        this.playerState.fearLevel = Math.min(10, this.playerState.fearLevel + 2);
        
        // Unlock cosmic knowledge and new rooms
        this.unlockNewStoryElements('ancient_tome');
        
        return this.createResponse(
          `🌌 The Ancient Tome reveals COSMIC KNOWLEDGE! You understand the manor is a dimensional gateway. New areas unlock: the Study and Basement become accessible. You can now perform rituals and bend reality!`,
          room,
          ['perform reality ritual', 'enter study', 'access basement', 'read another book']
        );
      } else {
        return this.createResponse(
          `The Ancient Tome's knowledge flows through you. Reality itself seems malleable.`,
          room,
          ['perform reality ritual', 'examine other books', 'search for clues']
        );
      }
    } else if (lowerAction.includes('poe collection')) {
      if (!this.playerState.bookKnowledge.includes('poe')) {
        this.playerState.bookKnowledge.push('poe');
        this.playerState.supernaturalAwareness += 1;
        this.playerState.storyProgress += 1;
        this.playerState.fearLevel = Math.min(10, this.playerState.fearLevel + 1);
        
        // Unlock gothic survival tactics
        this.unlockNewStoryElements('poe');
        
        return this.createResponse(
          `🖤 Poe's tales grant you GOTHIC SURVIVAL! You can now use fear as a weapon, turn madness into strength, and understand the manor's psychological traps. New survival options appear!`,
          room,
          ['use fear as weapon', 'embrace madness', 'analyze psychological traps', 'read another book']
        );
      } else {
        return this.createResponse(
          `You've mastered gothic survival. Fear is now your ally.`,
          room,
          ['use fear as weapon', 'examine other books', 'search for clues']
        );
      }
    } else if (lowerAction.includes('christie mystery')) {
      if (!this.playerState.bookKnowledge.includes('christie')) {
        this.playerState.bookKnowledge.push('christie');
        this.playerState.storyProgress += 1;
        
        // Unlock detective skills and victim patterns
        this.unlockNewStoryElements('christie');
        
        return this.createResponse(
          `🔍 "And Then There Were None" grants you DETECTIVE INSIGHT! You can now see victim patterns, predict the manor's next move, and understand you're in a deadly game. New investigation options unlock!`,
          room,
          ['analyze victim patterns', 'predict manor moves', 'use detective skills', 'read another book']
        );
      } else {
        return this.createResponse(
          `Your detective skills are sharp. You can see through the manor's deceptions.`,
          room,
          ['analyze victim patterns', 'examine other books', 'search for clues']
        );
      }
    } else if (lowerAction.includes('lovecraft tome')) {
      if (!this.playerState.bookKnowledge.includes('lovecraft')) {
        this.playerState.bookKnowledge.push('lovecraft');
        this.playerState.supernaturalAwareness += 4;
        this.playerState.storyProgress += 3;
        this.playerState.sanity = Math.max(0, this.playerState.sanity - 25);
        this.playerState.fearLevel = Math.min(10, this.playerState.fearLevel + 3);
        
        // Unlock ultimate cosmic powers
        this.unlockNewStoryElements('lovecraft');
        
        return this.createResponse(
          `🐙 The Lovecraft Tome grants you COSMIC DOMINION! You can now see the Old Ones, perform reality-bending rituals, and access the manor's deepest secrets. The final ending path is now open!`,
          room,
          ['perform cosmic ritual', 'summon Old Ones', 'access final secrets', 'complete the game']
        );
      } else {
        return this.createResponse(
          `You've achieved cosmic dominion. The Old Ones recognize your power.`,
          room,
          ['perform cosmic ritual', 'examine other books', 'search for clues']
        );
      }
    }
    
    return this.createResponse(
      `You're not sure what book you're trying to read.`,
      room,
      ['examine bookshelves', 'look for specific books', 'search for clues']
    );
  }

  private async handleGenericAction(action: string): Promise<GameResponse> {
    const room = this.currentRoom;
    const lowerAction = action.toLowerCase();
    
    // Handle specific actions that advance the story
    if (lowerAction.includes('search') || lowerAction.includes('look for')) {
      if (lowerAction.includes('hidden') || lowerAction.includes('items')) {
        // Search for hidden items - this should reveal something!
        if (room.id === 'foyer') {
          // Reveal the hidden key in the foyer
          const hiddenKey = room.items.find(item => item.isHidden);
          if (hiddenKey && !this.playerState.inventory.includes(hiddenKey.id)) {
            hiddenKey.isHidden = false;
            return this.createResponse(
              `You search carefully through the foyer, running your hands along the walls and furniture. Your fingers catch on something metallic behind a loose panel in the wall. You've found an ornate key! This could unlock new areas of the mansion.`,
              room,
              ['examine the key', 'try the key on doors', 'search for more items']
            );
          } else {
            return this.createResponse(
              `You search thoroughly but find nothing new. However, you notice the portrait's eyes seem to follow your movements more intently now. There's definitely something important about that painting.`,
              room,
              ['examine the portrait closely', 'look behind the portrait', 'search other areas']
            );
          }
        }
      }
    }
    
    if (lowerAction.includes('examine') || lowerAction.includes('look at')) {
      if (lowerAction.includes('portrait') || lowerAction.includes('painting')) {
        // This is the key to story progression!
        if (room.id === 'foyer') {
          // Trigger the portrait puzzle
          const portraitPuzzle = room.puzzles.find(p => p.id === 'foyer_portrait');
          if (portraitPuzzle && !portraitPuzzle.isSolved) {
            // Give a meaningful response that advances the story
            return this.createResponse(
              `You examine the portrait closely. The eyes seem to follow your every move, and as you look deeper, you notice something strange about the frame. There are tiny symbols carved into the wood that seem to glow faintly in the dim light. This isn't just a painting - it's hiding something important.`,
              room,
              ['touch the symbols', 'examine the frame more closely', 'try to move the portrait']
            );
          }
        }
      }
    }
    
    if (lowerAction.includes('touch') || lowerAction.includes('press')) {
      if (lowerAction.includes('symbol') || lowerAction.includes('frame')) {
        // This should solve the portrait puzzle and unlock progression
        return await this.solvePuzzle('foyer_portrait', 'touch symbols');
      }
    }
    
    if (lowerAction.includes('move') || lowerAction.includes('push')) {
      if (lowerAction.includes('portrait')) {
        // Alternative way to solve the puzzle
        return await this.solvePuzzle('foyer_portrait', 'move portrait');
      }
    }
    
    // Random horror events for generic actions
    if (Math.random() < this.jumpScareChance) {
      this.triggerHorrorEvent();
    }
    
    // More specific responses based on the action
    if (lowerAction.includes('explore') || lowerAction.includes('investigate')) {
      return this.createResponse(
        `You ${action.toLowerCase()}. The mansion seems to respond to your investigation - shadows shift, and you hear distant sounds that might be clues or just your imagination.`,
        room,
        ['examine specific objects', 'search for hidden items', 'listen carefully']
      );
    }
    
    return this.createResponse(
      `You ${action.toLowerCase()}. The mansion responds with an eerie silence that somehow feels more threatening than any sound.`,
      room,
      ['explore the room', 'examine objects', 'try to leave']
    );
  }

  private unlockNewStoryElements(bookType: string): void {
    // Dynamically unlock new content based on books read
    switch (bookType) {
      case 'shining':
        // Unlock psychic abilities and hidden passages
        this.rooms['foyer'].visualEffects.push('Hidden passages visible', 'Supernatural entities');
        this.rooms['foyer'].items.push({
          id: 'psychic_crystal',
          name: 'Psychic Crystal',
          description: 'A crystal that glows when supernatural entities are near.',
          type: 'tool',
          rarity: 'rare',
          effects: ['Detects supernatural entities', 'Reveals hidden passages'],
          location: 'foyer',
          isHidden: false,
          isCursed: false,
          storySignificance: 'Gained from reading The Shining'
        });
        break;
        
      case 'hill_house':
        // Unlock ghost communication and new NPC dialogue
        if (this.rooms['library'].npcs.length > 0) {
          const librarian = this.rooms['library'].npcs[0];
          librarian.dialogue['ghost_secrets'] = [
            '"I can now tell you the truth about my death..."',
            '"The manor killed me when I discovered its secrets."',
            '"There are other ghosts here, trapped like me."'
          ];
        }
        break;
        
      case 'ancient_tome':
        // Unlock new rooms and cosmic abilities
        this.rooms['study'].isUnlocked = true;
        this.rooms['basement'].isUnlocked = true;
        this.rooms['foyer'].items.push({
          id: 'reality_shard',
          name: 'Reality Shard',
          description: 'A fragment of reality that can bend space and time.',
          type: 'artifact',
          rarity: 'legendary',
          effects: ['Bends reality', 'Opens dimensional portals'],
          location: 'foyer',
          isHidden: false,
          isCursed: true,
          storySignificance: 'Gained from reading Ancient Tome'
        });
        break;
        
      case 'poe':
        // Unlock gothic survival tactics
        this.rooms['foyer'].items.push({
          id: 'fear_weapon',
          name: 'Fear Weapon',
          description: 'A weapon that turns your fear into destructive power.',
          type: 'weapon',
          rarity: 'rare',
          effects: ['Uses fear as ammunition', 'Stronger when afraid'],
          location: 'foyer',
          isHidden: false,
          isCursed: false,
          storySignificance: 'Gained from reading Poe Collection'
        });
        break;
        
      case 'christie':
        // Unlock detective skills and victim analysis
        this.rooms['foyer'].items.push({
          id: 'detective_lens',
          name: 'Detective Lens',
          description: 'A magnifying glass that reveals hidden clues and patterns.',
          type: 'tool',
          rarity: 'uncommon',
          effects: ['Reveals hidden clues', 'Analyzes victim patterns'],
          location: 'foyer',
          isHidden: false,
          isCursed: false,
          storySignificance: 'Gained from reading Christie Mystery'
        });
        break;
        
      case 'lovecraft':
        // Unlock ultimate cosmic powers
        this.rooms['foyer'].items.push({
          id: 'old_one_essence',
          name: 'Old One Essence',
          description: 'Pure cosmic power that grants dominion over reality.',
          type: 'artifact',
          rarity: 'legendary',
          effects: ['Cosmic dominion', 'Reality manipulation', 'Old One communication'],
          location: 'foyer',
          isHidden: false,
          isCursed: true,
          storySignificance: 'Gained from reading Lovecraft Tome'
        });
        break;
    }
  }

  private triggerHorrorEvent(): void {
    const events = [
      'A cold breeze passes through the room, making the candles flicker.',
      'You hear a distant whisper that seems to come from the walls themselves.',
      'A shadow moves in the corner of your eye, but when you look, nothing is there.',
      'The temperature drops suddenly, and you can see your breath in the air.',
      'A book falls from a shelf with a loud thump, though no one is near it.'
    ];
    
    this.horrorEvents.push(events[Math.floor(Math.random() * events.length)]);
    this.playerState.fearLevel = Math.min(10, this.playerState.fearLevel + 1);
  }

  private canEnterRoom(roomId: string): boolean {
    const room = this.rooms[roomId];
    if (!room) return false;
    
    if (room.isUnlocked) return true;
    
    // Check if player has required items
    return room.requiredItems.every(itemId => 
      this.playerState.inventory.includes(itemId)
    );
  }

  async moveToRoom(roomId: string): Promise<GameResponse> {
    const targetRoom = this.rooms[roomId];
    if (!targetRoom) {
      return this.createResponse(
        'That room doesn\'t exist... or does it?',
        this.currentRoom,
        ['explore current room', 'look for exits', 'examine surroundings']
      );
    }

    if (!this.canEnterRoom(roomId)) {
      return this.createResponse(
        `You can't enter the ${targetRoom.name} yet. Something blocks your way.`,
        this.currentRoom,
        ['examine the obstacle', 'look for another way', 'check your inventory']
      );
    }

    this.currentRoom = targetRoom;
    this.playerState.currentRoom = roomId;
    this.playerState.timeInMansion += 5; // 5 minutes per room change
    
    // Increase fear level in more dangerous rooms
    if (targetRoom.horrorLevel > this.playerState.fearLevel) {
      this.playerState.fearLevel = Math.min(10, this.playerState.fearLevel + 1);
    }

    return this.createResponse(
      `You enter the ${targetRoom.name}. ${targetRoom.longDescription}`,
      targetRoom,
      ['explore the room', 'examine objects', 'look for exits', 'search for clues']
    );
  }

  async solvePuzzle(puzzleId: string, solution: string): Promise<GameResponse> {
    const room = this.currentRoom;
    const puzzle = room.puzzles.find(p => p.id === puzzleId);
    
    if (!puzzle) {
      return this.createResponse(
        'You\'re not sure what puzzle you\'re trying to solve.',
        room,
        ['examine the room', 'look for puzzles', 'explore further']
      );
    }

    if (puzzle.isSolved) {
      return this.createResponse(
        'This puzzle has already been solved.',
        room,
        ['explore the room', 'look for other puzzles', 'examine the solution']
      );
    }

    // Dynamic puzzle solving based on your abilities
    let canSolve = false;
    let specialMethod = '';
    
    if (puzzleId === 'foyer_portrait') {
      // Portrait puzzle can be solved multiple ways
      canSolve = solution.toLowerCase().includes('touch') || 
                 solution.toLowerCase().includes('move') ||
                 solution.toLowerCase().includes('symbol');
      
      if (this.playerState.bookKnowledge.includes('shining')) {
        // Psychic sight makes it easier
        canSolve = canSolve || solution.toLowerCase().includes('psychic') ||
                   solution.toLowerCase().includes('see');
        specialMethod = 'psychic sight';
      }
    } else if (puzzleId === 'library_books') {
      // Book puzzle requires different approaches based on knowledge
      canSolve = solution.toLowerCase().includes('arrange') ||
                 solution.toLowerCase().includes('order') ||
                 solution.toLowerCase().includes('date');
      
      if (this.playerState.bookKnowledge.includes('christie')) {
        // Detective skills make it easier
        canSolve = canSolve || solution.toLowerCase().includes('detective') ||
                   solution.toLowerCase().includes('analyze');
        specialMethod = 'detective skills';
      }
    } else if (puzzleId === 'study_clock') {
      // Clock puzzle requires time manipulation
      canSolve = solution.toLowerCase().includes('key') ||
                 solution.toLowerCase().includes('clock') ||
                 solution.toLowerCase().includes('time');
      
      if (this.playerState.bookKnowledge.includes('ancient_tome')) {
        // Cosmic knowledge helps
        canSolve = canSolve || solution.toLowerCase().includes('cosmic') ||
                   solution.toLowerCase().includes('reality');
        specialMethod = 'cosmic knowledge';
      }
    } else if (puzzleId === 'basement_ritual') {
      // Ritual puzzle requires specific book knowledge
      canSolve = this.playerState.bookKnowledge.includes('ancient_tome') &&
                 this.playerState.bookKnowledge.includes('lovecraft') &&
                 (solution.toLowerCase().includes('ritual') ||
                  solution.toLowerCase().includes('perform'));
      specialMethod = 'cosmic ritual knowledge';
    }

    if (canSolve) {
      puzzle.isSolved = true;
      this.playerState.solvedPuzzles.push(puzzleId);
      this.playerState.storyProgress += 2;
      
      // Dynamic consequences based on how you solved it
      let consequence = '';
      if (specialMethod) {
        consequence = `You solved the puzzle using ${specialMethod}! `;
      }
      
      if (puzzleId === 'foyer_portrait') {
        this.rooms['library'].isUnlocked = true;
        this.playerState.fearLevel = Math.min(10, this.playerState.fearLevel + 2);
        
        return this.createResponse(
          `${consequence}The portrait frame glows with intense purple light! A hidden passage opens, revealing the library beyond. The manor's secrets are now accessible, but your fear increases as you realize the true scope of what you're facing.`,
          room,
          ['enter library', 'examine the passage', 'search for more clues', 'prepare yourself']
        );
      } else if (puzzleId === 'library_books') {
        this.rooms['study'].isUnlocked = true;
        
        return this.createResponse(
          `${consequence}The books stop whispering and fall silent. A hidden door in the library wall slides open, revealing the study beyond. The temporal anomalies await you.`,
          room,
          ['enter study', 'examine the books', 'search for more clues', 'prepare for time distortion']
        );
      } else if (puzzleId === 'study_clock') {
        this.rooms['basement'].isUnlocked = true;
        
        return this.createResponse(
          `${consequence}The clock stops ticking backwards. Time returns to normal, and a trapdoor opens in the floor, revealing stairs to the basement. The ancient entity awaits below.`,
          room,
          ['enter basement', 'examine the clock', 'search for more clues', 'prepare for cosmic horror']
        );
      } else if (puzzleId === 'basement_ritual') {
        // Ultimate ending unlocked
        return this.createResponse(
          `${consequence}The ritual is complete! Reality itself bends as you achieve cosmic dominion. The manor's true purpose is revealed, and you must choose your fate: become one with the manor, escape to another dimension, or challenge the Old Ones themselves.`,
          room,
          ['become one with manor', 'escape to dimension', 'challenge Old Ones', 'complete the game']
        );
      }
      
      return this.createResponse(
        `${consequence}Success! The puzzle is solved and new paths open before you.`,
        room,
        ['explore the room', 'examine the solution', 'look for new paths']
      );
    } else {
      puzzle.attempts++;
      if (puzzle.attempts >= puzzle.maxAttempts) {
        return this.createResponse(
          `Your attempts to solve the puzzle anger something in the room. The air grows colder, and you hear distant whispers growing louder. The mansion is becoming more hostile.`,
          room,
          ['try a different approach', 'examine the clues again', 'ask for help', 'step back and think']
        );
      }
      return this.createResponse(
        `That doesn't seem quite right. The puzzle remains unsolved, and you feel like you're being watched.`,
        room,
        ['try again', 'examine the clues', 'look for more hints', 'use your abilities']
      );
    }
  }

  async interactWithNPC(npcId: string, action: string): Promise<GameResponse> {
    const room = this.currentRoom;
    const npc = room.npcs.find(n => n.id === npcId);
    
    if (!npc) {
      return this.createResponse(
        'There\'s no one here to interact with.',
        room,
        ['explore the room', 'examine objects', 'look for exits']
      );
    }

    // Handle different NPC interactions
    if (action.toLowerCase().includes('greet')) {
      const response = npc.dialogue.greet[Math.floor(Math.random() * npc.dialogue.greet.length)];
      return this.createResponse(
        `${npc.name}: "${response}"`,
        room,
        ['ask about history', 'ask for help', 'ask about the manor']
      );
    }

    return this.createResponse(
      `${npc.name} watches you silently, his form flickering in the dim light.`,
      room,
      ['greet the npc', 'ask a question', 'examine the room']
    );
  }

  async examineItem(itemId: string): Promise<GameResponse> {
    const room = this.currentRoom;
    const item = room.items.find(i => i.id === itemId);
    
    if (!item) {
      return this.createResponse(
        'You don\'t see that item here.',
        room,
        ['examine the room', 'look for items', 'search for clues']
      );
    }

    return this.createResponse(
      `You examine the ${item.name} closely. ${item.description} ${item.effects.join(', ')}`,
      room,
      ['take the item', 'use the item', 'examine further']
    );
  }

  async useItem(itemId: string, target: string): Promise<GameResponse> {
    const room = this.currentRoom;
    const item = this.playerState.inventory.find(id => id === itemId);
    
    if (!item) {
      return this.createResponse(
        'You don\'t have that item.',
        room,
        ['check inventory', 'search for items', 'examine the room']
      );
    }

    // Handle specific item uses
    if (itemId === 'foyer_key' && target.toLowerCase().includes('library')) {
      this.rooms['library'].isUnlocked = true;
      return this.createResponse(
        'You use the ornate key on the library door. It clicks open with a sound that echoes through the mansion.',
        room,
        ['enter library', 'examine the door', 'return to foyer']
      );
    }

    return this.createResponse(
      `You're not sure how to use the ${itemId} on that.`,
      room,
      ['examine the item', 'look for other uses', 'ask for help']
    );
  }

  getGameState(): GameResponse {
    return this.createResponse(
      `You are in the ${this.currentRoom.name}.`,
      this.currentRoom,
      ['explore the room', 'examine objects', 'look for exits', 'check inventory']
    );
  }

  private createResponse(
    narrative: string,
    room: ManorRoom,
    actions: string[]
  ): GameResponse {
    // Add horror events if any occurred
    let fullNarrative = narrative;
    if (this.horrorEvents.length > 0) {
      fullNarrative += `\n\n${this.horrorEvents[this.horrorEvents.length - 1]}`;
      this.horrorEvents = []; // Clear after showing
    }

    return {
      narrative: fullNarrative,
      roomDescription: room.description,
      availableActions: actions,
      puzzles: room.puzzles.filter(p => !p.isSolved),
      items: room.items.filter(i => !i.isHidden),
      npcs: room.npcs,
      atmosphere: room.atmosphere,
      ambientSounds: room.ambientSounds,
      visualEffects: room.visualEffects,
      fearLevel: this.playerState.fearLevel,
      sanity: this.playerState.sanity,
      isGameOver: this.playerState.sanity <= 0 || this.playerState.health <= 0,
      ending: this.playerState.sanity <= 0 ? 'You have gone mad from the horrors of Blackwood Manor.' : undefined
    };
  }
}

// Export the manor engine
export const createManorEngine = (): MysteryManorEngine => {
  return new MysteryManorEngine();
};
