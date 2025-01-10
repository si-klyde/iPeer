import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import axios from 'axios';

const WaitingRoom = () => {
    const [isRequesting, setIsRequesting] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const navigate = useNavigate();

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

            // Get client data from backend
            // const clientResponse = await axios.get(
            //     `http://localhost:5000/api/client/${currentUser.uid}`,
            //     {
            //         headers: { Authorization: `Bearer ${token}` }
            //     }
            // );
            // const userData = clientResponse.data;

            // Check for available counselors through backend
            console.log('Checking for available counselors...');
            const counselorsResponse = await axios.get(
                'http://localhost:5000/api/peer-counselors/available',
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            const availableCounselors = counselorsResponse.data;
            console.log('Available counselors:', availableCounselors);

            if (!availableCounselors.length) {
                console.log('No counselors available');
                toast.error('No peer counselors are available right now. Please try again later.');
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
            setTimeout(() => {
                unsubscribe();
                if (document.getElementById('waiting-counselor')) {
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
            }, 300000);
    
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
                navigate('/');
            }
        } catch (error) {
            toast.error('Failed to cancel request');
            console.error('Error canceling request:', error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#E6F4EA] to-white p-4">
            <div className="text-center space-y-8 max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                        Instant Counseling
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Connect with an available peer counselor for immediate support
                    </p>
                </div>
                
                <div className="flex flex-col space-y-5">
                    {isRequesting ? (
                        <>
                            <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-xl">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-green-100 rounded-full animate-spin border-t-green-500"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-8 h-8 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <span className="text-gray-700 font-medium">Looking for counselors...</span>
                            </div>
                            
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    While You Wait
                                </h4>
                                <p className="text-blue-700 text-sm mb-4">
                                    Feel free to explore our website. We'll notify you when a counselor is ready.
                                </p>
                                <button 
                                    onClick={() => navigate('/therapy')}
                                    className="flex items-center text-blue-700 hover:text-blue-800 text-sm font-medium
                                             transition-all hover:translate-x-1"
                                >
                                    Visit Therapy Services
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                            
                            <button 
                                onClick={() => setShowCancelModal(true)}
                                className="w-full py-4 px-6 rounded-xl font-medium text-red-600 bg-red-50
                                         hover:bg-red-100 border border-red-200 transition-all duration-200"
                            >
                                Cancel Request
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={requestInstantSession}
                            className="w-full py-4 px-6 rounded-xl font-semibold bg-[#408f40] 
                                     hover:bg-green-600 text-white shadow-lg shadow-green-100
                                     transition-all duration-200 hover:shadow-xl hover:shadow-green-200
                                     transform hover:-translate-y-0.5"
                        >
                            Start Instant Session
                        </button>
                    )}
                    
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 px-6 bg-gray-50 text-gray-600 rounded-xl
                                 hover:bg-gray-100 transition-colors font-medium"
                    >
                        Return Home
                    </button>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div 
                    className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 
                            transform transition-all duration-300 ease-in-out
                            scale-100 opacity-100
                            motion-safe:transition-all motion-safe:duration-300
                            motion-safe:transform motion-safe:opacity-100"
                >
                    <div className="p-6">
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
            </div>
        )}
        </div>
    );
};

export default WaitingRoom;