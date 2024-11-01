import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import ButtonGradient from './assets/svg/ButtonGradient.jsx';
import Header from './components/Header.jsx';
import ProtectedRoute from './context/ProtectedRoute.jsx';
import Counseling from './pages/Counseling';
import WaitingRoom from './pages/WaitingRoom';
import Hero from './components/Hero.jsx';
import Login from './pages/Login.jsx';
import Therapy from './pages/Therapy.jsx';
import { GameRoom, MusicRoom, ArtRoom } from './components/Rooms';
import RegisterPeerCounselor from './pages/RegisterPeerCounselor.jsx';
import LoginPeerCounselor from './pages/LoginPeerCounselor.jsx';
import LoginClient from './pages/LoginClient.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import ViewAppointments from './pages/ViewAppointments.jsx';
import ViewAppointmentsPeer from './pages/ViewAppointmentsPeer.jsx';
import { auth, authStateChanged } from './firebase';
import Footer from './components/Footer.jsx';
import Information from './pages/Information.jsx';

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
                    {/* Public Routes - No authentication required */}
                    <Route path="/" element={<Hero />} />
                    <Route path="/home" element={<Hero />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/information" element={<Information />} />
                    <Route path="/register-peer-counselor" element={<RegisterPeerCounselor />} />
                    <Route path="/login-client" element={<LoginClient />} />
                    <Route path="/login-peer-counselor" element={<LoginPeerCounselor />} />

                    {/* Client-Only Routes */}
                    <Route path="/book-appointment" element={
                        <ProtectedRoute allowedRoles={['client']}>
                            <BookAppointment />
                        </ProtectedRoute>
                    } />
                    <Route path="/appointments/client" element={
                        <ProtectedRoute allowedRoles={['client']}>
                            <ViewAppointments />
                        </ProtectedRoute>
                    } />

                    {/* Therapy Routes */}
                    <Route path="/therapy" element={
                        <ProtectedRoute allowedRoles={['client']}>
                            <Therapy />
                        </ProtectedRoute>
                    } />
                    
                    {/* Individual Therapy Room Routes */}
                    <Route path="/therapy/play" element={
                        <ProtectedRoute allowedRoles={['client']}>
                            <GameRoom />
                        </ProtectedRoute>
                    } />
                    <Route path="/therapy/music" element={
                        <ProtectedRoute allowedRoles={['client']}>
                            <MusicRoom />
                        </ProtectedRoute>
                    } />
                    <Route path="/therapy/art" element={
                        <ProtectedRoute allowedRoles={['client']}>
                            <ArtRoom />
                        </ProtectedRoute>
                    } />

                    {/* Peer Counselor-Only Routes */}
                    <Route path="/appointments/peer-counselor" element={
                        <ProtectedRoute allowedRoles={['peer-counselor']}>
                            <ViewAppointmentsPeer />
                        </ProtectedRoute>
                    } />

                    {/* Shared Routes - Both Client and Peer Counselor can access */}
                    <Route path="/waitingroom" element={
                        <ProtectedRoute allowedRoles={['client', 'peer-counselor']}>
                            <WaitingRoom />
                        </ProtectedRoute>
                    } />
                    <Route path="/counseling/:roomId" element={
                        <ProtectedRoute allowedRoles={['client', 'peer-counselor']}>
                            <Counseling />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
            <Footer />
        </>
    );
};

export default App;