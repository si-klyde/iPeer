import { useEffect, useState, useRef } from "react";
import playTherapyImage from '../assets/therapy/play-therapy.webp';
import musicTherapyImage from '../assets/therapy/music-therapy.webp';
import artTherapyImage from '../assets/therapy/art-therapy.webp';

const Therapy = () => {
    const [selectedTherapy, setSelectedTherapy] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const buttonsSectionRef = useRef(null); // Create a ref for the buttons section
    
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
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTherapy(null);
    };

    const scrollToButtonsSection = () => {
        buttonsSectionRef.current.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to the buttons section
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#E6F4EA] relative">
            {/* Full-Screen Text Section */}
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#E6F4EA] mb-0">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                    Explore Different Types of Therapy
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl text-center mb-8">
                    Discover how different therapeutic approaches can help you or your loved ones on a journey of healing and self-expression. Each therapy offers unique benefits tailored to individual needs and preferences.
                </p>
                <button
                    onClick={scrollToButtonsSection}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                    Explore
                </button>
            </div>

            {/* New Section with Background Color */}
            <div ref={buttonsSectionRef} className="w-full h-screen bg-[rgb(255_249_249/var(--tw-bg-opacity))] flex flex-col items-center justify-center">
                {/* Image Buttons Section with Even Distribution */}
                <div className="flex justify-evenly w-full max-w-8xl px-4">
                    {Object.keys(therapyData).map((type) => (
                        <button
                            key={type}
                            onClick={() => handleButtonClick(type)}
                            className={`relative w-full h-[calc(100vh/1-8rem)] rounded-md overflow-hidden shadow-lg cursor-pointer transition-transform duration-300 transform hover:scale-105 mx-2`} // Increased height for buttons
                        >
                            <img
                                src={therapyData[type].image}
                                alt={therapyData[type].title}
                                className="absolute inset-0 object-cover w-full h-full"
                            />
                            <span className="relative z-10 flex items-center justify-center h-full w-full text-lg md:text-2xl font-bold text-white bg-black bg-opacity-50 rounded-md text-center uppercase">
                                {therapyData[type].title}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && selectedTherapy && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[800px] h-[600px] mx-auto flex flex-col"> {/* Modal now uses flex column */}
                        <h2 className="text-2xl font-bold mb-2 text-center text-black">{therapyData[selectedTherapy].title}</h2> {/* Changed to black */}
                        <img 
                            src={therapyData[selectedTherapy].image} 
                            alt={therapyData[selectedTherapy].title} 
                            className="w-full h-1/2 object-cover rounded-md mb-4" // Set the image height to half of the modal
                        />
                        <p className="text-lg mb-4 flex-1 text-center text-black">{therapyData[selectedTherapy].details}</p> {/* Changed to black and allowed the text to take remaining space */}
                        <div className="mt-auto flex justify-end"> {/* Align the button to the bottom right */}
                            <button onClick={closeModal} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Therapy;
