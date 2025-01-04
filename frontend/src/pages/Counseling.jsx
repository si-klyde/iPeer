import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../firebase';
import VideoCall from '../components/VideoCall';
import Chat from '../components/Chat';
import { MessageCircle, ClipboardEdit } from 'lucide-react';
import { auth } from '../firebase';
import axios from 'axios';
import SessionNotes from '../components/SessionNotes';

const Counseling = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isCreating = location.state?.isCreating;
    const [clientId, setClientId] = useState(null);
    const [isValidRoom, setIsValidRoom] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(roomId);
    const [userRole, setUserRole] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [showNotes, setShowNotes] = useState(false);

    useEffect(() => {
        // Hide Header and Footer
        const appHeader = document.querySelector('header');
        const appFooter = document.querySelector('footer');
        if (appHeader) appHeader.style.display = 'none';
        if (appFooter) appFooter.style.display = 'none';
        return () => {
            // Restore Header and Footer visibility when leaving the page
            if (appHeader) appHeader.style.display = '';
            if (appFooter) appFooter.style.display = '';
        };
    }, []);
  
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const token = await auth.currentUser.getIdToken();
                const response = await axios.post('http://localhost:5000/api/check-role', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Role check response:', response.data);
                setUserRole(response.data.role);
            } catch (error) {
                console.error('Error checking user role:', error);
                if (error.response) {
                    console.error('Response error:', error.response.data);
                }
            }
        };

        checkUserRole();
    }, []);

    useEffect(() => {
        const fetchRoomData = async () => {
            if (!roomId || !userRole) return;
    
            try {
                console.log('Fetching room:', roomId, 'as role:', userRole);

                const roomRef = doc(firestore, 'calls', roomId);
                const unsubscribe = onSnapshot(roomRef, async (snapshot) => {
                if (snapshot.exists()) {
                    const roomData = snapshot.data();
                    console.log('Room snapshot:', roomData);

                    if (roomData.clientId) {
                        setClientId(roomData.clientId);
                    }

                    // If counselor and room waiting, join
                    if (userRole === 'peer-counselor' && roomData.status === 'waiting') {
                        await updateDoc(roomRef, {
                            counselorId: auth.currentUser.uid,
                            status: 'active',
                            joinedAt: new Date()
                        });
                    }
                }
            });

            return () => unsubscribe();
            } catch (error) {
                console.error('Error fetching room:', error);
            }
        };

        fetchRoomData();
    }, [roomId, userRole]);

    useEffect(() => {
        const checkRoom = async () => {
            if (roomId) {
                try {
                    const roomRef = doc(firestore, 'calls', roomId);
                    const roomSnapshot = await getDoc(roomRef);

                    if (roomSnapshot.exists()) {
                        // Room exists and we're not creating it - this is fine
                        setIsValidRoom(true);
                    } else if (location.state?.isCreating) {
                        // We're creating the room - this is also fine
                        setIsValidRoom(true);
                    } else {
                        alert("This room does not exist. Redirecting to waiting room.");
                        navigate('/');
                    }
                } catch (error) {
                    console.error("Error checking room:", error);
                    alert("An error occurred while checking the room. Redirecting to waiting room.");
                    navigate('/');
                }
            } else {
                setIsValidRoom(false);
            }
        };

        checkRoom();
    }, [roomId, navigate, location.state]);

  
    if (!isValidRoom) {
        return <div className="min-h-screen flex items-center justify-center text-white">Checking room validity...</div>;
    }

  
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
            <div className="p-2 md:p-4 flex flex-col h-screen">
                {/* Responsive header */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-2 md:mb-4 px-3 md:px-6 py-2 md:py-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
                    <h1 className="text-xl md:text-2xl font-semibold text-green-800">iPeer Session</h1>
                    <div className="text-sm text-green-600">
                        Room: {roomId}
                    </div>
                </header>
    
                {/* Main content */}
                <div className="flex-1">
                    <VideoCall 
                        roomId={roomId} 
                        setRoomId={setCurrentRoomId} 
                        userRole={userRole}
                        clientId={clientId}
                    />
                </div>
            </div>
        </div>
    );
};

export default Counseling;