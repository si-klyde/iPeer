import React, { useState } from "react";

const therapists = [
  {
    name: "Anna Joanna Marquez",
    image: "https://via.placeholder.com/150", // Replace with actual image URLs
  },
  {
    name: "Junnevy Millora",
    image: "https://via.placeholder.com/150", // Replace with actual image URLs
  },
  {
    name: "Antonette Tillo",
    image: "https://via.placeholder.com/150", // Replace with actual image URLs
  },
  {
    name: "Therapist 4",
    image: "https://via.placeholder.com/150", // Replace with actual image URLs
  },
  {
    name: "Therapist 5",
    image: "https://via.placeholder.com/150", // Replace with actual image URLs
  },
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animation, setAnimation] = useState(""); // State for animation class

  const visibleTherapists = therapists.slice(currentIndex, currentIndex + 3);

  const handlePrev = () => {
    setAnimation("slide-right");
    setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? therapists.length - 3 : prevIndex - 1
      );
      setAnimation("");
    }, 500); // Duration should match the CSS animation
  };

  const handleNext = () => {
    setAnimation("slide-left");
    setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex + 3 >= therapists.length ? 0 : prevIndex + 1
      );
      setAnimation("");
    }, 500); // Duration should match the CSS animation
  };

  return (
    <div className="flex flex-col items-center bg-[#FFF9F9] py-8 mt-10">
      {/* Header Section */}
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        On-Campus Mental Health Support Staff
      </h2>
      <h3 className="text-2xl text-gray-700 font-semibold mb-6">
        Need an Appointment ASAP?
      </h3>

      {/* Carousel Section */}
      <div className="relative flex items-center justify-center w-full">
        {/* Left Arrow */}
        <button
          className="absolute left-20 text-black bg-white size-16 p-2 rounded-full shadow-lg hover:bg-purple-100"
          onClick={handlePrev}
        >
          &#8592;
        </button>

        {/* Therapist Profiles with Animation */}
        <div className={`flex space-x-0 overflow-hidden transition-transform duration-500 ${animation}`}>
          {visibleTherapists.map((therapist, index) => (
            <div
              key={index}
              className="w-96 h-96 flex flex-col items-center justify-center bg-transparent rounded-lg p-2"
            >
              <img
                src={therapist.image}
                alt={therapist.name}
                className="w-52 h-52 rounded-full mb-4"
              />
              <p className="font-medium mt-5 text-black text-lg text-center">
                {therapist.name}
              </p>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          className="absolute right-20 text-black bg-white size-16 p-2 rounded-full shadow-lg hover:bg-purple-100"
          onClick={handleNext}
        >
          &#8594;
        </button>
      </div>

      {/* Footer Section */}
      <a
        href="#"
        className="mt-6 text-green-700 hover:underline font-medium"
      >
        See other available therapists →
      </a>
    </div>
  );
};

export default Carousel;
