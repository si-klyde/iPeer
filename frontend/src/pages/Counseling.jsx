import React, { useEffect, useState } from 'react';
import { useParams, useNavigate,useLocation } from 'react-router-dom';
import { firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles.css';
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
            } else{
                setIsValidRoom(true);
            }
        };

        checkRoom();
    }, [roomId, navigate, isCreating]);

    if (!isValidRoom) {
        return <div>Checking room validity...</div>;
    }

    return (
        <div>
            <h1>iPeer Counseling</h1>
            <VideoCall roomId={roomId} setRoomId={setCurrentRoomId} />
            <Chat roomId={roomId} />
        </div>
    );
};

export default Counseling;