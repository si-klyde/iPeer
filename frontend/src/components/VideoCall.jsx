import React, { useState, useRef, useEffect, useCallback } from 'react';
import { firestore, auth } from '../firebase';
import { collection, doc, setDoc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ClipboardEdit, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import Chat from './Chat';
import SessionNotes from './SessionNotes';
import axios from 'axios';
import API_CONFIG from '../config/api.js';

const servers = {
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302'
            ]
        },
        {
            urls: import.meta.env.VITE_TURN_SERVER_URL,
            username: import.meta.env.VITE_TURN_USERNAME,
            credential: import.meta.env.VITE_TURN_CREDENTIAL,
            credentialType: 'password'
        }
    ],
    iceCandidatePoolSize: 10,
    iceTransportPolicy: 'relay',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
};

// Add connection monitoring
const monitorConnection = (pc) => {
    let monitorInterval = null;
    let failureCount = 0;
    
    const checkConnection = async () => {
        if (!pc || pc.connectionState === 'closed') {
            if (monitorInterval) {
                clearInterval(monitorInterval);
            }
            return;
        }

        console.log('Connection Status:', {
            iceConnectionState: pc.iceConnectionState,
            connectionState: pc.connectionState,
            signalingState: pc.signalingState,
            iceGatheringState: pc.iceGatheringState,
            remoteDescription: pc.remoteDescription ? 'set' : 'not set',
            localDescription: pc.localDescription ? 'set' : 'not set'
        });

        // Handle failed state
        if (pc.iceConnectionState === 'failed' || pc.connectionState === 'failed') {
            failureCount++;
            if (failureCount <= 3) {
                console.log(`Attempting ICE restart (attempt ${failureCount}/3)`);
                try {
                    const offer = await pc.createOffer({ iceRestart: true });
                    await pc.setLocalDescription(offer);
                    // Update the offer in Firestore
                    const callDoc = doc(firestore, 'calls', roomId);
                    await updateDoc(callDoc, {
                        offer: {
                            type: offer.type,
                            sdp: offer.sdp
                        }
                    });
                } catch (error) {
                    console.error('ICE restart failed:', error);
                }
            }
        } else {
            failureCount = 0;
        }
    };

    monitorInterval = setInterval(checkConnection, 2000);
    return () => {
        if (monitorInterval) {
            clearInterval(monitorInterval);
        }
    };
};

// Error handling utility function
const handleCallError = async (error, pc, roomId, userRole) => {
    console.error('Video call error:', error);
    
    if (auth.currentUser && userRole === 'peer-counselor') {
        try {
            const token = await auth.currentUser.getIdToken();
            // Update peer counselor status to available
            await axios.put(
                `${API_CONFIG.BASE_URL}/api/peer-counselor/status/${auth.currentUser.uid}`,
                {
                    status: 'online',
                    isAvailable: true
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Update call status if room exists
            if (roomId) {
                const callDoc = doc(firestore, 'calls', roomId);
                await updateDoc(callDoc, {
                    status: 'error',
                    errorDetails: {
                        message: error.message,
                        timestamp: new Date().toISOString()
                    }
                });
            }
        } catch (statusError) {
            console.error('Error updating status after call error:', statusError);
        }
    }

    // Close peer connection if it exists
    if (pc) {
        pc.close();
    }

    // Show error to user
    alert('Video call encountered an error. Please try again.');
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
        try {
            const callDoc = doc(collection(firestore, 'calls'), id);
            const offerCandidates = collection(callDoc, 'offerCandidates');
            const answerCandidates = collection(callDoc, 'answerCandidates');
            const callData = (await getDoc(callDoc)).data();

            if (callData?.status === 'ended') {
                cleanup();
                alert('This session has ended');
                navigate('/');
                return;
            }
        
            console.log('Setting up peer connection with config:', servers);
            const pc = new RTCPeerConnection(servers);
            setPeerConnection(pc);

            // Start connection monitoring
            const monitorInterval = monitorConnection(pc);

            // Buffer for ICE candidates received before remote description
            let iceCandidateBuffer = [];

            pc.onicecandidate = async event => {
                if (event.candidate) {
                    const candidate = event.candidate;
                    console.log('Generated ICE candidate:', {
                        type: candidate.type,
                        protocol: candidate.protocol,
                        address: candidate.address,
                        port: candidate.port
                    });

                    try {
                        await addDoc(userRole === 'peer-counselor' ? offerCandidates : answerCandidates, candidate.toJSON());
                        console.log('Successfully added ICE candidate to Firestore');
                    } catch (error) {
                        console.error('Error adding ICE candidate:', error);
                    }
                }
            };

            pc.onicegatheringstatechange = () => {
                console.log('ICE gathering state:', pc.iceGatheringState);
                if (pc.iceGatheringState === 'complete') {
                    console.log('ICE gathering complete');
                }
            };

            pc.oniceconnectionstatechange = async () => {
                console.log('ICE connection state changed to:', pc.iceConnectionState);
                
                switch (pc.iceConnectionState) {
                    case 'checking':
                        console.log('Establishing connection...');
                        break;
                    case 'connected':
                        console.log('Connection established successfully');
                        // Ensure remote stream is playing
                        if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
                            try {
                                await remoteVideoRef.current.play();
                            } catch (error) {
                                console.warn('Auto-play failed, will retry on user interaction');
                            }
                        }
                        break;
                    case 'disconnected':
                        console.log('Connection disconnected, waiting for reconnection...');
                        break;
                    case 'failed':
                        console.log('Connection failed, attempting recovery...');
                        try {
                            // First try ICE restart
                            const offer = await pc.createOffer({ iceRestart: true });
                            await pc.setLocalDescription(offer);
                            
                            await updateDoc(doc(firestore, 'calls', roomId), {
                                offer: {
                                    type: offer.type,
                                    sdp: offer.sdp
                                }
                            });

                            // If ICE restart doesn't work within 5 seconds, try full reconnection
                            setTimeout(async () => {
                                if (pc.iceConnectionState === 'failed') {
                                    console.log('ICE restart failed, attempting full reconnection...');
                                    const stream = await navigator.mediaDevices.getUserMedia({
                                        video: true,
                                        audio: true
                                    });
                                    
                                    stream.getTracks().forEach(track => {
                                        const sender = pc.getSenders().find(s => s.track?.kind === track.kind);
                                        if (sender) {
                                            sender.replaceTrack(track);
                                        }
                                    });
                                }
                            }, 5000);
                        } catch (error) {
                            console.error('Connection recovery failed:', error);
                            await handleCallError(error, pc, roomId, userRole);
                        }
                        break;
                    case 'closed':
                        console.log('Connection closed');
                        break;
                }
            };

            // Set up data channel
            if (userRole === 'peer-counselor') {
                const channel = pc.createDataChannel('endMeeting');
                channel.onopen = () => console.log('Data channel opened');
                channel.onclose = () => console.log('Data channel closed');
                channel.onerror = (error) => console.error('Data channel error:', error);
                setDataChannel(channel);
            } else {
                pc.ondatachannel = (event) => {
                    const channel = event.channel;
                    channel.onopen = () => console.log('Data channel opened');
                    channel.onclose = () => console.log('Data channel closed');
                    channel.onerror = (error) => console.error('Data channel error:', error);
                    setDataChannel(channel);
                    
                    channel.onmessage = (event) => {
                        if (event.data === 'endMeeting') {
                            cleanup();
                            navigate('/');
                        }
                    };
                };
            }

            // Add local tracks
            console.log('Adding tracks to peer connection...');
            localStream.getTracks().forEach(track => {
                console.log('Adding track to peer connection:', track.kind, track.enabled);
                const sender = pc.addTrack(track, localStream);
                if (track.kind === 'video') {
                    sender.setParameters({
                        ...sender.getParameters(),
                        degradationPreference: 'maintain-framerate',
                        encodings: [
                            {
                                maxBitrate: 500000, // Increased for better quality
                                maxFramerate: 30,
                                scaleResolutionDownBy: 2
                            }
                        ]
                    }).catch(console.error);
                }
            });
        
            // Handle remote tracks
            pc.ontrack = event => {
                console.log('Track received:', {
                    kind: event.track.kind,
                    enabled: event.track.enabled,
                    muted: event.track.muted,
                    readyState: event.track.readyState,
                    streams: event.streams.length
                });

                if (!remoteVideoRef.current) {
                    console.error('Remote video element not mounted');
                    return;
                }

                const [remoteStream] = event.streams;
                if (!remoteStream) {
                    console.error('No remote stream in track event');
                    return;
                }

                // Create new MediaStream if none exists
                if (!remoteVideoRef.current.srcObject) {
                    console.log('Creating new MediaStream for remote video');
                    const newStream = new MediaStream();
                    remoteVideoRef.current.srcObject = newStream;
                }

                const currentStream = remoteVideoRef.current.srcObject;

                // Add track if it doesn't exist
                const trackExists = currentStream.getTracks().some(t => t.id === event.track.id);
                if (!trackExists) {
                    console.log(`Adding ${event.track.kind} track to remote stream`);
                    currentStream.addTrack(event.track);
                }

                // Track state handling
                const updateTrackState = () => {
                    const hasVideoTrack = currentStream.getVideoTracks().some(track => track.enabled);
                    const hasAudioTrack = currentStream.getAudioTracks().some(track => track.enabled);
                    
                    setHasRemoteVideo(true);
                    setRemoteVideoEnabled(hasVideoTrack);
                    
                    console.log('Updated remote track states:', {
                        hasVideoTrack,
                        hasAudioTrack,
                        videoTracks: currentStream.getVideoTracks().length,
                        audioTracks: currentStream.getAudioTracks().length
                    });
                };

                // Set up track event listeners
                event.track.onunmute = () => {
                    console.log(`Remote ${event.track.kind} track unmuted`);
                    updateTrackState();
                };
                
                event.track.onmute = () => {
                    console.log(`Remote ${event.track.kind} track muted`);
                    updateTrackState();
                };
                
                event.track.onended = () => {
                    console.log(`Remote ${event.track.kind} track ended`);
                    updateTrackState();
                };

                // Force play attempt with retry
                const attemptPlay = async () => {
                    try {
                        await remoteVideoRef.current.play();
                        console.log('Remote video playback started');
                    } catch (error) {
                        console.warn('Auto-play failed:', error);
                        // Retry after user interaction
                        const playButton = document.createElement('button');
                        playButton.textContent = 'Click to play';
                        playButton.onclick = () => {
                            remoteVideoRef.current.play();
                            playButton.remove();
                        };
                        remoteVideoRef.current.parentElement.appendChild(playButton);
                    }
                };

                // Initial state update and play attempt
                updateTrackState();
                attemptPlay();
            };
        
            // Handle signaling
            if (!callData?.offer) {
                console.log('Creating offer...');
                const offerDescription = await pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                    voiceActivityDetection: true
                });

                console.log('Setting local description...');
                await pc.setLocalDescription(offerDescription);

                console.log('Updating call document with offer...');
                const offerData = {
                    type: offerDescription.type,
                    sdp: offerDescription.sdp
                };
                
                await updateDoc(callDoc, { offer: offerData });

                // Listen for remote answer with retry mechanism
                let answerRetries = 0;
                const maxRetries = 3;
                
                const answerListener = onSnapshot(callDoc, async (snapshot) => {
                    const data = snapshot.data();
                    if (!pc.currentRemoteDescription && data?.answer) {
                        console.log('Received answer, setting remote description...');
                        try {
                            const answerDescription = new RTCSessionDescription(data.answer);
                            await pc.setRemoteDescription(answerDescription);
                            console.log('Remote description set successfully');
                        } catch (error) {
                            console.error('Error setting remote description:', error);
                            if (answerRetries < maxRetries) {
                                answerRetries++;
                                console.log(`Retrying to set remote description (${answerRetries}/${maxRetries})`);
                                // Wait before retrying
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                try {
                                    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                                    console.log('Remote description set successfully on retry');
                                } catch (retryError) {
                                    console.error('Retry failed:', retryError);
                                    if (answerRetries === maxRetries) {
                                        await handleCallError(retryError, pc, id, userRole);
                                    }
                                }
                            }
                        }
                    }
                });

                // Listen for remote ICE candidates
                onSnapshot(userRole === 'peer-counselor' ? answerCandidates : offerCandidates, (snapshot) => {
                    snapshot.docChanges().forEach(async (change) => {
                        if (change.type === 'added') {
                            const candidate = new RTCIceCandidate(change.doc.data());
                            try {
                                if (pc.remoteDescription && pc.remoteDescription.type) {
                                    await pc.addIceCandidate(candidate);
                                    console.log('Added ICE candidate:', candidate);
                                } else {
                                    iceCandidateBuffer.push(candidate);
                                    console.log('Buffered ICE candidate:', candidate);
                                }
                            } catch (error) {
                                if (!error.message.includes('Unknown ufrag')) {
                                    console.error('Error adding ICE candidate:', error);
                                }
                            }
                        }
                    });
                });

                return () => answerListener();
            } else {
                console.log('Received offer, creating answer...');
                try {
                    console.log('Setting remote description from offer...');
                    await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
                
                    console.log('Creating answer...');
                    const answerDescription = await pc.createAnswer();
                
                    console.log('Setting local description...');
                    await pc.setLocalDescription(answerDescription);
                
                    console.log('Updating call document with answer...');
                    await updateDoc(callDoc, {
                        answer: {
                            type: answerDescription.type,
                            sdp: answerDescription.sdp
                        }
                    });
                
                    // Listen for remote ICE candidates
                    onSnapshot(userRole === 'peer-counselor' ? answerCandidates : offerCandidates, (snapshot) => {
                        snapshot.docChanges().forEach(async (change) => {
                            if (change.type === 'added') {
                                const candidate = new RTCIceCandidate(change.doc.data());
                                try {
                                    if (pc.remoteDescription && pc.remoteDescription.type) {
                                        await pc.addIceCandidate(candidate);
                                        console.log('Added ICE candidate:', candidate);
                                    } else {
                                        iceCandidateBuffer.push(candidate);
                                        console.log('Buffered ICE candidate:', candidate);
                                    }
                                } catch (error) {
                                    if (!error.message.includes('Unknown ufrag')) {
                                        console.error('Error adding ICE candidate:', error);
                                    }
                                }
                            }
                        });
                    });
                } catch (error) {
                    console.error('Error during answer creation:', error);
                    await handleCallError(error, pc, roomId, userRole);
                }
            }
        
            return pc;
        } catch (error) {
            console.error('Error in setupPeerConnection:', error);
            await handleCallError(error, null, roomId, userRole);
            navigate('/');
        }
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
                {(!hasRemoteVideo || !remoteVideoEnabled) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
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
    
    // Check browser compatibility
    const checkBrowserCompatibility = () => {
        const constraints = {
            video: true,
            audio: true
        };

        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Your browser does not support video calls. Please use a modern browser like Chrome, Firefox, or Edge.');
        }

        // Check WebRTC support
        if (!window.RTCPeerConnection) {
            throw new Error('Your browser does not support WebRTC. Please use a modern browser like Chrome, Firefox, or Edge.');
        }

        return navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                stream.getTracks().forEach(track => track.stop());
                return true;
            })
            .catch(error => {
                console.error('Browser compatibility check failed:', error);
                throw error;
            });
    };

    useEffect(() => {
        const init = async () => {
            try {
                await checkBrowserCompatibility();
                
                console.log('Requesting media permissions...');
                const constraints = {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        channelCount: 2
                    },
                    video: {
                        width: { min: 640, ideal: 1280, max: 1920 },
                        height: { min: 480, ideal: 720, max: 1080 },
                        aspectRatio: { ideal: 1.7777777778 },
                        facingMode: 'user',
                        frameRate: { min: 20, ideal: 30, max: 60 }
                    }
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                // Ensure tracks are enabled and unmuted
                stream.getTracks().forEach(track => {
                    track.enabled = true;
                    if (track.kind === 'video') {
                        console.log('Initializing video track:', {
                            id: track.id,
                            settings: track.getSettings(),
                            constraints: track.getConstraints()
                        });
                    }
                });

                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    localVideoRef.current.muted = true; // Mute local audio to prevent echo
                    await localVideoRef.current.play().catch(console.error);
                    console.log('Local video element configured');
                }
            } catch (error) {
                console.error('Error during initialization:', error);
                handleInitError(error);
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
                        // Chrome/Edge handling
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

                        // Stop and remove existing tracks
                        localStream.getVideoTracks().forEach(track => {
                            track.stop();
                            localStream.removeTrack(track);
                        });

                        const newStream = await navigator.mediaDevices.getUserMedia({ 
                            video: {
                                width: { ideal: 1280 },
                                height: { ideal: 720 },
                                facingMode: 'user',
                                frameRate: { ideal: 30 }
                            }
                        });
                        const newVideoTrack = newStream.getVideoTracks()[0];
                        console.log('Got new video track:', newVideoTrack?.label);

                        if (navigator.userAgent.toLowerCase().includes('firefox')) {
                            try {
                                // Firefox specific handling
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
                                videoSender.track.enabled = true;
                            } else {
                                peerConnection.addTrack(newVideoTrack, newStream);
                            }
                        }

                        // Update local video
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
                console.log('Toggling audio:', !audioTrack.enabled);
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
    const cleanup = async () => {
        try {
            console.log('Starting cleanup...');
            
            if (localStream) {
                console.log('Stopping local tracks...');
                localStream.getTracks().forEach(track => {
                    console.log(`Stopping ${track.kind} track`);
                    track.stop();
                });
                setLocalStream(null);
            }

            if (peerConnection) {
                console.log('Closing peer connection...');
                // Remove all tracks from peer connection
                const senders = peerConnection.getSenders();
                senders.forEach(sender => {
                    if (sender.track) {
                        sender.track.stop();
                    }
                    try {
                        peerConnection.removeTrack(sender);
                    } catch (e) {
                        console.error('Error removing track:', e);
                    }
                });
                
                peerConnection.close();
                setPeerConnection(null);
            }

            // Update peer counselor status if applicable
            if (userRole === 'peer-counselor' && auth.currentUser) {
                console.log('Updating peer counselor status...');
                const token = await auth.currentUser.getIdToken();
                await axios.put(
                    `${API_CONFIG.BASE_URL}/api/peer-counselor/status/${auth.currentUser.uid}`,
                    {
                        status: 'online',
                        isAvailable: true
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
            }

            // Clear video elements
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }

        } catch (error) {
            console.error('Error during cleanup:', error);
        }
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
                    `${API_CONFIG.BASE_URL}/api/peer-counselor/status/${auth.currentUser.uid}`,
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
                    notes: sessionNotes,
                    type: callData.appointmentId ? 'Appointment' : 'Instant'
                };
    
                try {
                    const response = await axios.post(
                        `${API_CONFIG.BASE_URL}/api/sessions`, 
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