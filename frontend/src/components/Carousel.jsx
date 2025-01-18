import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, authStateChanged, firestore } from '../firebase';
import API_CONFIG from '../config/api.js';

const Carousel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [peerCounselors, setPeerCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [clientSchool, setClientSchool] = useState('');
  const [counselorPhotos, setCounselorPhotos] = useState({});

  useEffect(() => {
    authStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribers = [];
  
    peerCounselors.forEach((counselor) => {
      const profileDocRef = doc(firestore, 'users', counselor.id, 'profile', 'details');
      const unsubscribe = onSnapshot(profileDocRef, (profileDoc) => {
        const profileData = profileDoc.exists() ? profileDoc.data() : {};
        setCounselorPhotos(prev => ({
          ...prev,
          [counselor.id]: profileData.photoURL
        }));
      });
      unsubscribers.push(unsubscribe);
    });
  
    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }, [peerCounselors]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUserId) return;
      
      try {
        // Get client's school
        const clientResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/client/${currentUserId}`);
        const userSchool = clientResponse.data.school;
        setClientSchool(userSchool);

        // Get peer counselors
        const counselorsResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/peer-counselors`);
        
        // Filter by school
        const filteredCounselors = counselorsResponse.data.filter(counselor => 
          counselor.school === userSchool
        );

        setPeerCounselors(filteredCounselors);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUserId]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Custom Arrow Components
  const PrevArrow = ({ onClick }) => (
    <button
      className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 bg-white shadow-xl drop-shadow-md rounded-full p-2 hover:bg-gray-100 z-10"
      onClick={onClick}
    >
      <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
    </button>
  );

  const NextArrow = ({ onClick }) => (
    <button
      className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 bg-white shadow-xl drop-shadow-md rounded-full p-2 hover:bg-gray-100 z-10"
      onClick={onClick}
    >
      <ChevronRightIcon className="h-6 w-6 text-gray-600" />
    </button>
  );

  // Slick Carousel settings
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: Math.min(3, peerCounselors.length),
    slidesToScroll: 1,
    centerPadding: "30px",
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024, // Medium screens
        settings: {
          slidesToShow: Math.min(2, peerCounselors.length), // Show 2 cards
        },
      },
      {
        breakpoint: 768, // Small screens
        settings: {
          slidesToShow: 1, // Show 1 card
        },
      },
    ],
  };

  if (loading) {
    return <div className="text-center py-10">Loading counselors...</div>;
  }

  return (
    <div className="flex flex-col items-center bg-[#FFF9F9] py-10 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <h2 className="text-3xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 text-center">
        On-Campus Mental Health Support Staff
      </h2>
      <h3 className="text-sm sm:text-md lg:text-lg text-gray-600 mt-4 text-center">
        Meet the peer-counselors available to support mental health and wellness.
      </h3>

      {/* Carousel Container */}
      <div className="w-full sm:w-[85%]">
        <Slider {...settings}>
          {peerCounselors.map((counselor) => (
            <div key={counselor.id} className="px-4 sm:px-8 py-10">
              {/* Card */}
              <div className="flex flex-col h-100 mt-5 items-center bg-[#FFF9F9] rounded-lg shadow-lg drop-shadow-md border border-gray-200">
                {/* Green Top Bar */}
                <div className="w-full h-2 bg-green-600 rounded-t-lg"></div>

                <div className="mt-6">
                  <img
                    src={counselorPhotos[counselor.id] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzY0NzRmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzY0YjNmNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PC9zdmc+'}
                    alt={`${counselor.fullName}'s profile`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-green-600"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </div>
                <div className="p-6 sm:p-10 space-y-4 text-center">
                  <p className="font-semibold text-md sm:text-lg text-gray-800 mb-2">
                    {counselor.fullName}
                  </p>
                  <p className="text-gray-600">Peer Counselor</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {counselor.school}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    {counselor.college}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">{counselor.email}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Footer Section */}
      <button
        onClick={toggleModal}
        className="mt-10 sm:mt-20 text-md sm:text-lg text-green-700 hover:underline font-medium"
      >
        See full list →
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg w-full sm:w-3/4 max-w-3xl p-4 sm:p-6 relative shadow-xl">
            {/* Close Button */}
            <button
              onClick={toggleModal}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            {/* Modal Content */}
            <h2 className="text-lg sm:text-xl text-black font-bold text-center mb-4 sm:mb-6">
              Support Staff Lists
            </h2>
            <ul className="space-y-2 sm:space-y-4">
              {therapists.map((therapist, index) => (
                <li
                  key={index}
                  className="flex flex-col sm:flex-row justify-between bg-gray-100 p-2 sm:p-4 rounded-lg shadow-sm"
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
                  <p className="text-gray-500 mt-2 sm:mt-0">{therapist.email}</p>
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
