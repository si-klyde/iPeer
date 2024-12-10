import React, { useState, useRef, useEffect } from 'react';
import { 
  PaintBrushIcon, 
  DocumentTextIcon,
  Square2StackIcon,
  TrashIcon,
  ArrowUturnDownIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';

const ColorPicker = ({ selectedColor, onColorChange }) => {
  const colors = [
    '#508D4E', '#80ED99', '#CCD5AE', '#E9EDC9', 
    '#FEFAE0', '#FAEDCD', '#325D55', '#000000'
  ];

  return (
    <div className="flex space-x-2 mb-4">
      {colors.map(color => (
        <button
          key={color}
          className={`w-8 h-8 rounded-full border-2 ${
            selectedColor === color ? 'border-[#508D4E]' : 'border-gray-300'
          } hover:scale-110 transition-transform`}
          style={{ backgroundColor: color }}
          onClick={() => onColorChange(color)}
        />
      ))}
    </div>
  );
};

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
    
    // Set white background
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

  const handleSave = () => {
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave?.(dataUrl);
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
              onClick={handleSave}
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

  const tools = [
    { id: 'brush', name: 'Brush', icon: PaintBrushIcon },
    { id: 'eraser', name: 'Eraser', icon: SwatchIcon },
  ];

  const handleSaveArtwork = (dataUrl) => {
    const newArtwork = {
      id: Date.now(),
      image: dataUrl,
      createdAt: new Date().toLocaleString()
    };
    setArtworks([newArtwork, ...artworks]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9EDC9] to-[#FEFAE0] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Digital Canvas</h2>
            <button
              onClick={() => setShowGallery(!showGallery)}
              className="px-4 py-2 rounded-lg bg-[#508D4E] text-white hover:bg-[#325D55] transition-colors"
            >
              {showGallery ? 'Back to Canvas' : 'View Gallery'}
            </button>
          </div>
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
              <div className="flex space-x-4">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    className={`p-4 rounded-xl flex items-center transition-all duration-300
                      ${selectedTool === tool.id 
                        ? 'bg-[#508D4E] text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <tool.icon className="w-6 h-6 mr-2" />
                    <span className="text-gray-800 font-medium">{tool.name}</span>
                  </button>
                ))}
              </div>
              <Canvas selectedTool={selectedTool} onSave={handleSaveArtwork} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtRoom;