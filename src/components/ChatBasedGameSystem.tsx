import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Users, 
  Settings,
  Sparkles
} from 'lucide-react';

// Import AI service
import groqAIService from '../services/groqAIService';
import { createManorEngine, GameResponse } from '../services/mysteryManorEngine';
import bookVectorService from '../services/bookVectorService';
import ScribbleModal from './ScribbleModal';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  gameType?: 'mystery-manor' | 'brain-teaser' | 'tic-tac-toe' | 'hangman' | 'number-guessing' | 'rock-paper-scissors' | 'ai-story-battle' | 'scribble';
  isGameResponse?: boolean;
  gameData?: any;
  interactiveComponent?: React.ReactNode;
}

interface GameState {
  currentGame: string | null;
  gameHistory: string[];
  isInGame: boolean;
  // Mystery Manor state
  manorEngine?: any;
  manorState?: GameResponse;
  // Brain Teaser state
  currentTeaser?: any;
  teaserScore?: number;
  teaserStreak?: number;
  isGeneratingNewTeaser?: boolean;
  // Tic-Tac-Toe state
  ticTacToeBoard?: (string | null)[];
  ticTacToePlayer?: 'X' | 'O';
  ticTacToeWinner?: string | null;
  // Hangman state
  hangmanWord?: string;
  hangmanGuessed?: string[];
  hangmanWrong?: number;
  hangmanGameOver?: boolean;
  // Number Guessing state
  numberToGuess?: number;
  numberAttempts?: number;
  numberFeedback?: string;
  // AI Story Battle state
  storyBattleState?: {
    currentStory: string;
    storyContributions: Array<{
      id: string;
      player: string;
      content: string;
      timestamp: Date;
      votes: number;
      isActive: boolean;
    }>;
    currentPlayer: string;
    turnCount: number;
    powerUps: {
      plotTwist: number;
      characterDev: number;
      cliffhanger: number;
      battle: number;
    };
    gamePhase: 'building' | 'battling' | 'voting' | 'ended';
    battleQueue: Array<{
      challenger: string;
      targetId: string;
      newContent: string;
    }>;
    players: string[];
    maxPlayers: number;
  };
}

interface ChatBasedGameSystemProps {
  roomId?: string;
}

const ChatBasedGameSystem: React.FC<ChatBasedGameSystemProps> = ({ roomId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "👋 Hello! I'm your AI Game Assistant! I can help you play games, solve puzzles, and have fun conversations. What would you like to do today?",
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'system',
      content: "🎮 **Available Games:**\n• **Mystery Manor** - Solve mysteries in a haunted mansion\n• **Brain Teaser** - Challenge your mind with puzzles\n• **AI Story Battle** - Revolutionary multiplayer story-building game!\n• **Classic Games** - Tic-tac-toe, hangman, number guessing, rock paper scissors\n\nJust ask me to play any game!",
      timestamp: new Date()
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [gameState, setGameState] = useState<GameState>({
    currentGame: null,
    gameHistory: [],
    isInGame: false,
         teaserScore: 0,
     teaserStreak: 0,
     isGeneratingNewTeaser: false,
    ticTacToeBoard: Array(9).fill(null),
    ticTacToePlayer: 'X',
    ticTacToeWinner: null,
    hangmanGuessed: [],
    hangmanWrong: 0,
    hangmanGameOver: false,
    numberAttempts: 0,
    numberFeedback: '',
    storyBattleState: {
      currentStory: '',
      storyContributions: [],
      currentPlayer: 'Player 1',
      turnCount: 0,
      powerUps: {
        plotTwist: 2,
        characterDev: 2,
        cliffhanger: 1,
        battle: 3
      },
      gamePhase: 'building',
      battleQueue: [],
      players: ['Player 1', 'Player 2'],
      maxPlayers: 4
    }
  });
  const [showScribbleModal, setShowScribbleModal] = useState(false);

  // Debug game state changes
  useEffect(() => {
    console.log('Game state changed:', gameState);
    currentGameRef.current = gameState.currentGame;
    gameStateRef.current = gameState;
  }, [gameState]);

  // Auto-join room if roomId is provided (auto-open Scribble modal for room links)
  useEffect(() => {
    if (roomId) {
      // Auto-open Scribble modal for room links
      setShowScribbleModal(true);
      
      const joinMessage: ChatMessage = {
        id: `join-room-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: `🎮 **Joining Room ${roomId}**\n\nWelcome to the Scribble game! You've joined an existing game room.`,
        timestamp: new Date(),
        gameType: 'scribble'
      };
      setMessages(prev => [...prev, joinMessage]);
    }
  }, [roomId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentGameRef = useRef<string | null>(null);
  const gameStateRef = useRef<GameState>(gameState);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

         const userMessage: ChatMessage = {
       id: `user-${Date.now()}-${Math.random()}`,
       type: 'user',
       content: inputValue.trim(),
       timestamp: new Date()
     };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Process the message and generate response
    await processUserMessage(userMessage.content);
  };

  const processUserMessage = async (message: string) => {
    console.log('processUserMessage called with:', message);
    console.log('currentGameRef.current:', currentGameRef.current);
    
    const lowerMessage = message.toLowerCase();

    // Game detection logic
    if (lowerMessage.includes('mystery manor') || lowerMessage.includes('mystery') || lowerMessage.includes('haunted')) {
      console.log('Starting mystery manor');
      await startGame('mystery-manor', message);
    } else if (lowerMessage.includes('brain teaser') || lowerMessage.includes('puzzle') || lowerMessage.includes('riddle')) {
      console.log('Starting brain teaser');
      await startGame('brain-teaser', message);
    } else if (lowerMessage.includes('tic tac toe') || lowerMessage.includes('tic-tac-toe') || lowerMessage.includes('tic tac tow')) {
      console.log('Starting tic tac toe');
      await startGame('tic-tac-toe', message);
    } else if (lowerMessage.includes('hangman')) {
      console.log('Starting hangman');
      await startGame('hangman', message);
    } else if (lowerMessage.includes('number guessing') || lowerMessage.includes('guess the number')) {
      console.log('Starting number guessing');
      await startGame('number-guessing', message);
    } else if (lowerMessage.includes('rock paper scissors') || lowerMessage.includes('rock-paper-scissors')) {
      console.log('Starting rock paper scissors');
      await startGame('rock-paper-scissors', message);
    } else if (lowerMessage.includes('ai story battle') || lowerMessage.includes('story battle') || lowerMessage.includes('collaborative story') || lowerMessage.includes('multiplayer story')) {
      console.log('Starting ai story battle');
      await startGame('ai-story-battle', message);
    } else if (lowerMessage.includes('play') && lowerMessage.includes('game')) {
      console.log('Showing game options');
      await showGameOptions();
    } else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      console.log('Showing help');
      await showHelp();
    } else if (currentGameRef.current) {
      console.log('Handling game action for current game:', currentGameRef.current);
      // Handle in-game actions for any active game
      await handleGameAction(message);
    } else {
      console.log('No game active, generating chat response');
      await generateChatResponse(message);
    }
  };

  const startGame = async (gameType: string, originalMessage: string) => {
    // If the same game is already active, don't restart it
    if (gameState.currentGame === gameType) {
      return;
    }
    
    console.log('Starting game:', gameType, 'Current game state:', gameState.currentGame);
    
    // Set the game state synchronously first
    setGameState(prev => ({
      ...prev,
      currentGame: gameType,
      isInGame: false, // Keep input enabled so users can type commands
      gameHistory: [...prev.gameHistory, originalMessage]
    }));

    // Initialize game-specific state
    if (gameType === 'mystery-manor') {
      try {
        const manorEngine = createManorEngine();
        const manorState = manorEngine.getGameState();
        setGameState(prev => ({
          ...prev,
          manorEngine,
          manorState
        }));
      } catch (error) {
        console.error('Error initializing Mystery Manor:', error);
        // Fallback state if manor engine fails
        setGameState(prev => ({
          ...prev,
          manorState: {
            fearLevel: 1,
            sanity: 100,
            roomDescription: "You're in the entrance hall of the mansion",
            availableActions: ["explore", "look around", "move forward", "examine"]
          }
        }));
      }
    } else if (gameType === 'brain-teaser') {
      const teaser = generateBrainTeaser();
      setGameState(prev => ({
        ...prev,
        currentTeaser: teaser
      }));
    } else if (gameType === 'hangman') {
      const words = ['REACT', 'TYPESCRIPT', 'JAVASCRIPT', 'PYTHON', 'GAMING', 'PUZZLE', 'MYSTERY', 'BRAIN'];
      const word = words[Math.floor(Math.random() * words.length)];
      setGameState(prev => ({
        ...prev,
        hangmanWord: word,
        hangmanGuessed: [],
        hangmanWrong: 0,
        hangmanGameOver: false
      }));
    } else if (gameType === 'number-guessing') {
      const number = Math.floor(Math.random() * 100) + 1;
      setGameState(prev => ({
        ...prev,
        numberToGuess: number,
        numberAttempts: 0,
        numberFeedback: ''
      }));
    } else if (gameType === 'tic-tac-toe') {
      // Only initialize if board is not already set
      setGameState(prev => ({
        ...prev,
        ticTacToeBoard: prev.ticTacToeBoard || Array(9).fill(null),
        ticTacToePlayer: prev.ticTacToePlayer || 'X',
        ticTacToeWinner: prev.ticTacToeWinner || null
      }));
    } else if (gameType === 'ai-story-battle') {
      // Initialize AI Story Battle
      setGameState(prev => ({
        ...prev,
        storyBattleState: {
          currentStory: 'Once upon a time, in a world where stories come alive...',
          storyContributions: [{
            id: 'opening-1',
            player: 'AI Story Master',
            content: 'Once upon a time, in a world where stories come alive...',
            timestamp: new Date(),
            votes: 0,
            isActive: true
          }],
          currentPlayer: 'Player 1',
          turnCount: 0,
          powerUps: {
            plotTwist: 2,
            characterDev: 2,
            cliffhanger: 1,
            battle: 3
          },
          gamePhase: 'building',
          battleQueue: [],
          players: ['Player 1', 'Player 2'],
          maxPlayers: 4
        }
      }));
    }

    const gameMessages = {
      'mystery-manor': {
        content: "🏚️ **Starting Mystery Manor!**\n\nWelcome to the haunted mansion! You'll need to solve mysteries, find clues, and uncover the truth. Are you ready to begin your investigation?",
        gameType: 'mystery-manor' as const
      },
      'brain-teaser': {
        content: "🧠 **Starting Brain Teaser!**\n\nGet ready to challenge your mind with puzzles, riddles, and logic problems!",
        gameType: 'brain-teaser' as const
      },
      'tic-tac-toe': {
        content: "⭕ **Starting Tic-Tac-Toe!**\n\nLet's play! You're X, I'm O. Click on a square to make your move!",
        gameType: 'tic-tac-toe' as const
      },
      'hangman': {
        content: "🎯 **Starting Hangman!**\n\nI'm thinking of a word. Guess letters to figure it out!",
        gameType: 'hangman' as const
      },
      'number-guessing': {
        content: "🔢 **Starting Number Guessing!**\n\nI'm thinking of a number between 1 and 100. Can you guess it?",
        gameType: 'number-guessing' as const
      },
      'rock-paper-scissors': {
        content: "✂️ **Starting Rock Paper Scissors!**\n\nChoose your weapon: Rock, Paper, or Scissors!",
        gameType: 'rock-paper-scissors' as const
      },
      'ai-story-battle': {
        content: "📚 **Starting AI Story Battle!**\n\n🎭 **Welcome to the most revolutionary multiplayer story game ever created!**\n\n**How it works:**\n• **Build Together**: Players take turns adding to an epic story\n• **Battle System**: Challenge other players' contributions and rewrite them\n• **AI Judge**: The AI evaluates battles and decides the winner\n• **Power-ups**: Use special abilities like Plot Twist, Character Development, Cliffhanger\n• **Voting**: Players vote on story directions\n\n**Current Players:** Player 1, Player 2\n**Story Phase:** Building\n\nLet's create an amazing story together! Type your contribution or use a power-up!",
        gameType: 'ai-story-battle' as const
      }
    };

    // Wait for the game state to be set before creating the message
    setTimeout(() => {
    const gameMessage: ChatMessage = {
        id: `game-${Date.now()}-${Math.random()}`,
      type: 'assistant',
      content: gameMessages[gameType as keyof typeof gameMessages].content,
      timestamp: new Date(),
      gameType: gameMessages[gameType as keyof typeof gameMessages].gameType,
        isGameResponse: true,
        // Don't store interactive component in message - render it separately
      };

      setMessages(prev => [...prev, gameMessage]);
    }, 0);
  };

  // Helper function to generate brain teasers
  const generateBrainTeaser = () => {
    const teasers = [
      {
        question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answer: "echo",
        hint: "Think about what repeats what you say"
      },
      {
        question: "What has keys, but no locks; space, but no room; and you can enter, but not go in?",
        answer: "keyboard",
        hint: "You use this to type"
      },
      {
        question: "A man is found dead in a room with 53 bicycles. How did he die?",
        answer: "he was playing cards",
        hint: "The bicycles are not real bicycles"
      },
      {
        question: "What word becomes shorter when you add two letters to it?",
        answer: "short",
        hint: "Think about the word itself"
      }
    ];
    return teasers[Math.floor(Math.random() * teasers.length)];
  };

  // Handle game actions
  const handleGameAction = async (message: string) => {
    if (!currentGameRef.current) return;

    // Check if the current game is over
    if (isGameOver()) {
      console.log('Game is over, generating chat response instead');
      await generateChatResponse(message);
      return;
    }

    // Check for quit commands first
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('quit') || lowerMessage.includes('exit') || lowerMessage.includes('leave') || lowerMessage.includes('stop')) {
      const quitMessage: ChatMessage = {
        id: `quit-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: `🏃‍♂️ **You've decided to quit the game.**\n\nThanks for playing! You can start a new game anytime by asking me to play again.`,
        timestamp: new Date(),
        gameType: currentGameRef.current as any,
        isGameResponse: true
      };
      
      setMessages(prev => [...prev, quitMessage]);
      
      // End the current game
      setGameState(prev => ({
        ...prev,
        currentGame: null
      }));
      return;
    }

    switch (currentGameRef.current) {
      case 'mystery-manor':
        await handleMysteryManorAction(message);
        break;
      case 'brain-teaser':
        await handleBrainTeaserAction(message);
        break;
      case 'hangman':
        await handleHangmanAction(message);
        break;
      case 'number-guessing':
        await handleNumberGuessingAction(message);
        break;
      case 'ai-story-battle':
        await handleAIStoryBattleAction(message);
        break;
      default:
        await generateChatResponse(message);
    }
  };

  // Mystery Manor action handler with vectorized book content
  const handleMysteryManorAction = async (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Get current state
    let newState = { ...gameState.manorState };
    const currentRoom = newState.roomDescription || "entrance hall";
    const fearLevel = newState.fearLevel || 1;
    const visitedRooms = newState.visitedRooms || [];
    const actionCount = newState.actionCount || 0;
    
    // Initialize state if needed
    if (!newState.visitedRooms) newState.visitedRooms = [];
    if (!newState.actionCount) newState.actionCount = 0;
    if (!newState.choices) newState.choices = [];
    
    newState.actionCount++;
    
    // Generate dynamic content from vectorized books
    const storyContent = bookVectorService.generateStoryContent(
      currentRoom, 
      fearLevel, 
      visitedRooms, 
      actionCount
    );
    
    let response = '';
    let newFearLevel = fearLevel;
    
    // Process different types of actions
    if (lowerMessage.includes('explore') || lowerMessage.includes('look around') || lowerMessage.includes('examine')) {
      response = storyContent.description;
      newFearLevel += 0.5;
      
      // Add to visited rooms
      if (!visitedRooms.includes(storyContent.description)) {
        newState.visitedRooms.push(storyContent.description);
      }
      
    } else if (lowerMessage.includes('move forward') || lowerMessage.includes('go forward') || lowerMessage.includes('continue')) {
      const forwardContent = bookVectorService.generateStoryContent(
        "corridor", 
        fearLevel, 
        visitedRooms, 
        actionCount
      );
      response = `You cautiously move forward. ${forwardContent.description}`;
      newFearLevel += 0.3;
      
    } else if (lowerMessage.includes('investigate') || lowerMessage.includes('search') || lowerMessage.includes('find')) {
      const investigationContent = bookVectorService.generateStoryContent(
        "investigation", 
        fearLevel, 
        visitedRooms, 
        actionCount
      );
      response = `You begin investigating. ${investigationContent.description}`;
      newFearLevel += 0.4;
      
    } else if (lowerMessage.includes('confront') || lowerMessage.includes('face')) {
      response = `You gather your courage and confront the supernatural presence. ${storyContent.consequences[0]}`;
      newFearLevel += 1;
      newState.choices.push("confront");
      
    } else if (lowerMessage.includes('fear') || lowerMessage.includes('scared') || lowerMessage.includes('afraid')) {
      response = `Your fear is understandable in this place. ${storyContent.atmosphere} But remember, courage will be your greatest weapon.`;
      
    } else if (lowerMessage.includes('help') || lowerMessage.includes('hint')) {
      const hints = [
        "Look for patterns in the mansion's layout. The truth often lies in the details.",
        "Pay attention to the atmosphere. It changes as you explore deeper.",
        "Your choices matter. Each decision shapes your fate in this place.",
        "The books hold many secrets. Some knowledge is more than it appears.",
        "Trust your instincts, but don't let fear cloud your judgment."
      ];
      response = hints[Math.floor(Math.random() * hints.length)];
      
    } else if (lowerMessage.includes('quit') || lowerMessage.includes('exit') || lowerMessage.includes('leave') || lowerMessage.includes('stop')) {
      // Handle quit/exit game
      const quitMessage: ChatMessage = {
        id: `manor-quit-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: `🏃‍♂️ **You decide to leave the mansion.**\n\nYou turn away from the mysterious house, feeling both relieved and curious about what secrets you might have missed. The mansion's dark silhouette fades into the distance as you make your way back to safety.\n\n*Game ended. You can start a new game anytime!*`,
        timestamp: new Date(),
        gameType: 'mystery-manor',
        isGameResponse: true
      };
      
      setMessages(prev => [...prev, quitMessage]);
      
      // End the game
      setGameState(prev => ({
        ...prev,
        currentGame: null,
        manorState: { ...newState, gameOver: true }
      }));
      return;
      
    } else {
      // Generic response with book content
      response = `You attempt to ${lowerMessage}. ${storyContent.description}`;
      newFearLevel += 0.2;
    }
    
    // Add atmospheric details based on fear level
    if (newFearLevel >= 8) {
      response += "\n\n🌫️ The atmosphere is overwhelming. You feel the mansion's presence pressing down on you.";
    } else if (newFearLevel >= 5) {
      response += "\n\n🕯️ The shadows seem to move independently, and you hear whispers in the distance.";
    } else if (newFearLevel >= 3) {
      response += "\n\n🌙 The mansion feels more alive with each passing moment.";
    }
    
    // Add progression hints
    if (actionCount >= 15) {
      response += "\n\n🔍 You've been exploring for a while. The mansion's secrets are beginning to reveal themselves.";
    } else if (actionCount >= 10) {
      response += "\n\n📖 Your investigation is deepening. You're getting closer to the truth.";
    }
    
    // Check for game ending conditions
    if (newFearLevel >= 8 || actionCount >= 20 || visitedRooms.length >= 10) {
      const ending = bookVectorService.generateEnding(newFearLevel, newState.choices, visitedRooms);
      response += `\n\n🎭 **${ending.title}**\n\n${ending.description}\n\n${ending.outcome}`;
      
      // End the game
      newState.gameOver = true;
      setGameState(prev => ({
        ...prev,
        manorState: { ...newState, fearLevel: newFearLevel },
        currentGame: null
      }));
    } else {
      // Update game state
      setGameState(prev => ({
        ...prev,
        manorState: { ...newState, fearLevel: newFearLevel }
      }));
    }

    const manorMessage: ChatMessage = {
      id: `manor-${Date.now()}-${Math.random()}`,
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      gameType: 'mystery-manor',
      isGameResponse: true
    };

    setMessages(prev => [...prev, manorMessage]);
  };

  // Brain Teaser action handler
  const handleBrainTeaserAction = async (message: string) => {
    if (!gameState.currentTeaser) {
      console.log('No current teaser, generating chat response');
      await generateChatResponse(message);
      return;
    }

    // Skip processing if user just said "ready" or similar
    const lowerMessage = message.toLowerCase().trim();
    if (lowerMessage === 'ready' || lowerMessage === 'ok' || lowerMessage === 'yes' || lowerMessage === 'start') {
             const readyMessage: ChatMessage = {
         id: `ready-${Date.now()}-${Math.random()}`,
         type: 'assistant',
         content: "Great! Here's your brain teaser. Type your answer when you're ready!",
         timestamp: new Date(),
         gameType: 'brain-teaser',
         isGameResponse: true,
         // Don't store interactive component in message - render it separately
       };
      setMessages(prev => [...prev, readyMessage]);
      return;
    }

    const isCorrect = lowerMessage === gameState.currentTeaser.answer.toLowerCase();
    
         if (isCorrect) {
       const points = 10;
       const newScore = (gameState.teaserScore || 0) + points;
       const newStreak = (gameState.teaserStreak || 0) + 1;
       
       setGameState(prev => ({
         ...prev,
         teaserScore: newScore,
         teaserStreak: newStreak
       }));

       const correctMessage: ChatMessage = {
         id: `correct-${Date.now()}-${Math.random()}`,
         type: 'assistant',
         content: `🎉 **Correct!** +${points} points!\n\nYour score: ${newScore}\nStreak: ${newStreak}\n\nGenerating a new puzzle for you...`,
         timestamp: new Date(),
         gameType: 'brain-teaser',
         isGameResponse: true,
         // Don't store interactive component in message - render it separately
       };

       setMessages(prev => [...prev, correctMessage]);
       
       // Generate a new teaser after a short delay
       setTimeout(() => {
         setGameState(prev => ({
           ...prev,
           isGeneratingNewTeaser: true
         }));
         
         const newTeaser = generateBrainTeaser();
         setGameState(prev => ({
           ...prev,
           currentTeaser: newTeaser,
           isGeneratingNewTeaser: false
         }));
         
         const newTeaserMessage: ChatMessage = {
           id: `new-teaser-${Date.now()}-${Math.random()}`,
           type: 'assistant',
           content: `🧠 **New Brain Teaser!**\n\n${newTeaser.question}\n\nType your answer or use the buttons below!`,
           timestamp: new Date(),
           gameType: 'brain-teaser',
           isGameResponse: true
         };
         
         setMessages(prev => [...prev, newTeaserMessage]);
       }, 1500);
    } else {
      setGameState(prev => ({
        ...prev,
        teaserStreak: 0
      }));

             const incorrectMessage: ChatMessage = {
         id: `incorrect-${Date.now()}-${Math.random()}`,
         type: 'assistant',
         content: `❌ **Incorrect!** Try again or ask for a hint.\n\nHint: ${gameState.currentTeaser.hint}`,
         timestamp: new Date(),
         gameType: 'brain-teaser',
         isGameResponse: true,
         // Don't store interactive component in message - render it separately
       };

      setMessages(prev => [...prev, incorrectMessage]);
    }
  };

  // Handle reveal answer for brain teaser
  const handleRevealAnswer = () => {
    if (!gameState.currentTeaser) return;
    
    const revealMessage: ChatMessage = {
      id: `reveal-${Date.now()}-${Math.random()}`,
      type: 'assistant',
      content: `🔍 **Answer Revealed!**\n\n**Question:** ${gameState.currentTeaser.question}\n\n**Answer:** ${gameState.currentTeaser.answer}\n\n**Explanation:** ${gameState.currentTeaser.hint || 'No additional explanation available.'}\n\nGenerating a new puzzle for you...`,
      timestamp: new Date(),
      gameType: 'brain-teaser',
      isGameResponse: true
    };
    
    setMessages(prev => [...prev, revealMessage]);
    
    // Generate a new teaser after a short delay (don't end the game)
    setTimeout(() => {
      const newTeaser = generateBrainTeaser();
      setGameState(prev => ({
        ...prev,
        currentTeaser: newTeaser
      }));
      
      const newTeaserMessage: ChatMessage = {
        id: `new-teaser-reveal-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: `🧠 **New Brain Teaser!**\n\n${newTeaser.question}\n\nType your answer or use the buttons below!`,
        timestamp: new Date(),
        gameType: 'brain-teaser',
        isGameResponse: true
      };
      
      setMessages(prev => [...prev, newTeaserMessage]);
    }, 1500);
  };

  // Hangman action handler
  const handleHangmanAction = async (message: string) => {
    if (!gameState.hangmanWord) return;
    
    const letter = message.trim().toUpperCase();
    if (letter.length !== 1 || !/[A-Z]/.test(letter)) {
             const errorMessage: ChatMessage = {
         id: `hangman-error-${Date.now()}-${Math.random()}`,
         type: 'assistant',
         content: "Please enter a single letter (A-Z).",
         timestamp: new Date(),
         gameType: 'hangman',
         isGameResponse: true,
         // Don't store interactive component in message - render it separately
       };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (gameState.hangmanGuessed?.includes(letter)) {
             const repeatMessage: ChatMessage = {
         id: `hangman-repeat-${Date.now()}-${Math.random()}`,
         type: 'assistant',
         content: `You already guessed "${letter}". Try a different letter!`,
         timestamp: new Date(),
         gameType: 'hangman',
         isGameResponse: true,
         // Don't store interactive component in message - render it separately
       };
      setMessages(prev => [...prev, repeatMessage]);
      return;
    }

    // Process the guess
    handleHangmanGuess(letter);
  };

  // Number Guessing action handler
  const handleNumberGuessingAction = async (message: string) => {
    const guess = parseInt(message);
    if (isNaN(guess) || guess < 1 || guess > 100) {
             const errorMessage: ChatMessage = {
         id: `number-error-${Date.now()}-${Math.random()}`,
         type: 'assistant',
         content: "Please enter a number between 1 and 100.",
         timestamp: new Date(),
         gameType: 'number-guessing',
         isGameResponse: true,
         // Don't store interactive component in message - render it separately
       };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const newAttempts = (gameState.numberAttempts || 0) + 1;
    
    let feedback = '';
    if (guess === gameState.numberToGuess) {
      feedback = `🎉 **Correct!** You guessed it in ${newAttempts} attempts!`;
      setGameState(prev => ({
        ...prev,
        numberAttempts: newAttempts,
        isInGame: false,
        currentGame: null
      }));
    } else if (guess < (gameState.numberToGuess || 0)) {
      feedback = "Too low! Try a higher number.";
      setGameState(prev => ({
        ...prev,
        numberAttempts: newAttempts
      }));
    } else {
      feedback = "Too high! Try a lower number.";
      setGameState(prev => ({
        ...prev,
        numberAttempts: newAttempts
      }));
    }

         const guessMessage: ChatMessage = {
       id: `number-guess-${Date.now()}-${Math.random()}`,
       type: 'assistant',
       content: feedback,
       timestamp: new Date(),
       gameType: 'number-guessing',
       isGameResponse: true,
       // Don't store interactive component in message - render it separately
     };

    setMessages(prev => [...prev, guessMessage]);
  };

  // AI Story Battle handler
  const handleAIStoryBattleAction = async (message: string) => {
    if (!gameState.storyBattleState) return;
    
    const lowerMessage = message.toLowerCase();
    const storyState = gameState.storyBattleState;
    
    // Handle different actions
    if (lowerMessage.includes('add to story') || lowerMessage.includes('continue story') || lowerMessage.includes('add')) {
      // Add to story
      const newContribution = {
        id: `contribution-${Date.now()}-${Math.random()}`,
        player: storyState.currentPlayer,
        content: message,
        timestamp: new Date(),
        votes: 0,
        isActive: true
      };
      
      const updatedStory = storyState.currentStory + ' ' + message;
      const nextPlayer = storyState.players[(storyState.players.indexOf(storyState.currentPlayer) + 1) % storyState.players.length];
      
      setGameState(prev => ({
        ...prev,
        storyBattleState: {
          ...storyState,
          currentStory: updatedStory,
          storyContributions: [...storyState.storyContributions, newContribution],
          currentPlayer: nextPlayer,
          turnCount: storyState.turnCount + 1
        }
      }));
      
      const responseMessage: ChatMessage = {
        id: `story-add-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: `✍️ **${storyState.currentPlayer} added to the story!**\n\n**New addition:** "${message}"\n\n**Updated story:** ${updatedStory}\n\n**Next player:** ${nextPlayer}`,
        timestamp: new Date(),
        gameType: 'ai-story-battle',
        isGameResponse: true
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
    } else if (lowerMessage.includes('plot twist')) {
      // Use plot twist power-up
      if (storyState.powerUps.plotTwist > 0) {
        const plotTwist = "Suddenly, everything changed! The story took an unexpected turn...";
        const updatedStory = storyState.currentStory + ' ' + plotTwist;
        
        setGameState(prev => ({
          ...prev,
          storyBattleState: {
            ...storyState,
            currentStory: updatedStory,
            powerUps: {
              ...storyState.powerUps,
              plotTwist: storyState.powerUps.plotTwist - 1
            }
          }
        }));
        
        const responseMessage: ChatMessage = {
          id: `plot-twist-${Date.now()}-${Math.random()}`,
          type: 'assistant',
          content: `🔄 **Plot Twist Activated!**\n\n**Twist:** "${plotTwist}"\n\n**Updated story:** ${updatedStory}\n\n**Power-ups remaining:** Plot Twist (${storyState.powerUps.plotTwist - 1})`,
          timestamp: new Date(),
          gameType: 'ai-story-battle',
          isGameResponse: true
        };
        
        setMessages(prev => [...prev, responseMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: `no-plot-twist-${Date.now()}-${Math.random()}`,
          type: 'assistant',
          content: "❌ **No Plot Twist power-ups remaining!** Use other power-ups or add to the story normally.",
          timestamp: new Date(),
          gameType: 'ai-story-battle',
          isGameResponse: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      
    } else if (lowerMessage.includes('character development') || lowerMessage.includes('character dev')) {
      // Use character development power-up
      if (storyState.powerUps.characterDev > 0) {
        const characterDev = "The main character grew and changed, revealing new depths to their personality...";
        const updatedStory = storyState.currentStory + ' ' + characterDev;
        
        setGameState(prev => ({
          ...prev,
          storyBattleState: {
            ...storyState,
            currentStory: updatedStory,
            powerUps: {
              ...storyState.powerUps,
              characterDev: storyState.powerUps.characterDev - 1
            }
          }
        }));
        
        const responseMessage: ChatMessage = {
          id: `character-dev-${Date.now()}-${Math.random()}`,
          type: 'assistant',
          content: `👤 **Character Development Activated!**\n\n**Development:** "${characterDev}"\n\n**Updated story:** ${updatedStory}\n\n**Power-ups remaining:** Character Dev (${storyState.powerUps.characterDev - 1})`,
          timestamp: new Date(),
          gameType: 'ai-story-battle',
          isGameResponse: true
        };
        
        setMessages(prev => [...prev, responseMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: `no-character-dev-${Date.now()}-${Math.random()}`,
          type: 'assistant',
          content: "❌ **No Character Development power-ups remaining!** Use other power-ups or add to the story normally.",
          timestamp: new Date(),
          gameType: 'ai-story-battle',
          isGameResponse: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      
    } else if (lowerMessage.includes('cliffhanger')) {
      // Use cliffhanger power-up
      if (storyState.powerUps.cliffhanger > 0) {
        const cliffhanger = "Just as the story reached its peak, a mysterious event occurred that left everyone wondering what would happen next...";
        const updatedStory = storyState.currentStory + ' ' + cliffhanger;
        
        setGameState(prev => ({
          ...prev,
          storyBattleState: {
            ...storyState,
            currentStory: updatedStory,
            powerUps: {
              ...storyState.powerUps,
              cliffhanger: storyState.powerUps.cliffhanger - 1
            }
          }
        }));
        
        const responseMessage: ChatMessage = {
          id: `cliffhanger-${Date.now()}-${Math.random()}`,
          type: 'assistant',
          content: `🎭 **Cliffhanger Activated!**\n\n**Cliffhanger:** "${cliffhanger}"\n\n**Updated story:** ${updatedStory}\n\n**Power-ups remaining:** Cliffhanger (${storyState.powerUps.cliffhanger - 1})`,
          timestamp: new Date(),
          gameType: 'ai-story-battle',
          isGameResponse: true
        };
        
        setMessages(prev => [...prev, responseMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: `no-cliffhanger-${Date.now()}-${Math.random()}`,
          type: 'assistant',
          content: "❌ **No Cliffhanger power-ups remaining!** Use other power-ups or add to the story normally.",
          timestamp: new Date(),
          gameType: 'ai-story-battle',
          isGameResponse: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      
    } else if (lowerMessage.includes('battle') || lowerMessage.includes('challenge')) {
      // Use battle power-up
      if (storyState.powerUps.battle > 0) {
        const battleMessage: ChatMessage = {
          id: `battle-${Date.now()}-${Math.random()}`,
          type: 'assistant',
          content: `⚔️ **Battle Mode Activated!**\n\n**AI Judge:** "The battle begins! The AI will evaluate the story contributions and decide which version is better. The winner gets to keep their version in the story!"\n\n**Current story:** ${storyState.currentStory}\n\n**Power-ups remaining:** Battle (${storyState.powerUps.battle - 1})`,
          timestamp: new Date(),
          gameType: 'ai-story-battle',
          isGameResponse: true
        };
        
        setGameState(prev => ({
          ...prev,
          storyBattleState: {
            ...storyState,
            powerUps: {
              ...storyState.powerUps,
              battle: storyState.powerUps.battle - 1
            },
            gamePhase: 'battling'
          }
        }));
        
        setMessages(prev => [...prev, battleMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: `no-battle-${Date.now()}-${Math.random()}`,
          type: 'assistant',
          content: "❌ **No Battle power-ups remaining!** Use other power-ups or add to the story normally.",
          timestamp: new Date(),
          gameType: 'ai-story-battle',
          isGameResponse: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      
    } else if (lowerMessage.includes('vote')) {
      // Voting system
      const voteMessage: ChatMessage = {
        id: `vote-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: `🗳️ **Voting System Activated!**\n\n**AI Judge:** "Players can now vote on story directions! The AI will tally the votes and implement the most popular choice."\n\n**Current story:** ${storyState.currentStory}\n\n**Vote options:**\n• Continue the current plot\n• Add a new character\n• Change the setting\n• Add conflict\n• Create a mystery`,
        timestamp: new Date(),
        gameType: 'ai-story-battle',
        isGameResponse: true
      };
      
      setGameState(prev => ({
        ...prev,
        storyBattleState: {
          ...storyState,
          gamePhase: 'voting'
        }
      }));
      
      setMessages(prev => [...prev, voteMessage]);
      
    } else {
      // Default: treat as story addition
      const newContribution = {
        id: `contribution-${Date.now()}-${Math.random()}`,
        player: storyState.currentPlayer,
        content: message,
        timestamp: new Date(),
        votes: 0,
        isActive: true
      };
      
      const updatedStory = storyState.currentStory + ' ' + message;
      const nextPlayer = storyState.players[(storyState.players.indexOf(storyState.currentPlayer) + 1) % storyState.players.length];
      
      setGameState(prev => ({
        ...prev,
        storyBattleState: {
          ...storyState,
          currentStory: updatedStory,
          storyContributions: [...storyState.storyContributions, newContribution],
          currentPlayer: nextPlayer,
          turnCount: storyState.turnCount + 1
        }
      }));
      
      const responseMessage: ChatMessage = {
        id: `story-add-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: `✍️ **${storyState.currentPlayer} added to the story!**\n\n**New addition:** "${message}"\n\n**Updated story:** ${updatedStory}\n\n**Next player:** ${nextPlayer}`,
        timestamp: new Date(),
        gameType: 'ai-story-battle',
        isGameResponse: true
      };
      
      setMessages(prev => [...prev, responseMessage]);
    }
  };

  // Rock Paper Scissors handler
  const handleRockPaperScissors = (choice: string) => {
    const choices = ['rock', 'paper', 'scissors'];
    const aiChoice = choices[Math.floor(Math.random() * choices.length)];
    
    let result = '';
    if (choice === aiChoice) {
      result = `It's a tie! We both chose ${choice}.`;
    } else if (
      (choice === 'rock' && aiChoice === 'scissors') ||
      (choice === 'paper' && aiChoice === 'rock') ||
      (choice === 'scissors' && aiChoice === 'paper')
    ) {
      result = `You win! ${choice} beats ${aiChoice}!`;
    } else {
      result = `I win! ${aiChoice} beats ${choice}!`;
    }

         const gameMessage: ChatMessage = {
       id: `rps-${Date.now()}-${Math.random()}`,
       type: 'assistant',
       content: `You chose ${choice}, I chose ${aiChoice}. ${result}`,
       timestamp: new Date(),
       gameType: 'rock-paper-scissors',
       isGameResponse: true
     };

    setMessages(prev => [...prev, gameMessage]);
  };

  const showGameOptions = async () => {
         const optionsMessage: ChatMessage = {
       id: `options-${Date.now()}-${Math.random()}`,
       type: 'assistant',
       content: "🎮 **Choose Your Game!**\n\n**Adventure Games:**\n• Mystery Manor - Solve mysteries in a haunted mansion\n• Brain Teaser - Challenge your mind with puzzles\n• **AI Story Battle** - Revolutionary multiplayer story-building game!\n\n**Classic Games:**\n• Tic-Tac-Toe\n• Hangman\n• Number Guessing\n• Rock Paper Scissors\n\nJust tell me which game you'd like to play!",
       timestamp: new Date()
     };

    setMessages(prev => [...prev, optionsMessage]);
  };

  const showHelp = async () => {
         const helpMessage: ChatMessage = {
       id: `help-${Date.now()}-${Math.random()}`,
       type: 'assistant',
       content: "🤖 **I'm your AI Game Assistant!**\n\n**What I can do:**\n• Play games with you\n• Have conversations\n• Help solve puzzles\n• Provide entertainment\n\n**How to play games:**\nJust say \"play [game name]\" or \"I want to play [game name]\"\n\n**Available games:**\n• Mystery Manor\n• Brain Teaser\n• **AI Story Battle** - Revolutionary multiplayer story game!\n• Tic-Tac-Toe\n• Hangman\n• And more!\n\nWhat would you like to do?",
       timestamp: new Date()
     };

    setMessages(prev => [...prev, helpMessage]);
  };

  const generateChatResponse = async (message: string) => {
    console.log('generateChatResponse called with message:', message);
    
    // Show typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      type: 'assistant',
      content: '🤖 AI is thinking...',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, typingMessage]);

    // Check for Scribble game request (more context aware)
    const lowerMessage = message.toLowerCase();
    const isGameRequest = (
      lowerMessage.includes('let\'s play scribble') ||
      lowerMessage.includes('start scribble') ||
      lowerMessage.includes('play scribble') ||
      lowerMessage.includes('join scribble') ||
      lowerMessage.includes('open scribble') ||
      lowerMessage.includes('drawing game') ||
      lowerMessage.includes('pictionary')
    );
    
    // Don't trigger if user is just mentioning scribble in conversation
    const isJustMentioning = (
      lowerMessage.includes('not scribble') ||
      lowerMessage.includes('not a scribble') ||
      lowerMessage.includes('not the scribble') ||
      lowerMessage.includes('about scribble') ||
      lowerMessage.includes('what is scribble') ||
      lowerMessage.includes('explain scribble') ||
      lowerMessage.includes('something more') ||
      lowerMessage.includes('something else') ||
      lowerMessage.includes('different') ||
      lowerMessage.includes('other')
    );
    
    if (isGameRequest && !isJustMentioning) {
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      // Show the modal
      setShowScribbleModal(true);
      
      // Add a system message
      const systemMessage: ChatMessage = {
        id: `scribble-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: '🎨 **Starting Scribble Game!** Welcome to the most fun drawing and guessing game ever!',
        timestamp: new Date(),
        gameType: 'scribble'
      };
      setMessages(prev => [...prev, systemMessage]);
      return;
    }

    try {
      // Get recent conversation history for context
      const recentMessages = messages.slice(-5).map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      // Add current user message
      recentMessages.push({
        role: 'user',
        content: message
      });

      console.log('Calling Groq API with messages:', recentMessages);
      
      // Generate AI response using Groq
      const aiResponse = await groqAIService.generateResponse(recentMessages);
      
      console.log('Groq API response:', aiResponse);

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

             const assistantMessage: ChatMessage = {
         id: `ai-response-${Date.now()}-${Math.random()}`,
         type: 'assistant',
         content: aiResponse,
         timestamp: new Date()
       };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      // Fallback response
             const fallbackMessage: ChatMessage = {
         id: `fallback-${Date.now()}-${Math.random()}`,
         type: 'assistant',
         content: "I'm having trouble connecting right now, but I'm still here to help! What would you like to do?",
         timestamp: new Date()
       };

      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  // Render interactive game components inline within chat messages
  const renderGameComponent = (gameType: string) => {
    // Get the current game state directly instead of relying on closure
    const currentGameState = gameState;
    console.log('Rendering game component for:', gameType, 'Game state:', currentGameState);
    switch (gameType) {
      case 'brain-teaser':
        if (!gameState.currentTeaser) return null;
        return (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🧠 Brain Teaser</h4>
            <p className="text-blue-700 mb-3">{gameState.currentTeaser.question}</p>
            <div className="text-sm text-blue-600 mb-3">
              <p>Score: {gameState.teaserScore || 0} | Streak: {gameState.teaserStreak || 0}</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => handleQuickAction('reveal answer')}
                className="px-3 py-1 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded text-xs hover:bg-yellow-200 transition-colors"
              >
                🔍 Reveal Answer
              </button>
              <button
                onClick={() => handleQuickAction('quit game')}
                className="px-3 py-1 bg-red-100 border border-red-300 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
              >
                🚪 Quit Game
              </button>
            </div>
          </div>
        );

       case 'tic-tac-toe':
         // Always use the current game state for the board
         const currentBoard = gameState.ticTacToeBoard || Array(9).fill(null);
         const currentPlayer = gameState.ticTacToePlayer || 'X';
         const currentWinner = gameState.ticTacToeWinner || null;
         console.log('Main render - Current board:', currentBoard, 'Player:', currentPlayer);
         return renderTicTacToeBoard(currentBoard, currentPlayer, currentWinner);

       case 'hangman':
         if (!gameState.hangmanWord) return null;
         return (
           <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
             <h4 className="font-semibold text-purple-800 mb-3">🎯 Hangman</h4>
             <div className="text-2xl font-mono mb-3 text-center">
               {gameState.hangmanWord.split('').map((letter, index) => (
                 <span key={index} className="mx-1">
                   {gameState.hangmanGuessed?.includes(letter) ? letter : '_'}
                 </span>
               ))}
             </div>
             <p className="text-sm text-purple-700 text-center mb-3">
               Word length: {gameState.hangmanWord.length} letters | Wrong guesses: {gameState.hangmanWrong}/6
             </p>
             {gameState.hangmanGameOver && (
               <p className="text-center font-semibold text-purple-800">
                 {gameState.hangmanWord.split('').every(char => gameState.hangmanGuessed?.includes(char))
                   ? '🎉 You won!'
                   : `💀 Game over! The word was: ${gameState.hangmanWord}`
                 }
               </p>
             )}
             <div className="grid grid-cols-6 gap-1 mt-3">
               {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                 <button
                   key={letter}
                   onClick={() => handleHangmanGuess(letter)}
                   disabled={gameState.hangmanGuessed?.includes(letter) || gameState.hangmanGameOver}
                   className={`w-6 h-6 text-xs font-bold rounded transition-colors ${
                     gameState.hangmanGuessed?.includes(letter)
                       ? gameState.hangmanWord.includes(letter)
                         ? 'bg-green-500 text-white'
                         : 'bg-red-500 text-white'
                       : 'bg-white border border-purple-300 text-purple-700 hover:bg-purple-100'
                   }`}
                 >
                   {letter}
                 </button>
               ))}
             </div>
             <p className="text-xs text-purple-600 mt-2 text-center">
               Click letters to guess, or type them in the chat!
             </p>
             <div className="mt-2 text-center">
               <button
                 onClick={() => handleQuickAction('quit game')}
                 className="px-3 py-1 bg-red-100 border border-red-300 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
               >
                 🚪 Quit Game
               </button>
             </div>
           </div>
         );

      case 'number-guessing':
        return (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">🔢 Number Guessing</h4>
            <p className="text-orange-700 mb-2">Attempts: {gameState.numberAttempts || 0}</p>
            {gameState.numberFeedback && (
              <p className="text-orange-800 font-medium">{gameState.numberFeedback}</p>
            )}
          </div>
        );

      case 'rock-paper-scissors':
        return (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-3">✂️ Rock Paper Scissors</h4>
            <div className="flex justify-center space-x-4 mb-3">
              {['rock', 'paper', 'scissors'].map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleRockPaperScissors(choice)}
                  className="px-4 py-2 bg-white border-2 border-red-300 rounded-lg hover:bg-red-100 transition-colors capitalize"
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        );

      case 'ai-story-battle':
        if (!gameState.storyBattleState) return null;
        const storyState = gameState.storyBattleState;
        return (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-3">📚 AI Story Battle</h4>
            
            {/* Current Story Display */}
            <div className="mb-4 p-3 bg-white border border-purple-200 rounded-lg">
              <h5 className="font-medium text-purple-700 mb-2">📖 Current Story:</h5>
              <p className="text-gray-800 text-sm leading-relaxed">{storyState.currentStory}</p>
            </div>

            {/* Game Status */}
            <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded border">
                <span className="font-medium text-purple-700">Current Player:</span>
                <span className="ml-1 text-gray-800">{storyState.currentPlayer}</span>
              </div>
              <div className="bg-white p-2 rounded border">
                <span className="font-medium text-purple-700">Phase:</span>
                <span className="ml-1 text-gray-800 capitalize">{storyState.gamePhase}</span>
              </div>
              <div className="bg-white p-2 rounded border">
                <span className="font-medium text-purple-700">Turn:</span>
                <span className="ml-1 text-gray-800">{storyState.turnCount}</span>
              </div>
              <div className="bg-white p-2 rounded border">
                <span className="font-medium text-purple-700">Players:</span>
                <span className="ml-1 text-gray-800">{storyState.players.length}/{storyState.maxPlayers}</span>
              </div>
            </div>

            {/* Power-ups */}
            <div className="mb-4">
              <h5 className="font-medium text-purple-700 mb-2">⚡ Power-ups:</h5>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickAction('plot twist')}
                  disabled={storyState.powerUps.plotTwist === 0}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    storyState.powerUps.plotTwist > 0
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🔄 Plot Twist ({storyState.powerUps.plotTwist})
                </button>
                <button
                  onClick={() => handleQuickAction('character development')}
                  disabled={storyState.powerUps.characterDev === 0}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    storyState.powerUps.characterDev > 0
                      ? 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
                      : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  👤 Character Dev ({storyState.powerUps.characterDev})
                </button>
                <button
                  onClick={() => handleQuickAction('cliffhanger')}
                  disabled={storyState.powerUps.cliffhanger === 0}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    storyState.powerUps.cliffhanger > 0
                      ? 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
                      : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🎭 Cliffhanger ({storyState.powerUps.cliffhanger})
                </button>
                <button
                  onClick={() => handleQuickAction('battle')}
                  disabled={storyState.powerUps.battle === 0}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    storyState.powerUps.battle > 0
                      ? 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200'
                      : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  ⚔️ Battle ({storyState.powerUps.battle})
                </button>
              </div>
              </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => handleQuickAction('add to story')}
                className="px-2 py-1 bg-green-100 border border-green-300 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
              >
                ✍️ Add to Story
              </button>
              <button
                onClick={() => handleQuickAction('vote')}
                className="px-2 py-1 bg-blue-100 border border-blue-300 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
              >
                🗳️ Vote
              </button>
              <button
                onClick={() => handleQuickAction('quit game')}
                className="px-2 py-1 bg-red-100 border border-red-300 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
              >
                🚪 Quit Game
              </button>
            </div>
          </div>
        );

      case 'mystery-manor':
        console.log('Mystery Manor state:', gameState.manorState);
        if (!gameState.manorState) {
        return (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">🏚️ Mystery Manor</h4>
              <p className="text-gray-600">Loading game state...</p>
            </div>
          );
        }

        // Generate dynamic actions based on current state
        const manorState = gameState.manorState;
        const fearLevel = manorState.fearLevel || 1;
        const actionCount = manorState.actionCount || 0;
        const visitedRooms = manorState.visitedRooms || [];
        
        const storyContent = bookVectorService.generateStoryContent(
          manorState.roomDescription || "entrance hall",
          fearLevel,
          visitedRooms,
          actionCount
        );

        return (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">🏚️ Mystery Manor</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Fear Level: {fearLevel}/10</p>
              <p>Actions Taken: {actionCount}</p>
              <p>Rooms Visited: {visitedRooms.length}</p>
              <p>Current Location: {manorState.roomDescription || "entrance hall"}</p>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Available actions:</p>
              <div className="flex flex-wrap gap-1">
                {storyContent.availableActions.slice(0, 3).map((action, index) => (
                <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors"
                  >
                    {action}
                  </button>
                ))}
                <button
                  onClick={() => handleQuickAction('quit game')}
                  className="px-2 py-1 bg-red-100 border border-red-300 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                >
                  🚪 Quit Game
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Tic-Tac-Toe move handler
  const handleTicTacToeMove = (index: number) => {
    if (!gameState.ticTacToeBoard || gameState.ticTacToeBoard[index] || gameState.ticTacToeWinner) return;

    const currentPlayer = gameState.ticTacToePlayer || 'X';
    const newBoard = [...gameState.ticTacToeBoard];
    newBoard[index] = currentPlayer;
    
    const winner = checkTicTacToeWinner(newBoard);
    const isDraw = newBoard.every(cell => cell !== null);
    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
    console.log('TicTacToe move - Board:', newBoard, 'Winner:', winner, 'IsDraw:', isDraw);
    
    // Update state immediately
    setGameState(prev => ({
      ...prev,
      ticTacToeBoard: newBoard,
      ticTacToePlayer: nextPlayer,
      ticTacToeWinner: winner || (isDraw ? 'Draw' : null)
    }));

    // Add move message without board (board will be shown in AI response)
    const moveMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      type: 'user',
      content: `Moved ${currentPlayer} to position ${index + 1}`,
      timestamp: new Date(),
      gameType: 'tic-tac-toe',
      isGameResponse: true
    };
    setMessages(prev => [...prev, moveMessage]);

    // If game is over, add a game over message
    if (winner || isDraw) {
      const gameOverMessage: ChatMessage = {
        id: `gameover-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: winner ? `🎉 **${winner} wins!** Great game!` : `🤝 **It's a draw!** Well played!`,
        timestamp: new Date(),
        gameType: 'tic-tac-toe',
        isGameResponse: true
      };
      setMessages(prev => [...prev, gameOverMessage]);
    }

    // AI move (simple random)
    if (!winner && !isDraw) {
      setTimeout(() => {
        const emptyIndices = newBoard.map((cell, idx) => cell === null ? idx : null).filter(idx => idx !== null);
        if (emptyIndices.length > 0) {
          const aiMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)] as number;
          const aiBoard = [...newBoard];
          aiBoard[aiMove] = 'O';
          
          const aiWinner = checkTicTacToeWinner(aiBoard);
          const aiDraw = aiBoard.every(cell => cell !== null);
          
          console.log('AI move - Board:', aiBoard, 'Winner:', aiWinner, 'IsDraw:', aiDraw);
          
          setGameState(prev => ({
            ...prev,
            ticTacToeBoard: aiBoard,
            ticTacToePlayer: 'X',
            ticTacToeWinner: aiWinner || (aiDraw ? 'Draw' : null)
          }));

          const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}-${Math.random()}`,
            type: 'assistant',
            content: `I moved O to position ${aiMove + 1}`,
            timestamp: new Date(),
            gameType: 'tic-tac-toe',
            isGameResponse: true
          };
          setMessages(prev => [...prev, aiMessage]);

          // If AI move ends the game, add a game over message
          if (aiWinner || aiDraw) {
            const gameOverMessage: ChatMessage = {
              id: `gameover-ai-${Date.now()}-${Math.random()}`,
              type: 'assistant',
              content: aiWinner ? `🎉 **${aiWinner} wins!** Great game!` : `🤝 **It's a draw!** Well played!`,
              timestamp: new Date(),
              gameType: 'tic-tac-toe',
              isGameResponse: true
            };
            setMessages(prev => [...prev, gameOverMessage]);
          }
        }
      }, 1000);
    }
  };

  // Check Tic-Tac-Toe winner
  const checkTicTacToeWinner = (board: (string | null)[]): string | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  // Render Tic-Tac-Toe board with specific state
  const renderTicTacToeBoard = (board: (string | null)[], currentPlayer: string, winner: string | null) => {
    console.log('Rendering TicTacToe board:', board, 'Player:', currentPlayer, 'Winner:', winner);
    console.log('Current game state from ref:', gameStateRef.current);
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-3">⭕ Tic-Tac-Toe</h4>
        <div className="grid grid-cols-3 gap-2 w-48 mx-auto mb-3">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleTicTacToeMove(index)}
              className="w-12 h-12 bg-white border-2 border-green-300 rounded text-lg font-bold hover:bg-green-100 transition-colors flex items-center justify-center"
              disabled={!!cell || !!winner}
            >
              {cell === 'X' ? (
                <span className="text-blue-600 text-2xl font-black drop-shadow-sm">X</span>
              ) : cell === 'O' ? (
                <span className="text-red-600 text-2xl font-black drop-shadow-sm">O</span>
              ) : (
                <span className="text-gray-400 text-lg">•</span>
              )}
            </button>
          ))}
        </div>
        <p className="text-sm text-green-700 text-center">
          Current Player: <span className="font-bold">{currentPlayer}</span>
          {winner && (
            <span className="block mt-1 text-green-800">
              {winner === 'Draw' ? "It's a Draw!" : `Player ${winner} Wins!`}
            </span>
          )}
        </p>
                       <p className="text-xs text-green-600 mt-2 text-center">
                 Game Progress: {board.filter(cell => cell !== null).length}/9 moves
               </p>
               <div className="mt-2 text-center">
                 <button
                   onClick={() => handleQuickAction('quit game')}
                   className="px-3 py-1 bg-red-100 border border-red-300 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                 >
                   🚪 Quit Game
                 </button>
               </div>
             </div>
           );
         };

  // Hangman guess handler
  const handleHangmanGuess = (letter: string) => {
    if (!gameState.hangmanWord || gameState.hangmanGuessed?.includes(letter) || gameState.hangmanGameOver) return;

    const newGuessed = [...(gameState.hangmanGuessed || []), letter];
    const newWrong = gameState.hangmanWord.includes(letter) ? (gameState.hangmanWrong || 0) : (gameState.hangmanWrong || 0) + 1;
    const gameOver = newWrong >= 6 || gameState.hangmanWord.split('').every(char => newGuessed.includes(char));

    console.log('Hangman guess - Letter:', letter, 'Wrong count:', newWrong, 'Game over:', gameOver);

    // Update state immediately
    setGameState(prev => ({
      ...prev,
      hangmanGuessed: newGuessed,
      hangmanWrong: newWrong,
      hangmanGameOver: gameOver
    }));

    // Add guess message without board (board will be shown separately)
    const guessMessage: ChatMessage = {
      id: `hangman-${Date.now()}-${Math.random()}`,
      type: 'user',
      content: `Guessed letter: ${letter}`,
      timestamp: new Date(),
      gameType: 'hangman',
      isGameResponse: true
    };
    setMessages(prev => [...prev, guessMessage]);

    // If game is over, add a game over message
    if (gameOver) {
      const won = gameState.hangmanWord.split('').every(char => newGuessed.includes(char));
      const gameOverMessage: ChatMessage = {
        id: `hangman-gameover-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: won ? `🎉 **You won!** The word was "${gameState.hangmanWord}". Great job!` : `💀 **Game over!** The word was "${gameState.hangmanWord}". Better luck next time!`,
        timestamp: new Date(),
        gameType: 'hangman',
        isGameResponse: true
      };
      setMessages(prev => [...prev, gameOverMessage]);
    }

    // AI response (only if game is not over)
    if (!gameOver) {
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: `hangman-ai-${Date.now()}-${Math.random()}`,
          type: 'assistant',
          content: gameState.hangmanWord.includes(letter) 
            ? `Good guess! "${letter}" is in the word.`
            : `Sorry, "${letter}" is not in the word.`,
          timestamp: new Date(),
          gameType: 'hangman',
          isGameResponse: true
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 500);
    }
  };

  // Quick action handler for all games
  const handleQuickAction = (action: string) => {
    const currentGame = currentGameRef.current;
    
         if (action === 'quit game') {
       // Handle quit for all games
       const quitMessage: ChatMessage = {
         id: `quit-${Date.now()}-${Math.random()}`,
         type: 'assistant',
         content: `🏃‍♂️ **You've decided to quit the game.**\n\nThanks for playing! You can start a new game anytime by asking me to play again.`,
         timestamp: new Date(),
         gameType: currentGame as any,
         isGameResponse: true
       };
       
       setMessages(prev => [...prev, quitMessage]);
       
       // End the current game and reset brain teaser state
       setGameState(prev => ({
         ...prev,
         currentGame: null,
         currentTeaser: null,
         isGeneratingNewTeaser: false
       }));
       return;
     }
    
    if (action === 'reveal answer' && currentGame === 'brain-teaser') {
      handleRevealAnswer();
      return;
    }
    
    // For other actions, route to appropriate game handler
    switch (currentGame) {
      case 'mystery-manor':
        handleMysteryManorAction(action);
        break;
      case 'ai-story-battle':
        handleAIStoryBattleAction(action);
        break;
      default:
        // For other games, just process as a regular message
        if (currentGame) {
          handleGameAction(action);
        }
        break;
    }
  };

  const exitGame = () => {
    setGameState(prev => ({
      ...prev,
      currentGame: null,
      isInGame: false,
      // Reset all game states
      ticTacToeBoard: Array(9).fill(null),
      ticTacToePlayer: 'X',
      ticTacToeWinner: null,
      hangmanWord: undefined,
      hangmanGuessed: [],
      hangmanWrong: 0,
      hangmanGameOver: false,
      numberToGuess: undefined,
      numberAttempts: 0,
      numberFeedback: '',
             currentTeaser: undefined,
       teaserScore: 0,
       teaserStreak: 0,
       isGeneratingNewTeaser: false
    }));

         const exitMessage: ChatMessage = {
       id: `exit-${Date.now()}-${Math.random()}`,
       type: 'assistant',
       content: "🎮 **Game ended!**\n\nThanks for playing! What would you like to do next? You can ask me to play another game or just chat with me!",
       timestamp: new Date()
     };

    setMessages(prev => [...prev, exitMessage]);
  };

  const resetTicTacToe = () => {
    setGameState(prev => ({
      ...prev,
      ticTacToeBoard: Array(9).fill(null),
      ticTacToePlayer: 'X',
      ticTacToeWinner: null
    }));
  };

  // Check if current game is over
  const isGameOver = () => {
    if (!currentGameRef.current) return false;
    
    switch (currentGameRef.current) {
      case 'tic-tac-toe':
        return gameState.ticTacToeWinner !== null;
      case 'hangman':
        return gameState.hangmanGameOver === true;
      case 'number-guessing':
        return gameState.numberToGuess && gameState.numberAttempts && 
               gameState.numberFeedback?.includes('Correct');
      case 'brain-teaser':
        return false; // Brain teaser never ends automatically - only when user quits
      case 'mystery-manor':
        return gameState.manorState?.gameOver === true;
      case 'rock-paper-scissors':
        return false; // Rock paper scissors doesn't have a clear "game over" state
      case 'ai-story-battle':
        return gameState.storyBattleState?.gamePhase === 'ended';
      default:
        return false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">AI Game Assistant</h1>
              <p className="text-sm text-gray-600">Chat, play games, and have fun!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              title="Multiplayer"
            >
              <Users className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-500' 
                    : message.type === 'system'
                    ? 'bg-purple-500'
                    : 'bg-gray-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : message.type === 'system' ? (
                    <Sparkles className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`rounded-lg px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.type === 'system'
                    ? 'bg-purple-50 border border-purple-200 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  {/* Render interactive game components inline */}
                  {message.interactiveComponent && message.interactiveComponent}
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
        
        {/* Current Game Component - Always shows current state */}
        {currentGameRef.current && !isGameOver() && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="max-w-3xl mx-auto">
              {renderGameComponent(currentGameRef.current)}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or ask to play a game..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-gray-800 placeholder-gray-500"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          {gameState.currentGame && !isGameOver() ? 
            `Playing ${gameState.currentGame}. Type commands or use the game interface above!` : 
            currentGameRef.current && isGameOver() ? 
            "Game over! You can continue chatting or start a new game." :
            "Press Enter to send, Shift+Enter for new line"
          }
        </div>
      </div>

      {/* Scribble Modal */}
      <ScribbleModal 
        isOpen={showScribbleModal}
        onClose={() => setShowScribbleModal(false)}
        onJoinRoom={(roomId) => {
          console.log('Joining room:', roomId);
          // You can add room joining logic here
        }}
        roomId={roomId}
      />
    </div>
  );
};

export default ChatBasedGameSystem;
