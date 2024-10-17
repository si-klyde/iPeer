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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-3 bg-black shadow-md rounded-lg">
        <button onClick={handleSignIn} className="text-n-1">
          Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default LoginClient;