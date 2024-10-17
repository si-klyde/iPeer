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
    const fetchAppointments = async () => {
      if (!currentUserId) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/appointments/${currentUserId}`);
        setAppointments(response.data);
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
          [peerCounselorId]: response.data.displayName || 'Name not available'
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl mb-4">Your Appointments</h2>
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment.id} className="mb-4 p-2 border rounded">
              <p>Date: {appointment.date}</p>
              <p>Time: {appointment.time}</p>
              <p>Description: {appointment.description}</p>
              <p>Peer Counselor: {peerCounselors[appointment.peerCounselorId] || 'Loading...'}</p>
              <p>Video Call Room: <a href={`/counseling/${appointment.roomId}`} target="_blank" rel="noopener noreferrer">Join Call</a></p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ViewAppointments;