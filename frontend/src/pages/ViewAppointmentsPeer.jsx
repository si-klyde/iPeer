import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth, authStateChanged } from '../firebase';

const ViewAppointmentsPeer = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
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
    const fetchAppointments = async () => {
      if (!currentUserId) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/appointments/peer-counselor/${currentUserId}`);
        setAppointments(response.data);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Appointment Management</h2>
        
        {appointments.length === 0 ? (
          <p className="text-gray-600 text-center">No appointments found</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} 
                   className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between flex-wrap gap-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">
                      Client: {clients[appointment.userId] || 'Loading...'}
                    </p>
                    <p className="text-gray-600">Date: {appointment.date}</p>
                    <p className="text-gray-600">Time: {appointment.time}</p>
                    <p className="text-gray-600">Description: {appointment.description}</p>
                    <p className={`font-medium ${
                      appointment.status === 'accepted' ? 'text-green-600' : 
                      appointment.status === 'declined' ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>
                      Status: {appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Pending'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {(!appointment.status || appointment.status === 'pending') && (
                      <>
                        <button
                          onClick={() => handleAppointmentStatus(appointment.id, 'accepted')}
                          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAppointmentStatus(appointment.id, 'declined')}
                          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    
                    {appointment.status === 'accepted' && (
                      <a
                        href={`/counseling/${appointment.roomId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors text-center"
                      >
                        Join Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAppointmentsPeer;