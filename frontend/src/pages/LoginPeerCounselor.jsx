import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { auth, signInWithCustomToken } from '../firebase';

const LoginPeerCounselor = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.querySelector('header')?.classList.add('hidden');
    document.querySelector('footer')?.classList.add('hidden');
  
    return () => {
      document.querySelector('header')?.classList.remove('hidden');
      document.querySelector('footer')?.classList.remove('hidden');
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/login-peer-counselor',
        { email, password }
      );

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
    <div className="w-full h-full flex items-center justify-center bg-transparent px-4 py-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-transparent rounded-lg p-8"
      >
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Peer Counselor Login
        </h2>

        {errorMessage && (
          <div className="text-red-600 text-center mb-4">{errorMessage}</div>
        )}

        {/* Email Input */}
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 bg-green-100 text-black py-2 border shadow-inner border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={loading}
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 bg-green-100 text-black py-2 border shadow-inner border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={loading}
          />
        </div>

        <div className="mb-4 text-right">
          <Link to="/forgot-password" className="text-green-600 hover:text-green-700 text-sm">
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className={`w-full px-4 py-2 text-white font-semibold rounded-lg transition ${
            loading
              ? 'bg-green-300 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          }`}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPeerCounselor;