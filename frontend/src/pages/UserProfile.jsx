import React, { useState, useEffect } from 'react';
import { auth, firestore, storage } from '../firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import axios from 'axios';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [profileCache, setProfileCache] = useState({
    data: null,
    timestamp: null
  });

  // Cache duration: 15 minutes
  const CACHE_DURATION = 15 * 60 * 1000;

  // Helper function to parse name parts
  const parseNameParts = (fullName) => {
    const parts = fullName.trim().split(' ');
    
    // If we only have 2 or fewer parts, it's just first and last name
    if (parts.length <= 2) {
      return {
        firstName: parts[0] || '',
        middleInitial: '',
        lastName: parts[1] || ''
      };
    }

    // Look for a middle initial pattern (single letter with optional period)
    const middleInitialIndex = parts.findIndex(part => /^[A-Za-z]\.?$/.test(part));
    
    if (middleInitialIndex !== -1) {
      return {
        firstName: parts.slice(0, middleInitialIndex).join(' '),
        middleInitial: parts[middleInitialIndex].replace('.', ''),
        lastName: parts.slice(middleInitialIndex + 1).join(' ')
      };
    } else {
      // If no middle initial found, treat all parts except last as first name
      return {
        firstName: parts.slice(0, -1).join(' '),
        middleInitial: '',
        lastName: parts[parts.length - 1]
      };
    }
  };

  useEffect(() => {
    // Hide Header and Footer
    document.querySelector('header')?.classList.add('hidden');
    document.querySelector('footer')?.classList.add('hidden');

    return () => {
      // Restore Header and Footer visibility when leaving the page
      document.querySelector('header')?.classList.remove('hidden');
      document.querySelector('footer')?.classList.remove('hidden');
    };
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    let unsubscribeProfile;

    const setupProfileListener = async () => {
      try {
        // Check cache first
        if (profileCache.data && profileCache.timestamp) {
          const now = Date.now();
          if (now - profileCache.timestamp < CACHE_DURATION) {
            setUserProfile(profileCache.data);
            return;
          }
        }

        // Fetch fresh data if cache invalid
        const idToken = await user.getIdToken();
        const endpoint = `http://localhost:5000/api/${user.role === 'peer-counselor' ? 'peer-counselors' : 'client'}/${user.uid}`;
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        const decryptedData = response.data;

        // Set up real-time listener for profile updates (photo)
        const profileDocRef = doc(firestore, 'users', user.uid, 'profile', 'details');
        unsubscribeProfile = onSnapshot(profileDocRef, (profileDoc) => {
          const profileData = profileDoc.exists() ? profileDoc.data() : {};
          
          const updatedProfile = {
            ...decryptedData,
            ...profileData,
            photoURL: user.photoURL || profileData.photoURL || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzY0NzRmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzY0YjNmNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PC9zdmc+'
          };

          setUserProfile(updatedProfile);
          // Update cache
          setProfileCache({
            data: updatedProfile,
            timestamp: Date.now()
          });
        });

      } catch (error) {
        console.error('Error setting up profile:', error);
      }
    };

    setupProfileListener();

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Clear cache when needed
  const clearCache = () => {
    setProfileCache({
      data: null,
      timestamp: null
    });
  };

  // Update handleImageUpload to store in subcollection
  const handleImageUpload = async (event) => {
  try {
    setError(null);
    const file = event.target.files[0];
    if (!file) return;

    validateImage(file);
    setUploading(true);
    
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const fileExtension = file.name.split('.').pop();
    const fileName = `profile_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `profile-photos/${user.uid}/${fileName}`);
    
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'uploadedBy': user.uid,
        'uploadedAt': new Date().toISOString()
      }
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Immediately update local state
    setUserProfile(prevProfile => ({
      ...prevProfile,
      photoURL: downloadURL
    }));

    // Clear cache to force fresh data fetch
    clearCache();

    // Update photoURL in Firebase Authentication
    await updateProfile(user, {
      photoURL: downloadURL
    });
    
    // Update photoURL in profile subcollection
    const profileDocRef = doc(firestore, 'users', user.uid, 'profile', 'details');
    await updateDoc(profileDocRef, {
      photoURL: downloadURL,
      lastUpdated: new Date().toISOString()
    });

  } catch (err) {
    console.error('Error uploading image:', err);
    setError(err.message || 'Failed to upload image');
  } finally {
    setUploading(false);
  }
};

  const validateImage = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) throw new Error('File size must be less than 5MB');
    if (!file.type.startsWith('image/')) throw new Error('File must be an image');
  };

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 via-green-100 to-white">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
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
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Banner */}
          <div className="relative h-48 overflow-hidden rounded-[1.5rem]">
            {/* Main Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#4ade80] via-[#22c55e] to-[#16a34a]"></div>
            
            {/* Modern Asymmetric Shapes */}
            <div 
              className="absolute right-0 h-full w-2/3 transform translate-x-10"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
                clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)'
              }}
            ></div>
            <div 
              className="absolute right-0 h-full w-1/2 transform translate-x-5"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.15) 100%)',
                clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)'
              }}
            ></div>
            
            {/* Accent Lines */}
            <div 
              className="absolute left-0 h-1 w-24 bg-white opacity-40 transform -rotate-45"
              style={{ top: '20%' }}
            ></div>
            <div 
              className="absolute left-20 h-1 w-24 bg-white opacity-30 transform -rotate-45"
              style={{ top: '25%' }}
            ></div>
            
            {/* Small Decorative Elements */}
            <div className="absolute top-8 left-8 w-4 h-4 rounded-full bg-white opacity-40"></div>
            <div className="absolute top-12 left-20 w-2 h-2 rounded-full bg-white opacity-35"></div>
            <div className="absolute top-20 left-12 w-3 h-3 rounded-full bg-white opacity-30"></div>
          </div>
          
          {/* Profile Picture */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
            <div className="relative">
              <img
                src={userProfile.photoURL}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity duration-200"
                referrerPolicy="no-referrer"
                onClick={() => setShowImageModal(true)}
              />
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </label>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-20 text-center">
          <h1 className="text-2xl font-bold text-gray-800">{userProfile.fullName}</h1>
        </div>

        {/* Profile Details Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-8 mb-8">
          <div className="space-y-8">
            {/* Name Section */}
            <div className="grid grid-cols-1 gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <h3 className="text-gray-500 text-lg mb-2">First Name</h3>
                  <p className="text-gray-900 text-xl font-medium">
                    {parseNameParts(userProfile.fullName).firstName}
                  </p>
                </div>
                {parseNameParts(userProfile.fullName).middleInitial && (
                  <div className="col-span-1">
                    <h3 className="text-gray-500 text-lg mb-2">Middle Initial</h3>
                    <p className="text-gray-900 text-xl font-medium">
                      {parseNameParts(userProfile.fullName).middleInitial}
                    </p>
                  </div>
                )}
                <div className="col-span-1">
                  <h3 className="text-gray-500 text-lg mb-2">Last Name</h3>
                  <p className="text-gray-900 text-xl font-medium">
                    {parseNameParts(userProfile.fullName).lastName || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <h3 className="text-gray-500 text-lg mb-2">Email</h3>
              <p className="text-gray-900 text-xl font-medium">{userProfile.email}</p>
            </div>

            {/* Role */}
            <div>
              <h3 className="text-gray-500 text-lg mb-2">Role</h3>
              <p className="text-gray-900 text-xl font-medium capitalize">{userProfile.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploading && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
          <p className="text-sm text-gray-500">Uploading profile picture...</p>
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 text-red-700 rounded-lg shadow-lg p-4">
          {error}
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="relative max-w-4xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              onClick={() => setShowImageModal(false)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
            <img
              src={userProfile.photoURL}
              alt="Profile"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;