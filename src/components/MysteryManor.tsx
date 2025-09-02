import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createManorEngine, GameResponse, ManorRoom, ManorPuzzle, ManorItem, ManorNPC } from '../services/mysteryManorEngine';

interface MysteryManorProps {
  onBack: () => void;
}

const MysteryManor: React.FC<MysteryManorProps> = ({ onBack }) => {
  const [manorEngine] = useState(() => createManorEngine());
  const [gameState, setGameState] = useState<GameResponse | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    sender: 'player' | 'manor' | 'system';
    timestamp: Date;
  }>>([]);
  const [fearLevel, setFearLevel] = useState(1);
  const [sanity, setSanity] = useState(100);
  const [currentRoom, setCurrentRoom] = useState<ManorRoom | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showPuzzles, setShowPuzzles] = useState(false);
  const [showNPCs, setShowNPCs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the game
    initializeGame();
  }, []);

  useEffect(() => {
    // Force scroll to bottom when messages change
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    // Also scroll immediately
    scrollToBottom();
    
    return () => clearTimeout(timer);
  }, [messages]);

  const scrollToBottom = () => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      // Also try to scroll the window if needed
      window.scrollTo(0, document.body.scrollHeight);
    }
  };

  const scrollToTop = () => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = 0;
      // Also try to scroll the window if needed
      window.scrollTo(0, 0);
    }
  };

  const initializeGame = async () => {
    // Get initial state and enhance it with book-reading actions
    const initialState = manorEngine.getGameState();
    
    // Add the new book-reading actions to the initial state
    const enhancedState = {
      ...initialState,
      availableActions: [
        ...initialState.availableActions,
        'read The Shining',
        'read The Haunting of Hill House',
        'examine bookshelves',
        'search for hidden items'
      ]
    };
    
    setGameState(enhancedState);
    setCurrentRoom(manorEngine.currentRoom);
    setFearLevel(initialState.fearLevel);
    setSanity(initialState.sanity);

    // Add welcome message with book hints
    const welcomeMessage = {
      id: 'welcome',
      text: `🏚️ Welcome to Blackwood Manor...\n\nYou find yourself standing in the grand foyer of this ancient mansion. The air is thick with dust and something else... something that makes your skin crawl.\n\nPortraits of stern ancestors watch your every move from the walls, and you can't shake the feeling that their eyes are following you.\n\n📚 You notice several classic horror novels on the bookshelves. Reading them might unlock supernatural abilities and reveal the manor's secrets!\n\nWhat would you like to do?`,
      sender: 'manor' as const,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !gameState) return;

    const playerMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'player' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, playerMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Process the action through the manor engine
      const response = await manorEngine.processAction(inputText);
      setGameState(response);
      setCurrentRoom(manorEngine.currentRoom);
      setFearLevel(response.fearLevel);
      setSanity(response.sanity);

      // Add manor response
      const manorMessage = {
        id: (Date.now() + 1).toString(),
        text: response.narrative,
        sender: 'manor' as const,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, manorMessage]);

      // Check for game over
      if (response.isGameOver) {
        const gameOverMessage = {
          id: (Date.now() + 2).toString(),
          text: `💀 GAME OVER\n\n${response.ending || 'You have met a terrible fate in Blackwood Manor.'}`,
          sender: 'system' as const,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, gameOverMessage]);
      }

    } catch (error) {
      console.error('Error processing action:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Something went wrong. The mansion seems to be playing tricks on you.',
        sender: 'system' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    
         // Keyboard shortcuts for scrolling
     if (e.key === 'Home') {
       e.preventDefault();
       scrollToTop();
     }
     
     if (e.key === 'End') {
       e.preventDefault();
       scrollToBottom();
     }
  };

  const handleQuickAction = async (action: string) => {
    if (!gameState) return;

    // Set the input text to show what action was taken
    setInputText(action);

    // Create player message
    const playerMessage = {
      id: Date.now().toString(),
      text: action,
      sender: 'player' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, playerMessage]);
    setIsTyping(true);

    try {
      // Process the action through the manor engine
      const response = await manorEngine.processAction(action);
      setGameState(response);
      setCurrentRoom(manorEngine.currentRoom);
      setFearLevel(response.fearLevel);
      setSanity(response.sanity);

      // Add manor response
      const manorMessage = {
        id: (Date.now() + 1).toString(),
        text: response.narrative,
        sender: 'manor' as const,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, manorMessage]);

      // Check for game over
      if (response.isGameOver) {
        const gameOverMessage = {
          id: (Date.now() + 2).toString(),
          text: `💀 GAME OVER\n\n${response.ending || 'You have met a terrible fate in Blackwood Manor.'}`,
          sender: 'system' as const,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, gameOverMessage]);
      }

    } catch (error) {
      console.error('Error processing action:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Something went wrong. The mansion seems to be playing tricks on you.',
        sender: 'system' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getFearColor = (level: number) => {
    if (level <= 3) return 'text-green-400';
    if (level <= 6) return 'text-yellow-400';
    if (level <= 8) return 'text-orange-400';
    return 'text-red-500';
  };

  const getSanityColor = (level: number) => {
    if (level >= 70) return 'text-green-400';
    if (level >= 40) return 'text-yellow-400';
    if (level >= 20) return 'text-orange-400';
    return 'text-red-500';
  };

  const getAtmosphereStyle = (atmosphere: string) => {
    switch (atmosphere) {
      case 'mysterious':
        return 'bg-blue-900/20 border-blue-500/30';
      case 'eerie':
        return 'bg-purple-900/20 border-purple-500/30';
      case 'terrifying':
        return 'bg-red-900/20 border-red-500/30';
      case 'nightmarish':
        return 'bg-black/40 border-red-600/50';
      default:
        return 'bg-gray-900/20 border-gray-500/30';
    }
  };

  if (!gameState || !currentRoom) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Loading Blackwood Manor...</div>
      </div>
    );
  }

  return (
         <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white text-gray-800">
             {/* Header */}
       <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center space-x-4">
                     <button
             onClick={onBack}
             className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg transition-colors hover:bg-gray-50 hover:border-gray-400"
           >
             ← Back to Games
           </button>
           <h1 className="text-2xl font-bold text-gray-800">🏚️ Blackwood Manor</h1>
        </div>
        
                 {/* Status Bars */}
         <div className="flex items-center space-x-6">
           <div className="flex items-center space-x-2">
             <span className="text-sm text-gray-600">😰 Fear:</span>
             <div className="w-20 bg-gray-200 rounded-full h-2">
               <div 
                 className={`h-2 rounded-full transition-all ${getFearColor(fearLevel)}`}
                 style={{ width: `${(fearLevel / 10) * 100}%` }}
               ></div>
             </div>
             <span className={`text-sm ${getFearColor(fearLevel)}`}>{fearLevel}/10</span>
           </div>
           
           <div className="flex items-center space-x-2">
             <span className="text-sm text-gray-600">🧠 Sanity:</span>
             <div className="w-20 bg-gray-200 rounded-full h-2">
               <div 
                 className={`h-2 rounded-full transition-all ${getSanityColor(sanity)}`}
                 style={{ width: `${sanity}%` }}
               ></div>
             </div>
             <span className={`text-sm ${getSanityColor(sanity)}`}>{sanity}%</span>
           </div>
         </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
                     {/* Current Room Info */}
           <div className="p-6 border-b border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
                             <div>
                 <h2 className="text-xl font-bold text-gray-800">{currentRoom.name}</h2>
                 <p className="text-gray-600">{currentRoom.description}</p>
               </div>
              
                             <div className="flex space-x-2">
                 <button
                   onClick={() => setShowInventory(!showInventory)}
                   className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                 >
                   📦 Inventory ({gameState.items.length})
                 </button>
                 <button
                   onClick={() => setShowPuzzles(!showPuzzles)}
                   className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                 >
                   🧩 Puzzles ({gameState.puzzles.length})
                 </button>
                 <button
                   onClick={() => setShowNPCs(!showNPCs)}
                   className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                 >
                   👥 NPCs ({gameState.npcs.length})
                 </button>
               </div>
            </div>
          </div>

                     {/* Chat Messages */}
                                                                                               <div 
                className="flex-1 overflow-y-auto p-6 space-y-4 relative bg-gray-50"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6',
                  maxHeight: 'calc(100vh - 350px)',
                  minHeight: '350px'
                }}
                id="messages-container"
              >
                                          {/* Scroll to Top Button */}
               <button
                 onClick={scrollToTop}
                 className="absolute top-4 right-4 z-10 p-3 bg-white border border-gray-300 text-gray-600 rounded-full transition-colors shadow-sm hover:bg-gray-50 hover:border-gray-400"
                 title="Scroll to top (Home key)"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                 </svg>
               </button>
               
               {/* Scroll to Bottom Button */}
               <button
                 onClick={scrollToBottom}
                 className="absolute bottom-4 right-4 z-10 p-3 bg-white border border-gray-300 text-gray-600 rounded-full transition-colors shadow-sm hover:bg-gray-50 hover:border-gray-400"
                 title="Scroll to bottom (End key)"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l7 7m-7-7v18" />
                 </svg>
               </button>
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                                     className={`p-4 rounded-xl shadow-sm ${
                     message.sender === 'player'
                       ? 'bg-white border border-gray-200 ml-8'
                       : message.sender === 'manor'
                       ? 'bg-gray-50 border border-gray-200 mr-8'
                       : 'bg-red-50 border border-red-200 mx-auto text-center'
                   }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>
                                     <div className="text-xs text-gray-500 mt-2">
                     {message.timestamp.toLocaleTimeString()}
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
                         {isTyping && (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="bg-gray-50 border border-gray-200 rounded-xl p-4 mr-8 shadow-sm"
               >
                 <div className="flex items-center space-x-2">
                   <div className="text-purple-500">🏚️</div>
                   <div className="text-gray-600">The mansion is responding...</div>
                 </div>
               </motion.div>
             )}
            
                         <div ref={messagesEndRef} />
             
                           {/* Quick Access to Unlock New Powers */}
              <div className="text-center text-sm text-gray-600 mt-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                📚 <strong>Quick Access:</strong> Scroll down below the input field to see "Unlock New Powers" buttons!
                <br />
                <span className="text-purple-600 mt-2 block">💡 <strong>Tip:</strong> The scroll buttons on the right will help you navigate!</span>
              </div>
           </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200 bg-white shadow-sm">
            <div className="flex space-x-2">
                             <input
                 type="text"
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 onKeyPress={handleKeyPress}
                 placeholder="What would you like to do? (e.g., 'examine portrait', 'move to library', 'talk to librarian')"
                 className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                 disabled={gameState.isGameOver}
               />
               <button
                 onClick={sendMessage}
                 disabled={!inputText.trim() || gameState.isGameOver}
                 className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg transition-all duration-200 hover:from-purple-600 hover:to-blue-600 hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500"
               >
                 Send
               </button>
            </div>
            
                                                  {/* Book Reading Quick Actions */}
             <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl shadow-sm">
               <div className="text-sm text-gray-800 mb-3 font-semibold">📚 <strong>Unlock New Powers:</strong></div>
               <div className="flex flex-wrap gap-2">
                 <button
                   onClick={() => handleQuickAction('read The Shining')}
                   className="px-3 py-2 bg-white border border-red-300 text-red-700 rounded-lg text-sm transition-colors hover:bg-red-50 hover:border-red-400 shadow-sm"
                 >
                   🔥 Read The Shining
                 </button>
                 <button
                   onClick={() => handleQuickAction('read The Haunting of Hill House')}
                   className="px-3 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg text-sm transition-colors hover:bg-blue-50 hover:border-blue-400 shadow-sm"
                 >
                   👻 Read Hill House
                 </button>
                 <button
                   onClick={() => handleQuickAction('examine bookshelves')}
                   className="px-3 py-2 bg-white border border-green-300 text-green-700 rounded-lg text-sm transition-colors hover:bg-green-50 hover:border-green-400 shadow-sm"
                 >
                   📖 Examine Books
                 </button>
               </div>
             </div>

                         {/* Regular Quick Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {gameState.availableActions.slice(0, 6).map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm transition-colors hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                  >
                    {action}
                  </button>
                ))}
              </div>
          </div>
        </div>

                 {/* Side Panel */}
         <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto shadow-sm" style={{ height: 'calc(100vh - 100px)' }}>
          {/* Room Details */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">📍 Current Room</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Atmosphere:</span>
                <span className="ml-2 text-gray-700 capitalize">{currentRoom.atmosphere}</span>
              </div>
              <div>
                <span className="text-gray-500">Horror Level:</span>
                <span className={`ml-2 ${getFearColor(currentRoom.horrorLevel)}`}>
                  {currentRoom.horrorLevel}/10
                </span>
              </div>
              <div>
                <span className="text-gray-500">Time:</span>
                <span className="ml-2 text-gray-700">{currentRoom.timeOfDay}</span>
              </div>
            </div>
          </div>

          {/* Ambient Sounds */}
          {gameState.ambientSounds.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-2">🔊 Ambient Sounds</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {gameState.ambientSounds.map((sound, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-purple-500">♪</span>
                    <span>{sound}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Effects */}
          {gameState.visualEffects.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-2">👁️ Visual Effects</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {gameState.visualEffects.map((effect, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-purple-500">✨</span>
                    <span>{effect}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

                     {/* Player Abilities & Progress */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">⚡ Your Abilities</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Story Progress:</span>
                <span className="ml-2 text-gray-700">{manorEngine.playerState.storyProgress}/10</span>
              </div>
              <div>
                <span className="text-gray-500">Supernatural Awareness:</span>
                <span className="ml-2 text-gray-700">{manorEngine.playerState.supernaturalAwareness}/10</span>
              </div>
              <div>
                <span className="text-gray-500">Books Read:</span>
                <span className="ml-2 text-gray-700">{manorEngine.playerState.bookKnowledge.length}/6</span>
              </div>
              {manorEngine.playerState.bookKnowledge.length > 0 && (
                <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
                  <span className="text-gray-600 text-xs">📚 Knowledge:</span>
                  <div className="text-xs text-gray-700 mt-1">
                    {manorEngine.playerState.bookKnowledge.map(book => (
                      <div key={book} className="capitalize">• {book.replace('_', ' ')}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

                     {/* Available Actions */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">🎯 Available Actions</h3>
              <div className="space-y-2">
                {gameState.availableActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="w-full text-left px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm transition-colors hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Scroll Indicator for Sidebar */}
            <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-200">
              🔍 Sidebar scrollable - Use mouse wheel to see more content
            </div>
        </div>
      </div>

      {/* Modals */}
      {showInventory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-purple-300 mb-4">📦 Inventory</h3>
            {gameState.items.length > 0 ? (
              <div className="space-y-2">
                {gameState.items.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-700 rounded border border-gray-600">
                    <div className="font-semibold text-purple-300">{item.name}</div>
                    <div className="text-sm text-gray-300">{item.description}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Type: {item.type} | Rarity: {item.rarity}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-4">Your inventory is empty.</div>
            )}
            <button
              onClick={() => setShowInventory(false)}
              className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showPuzzles && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-purple-300 mb-4">🧩 Active Puzzles</h3>
            {gameState.puzzles.length > 0 ? (
              <div className="space-y-3">
                {gameState.puzzles.map((puzzle) => (
                  <div key={puzzle.id} className="p-3 bg-gray-700 rounded border border-gray-600">
                    <div className="font-semibold text-green-300">{puzzle.name}</div>
                    <div className="text-sm text-gray-300">{puzzle.description}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Type: {puzzle.type} | Difficulty: {puzzle.difficulty}/10
                    </div>
                    {puzzle.clues.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-yellow-400">Clues:</div>
                        <ul className="text-xs text-gray-300 ml-4">
                          {puzzle.clues.map((clue, index) => (
                            <li key={index}>• {clue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-4">No active puzzles in this room.</div>
            )}
            <button
              onClick={() => setShowPuzzles(false)}
              className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showNPCs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-purple-300 mb-4">👥 NPCs</h3>
            {gameState.npcs.length > 0 ? (
              <div className="space-y-3">
                {gameState.npcs.map((npc) => (
                  <div key={npc.id} className="p-3 bg-gray-700 rounded border border-gray-600">
                    <div className="font-semibold text-yellow-300">{npc.name}</div>
                    <div className="text-sm text-gray-300">{npc.role}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Mood: {npc.currentMood} | Fear Factor: {npc.fearFactor}/10
                    </div>
                    {npc.isGhost && (
                      <div className="text-xs text-purple-400 mt-1">👻 Ghost</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-4">No NPCs in this room.</div>
            )}
            <button
              onClick={() => setShowNPCs(false)}
              className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MysteryManor;
