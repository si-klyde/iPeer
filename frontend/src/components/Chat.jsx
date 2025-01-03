import React, { useRef, useEffect, useState } from 'react';
import { firestore } from '../firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { X } from 'lucide-react';
import { auth } from '../firebase';
import axios from 'axios';

const Chat = ({ roomId, isOpen, onClose }) => {
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
        <div 
            className={`fixed inset-0 md:inset-auto md:right-0 md:top-0 md:h-full md:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Session Chat</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-green-600/50 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {/* Messages */}
                <div 
                    ref={chatBoxRef} 
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                >
                    {messages.map((msg, index) => (
                        <div 
                            key={index}
                            className={`flex flex-col ${
                                msg.sender === userData?.fullName 
                                    ? 'items-end' 
                                    : 'items-start'
                            }`}
                        >
                            <div className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${
                                msg.sender === userData?.fullName 
                                    ? 'bg-green-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 rounded-tl-none'
                            }`}>
                                <div className="text-xs md:text-sm font-medium mb-1 opacity-90">
                                    {msg.sender}
                                </div>
                                <div className="text-sm md:text-base">
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
    
                {/* Input Area */}
                <div className="p-3 md:p-4 border-t bg-white shadow-inner">
                    <div className="flex gap-2">
                        <input
                            ref={messageInputRef}
                            type="text"
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 rounded-full border-2 border-green-100 focus:outline-none focus:border-green-500 transition-colors text-base"
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button
                            onClick={sendMessage}
                            className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-sm text-base font-medium"
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