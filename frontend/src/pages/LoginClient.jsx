import React from 'react';
import axios from 'axios';
import { auth, provider, signInWithPopup, signInWithCustomToken } from '../firebase';
import { useNavigate } from 'react-router-dom';

const LoginClient = () => {
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User info:', user);

      // Get the Firebase ID token
      const idToken = await user.getIdToken();
      console.log('Firebase ID token:', idToken);

      const apiUrl = 'http://localhost:5000/api/google-signin';
      console.log('Attempting to fetch from:', apiUrl);

      const response = await axios.post(apiUrl, { token: idToken });

      await signInWithCustomToken(auth, response.data.token);

      navigate('/');
    } catch (error) {
      console.error('Detailed error:', error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white p-8 rounded-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Client Login</h3>
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
