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
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="p-3 bg-emerald-100 rounded-xl w-fit">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Invite New Peer Counselor</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Add new counselors to your team at {adminData?.college}</p>
          </div>
        </div>
        
        <form onSubmit={handleInvite} className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="counselor@example.com"
                  className="w-full px-4 py-3 sm:py-3.5 pl-12 rounded-xl border border-gray-200 
                    focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                    transition-all duration-200 bg-white shadow-sm hover:shadow-md
                    text-gray-800 text-base placeholder-gray-400"
                  required
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-3.5 bg-emerald-600 text-white font-medium 
                  rounded-xl hover:bg-emerald-700 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-sm hover:shadow-md
                  flex items-center justify-center gap-2 text-sm sm:text-base"
                disabled={!email || isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Send Invitation</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-start sm:items-center gap-3">
              <svg className="w-5 h-5 mt-0.5 sm:mt-0 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm sm:text-base text-gray-700">
                An invitation email will be sent with instructions to join as a peer counselor for {adminData?.college}.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}  

export default InvitePeerCounselor;