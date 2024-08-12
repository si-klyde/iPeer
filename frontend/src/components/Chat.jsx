import React, { useRef, useEffect, useState } from 'react';
import { firestore } from '../firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const Chat = ({ roomId }) => {
    const chatBoxRef = useRef(null);
    const messageInputRef = useRef(null);
    const [messages, setMessages] = useState([]);

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
            const callDoc = doc(firestore, 'calls', roomId);
            const newMessage = { text: messageText, sender: 'Me', timestamp: new Date().toISOString() };
            const updatedMessages = [...messages, newMessage];
            await updateDoc(callDoc, { messages: updatedMessages });
            messageInputRef.current.value = '';
        }
    }

    function updateChatBox(messages) {
        if (chatBoxRef.current) {
            chatBoxRef.current.innerHTML = '';
            messages.forEach(msg => {
                const msgElement = document.createElement('div');
                msgElement.textContent = `${msg.sender}: ${msg.text}`;
                chatBoxRef.current.appendChild(msgElement);
            });
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }

    return (
        <div className="chat-container">
            <div ref={chatBoxRef} id="chatBox"></div>
            <div className="chat-input">
                <input
                    type="text"
                    ref={messageInputRef}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chat;