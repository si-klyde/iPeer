import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, authStateChanged } from '../firebase';
import InvitePeerCounselor from '../components/InvitePeerCounselor';

const AdminDashboard = () => {
  const [peerCounselors, setPeerCounselors] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  console.log('Rendering AdminDashboard');

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = authStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user);
      if (user) {
        console.log('Fetching admin data for uid:', user.uid);
        try {
          const response = await axios.get(`http://localhost:5000/api/admin/admin-data/${user.uid}`);
          console.log('Admin data received:', response.data);
          setAdminData(response.data);
        } catch (error) {
          console.error('Error fetching admin data:', error);
          navigate('/admin/login');
        }
      } else {
        console.log('No authenticated user, redirecting to login');
        navigate('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (adminData?.college) {
      const fetchPeerCounselors = async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const response = await axios.get(
              `http://localhost:5000/api/peer-counselors/per-college/${adminData.college}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            setPeerCounselors(response.data);
        } catch (error) {
          console.error('Error fetching peer counselors:', error);
          setError('Failed to fetch peer counselors');
          setPeerCounselors([]);
        } finally {
          setLoading(false);
        }
      };

      fetchPeerCounselors();
    }
  }, [adminData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-color-3 flex items-center justify-center">
        <div className="text-xl text-color-7">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-color-3 flex items-center justify-center">
        <div className="text-xl text-color-7">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-color-3">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-color-7 mb-4">
            Welcome, {adminData?.username}
          </h1>
          <p className="text-gray-600 mb-6">
            {adminData?.college} Administrator Dashboard
          </p>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-color-7 mb-4">Peer Counselors</h2>
            <div className="grid gap-4">
              {peerCounselors.map((counselor) => (
                <div key={counselor.id} className="bg-color-2 p-4 rounded-lg">
                  <h3 className="font-medium">{counselor.fullName}</h3>
                  <p className="text-sm text-gray-600">{counselor.email}</p>
                  <p className="text-sm">
                    Status: {counselor.currentStatus?.status || 'Offline'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <InvitePeerCounselor adminData={adminData} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
