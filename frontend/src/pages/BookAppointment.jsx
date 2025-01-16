import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth, authStateChanged } from '../firebase';
import logo from '../assets/ipeer-icon.png'; // Assuming you want to use the same logo
import { appointmentImage } from '../assets';4
import { Tooltip } from 'react-tooltip'; // Add this package
import { motion } from 'framer-motion';
import BookingCalendar from '../components/BookingCalendar';

const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return {
    currentDate: `${year}-${month}-${day}`,
    currentTime: `${hours}:${minutes}`
  };
};

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
  const [clientSchool, setClientSchool] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [step, setStep] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
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
    const fetchAvailableSlots = async () => {
      if (date && selectedPeerCounselor) {
        console.log('Fetching slots - Parameters:', { 
          counselorId: selectedPeerCounselor, 
          date: date 
        });
        
        try {
          const response = await axios.get(
            `http://localhost:5000/api/available-slots/${selectedPeerCounselor}`,
            { params: { date } }
          );
          
          console.log('API Response:', response.data);
          
          if (response.data.availableSlots) {
            console.log('Setting available slots:', response.data.availableSlots);
            setAvailableTimeSlots(response.data.availableSlots);
          } else {
            console.error('No available slots in response');
            setAvailableTimeSlots([]);
          }
        } catch (error) {
          console.error('Error fetching slots:', error.response || error);
          setAvailableTimeSlots([]);
        }
      }
    };
  
    fetchAvailableSlots();
  }, [date, selectedPeerCounselor]);

  useEffect(() => {
    const fetchPeerCounselors = async () => {
      const cachedCounselors = localStorage.getItem('peerCounselors');
      if (cachedCounselors) {
        setPeerCounselors(JSON.parse(cachedCounselors));
      }

      try {
        //Fetch Client data 
        const clientResponse = await axios.get(`http://localhost:5000/api/client/${currentUserId}`);
        const userSchool = clientResponse.data.school;
        setClientSchool(userSchool);

        // Fetch peer counselors
        const counselorsResponse = await axios.get('http://localhost:5000/api/peer-counselors');
        
        // Filter counselors by school
        const filteredCounselors = counselorsResponse.data.filter(counselor => 
          counselor.school === userSchool
        );

        setPeerCounselors(filteredCounselors);
        localStorage.setItem('peerCounselors', JSON.stringify(filteredCounselors));

      } catch (error) {
        console.error('Error fetching peer counselors:', error);
      }
    };

    if (currentUserId) {
      fetchPeerCounselors();
    }
  }, [currentUserId]);

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

    const { currentDate, currentTime } = getCurrentDateTime();

    // Check if selected date is in the past
    if (date < currentDate) {
      setAvailabilityError('Cannot book appointments in the past. Please select a future date.');
      setIsLoading(false);
      return;
    }

    // Check if selected time is in the past for today's appointments
    if (date === currentDate && time < currentTime) {
      setAvailabilityError('Cannot book appointments in the past. Please select a future time.');
      setIsLoading(false);
      return;
    }
    
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

      const appointmentData = response.data;
      console.log('Appointment created:', appointmentData);

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

  const steps = [
    { number: 1, title: 'Select Counselor' },
    { number: 2, title: 'Choose Date & Time' },
    { number: 3, title: 'Add Details' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-100 flex justify-center items-center p-2 sm:p-4 md:p-6"
    >
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg">
        {/* Progress Steps */}
        <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center">
                <div className={`
                  w-6 h-6 sm:w-8 sm:h-8 rounded-full 
                  flex items-center justify-center
                  text-sm sm:text-base font-medium
                  transition-colors duration-200
                  ${step >= s.number 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-300 text-gray-500'
                  }
                `}>
                  {s.number}
                </div>
                <div className={`
                  hidden sm:block ml-2 
                  text-xs sm:text-sm font-medium
                  transition-colors duration-200
                  ${step >= s.number 
                    ? 'text-green-600' 
                    : 'text-gray-500'
                  }
                `}>
                  {s.title}
                </div>
                {i < steps.length - 1 && (
                  <div className={`
                    h-1 w-8 sm:w-16 md:w-20 mx-1 sm:mx-2
                    transition-colors duration-200
                    ${step > s.number 
                      ? 'bg-green-500' 
                      : 'bg-gray-200'
                    }
                  `} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleBookAppointment} className="space-y-6">
            {/* Step 1: Counselor Selection */}
            {step === 1 && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                  Choose Your Counselor
                </h2>
                <select
                  value={selectedPeerCounselor}
                  onChange={(e) => {
                    setSelectedPeerCounselor(e.target.value);
                    if (e.target.value) setStep(2);
                  }}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white shadow-sm hover:border-green-400"
                >
                  <option value="">Select a counselor...</option>
                  {peerCounselors.map((counselor) => (
                    <option key={counselor.id} value={counselor.id}>
                      {counselor.fullName}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Step 2: Date & Time Selection */}
            {step === 2 && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                  Schedule Your Session
                </h2>
                
                <BookingCalendar 
                  date={date}
                  onDateChange={(newDate) => {
                    setDate(newDate.toISOString().split('T')[0]);
                  }}
                />

                <div className="space-y-4">
                  <label className="text-base sm:text-lg font-medium text-gray-700">
                    Select Time
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {availableTimeSlots.length > 0 ? (
                      availableTimeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            setTime(slot);
                            setStep(3);
                          }}
                          className={`py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ${
                            time === slot
                              ? 'bg-green-500 text-white shadow-lg transform scale-105'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-400 hover:shadow'
                          }`}
                        >
                          {slot}
                        </button>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full text-center p-4 sm:p-8 bg-gray-50 rounded-xl border-2 border-gray-200"
                      >
                        <div className="text-sm sm:text-base text-gray-600 font-medium">
                          No available time slots for this date
                        </div>
                        <div className="mt-2 text-xs sm:text-sm text-gray-500">
                          Please select a different date to view other available slots
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Description */}
            {step === 3 && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                  Add Session Details
                </h2>
                
                <div className="space-y-4">
                  <label className="text-base sm:text-lg font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What would you like to discuss in this session?"
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 min-h-[120px] sm:min-h-[150px] resize-none shadow-sm hover:border-green-400"
                  />
                </div>

                {availabilityError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md"
                  >
                    <p className="text-sm text-red-700">{availabilityError}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 sm:py-4 px-6 text-base sm:text-lg font-semibold rounded-xl bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:shadow-none"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Booking...</span>
                    </span>
                  ) : (
                    'Confirm Appointment'
                  )}
                </button>
              </motion.div>
            )}
          </form>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(step - 1)}
                className="px-4 sm:px-6 py-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors flex items-center space-x-2 text-sm sm:text-base"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 19l-7-7 7-7" 
                  />
                </svg>
                <span>Back</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-green-500 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Success Message */}
      {bookingSuccess && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="fixed top-4 sm:top-8 left-1/2 transform -translate-x-1/2 bg-white shadow-2xl rounded-xl p-4 sm:p-6 flex items-center space-x-4 w-[90%] max-w-md z-50"
        >
          <div className="bg-green-100 rounded-full p-2 sm:p-3">
            <svg 
              className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-1">
              Booking Confirmed!
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Your appointment has been successfully scheduled
            </p>
          </div>
          <button 
            onClick={() => setBookingSuccess(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BookAppointment;