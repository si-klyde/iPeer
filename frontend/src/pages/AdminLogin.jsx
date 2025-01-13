import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  console.log('Rendering AdminLogin component');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Login attempt with username:', username);

    try {
      console.log('Sending login request...');
      const response = await axios.post('http://localhost:5000/api/admin/login-admin', {
        username,
        password
      });

      const { token, user } = response.data;
      console.log('Login successful for user:', user);

      await signInWithCustomToken(auth, token);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User data stored in localStorage');

      if (user.isFirstLogin) {
        console.log('First time login detected, redirecting to setup');
        navigate('/admin/setup-account');
      } else {
        console.log('Redirecting to dashboard');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      setError(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-color-3">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-color-7">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-color-5 focus:ring focus:ring-color-5 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-color-5 focus:ring focus:ring-color-5 focus:ring-opacity-50"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <button 
            type="submit"
            className="w-full bg-color-5 text-white py-2 px-4 rounded-md hover:bg-color-7 focus:outline-none focus:ring-2 focus:ring-color-5 focus:ring-opacity-50"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
