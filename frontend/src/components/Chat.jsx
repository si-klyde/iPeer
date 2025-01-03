import React, { useRef, useEffect, useState } from 'react';
import { firestore } from '../firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth } from '../firebase';
import axios from 'axios';

const Chat = ({ roomId }) => {
    const chatBoxRef = useRef(null);
    const messageInputRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [userData, setUserData] = useState(null);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    // First get user role
                    const userDocRef = doc(firestore, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    const userRole = userDoc.data().role;
    
                    // Use role to determine endpoint
                    const token = await currentUser.getIdToken();
                    const endpoint = userRole === 'peer-counselor' 
                        ? `http://localhost:5000/api/peer-counselors/${currentUser.uid}`
                        : `http://localhost:5000/api/client/${currentUser.uid}`;
                    
                    const response = await axios.get(endpoint, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUserData(response.data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };
        fetchUserData();
    }, [currentUser]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        let unsubscribe;

        if (roomId) {
            const callDoc = doc(firestore, 'calls', roomId);
            unsubscribe = onSnapshot(callDoc, (snapshot) => {
                const data = snapshot.data();
                if (data && data.messages) {
                    setMessages(data.messages);
                }
            });
        } else {
            setMessages([]);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [roomId]);

    async function sendMessage() {
        if (!roomId) {
            alert('You must be in a call to send messages.');
            return;
        }
        const messageText = messageInputRef.current.value.trim();
        if (messageText) {
            try {
                const callDoc = doc(firestore, 'calls', roomId);
                const newMessage = {
                    text: messageText,
                    sender: userData?.fullName || currentUser.displayName || 'Anonymous',
                    timestamp: new Date().toISOString()
                };

                const docSnap = await getDoc(callDoc);
                const currentMessages = docSnap.data()?.messages || [];
                
                const updatedMessages = [...currentMessages, newMessage];
                await updateDoc(callDoc, { messages: updatedMessages });
                messageInputRef.current.value = '';
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Failed to send message. Please try again.');
            }
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-lg flex flex-col h-[400px]">
            <div className="p-3 bg-green-600 text-white rounded-t-lg">
                <h2 className="font-semibold">Session Chat</h2>
            </div>
            <div 
                ref={chatBoxRef} 
                className="flex-1 overflow-y-auto p-4 space-y-3"
            >
                {messages.map((msg, index) => (
                    <div 
                        key={index}
                        className={`p-3 rounded-lg max-w-[80%] ${
                            msg.sender === userData?.fullName 
                                ? 'ml-auto bg-green-100 text-green-900'
                                : 'bg-gray-100 text-gray-900'
                        }`}
                    >
                        <div className="text-xs font-medium mb-1">{msg.sender}</div>
                        <div>{msg.text}</div>
                    </div>
                ))}
            </div>
            <div className="p-3 border-t">
                <div className="flex gap-2">
                    <input
                        ref={messageInputRef}
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 rounded-full border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;