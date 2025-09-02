import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Lightbulb, 
  Trophy, 
  Timer, 
    Zap,
  Puzzle,
  Send,
  RefreshCw,
  Target,
  TrendingUp,
  Award,
  Sparkles,
  Eye
} from 'lucide-react';

interface BrainTeaser {
  id: string;
  type: 'riddle' | 'logic' | 'math' | 'word' | 'joke' | 'pattern' | 'lateral';
  question: string;
  answer: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  explanation?: string;
  timeLimit?: number;
}

interface GameState {
  currentTeaser: BrainTeaser | null;
  score: number;
  streak: number;
  totalSolved: number;
  hintsUsed: number;
  timeRemaining: number;
  isGameActive: boolean;
  showHint: boolean;
  userAnswer: string;
  feedback: string;
  feedbackType: 'correct' | 'incorrect' | 'hint' | 'timeout' | 'revealed';
}

const BrainTeaser: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentTeaser: null,
    score: 0,
    streak: 0,
    totalSolved: 0,
    hintsUsed: 0,
    timeRemaining: 0,
    isGameActive: false,
    showHint: false,
    userAnswer: '',
    feedback: '',
    feedbackType: 'correct'
  });

  const [gameMode, setGameMode] = useState<'casual' | 'timed' | 'challenge'>('casual');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['riddle', 'logic', 'math', 'word', 'joke']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [showStats, setShowStats] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{name: string, score: number, date: string}[]>([]);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // AI-Generated Brain Teaser Database (this would normally come from an API)
  const generateUniqueTeaser = (): BrainTeaser => {
    const teaserTypes = selectedCategories;
    const type = teaserTypes[Math.floor(Math.random() * teaserTypes.length)];
    
    // Generate unique content based on type and difficulty
    const teaser = generateTeaserByType(type, difficulty);
    
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: type as any,
      question: teaser.question,
      answer: teaser.answer,
      hint: teaser.hint,
      difficulty,
      category: type,
             explanation: (teaser as any).explanation,
      timeLimit: gameMode === 'timed' ? 60 : gameMode === 'challenge' ? 30 : undefined
    };
  };

  const generateTeaserByType = (type: string, difficulty: string) => {
    const baseTeasers = {
      riddle: {
        easy: [
          { question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", answer: "echo", hint: "Think about what repeats what you say" },
          { question: "What has keys, but no locks; space, but no room; and you can enter, but not go in?", answer: "keyboard", hint: "You use this to type" }
        ],
        medium: [
          { question: "A man is found dead in a room with 53 bicycles. How did he die?", answer: "he was playing cards", hint: "The bicycles are not real bicycles", explanation: "The 'bicycles' are actually playing cards. In some card games, a 'bicycle' refers to a specific card pattern." },
          { question: "What word becomes shorter when you add two letters to it?", answer: "short", hint: "Think about the word itself" }
        ],
        hard: [
          { question: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?", answer: "fire", hint: "I can be started with a spark", explanation: "Fire grows when it spreads, needs oxygen to burn, and is extinguished by water." }
        ]
      },
      logic: {
        easy: [
          { question: "If you have 3 apples and you take away 2, how many do you have?", answer: "2", hint: "Think about what you're taking away", explanation: "You have 2 apples because you took away 2 from the 3 you originally had." },
          { question: "A farmer has 17 sheep, and all but 9 die. How many are left?", answer: "9", hint: "Read carefully - 'all but 9 die' means 9 survive" }
        ],
        medium: [
          { question: "You are in a room with 2 doors. One leads to certain death, the other to freedom. There are two guards, one always lies, one always tells the truth. You can ask one guard one question. What do you ask?", answer: "what would the other guard say is the door to freedom", hint: "Think about how to get both guards to point to the same wrong door", explanation: "If you ask either guard what the other would say, they'll both point to the wrong door, so you choose the opposite." }
        ],
        hard: [
          { question: "Three gods A, B, and C are called Truth, Lie, and Random in some order. Truth always tells the truth, Lie always lies, and Random either tells the truth or lies. You can ask three yes/no questions, each directed to one god. What questions do you ask to determine which is which?", answer: "ask a if b is random, ask b if c is random, ask c if a is random", hint: "This is extremely complex - you need to eliminate possibilities systematically", explanation: "This is a famous logic puzzle that requires careful elimination of possibilities through strategic questioning." }
        ]
      },
      math: {
        easy: [
          { question: "What is the next number in the sequence: 2, 4, 8, 16, __?", answer: "32", hint: "Each number is multiplied by 2", explanation: "The pattern is 2×2=4, 4×2=8, 8×2=16, so 16×2=32." },
          { question: "If 5 + 3 = 28, 9 + 1 = 810, 8 + 6 = 214, then 7 + 3 = ?", answer: "410", hint: "Look at the pattern of the results", explanation: "The result combines (a-b) and (a+b). So 7-3=4 and 7+3=10, making 410." }
        ],
        medium: [
          { question: "A clock shows 11:50. What is the smaller angle between the hour and minute hands?", answer: "125", hint: "Calculate the angle of each hand separately", explanation: "Hour hand: 11 + (50/60) = 11.83 hours × 30° = 355°. Minute hand: 50 × 6° = 300°. Difference: 355° - 300° = 55°. Smaller angle: 360° - 55° = 305°, but since we want the smaller angle, it's 55°." }
        ],
        hard: [
          { question: "In a group of 100 people, 70 speak English, 45 speak French, and 23 speak both. How many speak neither language?", answer: "8", hint: "Use the principle of inclusion-exclusion", explanation: "Total = English + French - Both + Neither. 100 = 70 + 45 - 23 + Neither. Neither = 100 - 70 - 45 + 23 = 8." }
        ]
      },
      word: {
        easy: [
          { question: "What word can be placed before 'light', 'break', and 'time' to make three new words?", answer: "day", hint: "Think about parts of the day", explanation: "daylight, daybreak, daytime" },
          { question: "What 5-letter word becomes shorter when you add two letters to it?", answer: "short", hint: "The word describes itself" }
        ],
        medium: [
          { question: "What word in the English language has three consecutive double letters?", answer: "bookkeeper", hint: "Think about words with repeated letters", explanation: "bookkeeper has 'oo', 'kk', and 'ee' consecutively." },
          { question: "What word can be written forward, backward, or upside down and still be read from left to right?", answer: "noon", hint: "Think about symmetry", explanation: "noon reads the same forward, backward, and upside down." }
        ],
        hard: [
          { question: "What is the only English word that ends in 'mt'?", answer: "dreamt", hint: "It's a past tense form", explanation: "dreamt is the British past tense of dream, and it's the only English word ending in 'mt'." }
        ]
      },
      joke: {
        easy: [
          { question: "Why don't scientists trust atoms?", answer: "because they make up everything", hint: "Think about what atoms are made of", explanation: "It's a pun on 'make up' meaning both 'compose' and 'lie'." },
          { question: "What do you call a fake noodle?", answer: "an impasta", hint: "Think about pasta and imposters", explanation: "A pun combining 'imposter' and 'pasta'." }
        ],
        medium: [
          { question: "Why did the scarecrow win an award?", answer: "he was outstanding in his field", hint: "Think about where scarecrows are placed", explanation: "A pun on 'outstanding' meaning both 'excellent' and 'standing in a field'." }
        ],
        hard: [
          { question: "What do you call a bear with no teeth?", answer: "a gummy bear", hint: "Think about what bears without teeth can't do", explanation: "A pun on 'gummy' meaning both 'toothless' and the candy 'gummy bear'." }
        ]
      }
    };

    const difficultyLevel = difficulty as keyof typeof baseTeasers.riddle;
    const typeTeasers = baseTeasers[type as keyof typeof baseTeasers];
    
    if (typeTeasers && typeTeasers[difficultyLevel]) {
      const teasers = typeTeasers[difficultyLevel];
      return teasers[Math.floor(Math.random() * teasers.length)];
    }
    
    // Fallback teaser
    return {
      question: "What has keys, but no locks; space, but no room; and you can enter, but not go in?",
      answer: "keyboard",
      hint: "You use this to type",
      explanation: "A keyboard has keys but no locks, space bar but no room, and you can enter text but not physically go inside it."
    };
  };

  const startNewGame = () => {
    const newTeaser = generateUniqueTeaser();
    const timeLimit = newTeaser.timeLimit || 0;
    
    setGameState(prev => ({
      ...prev,
      currentTeaser: newTeaser,
      isGameActive: true,
      timeRemaining: timeLimit,
      showHint: false,
      userAnswer: '',
      feedback: '',
      feedbackType: 'correct'
    }));

    if (timeLimit > 0) {
      startTimer(timeLimit);
    }
  };

  const startTimer = (_seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timerRef.current!);
          return {
            ...prev,
            timeRemaining: 0,
            isGameActive: false,
            feedback: 'Time\'s up!',
            feedbackType: 'timeout'
          };
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);
  };

  const handleSubmitAnswer = () => {
    if (!gameState.currentTeaser || !gameState.userAnswer.trim()) return;

    const isCorrect = gameState.userAnswer.trim().toLowerCase() === 
                     gameState.currentTeaser.answer.toLowerCase();
    
    if (isCorrect) {
      const points = calculatePoints();
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        streak: prev.streak + 1,
        totalSolved: prev.totalSolved + 1,
        feedback: `Correct! +${points} points!`,
        feedbackType: 'correct',
        isGameActive: false
      }));
      
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setGameState(prev => ({
        ...prev,
        streak: 0,
        feedback: 'Incorrect! Try again or use a hint.',
        feedbackType: 'incorrect'
      }));
    }
  };

  const calculatePoints = (): number => {
    if (!gameState.currentTeaser) return 0;
    
    let basePoints = 10;
    if (gameState.currentTeaser.difficulty === 'medium') basePoints = 20;
    else if (gameState.currentTeaser.difficulty === 'hard') basePoints = 30;
    else if (gameState.currentTeaser.difficulty === 'expert') basePoints = 50;
    
    // Bonus for streak
    const streakBonus = Math.floor(gameState.streak / 3) * 5;
    
    // Bonus for not using hints
    const hintBonus = gameState.showHint ? 0 : 5;
    
    // Time bonus for timed mode
    const timeBonus = gameMode === 'timed' && gameState.timeRemaining > 0 ? 
                     Math.floor(gameState.timeRemaining / 10) : 0;
    
    return basePoints + streakBonus + hintBonus + timeBonus;
  };

  const useHint = () => {
    if (!gameState.currentTeaser?.hint) return;
    
    setGameState(prev => ({
      ...prev,
      showHint: true,
      hintsUsed: prev.hintsUsed + 1,
      feedback: `Hint: ${gameState.currentTeaser?.hint}`,
      feedbackType: 'hint'
    }));
  };

  const revealAnswer = () => {
    if (!gameState.currentTeaser) return;
    
    setGameState(prev => ({
      ...prev,
      isGameActive: false,
      feedback: `Answer: ${gameState.currentTeaser!.answer}`,
      feedbackType: 'revealed',
      userAnswer: '' // Clear user input when revealing
    }));
    
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const nextTeaser = () => {
    startNewGame();
  };

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setGameState({
      currentTeaser: null,
      score: 0,
      streak: 0,
      totalSolved: 0,
      hintsUsed: 0,
      timeRemaining: 0,
      isGameActive: false,
      showHint: false,
      userAnswer: '',
      feedback: '',
      feedbackType: 'correct'
    });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameState.isGameActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState.isGameActive]);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-orange-600 bg-orange-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getFeedbackColor = () => {
    switch (gameState.feedbackType) {
      case 'correct': return 'text-green-600 bg-green-50 border-green-200';
      case 'incorrect': return 'text-red-600 bg-red-50 border-red-200';
      case 'hint': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'timeout': return 'text-orange-600 bg-orange-50 border-green-200';
      case 'revealed': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800">Brain Teaser</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Challenge your mind with AI-generated puzzles, riddles, and brain teasers!
          </p>
        </motion.div>

        {/* Game Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="kruti-card mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setGameMode('casual')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  gameMode === 'casual' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                Casual
              </button>
              <button
                onClick={() => setGameMode('timed')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  gameMode === 'timed' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Timer className="w-4 h-4 inline mr-2" />
                Timed
              </button>
              <button
                onClick={() => setGameMode('challenge')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  gameMode === 'challenge' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Target className="w-4 h-4 inline mr-2" />
                Challenge
              </button>
            </div>

            <div className="flex items-center space-x-4">
                             <select
                 value={difficulty}
                 onChange={(e) => setDifficulty(e.target.value as any)}
                 className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-purple-500"
                 aria-label="Select difficulty level"
               >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
              
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Stats
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="kruti-card mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{gameState.score}</div>
                  <div className="text-sm text-gray-600">Total Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{gameState.streak}</div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{gameState.totalSolved}</div>
                  <div className="text-sm text-gray-600">Solved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{gameState.hintsUsed}</div>
                  <div className="text-sm text-gray-600">Hints Used</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Game Area */}
        {!gameState.currentTeaser ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="kruti-card text-center py-12"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Puzzle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Challenge Your Brain?</h2>
            <p className="text-gray-600 mb-6">
              Choose your game mode and difficulty, then click start to begin!
            </p>
            <button
              onClick={startNewGame}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              Start Game
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Current Teaser */}
            <div className="kruti-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(gameState.currentTeaser.difficulty)}`}>
                    {gameState.currentTeaser.difficulty.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {gameState.currentTeaser.category}
                  </div>
                </div>
                
                {gameState.timeRemaining > 0 && (
                  <div className="flex items-center space-x-2">
                    <Timer className="w-5 h-5 text-orange-500" />
                    <span className="text-lg font-bold text-orange-600">{gameState.timeRemaining}s</span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {gameState.currentTeaser.question}
                </h3>
                
                {gameState.showHint && gameState.currentTeaser.hint && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4"
                  >
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-blue-500" />
                      <span className="text-blue-700 font-medium">Hint: {gameState.currentTeaser.hint}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Answer Input */}
              <div className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={gameState.userAnswer}
                  onChange={(e) => setGameState(prev => ({ ...prev, userAnswer: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                  disabled={!gameState.isGameActive}
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!gameState.userAnswer.trim() || !gameState.isGameActive}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4 inline mr-2" />
                      Submit
                    </button>
                    
                    {gameState.currentTeaser.hint && !gameState.showHint && (
                      <button
                        onClick={useHint}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        <Lightbulb className="w-4 h-4 inline mr-2" />
                        Hint
                      </button>
                    )}
                    
                    <button
                      onClick={revealAnswer}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      Reveal Answer
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Streak: <span className="font-bold text-purple-600">{gameState.streak}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback */}
            {gameState.feedback && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`kruti-card border-2 ${getFeedbackColor()}`}
              >
                <div className="text-center">
                  <p className="text-lg font-medium">{gameState.feedback}</p>
                  
                  {gameState.feedbackType === 'correct' && gameState.currentTeaser?.explanation && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong>Explanation:</strong> {gameState.currentTeaser.explanation}
                      </p>
                    </div>
                  )}
                  
                  {gameState.feedbackType === 'revealed' && gameState.currentTeaser?.explanation && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong>Explanation:</strong> {gameState.currentTeaser.explanation}
                      </p>
                    </div>
                  )}
                  

                </div>
              </motion.div>
            )}

            {/* Game Actions */}
            {!gameState.isGameActive && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center space-x-4"
              >
                <button
                  onClick={nextTeaser}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Next Teaser
                </button>
                
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  <Trophy className="w-4 h-4 inline mr-2" />
                  New Game
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="kruti-card mt-8"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Top Scores
          </h3>
          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No scores yet. Be the first to set a record!</p>
            ) : (
              leaderboard.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">{entry.score}</div>
                    <div className="text-xs text-gray-500">{entry.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BrainTeaser;
