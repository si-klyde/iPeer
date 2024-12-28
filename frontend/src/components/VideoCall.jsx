import React, { useState, useRef, useEffect, useCallback } from 'react';
import { firestore } from '../firebase';
import { collection, doc, setDoc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};


// Define icon SVG properties
const micIconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    children: (
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
        />
    )
};

const videoIconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    children: (
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V7.5A2.25 2.25 0 014.5 5.25H12a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25z"
        />
    )
};

const endCallIconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    children: (
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
        />
    )
};

const VideoCall = ({ roomId, setRoomId }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [localStream, setLocalStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const navigate = useNavigate();
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);

    const setupPeerConnection = useCallback(async (id) => {
        const callDoc = doc(collection(firestore, 'calls'), id);
        const offerCandidates = collection(callDoc, 'offerCandidates');
        const answerCandidates = collection(callDoc, 'answerCandidates');
    
        const pc = new RTCPeerConnection(servers);
        setPeerConnection(pc);
    
        // Add tracks to connection
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    
        // Handle remote tracks
        pc.ontrack = event => {
            console.log('Remote track received:', event);
            const [remoteStream] = event.streams;
            if (remoteVideoRef.current && remoteStream) {
                console.log('Attaching remote stream to video element');
                remoteVideoRef.current.srcObject = remoteStream;
            }
        };
    
        // Handle connection state changes
        pc.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', pc.iceConnectionState);
        };
    
        // Handle ICE candidates
        pc.onicecandidate = event => {
            if (event.candidate) {
                console.log('New ICE candidate');
                addDoc(offerCandidates, event.candidate.toJSON());
            }
        };
    
        const callData = (await getDoc(callDoc)).data();
    
        if (!callData?.offer) {
            // Create offer
            console.log('Creating offer');
            const offerDescription = await pc.createOffer();
            await pc.setLocalDescription(offerDescription);
    
            await setDoc(callDoc, {
                offer: {
                    type: offerDescription.type,
                    sdp: offerDescription.sdp,
                }
            });
    
            // Listen for answer
            onSnapshot(callDoc, (snapshot) => {
                const data = snapshot.data();
                if (!pc.currentRemoteDescription && data?.answer) {
                    console.log('Received answer');
                    pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                }
            });
    
            // Listen for remote ICE candidates
            onSnapshot(answerCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                    }
                });
            });
        } else {
            // Handle answer
            console.log('Setting remote description');
            await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
            
            const answerDescription = await pc.createAnswer();
            await pc.setLocalDescription(answerDescription);
    
            await updateDoc(callDoc, {
                answer: {
                    type: answerDescription.type,
                    sdp: answerDescription.sdp,
                }
            });
    
            // Listen for remote ICE candidates
            onSnapshot(offerCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                    }
                });
            });
        }
    
        return pc;
    }, [localStream]);

    useEffect(() => {
        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing media devices.', error);
                alert('Error accessing media devices: ' + error.message);
            }
        };

        init();

        return () => {
            if (peerConnection) {
                peerConnection.close();
            }
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (roomId && localStream && !peerConnection) {
            setupPeerConnection(roomId);
        }
    }, [roomId, localStream, peerConnection, setupPeerConnection]);

    function toggleVideo() {
        if (localStream && peerConnection) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                // Toggle the enabled state of the track
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoMuted(!videoTrack.enabled);
                
                // Get all video senders in the peer connection
                const videoSenders = peerConnection
                    .getSenders()
                    .filter(sender => sender.track?.kind === 'video');
                    
                // Update the enabled state for all video senders
                videoSenders.forEach(sender => {
                    if (sender.track) {
                        sender.track.enabled = videoTrack.enabled;
                    }
                });
            }
        }
    }
    
    function toggleAudio() {
        if (localStream && peerConnection) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                // Toggle the enabled state of the track
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioMuted(!audioTrack.enabled);
                
                // Get all audio senders in the peer connection
                const audioSenders = peerConnection
                    .getSenders()
                    .filter(sender => sender.track?.kind === 'audio');
                    
                // Update the enabled state for all audio senders
                audioSenders.forEach(sender => {
                    if (sender.track) {
                        sender.track.enabled = audioTrack.enabled;
                    }
                });
            }
        }
    }
    
    async function endCall() {
        if (peerConnection) {
            peerConnection.close();
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        if (roomId) {
            try {
                const callDoc = doc(firestore, 'calls', roomId);
                await updateDoc(callDoc, { messages: [] }); // Clear messages
                await deleteDoc(callDoc);
            } catch (error) {
                console.error('Error deleting room document:', error);
            }
        }
        if (setRoomId) {
            setRoomId('');
        }
        alert('Call ended');
        navigate('/');
    }

    return (
        <div className="relative w-full h-[calc(100vh-8rem)] bg-gray-900">
            {/* Remote Video - Full Screen */}
            <div className="absolute inset-0 w-full h-full bg-black">
                <video 
                    className="w-full h-full object-cover"
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline
                />
            </div>
    
            {/* Local Video - Floating */}
            <div className="absolute top-4 right-4 w-[280px] aspect-video bg-black rounded-lg overflow-hidden shadow-2xl hover:scale-105 transition-transform cursor-move">
                <video 
                    className="w-full h-full object-cover transform scale-x-[-1]"
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted
                />
            </div>
    
            {/* Controls - Floating Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-4 p-6 bg-gradient-to-t from-black/70 to-transparent">
            <button 
                    className={`px-6 py-3 rounded-full transition-colors backdrop-blur-sm ${
                        isAudioMuted 
                            ? 'bg-red-500/80 hover:bg-red-600/80' 
                            : 'bg-gray-800/80 hover:bg-gray-700/80'
                    } text-white`}
                    onClick={toggleAudio}
                >
                    {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                </button>
                <button 
                    className={`px-6 py-3 rounded-full transition-colors backdrop-blur-sm ${
                        isVideoMuted 
                            ? 'bg-red-500/80 hover:bg-red-600/80' 
                            : 'bg-gray-800/80 hover:bg-gray-700/80'
                    } text-white`}
                    onClick={toggleVideo}
                >
                    {isVideoMuted ? 'Unmute Video' : 'Mute Video'}
                </button>
                <button 
                    className="bg-red-500/80 text-white px-6 py-3 rounded-full hover:bg-red-600/80 transition-colors backdrop-blur-sm"
                    onClick={endCall}
                >
                    End Call
                </button>
            </div>
        </div>
    );
};

export default VideoCall;