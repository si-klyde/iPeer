import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { User } from 'lucide-react';
import axios from 'axios';
import API_CONFIG from '../config/api.js';

const WaitingRoom = () => {
    const [isRequesting, setIsRequesting] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [showOnlineCounselors, setShowOnlineCounselors] = useState(false);
    const [onlineCounselors, setOnlineCounselors] = useState([]);
    const [clientSchool, setClientSchool] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchOnlineCounselors = async () => {
          try {
            const currentUser = auth.currentUser;
            const token = await currentUser.getIdToken();
            
            // Get client's school first
            const clientResponse = await axios.get(
              `${API_CONFIG.BASE_URL}/api/client/${currentUser.uid}`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            console.log('Client school data:', clientResponse.data);
            setClientSchool(clientResponse.data.school);
      
            // Get online counselors
            const counselorsResponse = await axios.get(
              `${API_CONFIG.BASE_URL}/api/peer-counselors/available`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );

            console.log('=== Debug Info ===');
            console.log('1. Client School:', clientResponse.data.school);
            console.log('2. Raw Counselors Data:', counselorsResponse.data);
            console.log('3. Schools in counselor data:', counselorsResponse.data.map(c => c.school));
      
            // Filter counselors by school
            const filteredCounselors = counselorsResponse.data.filter(
              counselor => counselor.school === clientResponse.data.school
            );
            console.log('Filtered counselors from same school:', filteredCounselors);
            setOnlineCounselors(filteredCounselors);
          } catch (error) {
            console.error('Error fetching online counselors:', error);
          }
        };
      
        fetchOnlineCounselors();
        // Set up polling every 30 seconds
        const interval = setInterval(fetchOnlineCounselors, 30000);
        return () => clearInterval(interval);
      }, []);

    useEffect(() => {
        // Hide Header and Footer
        document.querySelector('header')?.classList.add('hidden');
        document.querySelector('footer')?.classList.add('hidden');

        return () => {
            document.querySelector('header')?.classList.remove('hidden');
            document.querySelector('footer')?.classList.remove('hidden');
        };
    }, []);

    const requestInstantSession = async () => {
        try {
          console.log('Initiating instant session request...');
          setIsRequesting(true);
          const currentUser = auth.currentUser;
          const token = await currentUser.getIdToken();
      
          // Check for available counselors through backend
          console.log('Checking for available counselors...');
          const counselorsResponse = await axios.get(
            `${API_CONFIG.BASE_URL}/api/peer-counselors/available`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          const allAvailableCounselors = counselorsResponse.data;
          console.log('All available counselors:', allAvailableCounselors);
      
          // Filter counselors by school and verification status
          const availableCounselors = allAvailableCounselors.filter(counselor => 
            counselor.school === clientSchool && 
            counselor.verificationStatus === 'verified' &&
            counselor.accountStatus === 'active'
          );
          
          console.log('Filtered counselors:', availableCounselors);
      
          if (!availableCounselors.length) {
            console.log('No eligible counselors available');
            toast.error('No verified peer counselors from your school are available. Please try again later.');
            setIsRequesting(false);
            return;
          }
      
          // Create room
          const roomId = Math.random().toString(36).substring(2, 15);
          setCurrentRoomId(roomId);
            const roomData = {
                clientId: currentUser.uid,
                //clientName: userData.fullName || 'Anonymous Client',
                status: 'waiting_for_counselor',
                type: 'instant',
                createdAt: new Date(),
            };

            console.log('Creating room:', roomId, 'with data:', roomData);
            await setDoc(doc(firestore, 'calls', roomId), roomData);

            // Set up listener for room status changes
            const unsubscribe = onSnapshot(doc(firestore, 'calls', roomId), (snapshot) => {
                const data = snapshot.data();
                if (data?.status === 'active' && data?.counselorId) {
                    toast.dismiss('waiting-counselor');
                    unsubscribe();
                    navigate(`/counseling/${roomId}`, { 
                        state: { 
                            isCreating: false,
                            clientId: currentUser.uid 
                        }
                    });
                }
            });

            // Show waiting message
            toast.info(
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                        <span className="font-semibold text-lg">Looking for Counselors</span>
                    </div>
                    <p>Please wait while we connect you...</p>
                    <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
                        <p>Feel free to explore our website while waiting!</p>
                        <button 
                            onClick={() => navigate('/therapy')}
                            className="text-blue-600 hover:underline mt-1"
                        >
                            → Check out our therapy services
                        </button>
                    </div>
                </div>,
                {
                    toastId: 'waiting-counselor',
                    position: "top-center",
                    autoClose: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: false
                }
            );
    
            // Enhanced timeout notification
            setTimeout(async () => {
                unsubscribe();
                if (document.getElementById('waiting-counselor')) {
                    // Delete the call document
                    if (currentRoomId) {
                        try {
                            await deleteDoc(doc(firestore, 'calls', currentRoomId));
                            setCurrentRoomId(null);
                        } catch (error) {
                            console.error('Error deleting call document:', error);
                        }
                    }
                    toast.dismiss('waiting-counselor');
                    toast.error(
                        <div className="space-y-2">
                            <p className="font-semibold">❌ No Counselors Available</p>
                            <p>Please try again later or schedule an appointment.</p>
                        </div>,
                        {
                            autoClose: 5000,
                            position: "top-center"
                        }
                    );
                    setIsRequesting(false);
                }
            }, 180000);
    
        } catch (error) {
            toast.error(
                <div className="flex items-center space-x-2">
                    <span className="text-red-500">❌</span>
                    <div>
                        <p className="font-semibold">Connection Error</p>
                        <p className="text-sm">Please try again</p>
                    </div>
                </div>,
                {
                    position: "top-center",
                    autoClose: 5000
                }
            );
            setIsRequesting(false);
        }
    };

    const handleCancelRequest = async () => {
        try {
            if (currentRoomId) {
                await deleteDoc(doc(firestore, 'calls', currentRoomId));
                toast.dismiss('waiting-counselor');
                setIsRequesting(false);
                setCurrentRoomId(null);
                setShowCancelModal(false);
                navigate('/waitingroom');
            }
        } catch (error) {
            toast.error('Failed to cancel request');
            console.error('Error canceling request:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#E6F4EA] via-white to-[#E6F4EA]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header */}
                <div className="text-center space-y-4 mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#325D55]">
                        Get Support Today
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Choose your preferred way to connect with our peer-counselors
                    </p>
                </div>

                {isRequesting && (
                    <div className="max-w-md mx-auto mt-12 mb-12">
                        <div className="bg-[#FEFAE0] p-6 rounded-xl border border-[#CCD5AE]">
                            <div className="font-semibold text-[#508D4E] mb-3 flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                While You Wait
                            </div>
                            <p className="text-[#325D55] text-sm mb-4">
                                Feel free to explore our website. We'll notify you when a counselor is ready.
                            </p>
                            <button 
                                onClick={() => navigate('/therapy')}
                                className="flex items-center text-[#508D4E] hover:text-[#325D55] text-sm font-medium
                                        transition-all hover:translate-x-1"
                            >
                                Visit Therapy Services
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
    
                {/* Cards Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Book Appointment Card */}
                    <div className="relative group h-[550px]">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#508D4E] to-[#325D55] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                        <div className="relative bg-white rounded-2xl p-8 h-full shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                            <div className="flex flex-col h-full justify-between items-center">
                                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                                    <div className="w-40 h-40 bg-[#E9EDC9] rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-20 h-20 text-[#508D4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-3 text-center max-w-sm">
                                        <h2 className="text-2xl font-bold text-[#325D55]">Book an Appointment</h2>
                                        <p className="text-gray-600">
                                            Schedule a session in advance with your preferred peer-counselor
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate('/book-appointment')}
                                    className="w-full mt-auto py-4 px-6 rounded-xl font-semibold bg-[#508D4E] text-white
                                            shadow-lg shadow-green-100/50 hover:bg-[#325D55] 
                                            transition-all duration-300 hover:shadow-xl
                                            transform hover:-translate-y-0.5
                                            focus:outline-none focus:ring-2 focus:ring-[#508D4E] focus:ring-offset-2"
                                >
                                    Schedule Appointment
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Instant Session Card */}
                    <div className="relative group h-[550px]">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#508D4E] to-[#325D55] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                        <div className="relative bg-white rounded-2xl p-8 h-full shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                            <div className="flex flex-col h-full justify-between items-center">
                                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                                    <div className="w-40 h-40 bg-[#E9EDC9] rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-20 h-20 text-[#508D4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-3 text-center max-w-sm">
                                        <h2 className="text-2xl font-bold text-[#325D55]">Instant Session</h2>
                                        <p className="text-gray-600">
                                            Connect with an available counselor immediately
                                        </p>
                                    </div>
                                </div>
                                {isRequesting ? (
                                    <div className="space-y-4 mt-auto">
                                        <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50/80 backdrop-blur-sm rounded-xl">
                                            <div className="space-y-4">
                                                <div className="relative" aria-label="Loading spinner">
                                                    <div className="w-16 h-16 border-4 border-green-100 rounded-full animate-spin border-t-green-500"></div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-8 h-8 bg-white rounded-full"></div>
                                                    </div>
                                                </div>
                                                <span className="text-gray-700 font-medium">Looking for counselors...</span>
                                            </div>
                                        </div>
        
                                        <button 
                                            onClick={() => setShowCancelModal(true)}
                                            className="w-full py-4 px-6 rounded-xl font-medium text-red-600 bg-red-50
                                                    hover:bg-red-100 border border-red-200 transition-all duration-200"
                                        >
                                            Cancel Request
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={requestInstantSession}
                                        className="w-full mt-auto py-4 px-6 rounded-xl font-semibold bg-[#508D4E]
                                                hover:bg-[#325D55] text-white shadow-lg
                                                transition-all duration-200 hover:shadow-xl
                                                transform hover:-translate-y-0.5"
                                    >
                                        Start Instant Session
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
    
                {/* Return Home Button */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center px-6 py-3 bg-white/80 text-gray-700 
                                 rounded-xl hover:bg-white/90 transition-all duration-300
                                 font-medium shadow-sm hover:shadow group"
                    >
                        <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Return Home
                    </button>
                </div>
            </div>
    
            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Cancel Request?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to cancel your session request?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={handleCancelRequest}
                                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg
                                        hover:bg-red-600 transition-colors"
                            >
                                Yes, Cancel
                            </button>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 
                                        text-gray-700 rounded-lg hover:bg-gray-50 
                                        transition-colors"
                            >
                                No, Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
                {/* Background glow effect */}
                <div className="absolute inset-0 rounded-full animate-ping bg-green-400/30"></div>
                
                {/* Main button */}
                <button
                    onClick={() => setShowOnlineCounselors(true)}
                    className="relative p-3 md:p-4 bg-green-500 text-white rounded-full 
                            shadow-lg hover:bg-green-600 hover:scale-105
                            transition-all duration-300 ease-in-out
                            animate-pulse
                            flex items-center gap-0 md:gap-2"
                >
                    <User className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="hidden md:inline font-medium">
                        Online Peer-Counselors
                    </span>
                    
                    {/* Counter badge */}
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 
                                w-5 h-5 md:w-6 md:h-6
                                bg-red-500 rounded-full 
                                flex items-center justify-center 
                                text-[10px] md:text-xs font-bold animate-bounce">
                        {onlineCounselors.length}
                    </div>
                </button>
            </div>

            {/* Online Counselors Modal */}
            {showOnlineCounselors && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full 
                            border border-white/20 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 bg-white/50">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-semibold text-gray-900">
                                    Available Peer Counselors
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {clientSchool} • {onlineCounselors.length} Online
                                </p>
                            </div>
                            <button
                                onClick={() => setShowOnlineCounselors(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {onlineCounselors.length > 0 ? (
                            <div className="space-y-6">
                                {/* Group by college */}
                                {Object.entries(
                                    onlineCounselors.reduce((acc, counselor) => {
                                        const college = counselor.college || 'Other';
                                        acc[college] = [...(acc[college] || []), counselor];
                                        return acc;
                                    }, {})
                                ).map(([college, counselors]) => (
                                    <div key={college} className="space-y-3">
                                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            {college}
                                        </h4>
                                        <div className="grid gap-3">
                                            {counselors.map((counselor) => (
                                                <div 
                                                    key={counselor.id}
                                                    className="group relative bg-white rounded-xl p-4 hover:shadow-lg 
                                                            transition-all duration-300 border border-gray-100
                                                            hover:border-green-200 hover:-translate-y-0.5"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {/* Avatar */}
                                                        <div className="relative">
                                                            {counselor.profilePicture ? (
                                                                <img 
                                                                    src={counselor.profilePicture}
                                                                    alt={counselor.fullName}
                                                                    className="w-12 h-12 rounded-full object-cover ring-2 
                                                                            ring-white shadow-sm"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br 
                                                                            from-green-100 to-green-200 flex items-center 
                                                                            justify-center ring-2 ring-white shadow-sm">
                                                                    <User className="w-6 h-6 text-green-600" />
                                                                </div>
                                                            )}
                                                            <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 
                                                                        rounded-full ring-2 ring-white" />
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-base font-medium text-gray-900 truncate">
                                                                    {counselor.fullName}
                                                                </h4>
                                                                {counselor.verificationStatus === 'verified' && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                                                                        <svg 
                                                                            className="w-3 h-3" 
                                                                            fill="currentColor" 
                                                                            viewBox="0 0 20 20"
                                                                        >
                                                                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                                                        </svg>
                                                                        Verified for Counseling
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* <p className="text-sm text-gray-500 truncate">
                                                                {counselor.specialty || 'General Counseling'}
                                                            </p> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                                    <User className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Counselors Available
                                </h3>
                                <p className="text-gray-500">
                                    Check back later or schedule an appointment
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default WaitingRoom;