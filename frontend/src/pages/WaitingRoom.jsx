import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const WaitingRoom = () => {
    const [roomCode, setRoomCode] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const navigate = useNavigate();

    // Function to navigate back to the default view
    const goBack = () => {
        setSelectedOption('');  // Resets the selected option to show the default view
    };

    useEffect(() => {
        // Hide Header and Footer
        document.querySelector('header')?.classList.add('hidden');
        document.querySelector('footer')?.classList.add('hidden');

        return () => {
            // Restore Header and Footer visibility when leaving the page
            document.querySelector('header')?.classList.remove('hidden');
            document.querySelector('footer')?.classList.remove('hidden');
        };
    }, []);

    const createRoom = async () => {
        try {
            const currentUser = auth.currentUser;
            const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
            const userRole = userDoc.data().role;
            
            if (userRole !== 'client') {
                alert('Only clients can create new sessions');
                return;
            }
    
            const newRoomCode = Math.random().toString(36).substring(2, 15);
            const roomRef = doc(firestore, 'calls', newRoomCode);
            
            // Create room with initial data
            const roomData = {
                clientId: currentUser.uid,
                status: 'waiting',
                createdAt: new Date(),
                clientName: userDoc.data().fullName || 'Anonymous Client'
            };
    
            console.log('Creating room with data:', roomData);
            await setDoc(roomRef, roomData);
    
            // Verify room creation
            const verifyRoom = await getDoc(roomRef);
            console.log('Verified room data:', verifyRoom.data());
            
            navigate(`/counseling/${newRoomCode}`, { 
                state: { 
                    isCreating: true,
                    clientId: currentUser.uid 
                }
            });
        } catch (error) {
            console.error('Room creation error:', error);
        }
    };
    

    const joinRoom = async () => {
        if (roomCode) {
            try {
                const currentUser = auth.currentUser;
                const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
                const userRole = userDoc.data().role;
                const roomRef = doc(firestore, 'calls', roomCode);
                const roomSnapshot = await getDoc(roomRef);

                if (roomSnapshot.exists()) {
                    const roomData = roomSnapshot.data();
                    if (userRole === 'peer-counselor' && !roomData.counselorId) {
                        await updateDoc(roomRef, { counselorId: currentUser.uid, status: 'active' });
                    } else if (userRole === 'client' && !roomData.clientId) {
                        await updateDoc(roomRef, { clientId: currentUser.uid, status: 'active' });
                    }
                    navigate(`/counseling/${roomCode}`);
                } else {
                    alert("No active session found with this code. Please check the code and try again.");
                }
            } catch (error) {
                console.error("Error checking room:", error);
                alert("An error occurred while checking the room. Please try again.");
            }
        }
    };

    const renderDefaultView = () => (
        <div className="h-auto flex flex-col items-center space-y-4 w-full max-w-md sm:max-w-sm md:max-w-lg">
            <button 
                onClick={() => navigate('/book-appointment')} 
                className="w-full bg-[#fe8a4f] text-white py-3 px-6 rounded-lg text-lg font-semibold transition hover:bg-[#fe8a4f]/80 hover:scale-105 sm:text-base md:text-xl"
            >
                Book an Appointment
            </button>
            <button 
                onClick={() => setSelectedOption('instant')} 
                className="w-full bg-[#408f40] text-white py-3 px-6 rounded-lg text-lg font-semibold transition hover:bg-green-400 hover:scale-105 sm:text-base md:text-xl"
            >
                Start Instant Meeting
            </button>
        </div>
    );

    const renderInstantMeetingView = () => (
        <div className="flex flex-col items-center space-y-4 w-full max-w-md sm:max-w-sm md:max-w-lg relative">
             <button 
                onClick={goBack} 
                className="mr- bg-transparent text-black text-xl font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200 sm:text-lg md:text-2xl"
            >
                &#8592; {/* Left Arrow character */}
            </button>
            <h1 className="text-2xl text-center font-bold text-black mb-2 sm:text-xl md:text-3xl">iPeer Counseling Waiting Room</h1>
           
            <button 
                onClick={createRoom} 
                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg text-lg font-semibold transition hover:bg-green-600 hover:scale-105 sm:text-base md:text-xl"
            >
                Create New Room
            </button>
            <div className="w-full flex flex-col items-center">
                <input 
                    type="text" 
                    value={roomCode} 
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Enter room code"
                    className="custom-input-date mb-4 w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm md:text-lg"
                    />
                <button 
                    onClick={joinRoom} 
                    className="w-full bg-[#fe8a4f] text-white py-3 px-6 rounded-lg text-lg font-semibold transition hover:bg-[#fe8a4f]/70 hover:scale-105 sm:text-base md:text-xl"
                >
                    Join Room
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#E6F4EA] p-4 sm:p-2 md:p-6">
            {selectedOption === '' && renderDefaultView()}
            {selectedOption === 'instant' && renderInstantMeetingView()}
        </div>
    );
};

export default WaitingRoom;
