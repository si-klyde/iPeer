import React, { useEffect, useState, useRef } from 'react';
import { Save, X, ClipboardEdit } from 'lucide-react';
import { auth } from '../firebase';
import axios from 'axios';

const SessionNotes = ({ roomId, clientId }) => {
    const [notes, setNotes] = useState('');
    const textareaRef = useRef(null);
    const [cursorPosition, setCursorPosition] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            if (clientId) {
                try {
                    const token = await auth.currentUser.getIdToken();
                    const response = await axios.get(`http://localhost:5000/api/notes/client/${clientId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setNotes(response.data.content);
                } catch (error) {
                    console.error('Error fetching notes:', error);
                }
            }
        };
        fetchNotes();
    }, [clientId]);

    const handleSaveNotes = async () => {
        if (!notes.trim() || !clientId) return;
        
        setIsSaving(true);
        try {
            const token = await auth.currentUser.getIdToken();
            await axios.post('http://localhost:5000/api/save-note', {
                roomId,
                notes,
                clientId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error('Error saving notes:', error);
        }
        setIsSaving(false);
    };

    useEffect(() => {
        const autoSaveInterval = setInterval(async () => {
            if (notes) {
                await handleSaveNotes();
            }
        }, 300000); // Auto-save every 5 minutes

        return () => clearInterval(autoSaveInterval);
    }, [notes]);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
                <ClipboardEdit className="w-4 h-4 mr-2" />
                Open Notes
            </button>

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
                                className="flex items-center px-2 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
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
        </>
    );
};

export default SessionNotes;
