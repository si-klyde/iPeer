import React, { useEffect } from 'react';
import { firestore, auth } from '../firebase';
import { collection, query, where, onSnapshot, getDoc, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import notificationSound from '../assets/notification/notification.mp3';
import axios from 'axios';
import { toast } from 'react-toastify';

const InstantSessionNotification = () => {
    const navigate = useNavigate();

    useEffect(() => {
    const currentUser = auth.currentUser;
    let callsUnsubscribe = null;

    // Listen to counselor's status
    const counselorRef = doc(firestore, 'users', currentUser.uid);
    const statusUnsubscribe = onSnapshot(counselorRef, (doc) => {
        const counselorData = doc.data();
        
        // Clear existing notifications and listener if counselor is offline/unavailable
        if (!counselorData?.currentStatus?.isAvailable || 
            counselorData?.currentStatus?.status !== 'online' ||
            counselorData?.verificationStatus !== 'verified' ) {
            if (callsUnsubscribe) {
                callsUnsubscribe();
                callsUnsubscribe = null;
            }
            // Dismiss all notifications
            const toastIds = Object.keys(toast.isActive())
                .filter(id => id.startsWith('session-'));
            toastIds.forEach(id => toast.dismiss(id));
            return;
        }

        // Set up calls listener only if counselor is available
        const callsQuery = query(
            collection(firestore, 'calls'),
            where('status', '==', 'waiting_for_counselor'),
            where('type', '==', 'instant')
        );

        callsUnsubscribe = onSnapshot(callsQuery, async (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                if (change.type === 'added') {
                    const callData = {
                        id: change.doc.id,
                        ...change.doc.data()
                    };

                    // Skip if current counselor already rejected this call
                    if (callData.rejectedBy?.includes(auth.currentUser.uid)) {
                        return;
                    }
                    
                    try {
                        const token = await auth.currentUser.getIdToken();
                        const response = await axios.get(
                            `http://localhost:5000/api/client/${callData.clientId}`,
                            {
                                headers: { Authorization: `Bearer ${token}` }
                            }
                        );
                        
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
                else if (change.type === 'modified') {
                    const callData = change.doc.data();
                    if (callData.status === 'active' && 
                        callData.counselorId !== auth.currentUser.uid) {
                        toast.dismiss(`session-${change.doc.id}`);
                    }
                }
                else if (change.type === 'removed') {
                    toast.dismiss(`session-${change.doc.id}`);
                }
            });
        });
    });

    // Cleanup function
    return () => {
        statusUnsubscribe();
        if (callsUnsubscribe) {
            callsUnsubscribe();
        }
    };
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
            const callRef = doc(firestore, 'calls', callId);
            
            // Get current call status
            const callDoc = await getDoc(callRef);
            if (!callDoc.exists()) {
                toast.error('Session no longer available');
                return;
            }
    
            const callData = callDoc.data();
            if (callData.status !== 'waiting_for_counselor') {
                toast.error('Session already taken by another counselor');
                return;
            }
    
            // Update call status
            await updateDoc(callRef, {
                counselorId: currentUser.uid,
                status: 'active',
                acceptedAt: new Date()
            });
    
            // Update peer counselor's status
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
            
            toast.dismiss(`session-${callId}`);
            navigate(`/counseling/${callId}`);
        } catch (error) {
            console.error('Error accepting call:', error);
            toast.error('Failed to accept session');
        }
    };

    const handleReject = async (callId) => {
        try {
            const currentUser = auth.currentUser;
            const callRef = doc(firestore, 'calls', callId);
            
            // Get the call document
            const callDoc = await getDoc(callRef);
            if (!callDoc.exists()) {
                toast.dismiss(`session-${callId}`);
                return;
            }
    
            // Update the call document to include rejected counselors
            await updateDoc(callRef, {
                rejectedBy: [
                    ...(callDoc.data().rejectedBy || []),
                    currentUser.uid
                ]
            });
            
            toast.dismiss(`session-${callId}`);
        } catch (error) {
            console.error('Error rejecting call:', error);
        }
    };

    return null;
};

export default InstantSessionNotification;