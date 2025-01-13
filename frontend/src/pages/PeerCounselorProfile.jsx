import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, authStateChanged, firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

const PeerCounselorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(counselor?.isVerified || false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingVerificationStatus, setPendingVerificationStatus] = useState(false);


  useEffect(() => {
    const unsubscribe = authStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await axios.get(
            `http://localhost:5000/api/peer-counselors/${id}`,
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
        `http://localhost:5000/api/peer-counselors/${id}/verify`,
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
    <>
    <div className="min-h-screen bg-gradient-to-br from-color-3 to-color-2 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center mb-6 bg-white px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800 transition-all duration-300
            shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]
            transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_4px_rgba(0,0,0,0.1)]"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
  
        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-gray-200 mb-6 overflow-hidden ring-4 ring-green-100">
                 <img
                   src={counselor?.photoURL}
                   alt={counselor?.fullName}
                   className="w-full h-full rounded-full object-cover"
                   referrerPolicy="no-referrer"
                />
              </div>
            
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                  counselor?.currentStatus?.status === 'online'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
               }`}>
                <div className={`w-2.5 h-2.5 rounded-full mr-2 ${
                   counselor?.currentStatus?.status === 'online'
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                }`}></div>
                <span className="font-medium">{counselor?.currentStatus?.status || 'Offline'}</span>
              </div>
            </div>

  
            {/* Profile Details Section */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{counselor?.fullName}</h1>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVerified}
                      onChange={handleVerificationChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-900">
                    {isVerified ? 'Verified for Counseling' : 'Not Verified'}
                  </span>
                </div>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 block mb-1">Email</label>
                    <p className="text-lg text-gray-800">{counselor?.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 block mb-1">School</label>
                    <p className="text-lg text-gray-800">{counselor?.school}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 block mb-1">College</label>
                    <p className="text-lg text-gray-800">{counselor?.college}</p>
                </div>
                </div>
            </div>
          </div>
        </div>
  
        {/* Credentials Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Peer-Counselor's Credentials</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {counselor?.credentials?.length > 0 ? (
              counselor.credentials.map((credential, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img
                    src={credential.imageUrl}
                    alt={credential.fileName}
                    className="w-full h-48 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4">
                    <span className="text-white text-sm font-medium truncate">
                      {credential.fileName}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">No credentials uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {showConfirmModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Confirm Verification Change
            </h3>
            <p className="text-gray-600 mb-8">
              Are you sure you want to {pendingVerificationStatus ? 'verify' : 'unverify'} this peer counselor?
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmVerification}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium transition-all duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
};

export default PeerCounselorProfile;
