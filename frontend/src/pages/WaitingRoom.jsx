import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const WaitingRoom = () => {
    const [roomCode, setRoomCode] = useState('');
    const navigate = useNavigate();

    const createRoom = async () => {
        const newRoomCode = Math.random().toString(36).substring(7);
        navigate(`/counseling/${newRoomCode}`, { state: { isCreating: true } });
    };

    const joinRoom = async () => {
        if (roomCode) {
            try {
                const roomRef = doc(firestore, 'calls', roomCode);
                const roomSnapshot = await getDoc(roomRef);

                if (roomSnapshot.exists()) {
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
