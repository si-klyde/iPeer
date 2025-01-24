import React, { useState, useRef, useEffect } from 'react';
import { 
  PaintBrushIcon, 
  DocumentTextIcon,
  Square2StackIcon,
  TrashIcon,
  ArrowUturnDownIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { logRoomEntry } from '../../utils/roomLogger';

const ColorPicker = ({ selectedColor, onColorChange }) => {
  const colors = [
    // Primary Colors
    '#FF0000', '#0000FF', '#FFFF00',
    // Secondary Colors
    '#00FF00', '#FF00FF', '#00FFFF',
    // Earth Tones
    '#8B4513', '#A0522D', '#6B4423',
    // Skin Tones
    '#FFE0BD', '#FFD1AA', '#E3B38D',
    // Nature Colors
    '#228B22', '#32CD32', '#90EE90',
    // Sky and Water
    '#87CEEB', '#4169E1', '#1E90FF',
    // Warm Colors
    '#FFA500', '#FF6347', '#FF4500',
    // Cool Colors
    '#800080', '#4B0082', '#483D8B',
    // Grayscale
    '#000000', '#808080', '#FFFFFF'
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 w-full max-w-md mx-auto p-2">
      {colors.map(color => (
        <button
          key={color}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
            selectedColor === color ? 'border-[#508D4E] scale-110' : 'border-gray-300'
          } hover:scale-110 transition-transform shadow-sm`}
          style={{ backgroundColor: color }}
          onClick={() => onColorChange(color)}
        />
      ))}
    </div>
  );
};

const Canvas = ({ selectedTool, setSelectedTool, onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  const tools = [
    { id: 'brush', name: 'Brush', icon: PaintBrushIcon },
    { id: 'eraser', name: 'Eraser', icon: SwatchIcon },
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    setContext(ctx);
    
    // Set white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, []);

  // Update context when color or brush size changes
  useEffect(() => {
    if (context) {
      context.strokeStyle = selectedTool === 'eraser' ? '#FFFFFF' : color;
      context.lineWidth = brushSize;
    }
  }, [color, brushSize, selectedTool]);

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
    
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const pos = getMousePos(e);
    setIsDrawing(true);
    setLastX(pos.x);
    setLastY(pos.y);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
    context.strokeStyle = selectedTool === 'eraser' ? '#FFFFFF' : color;
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    context.strokeStyle = selectedTool === 'eraser' ? '#FFFFFF' : color;
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
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 space-y-6">
        {/* Drawing Tools */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            {/* Tool Buttons */}
            <div className="flex space-x-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    selectedTool === tool.id
                      ? 'bg-[#508D4E] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tool.icon className="w-5 h-5" />
                  <span>{tool.name}</span>
                </button>
              ))}
            </div>

            {/* Action Icons */}
            <div className="flex space-x-2">
              <button
                onClick={undo}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                disabled={currentStep <= 0}
                title="Undo"
              >
                <ArrowUturnDownIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={clearCanvas}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Clear Canvas"
              >
                <TrashIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => onSave?.(canvasRef.current.toDataURL('image/png'))}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Save Artwork"
              >
                <Square2StackIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Brush Size Control */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <label className="text-sm text-gray-600 whitespace-nowrap">Brush Size:</label>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-32 sm:w-40"
            />
          </div>
        </div>

        {/* Color Picker */}
        <div className="py-2">
          <ColorPicker selectedColor={color} onColorChange={setColor} />
        </div>
        
        {/* Canvas */}
        <div className="relative w-full" style={{ paddingBottom: '100%' }}>
          <canvas
            ref={canvasRef}
            width={1500}
            height={1500}
            className="absolute top-0 left-0 w-full h-full border border-gray-300 rounded-lg cursor-crosshair touch-none bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
};

const ArtworkCard = ({ artwork, onDelete }) => {
  return (
    <div className="relative bg-white rounded-xl shadow-lg p-4">
      <img
        src={artwork.image}
        alt={artwork.image}
        className="w-full aspect-square object-cover rounded-lg"
      />
      <div className="mt-2">
        <h3 className="font-semibold text-gray-800">{artwork.createdAt}</h3>
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

const ArtRoom = () => {
  const [artworks, setArtworks] = useState([]);
  const [selectedTool, setSelectedTool] = useState('brush');
  const [showGallery, setShowGallery] = useState(false);

  const handleSaveArtwork = (dataUrl) => {
    const newArtwork = {
      id: Date.now(),
      image: dataUrl,
      createdAt: new Date().toLocaleString()
    };
    setArtworks([newArtwork, ...artworks]);
  };

  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      logRoomEntry('Art Room');
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="h-auto bg-gradient-to-br from-[#E9EDC9] to-[#FEFAE0] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Digital Canvas</h2>
            <button
              onClick={() => setShowGallery(!showGallery)}
              className="px-6 py-2 rounded-lg bg-[#508D4E] text-white hover:bg-[#325D55] transition-colors"
            >
              {showGallery ? 'Back to Canvas' : 'View Gallery'}
            </button>
          </div>

          {/* Content */}
          {showGallery ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onDelete={() => setArtworks(artworks.filter(a => a.id !== artwork.id))}
                />
              ))}
              {artworks.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No artworks yet. Start creating!
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <Canvas 
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                onSave={handleSaveArtwork}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtRoom;