import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const WaitingRoom = () => {
    const [roomCode, setRoomCode] = useState('');
    const navigate = useNavigate();

    const createRoom = async () => {
        try {
            const newRoomCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const currentUser = auth.currentUser;
            const roomRef = doc(firestore, 'calls', newRoomCode);
            
            // Add a check to limit recursion attempts
            const checkExistingRoom = async (attempts = 0) => {
                if (attempts > 5) {
                    console.error('Failed to create unique room after multiple attempts');
                    alert('Error creating room. Please try again.');
                    return null;
                }
                
                const roomSnapshot = await getDoc(roomRef);
                if (!roomSnapshot.exists()) {
                    const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
                    const userRole = userDoc.data().role;
                    
                    const roomData = userRole === 'peer-counselor' 
                        ? {
                            createdAt: new Date(),
                            counselorId: currentUser.uid,
                            status: 'waiting'
                        }
                        : {
                            createdAt: new Date(),
                            clientId: currentUser.uid,
                            status: 'waiting'
                        };
                    
                    await setDoc(roomRef, roomData);
                    return newRoomCode;
                } else {
                    // Generate a new room code and try again
                    const retryRoomCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    const retryRoomRef = doc(firestore, 'calls', retryRoomCode);
                    const retrySnapshot = await getDoc(retryRoomRef);
                    
                    if (!retrySnapshot.exists()) {
                        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
                        const userRole = userDoc.data().role;
                        
                        const roomData = userRole === 'peer-counselor' 
                            ? {
                                createdAt: new Date(),
                                counselorId: currentUser.uid,
                                status: 'waiting'
                            }
                            : {
                                createdAt: new Date(),
                                clientId: currentUser.uid,
                                status: 'waiting'
                            };
                        
                        await setDoc(retryRoomRef, roomData);
                        return retryRoomCode;
                    }
                    
                    // Recursively try again
                    return checkExistingRoom(attempts + 1);
                }
            };
            
            const createdRoomCode = await checkExistingRoom();
            if (createdRoomCode) {
                navigate(`/counseling/${createdRoomCode}`, { state: { isCreating: true } });
            }
        } catch (error) {
            console.error('Room creation error:', error);
            alert('Failed to create room. Please try again.');
        }
    };

    const joinRoom = async () => {
        if (roomCode) {
            try {
                const currentUser = auth.currentUser;
                const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
                const userRole = userDoc.data().role;
                const roomRef = doc(firestore, 'calls', roomCode);
                const roomSnapshot = await getDoc(roomRef);

                if (roomSnapshot.exists()) {
                    const roomData = roomSnapshot.data();
                    if (userRole === 'peer-counselor' && !roomData.counselorId) {
                        await updateDoc(roomRef, {
                            counselorId: currentUser.uid,
                            status: 'active'
                        });
                    } else if (userRole === 'client' && !roomData.clientId) {
                        await updateDoc(roomRef, {
                            clientId: currentUser.uid,
                            status: 'active'
                        });
                    }
                    navigate(`/counseling/${roomCode}`);
                } else {
                    alert("No active session found with this code. Please check the code and try again.");
                }
            } catch (error) {
                console.error("Error checking room:", error);
                alert("An error occurred while checking the room. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-color-5 p-4">
            <h1 className="text-3xl font-bold text-white mb-8">iPeer Counseling Waiting Room</h1>
            
            <div className="flex flex-col items-center space-y-4 w-full max-w-md">
                <button 
                    onClick={createRoom} 
                    className="w-full bg-green-500 text-white py-3 px-6 rounded-lg text-lg font-semibold transition transform hover:bg-green-600 hover:scale-105"
                >
                    Create New Room
                </button>

                <div className="w-full flex flex-col items-center">
                    <input 
                        type="text" 
                        value={roomCode} 
                        onChange={(e) => setRoomCode(e.target.value)}
                        placeholder="Enter room code"
                        className="w-full px-4 py-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    />
                    <button 
                        onClick={joinRoom} 
                        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg text-lg font-semibold transition transform hover:bg-blue-600 hover:scale-105"
                    >
                        Join Room
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WaitingRoom;
