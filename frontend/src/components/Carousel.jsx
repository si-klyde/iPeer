import React, { useState } from "react";

const therapists = [
  {
    name: "Anna Joanna Marquez",
    position: "Guidance Counselor",
    department: "College of Science",
    email: "something@gmail.com",
  },
  {
    name: "Junnevy Millora",
    position: "Guidance Counselor",
    department: "College of Science",
    email: "something@gmail.com",
  },
  {
    name: "Antonette Tillo",
    position: "Guidance Counselor",
    department: "College of Science",
    email: "something@gmail.com",
  },
  {
    name: "Therapist 4",
    position: "Guidance Counselor",
    department: "College of Science",
    email: "something@gmail.com",
  },
  {
    name: "Therapist 5",
    position: "Guidance Counselor",
    department: "College of Science",
    email: "something@gmail.com",
  },
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animation, setAnimation] = useState(""); // State for animation class
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

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

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div className="flex flex-col items-center bg-[#FFF9F9] py-8 mt-10">
      {/* Header Section */}
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        On-Campus Mental Health Support Staff
      </h2>
      <h3 className="text-md text-black/80 mb-6">
        Meet the professionals available to support mental health and wellness.
      </h3>

      {/* Carousel Section */}
      <div className="relative flex items-center justify-center w-full my-10">
        {/* Left Arrow */}
        <button
          className="absolute left-20 text-black bg-[#E6F4EA] size-16 p-2 rounded-full shadow-lg border border-gray-200 hover:bg-purple-100"
          onClick={handlePrev}
        >
          &#8592;
        </button>

        {/* Therapist Profiles */}
        <div
          className={`flex space-x-20 overflow-hidden transition-transform duration-500 drop-shadow-md my-10 ${animation}`}
        >
          {visibleTherapists.map((therapist, index) => (
            <div
              key={index}
              className="w-72 h-64 flex flex-col items-center bg-[#FFF9F9] rounded-lg shadow-lg border border-gray-200"
            >
              {/* Colored top bar */}
              <div className="w-full h-2 bg-green-600 rounded-t-lg"></div>

              <div className="p-6 mt-8 text-center">
                <p className="font-semibold text-lg text-gray-800 mb-2">
                  {therapist.name}
                </p>
                <p className="text-gray-600 text-base">{therapist.position}</p>
                <p className="text-gray-500 text-sm mt-2">
                  {therapist.department}
                </p>
                <p className="text-gray-500 text-sm mt-2">{therapist.email}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          className="absolute right-20 text-black bg-[#E6F4EA] size-16 p-2 rounded-full shadow-lg border border-gray-200 hover:bg-purple-100"
          onClick={handleNext}
        >
          &#8594;
        </button>
      </div>

      {/* Footer Section */}
      <button
        onClick={toggleModal}
        className="mt-6 text-green-700 hover:underline font-medium"
      >
        See full list →
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-3/4 max-w-3xl p-6 relative shadow-xl">
            {/* Close Button */}
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            {/* Modal Content */}
            <h2 className="text-2xl text-black font-bold text-center mb-6">
              Support Staff Lists
            </h2>
            <ul className="space-y-4">
              {therapists.map((therapist, index) => (
                <li
                  key={index}
                  className="flex justify-between bg-gray-100 p-4 rounded-lg shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {therapist.name}
                    </p>
                    <p className="text-gray-600">{therapist.position}</p>
                    <p className="text-gray-500 text-sm">
                      {therapist.department}
                    </p>
                  </div>
                  <p className="text-gray-500">{therapist.email}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carousel;
