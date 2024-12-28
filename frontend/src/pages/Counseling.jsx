import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import VideoCall from '../components/VideoCall';
import Chat from '../components/Chat';
import { Save, X, ClipboardEdit } from 'lucide-react';
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
            if (roomId) {
                try {
                    const roomRef = doc(firestore, 'calls', roomId);
                    const roomSnapshot = await getDoc(roomRef);
                    if (roomSnapshot.exists()) {
                        const roomData = roomSnapshot.data();
                        console.log('Room data fetched:', roomData);
                        setClientId(roomData.clientId);
                        console.log('Setting clientId:', roomData.clientId);
                    } else {
                        console.log('Room does not exist'); 
                    }
                } catch (error) {
                    console.error("Error fetching room data:", error);
                }
            } else {
                console.log('No roomId provided');
            }
        };
    
        fetchRoomData();
    }, [roomId]);

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
            <div className="p-4 flex flex-col h-screen">
                {/* Header */}
                <header className="flex justify-between items-center mb-4 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
                    <h1 className="text-2xl font-semibold text-green-800">iPeer Counseling Session</h1>
                    <div className="text-sm text-green-600 font-medium">
                        Room ID: {roomId}
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex gap-4">
                    {/* Left Side - Video Call */}
                    <div className="flex-1 flex flex-col">
                        <VideoCall roomId={roomId} setRoomId={setCurrentRoomId} />
                    </div>

                    {/* Right Side - Chat and Notes */}
                    <div className="w-96 flex flex-col gap-4">
                        <Chat roomId={roomId} />
                        {userRole === 'peer-counselor' && (
                            <SessionNotes roomId={roomId} clientId={clientId} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Counseling;
