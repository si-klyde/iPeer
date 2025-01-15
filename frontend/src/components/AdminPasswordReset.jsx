import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { toast } from 'react-toastify';

const AdminPasswordReset = () => {
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const requestCode = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        'http://localhost:5000/api/admin/initiate-password-change',
        { uid: auth.currentUser.uid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStep(2);
      toast.success('Verification code sent to your email');
    } catch (error) {
      toast.error('Failed to send verification code');
    }
  };

  const verifyCode = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        'http://localhost:5000/api/admin/verify-code',
        { 
          uid: auth.currentUser.uid,
          code: verificationCode 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStep(3);
      toast.success('Code verified successfully');
    } catch (error) {
      toast.error('Invalid verification code');
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        'http://localhost:5000/api/admin/complete-password-change',
        {
          uid: auth.currentUser.uid,
          code: verificationCode,
          newPassword: passwords.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Password updated successfully');
      setStep(1);
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-emerald-600 mb-8 text-center">Change Password</h2>
        
        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
          {[1, 2, 3].map((number) => (
            <div key={number} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                ${step === number ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                {number}
                </div>
                {number < 3 && <div className="w-16 h-1 bg-emerald-100"></div>}
            </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="text-center">
            <button
              onClick={requestCode}
              className="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 
                transition-all duration-300 flex items-center justify-center space-x-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Send Verification Code</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-emerald-50 p-6 rounded-xl">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength="6"
                className="w-full text-center text-2xl tracking-widest py-4 rounded-lg border-2 
                  border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                onClick={verifyCode}
                className="w-full mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl 
                  hover:bg-emerald-700 transition-all duration-300"
              >
                Verify Code
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={updatePassword} className="space-y-6">
            <div>
              <input
                type="password"
                placeholder="New Password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                className="w-full px-6 py-4 rounded-lg border-2 border-emerald-200 
                  focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                className="w-full px-6 py-4 rounded-lg border-2 border-emerald-200 
                  focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl 
                hover:bg-emerald-700 transition-all duration-300"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminPasswordReset;
