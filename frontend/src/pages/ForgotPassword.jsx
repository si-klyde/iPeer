import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.querySelector('header')?.classList.add('hidden');
    document.querySelector('footer')?.classList.add('hidden');
  
    return () => {
      document.querySelector('header')?.classList.remove('hidden');
      document.querySelector('footer')?.classList.remove('hidden');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/reset-password-request', { email });
      setMessage(response.data.message);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-transparent px-4 py-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Reset Password</h2>
        
        {message && <div className="text-green-600 text-center mb-4 p-3 bg-green-50 rounded-lg">{message}</div>}
        {error && <div className="text-red-600 text-center mb-4 p-3 bg-red-50 rounded-lg">{error}</div>}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 bg-green-100 text-black py-3 border shadow-inner border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 text-white font-semibold bg-green-500 hover:bg-green-600 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mb-4"
        >
          <span>Send Reset Link</span>
          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </button>

        <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>We'll send a password reset link to your email</li>
            <li>The link will be valid for 1 hour</li>
            <li>Check your spam folder if you don't see the email</li>
            <li>Follow the link to create your new password</li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;