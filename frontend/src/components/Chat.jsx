import React, { useRef, useEffect, useState } from 'react';
import { firestore } from '../firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { X } from 'lucide-react';
import notification from '../assets/notification/message.mp3'
import { auth } from '../firebase';
import axios from 'axios';
import API_CONFIG from '../config/api.js';

const Chat = ({ roomId, isOpen, onClose }) => {
    const chatBoxRef = useRef(null);
    const messageInputRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [userData, setUserData] = useState(null);
    const currentUser = auth.currentUser;
    const audioRef = useRef(new Audio(notification));
    const [previousMessagesLength, setPreviousMessagesLength] = useState(0);

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
                        ? `${API_CONFIG.BASE_URL}/api/peer-counselors/${currentUser.uid}`
                        : `${API_CONFIG.BASE_URL}/api/client/${currentUser.uid}`;
                    
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

    useEffect(() => {
        if (messages.length > previousMessagesLength) {
            try {
                audioRef.current.play();
            } catch (error) {
                // Sound plays successfully
            }
        }
        setPreviousMessagesLength(messages.length);
    }, [messages.length]);

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
        <div className={`fixed inset-0 md:inset-auto md:right-0 md:top-0 h-full w-full md:w-[380px] 
            bg-white transform transition-all duration-300 ease-in-out z-50 border-l
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="px-4 py-3 bg-white border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-full 
                            hover:bg-gray-100 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
    
                {/* Messages */}
                <div ref={chatBoxRef} 
                    className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gray-50"
                >
                    {messages.map((msg, index) => (
                        <div key={index} 
                            className={`flex ${msg.sender === userData?.fullName ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] space-y-1`}>
                                <span className="text-xs text-gray-500 px-1">
                                    {msg.sender}
                                </span>
                                <div className={`p-3 rounded-2xl ${
                                    msg.sender === userData?.fullName 
                                        ? 'bg-green-600 text-white ml-auto rounded-tr-none'
                                        : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                                }`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
    
                {/* Input */}
                <div className="p-3 bg-white border-t">
                    <div className="flex items-center gap-2">
                        <input
                            ref={messageInputRef}
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 px-4 h-10 bg-gray-50 rounded-full text-sm 
                                border focus:outline-none focus:border-green-500 
                                text-gray-800 placeholder-gray-400 transition-all"
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button
                            onClick={sendMessage}
                            className="h-10 px-5 bg-green-600 text-white text-sm font-medium 
                                rounded-full hover:bg-green-700 transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;