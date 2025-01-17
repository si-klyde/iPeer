import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { auth, authStateChanged } from '../firebase';
import PendingAppointments from '../components/PendingAppointments';
import AcceptedAppointments from '../components/AcceptedAppointments';
import SessionHistory from '../components/SessionHistory';

const ViewAppointmentsPeer = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    // Get tab from URL parameters
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

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
  
      const cachedAppointments = localStorage.getItem(`appointments_${currentUserId}`);
      if (cachedAppointments) {
        setAppointments(JSON.parse(cachedAppointments));
      }
  
      try {
        const { data: appointments } = await axios.get(`http://localhost:5000/api/appointments/peer-counselor/${currentUserId}`);
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
    const fetchClientDetails = async (clientId) => {
      if (!clients[clientId]) {
        const cachedClients = localStorage.getItem(`clients_${clientId}`);
        if (cachedClients) {
          setClients(prevState => ({
            ...prevState,
            [clientId]: JSON.parse(cachedClients)
          }));
          return;
        }
    
        try {
          const response = await axios.get(`http://localhost:5000/api/client/${clientId}`);
          const clientName = response.data.fullName || 'Name not available';
          setClients(prevState => ({
            ...prevState,
            [clientId]: clientName
          }));
          localStorage.setItem(`clients_${clientId}`, JSON.stringify(clientName));
        } catch (error) {
          console.error('Error fetching client details:', error);
          setClients(prevState => ({
            ...prevState,
            [clientId]: 'Client information unavailable'
          }));
        }
      }
    };

    appointments.forEach(appointment => {
      if (appointment.clientId) {
        fetchClientDetails(appointment.clientId);
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

  useEffect(() => {
    // Handle navigation state
    if (location.state?.appointmentId) {
      const appointment = appointments.find(app => app.id === location.state.appointmentId);
      if (appointment) {
        // Set the appropriate tab based on appointment status
        if (appointment.status === 'pending') {
          setActiveTab('pending');
        } else if (appointment.status === 'accepted') {
          setActiveTab('accepted');
        } else if (appointment.status === 'completed') {
          setActiveTab('history');
        }

        // Scroll to the appointment after a short delay to ensure rendering
        setTimeout(() => {
          const element = document.getElementById(`appointment-${appointment.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-appointment');
          }
        }, 100);
      }
    }
  }, [location.state, appointments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6F4EA] py-4 md:py-8 lg:py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl md:text-2xl lg:text-[32px] font-bold text-center text-[#2D3748] mb-4 md:mb-8 lg:mb-12">
          Appointment Management
        </h1>

        <div className="flex flex-col md:flex-row justify-center items-stretch md:items-center gap-3 md:gap-6 mb-4 md:mb-6 lg:mb-8">
          {['pending', 'accepted', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                w-full md:w-auto px-3 md:px-4 lg:px-6 
                py-2 md:py-2.5 lg:py-3 
                rounded-lg md:rounded-full 
                text-sm md:text-base 
                font-medium 
                transition-all duration-200
                ${activeTab === tab
                  ? 'bg-[#9CDBA6] text-[#2D3748] shadow-md md:shadow-lg shadow-green-200'
                  : 'bg-white/50 text-[#4A5568] hover:bg-[#9CDBA6]/50'
                }
              `}
            >
              {tab === 'pending' && 'Pending Confirmations'}
              {tab === 'accepted' && 'Accepted Appointments'}
              {tab === 'history' && 'Session History'}
            </button>
          ))}
        </div>

        <style>{`
          .highlight-appointment {
            animation: highlight 2s ease-in-out;
          }
          @keyframes highlight {
            0% { background-color: rgba(156, 219, 166, 0.3); }
            100% { background-color: transparent; }
          }
        `}</style>

        <div className="bg-white rounded-lg md:rounded-xl lg:rounded-2xl shadow-sm md:shadow p-3 md:p-6 lg:p-8">
          {activeTab === 'pending' && (
            <PendingAppointments 
              appointments={appointments}
              clients={clients}
              role="peer-counselor"
              handleAppointmentStatus={handleAppointmentStatus}
            />
          )}
          
          {activeTab === 'accepted' && (
            <AcceptedAppointments 
              appointments={appointments}
              clients={clients}
              role="peer-counselor"
            />
          )}

          {activeTab === 'history' && (
            <SessionHistory 
              role="peer-counselor"
              clients={clients}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAppointmentsPeer;