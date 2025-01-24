import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { auth, signInWithCustomToken } from '../firebase';
import API_CONFIG from '../config/api.js';

const LoginPeerCounselor = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        `${API_CONFIG.BASE_URL}/api/login-peer-counselor`,
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
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 bg-green-100 text-black py-2 border shadow-inner border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg
                  className="h-5 w-5 text-gray-500 hover:text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-gray-500 hover:text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
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