import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth, authStateChanged } from '../firebase';

const ViewAppointmentsPeer = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [clients, setClients] = useState({});
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
    const fetchAppointments = async () => {
      if (!currentUserId) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/appointments/peer-counselor/${currentUserId}`);
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, [currentUserId]);

  useEffect(() => {
    const fetchClientDetails = async (userId) => {
      console.log(`Fetching details for client ID: ${userId}`);
      try {
        const response = await axios.get(`http://localhost:5000/api/client/${userId}`);
        setClients(prevState => ({
          ...prevState,
          [userId]: response.data.displayName || 'Name not available'
        }));
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.error(`Client with ID ${userId} not found.`);
          setClients(prevState => ({
            ...prevState,
            [userId]: 'Client not found'
          }));
        } else {
          console.error('Error fetching client details:', error);
          setClients(prevState => ({
            ...prevState,
            [userId]: 'Error fetching name'
          }));
        }
      }
    };

    appointments.forEach(appointment => {
      if (appointment.userId && !clients[appointment.userId]) {
        fetchClientDetails(appointment.userId);
      }
    });
  }, [appointments, clients]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl mb-4">Your Appointments</h2>
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment.id} className="mb-4 p-2 border rounded">
              <p>Date: {appointment.date}</p>
              <p>Time: {appointment.time}</p>
              <p>Description: {appointment.description}</p>
              <p>Client: {clients[appointment.userId] || 'Loading...'}</p>
              <p>Video Call Room: <a href={`/counseling/${appointment.roomId}`} target="_blank" rel="noopener noreferrer">Join Call</a></p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ViewAppointmentsPeer;