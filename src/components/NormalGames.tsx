import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  O, 
  RotateCcw, 
  Home, 
  Trophy,
  Heart,
  Zap,
  Target
} from 'lucide-react';

interface NormalGamesProps {
  gameType: string;
  onExit: () => void;
}

const NormalGames: React.FC<NormalGamesProps> = ({ gameType, onExit }) => {
  const [currentGame, setCurrentGame] = useState<string>(gameType);
  const [gameState, setGameState] = useState<any>({});

  // Tic-Tac-Toe state
  const [ticTacToeBoard, setTicTacToeBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [ticTacToePlayer, setTicTacToePlayer] = useState<'X' | 'O'>('X');
  const [ticTacToeWinner, setTicTacToeWinner] = useState<string | null>(null);

  // Hangman state
  const [hangmanWord, setHangmanWord] = useState<string>('');
  const [hangmanGuessed, setHangmanGuessed] = useState<string[]>([]);
  const [hangmanWrong, setHangmanWrong] = useState<number>(0);
  const [hangmanGameOver, setHangmanGameOver] = useState<boolean>(false);

  // Number Guessing state
  const [numberToGuess, setNumberToGuess] = useState<number>(0);
  const [numberGuess, setNumberGuess] = useState<string>('');
  const [numberAttempts, setNumberAttempts] = useState<number>(0);
  const [numberFeedback, setNumberFeedback] = useState<string>('');

  const words = ['REACT', 'TYPESCRIPT', 'JAVASCRIPT', 'PYTHON', 'GAMING', 'PUZZLE', 'MYSTERY', 'BRAIN'];

  useEffect(() => {
    if (currentGame === 'hangman') {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setHangmanWord(randomWord);
      setHangmanGuessed([]);
      setHangmanWrong(0);
      setHangmanGameOver(false);
    } else if (currentGame === 'number-guessing') {
      setNumberToGuess(Math.floor(Math.random() * 100) + 1);
      setNumberGuess('');
      setNumberAttempts(0);
      setNumberFeedback('');
    }
  }, [currentGame]);

  const handleTicTacToeMove = (index: number) => {
    if (ticTacToeBoard[index] || ticTacToeWinner) return;

    const newBoard = [...ticTacToeBoard];
    newBoard[index] = ticTacToePlayer;
    setTicTacToeBoard(newBoard);

    // Check for winner
    const winner = checkTicTacToeWinner(newBoard);
    if (winner) {
      setTicTacToeWinner(winner);
    } else if (newBoard.every(cell => cell !== null)) {
      setTicTacToeWinner('Draw');
    } else {
      setTicTacToePlayer(ticTacToePlayer === 'X' ? 'O' : 'X');
    }
  };

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

  const resetTicTacToe = () => {
    setTicTacToeBoard(Array(9).fill(null));
    setTicTacToePlayer('X');
    setTicTacToeWinner(null);
  };

  const handleHangmanGuess = (letter: string) => {
    if (hangmanGuessed.includes(letter) || hangmanGameOver) return;

    const newGuessed = [...hangmanGuessed, letter];
    setHangmanGuessed(newGuessed);

    if (!hangmanWord.includes(letter)) {
      const newWrong = hangmanWrong + 1;
      setHangmanWrong(newWrong);
      if (newWrong >= 6) {
        setHangmanGameOver(true);
      }
    } else {
      // Check if word is complete
      const wordComplete = hangmanWord.split('').every(char => newGuessed.includes(char));
      if (wordComplete) {
        setHangmanGameOver(true);
      }
    }
  };

  const handleNumberGuess = () => {
    const guess = parseInt(numberGuess);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      setNumberFeedback('Please enter a number between 1 and 100');
      return;
    }

    const newAttempts = numberAttempts + 1;
    setNumberAttempts(newAttempts);

    if (guess === numberToGuess) {
      setNumberFeedback(`🎉 Correct! You guessed it in ${newAttempts} attempts!`);
    } else if (guess < numberToGuess) {
      setNumberFeedback('Too low! Try a higher number.');
    } else {
      setNumberFeedback('Too high! Try a lower number.');
    }

    setNumberGuess('');
  };

  const renderTicTacToe = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Tic-Tac-Toe</h3>
      <div className="mb-4">
        <p className="text-lg text-gray-600">
          Current Player: <span className={`font-bold ${ticTacToePlayer === 'X' ? 'text-blue-600' : 'text-red-600'}`}>
            {ticTacToePlayer}
          </span>
        </p>
        {ticTacToeWinner && (
          <p className="text-xl font-bold text-green-600 mt-2">
            {ticTacToeWinner === 'Draw' ? 'It\'s a Draw!' : `Player ${ticTacToeWinner} Wins!`}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2 w-64 mx-auto mb-6">
        {ticTacToeBoard.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleTicTacToeMove(index)}
            className="w-20 h-20 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-lg text-2xl font-bold transition-colors"
            disabled={!!cell || !!ticTacToeWinner}
          >
            {cell}
          </button>
        ))}
      </div>

      <button
        onClick={resetTicTacToe}
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
      >
        <RotateCcw className="w-4 h-4 inline mr-2" />
        New Game
      </button>
    </div>
  );

  const renderHangman = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Hangman</h3>
      
      <div className="mb-6">
        <div className="text-4xl font-mono mb-4">
          {hangmanWord.split('').map((letter, index) => (
            <span key={index} className="mx-1">
              {hangmanGuessed.includes(letter) ? letter : '_'}
            </span>
          ))}
        </div>
        
        <p className="text-lg text-gray-600">
          Wrong guesses: {hangmanWrong}/6
        </p>
        
        {hangmanGameOver && (
          <p className="text-xl font-bold mt-4">
            {hangmanWord.split('').every(char => hangmanGuessed.includes(char))
              ? '🎉 You won!'
              : `💀 Game over! The word was: ${hangmanWord}`
            }
          </p>
        )}
      </div>

      <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
        {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
          <button
            key={letter}
            onClick={() => handleHangmanGuess(letter)}
            disabled={hangmanGuessed.includes(letter) || hangmanGameOver}
            className={`w-8 h-8 text-sm font-bold rounded transition-colors ${
              hangmanGuessed.includes(letter)
                ? hangmanWord.includes(letter)
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );

  const renderNumberGuessing = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Number Guessing</h3>
      <p className="text-lg text-gray-600 mb-6">
        I'm thinking of a number between 1 and 100. Can you guess it?
      </p>
      
      <div className="mb-6">
        <p className="text-lg text-gray-600 mb-2">Attempts: {numberAttempts}</p>
        {numberFeedback && (
          <p className={`text-lg font-semibold ${
            numberFeedback.includes('🎉') ? 'text-green-600' : 'text-blue-600'
          }`}>
            {numberFeedback}
          </p>
        )}
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        <input
          type="number"
          value={numberGuess}
          onChange={(e) => setNumberGuess(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleNumberGuess()}
          placeholder="Enter your guess"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          min="1"
          max="100"
        />
        <button
          onClick={handleNumberGuess}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Guess
        </button>
      </div>
    </div>
  );

  const renderRockPaperScissors = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Rock Paper Scissors</h3>
      <p className="text-lg text-gray-600 mb-6">
        Choose your weapon and see if you can beat the AI!
      </p>
      
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        {['Rock', 'Paper', 'Scissors'].map(choice => (
          <button
            key={choice}
            className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <div className="text-4xl mb-2">
              {choice === 'Rock' ? '🪨' : choice === 'Paper' ? '📄' : '✂️'}
            </div>
            <div className="font-semibold">{choice}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderGame = () => {
    switch (currentGame) {
      case 'tic-tac-toe':
        return renderTicTacToe();
      case 'hangman':
        return renderHangman();
      case 'number-guessing':
        return renderNumberGuessing();
      case 'rock-paper-scissors':
        return renderRockPaperScissors();
      default:
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Choose a Game</h3>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {[
                { id: 'tic-tac-toe', name: 'Tic-Tac-Toe', icon: '⭕' },
                { id: 'hangman', name: 'Hangman', icon: '🎯' },
                { id: 'number-guessing', name: 'Number Guessing', icon: '🔢' },
                { id: 'rock-paper-scissors', name: 'Rock Paper Scissors', icon: '✂️' }
              ].map(game => (
                <button
                  key={game.id}
                  onClick={() => setCurrentGame(game.id)}
                  className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <div className="text-3xl mb-2">{game.icon}</div>
                  <div className="font-semibold text-gray-800">{game.name}</div>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Normal Games</h1>
              <p className="text-gray-600">Classic games for everyone!</p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4 inline mr-2" />
            Back to Chat
          </button>
        </div>

        {/* Game Content */}
        <div className="kruti-card p-8">
          {renderGame()}
        </div>
      </div>
    </div>
  );
};

export default NormalGames;
