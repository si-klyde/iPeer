import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, authStateChanged, firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import API_CONFIG from '../config/api.js';

const PeerCounselorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(counselor?.isVerified || false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingVerificationStatus, setPendingVerificationStatus] = useState(false);


  useEffect(() => {
        document.querySelector('header')?.classList.add('hidden');
        document.querySelector('footer')?.classList.add('hidden');
    
        return () => {
          document.querySelector('header')?.classList.remove('hidden');
          document.querySelector('footer')?.classList.remove('hidden');
        };
  }, []);
  
  useEffect(() => {
    const unsubscribe = authStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await axios.get(
            `${API_CONFIG.BASE_URL}/api/peer-counselors/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          // Fetch photo URL from profile subcollection
          const profileDocRef = doc(firestore, 'users', id, 'profile', 'details');
          const profileDoc = await getDoc(profileDocRef);
          const profileData = profileDoc.exists() ? profileDoc.data() : {};

          setCounselor({
            ...response.data,
            photoURL: profileData.photoURL || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzY0NzRmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzY0YjNmNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PC9zdmc+'
          });
        } catch (error) {
          console.error('Error fetching counselor profile:', error);
          navigate('/admin/login');
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const handleVerificationChange = (e) => {
    setPendingVerificationStatus(e.target.checked);
    setShowConfirmModal(true);
  };
  
  const confirmVerification = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/peer-counselors/${id}/verify`,
        { isVerified: pendingVerificationStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 200) {
        setIsVerified(pendingVerificationStatus);
        setCounselor(prev => ({
          ...prev,
          isVerified: pendingVerificationStatus,
          verifiedAt: response.data.verifiedAt
        }));
        toast.success(`Peer counselor ${pendingVerificationStatus ? 'verified' : 'unverified'} successfully`);
      }
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast.error('Failed to update verification status');
    }
    setShowConfirmModal(false);
  };  

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-color-3 to-color-2 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-gray-600 
            shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
  
        {/* Main Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Image & Status */}
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden ring-4 ring-emerald-100">
                    <img
                      src={counselor?.photoURL}
                      alt={counselor?.fullName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white 
                    ${counselor?.currentStatus?.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'}`}
                  />
                </div>
                
                <div className={`inline-flex items-center px-4 py-2 rounded-full 
                  ${counselor?.currentStatus?.status === 'online' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-gray-100 text-gray-600'}`}
                >
                  <span className="font-medium">
                    {counselor?.currentStatus?.status === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
  
              {/* Right Column - Profile Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{counselor?.fullName}</h1>
                    <p className="text-emerald-600 mt-1">{counselor?.email}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVerified}
                        onChange={handleVerificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 
                        rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                        after:transition-all peer-checked:bg-emerald-600">
                      </div>
                    </label>
                    <span className="text-sm font-medium text-gray-900">
                      {isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
  
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="text-sm text-gray-500">School</span>
                    <p className="text-gray-900 font-medium mt-1">{counselor?.school}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="text-sm text-gray-500">College</span>
                    <p className="text-gray-900 font-medium mt-1">{counselor?.college}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Credentials Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Credentials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {counselor?.credentials?.length > 0 ? (
              counselor.credentials.map((credential, index) => (
                <div key={index} className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                  <img
                    src={credential.imageUrl}
                    alt={credential.fileName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-sm font-medium truncate">{credential.fileName}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-center">No credentials uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
  
      {/* Verification Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 transform transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Confirm Verification Change
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to {pendingVerificationStatus ? 'verify' : 'unverify'} this peer counselor?
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 
                    font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmVerification}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 
                    font-medium transition-all duration-200"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerCounselorProfile;
