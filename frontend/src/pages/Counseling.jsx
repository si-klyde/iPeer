import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { firestore } from '../firebase';
import { doc, getDoc, setDoc,updateDoc } from 'firebase/firestore';
import VideoCall from '../components/VideoCall';
import Chat from '../components/Chat';
import { Save, X, ClipboardEdit } from 'lucide-react';
import { auth } from '../firebase';
import axios from 'axios';

const Counseling = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isCreating = location.state?.isCreating;

    const [isValidRoom, setIsValidRoom] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(roomId);
    const [notes, setNotes] = useState('');
    const textareaRef = useRef(null);
    const [cursorPosition, setCursorPosition] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [userRole, setUserRole] = useState(null);
    
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const token = await auth.currentUser.getIdToken();
                const response = await axios.post('http://localhost:5000/api/check-role', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Role check response:', response.data);
                setUserRole(response.data.role);
            } catch (error) {
                console.error('Error checking user role:', error);
                if (error.response) {
                    console.error('Response error:', error.response.data);
                }
            }
        };
    
        checkUserRole();
    }, []);
    

    const handleNotesChange = (e) => {
        const { selectionStart } = e.target;
        setNotes(e.target.value);
        setCursorPosition(selectionStart);
    };

    useEffect(() => {
        if (cursorPosition !== null && textareaRef.current) {
            textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, [notes, cursorPosition]);

    useEffect(() => {
        const fetchNotes = async () => {
            if (roomId) {
                const roomRef = doc(firestore, 'calls', roomId);
                const roomDoc = await getDoc(roomRef);
                if (roomDoc.exists() && roomDoc.data().notes) {
                    setNotes(roomDoc.data().notes);
                }
            }
        };
        fetchNotes();
    }, [roomId]);

    useEffect(() => {
        const autoSaveInterval = setInterval(async () => {
            if (notes && isValidRoom) {
                await handleSaveNotes();
            }
        }, 300000);

        return () => clearInterval(autoSaveInterval);
    }, [notes, isValidRoom]);

    const handleSaveNotes = async () => {
        if (!notes.trim() || !isValidRoom) return;
        
        setIsSaving(true);
        try {
            const roomRef = doc(firestore, 'calls', roomId);
            await updateDoc(roomRef, {
                notes: notes,
                lastUpdated: new Date()
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error('Error saving notes:', error);
        }
        setIsSaving(false);
    };

    const NotesModal = () => (
        <div className={`fixed right-4 bottom-4 z-50 ${isModalOpen ? '' : 'hidden'}`}>
            <div className="bg-white rounded-lg w-96 shadow-xl border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 rounded-t-lg border-b border-gray-200 flex justify-between items-center cursor-move">
                    <h2 className="text-lg font-semibold text-gray-700">Session Notes</h2>
                    <div className="flex items-center space-x-3">
                        {lastSaved && (
                            <span className="text-xs text-gray-500">
                                {lastSaved.toLocaleTimeString()}
                            </span>
                        )}
                        <button
                            onClick={handleSaveNotes}
                            disabled={isSaving}
                            className="flex items-center px-2 py-1 text-sm bg-blue-500 text-white rounded-md 
                                     hover:bg-blue-600 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-1" />
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <textarea
                    ref={textareaRef}
                    value={notes}
                    onChange={handleNotesChange}
                    className="w-full h-64 p-4 rounded-b-lg resize-none focus:outline-none"
                    placeholder="Take session notes here..."
                    autoFocus
                />
            </div>
        </div>
    );

    useEffect(() => {
        const checkRoom = async () => {
            if (roomId) {
                try {
                    const roomRef = doc(firestore, 'calls', roomId);
                    const roomSnapshot = await getDoc(roomRef);
    
                    if (roomSnapshot.exists()) {
                        if (location.state?.isCreating) {
                            // If we're supposed to be creating a room but it already exists,
                            // show an error and redirect to waiting room
                            alert("This room already exists. Please try creating a new room.");
                            navigate('/');
                        } else {
                            setIsValidRoom(true);
                        }
                    } else if (location.state?.isCreating) {
                        // Creating a new room
                        await setDoc(roomRef, { createdAt: new Date() });
                        setIsValidRoom(true);
                    } else {
                        alert("This room does not exist. Redirecting to waiting room.");
                        navigate('/');
                    }
                } catch (error) {
                    console.error("Error checking room:", error);
                    alert("An error occurred while checking the room. Redirecting to waiting room.");
                    navigate('/');
                }
            } else {
                // If there's no roomId, set the room as invalid
                setIsValidRoom(false);
            }
        };
    
        checkRoom();
    }, [roomId, navigate, location.state]);

    if (!isValidRoom) {
        return <div className="min-h-screen flex items-center justify-center text-white">Checking room validity...</div>;
    }


    return (
        <div className="m-3 text-color-7 min-h-screen flex flex-col items-center bg-color-5 tracking-wide">
            <h1 className="text-3xl font-bold text-white mb-8">iPeer Counseling Room</h1>
            
            <div className="mt-5 w-full max-w-6xl flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
                <div className="w-full lg:w-8/12 bg-white p-6 rounded-lg shadow-lg">
                    <VideoCall roomId={roomId} setRoomId={setCurrentRoomId} />
                </div>
                <div className="w-full lg:w-4/12 bg-white p-6 rounded-lg shadow-lg">
                    <Chat roomId={roomId} />
                    {userRole === 'peer-counselor' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            <ClipboardEdit className="w-4 h-4 mr-2" />
                            Open Notes
                        </button>
                    )}
                </div>
            </div>
            {userRole === 'peer-counselor' && <NotesModal />}
        </div>
    );
};

export default Counseling;
