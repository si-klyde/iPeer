import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth, authStateChanged } from '../firebase';
import PendingAppointments from '../components/PendingAppointments';
import AcceptedAppointments from '../components/AcceptedAppointments';

const ViewAppointmentsPeer = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    authStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        navigate('/login');
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
      try {
        const { data: appointments } = await axios.get(`http://localhost:5000/api/appointments/peer-counselor/${currentUserId}`);
        const sortedAppointments = sortAppointmentsByCreatedAt(appointments);
        setAppointments(sortedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAppointments();
  }, [currentUserId]);
  

  useEffect(() => {
    const fetchClientDetails = async (userId) => {
      if (!clients[userId]) {
        try {
          const response = await axios.get(`http://localhost:5000/api/client/${userId}`);
          setClients(prevState => ({
            ...prevState,
            [userId]: response.data.displayName || 'Name not available'
          }));
        } catch (error) {
          console.error('Error fetching client details:', error);
          setClients(prevState => ({
            ...prevState,
            [userId]: 'Client information unavailable'
          }));
        }
      }
    };

    appointments.forEach(appointment => {
      if (appointment.userId) {
        fetchClientDetails(appointment.userId);
      }
    });
  }, [appointments, clients]);

  const handleAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/status`, { status });
      
      setAppointments(appointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status }
          : appointment
      ));
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Appointment Management
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
            Pending Confirmations
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
        </div>

        {activeTab === 'pending' && (
          <PendingAppointments 
            appointments={appointments}
            clients={clients}
            handleAppointmentStatus={handleAppointmentStatus}
          />
        )}
        
        {activeTab === 'accepted' && (
          <AcceptedAppointments 
            appointments={appointments}
            clients={clients}
          />
        )}
      </div>
    </div>
  );
};

export default ViewAppointmentsPeer;