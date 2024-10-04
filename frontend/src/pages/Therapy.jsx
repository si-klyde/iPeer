import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import playTherapyImage from '../assets/therapy/play-therapy.webp';
import musicTherapyImage from '../assets/therapy/music-therapy.webp';
import artTherapyImage from '../assets/therapy/art-therapy.webp';

const Therapy = () => {
    const [selectedTherapy, setSelectedTherapy] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    const therapyData = {
        play: {
            title: 'Play Therapy',
            details: 'Play therapy uses play to help children express feelings and develop problem-solving skills.',
            image: playTherapyImage,
        },
        music: {
            title: 'Music Therapy',
            details: 'Music therapy uses music to address emotional, cognitive, and social needs.',
            image: musicTherapyImage,
        },
        art: {
            title: 'Art Therapy',
            details: 'Art therapy allows individuals to express themselves creatively while addressing emotional challenges.',
            image: artTherapyImage,
        },
    };

    const handleButtonClick = (type) => {
        if (selectedTherapy !== type) {
            setSelectedTherapy(type);
            setIsVisible(true);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            setSelectedTherapy(null);
        }, 300); // Match the animation duration
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape' && selectedTherapy) {
            handleClose();
        }
    };

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    // Add this useEffect to scroll to the top when a therapy is selected
    useEffect(() => {
        if (selectedTherapy) {
            // Delay the scroll to allow layout to update first
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 10); // A short delay (10ms) should be enough to allow layout adjustments
        }
    }, [selectedTherapy]);    

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedTherapy]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#E6F4EA] relative p-4">
            {/* New Full-Screen Text Section */}
            <div className="w-full h-[calc(100vh-7rem)] flex flex-col items-center justify-center bg-white mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                    Explore Different Types of Therapy
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl text-center">
                    Discover how different therapeutic approaches can help you or your loved ones on a journey of healing and self-expression. Each therapy offers unique benefits tailored to individual needs and preferences.
                </p>
            </div>

            {/* Therapy Options Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full ${selectedTherapy ? 'hidden' : 'block'}`}>
                {Object.keys(therapyData).map((type) => (
                    <div
                        key={type}
                        className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer w-full h-[calc(100vh-2rem)]"
                        onClick={() => handleButtonClick(type)}
                    >
                        <img
                            src={therapyData[type].image}
                            alt={therapyData[type].title}
                            className="absolute inset-0 object-cover w-full h-full"
                        />
                        <span className="relative z-10 text-xl md:text-2xl font-semibold text-white bg-black bg-opacity-40 p-4 rounded-lg">
                            {therapyData[type].title}
                        </span>
                    </div>
                ))}
            </div>

            {/* Selected Therapy Details */}
            {selectedTherapy && (
                <motion.div
                    className="absolute inset-4 flex flex-col md:flex-row z-20"
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                    variants={fadeUpVariants}
                >
                    <div className="w-full md:w-1/4 h-full bg-white overflow-hidden rounded-lg shadow-lg relative">
                        <img
                            src={therapyData[selectedTherapy].image}
                            alt={therapyData[selectedTherapy].title}
                            className="absolute inset-0 object-cover w-full h-full"
                        />
                        <span className="relative z-10 text-3xl font-semibold text-white bg-black bg-opacity-40 p-4 rounded-lg">
                            {therapyData[selectedTherapy].title}
                        </span>
                    </div>

                    <div className="w-full md:w-3/4 p-6 md:p-10 bg-white rounded-lg shadow-lg flex-grow relative">
                        <button
                            className="absolute top-4 right-4 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            onClick={handleClose}
                        >
                            Close
                        </button>
                        <h2 className="text-2xl md:text-4xl font-bold mb-4">
                            {therapyData[selectedTherapy].title}
                        </h2>
                        <p className="text-lg">{therapyData[selectedTherapy].details}</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Therapy;
