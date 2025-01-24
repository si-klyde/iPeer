import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import axios from 'axios';
import { toast }from 'react-toastify';
import RegisterPeerCounselor from '../pages/RegisterPeerCounselor';
import API_CONFIG from '../config/api.js';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  
  useEffect(() => {
    const checkUserRole = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            // First check if user is an admin
            const adminDocRef = doc(firestore, 'admins', user.uid);
            const adminDoc = await getDoc(adminDocRef);
            
            if (adminDoc.exists()) {
              setUserRole('admin');
              setLoading(false);
              return;
            }
            const idToken = await user.getIdToken();
            
            const response = await axios.post(`${API_CONFIG.BASE_URL}/api/check-role`, {}, {
              headers: {
                Authorization: `Bearer ${idToken}`
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
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    checkUserRole();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!auth.currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    console.log('Access denied. User role:', userRole, 'Allowed roles:', allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (isAdminRoute && userRole !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!isAdminRoute && userRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const ProtectedRegistrationRoute = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  useEffect(() => {
    if (!token) {
      toast.error('Only invited peer counselors can register. Please contact your administrator.', {
        autoClose: 4000,
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        style: {
          fontWeight: 'bold'
        }
      });
    }
  }, [token]);
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return <RegisterPeerCounselor />;
};

export { ProtectedRoute as default, ProtectedRegistrationRoute };