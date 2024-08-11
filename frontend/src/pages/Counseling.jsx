import React, { useState } from 'react';
import '../styles.css';
import VideoCall from '../components/VideoCall';
import Chat from '../components/Chat';

const Counseling = () => {
    const [roomId, setRoomId] = useState('');

    return (
        <div>
            <h1>iPeer Counseling</h1>
            <VideoCall roomId={roomId} setRoomId={setRoomId} />
            <Chat roomId={roomId} />
        </div>
    );
};

export default Counseling;