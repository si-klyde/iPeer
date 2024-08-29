import React, { useState, useRef, useEffect, useCallback } from 'react';
import { firestore } from '../firebase';
import { collection, doc, setDoc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

const VideoCall = ({ roomId, setRoomId }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [localStream, setLocalStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const navigate = useNavigate();

    const setupPeerConnection = useCallback(async (id) => {
        const callDoc = doc(collection(firestore, 'calls'), id);
        const offerCandidates = collection(callDoc, 'offerCandidates');
        const answerCandidates = collection(callDoc, 'answerCandidates');
    
        const pc = new RTCPeerConnection(servers);
        setPeerConnection(pc);
    
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    
        pc.ontrack = event => {
            const [remoteStream] = event.streams;
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
        };
    
        pc.onicecandidate = event => {
            if (event.candidate) {
                addDoc(offerCandidates, event.candidate.toJSON());
            }
        };
    
        const callData = (await getDoc(callDoc)).data();
        
        if (callData?.offer) {
            await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
            const answerDescription = await pc.createAnswer();
            await pc.setLocalDescription(answerDescription);
    
            const answer = {
                sdp: answerDescription.sdp,
                type: answerDescription.type
            };
            await updateDoc(callDoc, { answer });
    
            onSnapshot(offerCandidates, snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const candidate = new RTCIceCandidate(change.doc.data());
                        pc.addIceCandidate(candidate);
                    }
                });
            });
        } else {
            const offerDescription = await pc.createOffer();
            await pc.setLocalDescription(offerDescription);
    
            const offer = {
                sdp: offerDescription.sdp,
                type: offerDescription.type
            };
            await setDoc(callDoc, { offer });
    
            onSnapshot(callDoc, snapshot => {
                const data = snapshot.data();
                if (data?.answer && pc.signalingState === 'have-local-offer') {
                    const answerDescription = new RTCSessionDescription(data.answer);
                    pc.setRemoteDescription(answerDescription);
                }
            });
    
            onSnapshot(answerCandidates, snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const candidate = new RTCIceCandidate(change.doc.data());
                        pc.addIceCandidate(candidate);
                    }
                });
            });
        }
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

    function toggleAudio() {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                document.querySelector('#muteAudioButton').textContent = 
                    audioTrack.enabled ? 'Mute Audio' : 'Unmute Audio';
            }
        }
    }

    function toggleVideo() {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                document.querySelector('#muteVideoButton').textContent = 
                    videoTrack.enabled ? 'Mute Video' : 'Unmute Video';
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
        <div className="bg-gray-100 p-4 rounded-lg shadow-lg flex flex-col max-w-5xl">
            <div className="flex justify-center items-center h-full w-full space-x-4">
                <video 
                    className="w-1/2 h-1/2 object-cover rounded-lg border" 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted
                ></video>
                <video 
                    className="w-1/2 h-1/2 object-cover rounded-lg border" 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline
                ></video>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
                <button 
                    id="muteAudioButton" 
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600" 
                    onClick={toggleAudio}
                >
                    Mute Audio
                </button>
                <button 
                    id="muteVideoButton" 
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600" 
                    onClick={toggleVideo}
                >
                    Mute Video
                </button>
                <button 
                    className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600" 
                    onClick={endCall}
                >
                    End Call
                </button>
            </div>
        </div>
    );
};

export default VideoCall;