// Book Vector Service - Creates dynamic, varied content from horror/mystery books
interface BookContent {
  title: string;
  themes: string[];
  atmosphere: string[];
  characters: string[];
  locations: string[];
  objects: string[];
  events: string[];
  endings: string[];
}

class BookVectorService {
  private books: BookContent[] = [
    {
      title: "The Haunting of Hill House",
      themes: ["psychological horror", "isolation", "family secrets", "supernatural presence"],
      atmosphere: ["creepy", "ominous", "eerie", "foreboding", "unsettling"],
      characters: ["ghostly figures", "mysterious caretaker", "whispering voices", "shadowy presence", "lost souls"],
      locations: ["haunted mansion", "dark corridors", "dusty library", "abandoned nursery", "creaking stairs", "hidden passages"],
      objects: ["old portraits", "dusty books", "broken mirrors", "faded letters", "ancient keys", "candlesticks"],
      events: ["strange noises", "doors slamming", "cold drafts", "flickering lights", "whispers in the dark"],
      endings: ["escape with sanity intact", "discover the truth", "become trapped forever", "solve the mystery"]
    },
    {
      title: "The Fall of the House of Usher",
      themes: ["decay", "madness", "family curse", "gothic horror"],
      atmosphere: ["melancholic", "decaying", "oppressive", "gloomy", "sinister"],
      characters: ["mad aristocrat", "pale sister", "family physician", "ancient servants"],
      locations: ["crumbling mansion", "dark study", "family crypt", "overgrown gardens", "tarnished halls"],
      objects: ["family portraits", "ancient tomes", "tarnished silver", "dusty curtains", "broken furniture"],
      events: ["house collapsing", "sister's return", "madness spreading", "curse manifesting"],
      endings: ["house collapses with you inside", "escape the curse", "break the family curse", "succumb to madness"]
    },
    {
      title: "The Tell-Tale Heart",
      themes: ["guilt", "paranoia", "madness", "confession"],
      atmosphere: ["tense", "paranoid", "unsettling", "claustrophobic"],
      characters: ["narrator", "old man", "police officers", "neighbors"],
      locations: ["small room", "dark house", "police station", "neighborhood"],
      objects: ["beating heart", "old man's eye", "bed", "lantern", "floorboards"],
      events: ["stalking", "murder", "hiding body", "police investigation", "confession"],
      endings: ["confess to murder", "get away with it", "go completely mad", "be caught by police"]
    },
    {
      title: "The Shining",
      themes: ["isolation", "supernatural", "family breakdown", "hotel haunting"],
      atmosphere: ["isolated", "supernatural", "menacing", "claustrophobic"],
      characters: ["hotel ghosts", "family members", "mysterious guests", "hotel staff"],
      locations: ["overlook hotel", "room 237", "maze", "ballroom", "kitchen"],
      objects: ["typewriter", "hotel keys", "ghostly figures", "blood", "hotel records"],
      events: ["supernatural encounters", "family tension", "hotel coming alive", "maze chase"],
      endings: ["escape the hotel", "succumb to the hotel", "save your family", "become the caretaker"]
    },
    {
      title: "The Dunwich Horror",
      themes: ["cosmic horror", "ancient evil", "family secrets", "otherworldly"],
      atmosphere: ["otherworldly", "ancient", "corrupting", "alien"],
      characters: ["eldritch beings", "corrupted family", "mysterious scholars", "ancient entities"],
      locations: ["Dunwich", "ancient ruins", "family farm", "forbidden places"],
      objects: ["ancient texts", "strange artifacts", "corrupted items", "otherworldly objects"],
      events: ["cosmic horror", "family corruption", "ancient awakening", "reality breaking"],
      endings: ["prevent the horror", "succumb to corruption", "escape with knowledge", "become part of the horror"]
    }
  ];

  // Generate dynamic story content based on current state
  generateStoryContent(currentRoom: string, fearLevel: number, visitedRooms: string[], actionCount: number): {
    description: string;
    atmosphere: string;
    availableActions: string[];
    consequences: string[];
  } {
    const book = this.books[Math.floor(Math.random() * this.books.length)];
    const isHighFear = fearLevel >= 7;
    const isExperienced = actionCount >= 10;
    
    // Generate room description based on book themes
    const roomDescription = this.generateRoomDescription(book, currentRoom, fearLevel);
    const atmosphere = this.generateAtmosphere(book, fearLevel);
    const availableActions = this.generateActions(book, currentRoom, fearLevel, visitedRooms, isHighFear, isExperienced);
    const consequences = this.generateConsequences(book, fearLevel);

    return {
      description: roomDescription,
      atmosphere,
      availableActions,
      consequences
    };
  }

  private generateRoomDescription(book: BookContent, currentRoom: string, fearLevel: number): string {
    const location = book.locations[Math.floor(Math.random() * book.locations.length)];
    const object = book.objects[Math.floor(Math.random() * book.objects.length)];
    const atmosphere = book.atmosphere[Math.floor(Math.random() * book.atmosphere.length)];
    
    const fearModifier = fearLevel >= 7 ? " You feel an overwhelming sense of dread." : 
                        fearLevel >= 4 ? " Something doesn't feel right here." : "";
    
    return `You find yourself in a ${atmosphere} ${location}. ${object} catches your attention.${fearModifier}`;
  }

  private generateAtmosphere(book: BookContent, fearLevel: number): string {
    const baseAtmosphere = book.atmosphere[Math.floor(Math.random() * book.atmosphere.length)];
    const intensity = fearLevel >= 7 ? "overwhelming" : fearLevel >= 4 ? "growing" : "subtle";
    return `The ${baseAtmosphere} atmosphere is ${intensity}.`;
  }

  private generateActions(book: BookContent, currentRoom: string, fearLevel: number, visitedRooms: string[], isHighFear: boolean, isExperienced: boolean): string[] {
    const baseActions = [
      "examine the room carefully",
      "listen for any sounds",
      "look for hidden passages",
      "check for clues",
      "move to another room"
    ];

    const fearActions = isHighFear ? [
      "try to calm yourself",
      "look for an exit",
      "call out for help",
      "hide in a corner"
    ] : [];

    const experiencedActions = isExperienced ? [
      "use your knowledge of the house",
      "try a different approach",
      "look for patterns",
      "trust your instincts"
    ] : [];

    const bookSpecificActions = [
      `investigate the ${book.objects[Math.floor(Math.random() * book.objects.length)]}`,
      `search for ${book.themes[Math.floor(Math.random() * book.themes.length)]} clues`,
      `confront the ${book.characters[Math.floor(Math.random() * book.characters.length)]}`
    ];

    // Combine and randomize actions
    const allActions = [...baseActions, ...fearActions, ...experiencedActions, ...bookSpecificActions];
    return this.shuffleArray(allActions).slice(0, 4);
  }

  private generateConsequences(book: BookContent, fearLevel: number): string[] {
    const event = book.events[Math.floor(Math.random() * book.events.length)];
    const character = book.characters[Math.floor(Math.random() * book.characters.length)];
    
    return [
      `You experience ${event}.`,
      `A ${character} appears.`,
      `The atmosphere becomes more intense.`,
      `You discover something important.`
    ];
  }

  // Generate different endings based on choices and fear level
  generateEnding(fearLevel: number, choices: string[], visitedRooms: string[]): {
    title: string;
    description: string;
    outcome: string;
  } {
    const book = this.books[Math.floor(Math.random() * this.books.length)];
    const ending = book.endings[Math.floor(Math.random() * book.endings.length)];
    
    if (fearLevel >= 8) {
      return {
        title: "The Horror Consumes You",
        description: "The overwhelming fear and supernatural presence have driven you to madness. You become one with the house's dark legacy.",
        outcome: "You are now trapped forever in the mansion's endless corridors, a ghostly presence for future visitors to encounter."
      };
    } else if (fearLevel >= 5 && choices.includes("confront")) {
      return {
        title: "The Truth Revealed",
        description: "Your courage in confronting the supernatural has revealed the house's dark secrets. You understand the truth behind the haunting.",
        outcome: "You escape with knowledge of the house's history, but the experience has changed you forever."
      };
    } else if (visitedRooms.length >= 8) {
      return {
        title: "The Explorer's Fate",
        description: "Your thorough exploration of the mansion has led you to discover its hidden depths and ancient secrets.",
        outcome: "You emerge from the house with a deeper understanding of its mysteries, but some secrets are better left buried."
      };
    } else {
      return {
        title: "The Quick Escape",
        description: "You managed to escape the mansion before the supernatural forces could fully manifest, but you know you've only scratched the surface.",
        outcome: "You leave the house behind, but its mysteries will haunt your dreams for years to come."
      };
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export default new BookVectorService();
