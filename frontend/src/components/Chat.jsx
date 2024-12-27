import React, { useRef, useEffect, useState } from 'react';
import { firestore } from '../firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth } from '../firebase';

const Chat = ({ roomId }) => {
    const chatBoxRef = useRef(null);
    const messageInputRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [userData, setUserData] = useState(null);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                const userDocRef = doc(firestore, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            }
        };
        fetchUserData();
    }, [currentUser]);


    useEffect(() => {
        let unsubscribe;

        if (roomId) {
            const callDoc = doc(firestore, 'calls', roomId);
            unsubscribe = onSnapshot(callDoc, (snapshot) => {
                const data = snapshot.data();
                if (data && data.messages) {
                    setMessages(data.messages);
                    updateChatBox(data.messages);
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


    function updateChatBox(messages) {
        if (chatBoxRef.current) {
            chatBoxRef.current.innerHTML = '';
            messages.forEach(msg => {
                const msgElement = document.createElement('div');
                msgElement.textContent = `${msg.sender}: ${msg.text}`;
                msgElement.className = "p-2 rounded bg-gray-200 my-2";
                chatBoxRef.current.appendChild(msgElement);
            });
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }


    return (
        <div className="chat-container bg-white p-4 rounded-lg shadow-lg max-h-96 flex flex-col justify-between">
            <div ref={chatBoxRef} id="chatBox" className="overflow-y-auto mb-4 h-64 p-2 border rounded-lg bg-gray-50 text-black"></div>
            <div className="chat-input flex">
                <input
                    type="text"
                    ref={messageInputRef}
                    placeholder="Type a message..."
                    className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    onClick={sendMessage}
                    className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;