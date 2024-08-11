import React, { useState, useRef, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, doc, setDoc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

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
    }, []);

    async function startCall() {
        try {
            const id = Math.random().toString(36).substring(2, 15);
            setRoomId(id);
            await setupPeerConnection(id);
            alert(`Call started. Share this ID with the person you want to join: ${id}`);
        } catch (error) {
            console.error('Error starting call.', error);
            alert('Error starting call: ' + error.message);
        }
    }

    async function joinCall() {
        try {
            const id = prompt('Enter the ID of the call you want to join:');
            if (!id) return;
            console.log('Joining call with ID:', id);
            setRoomId(id);
            await setupPeerConnection(id, true);
        } catch (error) {
            console.error('Error joining call.', error);
            alert('Error joining call: ' + error.message);
        }
    }

    async function setupPeerConnection(id, isJoining = false) {
        const callDoc = doc(collection(firestore, 'calls'), id); // Use the passed ID
        const offerCandidates = collection(callDoc, 'offerCandidates');
        const answerCandidates = collection(callDoc, 'answerCandidates');
    
        const peerConnection = new RTCPeerConnection(servers);
        setPeerConnection(peerConnection);
    
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    
        peerConnection.ontrack = event => {
            const [remoteStream] = event.streams;
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
        };
    
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                if (isJoining) {
                    addDoc(answerCandidates, event.candidate.toJSON());
                } else {
                    addDoc(offerCandidates, event.candidate.toJSON());
                }
            }
        };
    
        if (isJoining) {
            const callData = (await getDoc(callDoc)).data();
            if (!callData || !callData.offer) {
                alert("Call ID not found or offer not available.");
                return;
            }
            
            const offerDescription = callData.offer;
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));
    
            const answerDescription = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answerDescription);
    
            const answer = {
                sdp: answerDescription.sdp,
                type: answerDescription.type
            };
            await updateDoc(callDoc, { answer });
    
            onSnapshot(offerCandidates, snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const candidate = new RTCIceCandidate(change.doc.data());
                        peerConnection.addIceCandidate(candidate);
                    }
                });
            });
        } else {
            const offerDescription = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offerDescription);
    
            const offer = {
                sdp: offerDescription.sdp,
                type: offerDescription.type
            };
            await setDoc(callDoc, { offer });
    
            onSnapshot(callDoc, snapshot => {
                const data = snapshot.data();
                if (data && data.answer && peerConnection.signalingState === 'have-local-offer') {
                    const answerDescription = new RTCSessionDescription(data.answer);
                    peerConnection.setRemoteDescription(answerDescription);
                }
            });
    
            onSnapshot(answerCandidates, snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const candidate = new RTCIceCandidate(change.doc.data());
                        peerConnection.addIceCandidate(candidate);
                    }
                });
            });
        }
    }

    function toggleAudio() {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                // Update button text
                if (audioTrack.enabled) {
                    document.querySelector('#muteAudioButton').textContent = 'Mute Audio';
                } else {
                    document.querySelector('#muteAudioButton').textContent = 'Unmute Audio';
                }
            }
        }
    }

    function toggleVideo() {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                // Update button text
                if (videoTrack.enabled) {
                    document.querySelector('#muteVideoButton').textContent = 'Mute Video';
                } else {
                    document.querySelector('#muteVideoButton').textContent = 'Unmute Video';
                }
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
        setRoomId('');
        alert('Call ended');
    }

    return (
        <div>
            <div className="call-controls">
                <button onClick={startCall}>Start Call</button>
                <button onClick={joinCall}>Join Call</button>
            </div>
            <div className="video-container">
                <video className="video-player" ref={localVideoRef} autoPlay playsInline muted></video>
                <video className="video-player" ref={remoteVideoRef} autoPlay playsInline></video>
            </div>
            <div className="call-actions">
                <button id="muteAudioButton" onClick={toggleAudio}>Mute Audio</button>
                <button id="muteVideoButton" onClick={toggleVideo}>Mute Video</button>
                <button onClick={endCall}>End Call</button>
            </div>
        </div>
    );
};

export default VideoCall;