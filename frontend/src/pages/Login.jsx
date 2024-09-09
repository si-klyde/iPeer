import React from 'react';
import { auth, provider, signInWithPopup } from '../firebase'; 
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User info:', user);
      
      navigate('/');

    } catch (error) {
      console.error('Error signing in with Google:', error);
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

export default Login;
