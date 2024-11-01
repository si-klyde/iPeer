import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Game Room Component
export const GameRoom = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [players, setPlayers] = useState([]);

  const games = [
    { id: 'chess', name: 'Chess', minPlayers: 2, maxPlayers: 2 },
    { id: 'wordscape', name: 'Word Puzzle', minPlayers: 1, maxPlayers: 1 },
    { id: 'memory', name: 'Memory Cards', minPlayers: 1, maxPlayers: 4 },
    { id: 'sudoku', name: 'Sudoku', minPlayers: 1, maxPlayers: 1 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Game Room</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <div 
              key={game.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedGame(game)}
            >
              <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
              <p className="text-gray-600">
                {game.minPlayers === game.maxPlayers 
                  ? `${game.minPlayers} player${game.minPlayers > 1 ? 's' : ''}`
                  : `${game.minPlayers}-${game.maxPlayers} players`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Music Room Component
export const MusicRoom = () => {
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playlists = [
    { id: 'focus', name: 'Deep Focus', description: 'Ambient sounds for concentrated study' },
    { id: 'relax', name: 'Relaxation', description: 'Calming melodies for stress relief' },
    { id: 'nature', name: 'Nature Sounds', description: 'Peaceful environmental sounds' },
    { id: 'meditation', name: 'Meditation', description: 'Guided meditation tracks' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Music Room</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setCurrentPlaylist(playlist)}
            >
              <h3 className="text-xl font-semibold mb-2">{playlist.name}</h3>
              <p className="text-gray-600">{playlist.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Art Room Component
export const ArtRoom = () => {
  const [selectedTool, setSelectedTool] = useState('brush');
  const [canvasMode, setCanvasMode] = useState('create'); // 'create' or 'gallery'

  const tools = [
    { id: 'brush', name: 'Brush', icon: '🖌️' },
    { id: 'eraser', name: 'Eraser', icon: '🧽' },
    { id: 'shapes', name: 'Shapes', icon: '⭕' },
    { id: 'text', name: 'Text', icon: '📝' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Art Room</h1>
          <div className="space-x-4">
            <button 
              className={`px-4 py-2 rounded-full ${canvasMode === 'create' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setCanvasMode('create')}
            >
              Create
            </button>
            <button 
              className={`px-4 py-2 rounded-full ${canvasMode === 'gallery' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setCanvasMode('gallery')}
            >
              Gallery
            </button>
          </div>
        </div>

        {canvasMode === 'create' ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex space-x-4 mb-4">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  className={`p-3 rounded-lg ${selectedTool === tool.id ? 'bg-yellow-100' : 'bg-gray-50'}`}
                  onClick={() => setSelectedTool(tool.id)}
                >
                  <span className="text-2xl">{tool.icon}</span>
                  <span className="ml-2">{tool.name}</span>
                </button>
              ))}
            </div>
            <div className="w-full h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              {/* Canvas implementation will go here */}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gallery implementation will go here */}
          </div>
        )}
      </div>
    </div>
  );
};