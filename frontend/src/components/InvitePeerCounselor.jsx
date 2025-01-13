import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { toast } from 'react-toastify';

const InvitePeerCounselor = ({ adminData }) => {
  const [email, setEmail] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
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
      toast.error('Failed to send invitation');
    }
  };

  return (
    <form onSubmit={handleInvite} className="mt-8">
      <h2 className="text-xl font-semibold text-color-7 mb-4">Invite Peer Counselor</h2>
      <div className="flex gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="flex-1 p-2 border rounded"
        />
        <button type="submit" className="bg-color-7 text-white px-4 py-2 rounded">
          Send Invitation
        </button>
      </div>
    </form>
  );
};

export default InvitePeerCounselor;