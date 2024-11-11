import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import playTherapyImage from '../assets/therapy/play-therapy.webp';
import musicTherapyImage from '../assets/therapy/music-therapy.webp';
import artTherapyImage from '../assets/therapy/art-therapy.webp';

const TherapySection = ({ title, description, backgroundImage, isExpanded, onExpand }) => {
  return (
    <motion.div
      layout
      onClick={onExpand}
      className={`relative cursor-pointer transition-all duration-500 ease-in-out ${
        isExpanded ? 'w-screen' : 'w-[33.33vw]'
      } h-screen`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div 
        className={`absolute inset-0 flex items-center transition-all duration-500 ${
          isExpanded ? 'bg-opacity-85 justify-center' : 'bg-opacity-60 hover:bg-opacity-70 justify-center'
        } bg-black`}
      >
        {!isExpanded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl font-bold text-white transform -rotate-0 px-4 text-center">
              {title}
            </h2>
          </div>
        )}
        
        {isExpanded && (
          <div className="w-full max-w-4xl px-8 py-6 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-center">{title}</h2>
              <p className="text-lg mb-8 text-center max-w-2xl mx-auto leading-relaxed">
                {description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-black/30 p-6 rounded-lg backdrop-blur-sm">
                  <h3 className="text-xl font-semibold mb-4">Features</h3>
                  <ul className="space-y-3">
                    {title === 'Game Room' ? (
                      <>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Casual multiplayer games to help you unwind</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Chess, word games, and puzzle options</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Play solo or connect with other students</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Perfect study break activity</span>
                        </li>
                      </>
                    ) : title === 'Music Room' ? (
                      <>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Curated playlists for studying and relaxation</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Focus-enhancing background music</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Ambient sounds for stress relief</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Create and share your own playlists</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Digital canvas for creative expression</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Calming gallery of student artwork</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Simple drawing tools and templates</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Share your artwork with the community</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                
                <div className="bg-black/30 p-6 rounded-lg backdrop-blur-sm">
                  <h3 className="text-xl font-semibold mb-4">Benefits</h3>
                  <ul className="space-y-3">
                    {title === 'Game Room' ? (
                      <>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Reduce academic stress through casual gaming</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Build connections with fellow students</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Improve focus and problem-solving skills</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Take mindful breaks between study sessions</span>
                        </li>
                      </>
                    ) : title === 'Music Room' ? (
                      <>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Enhance study session productivity</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Manage stress through music therapy</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Improve sleep and relaxation</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Connect through shared musical experiences</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Express emotions through creativity</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Reduce anxiety through artistic activities</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Build a supportive creative community</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1">•</span>
                          <span>Take breaks from academic pressure</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="mt-12 flex justify-center">
                <button className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-colors">
                  Enter Room
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Therapy = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const therapySectionRef = useRef(null);

  const scrollToTherapies = () => {
    therapySectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const therapyOptions = [
    {
      id: 'play',
      title: 'Game Room',
      description: 'Take a break from academic stress with our collection of relaxing games. Whether you want to play solo or connect with other students, our Game Room offers a perfect escape for quick study breaks and stress relief.',
      backgroundImage: playTherapyImage
    },
    {
      id: 'music',
      title: 'Music Room',
      description: 'Immerse yourself in carefully curated playlists designed for studying, relaxation, and stress relief. Our Music Room provides the perfect soundscape for focused study sessions, meditation, or simply unwinding after a long day of classes.',
      backgroundImage: musicTherapyImage
    },
    {
      id: 'art',
      title: 'Art Room',
      description: 'Express yourself through digital art or find peace in viewing our student art gallery. Our Art Room provides simple creative tools and a supportive space for artistic expression, whether you are an experienced artist or just looking to doodle away some stress.',
      backgroundImage: artTherapyImage
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#E6F4EA] to-[#fff9f9] px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 text-center">
          Find Your Space to Unwind
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl text-center mb-8">
          Discover different ways to de-stress and relax between classes, during study breaks, or whenever you need a moment for yourself.
        </p>
        <button 
          onClick={scrollToTherapies}
          className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-700 transition"
        >
          Explore Rooms
        </button>
      </div>

      <div ref={therapySectionRef} className="relative h-screen flex overflow-hidden">
        {therapyOptions.map((therapy) => (
          <TherapySection
            key={therapy.id}
            title={therapy.title}
            description={therapy.description}
            backgroundImage={therapy.backgroundImage}
            isExpanded={expandedSection === therapy.id}
            onExpand={() => setExpandedSection(expandedSection === therapy.id ? null : therapy.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Therapy;
