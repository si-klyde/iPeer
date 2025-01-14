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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const navigate = useNavigate();

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

  const filteredCounselors = peerCounselors.filter(counselor => {
    const matchesSearch = counselor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' ? true :
      statusFilter === 'online' ? counselor.currentStatus.status === 'online' :
      counselor.currentStatus.status !== 'online';
      
    const matchesVerification = verificationFilter === 'all' ? true :
      verificationFilter === 'verified' ? counselor.isVerified :
      !counselor.isVerified;
      
    return matchesSearch && matchesStatus && matchesVerification;
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-color-3 to-color-2">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-bold text-color-7 mb-2 tracking-tight">
              Welcome, {adminData?.fullName}
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              {adminData?.college} Administrator Dashboard
            </p>
          </div>
        </div>
  
        {/* Peer Counselors Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center bg-gray-50 p-4 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold text-color-7 flex items-center">
                <span className="mr-3">Peer Counselors</span>
                <span className="text-sm bg-color-7 text-white px-4 py-1.5 rounded-full shadow-sm">
                  {filteredCounselors.length} Active
                </span>
              </h2>
            </div>
            
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search counselors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-3.5 pl-12 rounded-xl border border-gray-200
                    bg-white shadow-sm transition-all duration-200
                    focus:ring-2 focus:ring-green-500 focus:border-transparent
                    hover:shadow-md text-gray-700 placeholder-gray-400"
                />
                <svg
                  className="absolute left-4 text-gray-400 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <div className={`w-2 h-2 rounded-full ${
                      statusFilter === 'online' ? 'bg-green-500' : 
                      statusFilter === 'offline' ? 'bg-gray-400' : 'bg-blue-500'
                    }`} />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none w-48 px-4 py-3 pl-8 rounded-xl border border-gray-200 
                      bg-white shadow-sm transition-all duration-200
                      hover:shadow-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                      text-gray-700 font-medium cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                  <svg 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="appearance-none w-48 px-4 py-3 pl-10 rounded-xl border border-gray-200 
                      bg-white shadow-sm transition-all duration-200
                      hover:shadow-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                      text-gray-700 font-medium cursor-pointer"
                  >
                    <option value="all">All Verification</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Not Verified</option>
                  </select>
                  <svg 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
  
          <div className="grid gap-6">
            {filteredCounselors.map((counselor) => (
              <div key={counselor.id} 
                className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-semibold text-color-7">
                        {counselor.fullName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        counselor.isVerified 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {counselor.isVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
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
  
        {/* Invite Section Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <InvitePeerCounselor adminData={adminData} />
        </div>
      </div>
    </div>
  );  
};

export default AdminDashboard;
