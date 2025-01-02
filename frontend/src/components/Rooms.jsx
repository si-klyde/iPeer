import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { 
  PaintBrushIcon, 
  DocumentTextIcon,
  Square2StackIcon,
  TrashIcon,
  ArrowUturnDownIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { ChessGame, WordPuzzle, MemoryGame, SudokuGame } from './Rooms/GameRoom.jsx';
import { MusicRoom } from './Rooms/MusicRoom.jsx';

// Color Picker Component
const ColorPicker = ({ selectedColor, onColorChange }) => {
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'
  ];

  return (
    <div className="flex space-x-2 mb-4">
      {colors.map(color => (
        <button
          key={color}
          className={`w-8 h-8 rounded-full border-2 ${
            selectedColor === color ? 'border-gray-600' : 'border-gray-300'
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onColorChange(color)}
        />
      ))}
    </div>
  );
};

// Canvas Component
const Canvas = ({ selectedTool, onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    setContext(ctx);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, []);

  useEffect(() => {
    if (context) {
      context.strokeStyle = color;
      context.lineWidth = brushSize;
    }
  }, [color, brushSize]);

  const saveState = () => {
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, currentStep + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
  };

  const undo = () => {
    if (currentStep > 0) {
      const img = new Image();
      img.src = history[currentStep - 1];
      img.onload = () => {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        context.drawImage(img, 0, 0);
        setCurrentStep(currentStep - 1);
      };
    }
  };

  const clearCanvas = () => {
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveState();
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setLastX(pos.x);
    setLastY(pos.y);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    
    if (selectedTool === 'eraser') {
      context.strokeStyle = '#FFFFFF';
    } else {
      context.strokeStyle = color;
    }
    
    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(pos.x, pos.y);
    context.stroke();
    
    setLastX(pos.x);
    setLastY(pos.y);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      context.closePath();
      setIsDrawing(false);
      saveState();
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="bg-white rounded-xl shadow-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-x-4 flex items-center">
            <ColorPicker selectedColor={color} onColorChange={setColor} />
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Brush Size:</label>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(e.target.value)}
                className="w-32"
              />
            </div>
          </div>
          <div className="space-x-2">
            <button
              onClick={undo}
              className="p-2 rounded-lg hover:bg-gray-100"
              disabled={currentStep <= 0}
            >
              <ArrowUturnDownIcon className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <TrashIcon className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => onSave?.(canvasRef.current.toDataURL('image/png'))}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Square2StackIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="relative w-full" style={{ paddingBottom: '75%' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="absolute top-0 left-0 w-full h-full border border-gray-300 rounded-lg cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
};

// Artwork Card Component
const ArtworkCard = ({ artwork, onDelete }) => {
  return (
    <div className="relative bg-white rounded-xl shadow-lg p-4">
      <img
        src={artwork.imageUrl}
        alt={artwork.title}
        className="w-full aspect-square object-cover rounded-lg"
      />
      <div className="mt-2">
        <h3 className="font-semibold text-gray-800">{artwork.title}</h3>
        <p className="text-sm text-gray-600">By {artwork.artist}</p>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(artwork.id)}
          className="absolute top-2 right-2 p-1 rounded-full bg-white/90 hover:bg-red-100 transition-colors"
        >
          <TrashIcon className="w-5 h-5 text-red-600" />
        </button>
      )}
    </div>
  );
};

// Game Room Component
export const GameRoom = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [players, setPlayers] = useState([]);

  const games = [
    { id: 'chess', name: 'Chess', minPlayers: 2, maxPlayers: 2, component: ChessGame },
    { id: 'wordscape', name: 'Word Puzzle', minPlayers: 1, maxPlayers: 1, component: WordPuzzle },
    { id: 'memory', name: 'Memory Cards', minPlayers: 1, maxPlayers: 4, component: MemoryGame },
    { id: 'sudoku', name: 'Sudoku', minPlayers: 1, maxPlayers: 1, component: SudokuGame }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-8">Game Room</h1>
        
        {!selectedGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <div 
                key={game.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-blue-100"
                onClick={() => setSelectedGame(game)}
              >
                <h3 className="text-2xl font-semibold mb-3 text-blue-800">{game.name}</h3>
                <p className="text-blue-600">
                  {game.minPlayers === game.maxPlayers 
                    ? `${game.minPlayers} player${game.minPlayers > 1 ? 's' : ''}`
                    : `${game.minPlayers}-${game.maxPlayers} players`}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setSelectedGame(null)}
              className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-md"
            >
              <XCircle className="w-6 h-6 text-blue-600 hover:text-blue-800" />
            </button>
            
            <div className="bg-white rounded-xl shadow-xl p-8 border border-blue-100">
              <h2 className="text-3xl font-bold text-blue-800 mb-6">{selectedGame.name}</h2>
              
              <div className="w-full flex justify-center">
                {selectedGame.component && <selectedGame.component />}
              </div>
              
              <div className="mt-6 text-sm text-blue-600 text-center font-medium">
                {selectedGame.minPlayers === selectedGame.maxPlayers 
                  ? `${selectedGame.minPlayers} player${selectedGame.minPlayers > 1 ? 's' : ''} required`
                  : `${selectedGame.minPlayers}-${selectedGame.maxPlayers} players allowed`}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-12 bg-white rounded-xl shadow-xl p-8 border border-blue-100">
          <h3 className="text-2xl font-semibold mb-6 text-blue-800">Gaming Tips</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-medium text-blue-700 mb-4">For the Best Experience</h4>
              <ul className="space-y-3 text-blue-600">
                <li className="flex items-center">
                  <span className="mr-3 text-blue-400">•</span>
                  Take regular breaks between games
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-blue-400">•</span>
                  Try different games to exercise various skills
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-medium text-blue-700 mb-4">Game Benefits</h4>
              <ul className="space-y-3 text-blue-600">
                <li className="flex items-center">
                  <span className="mr-3 text-blue-400">•</span>
                  Enhances cognitive function
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-blue-400">•</span>
                  Provides stress relief through engaging activities
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Art Room Component
export const ArtRoom = () => {
  const [artworks, setArtworks] = useState([]);
  const [selectedTool, setSelectedTool] = useState('brush');
  const [canvasMode, setCanvasMode] = useState('create');

  const tools = [
    { id: 'brush', name: 'Brush', icon: PaintBrushIcon },
    { id: 'eraser', name: 'Eraser', icon: SwatchIcon },
  ];

  const handleSaveArtwork = (imageUrl) => {
    const newArtwork = {
      id: Date.now(),
      title: `Artwork ${artworks.length + 1}`,
      artist: 'Anonymous',
      imageUrl,
      createdAt: new Date().toISOString(),
    };
    setArtworks([newArtwork, ...artworks]);
    setCanvasMode('gallery');
  };

  const handleDeleteArtwork = (id) => {
    setArtworks(artworks.filter(artwork => artwork.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-900">Art Room</h1>
          <div className="space-x-4">
            {['create', 'gallery'].map(mode => (
              <button
                key={mode}
                className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 
                  ${canvasMode === mode 
                    ? 'bg-yellow-500 text-white shadow-lg' 
                    : 'bg-white text-yellow-700 hover:bg-yellow-100'}`}
                onClick={() => setCanvasMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {canvasMode === 'create' ? (
          <div className="space-y-6">
            <div className="flex space-x-4">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  className={`p-4 rounded-xl flex items-center transition-all duration-300
                    ${selectedTool === tool.id 
                      ? 'bg-orange-200 text-black shadow-md' 
                      : 'bg-orange-100 hover:bg-yellow-100'}`}
                  onClick={() => setSelectedTool(tool.id)}
                >
                  <tool.icon className="w-6 h-6 mr-2" />
                  <span className="text-yellow-800 font-medium">{tool.name}</span>
                </button>
              ))}
            </div>
            <Canvas selectedTool={selectedTool} onSave={handleSaveArtwork} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                onDelete={handleDeleteArtwork}
              />
            ))}
            {artworks.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No artworks yet. Start creating!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Export MusicRoom
export { MusicRoom };