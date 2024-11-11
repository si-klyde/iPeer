import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  
  useEffect(() => {
    const checkUserRole = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const idToken = await user.getIdToken();
            
            const response = await axios.post('http://localhost:5000/api/check-role', {}, {
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

  return children;
};

export default ProtectedRoute;