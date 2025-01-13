import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, authStateChanged } from '../firebase';
import InvitePeerCounselor from '../components/InvitePeerCounselor';

const AdminDashboard = () => {
  const [peerCounselors, setPeerCounselors] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  console.log('Rendering AdminDashboard');

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = authStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user);
      if (user) {
        console.log('Fetching admin data for uid:', user.uid);
        try {
          const response = await axios.get(`http://localhost:5000/api/admin/admin-data/${user.uid}`);
          console.log('Admin data received:', response.data);
          setAdminData(response.data);
        } catch (error) {
          console.error('Error fetching admin data:', error);
          navigate('/admin/login');
        }
      } else {
        console.log('No authenticated user, redirecting to login');
        navigate('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (adminData?.college) {
      const fetchPeerCounselors = async () => {
        console.log('Fetching peer counselors for college:', adminData.college);
        setLoading(true);
        try {
          const token = await auth.currentUser.getIdToken();
          console.log('Auth token obtained:', token.substring(0, 20) + '...');
          
          const response = await axios.get(
            `http://localhost:5000/api/peer-counselors/per-college/${adminData.college}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          console.log('Peer counselors data received:', response.data);
          setPeerCounselors(response.data);
        } catch (error) {
          console.log('Error details:', {
            message: error.message,
            response: error.response?.data
          });
          setError('Failed to fetch peer counselors');
          setPeerCounselors([]);
        } finally {
          setLoading(false);
        }
      };
  
      fetchPeerCounselors();
    }
  }, [adminData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-color-3 flex items-center justify-center">
        <div className="text-xl text-color-7">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-color-3 flex items-center justify-center">
        <div className="text-xl text-color-7">{error}</div>
      </div>
    );
  }

  const formatLastOnline = (timestamp) => {
    if (!timestamp || !timestamp._seconds) return 'Unknown';
  
    // Convert Firestore timestamp to JavaScript Date
    const date = new Date(timestamp._seconds * 1000);
    const today = new Date();
    
    // Same day check
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: 'numeric',
        hour12: true 
      });
    }
    
    // Within last 7 days
    const daysAgo = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return `${date.toLocaleDateString('en-US', { weekday: 'long' })} at ${
        date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: 'numeric',
          hour12: true 
        })
      }`;
    }
    
    // Default format for older dates
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-color-3 to-color-2">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header Section with improved typography */}
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-color-7 mb-2 tracking-tight">
              Welcome, {adminData?.username}
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              {adminData?.college} Administrator Dashboard
            </p>
          </div>
  
          {/* Peer Counselors Section */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-color-7 mb-6 flex items-center">
              <span className="mr-2">Peer Counselors</span>
              <span className="text-sm bg-color-7 text-white px-3 py-1 rounded-full">
                {peerCounselors.length} Active
              </span>
            </h2>
            
            <div className="grid gap-6">
              {peerCounselors.map((counselor) => (
                <div key={counselor.id} 
                  className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-color-7 mb-1">
                        {counselor.fullName}
                      </h3>
                      <p className="text-gray-600 mb-1">{counselor.email}</p>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          counselor.currentStatus.status === 'online' 
                            ? 'bg-green-500' 
                            : 'bg-gray-400'
                        }`}></div>
                        {counselor.currentStatus.status === 'online' ? (
                          <p className="text-sm font-medium text-green-500">Online</p>
                        ) : (
                          <p className="text-sm font-medium text-gray-500">
                            Last seen {formatLastOnline(counselor.currentStatus.lastStatusUpdate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                    <button 
                      onClick={() => navigate(`/admin/peer-counselor/${counselor.id}`)}
                      className="bg-color-7 hover:bg-color-6 px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200"
                    >
                      View Profile
                    </button>
                      <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200">
                        Deactivate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Invite Section with enhanced styling */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <InvitePeerCounselor adminData={adminData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
