import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Share2, 
  Users, 
  Crown,
  Sword,
  X,
  Play,
  MessageCircle,
  Send,
  LogOut
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  health: number;
  score: number;
}

interface StoryMessage {
  id: string;
  type: 'system' | 'player' | 'ai';
  content: string;
  playerName?: string;
  timestamp: Date;
}

interface StoryBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom?: (roomId: string) => void;
}

const StoryBattleModal: React.FC<StoryBattleModalProps> = ({ isOpen, onClose, onJoinRoom }) => {
  const [roomId] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [players, setPlayers] = useState<Player[]>([
    {
      id: '1',
      name: 'You',
      avatar: '🧙‍♂️',
      isHost: true,
      health: 100,
      score: 0
    }
  ]);
  const [messages, setMessages] = useState<StoryMessage[]>([
    {
      id: '1',
      type: 'system',
      content: '🎉 **AI Story Battle Started!** Welcome to the most revolutionary multiplayer story game ever created!',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'system',
      content: '**How it works:**\n• **Build Together**: Players take turns adding to an epic story\n• **Battle System**: Challenge other players\' contributions and rewrite them\n• **AI Judge**: The AI evaluates battles and decides the winner\n• **Power-ups**: Use special abilities like Plot Twist, Character Development, Cliffhanger\n• **Voting**: Players vote on story directions',
      timestamp: new Date()
    },
    {
      id: '3',
      type: 'system',
      content: `**Current Players:** ${players.map(p => p.name).join(', ')}\n**Story Phase:** Building\n**Turn:** 0\n\nLet's create an amazing story together! Type your contribution or use a power-up!`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentStory, setCurrentStory] = useState('Once upon a time, in a world where stories come alive...');
  const [gamePhase, setGamePhase] = useState('Building');
  const [currentTurn, setCurrentTurn] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const addMessage = (content: string, type: 'system' | 'player' | 'ai', playerName?: string) => {
    const message: StoryMessage = {
      id: Date.now().toString(),
      type,
      content,
      playerName,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const message = inputMessage.trim();
    setInputMessage('');

    // Add player message
    addMessage(message, 'player', 'You');

    // Update story if it's a story contribution
    if (gamePhase === 'Building' && !message.startsWith('/')) {
      setCurrentStory(prev => prev + ' ' + message);
      setCurrentTurn(prev => prev + 1);
    }

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "🌟 **Amazing contribution!** The story grows more epic with each word...",
        "⚔️ **Plot Twist Activated!** The narrative takes an unexpected turn...",
        "🎭 **Character Development!** Your characters become more complex and interesting...",
        "🔥 **Cliffhanger!** The tension builds as the story reaches a critical moment...",
        "👑 **AI Judge Decision:** That was an excellent addition to our collaborative tale!",
        "🎲 **Random Event:** A mysterious figure appears in the story, what happens next?",
        "✨ **Power-up Used:** The story gains magical properties and becomes more engaging!"
      ];
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      addMessage(randomResponse, 'ai');
    }, 1000 + Math.random() * 2000);
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    setShowShareModal(false);
    addMessage('🔗 Room link copied to clipboard! Share it with friends to invite them!', 'system');
  };

  const handleJoinRoom = () => {
    if (onJoinRoom) {
      onJoinRoom(roomId);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
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
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sword className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Story Battle</h2>
                  <p className="text-purple-100">Room: {roomId} • {players.length} player(s)</p>
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
                  onClick={onClose}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex h-[600px]">
            {/* Left Side - Game Info */}
            <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
              {/* Current Story */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  📖 Current Story
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                  {currentStory}
                </div>
              </div>

              {/* Game State */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🎮 Game State</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Current Player</div>
                    <div className="font-semibold text-gray-800">Player 1</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Phase</div>
                    <div className="font-semibold text-gray-800">{gamePhase}</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Turn</div>
                    <div className="font-semibold text-gray-800">{currentTurn}</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Players</div>
                    <div className="font-semibold text-gray-800">{players.length}/4</div>
                  </div>
                </div>
              </div>

              {/* Power-ups */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">⚡ Power-ups</h3>
                <div className="space-y-2">
                  <button className="w-full bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded-lg p-3 flex items-center justify-between transition-colors">
                    <span className="text-sm font-medium text-yellow-800">🔄 Plot Twist</span>
                    <span className="text-xs text-yellow-600">(2)</span>
                  </button>
                  <button className="w-full bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg p-3 flex items-center justify-between transition-colors">
                    <span className="text-sm font-medium text-blue-800">👤 Character Dev</span>
                    <span className="text-xs text-blue-600">(2)</span>
                  </button>
                  <button className="w-full bg-pink-100 hover:bg-pink-200 border border-pink-300 rounded-lg p-3 flex items-center justify-between transition-colors">
                    <span className="text-sm font-medium text-pink-800">🚩 Cliffhanger</span>
                    <span className="text-xs text-pink-600">(1)</span>
                  </button>
                  <button className="w-full bg-red-100 hover:bg-red-200 border border-red-300 rounded-lg p-3 flex items-center justify-between transition-colors">
                    <span className="text-sm font-medium text-red-800">⚔️ Battle</span>
                    <span className="text-xs text-red-600">(3)</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                  <span>✏️</span>
                  <span>Add to Story</span>
                </button>
                <button className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                  <span>📊</span>
                  <span>Vote</span>
                </button>
                <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                  <span>⏹️</span>
                  <span>Quit Game</span>
                </button>
              </div>
            </div>

            {/* Right Side - Chat */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'player' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-lg ${
                      message.type === 'system' 
                        ? 'bg-blue-50 border border-blue-200' 
                        : message.type === 'ai'
                        ? 'bg-purple-50 border border-purple-200'
                        : 'bg-blue-500 text-white'
                    }`}>
                      <div className="text-sm font-medium mb-1">
                        {message.type === 'system' ? '⚡ System' :
                         message.type === 'ai' ? '🤖 AI Judge' :
                         message.playerName}
                      </div>
                      <div className={`text-sm ${
                        message.type === 'player' ? 'text-white' : 'text-gray-700'
                      }`}>
                        {message.content.split('\n').map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      </div>
                      <div className={`text-xs mt-2 ${
                        message.type === 'player' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your contribution or use a power-up..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </motion.button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Playing ai-story-battle. Type commands or use the game interface above!
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
                  Share this link with friends to invite them to your AI Story Battle!
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
  );
};

export default StoryBattleModal;
