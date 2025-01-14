import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const header = document.querySelector('.header-nav');
    const footer = document.querySelector('footer');
    
    header?.classList.add('hidden');
    footer?.classList.add('hidden');
  
    return () => {
      header?.classList.remove('hidden');
      footer?.classList.remove('hidden');
    };
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
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!Object.values(passwordStrength).every(Boolean)) {
      setError('Please meet all password requirements');
      return;
    }

    try {
        await axios.post('http://localhost:5000/api/reset-password', {
          token,
          newPassword
        });
        
        toast.success('Password reset successful! Redirecting to login...', {
          position: "top-center",
          autoClose: 2000
        });
        
        setTimeout(() => {
          navigate('/login-peer-counselor');
        }, 2000);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to reset password');
      }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-transparent px-4 py-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Set New Password</h2>
        
        {error && <div className="text-red-600 text-center mb-4 p-3 bg-red-50 rounded-lg">{error}</div>}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              checkPasswordStrength(e.target.value);
            }}
            className="w-full px-4 bg-green-100 text-black py-3 border shadow-inner border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 bg-green-100 text-black py-3 border shadow-inner border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 
              ${confirmPassword && (confirmPassword === newPassword ? 'border-green-500' : 'border-red-500')}`}
            required
          />
          {confirmPassword && confirmPassword !== newPassword && (
            <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 text-white font-semibold bg-green-500 hover:bg-green-600 rounded-lg transition-all duration-200 mb-4"
        >
          Reset Password
        </button>

        <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Important Information:</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>Your new password must meet all the requirements shown above</li>
            <li>After resetting, you'll be redirected to the login page</li>
            <li>For security, this reset link can only be used once</li>
            <li>Make sure to remember your new password</li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;