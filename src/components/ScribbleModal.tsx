import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import scribbleWebSocket from '../services/scribbleWebSocket';
import { 
  Copy, 
  Share2, 
  Users, 
  Crown,
  Palette,
  X,
  Play,
  MessageCircle,
  Send,
  LogOut,
  RotateCcw,
  Trash2,
  CheckCircle,
  Timer
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  score: number;
  isDrawing: boolean;
}

interface GameMessage {
  id: string;
  type: 'system' | 'player' | 'guess' | 'correct';
  content: string;
  playerName?: string;
  timestamp: Date;
}

interface ScribbleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom?: (roomId: string) => void;
  roomId?: string;
}

const ScribbleModal: React.FC<ScribbleModalProps> = ({ isOpen, onClose, onJoinRoom, roomId: propRoomId }) => {
  const [roomId] = useState(() => propRoomId || Math.random().toString(36).substring(2, 8).toUpperCase());
  const [players, setPlayers] = useState<Player[]>([
    {
      id: '1',
      name: 'You',
      avatar: '🎨',
      isHost: true,
      score: 0,
      isDrawing: true
    },
    {
      id: '2',
      name: 'Friend',
      avatar: '👤',
      isHost: false,
      score: 0,
      isDrawing: false
    }
  ]);
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentWord, setCurrentWord] = useState('cat');
  const [gamePhase, setGamePhase] = useState('drawing'); // drawing, guessing, round-end
  const [timeLeft, setTimeLeft] = useState(60);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  // Drawing words
  const drawingWords = [
    'cat', 'dog', 'house', 'tree', 'car', 'sun', 'moon', 'star', 'heart', 'flower',
    'pizza', 'hamburger', 'ice cream', 'cake', 'apple', 'banana', 'elephant', 'lion',
    'butterfly', 'rainbow', 'castle', 'rocket', 'robot', 'guitar', 'piano', 'book',
    'camera', 'phone', 'computer', 'bicycle', 'airplane', 'boat', 'train', 'balloon'
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Set drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [canvasSize]);

  // Timer countdown
  useEffect(() => {
    if (gamePhase === 'drawing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endRound('timeout');
    }
  }, [timeLeft, gamePhase]);

  // WebSocket connection
  useEffect(() => {
    const playerId = Math.random().toString(36).substring(2, 8);
    setMyPlayerId(playerId);
    
    // Check if this is the first player (host) using localStorage
    const roomKey = `scribble_room_${roomId}`;
    const existingData = localStorage.getItem(roomKey);
    
    if (!existingData) {
      // First player - this is the host (drawer)
      setIsHost(true);
      setPlayers([
        {
          id: playerId,
          name: 'You',
          avatar: '🎨',
          isHost: true,
          score: 0,
          isDrawing: true
        },
        {
          id: 'waiting',
          name: 'Waiting for player...',
          avatar: '👤',
          isHost: false,
          score: 0,
          isDrawing: false
        }
      ]);
      setCurrentPlayer(0);
      localStorage.setItem(roomKey, JSON.stringify({ hostId: playerId, guestId: null }));
      addMessage(`🎨 You are the drawer! Draw the word for others to guess.`, 'system');
    } else {
      // Second player - this is the guest (guesser)
      const roomData = JSON.parse(existingData);
      setIsHost(false);
      setPlayers([
        {
          id: roomData.hostId,
          name: 'Host Player',
          avatar: '🎨',
          isHost: true,
          score: 0,
          isDrawing: true
        },
        {
          id: playerId,
          name: 'You',
          avatar: '👤',
          isHost: false,
          score: 0,
          isDrawing: false
        }
      ]);
      setCurrentPlayer(1);
      roomData.guestId = playerId;
      localStorage.setItem(roomKey, JSON.stringify(roomData));
      // Guest player - no dummy messages
    }
    
    scribbleWebSocket.connect(roomId, playerId, (message) => {
      console.log('Received message:', message);
      
      switch (message.type) {
        case 'draw':
          handleRemoteDrawing(message.data);
          break;
        case 'guess':
          handleRemoteGuess(message.data.guess, message.playerId);
          break;
        case 'score':
          handleRemoteScoreUpdate(message.data.playerId, message.data.score);
          break;
        case 'turn':
          handleRemoteTurnChange(message.data.currentPlayer);
          break;
        case 'word':
          handleRemoteWordUpdate(message.data.word);
          break;
        case 'join':
          handlePlayerJoin(message.data);
          break;
        case 'leave':
          handlePlayerLeave(message.playerId);
          break;
        case 'room_state':
          handleRoomStateUpdate(message.data);
          break;
      }
    });
    
    setIsConnected(true);
    
    return () => {
      scribbleWebSocket.disconnect();
      setIsConnected(false);
      // Clean up room data when leaving
      localStorage.removeItem(roomKey);
    };
  }, [roomId]);

  const addMessage = (content: string, type: 'system' | 'player' | 'guess' | 'correct', playerName?: string) => {
    const message: GameMessage = {
      id: Date.now().toString(),
      type,
      content,
      playerName,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  // Remote message handlers
  const handleRemoteDrawing = (data: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    console.log('Remote drawing received:', { x: data.x, y: data.y, canvasWidth: canvas.width, canvasHeight: canvas.height });
    
    // The coordinates from the drawer are already scaled to canvas dimensions
    // So we can use them directly without additional scaling
    if (data.isStart) {
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    } else if (data.isDrawing) {
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    }
  };

  const handleRemoteGuess = (guess: string, playerId: string) => {
    console.log('Remote guess received:', guess, 'from player:', playerId, 'current word:', currentWord);
    if (isCorrectGuess(guess, currentWord)) {
      console.log('Remote correct guess detected!');
      addMessage(`🎉 ${guess} is correct!`, 'correct', playerId);
      // Update score for the guesser
      setPlayers(prev => {
        const updated = prev.map(p => 
          p.id === playerId ? { ...p, score: p.score + 10 } : p
        );
        console.log('Updated players from remote guess:', updated);
        return updated;
      });
      
      // Add delay to match local behavior
      setTimeout(() => {
        endRound('correct');
      }, 2000);
    } else {
      addMessage(guess, 'guess', playerId);
    }
  };

  const handleRemoteScoreUpdate = (playerId: string, score: number) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, score } : p
    ));
  };

  const handleRemoteTurnChange = (newCurrentPlayer: number) => {
    console.log('Remote turn change received:', newCurrentPlayer);
    setCurrentPlayer(newCurrentPlayer);
    setPlayers(prev => prev.map((player, index) => ({
      ...player,
      isDrawing: index === newCurrentPlayer
    })));
    clearCanvas();
    // Don't set a new word here - the host will send the word via word update
    setTimeLeft(60);
    setGamePhase('drawing');
  };

  const handleRemoteWordUpdate = (word: string) => {
    console.log('Remote word update received:', word);
    setCurrentWord(word);
  };

  const handlePlayerJoin = (data: any) => {
    console.log('Player joined:', data);
    if (data.isHost) {
      // This player is the host (drawer)
      setIsHost(true);
      setPlayers([
        {
          id: myPlayerId,
          name: 'You',
          avatar: '🎨',
          isHost: true,
          score: 0,
          isDrawing: true
        },
        {
          id: 'waiting',
          name: 'Waiting for player...',
          avatar: '👤',
          isHost: false,
          score: 0,
          isDrawing: false
        }
      ]);
      setCurrentPlayer(0);
      addMessage(`🎨 You are the drawer! Draw the word for others to guess.`, 'system');
    } else {
      // This player is the guest (guesser)
      setIsHost(false);
      setPlayers([
        {
          id: data.hostId,
          name: 'Host Player',
          avatar: '🎨',
          isHost: true,
          score: 0,
          isDrawing: true
        },
        {
          id: myPlayerId,
          name: 'You',
          avatar: '👤',
          isHost: false,
          score: 0,
          isDrawing: false
        }
      ]);
      setCurrentPlayer(1);
      // Guest player - no dummy messages
    }
  };

  const handlePlayerLeave = (playerId: string) => {
    addMessage(`👋 Player ${playerId} left the game!`, 'system');
  };

  const handleRoomStateUpdate = (data: any) => {
    console.log('Room state update:', data);
    // Update players list and game state based on room data
    if (data.players) {
      setPlayers(data.players);
    }
    if (data.currentPlayer !== undefined) {
      setCurrentPlayer(data.currentPlayer);
    }
  };

  // Helper function to check if guess is correct (with fuzzy matching)
  const isCorrectGuess = (guess: string, correctWord: string): boolean => {
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedCorrect = correctWord.toLowerCase().trim();
    
    // Exact match
    if (normalizedGuess === normalizedCorrect) return true;
    
    // Common misspellings and variations
    const variations: { [key: string]: string[] } = {
      'robot': ['roboot', 'robbot', 'robt', 'robote'],
      'cat': ['kat', 'catt', 'katt'],
      'dog': ['dogg', 'doge', 'doggy'],
      'house': ['hous', 'hose', 'hause'],
      'tree': ['tre', 'trees', 'trie'],
      'car': ['cars', 'kar', 'karr'],
      'sun': ['sunn', 'son', 'sunny'],
      'moon': ['moom', 'mune', 'moons'],
      'star': ['stars', 'starr', 'ster'],
      'heart': ['hart', 'hearts', 'harte'],
      'flower': ['flour', 'flowers', 'flawer'],
      'pizza': ['piza', 'pizzas', 'piza'],
      'hamburger': ['hamburgers', 'hamburg', 'burger'],
      'ice cream': ['icecream', 'ice-cream', 'icecreams'],
      'cake': ['cakes', 'cak', 'kake'],
      'apple': ['apples', 'aple', 'appel'],
      'banana': ['bananas', 'bananna', 'banan'],
      'elephant': ['elephants', 'elefant', 'elefante'],
      'lion': ['lions', 'lyon', 'lyons']
    };
    
    // Check variations
    if (variations[normalizedCorrect]) {
      return variations[normalizedCorrect].includes(normalizedGuess);
    }
    
    // Check if guess is very similar (Levenshtein distance <= 1 for short words, <= 2 for longer words)
    const maxDistance = normalizedCorrect.length <= 4 ? 1 : 2;
    const distance = levenshteinDistance(normalizedGuess, normalizedCorrect);
    
    return distance <= maxDistance;
  };

  // Simple Levenshtein distance function
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const message = inputMessage.trim().toLowerCase();
    const correctWord = currentWord.toLowerCase();
    setInputMessage('');

    console.log('Checking guess:', message, 'against word:', correctWord, 'myPlayerId:', myPlayerId);

    // Check if guess is correct (with fuzzy matching)
    if (isCorrectGuess(message, correctWord)) {
      console.log('Correct guess detected!');
      console.log('myPlayerId:', myPlayerId, 'players:', players);
      
      // Find the current player (the one guessing)
      const currentPlayerIndex = players.findIndex(p => p.id === myPlayerId);
      console.log('Current player index:', currentPlayerIndex);
      
      if (currentPlayerIndex !== -1) {
        const updatedPlayers = [...players];
        updatedPlayers[currentPlayerIndex].score += 10; // Award 10 points
        setPlayers(updatedPlayers);
        
        console.log('Updated players with score:', updatedPlayers);
        
        // Send score update to other players
        scribbleWebSocket.sendScoreUpdate(myPlayerId, updatedPlayers[currentPlayerIndex].score);
      } else {
        console.error('Could not find current player! myPlayerId:', myPlayerId, 'players:', players);
      }
      
      addMessage(`🎉 Correct! "${currentWord}" was the word! You got 10 points!`, 'correct', 'You');
      
      // End round and switch to next player
      setTimeout(() => {
        console.log('Ending round due to correct guess');
        endRound('correct');
      }, 2000);
    } else {
      // Wrong guess - just add to chat
      scribbleWebSocket.sendGuess(message);
      addMessage(message, 'guess', 'You');
    }
  };

  const endRound = (reason: 'timeout' | 'correct' = 'timeout') => {
    console.log('endRound called with reason:', reason);
    setGamePhase('round-end');
    
    // Only show timeout message if it was actually a timeout
    if (reason === 'timeout') {
      addMessage(`⏰ Time's up! The word was "${currentWord}"`, 'system');
    }
    
    // Switch to next player
    setTimeout(() => {
      setPlayers(prev => {
        const nextPlayer = (currentPlayer + 1) % prev.length;
        console.log('Switching to next player:', nextPlayer, 'current player:', currentPlayer);
        
        // Update player roles
        const updatedPlayers = prev.map((player, index) => ({
          ...player,
          isDrawing: index === nextPlayer
        }));
        
        setCurrentPlayer(nextPlayer);
        const newWord = drawingWords[Math.floor(Math.random() * drawingWords.length)];
        console.log('Setting new word:', newWord);
        setCurrentWord(newWord);
        setTimeLeft(60);
        setGamePhase('drawing');
        clearCanvas();
        addMessage(`🎨 ${updatedPlayers[nextPlayer].name} is now drawing!`, 'system');
        
        // Send turn change and word update to other players
        scribbleWebSocket.sendTurnChange(nextPlayer);
        scribbleWebSocket.sendWordUpdate(newWord);
        
        return updatedPlayers;
      });
    }, 3000);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gamePhase !== 'drawing' || !isHost) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Send drawing data to other players
    scribbleWebSocket.sendDrawing({ x, y, isDrawing: false, isStart: true });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || gamePhase !== 'drawing' || !isHost) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    console.log('Drawing coordinates:', { x, y, scaleX, scaleY, canvasWidth: canvas.width, canvasHeight: canvas.height, rectWidth: rect.width, rectHeight: rect.height });
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Send drawing data to other players
    scribbleWebSocket.sendDrawing({ x, y, isDrawing: true, isStart: false });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    setShowShareModal(false);
    addMessage('🔗 Room link copied to clipboard! Share it with friends to invite them!', 'system');
  };

  const handleQuitGame = () => {
    addMessage('👋 You left the game! Thanks for playing!', 'system');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: #9ca3af #e5e7eb;
          }
          .scrollbar-thin::-webkit-scrollbar {
            width: 12px;
            height: 12px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: #e5e7eb;
            border-radius: 6px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #9ca3af;
            border-radius: 6px;
            border: 2px solid #e5e7eb;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
          .scrollbar-thin::-webkit-scrollbar-corner {
            background: #e5e7eb;
          }
        `}
      </style>
      <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Palette className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Scribble Game</h2>
                  <p className="text-pink-100">Room: {roomId} • {players.length} player(s)</p>
                </div>
              </div>
                             <div className="flex items-center space-x-3">
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => setShowShareModal(true)}
                   className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                 >
                   <Share2 className="w-4 h-4" />
                   <span>Share</span>
                 </motion.button>
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleQuitGame}
                   className="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                 >
                   <LogOut className="w-4 h-4" />
                   <span>Quit Game</span>
                 </motion.button>
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={onClose}
                   className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                 >
                   <X className="w-5 h-5" />
                 </motion.button>
               </div>
            </div>
          </div>

          <div className="flex flex-1 min-h-0">
                         {/* Left Side - Game Info */}
             <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              <div className="p-4">
              {/* Current Word (only for drawer) */}
              {isHost && (
                <div className="mb-2">
                  <h3 className="text-xs font-semibold text-gray-800 mb-1 flex items-center">
                    🎯 Draw This Word
                  </h3>
                  <div className="bg-white border-2 border-dashed border-purple-300 rounded-lg p-1 text-center">
                    <div className="text-sm font-bold text-purple-600 mb-1">{currentWord.toUpperCase()}</div>
                    <div className="text-xs text-gray-500">Draw this for others to guess!</div>
                  </div>
                </div>
              )}

              {/* Guesser Instructions (only for guesser) */}
              {!isHost && (
                <div className="mb-2">
                  <h3 className="text-xs font-semibold text-gray-800 mb-1 flex items-center">
                    🎯 Guess the Drawing
                  </h3>
                  <div className="bg-white border-2 border-dashed border-green-300 rounded-lg p-1 text-center">
                    <p className="text-gray-600 text-xs">
                      Look at the drawing and guess what it is!
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Type your guess in the chat below
                    </p>
                  </div>
                </div>
              )}

              {/* Timer */}
              <div className="mb-2">
                <h3 className="text-xs font-semibold text-gray-800 mb-1 flex items-center">
                  <Timer className="w-3 h-3 mr-1" />
                  Time Left
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-1 text-center">
                  <div className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
                    {timeLeft}s
                  </div>
                </div>
              </div>

              {/* Game State */}
              <div className="mb-2">
                <h3 className="text-xs font-semibold text-gray-800 mb-1">🎮 Game State</h3>
                <div className="space-y-1">
                  <div className="bg-white border border-gray-200 rounded-lg p-1 text-center">
                    <div className="text-xs text-gray-500">Current Drawer</div>
                    <div className="text-xs font-semibold text-gray-800">{players[currentPlayer]?.name || 'You'}</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-1 text-center">
                    <div className="text-xs text-gray-500">Phase</div>
                    <div className="text-xs font-semibold text-gray-800 capitalize">{gamePhase}</div>
                  </div>
                </div>
              </div>

              {/* Players & Scores */}
              <div className="mb-2">
                <h3 className="text-xs font-semibold text-gray-800 mb-1">🏆 Players & Scores</h3>
                <div className="space-y-1">
                  {players.map((player, index) => (
                    <div key={player.id} className={`bg-white border rounded-lg p-1 flex items-center justify-between ${
                      index === currentPlayer ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs">{player.avatar}</span>
                        <span className="text-xs font-medium text-gray-800">{player.name}</span>
                        {index === currentPlayer && <span className="text-xs bg-purple-100 text-purple-600 px-1 py-0.5 rounded">Drawing</span>}
                      </div>
                      <span className="text-xs font-bold text-purple-600">{player.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawing Tools */}
              {isHost && (
                <div className="mb-2">
                  <button 
                    onClick={clearCanvas}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-lg flex items-center justify-center space-x-1 transition-colors text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Canvas</span>
                  </button>
                </div>
              )}


              </div>
            </div>

            {/* Right Side - Fully Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              <div className="p-6 pb-12 space-y-6">
                {/* Drawing Canvas */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="border border-gray-300 rounded cursor-crosshair"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%',
                      width: '600px',
                      height: '400px'
                    }}
                  />
                </div>

                {/* Simple Guessing Section - Always Visible */}
                <div className="border-t-2 border-purple-300 p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-purple-800 mb-3">💬 Type Your Guess</h3>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={isHost ? "You're drawing..." : "Type your guess..."}
                      disabled={isHost}
                      className={`flex-1 border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                        isHost
                          ? "border-gray-300 bg-gray-100 cursor-not-allowed focus:ring-gray-400" 
                          : "border-purple-300 bg-white focus:ring-purple-500"
                      }`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isHost}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isHost
                          ? "bg-gray-400"
                          : "bg-purple-500 hover:bg-purple-600"
                      } text-white`}
                    >
                      <Send className="w-4 h-4" />
                      <span>{isHost ? "Drawing" : "Guess"}</span>
                    </motion.button>
                  </div>
                  
                  {/* Simple Status Messages */}
                  {messages.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {messages.slice(-3).map((message) => (
                        <div key={message.id} className={`text-sm p-2 rounded ${
                          message.type === 'correct' 
                            ? 'bg-green-100 text-green-800' 
                            : message.type === 'guess'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {message.type === 'correct' ? '🎉 Correct!' : message.content}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Scroll Indicator */}
                  <div className="text-center mt-3 text-xs text-purple-600">
                    <div className="animate-bounce">↓ Scroll up to see canvas ↑</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Share Room</h3>
                <p className="text-gray-600 mb-6">
                  Share this link with friends to invite them to your Scribble game!
                </p>
                
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
                  <p className="text-gray-800 font-mono text-sm break-all">
                    {window.location.origin}/room/{roomId}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyRoomLink}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShareModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
    </>
  );
};

export default ScribbleModal;
