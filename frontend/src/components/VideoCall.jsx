import React, { useState, useRef, useEffect, useCallback } from 'react';
import { firestore, auth } from '../firebase';
import { collection, doc, setDoc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ClipboardEdit, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import Chat from './Chat';
import SessionNotes from './SessionNotes';
import axios from 'axios';

const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

const VideoCall = ({ roomId, setRoomId, userRole, clientId }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [localStream, setLocalStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const navigate = useNavigate();
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [dataChannel, setDataChannel] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const lastMessageCountRef = useRef(0);
    const [localVideoAspectRatio, setLocalVideoAspectRatio] = useState(16/9);
    const [remoteUserPhoto, setRemoteUserPhoto] = useState(null);
    const [localUserPhoto, setLocalUserPhoto] = useState(null);
    const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
    const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(false);
    const [sessionNotes, setSessionNotes] = useState('');

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
            console.log('Track received:', event.track.kind, event.track.enabled);
            const [remoteStream] = event.streams;
            
            if (remoteVideoRef.current && remoteStream) {
                console.log('Setting remote stream');
                remoteVideoRef.current.srcObject = remoteStream;
                
                // Check for video tracks
                const videoTracks = remoteStream.getVideoTracks();
                setHasRemoteVideo(videoTracks.length > 0);
                
                // Monitor track enabled state
                if (videoTracks.length > 0) {
                    const videoTrack = videoTracks[0];
                    setRemoteVideoEnabled(videoTrack.enabled);
                    
                    videoTrack.onmute = () => {
                        console.log('Remote video track muted');
                        setRemoteVideoEnabled(false);
                    };
                    
                    videoTrack.onunmute = () => {
                        console.log('Remote video track unmuted');
                        setRemoteVideoEnabled(true);
                    };
                    
                    // Monitor enabled state changes
                    const observer = new MutationObserver(() => {
                        setRemoteVideoEnabled(videoTrack.enabled);
                    });

                    // Observe the track's enabled property
                    observer.observe(videoTrack, {
                        attributes: true,
                        attributeFilter: ['enabled']
                    });

                    // Return cleanup function
                    return () => observer.disconnect();
                }
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
    
        pc.onconnectionstatechange = async () => {
            if (pc.connectionState === 'connected') {
                // If client and counselor are both present, set start time
                if (callData.clientId && callData.counselorId) {
                    await updateDoc(callDoc, {
                        startTime: new Date().toISOString(),
                        status: 'active'
                    });
                }
            }
        };
    
        if (!callData?.offer) {
            const offerDescription = await pc.createOffer();
            await pc.setLocalDescription(offerDescription);
    
            await updateDoc(callDoc, {
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

    const handleLocalVideoMetadata = (e) => {
        const video = e.target;
        setLocalVideoAspectRatio(video.videoWidth / video.videoHeight);
    };

    const renderRemoteVideo = () => {
        console.log('Render remote video:', {
            hasRemoteVideo,
            remoteVideoRef: remoteVideoRef.current?.srcObject,
            tracks: remoteVideoRef.current?.srcObject?.getTracks()?.map(t => ({
                kind: t.kind,
                enabled: t.enabled,
                readyState: t.readyState
            }))
        });
    
        return (
            <>
                <video 
                    className={`w-auto h-full max-w-full ${
                        !hasRemoteVideo || !remoteVideoEnabled ? 'hidden' : ''
                    }`}
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline
                    style={{ objectFit: 'contain' }}
                />
                {(hasRemoteVideo && !remoteVideoEnabled) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-white mb-4">
                            {!hasRemoteVideo ? 'Waiting for remote video...' : 'Video turned off'}
                        </div>
                        {remoteUserPhoto ? (
                            <img 
                                src={remoteUserPhoto}
                                alt="Remote user"
                                className="w-64 h-64 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-64 h-64 rounded-full bg-gray-700 flex items-center justify-center">
                                <span className="text-4xl text-white">
                                    {userRole === 'peer-counselor' ? 'C' : 'PC'}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </>
        );
    };

    const fetchUserPhoto = async (userId) => {
        try {
            const profileRef = doc(firestore, 'users', userId, 'profile', 'details');
            const profileDoc = await getDoc(profileRef);
            return profileDoc.data()?.photoURL || `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzY0NzRmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzY0YjNmNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PC9zdmc+`;
            ;
        } catch (error) {
            console.error('Error fetching user photo:', error);
            return null;
        }
    };

    useEffect(() => {
        const loadProfilePhotos = async () => {
            // Get local user's photo
            const localUserId = auth.currentUser?.uid;
            console.log('Local User ID:', localUserId);
            
            if (localUserId) {
                const photo = await fetchUserPhoto(localUserId);
                console.log('Local User Photo URL:', photo);
                setLocalUserPhoto(photo);
            }
        };
    
        // Separate useEffect for remote user to watch for changes
        const watchRemoteUser = () => {
            const callDoc = doc(firestore, 'calls', roomId);
            return onSnapshot(callDoc, async (snapshot) => {
                const data = snapshot.data();
                const remoteUserId = userRole === 'peer-counselor' ? 
                    data?.clientId : // Changed from clientId prop to data.clientId
                    data?.counselorId;
                
                console.log('Remote User ID (from snapshot):', remoteUserId);
                
                if (remoteUserId) {
                    const photo = await fetchUserPhoto(remoteUserId);
                    console.log('Remote User Photo URL:', photo);
                    setRemoteUserPhoto(photo);
                }
            });
        };
    
        if (roomId) {
            console.log('Room ID:', roomId);
            console.log('User Role:', userRole);
            loadProfilePhotos();
            const unsubscribe = watchRemoteUser();
            return () => unsubscribe();
        }
    }, [roomId, userRole]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
            const video = remoteVideoRef.current;
            
            const handlePlay = () => console.log('Remote video started playing');
            const handleError = (e) => console.error('Remote video error:', e);
            const handleLoadedMetadata = () => console.log('Remote video metadata loaded');
            
            video.addEventListener('play', handlePlay);
            video.addEventListener('error', handleError);
            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            
            // Try to force play
            video.play().catch(e => console.error('Auto-play failed:', e));
            
            return () => {
                video.removeEventListener('play', handlePlay);
                video.removeEventListener('error', handleError);
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [remoteVideoRef.current?.srcObject]);
    
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

    useEffect(() => {
        if (!roomId) return;

        const messageRef = doc(firestore, 'calls', roomId);
        const unsubscribe = onSnapshot(messageRef, (snapshot) => {
            const data = snapshot.data();
            if (data?.messages?.length > lastMessageCountRef.current && !showChat) {
                setUnreadMessages(prev => prev + 1);
            }
            lastMessageCountRef.current = data?.messages?.length || 0;
        });

        return () => unsubscribe();
    }, [roomId, showChat]);

    // Reset counter when opening chat
    useEffect(() => {
        if (showChat) {
            setUnreadMessages(0);
        }
    }, [showChat]);

    useEffect(() => {
        console.log('Remote video enabled state:', remoteVideoEnabled);
    }, [remoteVideoEnabled]);

    async function toggleVideo() {
        if (localStream && peerConnection) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                if (!isVideoMuted) {
                    if (navigator.userAgent.toLowerCase().includes('firefox')) {
                        try {
                            // Firefox-specific video off handling
                            const tracks = peerConnection.getSenders();
                            const videoSender = tracks.find(sender => 
                                sender && 
                                (sender?.track?.kind === 'video' || 
                                 (sender?.track === null && sender.dtmf === null))
                            );
    
                            if (videoSender) {
                                await videoSender.replaceTrack(null);
                                if (videoSender.track) {
                                    videoSender.track.stop();
                                }
                            }
    
                            // Create and send new offer
                            const offer = await peerConnection.createOffer();
                            await peerConnection.setLocalDescription(offer);
                            await updateDoc(doc(firestore, 'calls', roomId), {
                                offer: { type: offer.type, sdp: offer.sdp }
                            });
                        } catch (error) {
                            console.error('Firefox video off error:', error);
                            return;
                        }
                    } else {
                        // Existing code for Chrome/Edge
                        localStream.getVideoTracks().forEach(track => {
                            track.enabled = false;
                            track.stop();
                        });
                        
                        const videoSenders = peerConnection
                            .getSenders()
                            .filter(sender => sender.track?.kind === 'video');
                        videoSenders.forEach(sender => {
                            if (sender.track) {
                                sender.track.enabled = false;
                                sender.track.stop();
                            }
                        });
                    }
                    setIsVideoMuted(true);
                } else {
                    try {
                        // Update state first
                        setIsVideoMuted(false);
                        
                        // Wait for next render cycle
                        await new Promise(resolve => setTimeout(resolve, 0));
    
                        // Log initial senders
                        console.log('Initial video senders:', peerConnection.getSenders()
                            .filter(sender => sender.track?.kind === 'video'));
    
                        // Stop and remove existing tracks
                        localStream.getVideoTracks().forEach(track => {
                            track.stop();
                            localStream.removeTrack(track);
                        });
    
                        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                        const newVideoTrack = newStream.getVideoTracks()[0];
                        console.log('Got new video track:', newVideoTrack?.label);
    
                        if (navigator.userAgent.toLowerCase().includes('firefox')) {
                            try {
                                // Firefox specific handling...
                                const tracks = peerConnection.getSenders();
                                const videoSender = tracks.find(sender => 
                                    sender && 
                                    (sender?.track?.kind === 'video' || 
                                     (sender?.track === null && sender.dtmf === null))
                                );
    
                                if (videoSender) {
                                    await videoSender.replaceTrack(newVideoTrack);
                                } else {
                                    tracks.forEach(sender => {
                                        if (sender?.track === null) {
                                            peerConnection.removeTrack(sender);
                                        }
                                    });
                                    peerConnection.addTrack(newVideoTrack, newStream);
                                }
    
                                const offer = await peerConnection.createOffer();
                                await peerConnection.setLocalDescription(offer);
                                
                                await updateDoc(doc(firestore, 'calls', roomId), {
                                    offer: { type: offer.type, sdp: offer.sdp }
                                });
                            } catch (error) {
                                console.error('Firefox track handling error:', error);
                                setIsVideoMuted(true); // Reset state if failed
                                return;
                            }
                        } else {
                            // Chrome/Edge handling
                            const videoSender = peerConnection
                                .getSenders()
                                .find(sender => sender.track?.kind === 'video');
    
                            if (videoSender) {
                                await videoSender.replaceTrack(newVideoTrack);
                            } else {
                                peerConnection.addTrack(newVideoTrack, newStream);
                            }
                        }
    
                        // Now try to access video element
                        if (localVideoRef.current) {
                            localStream.addTrack(newVideoTrack);
                            localVideoRef.current.srcObject = localStream;
                            console.log('Successfully updated local video');
                        } else {
                            console.error('Video element not mounted');
                            setIsVideoMuted(true); // Reset state if video element isn't available
                            return;
                        }
    
                    } catch (error) {
                        console.error('Error restarting video:', error);
                        setIsVideoMuted(true); // Reset state if failed
                    }
                }
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
        console.log('Starting cleanup...');
        
        // Stop all tracks in local stream
        if (localStream) {
            console.log('Stopping all local stream tracks...');
            localStream.getTracks().forEach(track => {
                console.log(`Stopping track: ${track.kind} - ${track.label}`);
                track.enabled = false;
                track.stop();
            });
            setLocalStream(null);
        }
    
        // Clear video elements
        if (localVideoRef.current) {
            const currentTracks = localVideoRef.current.srcObject?.getTracks() || [];
            currentTracks.forEach(track => {
                console.log(`Stopping video element track: ${track.kind} - ${track.label}`);
                track.enabled = false;
                track.stop();
            });
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            const currentTracks = remoteVideoRef.current.srcObject?.getTracks() || [];
            currentTracks.forEach(track => {
                console.log(`Stopping remote video element track: ${track.kind} - ${track.label}`);
                track.enabled = false;
                track.stop();
            });
            remoteVideoRef.current.srcObject = null;
        }
    
        // Close peer connection
        if (peerConnection) {
            console.log('Cleaning up peer connection...');
            // Stop all tracks from peer connection senders
            peerConnection.getSenders().forEach(sender => {
                if (sender.track) {
                    console.log(`Stopping sender track: ${sender.track.kind} - ${sender.track.label}`);
                    sender.track.enabled = false;
                    sender.track.stop();
                }
            });
            peerConnection.close();
            setPeerConnection(null);
        }
    
        // Clear data channel
        if (dataChannel) {
            console.log('Closing data channel...');
            dataChannel.close();
            setDataChannel(null);
        }
    
        if (setRoomId) {
            setRoomId('');
        }
        console.log('Cleanup completed');
    };

    async function endCall() {
        if (userRole === 'peer-counselor') {
            const endTime = new Date().toISOString();
            try {
                // Send end meeting signal to all participants
                if (dataChannel && dataChannel.readyState === 'open') {
                    dataChannel.send('endMeeting');
                }
    
                // Get current user token
                const token = await auth.currentUser.getIdToken();
                
                // Update call document status instead of deleting
                const callDoc = doc(firestore, 'calls', roomId);
                const callData = (await getDoc(callDoc)).data();
                await updateDoc(callDoc, {
                    status: 'ended',
                    endedAt: endTime
                });

                // Update peer counselor status to available
                await axios.put(
                    `http://localhost:5000/api/peer-counselor/status/${auth.currentUser.uid}`,
                    {
                        status: 'online',
                        isAvailable: true
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // Create session record
                const sessionData = {
                    roomId,
                    clientId: callData.clientId,
                    counselorId: callData.counselorId,
                    startTime: callData.startTime,
                    endTime,
                    status: 'completed',
                    duration: new Date(endTime) - new Date(callData.startTime),
                    notes: sessionNotes
                };
    
                try {
                    const response = await axios.post(
                        'http://localhost:5000/api/sessions', 
                        { sessionData, token },
                        { 
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
    
                    if (!response.data?.sessionId) {
                        throw new Error('Invalid session creation response');
                    }
    
                } catch (error) {
                    throw new Error(`Session creation failed: ${error.message}`);
                }
    
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
        <div className="relative w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] bg-gray-900">
            {/* Remote Video */}
            <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                {renderRemoteVideo()}
            </div>

            {/* Local Video */}
            <div 
                className="absolute top-2 right-2 md:top-4 md:right-4 w-[280px] h-[160px] bg-black rounded-lg overflow-hidden shadow-2xl"
                style={{
                    aspectRatio: localVideoAspectRatio > 1 ? '16/9' : '9/16',
                    width: localVideoAspectRatio > 1 ? '280px' : '160px',
                    height: localVideoAspectRatio > 1 ? '160px' : '280px'
                }}
            >
                <video 
                    className={`w-full h-full transform scale-x-[-1] ${isVideoMuted ? 'hidden' : ''}`}
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    onLoadedMetadata={handleLocalVideoMetadata}
                    style={{ objectFit: 'contain' }}
                />
                
                {isVideoMuted && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        {localUserPhoto ? (
                            <img 
                                src={localUserPhoto}
                                alt="You"
                                className="w-32 h-32 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center">
                                <span className="text-2xl text-white">
                                    {userRole === 'client' ? 'C' : 'PC'}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center flex-wrap gap-2 md:gap-4 p-3 md:p-6 bg-gradient-to-t from-black/70 to-transparent">
                <button 
                    className={`p-3 md:p-4 rounded-full transition-colors backdrop-blur-sm ${
                        isAudioMuted ? 'bg-red-500/80' : 'bg-gray-800/80'
                    } text-white hover:bg-opacity-100`}
                    onClick={toggleAudio}
                >
                    {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                <button 
                    className={`p-3 md:p-4 rounded-full transition-colors backdrop-blur-sm ${
                        isVideoMuted ? 'bg-red-500/80' : 'bg-gray-800/80'
                    } text-white hover:bg-opacity-100`}
                    onClick={toggleVideo}
                >
                    {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
                </button>

                <button 
                    className="p-3 md:p-4 rounded-full transition-colors backdrop-blur-sm bg-gray-800/80 text-white hover:bg-opacity-100"
                    onClick={() => setShowChat(!showChat)}
                >
                    <MessageCircle size={20} />
                    {unreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                    )}
                </button>

                {userRole === 'peer-counselor' && (
                    <button 
                        className="p-3 md:p-4 rounded-full transition-colors backdrop-blur-sm bg-gray-800/80 text-white hover:bg-opacity-100"
                        onClick={() => setShowNotes(!showNotes)}
                    >
                        <ClipboardEdit size={20} />
                    </button>
                )}

                <button 
                    className="p-3 md:p-4 rounded-full transition-colors backdrop-blur-sm bg-red-500/80 text-white hover:bg-red-600/80"
                    onClick={endCall}
                >
                    <PhoneOff size={20} />
                </button>
            </div>

            {/* Chat Component */}
            <Chat 
                roomId={roomId} 
                isOpen={showChat} 
                onClose={() => setShowChat(false)} 
            />

            {/* Notes Component */}
            {userRole === 'peer-counselor' && (
                <SessionNotes 
                    roomId={roomId} 
                    clientId={clientId}
                    isOpen={showNotes}
                    onClose={() => setShowNotes(false)} 
                    onNotesUpdate={(notes) => setSessionNotes(notes)} 
                />
            )}
        </div>
    );
};

export default VideoCall;