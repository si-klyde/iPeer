import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithCustomToken } from '../firebase';

const LoginPeerCounselor = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/login-peer-counselor', {
        email,
        password,
      });

      await signInWithCustomToken(auth, response.data.token);
      console.log('Login successful:', response.data);
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form 
        onSubmit={handleLogin} 
        className="w-full max-w-md p-6 bg-white shadow-md rounded-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Login as Peer Counselor
        </h2>

        {errorMessage && (
          <div className="mb-4 text-red-600 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={`w-full p-2 rounded text-white ${loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} transition`}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPeerCounselor;
