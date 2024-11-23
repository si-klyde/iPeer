import React, { useState } from 'react';
import playTherapyImage from '../assets/play-therapy.png'; // Sample image path
import musicTherapyImage from '../assets/music-therapy.jpg'; // Sample image path
import artTherapyImage from '../assets/art-therapy.jpg'; // Sample image path

// Modal Component
const Modal = ({ isOpen, onClose, title, description }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal-content bg-green-800 rounded-lg shadow-lg p-8 w-3/4 max-w-3xl">
        <span className="close cursor-pointer text-right text-xl" onClick={onClose}>&times;</span>
        <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
        <p className="text-center">{description}</p>
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
      description: 'Play therapy utilizes play, children’s natural medium of expression, to help them express their feelings more easily through toys instead of words.',
      buttonColor: 'bg-blue-500',
    },
    music: {
      title: 'Music Therapy',
      description: 'Music therapy is the clinical use of music to achieve goals like reducing stress, improving mood and expressing yourself.',
      buttonColor: 'bg-yellow-500',
    },
    art: {
      title: 'Art Therapy',
      description: 'Reduce conflicts and distress, improve cognitive functions, foster self-esteem, and build emotional resilience and social skills through art therapy.',
      buttonColor: 'bg-red-500',
    },
  };

  const handleButtonClick = (type) => {
    setModalContent(therapyData[type]);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#E6F4EA] to-[#D1E8FF] -mt-15 px-4">
      <h1 className="mb-10 text-3xl md:text-5xl font-bold text-gray-700 text-center">Therapy Options</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Play Therapy Card */}
        <div className="bg-white rounded-lg shadow-md p-10 flex flex-col items-center">
          <h2 className="bg-blue-300 w-full text-center text-xl font-semibold p-4 rounded-t-lg">Play Therapy</h2>
          <p className="text-center my-6">
            Play therapy utilizes play, children’s natural medium of expression, to help them express their feelings more easily through toys instead of words.
          </p>
          <button
            onClick={() => handleButtonClick('play')}
            className="mt-auto text-white px-4 py-3 rounded-lg w-full bg-blue-500 hover:bg-blue-700"
          >
            Start
          </button>
        </div>

        {/* Music Therapy Card */}
        <div className="bg-white rounded-lg shadow-md p-10 flex flex-col items-center">
          <h2 className="bg-yellow-300 w-full text-center text-xl font-semibold p-4 rounded-t-lg">Music Therapy</h2>
          <p className="text-center my-6">
            Music therapy is the clinical use of music to achieve goals like reducing stress, improving mood and expressing yourself.
          </p>
          <button
            onClick={() => handleButtonClick('music')}
            className="mt-auto text-white px-4 py-3 rounded-lg w-full bg-yellow-500 hover:bg-yellow-700"
          >
            Start
          </button>
        </div>

        {/* Art Therapy Card */}
        <div className="bg-white rounded-lg shadow-md p-10 flex flex-col items-center">
          <h2 className="bg-red-300 w-full text-center text-xl font-semibold p-4 rounded-t-lg">Art Therapy</h2>
          <p className="text-center my-6">
            Reduce conflicts and distress, improve cognitive functions, foster self-esteem, and build emotional resilience and social skills through art therapy.
          </p>
          <button
            onClick={() => handleButtonClick('art')}
            className="mt-auto text-white px-4 py-3 rounded-lg w-full bg-red-500 hover:bg-red-700"
          >
            Start
          </button>
        </div>
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
