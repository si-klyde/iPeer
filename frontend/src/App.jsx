import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Route, Routes, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminSetupAccount from './pages/AdminSetupAccount.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminProfile from './pages/AdminProfile.jsx';
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

    // Helper function to get default photo URL
    const getDefaultPhotoURL = (role) => {
        const gradientColors = role === 'admin' 
            ? ['#89d095', '#34d399']  // green gradient for admin
            : ['#6474ff', '#64b3f4']; // blue gradient for users
        
        return `data:image/svg+xml;base64,${btoa(`<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" gradientTransform="rotate(45)"><stop offset="0%" stop-color="${gradientColors[0]}"/><stop offset="100%" stop-color="${gradientColors[1]}"/></linearGradient></defs><circle cx="100" cy="100" r="100" fill="url(#grad)"/></svg>`)}`;
    };

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

    // Helper function to handle user logout
    const handleUserLogout = async (currentUser) => {
        if (!isInitialLoad && user && user.role === 'peer-counselor') {
            try {
                await axios.put(
                    `http://localhost:5000/api/peer-counselor/status/${user.uid}`,
                    { status: 'offline', isAvailable: false }
                );
            } catch (error) {
                console.error('Error updating offline status:', error);
            }
        }
        clearLocalStorage();
        setUser(null);
    };

    // Helper function to fetch admin data
    const fetchAdminData = async (currentUser) => {
        return await axios.get(
            `http://localhost:5000/api/admin/admin-data/${currentUser.uid}`,
            {
                headers: {
                    Authorization: `Bearer ${await currentUser.getIdToken()}`
                }
            }
        );
    };

    // Helper function to fetch user data
    const fetchUserData = async (currentUser, userRole) => {
        const endpoint = userRole === 'peer-counselor'
            ? `http://localhost:5000/api/peer-counselors/${currentUser.uid}`
            : `http://localhost:5000/api/client/${currentUser.uid}`;

        const response = await axios.get(endpoint, {
            headers: {
                Authorization: `Bearer ${await currentUser.getIdToken()}`
            }
        });
        return response.data;
    };

    // Helper function to setup admin listener
    const setupAdminListener = async (currentUser) => {
        try {
            const adminInitialCheck = await axios.get(
                `http://localhost:5000/api/admin/admin-initial-data/${currentUser.uid}`,
                {
                    headers: {
                        Authorization: `Bearer ${await currentUser.getIdToken()}`
                    }
                }
            );

            const isSetupComplete = adminInitialCheck.data.email && adminInitialCheck.data.fullName;
            const baseAdminData = {
                role: 'admin',
                uid: currentUser.uid,
                username: adminInitialCheck.data.username,
                college: adminInitialCheck.data.college,
                photoURL: adminInitialCheck.data.photoURL || getDefaultPhotoURL('admin')
            };

            if (!isSetupComplete) {
                setUser({ ...baseAdminData, isSetupComplete: false });
                return onSnapshot(doc(firestore, 'admins', currentUser.uid), async (docSnapshot) => {
                    if (docSnapshot.exists() && docSnapshot.data().email && docSnapshot.data().fullName) {
                        const fullDataResponse = await fetchAdminData(currentUser);
                        setUser({ ...fullDataResponse.data, ...baseAdminData, isSetupComplete: true });
                    }
                });
            }

            const adminResponse = await fetchAdminData(currentUser);
            setUser({ ...adminResponse.data, ...baseAdminData, isSetupComplete: true });
            return null;
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('Admin authentication error:', error);
            }
            return null;
        }
    };

    // Helper function to setup regular user listener
    const setupRegularUserListener = async (currentUser, userRole) => {
        const setupProfileListener = (profileRef, decryptedData) => {
            return onSnapshot(profileRef, (profileDoc) => {
                const profileData = profileDoc.exists() ? profileDoc.data() : {};
                const photoURL = currentUser.photoURL || 
                    profileData.photoURL || 
                    getDefaultPhotoURL(userRole);

                const userData = {
                    ...decryptedData,
                    ...profileData,
                    photoURL
                };

                setUser(prevUser => ({ ...prevUser, ...userData }));
                localStorage.setItem(`userData_${currentUser.uid}`, JSON.stringify(userData));
            });
        };

        const setupRoleListener = (userDocRef, decryptedData) => {
            return onSnapshot(userDocRef, async (doc) => {
                if (doc.exists()) {
                    const newRole = doc.data()?.role;
                    if (newRole !== decryptedData.role) {
                        const newUserData = await fetchUserData(currentUser, newRole);
                        setUser(newUserData);
                        localStorage.setItem(`userData_${currentUser.uid}`, JSON.stringify(newUserData));
                    }
                }
            });
        };

        try {
            // Check cache first
            const cachedUserData = localStorage.getItem(`userData_${currentUser.uid}`);
            if (cachedUserData) {
                setUser(JSON.parse(cachedUserData));
            }

            const decryptedData = await fetchUserData(currentUser, userRole);
            
            const profileRef = doc(firestore, 'users', currentUser.uid, 'profile', 'details');
            const userDocRef = doc(firestore, 'users', currentUser.uid);

            return {
                profileUnsubscribe: setupProfileListener(profileRef, decryptedData),
                roleUnsubscribe: setupRoleListener(userDocRef, decryptedData)
            };
        } catch (error) {
            console.error('Error setting up user data:', error);
            setUser(null);
            localStorage.removeItem(`userData_${currentUser.uid}`);
            return { profileUnsubscribe: null, roleUnsubscribe: null };
        }
    };

    useEffect(() => {
        const unsubscribers = {
            auth: null,
            user: null,
            profile: null,
            admin: null
        };

        const setupUserListener = async (currentUser) => {
            if (!currentUser && !isInitialLoad && user) {
                await handleUserLogout(currentUser);
                return;
            }
                    
            if (currentUser) {
                // Clean up existing listeners
                if (unsubscribers.user) unsubscribers.user();
                if (unsubscribers.profile) unsubscribers.profile();
                if (unsubscribers.admin) unsubscribers.admin();
        
                // Check for admin route first
                if (location.pathname.startsWith('/admin')) {
                    const adminUnsubscribe = await setupAdminListener(currentUser);
                    if (adminUnsubscribe) {
                        unsubscribers.admin = adminUnsubscribe;
                        setIsInitialLoad(false);
                        return;  // Exit early for admin users
                    }
                }
        
                // Only check user document for non-admin users
                const userDocRef = doc(firestore, 'users', currentUser.uid);
                let retries = 3;
                let userDoc;
                        
                while (retries > 0) {
                    userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) break;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    retries--;
                }
        
                if (!userDoc?.exists()) {
                    // Instead of throwing error, check if user is already set as admin
                    if (!user?.role === 'admin') {
                        throw new Error('User document not found after retries');
                    }
                }
        
                if (userDoc?.exists()) {
                    const userRole = userDoc.data()?.role;
                    const { profileUnsubscribe, roleUnsubscribe } = await setupRegularUserListener(currentUser, userRole);
                    unsubscribers.profile = profileUnsubscribe;
                    unsubscribers.user = roleUnsubscribe;
                }
            }
        
            if (isInitialLoad) {
                setIsInitialLoad(false);
            }
        };

        // Set up the auth state listener
        unsubscribers.auth = authStateChanged(auth, setupUserListener);

        // Cleanup function
        return () => {
            Object.values(unsubscribers).forEach(unsubscribe => {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            });
        };
    }, []);

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
                    <Route path="/information" element={<Information />} />
                    <Route path="/onCampus" element={<OnCampus/>} />
                    <Route path="/offCampus" element={<OffCampus/>} />
                    <Route path="/register-peer-counselor" element={<ProtectedRegistrationRoute />} />
                    <Route path="/login" element={
                        auth.currentUser ? <Navigate to="/home" replace /> : <Login />
                    } />
                    <Route path="/login-client" element={
                        auth.currentUser ? <Navigate to="/home" replace /> : <LoginClient />
                    } />
                    <Route path="/login-peer-counselor" element={
                        auth.currentUser ? <Navigate to="/home" replace /> : <LoginPeerCounselor />
                    } />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    {/* <Route path="/register-peer-counselor" element={<RegisterPeerCounselor />} /> */}
                    {/* <Route path="/viewevent" element={<ViewEvent />} />                            */}
                    

                    <Route path="/admin/login" element={
                        auth.currentUser && user?.role === 'admin' ? 
                            <Navigate to="/admin/dashboard" replace /> : 
                            <AdminLogin />
                    } />
                    <Route path="/admin/setup-account" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminSetupAccount />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                        {user?.isSetupComplete ? 
                            <AdminDashboard /> : 
                            <Navigate to="/admin/setup-account" replace />}
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/peer-counselor/:id" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                        {user?.isSetupComplete ? 
                            <AdminProfile /> : 
                            <Navigate to="/admin/setup-account" replace />}
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/profile" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                        {user?.isSetupComplete ? 
                            <AdminProfile /> : 
                            <Navigate to="/admin/setup-account" replace />}
                        </ProtectedRoute>
                    } />


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
                    <Route path="/event" element={
                        <ProtectedRoute allowedRoles={['peer-counselor']}>
                            <EventCatalog />
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