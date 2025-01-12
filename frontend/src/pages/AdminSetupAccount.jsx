import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminSetupAccount = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    profilePicture: null
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/admin/setup-account', {
        uid: user.uid,
        ...formData
      });

      navigate('/admin/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Setup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-color-3">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-color-7">Complete Your Profile</h2>
        
        <div className="mb-4">
          <p className="text-gray-600">College: {user.collegeName}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-color-5 focus:ring focus:ring-color-5 focus:ring-opacity-50"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-color-5 focus:ring focus:ring-color-5 focus:ring-opacity-50"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-color-5 focus:ring focus:ring-color-5 focus:ring-opacity-50"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-color-5 focus:ring focus:ring-color-5 focus:ring-opacity-50"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Profile Picture (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({...formData, profilePicture: e.target.files[0]})}
              className="mt-1 block w-full"
            />
          </div>

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          
          <button 
            type="submit"
            className="w-full bg-color-5 text-white py-2 px-4 rounded-md hover:bg-color-7 focus:outline-none focus:ring-2 focus:ring-color-5 focus:ring-opacity-50"
          >
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSetupAccount;