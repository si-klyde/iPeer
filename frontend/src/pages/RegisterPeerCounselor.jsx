import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPeerCounselor = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!displayName || !email || !password) {
      setErrorMessage('All fields are required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/register-peer-counselor',
        { email, password, displayName }
      );
      console.log('Registration successful:', response.data);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
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
        onSubmit={handleRegister}
        className="w-full max-w-md bg-transparent rounded-lg p-8"
      >
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Register as Peer Counselor
        </h2>

        {errorMessage && (
          <div className="text-red-600 text-center mb-4">{errorMessage}</div>
        )}

        {/* Display Name Input */}
        <div className="mb-6">
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            placeholder="Enter your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={loading}
          />
        </div>

        {/* Email Input */}
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={loading}
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={loading}
          />
        </div>

        {/* Register Button */}
        <button
          type="submit"
          className={`w-full px-4 py-2 text-white font-semibold rounded-lg transition ${
            loading
              ? 'bg-green-300 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          }`}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPeerCounselor;
