import React, { useState, useEffect } from 'react';
import { auth, firestore, storage } from '../firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(firestore, 'users', user.uid);
    const profileDocRef = doc(firestore, 'users', user.uid, 'profile', 'details');
    
    // Set up real-time listener for both user and profile documents
    const unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Get profile details from subcollection
        const profileDoc = await getDoc(profileDocRef);
        const profileData = profileDoc.exists() ? profileDoc.data() : {};
        
        console.log('User Data:', userData);
        console.log('Profile Data:', profileData);
        console.log('Current User PhotoURL:', user.photoURL);
        
        // Combine user data with profile data
        const combinedData = {
          ...userData,
          ...profileData,
          // Prioritize photo URLs in order: Google photo, profile photo, default
          photoURL: user.photoURL || 
                  profileData.photoURL || 
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzY0NzRmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzY0YjNmNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PC9zdmc+'
        };
        
        console.log('Combined Data PhotoURL:', combinedData.photoURL);
        
        setUserProfile(combinedData);
      }
    }, (error) => {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile');
    });

    return () => unsubscribe();
  }, []);

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
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
  };

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4 flex flex-col items-center">
          <div className="relative">
            <img 
              src={userProfile.photoURL}
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <label 
              htmlFor="photo-upload" 
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-gray-600" 
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
          {uploading && (
            <div className="mt-2 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          )}
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <p className="text-gray-700">{userProfile.displayName}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <p className="text-gray-700">{userProfile.email}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Role
          </label>
          <p className="text-gray-700">{userProfile.role}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;