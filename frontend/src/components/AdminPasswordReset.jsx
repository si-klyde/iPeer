import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { toast } from 'react-toastify';

const AdminPasswordReset = () => {
  const [step, setStep] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  
  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

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
    <div className="max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600">Change Password</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Protect your account by creating a strong, unique password
        </p>
      </div>
  
      {/* Step Indicators */}
      <div className="flex justify-center my-8">
        <div className="flex items-center">
          {[
            { number: 1, label: 'Request Code' },
            { number: 2, label: 'Verify Email' },
            { number: 3, label: 'New Password' }
          ].map((step) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center 
                  ${currentStep === step.number ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                  {step.number}
                </div>
                <span className="text-xs sm:text-sm mt-2 text-gray-600">{step.label}</span>
              </div>
              {step.number < 3 && <div className="w-12 sm:w-16 h-1 bg-emerald-100 mx-2 sm:mx-4"></div>}
            </div>
          ))}
        </div>
      </div>
  
      {step === 1 && (
        <div className="text-center space-y-6">
          <p className="text-sm sm:text-base text-gray-600">
            We'll send a verification code to your registered email address
          </p>
          <button
            onClick={requestCode}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-emerald-600 text-white rounded-xl 
              hover:bg-emerald-700 transition-all duration-300 flex items-center 
              justify-center space-x-2 mx-auto text-sm sm:text-base"
          >
            <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Send Verification Code</span>
          </button>
        </div>
      )}
  
      {step === 2 && (
        <div className="space-y-6">
          <p className="text-center text-sm sm:text-base text-gray-600">
            Enter the 6-digit code sent to your email
          </p>
          <div className="bg-emerald-50 p-4 sm:p-6 rounded-xl">
            <input
              type="text"
              placeholder="Enter code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength="6"
              className="w-full text-center text-xl sm:text-2xl tracking-widest py-3 sm:py-4 
                rounded-lg border-2 border-emerald-200 focus:ring-2 
                focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              onClick={verifyCode}
              className="w-full mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl 
                hover:bg-emerald-700 transition-all duration-300 text-sm sm:text-base"
            >
              Verify Code
            </button>
          </div>
        </div>
      )}
  
      {step === 3 && (
      <form onSubmit={updatePassword} className="space-y-6">
        <p className="text-center text-sm sm:text-base text-gray-600">
          Create a new password for your account
        </p>
        <div className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="New Password"
              value={passwords.newPassword}
              onChange={(e) => {
                setPasswords({...passwords, newPassword: e.target.value});
                checkPasswordStrength(e.target.value);
              }}
              className="w-full px-6 py-3 sm:py-4 rounded-lg border-2 border-emerald-200 
                focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                text-sm sm:text-base"
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
          <input
            type="password"
            placeholder="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
            className={`w-full px-6 py-3 sm:py-4 rounded-lg border-2 border-emerald-200 
              focus:ring-2 focus:ring-emerald-500 focus:border-transparent
              text-sm sm:text-base ${
                passwords.confirmPassword && 
                (passwords.confirmPassword === passwords.newPassword ? 'border-green-500' : 'border-red-500')
              }`}
          />
          {passwords.confirmPassword && passwords.confirmPassword !== passwords.newPassword && (
            <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
          )}
        </div>
        <button
          type="submit"
          disabled={!Object.values(passwordStrength).every(Boolean) || 
            passwords.newPassword !== passwords.confirmPassword}
          className="w-full px-6 py-3 sm:py-4 bg-emerald-600 text-white rounded-xl 
            hover:bg-emerald-700 transition-all duration-300 text-sm sm:text-base
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Update Password
        </button>
      </form>
    )}
    </div>
  );
};

export default AdminPasswordReset;
