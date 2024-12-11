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
        
        {appointments.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700 font-medium">{appointment.date}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700 font-medium">{appointment.time}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-gray-700">
                        Client: {clients[appointment.userId] || 'Loading...'}
                      </span>
                    </div>
                  </div>
                </div>
  
                <div className="mt-4">
                  <p className="text-gray-600">
                    <span className="font-medium">Description: </span>
                    {appointment.description}
                  </p>
                </div>
  
                <div className="mt-4">
                  <p className={`text-sm font-medium mb-2 ${
                    appointment.status === 'accepted' ? 'text-green-600' : 
                    appointment.status === 'declined' ? 'text-red-600' : 
                    'text-yellow-600'
                  }`}>
                    Status: {appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Pending'}
                  </p>
  
                  <div className="flex flex-col gap-2">
                    {(!appointment.status || appointment.status === 'pending') && (
                      <div className="flex gap-2">
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
                      </div>
                    )}
                    
                    {appointment.status === 'accepted' && (() => {
                      const now = new Date();
                      const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
                      const earliestJoinTime = new Date(appointmentDateTime.getTime() - 30 * 60000);
                      const latestJoinTime = new Date(appointmentDateTime.getTime() + 30 * 60000);
                      const isTimeToJoin = now >= earliestJoinTime && now <= latestJoinTime;
  
                      return isTimeToJoin ? (
                        <a
                          href={`/counseling/${appointment.roomId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Join Video Call
                        </a>
                      ) : (
                        <span className="text-gray-500 italic">
                          Call will be available 30 minutes before and after scheduled time: {appointment.date} {appointment.time}
                        </span>
                      );
                    })()}
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