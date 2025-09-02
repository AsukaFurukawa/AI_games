import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Users, 
  Star, 
  Play, 
  Lock, 
  Crown, 
  Sword, 
  Ghost, 
  Brain, 
  Zap,
  TrendingUp,
  Search
} from 'lucide-react';
import { localDungeonMaster, GameChoice } from '../services/localDungeonMaster';
import { createStoryEngine, StoryChoice, StoryResponse } from '../services/aiStoryEngine';

interface GameRoom {
  id: string;
  name: string;
  description: string;
  type: 'story' | 'puzzle' | 'rpg' | 'mystery' | 'adventure';
  players: number;
  maxPlayers: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isPremium: boolean;
  isActive: boolean;
  tags: string[];
  icon: React.ReactNode;
  color: string;
  gameData?: any;
  isPlaying?: boolean;
}

interface GameSession {
  id: string;
  roomId: string;
  isActive: boolean;
  currentTurn: string;
  players: string[];
  messages: GameMessage[];
  gameState: any;
  gameType: string;
}

interface GameMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  playerName?: string;
  timestamp: Date;
}

const GameRooms: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameInput, setGameInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [currentChoices, setCurrentChoices] = useState<StoryChoice[]>([]);
  const [storyEngine, setStoryEngine] = useState<any>(null);
  const [isAIEnabled, setIsAIEnabled] = useState(false);

  const gameRooms: GameRoom[] = [
    {
      id: '1',
      name: 'Story Forge',
      description: 'Collaborative AI storytelling where every player contributes to an epic narrative. Create worlds, characters, and adventures together!',
      type: 'story',
      players: 3,
      maxPlayers: 6,
      difficulty: 'easy',
      isPremium: false,
      isActive: true,
      tags: ['Collaborative', 'Creative', 'AI-Driven'],
      icon: <Zap className="w-6 h-6" />,
      color: 'from-neon-blue to-cyan-400',
      gameData: {
        storyTitle: 'The Beginning of an Adventure',
        currentChapter: 1,
        storyElements: ['Once upon a time...'],
        characters: [],
        world: 'A mysterious realm'
      }
    },
    {
      id: '2',
      name: 'Mystery Manor',
      description: 'Solve AI-generated detective mysteries in a haunted mansion. Work together to uncover secrets and catch the culprit!',
      type: 'mystery',
      players: 5,
      maxPlayers: 8,
      difficulty: 'medium',
      isPremium: false,
      isActive: true,
      tags: ['Detective', 'Horror', 'Puzzle'],
      icon: <Ghost className="w-6 h-6" />,
      color: 'from-neon-purple to-pink-400',
      gameData: {
        caseTitle: 'The Disappearing Artifact',
        clues: ['A broken window', 'Footprints in the garden'],
        suspects: ['The Butler', 'The Gardener', 'The Chef'],
        evidence: [],
        solved: false
      }
    },
    {
      id: '3',
      name: 'Fantasy Quest',
      description: 'Epic RPG adventure with AI dungeon master. Battle monsters, level up, and explore magical realms with your party!',
      type: 'rpg',
      players: 4,
      maxPlayers: 5,
      difficulty: 'hard',
      isPremium: true,
      isActive: true,
      tags: ['RPG', 'Fantasy', 'Combat'],
      icon: <Sword className="w-6 h-6" />,
      color: 'from-neon-green to-emerald-400',
      gameData: {
        world: 'Mysticara',
        currentLocation: 'The Whispering Tavern',
        characters: [],
        quests: ['Find the missing merchant', 'Ancient Artifacts', 'The Breaking Seal'],
        inventory: []
      }
    },
    {
      id: '4',
      name: 'Brain Teaser',
      description: 'AI-powered puzzle challenges that test your logic and creativity. Race against time and compete with friends!',
      type: 'puzzle',
      players: 2,
      maxPlayers: 4,
      difficulty: 'medium',
      isPremium: false,
      isActive: true,
      tags: ['Logic', 'Puzzle', 'Competitive'],
      icon: <Brain className="w-6 h-6" />,
      color: 'from-neon-pink to-rose-400',
      gameData: {
        currentPuzzle: 'The Riddle of the Sphinx',
        difficulty: 'medium',
        hints: [],
        solved: false
      }
    },
    {
      id: '5',
      name: 'Time Travel Tales',
      description: 'Navigate through historical events and alternate timelines. Your choices reshape history in this AI-driven adventure!',
      type: 'adventure',
      players: 6,
      maxPlayers: 8,
      difficulty: 'hard',
      isPremium: true,
      isActive: false,
      tags: ['History', 'Time Travel', 'Choice-Based'],
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-400 to-orange-400',
      gameData: {
        currentEra: 'Ancient Egypt',
        timeline: '3000 BC',
        choices: [],
        consequences: []
      }
    },
    {
      id: '6',
      name: 'Cyberpunk Heist',
      description: 'Plan and execute the ultimate heist in a neon-lit future city. Stealth, strategy, and AI-generated challenges await!',
      type: 'adventure',
      players: 4,
      maxPlayers: 6,
      difficulty: 'hard',
      isPremium: true,
      isActive: true,
      tags: ['Cyberpunk', 'Heist', 'Strategy'],
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-cyan-400 to-blue-400',
      gameData: {
        city: 'Neo-Tokyo 2077',
        target: 'The Central Bank',
        crew: [],
        plan: 'Phase 1: Infiltration'
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Games', color: 'from-neon-blue to-neon-purple' },
    { id: 'story', name: 'Story Games', color: 'from-neon-blue to-cyan-400' },
    { id: 'puzzle', name: 'Puzzles', color: 'from-neon-pink to-rose-400' },
    { id: 'rpg', name: 'RPGs', color: 'from-neon-green to-emerald-400' },
    { id: 'mystery', name: 'Mystery', color: 'from-neon-purple to-pink-400' },
    { id: 'adventure', name: 'Adventure', color: 'from-yellow-400 to-orange-400' }
  ];

  const filteredRooms = gameRooms.filter(room => {
    const matchesCategory = selectedCategory === 'all' || room.type === selectedCategory;
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-neon-green';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-neon-pink';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const joinGame = (room: GameRoom) => {
    setSelectedRoom(room);
    setShowPlayerModal(true);
  };

  const startGame = async () => {
    if (!playerName.trim() || !selectedRoom) return;

    setIsLoading(true);
    
    try {
      // Special handling for Mystery Manor
      if (selectedRoom.type === 'mystery' && selectedRoom.name === 'Mystery Manor') {
        // Open Mystery Manor in a new tab with player name
        const manorUrl = `${window.location.origin}?game=mystery-manor&player=${encodeURIComponent(playerName)}`;
        window.open(manorUrl, '_blank');
        
        // Close modal and reset
        setShowPlayerModal(false);
        setPlayerName('');
        setSelectedRoom(null);
        setIsLoading(false);
        return;
      }

      // Special handling for Brain Teaser
      if (selectedRoom.type === 'puzzle' && selectedRoom.name === 'Brain Teaser') {
        // Open Brain Teaser in a new tab
        const brainTeaserUrl = `${window.location.origin}/brain-teaser`;
        window.open(brainTeaserUrl, '_blank');
        
        // Close modal and reset
        setShowPlayerModal(false);
        setPlayerName('');
        setSelectedRoom(null);
        setIsLoading(false);
        return;
      }

      // Initialize AI Story Engine for RPG games
      if (selectedRoom.type === 'rpg') {
        const groqApiKey = (import.meta as any).env?.VITE_GROQ_API_KEY;
        if (groqApiKey) {
          const engine = createStoryEngine(groqApiKey);
          setStoryEngine(engine);
          setIsAIEnabled(true);
          
          // Generate initial story and choices
          engine.generateStory("arrive at tavern").then(storyResponse => {
            setCurrentChoices(storyResponse.choices);
            setShowChoices(true);
          }).catch(error => {
            console.error('Error generating initial story:', error);
            // Use fallback choices
            setCurrentChoices(engine.generateFallbackChoices());
            setShowChoices(true);
          });
        }
      }
      
      // Create new game session
      const newSession: GameSession = {
        id: `session_${Date.now()}`,
        roomId: selectedRoom.id,
        isActive: true,
        currentTurn: playerName,
        players: [playerName, ...Array.from({ length: selectedRoom.players - 1 }, (_, i) => `Player ${i + 1}`)],
        messages: [{
          id: '1',
          text: `Welcome to ${selectedRoom.name}! ${getGameInstructions(selectedRoom.type)}`,
          sender: 'system',
          timestamp: new Date()
        }],
        gameState: selectedRoom.gameData || {},
        gameType: selectedRoom.type
      };

      setCurrentSession(newSession);
      setShowPlayerModal(false);
      
      // Add AI welcome message
      setTimeout(() => {
        if (selectedRoom.type === 'rpg' && storyEngine) {
          addAIMessage(`Welcome to ${selectedRoom.name}! You find yourself in The Whispering Tavern, a cozy inn filled with the warm glow of candlelight and the murmur of travelers sharing tales. The atmosphere is mysterious and slightly magical.\n\nWhat would you like to do?`);
        } else {
          addAIMessage(getAIWelcomeMessage(selectedRoom.type, selectedRoom.name));
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to start game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGameInstructions = (gameType: string) => {
    switch (gameType) {
      case 'story':
        return 'Each player takes turns adding to the story. Be creative and build upon what others have written!';
      case 'mystery':
        return 'Work together to solve the mystery. Ask questions, share clues, and identify the culprit!';
      case 'rpg':
        return 'Role-play your character in this fantasy world. The AI will guide your adventure with choice-based gameplay!';
      case 'puzzle':
        return 'Challenge your mind with unique AI-generated brain teasers, riddles, and logic puzzles!';
      case 'adventure':
        return 'Make choices that shape your journey. Every decision has consequences!';
      default:
        return 'Have fun and be creative!';
    }
  };

  const getAIWelcomeMessage = (gameType: string, roomName: string) => {
    const messages = {
      story: `Welcome to ${roomName}! I'm your AI storyteller, ready to weave tales of wonder and adventure. Let's begin our collaborative journey - what's the first chapter of our story?`,
      mystery: `Greetings, detectives! I'm your AI mystery guide in ${roomName}. A case awaits our investigation. Let's examine the evidence and uncover the truth together. What would you like to investigate first?`,
      rpg: `Welcome, brave adventurers, to ${roomName}! I am your AI dungeon master, ready to guide you through realms of fantasy and danger. Your quest begins now - what would you like to do?`,
      puzzle: `Hello, puzzle masters! Welcome to ${roomName}. I'm your AI puzzle guide, here to challenge your minds and test your logic. Are you ready to solve some brain teasers?`,
      adventure: `Adventure awaits in ${roomName}! I'm your AI adventure guide, ready to take you on a journey through time and space. Your choices will shape the story - what path will you choose?`
    };
    return messages[gameType as keyof typeof messages] || messages.story;
  };

  const handleChoiceSelection = async (choice: StoryChoice) => {
    if (!currentSession || currentSession.gameType !== 'rpg' || !storyEngine) return;

    // Add user choice message
    const userMessage: GameMessage = {
      id: Date.now().toString(),
      text: choice.text,
      sender: 'user',
      playerName: playerName,
      timestamp: new Date()
    };

    setCurrentSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null);

    setIsTyping(true);

    try {
      // Process the choice through the AI Story Engine
      storyEngine.processUserAction(choice.text);
      
      // Generate new story based on the choice
      storyEngine.generateStory(choice.text).then(storyResponse => {
        // Add AI narrative response
        const aiMessage: GameMessage = {
          id: (Date.now() + 1).toString(),
          text: storyResponse.narrative,
          sender: 'ai',
          timestamp: new Date()
        };

        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, aiMessage]
        } : null);
        
        // Update choices for next action
        setCurrentChoices(storyResponse.choices);
        
        // Add atmosphere and effects info
        if (storyResponse.soundEffects.length > 0 || storyResponse.visualEffects.length > 0) {
          const effectsText = `🎵 ${storyResponse.music}\n✨ ${storyResponse.soundEffects.join(', ')}\n🎨 ${storyResponse.visualEffects.join(', ')}`;
          const effectsMessage: GameMessage = {
            id: (Date.now() + 2).toString(),
            text: effectsText,
            sender: 'system',
            timestamp: new Date()
          };
          
          setCurrentSession(prev => prev ? {
            ...prev,
            messages: [...prev.messages, effectsMessage]
          } : null);
        }
      }).catch(error => {
        console.error('Error generating story:', error);
        const errorMessage: GameMessage = {
          id: Date.now().toString(),
          text: 'Something went wrong with your choice. Please try again.',
          sender: 'system',
          timestamp: new Date()
        };
        
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, errorMessage]
        } : null);
      });
      
    } catch (error) {
      console.error('Error handling choice:', error);
      const errorMessage: GameMessage = {
        id: Date.now().toString(),
        text: 'Something went wrong with your choice. Please try again.',
        sender: 'system',
        timestamp: new Date()
      };
      
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage]
      } : null);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!gameInput.trim() || !currentSession) return;

    const userMessage: GameMessage = {
      id: Date.now().toString(),
      text: gameInput,
      sender: 'user',
      playerName: playerName,
      timestamp: new Date()
    };

    setCurrentSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null);

    setGameInput('');
    setIsTyping(true);

    // For RPG games, use the dungeon master for custom actions
    if (currentSession.gameType === 'rpg') {
      setTimeout(() => {
        // Handle custom text input for RPG games
        let response = "You attempt to perform that action. The world responds to your creativity.";
        
        // Check if input contains movement keywords
        if (gameInput.toLowerCase().includes('go to') || gameInput.toLowerCase().includes('move to') || gameInput.toLowerCase().includes('travel to')) {
          const locationMatch = gameInput.toLowerCase().match(/(?:go to|move to|travel to)\s+(\w+)/);
          if (locationMatch) {
            const location = locationMatch[1];
            response = localDungeonMaster.changeLocation(location);
          }
        } else if (gameInput.toLowerCase().includes('use') || gameInput.toLowerCase().includes('drink') || gameInput.toLowerCase().includes('eat')) {
          if (gameInput.toLowerCase().includes('healing') || gameInput.toLowerCase().includes('potion')) {
            response = localDungeonMaster.handleChoice('use_healing_potion');
          } else {
            response = "You attempt to use that item. Make sure it's in your inventory first.";
          }
        } else if (gameInput.toLowerCase().includes('talk to') || gameInput.toLowerCase().includes('speak to')) {
          response = "You attempt to communicate with the person. Try using the choice buttons for specific NPC interactions.";
        } else {
          response = "You perform that action. The world around you responds to your choices. Use the choice buttons for more specific actions.";
        }
        
        const aiMessage: GameMessage = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'ai',
          timestamp: new Date()
        };

        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, aiMessage]
        } : null);
        
        setIsTyping(false);
        
        // Generate new choices using AI Story Engine if available
        if (storyEngine && currentSession.gameType === 'rpg') {
          try {
            // Use Promise.then() instead of await to avoid async/await issues
            storyEngine.generateStory(gameInput).then(storyResponse => {
              setCurrentChoices(storyResponse.choices);
              setShowChoices(true);
            }).catch(error => {
              console.error('Error generating story:', error);
              // Fallback to local dungeon master
              const fallbackChoices = localDungeonMaster.generateChoices();
              setCurrentChoices(fallbackChoices as any);
              setShowChoices(true);
            });
          } catch (error) {
            console.error('Error with story engine:', error);
            // Fallback to local dungeon master
            const fallbackChoices = localDungeonMaster.generateChoices();
            setCurrentChoices(fallbackChoices as any);
            setShowChoices(true);
          }
        } else {
          // Fallback for non-RPG games
          const fallbackChoices = localDungeonMaster.generateChoices();
          setCurrentChoices(fallbackChoices as any);
          setShowChoices(true);
        }
      }, 1000 + Math.random() * 1000);
    } else {
      // For non-RPG games, use fallback responses
      setTimeout(() => {
        const aiResponse = getFallbackResponse(gameInput, currentSession.gameType);
        
        const aiMessage: GameMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };

        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, aiMessage]
        } : null);
        
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);
    }
  };

  const getFallbackResponse = (userInput: string, gameType: string): string => {
    const responses = {
      story: [
        `"${userInput}"... That's a fascinating turn of events! The story continues as this new element adds depth to our narrative. What happens next in this unfolding tale?`,
        `Brilliant addition! "${userInput}" creates an unexpected twist that changes everything. The world you're building is becoming more complex and intriguing.`,
        `Excellent storytelling! "${userInput}" adds a whole new layer to our story. The plot thickens, and the characters must now face this new challenge.`
      ],
      mystery: [
        `Interesting observation! "${userInput}" could be a crucial clue. This might connect to evidence we found earlier. What other details should we examine?`,
        `Hmm, "${userInput}"... This could change our theory about the case. We need to look at this from a different angle. Any other thoughts?`,
        `Good thinking! "${userInput}" opens up new possibilities. This could be the missing piece we've been looking for.`
      ],
      rpg: [
        `"${userInput}" - A bold choice! Your character's actions have consequences in this world. The environment responds to your decisions. What's your next move, adventurer?`,
        `Adventure awaits! "${userInput}" sets you on a path that could lead to great rewards or dangerous challenges. Where will your journey take you next?`,
        `Your character's decision to "${userInput}" shows true courage! The fantasy realm responds to your choices, and new opportunities emerge.`
      ],
      puzzle: [
        `"${userInput}" - That's an interesting approach! This could be part of the solution, but we might need to consider it from another perspective.`,
        `Hmm, "${userInput}"... You're on the right track! This is definitely related to the puzzle, but there's a twist we haven't uncovered yet.`,
        `Excellent reasoning! "${userInput}" brings us closer to solving this. The pieces are starting to fit together.`
      ],
      adventure: [
        `"${userInput}" - An intriguing choice! This decision will ripple through time and space, creating new possibilities. What consequences do you foresee?`,
        `Fascinating! "${userInput}" opens up a new timeline. The universe responds to your choice, revealing hidden paths. Where will this lead us?`,
        `Your choice of "${userInput}" has altered the course of history! New realities emerge from your decision. What's the next step in this adventure?`
      ]
    };

    const gameResponses = responses[gameType as keyof typeof responses] || responses.story;
    return gameResponses[Math.floor(Math.random() * gameResponses.length)];
  };

  const addAIMessage = (text: string) => {
    const aiMessage: GameMessage = {
      id: (Date.now() + 1).toString(),
      text: text,
      sender: 'ai',
      timestamp: new Date()
    };

    setCurrentSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, aiMessage]
    } : null);
  };

  const leaveGame = () => {
    setCurrentSession(null);
    setSelectedRoom(null);
    setPlayerName('');
    setCurrentChoices([]);
    setShowChoices(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (currentSession) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Game Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="kruti-card mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-r ${selectedRoom?.color} rounded-lg flex items-center justify-center text-white`}>
                {selectedRoom?.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{selectedRoom?.name}</h2>
                <p className="text-gray-600 text-sm">
                  {currentSession.players.length} players • {selectedRoom?.type.toUpperCase()} Game
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={leaveGame}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300"
              >
                Leave Game
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Game Info Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="kruti-card mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Players</h3>
              <div className="space-y-1">
                {currentSession.players.map((player, index) => (
                  <div key={index} className="flex items-center justify-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      player === currentSession.currentTurn ? 'bg-neon-green' : 'bg-gray-500'
                    }`} />
                    <span className={`text-sm ${
                      player === currentSession.currentTurn ? 'text-neon-green font-medium' : 'text-gray-400'
                    }`}>
                      {player}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Game Status</h3>
              <div className="text-neon-green text-sm font-medium">
                ● Active
              </div>
              <div className="text-gray-400 text-xs mt-1">
                Turn: {currentSession.currentTurn}
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Game Type</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                selectedRoom?.type === 'story' ? 'bg-blue-600 text-blue-100' :
                selectedRoom?.type === 'mystery' ? 'bg-purple-600 text-purple-100' :
                selectedRoom?.type === 'rpg' ? 'bg-green-600 text-green-100' :
                selectedRoom?.type === 'puzzle' ? 'bg-pink-600 text-pink-100' :
                'bg-yellow-600 text-yellow-100'
              }`}>
                {selectedRoom?.type.toUpperCase()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Choice Buttons for RPG Games */}
        {currentSession.gameType === 'rpg' && showChoices && currentChoices.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="kruti-card mb-6"
          >
            <h4 className="text-lg font-semibold text-green-600 mb-3">🎮 Choose Your Action:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentChoices.map((choice) => (
                <motion.button
                  key={choice.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoiceSelection(choice)}
                  className="kruti-card p-3 text-center hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-2xl mb-2">{choice.icon}</div>
                  <div className="text-sm font-medium">{choice.text}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Game Chat */}
        <div className="kruti-card h-96 overflow-y-auto mb-6">
          <AnimatePresence>
            {currentSession.messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-neon-pink to-neon-purple' 
                      : message.sender === 'ai'
                      ? 'bg-gradient-to-r from-neon-blue to-neon-green'
                      : 'bg-gradient-to-r from-yellow-400 to-orange-400'
                  }`}>
                    {message.sender === 'user' ? (
                      <Users className="w-4 h-4" />
                    ) : message.sender === 'ai' ? (
                      <Brain className="w-4 h-4" />
                    ) : (
                      <Crown className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`px-4 py-2 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                      : message.sender === 'ai'
                      ? 'bg-card-bg border border-gray-600 text-gray-100'
                      : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-200'
                  }`}>
                    {message.sender === 'user' && (
                      <div className="text-xs text-pink-200 mb-1">{message.playerName}</div>
                    )}
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-pink-200' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-start mb-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-neon-blue to-neon-green rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-2 bg-card-bg border border-gray-600 rounded-2xl">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-neon-blue rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-neon-blue rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-neon-blue rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Game Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="kruti-card"
        >
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={gameInput}
                onChange={(e) => setGameInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={currentSession.gameType === 'rpg' 
                  ? "Type your own action or use the choice buttons above... (Press Enter to send)"
                  : `What would you like to do in ${selectedRoom?.name}? (Press Enter to send)`
                }
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 resize-none"
                rows={3}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!gameInput.trim()}
              className="kruti-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Users className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Game Rooms</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Join epic multiplayer adventures with AI companions. Create stories, solve mysteries, 
          and embark on quests with players from around the world!
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="kruti-card mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search games, tags, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Game Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="kruti-card group hover:shadow-lg transition-all duration-500"
            >
              {/* Room Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${room.color} rounded-lg flex items-center justify-center text-white`}>
                  {room.icon}
                </div>
                <div className="flex items-center space-x-2">
                  {room.isPremium && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-1 rounded">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {!room.isActive && (
                    <div className="bg-gray-600 p-1 rounded">
                      <Lock className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>

              {/* Room Info */}
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-all duration-300">
                {room.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                {room.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {room.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full border border-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Room Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {room.players}/{room.maxPlayers}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm font-medium ${getDifficultyColor(room.difficulty)}`}>
                      {getDifficultyIcon(room.difficulty)} {room.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!room.isActive}
                onClick={() => joinGame(room)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                  room.isActive
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-lg hover:shadow-neon-blue/30'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4" />
                <span>{room.isActive ? 'Join Room' : 'Coming Soon'}</span>
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredRooms.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Gamepad2 className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-cyber text-gray-300 mb-2">No games found</h3>
          <p className="text-gray-500">Try adjusting your search or category filters.</p>
        </motion.div>
      )}

      {/* Player Name Modal */}
      <AnimatePresence>
        {showPlayerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="kruti-card max-w-md w-full"
            >
                              <h3 className="text-xl font-semibold text-gray-800 mb-4">Join {selectedRoom?.name}</h3>
                              <p className="text-gray-600 text-sm mb-6">
                  Enter your player name to join this exciting game session!
                </p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter your player name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/30"
                  onKeyPress={(e) => e.key === 'Enter' && startGame()}
                />
                
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPlayerModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    disabled={!playerName.trim() || isLoading}
                    className="flex-1 cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Starting...' : 'Start Game'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
};

export default GameRooms;
