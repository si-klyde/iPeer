import React, { useState, useEffect } from 'react';
import { PuzzlePieceIcon, ShieldExclamationIcon, LightBulbIcon, HashtagIcon, LanguageIcon } from '@heroicons/react/24/outline';

// Common game container style
const GameContainer = ({ icon, title, children }) => (
  <div className="mx-5 relative w-[30rem] md:w-[25rem] sm:w-full bg-white/90 rounded-2xl pt-24 pb-8 px-6 shadow-2xl flex flex-col items-center">
    <div className="border-2 border-n-6 absolute rounded-xl bg-gradient-to-br from-green-400 to-green-600 size-20 p-5 z-10 -top-8 shadow-xl">
      {icon}
    </div>
    <label className="font-bold text-n-6 text-xl mb-6">{title}</label>
    {children}
  </div>
);

// Common button style
const GameButton = ({ onClick, disabled, variant = 'primary', children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
      disabled ? 'bg-gray-300 cursor-not-allowed' : 
      variant === 'primary' ? 'bg-green-500 hover:bg-green-600 text-white' :
      variant === 'secondary' ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' :
      'bg-blue-500 hover:bg-blue-600 text-white'
    }`}
  >
    {children}
  </button>
);

// Add these helper functions at the top
const isKingInCheck = (boardState, color) => {
  const kingPosition = findKing(boardState, color);
  if (!kingPosition) return false;

  return canAnyPieceAttack(boardState, kingPosition, color === 'white' ? 'black' : 'white');
};

const findKing = (boardState, color) => {
  return boardState.findIndex(piece => piece?.type === 'king' && piece.color === color);
};

const isCheckmate = (boardState, color) => {
  if (!isKingInCheck(boardState, color)) return false;
  
  // Check if any move can get out of check
  for (let fromIndex = 0; fromIndex < boardState.length; fromIndex++) {
    const piece = boardState[fromIndex];
    if (!piece || piece.color !== color) continue;

    const validMoves = getValidMoves(fromIndex, boardState);
    for (const toIndex of validMoves) {
      const newBoard = makeMove([...boardState], fromIndex, toIndex);
      if (!isKingInCheck(newBoard, color)) {
        return false; // Found at least one legal move
      }
    }
  }
  
  return true; // No legal moves found
};

// Add these at the top of the file
const INITIAL_BOARD = [
  { type: 'rook', color: 'black' },   { type: 'knight', color: 'black' }, { type: 'bishop', color: 'black' }, { type: 'queen', color: 'black' },
  { type: 'king', color: 'black' },   { type: 'bishop', color: 'black' }, { type: 'knight', color: 'black' }, { type: 'rook', color: 'black' },
  { type: 'pawn', color: 'black' },   { type: 'pawn', color: 'black' },   { type: 'pawn', color: 'black' },   { type: 'pawn', color: 'black' },
  { type: 'pawn', color: 'black' },   { type: 'pawn', color: 'black' },   { type: 'pawn', color: 'black' },   { type: 'pawn', color: 'black' },
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  { type: 'pawn', color: 'white' },   { type: 'pawn', color: 'white' },   { type: 'pawn', color: 'white' },   { type: 'pawn', color: 'white' },
  { type: 'pawn', color: 'white' },   { type: 'pawn', color: 'white' },   { type: 'pawn', color: 'white' },   { type: 'pawn', color: 'white' },
  { type: 'rook', color: 'white' },   { type: 'knight', color: 'white' }, { type: 'bishop', color: 'white' }, { type: 'queen', color: 'white' },
  { type: 'king', color: 'white' },   { type: 'bishop', color: 'white' }, { type: 'knight', color: 'white' }, { type: 'rook', color: 'white' }
];

const initializeChessBoard = () => [...INITIAL_BOARD];

const getPieceSymbol = (piece) => {
  if (!piece) return '';
  const symbols = {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  };
  return symbols[piece.type];
};

const getCellColor = (index, isValidMove) => {
  const row = Math.floor(index / 8);
  const col = index % 8;
  const isLight = (row + col) % 2 === 0;
  
  if (isValidMove) {
    return 'bg-green-200 hover:bg-green-300';
  }
  
  return isLight ? 'bg-white hover:bg-gray-100' : 'bg-gray-200 hover:bg-gray-300';
};

// Add these utility functions
const isValidPosition = (row, col) => row >= 0 && row < 8 && col >= 0 && col < 8;

const getStraightMoves = (index, boardState, color) => {
  const moves = [];
  const row = Math.floor(index / 8);
  const col = index % 8;
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right

  directions.forEach(([rowDir, colDir]) => {
    let newRow = row + rowDir;
    let newCol = col + colDir;
    
    while (isValidPosition(newRow, newCol)) {
      const newIndex = newRow * 8 + newCol;
      const targetPiece = boardState[newIndex];
      
      if (!targetPiece) {
        moves.push(newIndex);
      } else {
        if (targetPiece.color !== color) {
          moves.push(newIndex);
        }
        break;
      }
      
      newRow += rowDir;
      newCol += colDir;
    }
  });
  
  return moves;
};

const getDiagonalMoves = (index, boardState, color) => {
  const moves = [];
  const row = Math.floor(index / 8);
  const col = index % 8;
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  directions.forEach(([rowDir, colDir]) => {
    let newRow = row + rowDir;
    let newCol = col + colDir;
    
    while (isValidPosition(newRow, newCol)) {
      const newIndex = newRow * 8 + newCol;
      const targetPiece = boardState[newIndex];
      
      if (!targetPiece) {
        moves.push(newIndex);
      } else {
        if (targetPiece.color !== color) {
          moves.push(newIndex);
        }
        break;
      }
      
      newRow += rowDir;
      newCol += colDir;
    }
  });
  
  return moves;
};

// Update getBasicMoves to include all pieces
const getBasicMoves = (index, boardState) => {
  const piece = boardState[index];
  if (!piece) return [];

  const row = Math.floor(index / 8);
  const col = index % 8;
  const moves = [];
  let nextIndex;

  switch (piece.type) {
    case 'pawn':
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      
      // Forward one square
      nextIndex = index + (direction * 8);
      if (nextIndex >= 0 && nextIndex < 64 && !boardState[nextIndex]) {
        moves.push(nextIndex);
        
        // Forward two squares from starting position
        if (row === startRow) {
          nextIndex = index + (direction * 16);
          if (!boardState[nextIndex]) {
            moves.push(nextIndex);
          }
        }
      }
      
      // Captures
      [-1, 1].forEach(offset => {
        const captureIndex = index + (direction * 8) + offset;
        const captureCol = col + offset;
        if (captureCol >= 0 && captureCol < 8 && captureIndex >= 0 && captureIndex < 64) {
          const targetPiece = boardState[captureIndex];
          if (targetPiece && targetPiece.color !== piece.color) {
            moves.push(captureIndex);
          }
        }
      });
      break;

    case 'knight':
      [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ].forEach(([rowOffset, colOffset]) => {
        const newRow = row + rowOffset;
        const newCol = col + colOffset;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const knightIndex = newRow * 8 + newCol;
          const targetPiece = boardState[knightIndex];
          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push(knightIndex);
          }
        }
      });
      break;

    case 'bishop':
      return getDiagonalMoves(index, boardState, piece.color);

    case 'rook':
      return getStraightMoves(index, boardState, piece.color);

    case 'queen':
      return [
        ...getStraightMoves(index, boardState, piece.color),
        ...getDiagonalMoves(index, boardState, piece.color)
      ];

    case 'king':
      [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ].forEach(([rowOffset, colOffset]) => {
        const newRow = row + rowOffset;
        const newCol = col + colOffset;
        
        if (isValidPosition(newRow, newCol)) {
          const kingIndex = newRow * 8 + newCol;
          const targetPiece = boardState[kingIndex];
          
          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push(kingIndex);
          }
        }
      });
      break;
  }

  return moves;
};

const canAnyPieceAttack = (boardState, targetIndex, attackerColor) => {
  for (let i = 0; i < boardState.length; i++) {
    const piece = boardState[i];
    if (piece && piece.color === attackerColor) {
      const moves = getBasicMoves(i, boardState);
      if (moves.includes(targetIndex)) {
        return true;
      }
    }
  }
  return false;
};

const ChessGame = () => {
  const [board, setBoard] = useState(initializeChessBoard());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [lastMove, setLastMove] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'check', 'checkmate'
  const [winner, setWinner] = useState(null);

  // Piece values for AI evaluation
  const PIECE_VALUES = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 100
  };

  // Position evaluation bonuses
  const POSITION_BONUS = {
    pawn: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
      [0.1, 0.1, 0.2, 0.3, 0.3, 0.2, 0.1, 0.1],
      [0.05, 0.05, 0.1, 0.25, 0.25, 0.1, 0.05, 0.05],
      [0, 0, 0, 0.2, 0.2, 0, 0, 0],
      [0.05, -0.05, -0.1, 0, 0, -0.1, -0.05, 0.05],
      [0.05, 0.1, 0.1, -0.2, -0.2, 0.1, 0.1, 0.05],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  };

  const evaluateBoard = (boardState) => {
    let score = 0;
    
    boardState.forEach((piece, index) => {
      if (!piece) return;
      
      const row = Math.floor(index / 8);
      const col = index % 8;
      const baseValue = PIECE_VALUES[piece.type];
      let positionBonus = 0;

      // Add position bonus for pawns
      if (piece.type === 'pawn') {
        positionBonus = POSITION_BONUS.pawn[piece.color === 'white' ? row : 7 - row][col];
      }

      const value = (baseValue + positionBonus) * (piece.color === 'white' ? 1 : -1);
      score += value;
    });

    return score;
  };

  const minimax = (boardState, depth, alpha, beta, isMaximizing) => {
    if (depth === 0) {
      return evaluateBoard(boardState);
    }

    const moves = getAllPossibleMoves(boardState, isMaximizing ? 'white' : 'black');
    
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const newBoard = makeMove(boardState, move.from, move.to);
        const evaluation = minimax(newBoard, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const newBoard = makeMove(boardState, move.from, move.to);
        const evaluation = minimax(newBoard, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  const getBestMove = async (boardState) => {
    setIsThinking(true);
    
    // Use setTimeout to allow UI to update
    return new Promise(resolve => {
      setTimeout(() => {
        const moves = getAllPossibleMoves(boardState, 'black');
        let bestMove = null;
        let bestEvaluation = Infinity;

        for (const move of moves) {
          const newBoard = makeMove(boardState, move.from, move.to);
          const evaluation = minimax(newBoard, 3, -Infinity, Infinity, true);
          
          if (evaluation < bestEvaluation) {
            bestEvaluation = evaluation;
            bestMove = move;
          }
        }

        setIsThinking(false);
        resolve(bestMove);
      }, 100);
    });
  };

  const getAllPossibleMoves = (boardState, color) => {
    const moves = [];
    boardState.forEach((piece, index) => {
      if (piece && piece.color === color) {
        const validMoves = getValidMoves(index, boardState);
        validMoves.forEach(toIndex => {
          moves.push({ from: index, to: toIndex });
        });
      }
    });
    return moves;
  };

  const makeMove = (boardState, fromIndex, toIndex) => {
    const newBoard = [...boardState];
    const movingPiece = newBoard[fromIndex];
    const capturedPiece = newBoard[toIndex];
    
    // Make the move
    newBoard[toIndex] = movingPiece;
    newBoard[fromIndex] = null;
    
    return newBoard;
  };

  const handlePieceClick = async (index) => {
    if (gameStatus === 'checkmate' || currentPlayer === 'black') return;
    
    const piece = board[index];
    
    if (selectedPiece === null) {
      if (piece && piece.color === 'white') {
        setSelectedPiece(index);
        setLastMove(null);
      }
    } else {
      const validMoves = getValidMoves(selectedPiece);
      if (validMoves.includes(index)) {
        // Make player's move
        const newBoard = makeMove([...board], selectedPiece, index);
        setBoard(newBoard);
        setSelectedPiece(null);
        setCurrentPlayer('black');
        setLastMove({ from: selectedPiece, to: index });

        // Check game status after player's move
        if (isCheckmate(newBoard, 'black')) {
          setGameStatus('checkmate');
          setWinner('white');
          return;
        } else if (isKingInCheck(newBoard, 'black')) {
          setGameStatus('check');
        } else {
          setGameStatus('playing');
        }

        // AI's turn
        setIsThinking(true);
        const aiMove = await getBestMove(newBoard);
        if (aiMove) {
          const afterAiBoard = makeMove([...newBoard], aiMove.from, aiMove.to);
          setBoard(afterAiBoard);
          setCurrentPlayer('white');
          setLastMove({ from: aiMove.from, to: aiMove.to });

          // Check game status after AI's move
          if (isCheckmate(afterAiBoard, 'white')) {
            setGameStatus('checkmate');
            setWinner('black');
          } else if (isKingInCheck(afterAiBoard, 'white')) {
            setGameStatus('check');
          } else {
            setGameStatus('playing');
          }
        }
        setIsThinking(false);
      } else {
        setSelectedPiece(null);
      }
    }
  };

  const getValidMoves = (index, boardState = board) => {
    const piece = boardState[index];
    if (!piece) return [];

    const basicMoves = getBasicMoves(index, boardState);
    
    // Filter out moves that would leave own king in check
    return basicMoves.filter(toIndex => {
      const newBoard = makeMove([...boardState], index, toIndex);
      return !isKingInCheck(newBoard, piece.color);
    });
  };

  const getCellColor = (index, isValidMove) => {
    const isLastMoveFrom = lastMove && lastMove.from === index;
    const isLastMoveTo = lastMove && lastMove.to === index;
    const row = Math.floor(index / 8);
    const col = index % 8;
    const isSelected = selectedPiece === index;
    
    if (isSelected) return 'bg-yellow-200';
    if (isLastMoveFrom) return 'bg-green-100';
    if (isLastMoveTo) return 'bg-green-200';
    if (isValidMove) return 'bg-blue-100';
    return (row + col) % 2 === 0 ? 'bg-white' : 'bg-gray-300';
  };

  return (
    <GameContainer 
      icon={<ShieldExclamationIcon className="w-auto h-auto text-white" />}
      title={
        gameStatus === 'checkmate' ? `Checkmate! ${winner === 'white' ? 'You' : 'AI'} wins!` :
        gameStatus === 'check' ? `Check! ${currentPlayer === 'white' ? 'Your' : "AI's"} king is in danger` :
        isThinking ? "AI is thinking..." : "Chess - Your turn"
      }
    >
      <div className="w-full max-w-lg aspect-square">
        <div className="grid grid-cols-8 h-full w-full gap-0 rounded-lg overflow-hidden border-2 border-n-6">
          {board.map((piece, index) => {
            const validMoves = selectedPiece !== null ? getValidMoves(selectedPiece) : [];
            const isValidMove = validMoves.includes(index);
            const isLastMove = lastMove && (index === lastMove.from || index === lastMove.to);
            const isCheck = piece?.type === 'king' && 
              ((piece.color === 'white' && isKingInCheck(board, 'white')) ||
               (piece.color === 'black' && isKingInCheck(board, 'black')));
            
            return (
              <div
                key={index}
                onClick={() => handlePieceClick(index)}
                className={`
                  relative aspect-square flex items-center justify-center 
                  cursor-pointer transition-all duration-200 
                  ${getCellColor(index, isValidMove)}
                  ${isLastMove ? 'ring-2 ring-yellow-400' : ''}
                  ${isCheck ? 'ring-2 ring-red-500' : ''}
                  hover:opacity-90
                  ${currentPlayer === 'black' || gameStatus === 'checkmate' ? 'cursor-not-allowed' : ''}
                `}
              >
                <span className={`text-4xl ${piece?.color === 'white' ? 'text-blue-900' : 'text-black'}`}>
                  {getPieceSymbol(piece)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {gameStatus === 'checkmate' && (
        <div className="mt-4 text-xl font-bold text-green-600">
          {winner === 'white' ? 'Congratulations! You' : 'AI'} won by checkmate!
        </div>
      )}
      
      {gameStatus === 'check' && (
        <div className="mt-4 text-lg text-red-500">
          Check! Protect your king!
        </div>
      )}
      
      {isThinking && (
        <div className="mt-4 text-gray-600">
          AI is thinking...
        </div>
      )}
      
      <div className="mt-6">
        <GameButton 
          onClick={() => {
            setBoard(initializeChessBoard());
            setCurrentPlayer('white');
            setSelectedPiece(null);
            setLastMove(null);
            setGameStatus('playing');
            setWinner(null);
          }} 
          variant="secondary"
        >
          New Game
        </GameButton>
      </div>
    </GameContainer>
  );
};

const WordPuzzle = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [attempts, setAttempts] = useState(6);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongLetters, setWrongLetters] = useState([]);

  const words = [
    'BREATHE', 'PEACE', 'CALM', 'HEALING', 'MINDFUL',
    'GROWTH', 'BALANCE', 'HARMONY', 'STRENGTH', 'COURAGE',
    'HOPE', 'SERENITY', 'WELLNESS', 'GRATITUDE', 'COMFORT',
    'RESILIENT', 'GENTLE', 'PATIENCE', 'KINDNESS', 'TRANQUIL',
    'NURTURE', 'RESTORE', 'EMBRACE', 'RENEW', 'FLOURISH',
    'PRESENT', 'GROUNDED', 'PEACEFUL', 'RADIANT', 'BLESSED'
  ];

  const initializeGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setGuesses([]);
    setAttempts(6);
    setGameStatus('playing');
    setWrongLetters([]);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleKeyPress = (letter) => {
    if (gameStatus !== 'playing') return;
    
    const upperLetter = letter.toUpperCase();
    if (guesses.includes(upperLetter)) return;

    setGuesses(prev => [...prev, upperLetter]);

    if (!currentWord.includes(upperLetter)) {
      setAttempts(prev => prev - 1);
      setWrongLetters(prev => [...prev, upperLetter]);
    }

    // Check win condition
    const isWin = currentWord.split('').every(char => 
      guesses.includes(char) || upperLetter === char
    );

    if (isWin) {
      setGameStatus('won');
      setScore(prev => prev + 100);
      setStreak(prev => prev + 1);
    } else if (attempts <= 1) {
      setGameStatus('lost');
      setStreak(0);
    }
  };

  const getHangmanFigure = () => {
    const parts = [
      '🎯', // Head
      '👕', // Body
      '💪', // Left arm
      '🦾', // Right arm
      '👖', // Legs
      '👟'  // Feet
    ];
    return parts.slice(6 - attempts);
  };

  return (
    <GameContainer 
      icon={<LanguageIcon className="w-auto h-auto text-white" />}
      title="Mindful Word Puzzle"
    >
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Encouraging Message */}
        <div className="text-gray-600 mb-6 italic">
          Take a moment to find words of comfort and healing
        </div>

        {/* Progress and Journey */}
        <div className="flex justify-between mb-6">
          <div className="text-gray-600">
            Journey: <span className="font-bold text-green-600">{score}</span>
          </div>
          <div className="text-gray-600">
            Flow: <span className="font-bold text-blue-600">{streak}✨</span>
          </div>
        </div>

        {/* Mindful Progress */}
        <div className="mb-8">
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                attempts > 3 ? 'bg-green-400' : 
                attempts > 1 ? 'bg-amber-400' : 
                'bg-rose-400'
              }`}
              style={{ width: `${(attempts / 6) * 100}%` }}
            />
          </div>
          <div className="text-gray-600 mt-2">
            Breaths remaining: 
            <span className={`font-bold ml-2 ${
              attempts <= 2 ? 'text-rose-500' : 'text-gray-800'
            }`}>
              {attempts}
            </span>
          </div>
        </div>

        {/* Word Display */}
        <div className="flex justify-center space-x-2 mb-8">
          {currentWord.split('').map((letter, index) => (
            <div
              key={index}
              className={`
                w-12 h-12 border-2 rounded-lg flex items-center justify-center text-2xl font-bold
                transition-all duration-300 transform
                ${guesses.includes(letter) 
                  ? 'border-green-400 bg-green-50 scale-105' 
                  : 'border-gray-200'
                }
                ${gameStatus === 'lost' && !guesses.includes(letter)
                  ? 'border-rose-400 bg-rose-50'
                  : ''
                }
              `}
            >
              {guesses.includes(letter) || gameStatus === 'lost' ? letter : '•'}
            </div>
          ))}
        </div>

        {/* Letter Choices */}
        <div className="grid grid-cols-9 gap-2 mb-8">
          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
            <button
              key={letter}
              onClick={() => handleKeyPress(letter)}
              disabled={
                guesses.includes(letter) || 
                gameStatus !== 'playing'
              }
              className={`
                w-10 h-10 rounded-lg font-semibold transition-all duration-200
                ${guesses.includes(letter)
                  ? currentWord.includes(letter)
                    ? 'bg-green-400 text-white cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-400 hover:bg-blue-500 text-white cursor-pointer'
                }
                disabled:opacity-50
                transform hover:scale-105 active:scale-95
              `}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Mindful Messages */}
        {gameStatus !== 'playing' && (
          <div className="mb-8">
            <div className={`text-2xl font-bold mb-4 ${
              gameStatus === 'won' ? 'text-green-500' : 'text-rose-500'
            }`}>
              {gameStatus === 'won' 
                ? 'Beautiful journey! The word was ' + currentWord 
                : `Take a deep breath. The word was ${currentWord}`
              }
            </div>
            <GameButton onClick={initializeGame}>
              Continue Journey
            </GameButton>
          </div>
        )}

        {/* Reflection Space */}
        {wrongLetters.length > 0 && (
          <div className="mt-4 text-gray-600">
            Letters to reflect on: 
            <div className="flex justify-center gap-2 mt-2">
              {wrongLetters.map((letter, index) => (
                <span 
                  key={index}
                  className="inline-block px-3 py-1 bg-rose-50 text-rose-500 rounded-full font-semibold"
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameContainer>
  );
};

const MemoryGame = () => {
  const symbols = ['🌟', '🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎫'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const duplicatedSymbols = [...symbols, ...symbols];
    const shuffledCards = duplicatedSymbols
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol }));
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
  };

  const handleCardClick = (index) => {
    if (disabled || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      const [first, second] = newFlipped;
      if (cards[first].symbol === cards[second].symbol) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        setDisabled(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  return (
    <GameContainer 
      icon={<LightBulbIcon className="w-auto h-auto text-white" />}
      title="Memory Match"
    >
      <div className="grid grid-cols-4 gap-4 w-full max-w-lg">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`aspect-square rounded-xl cursor-pointer transition-all duration-300 transform shadow-lg
              ${flipped.includes(index) || matched.includes(index)
                ? 'bg-white rotate-y-180'
                : 'bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="w-full h-full flex items-center justify-center text-3xl">
              {(flipped.includes(index) || matched.includes(index)) && card.symbol}
            </div>
          </div>
        ))}
      </div>
      {matched.length === cards.length && (
        <div className="mt-8">
          <GameButton onClick={initializeGame}>
            Play Again
          </GameButton>
        </div>
      )}
    </GameContainer>
  );
};

const SudokuGame = () => {
  function generateInitialSudoku() {
    const newGrid = Array(9).fill().map(() => Array(9).fill(null));
    const originalCells = Array(9).fill().map(() => Array(9).fill(false));
    
    // Add some initial numbers
    for (let i = 0; i < 20; i++) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      const num = Math.floor(Math.random() * 9) + 1;
      if (isValidSudokuMove(newGrid, row, col, num)) {
        newGrid[row][col] = num;
        originalCells[row][col] = true;
      }
    }
    
    return { grid: newGrid, original: originalCells };
  }

  const [gameState, setGameState] = useState(generateInitialSudoku());
  const [selected, setSelected] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  function isValidSudokuMove(board, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }
    
    return true;
  }

  function checkCompletion(currentGrid) {
    // Check if all cells are filled
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (currentGrid[i][j] === null) return false;
      }
    }
    
    // Check if solution is valid
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const currentNum = currentGrid[i][j];
        currentGrid[i][j] = null;
        if (!isValidSudokuMove(currentGrid, i, j, currentNum)) {
          currentGrid[i][j] = currentNum;
          return false;
        }
        currentGrid[i][j] = currentNum;
      }
    }
    
    return true;
  }

  const handleCellClick = (row, col) => {
    if (!gameState.original[row][col]) {
      setSelected({ row, col });
    }
  };

  const handleNumberInput = (num) => {
    if (selected && !gameState.original[selected.row][selected.col]) {
      const newGrid = gameState.grid.map(row => [...row]);
      if (num === 0) {
        newGrid[selected.row][selected.col] = null;
      } else {
        newGrid[selected.row][selected.col] = num;
      }
      
      setGameState(prev => ({
        ...prev,
        grid: newGrid
      }));
      
      // Check if puzzle is complete
      if (checkCompletion(newGrid)) {
        setIsComplete(true);
      }
    }
  };

  const resetGame = () => {
    const newGame = generateInitialSudoku();
    setGameState(newGame);
    setSelected(null);
    setIsComplete(false);
  };

  return (
    <GameContainer 
      icon={<HashtagIcon className="w-auto h-auto text-white" />}
      title="Mindful Sudoku"
    >
      <div className="w-full max-w-lg">
        <div className="grid grid-cols-9 gap-0 border-2 border-n-6 rounded-lg overflow-hidden">
          {gameState.grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`
                  aspect-square border border-gray-200 flex items-center justify-center text-lg font-semibold
                  transition-all duration-200
                  ${selected?.row === rowIndex && selected?.col === colIndex ? 'bg-green-100' : ''}
                  ${gameState.original[rowIndex][colIndex] ? 'bg-gray-50 font-bold' : 'cursor-pointer hover:bg-green-50'}
                  ${colIndex % 3 === 2 ? 'border-r-2 border-r-n-6' : ''}
                  ${rowIndex % 3 === 2 ? 'border-b-2 border-b-n-6' : ''}
                `}
              >
                {cell}
              </div>
            ))
          )}
        </div>
        
        <div className="mt-6 grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
            <GameButton
              key={num}
              onClick={() => handleNumberInput(num)}
              variant={num === 0 ? 'secondary' : 'primary'}
            >
              {num === 0 ? 'Clear' : num}
            </GameButton>
          ))}
        </div>
        
        <div className="mt-6 flex justify-center">
          <GameButton onClick={resetGame} variant="secondary">
            New Game
          </GameButton>
        </div>
        
        {isComplete && (
          <div className="mt-6 text-center text-green-600 text-xl font-bold">
            Congratulations! You've completed the puzzle!
          </div>
        )}
      </div>
    </GameContainer>
  );
};

const GameRoom = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: 'wordPuzzle',
      title: 'Mindful Word Puzzle',
      description: 'A calming word game to help clear your mind and find moments of peace',
      icon: <LanguageIcon className="w-6 h-6" />,
      component: WordPuzzle
    },
    {
      id: 'chess',
      title: 'Reflective Chess',
      description: 'Challenge yourself in a thoughtful game of strategy and patience',
      icon: <ShieldExclamationIcon className="w-6 h-6" />,
      component: ChessGame
    },
    {
      id: 'memory',
      title: 'Peaceful Patterns',
      description: 'Strengthen your focus through gentle memory exercises',
      icon: <LightBulbIcon className="w-6 h-6" />,
      component: MemoryGame
    },
    {
      id: 'sudoku',
      title: 'Mindful Numbers',
      description: 'Find your center through structured number puzzles',
      icon: <HashtagIcon className="w-6 h-6" />,
      component: SudokuGame
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      {selectedGame ? (
        <div className="container mx-auto px-4">
          <button
            onClick={() => setSelectedGame(null)}
            className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Return to Game Selection
          </button>
          {React.createElement(selectedGame.component)}
        </div>
      ) : (
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Therapeutic Gaming Space
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Take a moment to explore these mindful activities designed to help you 
              find peace, focus, and clarity. Each game offers a unique way to 
              practice mindfulness and self-care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl 
                  transition-all duration-200 transform hover:-translate-y-1
                  text-left border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 
                  rounded-lg flex items-center justify-center text-white mb-4"
                >
                  {game.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {game.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {game.description}
                </p>
                <div className="mt-4 text-green-600 text-sm font-medium">
                  Click to begin →
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 text-center text-gray-600 max-w-2xl mx-auto">
            <p className="mb-2">
              "Take a deep breath and choose an activity that speaks to you in this moment."
            </p>
            <p className="text-sm text-gray-500">
              Each game is designed for individual play, allowing you to focus on your journey 
              of mindfulness and relaxation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export { ChessGame, WordPuzzle, MemoryGame, SudokuGame };