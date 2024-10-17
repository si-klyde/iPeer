import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleClientLogin = () => {
    navigate('/login-client');
  };

  const handleCounselorRegistration = () => {
    navigate('/register-peer-counselor');
  };

  const handlePeerCounselorLogin = () => {
    navigate('/login-peer-counselor');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl mb-4">Welcome to iPeer</h2>
        <button
          onClick={handleClientLogin}
          className="w-full bg-blue-500 text-white p-2 rounded mb-4"
        >
          Login as Client
        </button>
        <button
          onClick={handleCounselorRegistration}
          className="w-full bg-green-500 text-white p-2 rounded mb-4"
        >
          Register as Peer Counselor
        </button>
        <button
          onClick={handlePeerCounselorLogin}
          className="w-full bg-purple-500 text-white p-2 rounded"
        >
          Login as Peer Counselor
        </button>
      </div>
    </div>
  );
};

export default Login;