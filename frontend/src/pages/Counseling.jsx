import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles.css';
import VideoCall from '../components/VideoCall';
import Chat from '../components/Chat';

const Counseling = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [isValidRoom, setIsValidRoom] = useState(false);

    useEffect(() => {
        const checkRoom = async () => {
            if (roomId) {
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
            }
        };

        checkRoom();
    }, [roomId, navigate]);

    if (!isValidRoom) {
        return <div>Checking room validity...</div>;
    }

    return (
        <div>
            <h1>iPeer Counseling</h1>
            <VideoCall roomId={roomId} />
            <Chat roomId={roomId} />
        </div>
    );
};

export default Counseling;