import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';
import axios from 'axios';

const WaitingRoom = () => {
    const [isRequesting, setIsRequesting] = useState(false);
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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#E6F4EA] p-4">
            <div className="text-center space-y-6 max-w-md w-full">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Instant Counseling Session
                </h1>
                <p className="text-gray-600 mb-8">
                    Connect with an available peer counselor instantly for immediate support.
                </p>
                
                <div className="flex flex-col space-y-4">
                    <button 
                        onClick={requestInstantSession}
                        disabled={isRequesting}
                        className={`
                            w-full py-4 px-6 rounded-lg text-lg font-semibold
                            transition transform hover:scale-105
                            ${isRequesting 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-[#408f40] hover:bg-green-600 text-white'
                            }
                        `}
                    >
                        {isRequesting ? 'Requesting Session...' : 'Start Instant Session'}
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-lg 
                                 hover:bg-gray-300 transition"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WaitingRoom;