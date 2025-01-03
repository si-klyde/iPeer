import React, { useEffect, useState, useRef } from 'react';
import { Save, X, ClipboardEdit } from 'lucide-react';
import { auth } from '../firebase';
import axios from 'axios';

const SessionNotes = ({ roomId, clientId, isOpen, onClose }) => {
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
        <div 
            className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            <div className="flex flex-col h-full">
                <div className="p-4 bg-gradient-to-r from-green-600 to-green-700 text-white flex justify-between items-center shadow-md">
                    <h2 className="text-lg font-semibold">Session Notes</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSaveNotes}
                            disabled={isSaving}
                            className="px-4 py-1.5 bg-green-500 text-white rounded-full text-sm hover:bg-green-400 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-green-600/50 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
    
                <textarea
                    ref={textareaRef}
                    value={notes}
                    onChange={handleNotesChange}
                    className="flex-1 p-6 bg-gray-50 focus:outline-none resize-none text-sm leading-relaxed"
                    placeholder="Take session notes here..."
                />
    
                {lastSaved && (
                    <div className="px-4 py-2 text-xs text-gray-500 bg-white border-t">
                        Last saved: {new Date(lastSaved).toLocaleTimeString()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionNotes;
