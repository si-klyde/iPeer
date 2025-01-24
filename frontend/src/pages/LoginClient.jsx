import React, { useState } from 'react';
import axios from 'axios';
import { auth, provider, signInWithPopup, signInWithCustomToken } from '../firebase';
import { deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../config/api.js';

const LoginClient = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      setError('');
      const result = await signInWithPopup(auth, provider);
      
      const user = result.user;
      console.log('User info:', user);

      // Get the Firebase ID token
      const idToken = await user.getIdToken();
      console.log('Firebase ID token:', idToken);

      try {
        const apiUrl = `${API_CONFIG.BASE_URL}/api/google-signin`;
        console.log('Attempting to fetch from:', apiUrl);

        const response = await axios.post(apiUrl, { 
          token: idToken
        });
        
        // Sign out of the temporary account
        await auth.signOut();
        
        // Sign in with the custom token if validation succeeded
        await signInWithCustomToken(auth, response.data.token);
        navigate('/');
        
      } catch (validationError) {
        console.error('Validation error:', validationError);
        
        // Delete the temporary user if they exist
        if (user) {
          try {
            // We need to sign back in briefly to delete the user
            await auth.updateCurrentUser(user);
            await deleteUser(user);
            console.log('Temporary user deleted successfully');
          } catch (deleteError) {
            console.error('Error deleting temporary user:', deleteError);
          }
        }
        
        // Make sure we're signed out
        await auth.signOut();
        
        if (validationError.response && validationError.response.status === 403) {
          setError('Please use your school email address to sign in.');
        } else {
          setError('An error occurred during sign in. Please try again.');
        }
      }
      
    } catch (error) {
      console.error('Detailed error:', error);
      await auth.signOut();
      setError('An error occurred during sign in. Please try again.');
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white p-8 rounded-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Client Login</h3>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <button
        onClick={handleSignIn}
        className="bg-green-500 hover:bg-green-800/80 text-white font-semibold py-3 px-6 rounded-lg shadow-inner transition duration-200"
      >
        Sign In with Google
      </button>
    </div>
  );
};

export default LoginClient;
