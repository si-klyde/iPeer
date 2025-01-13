import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { toast } from 'react-toastify';

const InvitePeerCounselor = ({ adminData }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        'http://localhost:5000/api/admin/send-invitation',
        { 
          email,
          college: adminData.college,
          school: adminData.school
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEmail('');
      toast.success('Invitation sent successfully!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        theme: "colored"
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send invitation';
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        theme: "colored"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-8 shadow-sm">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-color-7 mb-6">Invite New Peer Counselor</h2>
        
        <form onSubmit={handleInvite} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter counselor's email"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 
                  focus:ring-2 focus:ring-green-500 focus:border-transparent
                  transition-all duration-200 bg-white"
                required
              />
            </div>
            <div className="flex items-end">
            <button 
              type="submit" 
              className="w-full sm:w-auto px-6 py-3 bg-color-7 text-white font-medium 
                rounded-lg hover:bg-color-6 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-7
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
              disabled={!email || isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>An invitation email will be sent to join as a peer counselor for {adminData?.college}.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvitePeerCounselor;