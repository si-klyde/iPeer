import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import axios from 'axios';

const AdminSetupAccount = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState({
    username: '',
    college: ''
  });
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchInitialData = async () => {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(
            `http://localhost:5000/api/admin/admin-initial-data/${auth.currentUser.uid}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        setInitialData(response.data);
    };
    fetchInitialData();
  }, []);

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!Object.values(passwordStrength).every(Boolean)) {
      setError('Please meet all password requirements');
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

  const [formData, setFormData] = useState({
    username: '' || user.username || initialData.username,
    fullName: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    profilePicture: null
  });

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-color-3">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-color-7">Complete Your Profile</h2>
        
        <div className="mb-4">
          <p className="text-gray-600">College: {initialData.college}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-color-5 focus:ring focus:ring-color-5 focus:ring-opacity-50"
                required
            />
          </div>
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
              onChange={(e) => {
                setFormData({...formData, newPassword: e.target.value});
                checkPasswordStrength(e.target.value);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-color-5 focus:ring focus:ring-color-5 focus:ring-opacity-50"
              required
            />
            <div className="flex flex-col -space-y-1 mt-1">
              {Object.entries(passwordStrength)
                .filter(([_, isValid]) => !isValid)
                .map(([rule, _]) => (
                  <div key={rule} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-[10px] text-gray-500">
                      {rule === 'minLength' && '8+ characters'}
                      {rule === 'hasUpperCase' && 'Uppercase letter'}
                      {rule === 'hasLowerCase' && 'Lowercase letter'}
                      {rule === 'hasNumber' && 'Number'}
                      {rule === 'hasSpecialChar' && 'Special character'}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-color-5 focus:ring focus:ring-color-5 focus:ring-opacity-50 
                ${formData.confirmPassword && (formData.confirmPassword === formData.newPassword ? 'border-green-500' : 'border-red-500')}`}
              required
            />
            {formData.confirmPassword && formData.confirmPassword !== formData.newPassword && (
              <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
            )}
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