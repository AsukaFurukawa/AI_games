import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Users, 
  Crown, 
  Play, 
  Sparkles,
  Sword,
  Ghost,
  Brain
} from 'lucide-react';

interface GameMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  playerName?: string;
  timestamp: Date;
  isTyping?: boolean;
  gameAction?: string;
}

interface GameState {
  isActive: boolean;
  currentTurn: string;
  players: string[];
  gameType: 'story' | 'mystery' | 'rpg' | 'puzzle';
  gameData: any;
  turnOrder: string[];
}

interface GameSession {
  id: string;
  name: string;
  type: 'story' | 'mystery' | 'rpg' | 'puzzle';
  players: string[];
  maxPlayers: number;
  isActive: boolean;
  createdAt: Date;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const GameEngine: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GameSession | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playerName, setPlayerName] = useState('Player');
  const [availableGames, setAvailableGames] = useState<GameSession[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample game sessions
  useEffect(() => {
    const games: GameSession[] = [
      {
        id: '1',
        name: 'Story Forge',
        type: 'story',
        players: ['Alice', 'Bob'],
        maxPlayers: 6,
        isActive: true,
        createdAt: new Date(),
        description: 'Collaborative AI storytelling where every player contributes to an epic narrative',
        icon: <Sparkles className="w-6 h-6" />,
        color: 'from-neon-blue to-cyan-400'
      },
      {
        id: '2',
        name: 'Mystery Manor',
        type: 'mystery',
        players: ['Charlie', 'Diana'],
        maxPlayers: 8,
        isActive: true,
        createdAt: new Date(),
        description: 'Solve AI-generated detective mysteries in a haunted mansion',
        icon: <Ghost className="w-6 h-6" />,
        color: 'from-neon-purple to-pink-400'
      },
      {
        id: '3',
        name: 'Fantasy Quest',
        type: 'rpg',
        players: ['Eve', 'Frank'],
        maxPlayers: 5,
        isActive: true,
        createdAt: new Date(),
        description: 'Epic RPG adventure with AI dungeon master',
        icon: <Sword className="w-6 h-6" />,
        color: 'from-neon-green to-emerald-400'
      },
      {
        id: '4',
        name: 'Brain Teaser',
        type: 'puzzle',
        players: ['Grace'],
        maxPlayers: 4,
        isActive: true,
        createdAt: new Date(),
        description: 'AI-powered puzzle challenges that test your logic',
        icon: <Brain className="w-6 h-6" />,
        color: 'from-neon-pink to-rose-400'
      }
    ];
    setAvailableGames(games);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const joinGame = (game: GameSession) => {
    setCurrentGame(game);
    
    // Initialize game state
    const newGameState: GameState = {
      isActive: true,
      currentTurn: playerName,
      players: [...game.players, playerName],
      gameType: game.type,
      gameData: getInitialGameData(game.type),
      turnOrder: [...game.players, playerName]
    };
    
    setGameState(newGameState);
    
    // Add system message
    const systemMessage: GameMessage = {
      id: Date.now().toString(),
      text: `Welcome to ${game.name}! ${getGameInstructions(game.type)}`,
      sender: 'system',
      timestamp: new Date()
    };
    
    setMessages([systemMessage]);
  };

  const getInitialGameData = (gameType: string) => {
    switch (gameType) {
      case 'story':
        return {
          storyTitle: 'The Beginning of an Adventure',
          currentChapter: 1,
          storyElements: ['Once upon a time...'],
          characters: [],
          world: 'A mysterious realm'
        };
      case 'mystery':
        return {
          caseTitle: 'The Disappearing Artifact',
          clues: ['A broken window', 'Footprints in the garden'],
          suspects: ['The Butler', 'The Gardener', 'The Chef'],
          evidence: [],
          solved: false
        };
      case 'rpg':
        return {
          world: 'Fantasy Realm',
          currentLocation: 'The Tavern',
          characters: [],
          quests: ['Find the lost amulet'],
          inventory: []
        };
      case 'puzzle':
        return {
          currentPuzzle: 'The Riddle of the Sphinx',
          difficulty: 'medium',
          hints: [],
          solved: false
        };
      default:
        return {};
    }
  };

  const getGameInstructions = (gameType: string) => {
    switch (gameType) {
      case 'story':
        return 'Each player takes turns adding to the story. Be creative and build upon what others have written!';
      case 'mystery':
        return 'Work together to solve the mystery. Ask questions, share clues, and identify the culprit!';
      case 'rpg':
        return 'Role-play your character in this fantasy world. The AI will guide your adventure!';
      case 'puzzle':
        return 'Solve the AI-generated puzzles together. Use teamwork and logic to succeed!';
      default:
        return 'Have fun and be creative!';
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentGame || !gameState) return;

    const userMessage: GameMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      playerName: playerName,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response based on game type
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText, currentGame.type);
      
      const aiMessage: GameMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      // Update game state
      updateGameState(inputText, currentGame.type);
    }, 1000 + Math.random() * 1000);
  };

  const generateAIResponse = (userInput: string, gameType: string): string => {
    const responses = {
      story: [
        `"${userInput}"... That's a fascinating turn of events! The story continues as ${userInput.toLowerCase()} leads our heroes to new discoveries. What happens next in this unfolding tale?`,
        `Brilliant addition! "${userInput}" adds a whole new layer to our narrative. The plot thickens, and the characters must now face this new challenge. How will they respond?`,
        `Excellent storytelling! "${userInput}" creates an unexpected twist that changes everything. The world you're building is becoming more complex and intriguing. What's the next chapter?`
      ],
      mystery: [
        `Interesting observation! "${userInput}" could be a crucial clue. Let me analyze this... This might connect to the broken window we found earlier. What other evidence should we examine?`,
        `Hmm, "${userInput}"... This could change our theory about the suspect. The timing doesn't quite add up. We need to look at this from a different angle. Any other thoughts?`,
        `Good thinking! "${userInput}" opens up new possibilities. This could be the missing piece we've been looking for. How does this fit with the other clues we've discovered?`
      ],
      rpg: [
        `"${userInput}" - A bold choice! Your character's actions have consequences in this world. The tavern patrons take notice, and whispers spread through the crowd. What's your next move, adventurer?`,
        `Adventure awaits! "${userInput}" sets you on a path that could lead to great rewards or dangerous challenges. The AI dungeon master considers your actions carefully. Roll for initiative!`,
        `Your character's decision to "${userInput}" shows true courage! The fantasy realm responds to your choices, and new opportunities emerge. Where will your journey take you next?`
      ],
      puzzle: [
        `"${userInput}" - That's an interesting approach! Let me think... This could be part of the solution, but we might need to consider it from another perspective. What else have we learned?`,
        `Hmm, "${userInput}"... You're on the right track! This is definitely related to the puzzle, but there's a twist we haven't uncovered yet. Keep thinking!`,
        `Excellent reasoning! "${userInput}" brings us closer to solving this. The pieces are starting to fit together. What's the next logical step in this sequence?`
      ]
    };

    const gameResponses = responses[gameType as keyof typeof responses] || responses.story;
    return gameResponses[Math.floor(Math.random() * gameResponses.length)];
  };

  const updateGameState = (userInput: string, gameType: string) => {
    if (!gameState) return;

    setGameState(prev => {
      if (!prev) return prev;
      
      const newState = { ...prev };
      
      switch (gameType) {
        case 'story':
          if (newState.gameData.storyElements) {
            newState.gameData.storyElements.push(userInput);
          }
          break;
        case 'mystery':
          if (newState.gameData.evidence) {
            newState.gameData.evidence.push(userInput);
          }
          break;
        case 'rpg':
          if (newState.gameData.inventory) {
            newState.gameData.inventory.push(userInput);
          }
          break;
        case 'puzzle':
          // Check if puzzle is solved
          if (userInput.toLowerCase().includes('answer') || userInput.toLowerCase().includes('solve')) {
            newState.gameData.solved = true;
          }
          break;
      }
      
      return newState;
    });
  };

  const leaveGame = () => {
    setCurrentGame(null);
    setGameState(null);
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentGame) {
    return (
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">AI Game Sessions</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Join live AI-powered gaming sessions! Experience collaborative storytelling, 
            mystery solving, RPG adventures, and brain-teasing puzzles with AI companions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="kruti-card group hover:shadow-lg transition-all duration-500 cursor-pointer"
              onClick={() => joinGame(game)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${game.color} rounded-lg flex items-center justify-center text-white`}>
                  {game.icon}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-neon-green p-1 rounded">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-all duration-300">
                {game.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {game.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{game.players.length}/{game.maxPlayers} players</span>
                </div>
                <span className="text-neon-green">● Live</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

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
            <div className={`w-12 h-12 bg-gradient-to-r ${currentGame.color} rounded-lg flex items-center justify-center text-white`}>
              {currentGame.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{currentGame.name}</h2>
              <p className="text-gray-600 text-sm">
                {currentGame.players.length} players • {currentGame.type.toUpperCase()} Game
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
              {gameState?.players.map((player, index) => (
                <div key={index} className="flex items-center justify-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    player === gameState.currentTurn ? 'bg-neon-green' : 'bg-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    player === gameState.currentTurn ? 'text-neon-green font-medium' : 'text-gray-400'
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
              Turn: {gameState?.currentTurn}
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Game Type</h3>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              currentGame.type === 'story' ? 'bg-blue-600 text-blue-100' :
              currentGame.type === 'mystery' ? 'bg-purple-600 text-purple-100' :
              currentGame.type === 'rpg' ? 'bg-green-600 text-green-100' :
              'bg-pink-600 text-pink-100'
            }`}>
              {currentGame.type.toUpperCase()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Game Chat */}
      <div className="kruti-card h-96 overflow-y-auto mb-6">
        <AnimatePresence>
          {messages.map((message, index) => (
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
                    <MessageCircle className="w-4 h-4 text-white" />
                  ) : message.sender === 'ai' ? (
                    <Brain className="w-4 h-4 text-white" />
                  ) : (
                    <Crown className="w-4 h-4 text-white" />
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
                  <p className="text-sm">{message.text}</p>
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
        <div ref={messagesEndRef} />
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
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`What would you like to do in ${currentGame.name}? (Press Enter to send)`}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 resize-none"
              rows={3}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="kruti-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameEngine;
