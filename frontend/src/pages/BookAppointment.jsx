import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth, authStateChanged } from '../firebase';

const BookAppointment = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [peerCounselors, setPeerCounselors] = useState([]);
  const [selectedPeerCounselor, setSelectedPeerCounselor] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPeerCounselors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/peer-counselors');
        setPeerCounselors(response.data);
      } catch (error) {
        console.error('Error fetching peer counselors:', error);
      }
    };

    fetchPeerCounselors();
  }, []);

  useEffect(() => {
    authStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        navigate('/login'); // Redirect to login if not authenticated
      }
    });
  }, [navigate]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/create-appointment', {
        date,
        time,
        description,
        peerCounselorId: selectedPeerCounselor,
        userId: currentUserId,
      });
      console.log('Appointment booked successfully:', response.data);
      //const { appointmentId, roomId } = response.data;
      navigate(`/appointments/client`);
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleBookAppointment} className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl mb-4">Book an Appointment</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mb-4 p-2 border rounded"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mb-4 p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-4 p-2 border rounded"
        />
        <select
          value={selectedPeerCounselor}
          onChange={(e) => setSelectedPeerCounselor(e.target.value)}
          className="mb-4 p-2 border rounded"
        >
          <option value="">Select a Peer Counselor</option>
          {peerCounselors.map((counselor) => (
            <option key={counselor.id} value={counselor.id}>
              {counselor.displayName}
            </option>
          ))}
        </select>
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">Book Appointment</button>
      </form>
    </div>
  );
};

export default BookAppointment;