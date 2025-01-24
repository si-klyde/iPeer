import React, { useState, useEffect } from 'react';
import { 
  MusicalNoteIcon,
  HeartIcon,
  SparklesIcon,
  CloudIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { logRoomEntry } from '../../utils/roomLogger';

// YouTube Playlist configuration with correct embed URLs
const PLAYLISTS = {
  focus: { 
    id: 'mJW57E7GpSo',
    embedUrl: 'https://www.youtube.com/embed/sAcj8me7wGI?autoplay=1',
    name: 'Focus Mode',
    description: 'Beautiful piano music to help you concentrate',
    icon: <SparklesIcon className="w-6 h-6 text-white" />,
    color: 'from-[#508D4E] to-[#80ED99]'
  },
  relax: { 
    id: 'PLQkQfzsIUwRYHN4pxZ-g3KCF_yPr9Xz_m',
    embedUrl: 'https://www.youtube.com/embed/bP9gMpl1gyQ?autoplay=1',
    name: 'Chill & Relax',
    description: 'Soothing melodies for relaxation',
    icon: <HeartIcon className="w-6 h-6 text-white" />,
    color: 'from-[#CCD5AE] to-[#E9EDC9]'
  },
  ambient: { 
    id: 'PLQkQfzsIUwRZuFW0zWn5eXwpLZE5sAS_x',
    embedUrl: 'https://www.youtube.com/embed/sjkrrmBnpGE?autoplay=1',
    name: 'Ambient',
    description: 'Peaceful ambient sounds and music',
    icon: <CloudIcon className="w-6 h-6 text-white" />,
    color: 'from-[#FEFAE0] to-[#FAEDCD]'
  },
  lofi: { 
    id: 'PLQkQfzsIUwRaJgpxqKUU8gmHqYxZ-6yzR',
    embedUrl: 'https://www.youtube.com/embed/6H-PLF2CR18?autoplay=1',
    name: 'Lo-Fi Beats',
    description: 'Relaxing beats for study and work',
    icon: <MusicalNoteIcon className="w-6 h-6 text-white" />,
    color: 'from-[#325D55] to-[#508D4E]'
  }
};

const PlaylistEmbed = ({ playlist, onBack }) => {
  return (
    <div className="w-full h-[calc(100vh-12rem)] bg-white/90 rounded-2xl overflow-hidden shadow-2xl">
      <div className={`w-full h-full bg-gradient-to-br ${playlist.color} relative`}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center bg-gradient-to-b from-black/10 to-transparent">
          <button 
            onClick={onBack}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </button>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-white">{playlist.name}</h3>
            <p className="text-white/80">{playlist.description}</p>
          </div>
        </div>

        {/* YouTube Embed */}
        <div className="w-full h-full pt-20">
          <iframe
            className="w-full h-full"
            src={playlist.embedUrl}
            title={playlist.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

const PlaylistCard = ({ playlist, onSelect }) => {
  return (
    <button 
      onClick={() => onSelect(playlist)}
      className={`group relative w-full aspect-square rounded-2xl 
        hover:scale-[1.02] transition-all duration-300 ease-out shadow-lg`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${playlist.color} 
        opacity-90 group-hover:opacity-100 transition-opacity`} />
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-gray-800">
        <div className="p-6 rounded-full bg-white/30 mb-6 
          group-hover:bg-white/40 transition-colors">
          {playlist.icon}
        </div>
        <h3 className="text-2xl font-bold mb-3">{playlist.name}</h3>
        <p className="text-gray-700 text-center text-sm max-w-[80%]">
          {playlist.description}
        </p>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 
        transition-colors duration-300" />
    </button>
  );
};

export const MusicRoom = () => {
  const [currentPlaylist, setCurrentPlaylist] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      logRoomEntry('Music Room');
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-[1600px] h-auto bg-[#E6F4EA] mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className=" text-4xl font-bold mb-2 text-gray-800">Music Room</h1>
          <p className="text-gray-600">
            Select a category to start your musical journey
          </p>
        </div>
      </div>

      {/* Content */}
      {currentPlaylist ? (
        <PlaylistEmbed 
          playlist={currentPlaylist} 
          onBack={() => setCurrentPlaylist(null)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(PLAYLISTS).map(([key, playlist]) => (
            <PlaylistCard
              key={key}
              playlist={playlist}
              onSelect={setCurrentPlaylist}
            />
          ))}
        </div>
      )}
    </div>
  );
};