import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth, authStateChanged } from '../firebase';
import logo from '../assets/ipeer-icon.png'; // Assuming you want to use the same logo
import { appointmentImage } from '../assets';

const BookAppointment = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [peerCounselors, setPeerCounselors] = useState([]);
  const [selectedPeerCounselor, setSelectedPeerCounselor] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [availabilityError, setAvailabilityError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Hide Header and Footer
    document.querySelector('header')?.classList.add('hidden');
    document.querySelector('footer')?.classList.add('hidden');

    return () => {
      // Restore Header and Footer visibility when leaving the page
      document.querySelector('header')?.classList.remove('hidden');
      document.querySelector('footer')?.classList.remove('hidden');
    };
  }, []);

  useEffect(() => {
    const fetchPeerCounselors = async () => {
      const cachedCounselors = localStorage.getItem('peerCounselors');
      if (cachedCounselors) {
        setPeerCounselors(JSON.parse(cachedCounselors));
      }

      try {
        const response = await axios.get('http://localhost:5000/api/peer-counselors');
        setPeerCounselors(response.data);
        localStorage.setItem('peerCounselors', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching peer counselors:', error);
      }
    };

    fetchPeerCounselors();
  }, []);

  useEffect(() => {
    authStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        navigate('/login');
      }
    });
  }, [navigate]);

  const checkAvailability = async (peerCounselorId, date, time) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/check-availability/${peerCounselorId}`,
        { params: { date, time } }
      );
      return response.data.available;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setAvailabilityError('');
    setIsLoading(true);
    setBookingSuccess(false);

    try {
      const isAvailable = await checkAvailability(selectedPeerCounselor, date, time);

      if (!isAvailable) {
        setAvailabilityError('The selected peer counselor is not available at this time. Please choose another date/time.');
        setIsLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/create-appointment', {
        date,
        time,
        description,
        peerCounselorId: selectedPeerCounselor,
        clientId: currentUserId,
      });

      setBookingSuccess(true);
      setTimeout(() => {
        navigate(`/appointments/client`);
      }, 2000);

    } catch (error) {
      if (error.response && error.response.status === 409) {
        setAvailabilityError(error.response.data.error);
      } else {
        console.error('Error booking appointment:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="max-w-screen-xl h-[80vh] bg-white shadow-lg sm:rounded-lg flex justify-center flex-1 animate-fade-up relative">
        
        {/* Back Arrow Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-transparent text-black text-xl font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200"
        >
          &#8592; {/* Left Arrow character */}
        </button>

        {/* Left Section */}
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 text-center">
          <a
            href="/home"
            className="text-2xl font-semibold flex items-center justify-center"
          >
            <img src={logo} alt="iPeer Logo" className="w-15 inline-block" />
            <span className="text-[#0e0e0e] font-code">iPeer</span>
          </a>
          <h2 className="text-4xl font-extrabold text-gray-800 my-8">
            Book an Appointment
          </h2>

          {availabilityError && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {availabilityError}
            </div>
          )}

          {bookingSuccess && (
            <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
              Appointment booked successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleBookAppointment}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="custom-input-date mb-4 w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="custom-input-time mb-4 w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mb-4 w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <select
              value={selectedPeerCounselor}
              onChange={(e) => setSelectedPeerCounselor(e.target.value)}
              className="mb-6 w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select a Peer Counselor</option>
              {peerCounselors.map((counselor) => (
                <option key={counselor.id} value={counselor.id}>
                  {counselor.fullName}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className={`w-full p-2 ${
                isLoading ? 'bg-blue-300' : 'rounded-lg bg-green-500 hover:bg-green-600'
              } text-white rounded flex items-center justify-center`}
              disabled={!date || !time || !selectedPeerCounselor || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⌛</span>
                  Booking...
                </>
              ) : (
                'Book Appointment'
              )}
            </button>
          </form>
        </div>

        {/* Right Section (Illustration) */}
        <div className="hidden lg:flex flex-1 bg-green-50 items-center justify-center">
          <div className="lg:w-5/6 flex justify-end mr-10">
            <img
              src={appointmentImage}
              alt="Appointment Illustration"
              className="size-[500px] rounded-lg"
            />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fadeUp 0.7s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BookAppointment;
