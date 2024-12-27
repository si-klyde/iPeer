import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth, authStateChanged } from '../firebase';

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [peerCounselors, setPeerCounselors] = useState({});
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
      try {
        const { data: appointments } = await axios.get(`http://localhost:5000/api/appointments/client/${currentUserId}`);
        const sortedAppointments = sortAppointmentsByCreatedAt(appointments);
        setAppointments(sortedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
  
    fetchAppointments();
  }, [currentUserId]);

  useEffect(() => {
    const fetchPeerCounselorDetails = async (peerCounselorId) => {
      console.log(`Fetching details for peer counselor ID: ${peerCounselorId}`);
      try {
        const response = await axios.get(`http://localhost:5000/api/peer-counselors/${peerCounselorId}`);
        setPeerCounselors(prevState => ({
          ...prevState,
          [peerCounselorId]: response.data.fullName || 'Name not available'
        }));
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.error(`Peer counselor with ID ${peerCounselorId} not found.`);
          setPeerCounselors(prevState => ({
            ...prevState,
            [peerCounselorId]: 'Peer counselor not found'
          }));
        } else {
          console.error('Error fetching peer counselor details:', error);
          setPeerCounselors(prevState => ({
            ...prevState,
            [peerCounselorId]: 'Error fetching name'
          }));
        }
      }
    };

    appointments.forEach(appointment => {
      if (appointment.peerCounselorId && !peerCounselors[appointment.peerCounselorId]) {
        fetchPeerCounselorDetails(appointment.peerCounselorId);
      }
    });
  }, [appointments, peerCounselors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Your Appointments
        </h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">No appointments scheduled yet.</p>
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
                        {peerCounselors[appointment.peerCounselorId] || 'Loading...'}
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

                  {appointment.status === 'accepted' && (() => {
                    const now = new Date();
                    const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
                    
                    // Add grace periods (30 mins before and after)
                    const earliestJoinTime = new Date(appointmentDateTime.getTime() - 30 * 60000); // 30 mins before
                    const latestJoinTime = new Date(appointmentDateTime.getTime() + 30 * 60000);  // 30 mins after
                    
                    const isTimeToJoin = now >= earliestJoinTime && now <= latestJoinTime;

                    return isTimeToJoin ? (
                      <a
                        href={`/counseling/${appointment.roomId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Join Video Call
                      </a>
                    ) : (
                      <span className="text-gray-500 italic">
                        You can join 30 minutes before or after scheduled time—no rush, we’re here for you.
                      </span>
                    );
                  })()}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAppointments;