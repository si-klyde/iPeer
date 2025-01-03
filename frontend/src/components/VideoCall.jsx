import React, { useState, useRef, useEffect, useCallback } from 'react';
import { firestore } from '../firebase';
import { collection, doc, setDoc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

const VideoCall = ({ roomId, setRoomId, userRole }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [localStream, setLocalStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const navigate = useNavigate();
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [dataChannel, setDataChannel] = useState(null);
    

    const setupPeerConnection = useCallback(async (id) => {
        const callDoc = doc(collection(firestore, 'calls'), id);
        const offerCandidates = collection(callDoc, 'offerCandidates');
        const answerCandidates = collection(callDoc, 'answerCandidates');
        const callData = (await getDoc(callDoc)).data();

        // Check if session is ended
        if (callData?.status === 'ended') {
            cleanup();
            alert('This session has ended');
            navigate('/');
            return;
        }
    
        const pc = new RTCPeerConnection(servers);
        setPeerConnection(pc);
    
        // Set up data channel
        if (userRole === 'peer-counselor') {
            const channel = pc.createDataChannel('endMeeting');
            setDataChannel(channel);
        } else {
            pc.ondatachannel = (event) => {
                const channel = event.channel;
                setDataChannel(channel);
                
                channel.onmessage = (event) => {
                    if (event.data === 'endMeeting') {
                        cleanup();
                        //alert('The counselor has ended the session');
                        navigate('/');
                    }
                };
            };
        }
    
        // Add tracks to connection
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    
        // Handle remote tracks
        pc.ontrack = event => {
            const [remoteStream] = event.streams;
            if (remoteVideoRef.current && remoteStream) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
        };
    
        pc.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', pc.iceConnectionState);
        };
    
        pc.onicecandidate = event => {
            if (event.candidate) {
                addDoc(offerCandidates, event.candidate.toJSON());
            }
        };
    
    
        if (!callData?.offer) {
            const offerDescription = await pc.createOffer();
            await pc.setLocalDescription(offerDescription);
    
            await setDoc(callDoc, {
                offer: {
                    type: offerDescription.type,
                    sdp: offerDescription.sdp,
                }
            });
    
            onSnapshot(callDoc, (snapshot) => {
                const data = snapshot.data();
                if (!pc.currentRemoteDescription && data?.answer) {
                    pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                }
            });
    
            onSnapshot(answerCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                    }
                });
            });
        } else {
            await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
            
            const answerDescription = await pc.createAnswer();
            await pc.setLocalDescription(answerDescription);
    
            await updateDoc(callDoc, {
                answer: {
                    type: answerDescription.type,
                    sdp: answerDescription.sdp,
                }
            });
    
            onSnapshot(offerCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                    }
                });
            });
        }
    
        return pc;
    }, [localStream, navigate, userRole]);

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

        return () => cleanup();
    }, []);

    useEffect(() => {
        if (roomId && localStream && !peerConnection) {
            setupPeerConnection(roomId);

            const callDoc = doc(firestore, 'calls', roomId);
            const unsubscribe = onSnapshot(callDoc, (snapshot) => {
                if (!snapshot.exists() && userRole === 'client') {
                    cleanup();
                    navigate('/');
                }
            });

            return () => unsubscribe();
        }
    }, [roomId, localStream, peerConnection, setupPeerConnection]);
    
    useEffect(() => {
        if (roomId) {
            // Add status change listener
            const callDoc = doc(firestore, 'calls', roomId);
            const unsubscribe = onSnapshot(callDoc, (snapshot) => {
                const data = snapshot.data();
                if (data?.status === 'ended') {
                    cleanup();
                    alert('The counselor has ended the session');
                    navigate('/');
                }
            });
    
            return () => unsubscribe();
        }
    }, [roomId, navigate]);

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
    

    // Helper function to clean up media and connections
    const cleanup = () => {
        // Stop all tracks in local stream
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
            });
            setLocalStream(null);
        }
    
        // Clear video elements
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    
        // Close peer connection
        if (peerConnection) {
            // Stop all tracks from peer connection senders
            peerConnection.getSenders().forEach(sender => {
                if (sender.track) {
                    sender.track.stop();
                }
            });
            peerConnection.close();
            setPeerConnection(null);
        }
    
        // Clear data channel
        if (dataChannel) {
            dataChannel.close();
            setDataChannel(null);
        }
    
        if (setRoomId) {
            setRoomId('');
        }
    };

    async function endCall() {
        if (userRole === 'peer-counselor') {
            try {
                // Send end meeting signal to all participants
                if (dataChannel && dataChannel.readyState === 'open') {
                    dataChannel.send('endMeeting');
                }
    
                // Update call document status instead of deleting
                const callDoc = doc(firestore, 'calls', roomId);
                await updateDoc(callDoc, {
                    status: 'ended',
                    endedAt: new Date().toISOString()
                });
    
                cleanup();
                alert('Session ended successfully');
            } catch (error) {
                console.error('Error ending session:', error);
                alert('Error ending session');
            }
        } else {
            cleanup();
            alert('You have left the session');
        }
        
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
                    {isVideoMuted ? 'Start Video' : 'Stop Video'}
                </button>
                <button 
                    className="bg-red-500/80 text-white px-6 py-3 rounded-full hover:bg-red-600/80 transition-colors backdrop-blur-sm"
                    onClick={endCall}
                >
                    {userRole === 'peer-counselor' ? 'End Session' : 'Leave Session'}
                </button>
            </div>
        </div>
    );
};

export default VideoCall;