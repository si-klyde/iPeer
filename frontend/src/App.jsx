import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminSetupAccount from './pages/AdminSetupAccount.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import PeerCounselorProfile from './pages/PeerCounselorProfile.jsx';
import Header from './components/Header.jsx';
import ProtectedRoute, { ProtectedRegistrationRoute } from './context/ProtectedRoute.jsx';
import Counseling from './pages/Counseling';
import WaitingRoom from './pages/WaitingRoom';
import Hero from './components/Hero.jsx';
import Login from './pages/Login.jsx';
import Calendar from './pages/Calendar.jsx';
import Therapy from './pages/Therapy.jsx';
import { GameRoom, MusicRoom, ArtRoom } from './components/Rooms';
import RegisterPeerCounselor from './pages/RegisterPeerCounselor.jsx';
import LoginPeerCounselor from './pages/LoginPeerCounselor.jsx';
import LoginClient from './pages/LoginClient.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import ViewAppointments from './pages/ViewAppointments.jsx';
import ViewAppointmentsPeer from './pages/ViewAppointmentsPeer.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import UserProfile from './pages/UserProfile.jsx';
import { auth, authStateChanged, firestore } from './firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import Footer from './components/Footer.jsx';
import ViewEvent from './pages/viewevent.jsx';
import Information from './pages/Information.jsx';  
import PeerDashboard from './pages/PeerDashboard.jsx';
import OnCampus from './pages/OnCampus.jsx';
import OffCampus from './pages/OffCampus.jsx';
import EventCatalog from './pages/Events.jsx';
import Notifications from './pages/Notifications.jsx';
import InstantSessionNotification from './components/InstantSessionNotification.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const App = () => {
    const [user, setUser] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const location = useLocation();
    const hideHeaderFooterPaths = ['/login'];

    useEffect(() => {
        let unsubscribeAuth;
        let unsubscribeUser;
        let unsubscribeProfile;
    
        const setupUserListener = async (currentUser) => {
            if (!currentUser && !isInitialLoad && user) {
                if (user.role === 'peer-counselor') {
                    try {
                        await axios.put(
                            `http://localhost:5000/api/peer-counselor/status/${user.uid}`,
                            {
                                status: 'offline',
                                isAvailable: false
                            }
                        );
                    } catch (error) {
                        console.error('Error updating offline status:', error);
                    }
                }
                clearLocalStorage();
                setUser(null);
                return;
            }
            
            if (currentUser) {
                try {

                    const adminDocRef = doc(firestore, 'admins', currentUser.uid);
                    const adminDoc = await getDoc(adminDocRef);
                    
                    if (adminDoc.exists()) {
                        // Handle admin user data
                        const adminData = adminDoc.data();
                        setUser({
                        ...adminData,
                        role: 'admin',
                        uid: currentUser.uid
                        });
                        return;
                    }
                    
                    // Get user role
                    const userDocRef = doc(firestore, 'users', currentUser.uid);
                    
                    // Retry logic
                    let retries = 3;
                    let userDoc;
                    
                    while (retries > 0) {
                        userDoc = await getDoc(userDocRef);
                        if (userDoc.exists()) {
                            break;
                        }
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                        retries--;
                    }

                    if (!userDoc?.exists()) {
                        throw new Error('User document not found after retries');
                    }

                    const userRole = userDoc.data()?.role;
    
                    // Check cache first
                    const cachedUserData = localStorage.getItem(`userData_${currentUser.uid}`);
                    if (cachedUserData) {
                        setUser(JSON.parse(cachedUserData));
                    }
    
                    // Get decrypted data from backend
                    const endpoint = userRole === 'peer-counselor'
                        ? `http://localhost:5000/api/peer-counselors/${currentUser.uid}`
                        : `http://localhost:5000/api/client/${currentUser.uid}`;
    
                    const response = await axios.get(endpoint, {
                        headers: {
                            Authorization: `Bearer ${await currentUser.getIdToken()}`
                        }
                    });
                    const decryptedData = response.data;
    
                    // Set up profile listener
                    const profileDocRef = doc(firestore, 'users', currentUser.uid, 'profile', 'details');
                    unsubscribeProfile = onSnapshot(profileDocRef, (profileDoc) => {
                        const profileData = profileDoc.exists() ? profileDoc.data() : {};
                        const photoURL = currentUser.photoURL || 
                            profileData.photoURL || 
                            `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzY0NzRmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzY0YjNmNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PC9zdmc+`;
    
                        const userData = {
                            ...decryptedData,
                            ...profileData,
                            photoURL: photoURL
                        };
    
                        setUser(prevUser => ({
                            ...prevUser,
                            ...userData
                        }));
    
                        // Cache the updated user data
                        localStorage.setItem(`userData_${currentUser.uid}`, JSON.stringify(userData));
                    });
    
                    // Listen for role changes
                    unsubscribeUser = onSnapshot(userDocRef, async (doc) => {
                        if (doc.exists()) {
                            const newRole = doc.data()?.role;
                            if (newRole !== decryptedData.role) {
                                const newEndpoint = newRole === 'peer-counselor'
                                    ? `http://localhost:5000/api/peer-counselors/${currentUser.uid}`
                                    : `http://localhost:5000/api/client/${currentUser.uid}`;
    
                                const newResponse = await axios.get(newEndpoint, {
                                    headers: {
                                        Authorization: `Bearer ${await currentUser.getIdToken()}`
                                    }
                                });
                                
                                const newUserData = {
                                    ...prevUser,
                                    ...newResponse.data
                                };
                                
                                setUser(newUserData);
                                localStorage.setItem(`userData_${currentUser.uid}`, JSON.stringify(newUserData));
                            }
                        }
                    });
    
                } catch (error) {
                    console.error('Error setting up user data:', error);
                    setUser(null);
                    localStorage.removeItem(`userData_${currentUser.uid}`);
                }
            } 

            //Mark initial load complete
            if (isInitialLoad) {
                setIsInitialLoad(false);
            }
        };
    
        unsubscribeAuth = authStateChanged(auth, setupUserListener);
    
        return () => {
            if (unsubscribeAuth) unsubscribeAuth();
            if (unsubscribeUser) unsubscribeUser();
            if (unsubscribeProfile) unsubscribeProfile();
        };
    }, []);    

    // Helper function to clear localStorage
    const clearLocalStorage = () => {
        Object.keys(localStorage).forEach(key => {
            if (key.includes('appointments_') || 
                key.includes('clients_') || 
                key.includes('counselor_') || 
                key.includes('peerCounselors') ||
                key.includes('userData_')) {
                localStorage.removeItem(key);
            }
        });
    };

    return (
        <>
            {user?.role === 'peer-counselor' && <InstantSessionNotification />}
            {!hideHeaderFooterPaths.includes(location.pathname) && 
                <Header 
                    user={user} 
                    setUser={setUser}
                />}
            <div
            className={`${
                hideHeaderFooterPaths.includes(location.pathname) ? '' : 'pt-[4.75rem] lg:pt-[5rem]'
            } overflow-hidden`}
            >
                <Routes>
                    {/* Public Routes - No authentication required */}
                    <Route path="/" element={<Hero />} />
                    <Route path="/home" element={<Hero />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/information" element={<Information />} />
                    <Route path="/onCampus" element={<OnCampus/>} />
                    <Route path="/offCampus" element={<OffCampus/>} />
                    <Route path="/register-peer-counselor" element={<ProtectedRegistrationRoute />} />
                    <Route path="/login-client" element={<LoginClient />} />
                    <Route path="/login-peer-counselor" element={<LoginPeerCounselor />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    {/* <Route path="/register-peer-counselor" element={<RegisterPeerCounselor />} /> */}
                    {/* <Route path="/viewevent" element={<ViewEvent />} />                            */}
                    <Route path="/event" element={<EventCatalog />} />

                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/setup-account" element={<AdminSetupAccount />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/peer-counselor/:id" element={<PeerCounselorProfile />} />

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
                    <Route path="/peer-dashboard" element={
                        <ProtectedRoute allowedRoles={['peer-counselor']}>
                            <PeerDashboard />
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
                    <Route path="/profile" element={
                        <ProtectedRoute allowedRoles={['client', 'peer-counselor']}>
                            <UserProfile />
                        </ProtectedRoute>
                    } />
                    <Route path="/calendar" element={
                        <ProtectedRoute allowedRoles={['client', 'peer-counselor']}>
                            <Calendar />
                        </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                        <ProtectedRoute allowedRoles={['client', 'peer-counselor']}>
                            <Notifications user={user} />
                        </ProtectedRoute>
                    } />

                    {/* Unauthorized Access Route */}
                    <Route path="/unauthorized" element={<Unauthorized />} />
                </Routes>
            </div>
            {!hideHeaderFooterPaths.includes(location.pathname) && <Footer />}
            <ToastContainer
                position="top-right"
                autoClose={false}
                newestOnTop
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                theme="light"
                limit={3}
                className="!p-4"
            />
        </>
    );
};

export default App;