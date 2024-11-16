import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, authStateChanged } from '../firebase';
import { Calendar, ChevronRight } from 'lucide-react';
import axios from 'axios';

const PeerDashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [clients, setClients] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

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
    const fetchTodayAppointments = async () => {
      if (!currentUserId) return;
      
      try {
        const response = await axios.get(`http://localhost:5000/api/appointments/peer-counselor/${currentUserId}`);
        
        // Filter appointments for today's date
        const today = new Date().toISOString().split('T')[0];
        const todaySchedule = response.data.filter(apt => apt.date === today);
        
        setTodayAppointments(todaySchedule);
      } catch (error) {
        console.error('Error fetching today\'s appointments:', error);
      }
    };

    fetchTodayAppointments();
  }, [currentUserId]);

  useEffect(() => {
    const fetchClientDetails = async (userId) => {
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
          [userId]: 'Error fetching name'
        }));
      }
    };

    todayAppointments.forEach(appointment => {
      if (appointment.userId && !clients[appointment.userId]) {
        fetchClientDetails(appointment.userId);
      }
    });
  }, [todayAppointments, clients]);

  const upcomingAppointments = todayAppointments.map(apt => ({
    id: apt.id,
    studentName: clients[apt.userId] || 'Loading...',
    time: apt.time,
    date: 'Today',
    status: apt.status || 'Scheduled',
    roomId: apt.roomId
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <button 
              onClick={() => navigate('/appointments/peer-counselor')}
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center"
            >
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} 
                   className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{appointment.studentName}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.time} - {appointment.date}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => navigate(`/counseling/${appointment.id}`)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md
                             hover:bg-gray-50 transition-colors duration-200"
                  >
                    Join Session
                  </button>
                  <button 
                    onClick={() => navigate(`/peer/client-history/${appointment.id}`)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900
                             transition-colors duration-200"
                  >
                    View History
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerDashboard;
