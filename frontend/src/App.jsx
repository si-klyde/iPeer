import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import ButtonGradient from './assets/svg/ButtonGradient.jsx';
import Header from './components/Header.jsx';
import Counseling from './pages/Counseling';
import WaitingRoom from './pages/WaitingRoom';
import Hero from './components/Hero.jsx';
import Login from './pages/Login.jsx';
import Therapy from './pages/Therapy.jsx';
import PlayTherapy from './pages/PlayTherapy.jsx'; // Add Play Therapy Page
import MusicTherapy from './pages/MusicTherapy.jsx'; // Add Music Therapy Page
import ArtTherapy from './pages/ArtTherapy.jsx'; // Add Art Therapy Page
import RegisterPeerCounselor from './pages/RegisterPeerCounselor.jsx';
import LoginPeerCounselor from './pages/LoginPeerCounselor.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import ViewAppointments from './pages/ViewAppointments.jsx';
import { auth, authStateChanged } from './firebase';
import Footer from './components/Footer.jsx';

const App = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
      const unsubscribe = authStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
  
      return () => unsubscribe();
    }, []);

    return (
        <>
            <Header user={user} />
            <div className="pt-[4.75rem] lg:pt-[5rem] overflow-hidden">
                <Routes>
                    <Route path="/" element={<Hero />} />
                    <Route path="/home" element={<Hero />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/waitingroom" element={<WaitingRoom />} />
                    <Route path="/counseling/:roomId" element={<Counseling />} />
                    <Route path="/register-peer-counselor" element={<RegisterPeerCounselor />} />
                    <Route path="/login-peer-counselor" element={<LoginPeerCounselor />} />
                    <Route path="/book-appointment" element={<BookAppointment />} />
                    <Route path="/appointments" element={<ViewAppointments />} />
                    
                    {/* Therapy Routes */}
                    <Route path="/therapy" element={<Therapy />} /> {/* Therapy selection page */}
                    <Route path="/therapy/play" element={<PlayTherapy />} /> {/* Play Therapy page */}
                    <Route path="/therapy/music" element={<MusicTherapy />} /> {/* Music Therapy page */}
                    <Route path="/therapy/art" element={<ArtTherapy />} /> {/* Art Therapy page */}
                </Routes>
            </div>
            <Footer />
        </>
    );
};

export default App;
