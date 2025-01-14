import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, authStateChanged } from '../firebase';
import InvitePeerCounselor from '../components/InvitePeerCounselor';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [peerCounselors, setPeerCounselors] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [PeerCounselorsPerPage] = useState(6);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [counselorToDelete, setCounselorToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
      document.querySelector('header')?.classList.add('hidden');
      document.querySelector('footer')?.classList.add('hidden');
  
      return () => {
        document.querySelector('header')?.classList.remove('hidden');
        document.querySelector('footer')?.classList.remove('hidden');
      };
    }, []);

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
      <div className="min-h-screen bg-color-3 flex items-center justify-center p-4">
        <div className="text-base sm:text-lg lg:text-xl text-color-7">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-color-3 flex items-center justify-center p-4">
        <div className="text-base sm:text-lg lg:text-xl text-color-7">{error}</div>
      </div>
    );
  }

  const handleDelete = async (counselorId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(
        `http://localhost:5000/api/peer-counselors/${counselorId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setPeerCounselors(prev => prev.filter(c => c.id !== counselorId));
      toast.success('Peer counselor deleted successfully');
    } catch (error) {
      console.error('Error deleting peer counselor:', error);
      toast.error('Failed to delete peer counselor');
    }
    setShowDeleteModal(false);
    setCounselorToDelete(null);
  };
  

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

  // Get current counselors
  const indexOfLastCounselor = currentPage * PeerCounselorsPerPage;
  const indexOfFirstCounselor = indexOfLastCounselor - PeerCounselorsPerPage;
  const currentCounselors = filteredCounselors.slice(indexOfFirstCounselor, indexOfLastCounselor);

  // Calculate total pages
  const totalPages = Math.ceil(filteredCounselors.length / PeerCounselorsPerPage);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
        {/* Welcome and Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {/* Welcome Card */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-emerald-100 rounded-full p-2 sm:p-3 md:p-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Welcome back, {adminData?.fullName}</h1>
                <p className="text-sm sm:text-base text-emerald-600">{adminData?.college} Administrator</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Counselors</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600">{peerCounselors.length}</p>
              </div>
              <div className="bg-emerald-100 rounded-full p-2 sm:p-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Online Now</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600">
                  {peerCounselors.filter(c => c.currentStatus.status === 'online').length}
                </p>
              </div>
              <div className="bg-emerald-100 rounded-full p-2 sm:p-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Updated Search and Filters Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
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
                  focus:ring-2 focus:ring-emerald-500 focus:border-transparent
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
                    statusFilter === 'online' ? 'bg-emerald-500' : 
                    statusFilter === 'offline' ? 'bg-gray-400' : 'bg-emerald-500'
                  }`} />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-48 px-4 py-3 pl-8 rounded-xl border border-gray-200 
                    bg-white shadow-sm transition-all duration-200
                    hover:shadow-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent
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
                    hover:shadow-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent
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

        {/* Peer-Counselor Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {currentCounselors.map((counselor) => (
            <div
              key={counselor.id}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-lg sm:text-xl font-bold text-emerald-600">
                        {counselor.fullName.charAt(0)}
                      </span>
                    </div>
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${
                      counselor.currentStatus.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{counselor.fullName}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{counselor.email}</p>
                  </div>
                </div>
                <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  counselor.isVerified 
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {counselor.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>

              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <p className="text-xs sm:text-sm text-gray-600">
                  {counselor.currentStatus.status === 'online' 
                    ? 'Currently Online'
                    : `Last seen ${formatLastOnline(counselor.currentStatus.lastStatusUpdate)}`
                  }
                </p>
                <div className="flex flex-col xs:flex-row gap-2">
                  <button
                    onClick={() => navigate(`/admin/peer-counselor/${counselor.id}`)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 text-white text-xs sm:text-sm rounded-lg hover:bg-emerald-700 transition-colors duration-300"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => {
                      setShowDeleteModal(true);
                      setCounselorToDelete(counselor);
                    }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 text-red-600 text-xs sm:text-sm rounded-lg hover:bg-red-200 transition-colors duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 transition-colors duration-300"
          >
            Previous
          </button>
          
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 transition-colors duration-300"
          >
            Next
          </button>
        </div>

        {/* Invite Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-xl">
          <InvitePeerCounselor adminData={adminData} />
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Delete Peer Counselor
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {counselorToDelete?.fullName}? This action cannot be undone.
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCounselorToDelete(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 
                    font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(counselorToDelete.id)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 
                    font-medium transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;