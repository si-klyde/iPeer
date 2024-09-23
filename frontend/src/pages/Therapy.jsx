import React, { useState } from 'react';
import playTherapyImage from '../assets/play-therapy.png'; // Sample image path
import musicTherapyImage from '../assets/music-therapy.jpg'; // Sample image path
import artTherapyImage from '../assets/art-therapy.jpg'; // Sample image path

// Modal Component
const Modal = ({ isOpen, onClose, title, description }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal-content bg-green-300 rounded-lg shadow-lg p-8 w-3/4 max-w-3xl"> {/* Set width to 75% and max width */}
        <span className="close cursor-pointer text-right text-xl" onClick={onClose}>&times;</span>
        <h2 className="text-2xl font-bold text-center mb-4">{title}</h2> {/* Centered title */}
        <p className="text-center">{description}</p> {/* Centered description */}
      </div>
    </div>
  );
};

// Main Therapy Component
const Therapy = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', description: '' });

  const therapyData = {
    play: {
      title: 'Play Therapy',
      description: 'Play therapy is a form of therapy that uses play to help children express their feelings, explore their emotions, and develop problem-solving skills.',
      image: playTherapyImage,
    },
    music: {
      title: 'Music Therapy',
      description: 'Music therapy involves the use of music to address emotional, cognitive, and social needs of individuals. It can help improve mood and reduce anxiety.',
      image: musicTherapyImage,
    },
    art: {
      title: 'Art Therapy',
      description: 'Art therapy allows individuals to express themselves creatively while working through emotional and psychological challenges using artistic methods.',
      image: artTherapyImage,
    },
  };

  const handleButtonClick = (type) => {
    setModalContent(therapyData[type]);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-color-5 -mt-15">
      <h1 className="mb-4 text-3xl font-bold text-color-7">Therapy Options</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-15">
        {/* Play Therapy Button */}
        <button
          onClick={() => handleButtonClick('play')}
          className="relative w-80 h-80 overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          <img
            src={therapyData.play.image}
            alt="Play Therapy"
            className="absolute inset-0 object-cover w-full h-full"
          />
          <span className="relative z-10 text-2xl font-semibold text-white">Play Therapy</span>
        </button>

        {/* Music Therapy Button */}
        <button
          onClick={() => handleButtonClick('music')}
          className="relative w-80 h-80 overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          <img
            src={therapyData.music.image}
            alt="Music Therapy"
            className="absolute inset-0 object-cover w-full h-full"
          />
          <span className="relative z-10 text-2xl font-semibold text-white">Music Therapy</span>
        </button>

        {/* Art Therapy Button */}
        <button
          onClick={() => handleButtonClick('art')}
          className="relative w-80 h-80 overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          <img
            src={therapyData.art.image}
            alt="Art Therapy"
            className="absolute inset-0 object-cover w-full h-full"
          />
          <span className="relative z-10 text-2xl font-semibold text-white">Art Therapy</span>
        </button>
      </div>

      {/* Modal Component */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalContent.title} 
        description={modalContent.description} 
      />
    </div>
  );
};

export default Therapy;
