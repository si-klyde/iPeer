import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PendingAppointments from '../components/PendingAppointments';
import AcceptedAppointments from '../components/AcceptedAppointments';
import SessionHistory from '../components/SessionHistory';
import { auth, authStateChanged } from '../firebase';

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [peerCounselors, setPeerCounselors] = useState({});
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    authStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        navigate('/login'); // Redirect to login if not authenticated
      }
    });
  }, [navigate]);

  useEffect(() => {
    const sortAppointmentsByCreatedAt = (appointments) => {
      return [...appointments].sort((a, b) => {
        const aSeconds = a.createdAt?._seconds ?? 0;
        const bSeconds = b.createdAt?._seconds ?? 0;
        return bSeconds - aSeconds;
      });
    };
  
    const fetchAppointments = async () => {
      if (!currentUserId) return;
  
      const cachedAppointments = localStorage.getItem(`appointments_${currentUserId}`);
      if (cachedAppointments) {
        setAppointments(JSON.parse(cachedAppointments));
      }
  
      try {
        const { data: appointments } = await axios.get(`http://localhost:5000/api/appointments/client/${currentUserId}`);
        const sortedAppointments = sortAppointmentsByCreatedAt(appointments);
        setAppointments(sortedAppointments);
        localStorage.setItem(`appointments_${currentUserId}`, JSON.stringify(sortedAppointments));
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [currentUserId]);

  useEffect(() => {
    const fetchPeerCounselorDetails = async (peerCounselorId) => {
      if (!peerCounselors[peerCounselorId]) {
        const cachedCounselor = localStorage.getItem(`counselor_${peerCounselorId}`);
        if (cachedCounselor) {
          setPeerCounselors(prevState => ({
            ...prevState,
            [peerCounselorId]: JSON.parse(cachedCounselor)
          }));
          return;
        }
    
        try {
          const response = await axios.get(`http://localhost:5000/api/peer-counselors/${peerCounselorId}`);
          const counselorName = response.data.fullName || 'Name not available';
          setPeerCounselors(prevState => ({
            ...prevState,
            [peerCounselorId]: counselorName
          }));
          localStorage.setItem(`counselor_${peerCounselorId}`, JSON.stringify(counselorName));
        } catch (error) {
          console.error('Error fetching peer counselor details:', error);
          setPeerCounselors(prevState => ({
            ...prevState,
            [peerCounselorId]: 'Name not available'
          }));
        }
      }
    };

    appointments.forEach(appointment => {
      if (appointment.peerCounselorId) {
        fetchPeerCounselorDetails(appointment.peerCounselorId);
      }
    });
  }, [appointments, peerCounselors]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Your Appointments
        </h2>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-indigo-50'
            }`}
          >
            Pending Appointments
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'accepted'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-indigo-50'
            }`}
          >
            Accepted Appointments
          </button>
          <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-indigo-50'
              }`}
            >
              Session History
            </button>
          </div>

        {activeTab === 'pending' && (
          <PendingAppointments 
            appointments={appointments}
            peerCounselors={peerCounselors}
            role="client"
          />
        )}
        
        {activeTab === 'accepted' && (
          <AcceptedAppointments 
            appointments={appointments}
            peerCounselors={peerCounselors}
            role="client"
          />
        )}

        {activeTab === 'history' && (
          <SessionHistory 
            clientId={currentUserId}
            role="client"
            peerCounselors={peerCounselors}
          />
        )}
      </div>
    </div>
  );
};

export default ViewAppointments;