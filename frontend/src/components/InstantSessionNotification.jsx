import React, { useEffect } from 'react';
import { firestore, auth } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import notificationSound from '../assets/notification/notification.mp3';
import axios from 'axios';
import { toast } from 'react-toastify';

const InstantSessionNotification = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for instant session requests
        const callsQuery = query(
            collection(firestore, 'calls'),
            where('status', '==', 'waiting_for_counselor'),
            where('type', '==', 'instant')
        );

        const unsubscribe = onSnapshot(callsQuery, async (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                if (change.type === 'added') {
                    const callData = {
                        id: change.doc.id,
                        ...change.doc.data()
                    };
                    
                    try {
                        const token = await auth.currentUser.getIdToken();
                        const response = await axios.get(
                            `http://localhost:5000/api/client/${callData.clientId}`,
                            {
                                headers: { Authorization: `Bearer ${token}` }
                            }
                        );
                        
                        console.log('Response data:', {  // Debug response
                            fullName: response.data.fullName,
                            responseData: response.data
                        });

                        showSessionRequest({
                            ...callData,
                            clientName: response.data.fullName
                        });
                    } catch (error) {
                        console.error('Error fetching client data:', error);
                        showSessionRequest({
                            ...callData,
                            clientName: 'Anonymous'
                        });
                    }
                }
            });
        });

        return () => unsubscribe();
    }, []);

    const showSessionRequest = (callData) => {
        const audio = new Audio(notificationSound);;

        toast(
            <div className="flex flex-col space-y-3 p-2">
                <div className="flex items-center space-x-2">
                    <span className="animate-pulse text-xl">🔔</span>
                    <span className="font-semibold text-lg">Instant Session Request</span>
                </div>
                <p>Client {callData.clientName} needs support</p>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleAccept(callData.id)}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg 
                                 hover:bg-green-600 active:bg-green-700 transition-colors"
                    >
                        Accept
                    </button>
                    <button
                        onClick={() => handleReject(callData.id)}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg
                                 hover:bg-red-600 active:bg-red-700 transition-colors"
                    >
                        Decline
                    </button>
                </div>
            </div>,
            {
                toastId: `session-${callData.id}`,
                position: "top-right",
                autoClose: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
                onOpen: () => audio.play().catch(e => console.error('Audio failed:', e))
            }
        );
    };

    const handleAccept = async (callId) => {
        try {
            const currentUser = auth.currentUser;
            await updateDoc(doc(firestore, 'calls', callId), {
                counselorId: currentUser.uid,
                status: 'active',
                acceptedAt: new Date()
            });

            // Update peer counselor's status to busy
            const token = await currentUser.getIdToken();
            await axios.put(
                `http://localhost:5000/api/peer-counselor/status/${currentUser.uid}`,
                {
                    status: 'busy',
                    isAvailable: false
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            toast.dismiss();
            navigate(`/counseling/${callId}`);
        } catch (error) {
            console.error('Error accepting call:', error);
            toast.error('Failed to accept session');
        }
    };

    const handleReject = async (callId) => {
        const currentUser = auth.currentUser;
            await updateDoc(doc(firestore, 'calls', callId), {
                counselorId: currentUser.uid,
                status: 'rejected',
                acceptedAt: new Date()
            });
        toast.dismiss();
    };

    return null;
};

export default InstantSessionNotification;