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
        console.log('SessionNotes mounted with:', {
            roomId,
            clientId,
            hasNotes: !!notes
        });
        
        const fetchNotes = async () => {
            if (!clientId) {
                console.log('No clientId available yet');
                return;
            }
    
            try {
                const token = await auth.currentUser.getIdToken();
                const response = await axios.get(
                    `http://localhost:5000/api/notes/client/${clientId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                setNotes(response.data.content || '');
            } catch (error) {
                console.error('Error fetching notes:', error);
            }
        };
    
        fetchNotes();
    }, [clientId]);

    const handleSaveNotes = async () => {
        if (!notes.trim() || !clientId) {
            console.log('Cannot save: missing data', { hasNotes: !!notes.trim(), hasClientId: !!clientId });
            return;
        }
        
        setIsSaving(true);
        try {
            const token = await auth.currentUser.getIdToken();
            console.log('Saving notes:', { 
                roomId, 
                clientId,
                notesLength: notes.length 
            });
    
            const response = await axios.post('http://localhost:5000/api/save-note', {
                roomId,
                notes,
                clientId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            console.log('Save response:', response.data);
            setLastSaved(new Date());
        } catch (error) {
            console.error('Error saving notes:', {
                message: error.message,
                response: error.response?.data
            });
        } finally {
            setIsSaving(false);
        }
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
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
                <ClipboardEdit className="w-5 h-5" />
                Session Notes
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-end p-4">
                    <div className="bg-white rounded-lg w-96 shadow-xl">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="font-semibold text-green-800">Session Notes</h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={isSaving}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={() => setIsModalOpen(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={notes}
                            onChange={handleNotesChange}
                            className="w-full h-96 p-4 focus:outline-none resize-none"
                            placeholder="Take session notes here..."
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default SessionNotes;
