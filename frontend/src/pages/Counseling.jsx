import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import VideoCall from '../components/VideoCall';
import Chat from '../components/Chat';

const Counseling = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isCreating = location.state?.isCreating;

    const [isValidRoom, setIsValidRoom] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(roomId);

    useEffect(() => {
        const checkRoom = async () => {
            if (roomId && !isCreating) {
                try {
                    const roomRef = doc(firestore, 'calls', roomId);
                    const roomSnapshot = await getDoc(roomRef);

                    if (roomSnapshot.exists()) {
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
                setIsValidRoom(true);
            }
        };

        checkRoom();
    }, [roomId, navigate, isCreating]);

    if (!isValidRoom) {
        return <div className="min-h-screen flex items-center justify-center text-white">Checking room validity...</div>;
    }

    return (
        <div className="m-3 text-color-7 min-h-screen flex flex-col items-center bg-color-5 tracking-wide">
            <h1 className="text-3xl font-bold text-white mb-8">iPeer Counseling Room</h1>
            
            <div className="mt-5 w-full max-w-6xl flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
                <div className="w-full lg:w-8/12 bg-white p-6 rounded-lg shadow-lg">
                    <VideoCall roomId={roomId} setRoomId={setCurrentRoomId} />
                </div>
                <div className="w-full lg:w-4/12 bg-white p-6 rounded-lg shadow-lg">
                    <Chat roomId={roomId} />
                </div>
            </div>
        </div>
    );
};

export default Counseling;
