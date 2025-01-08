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
        <div className={`fixed inset-0 md:inset-auto md:right-0 md:top-0 h-full w-full md:w-[380px] 
            bg-white transform transition-all duration-300 ease-in-out z-50 border-l
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="px-4 py-3 bg-white border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Session Notes</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSaveNotes}
                            disabled={isSaving}
                            className="h-9 px-4 bg-green-600 text-white text-sm font-medium 
                                rounded-full hover:bg-green-700 disabled:opacity-50 
                                disabled:hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-full 
                                hover:bg-gray-100 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
    
                {/* Notes Area */}
                <textarea
                    ref={textareaRef}
                    value={notes}
                    onChange={handleNotesChange}
                    className="flex-1 p-4 bg-gray-50 text-sm text-gray-800 
                        focus:outline-none resize-none leading-relaxed"
                    placeholder="Start taking session notes..."
                />
    
                {/* Status Bar */}
                {lastSaved && (
                    <div className="px-4 h-9 text-xs text-gray-500 bg-white border-t 
                        flex items-center justify-between">
                        <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
                        <span className="text-green-600">Auto-saving enabled</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionNotes;
