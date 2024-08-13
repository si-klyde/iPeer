import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const WaitingRoom = () => {
    const [roomCode, setRoomCode] = useState('');
    const navigate = useNavigate();

    const createRoom = async () => {
        const newRoomCode = Math.random().toString(36).substring(7);
        navigate(`/counseling/${newRoomCode}`);
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
        <div>
            <h1>iPeer Counseling Waiting Room</h1>
            <button onClick={createRoom}>Create New Room</button>
            <div>
                <input 
                    type="text" 
                    value={roomCode} 
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Enter room code"
                />
                <button onClick={joinRoom}>Join Room</button>
            </div>
        </div>
    );
};

export default WaitingRoom;