import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, authStateChanged, firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const PeerCounselorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-color-3 to-color-2 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-color-3 to-color-2 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center mb-4 bg-white px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800 transition-all duration-300 
            shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] 
            transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_4px_rgba(0,0,0,0.1)]"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Image Section */}
            <div className="text-center">
              <div className="w-48 h-48 mx-auto rounded-full bg-gray-200 mb-4 overflow-hidden">
                <img 
                  src={counselor?.photoURL}
                  alt={counselor?.fullName}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className={`inline-flex items-center ${
                counselor?.currentStatus?.status === 'online' 
                  ? 'text-green-500' 
                  : 'text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  counselor?.currentStatus?.status === 'online' 
                    ? 'bg-green-500' 
                    : 'bg-gray-400'
                }`}></div>
                <span>{counselor?.currentStatus?.status || 'Offline'}</span>
              </div>
            </div>

            {/* Profile Details Section */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold text-color-7 mb-4">
                {counselor?.fullName}
              </h1>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="text-lg">{counselor?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">College</label>
                  <p className="text-lg">{counselor?.college}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Specialization</label>
                  <p className="text-lg">{counselor?.specialization || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Bio</label>
                  <p className="text-lg">{counselor?.bio || 'No bio available'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credentials Section */}
      <div className="mt-8 border-t pt-8">
      <h2 className="text-2xl font-bold text-color-7 mb-4">Credentials</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {counselor?.credentials ? (
          counselor.credentials.map((credential, index) => (
              <div key={index} className="relative group">
              <img
                src={credential.imageUrl}
                alt={`Credential ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer"
                onClick={() => {/* Add image preview handler */}}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-lg flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Click to view
                  </span>
              </div>
            </div>
            ))
           ) : (
           <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
             <p className="text-gray-500">No credentials uploaded yet</p>
           </div>
           )}
       </div>
    </div>

    </div>
    
  );
};

export default PeerCounselorProfile;
