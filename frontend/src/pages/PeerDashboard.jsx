import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, authStateChanged } from '../firebase';
import { Calendar, ChevronRight } from 'lucide-react';
import axios from 'axios';

const PeerDashboard = () => {
  const navigate = useNavigate();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [clients, setClients] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [peerStatus, setPeerStatus] = useState('online');

  useEffect(() => {
    authStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        navigate('/login');
      }
    });
  }, [navigate]);

  // Fetch today's appointments and upcoming appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!currentUserId) return;
      
      try {
        const response = await axios.get(`http://localhost:5000/api/appointments/peer-counselor/${currentUserId}`);
        
        const today = new Date().toISOString().split('T')[0];
        const todaySchedule = response.data.filter(apt => apt.date === today);
        const futureSchedule = response.data.filter(apt => apt.date > today);
        
        setTodayAppointments(todaySchedule);
        setUpcomingAppointments(futureSchedule);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
  
    fetchAppointments();
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

  const formatAppointments = appointments => appointments.map(apt => ({
    id: apt.id,
    studentName: clients[apt.userId] || 'Loading...',
    time: apt.time,
    date: apt.date === new Date().toISOString().split('T')[0] ? 'Today' : apt.date,
    status: apt.status || 'Scheduled',
    roomId: apt.roomId
  }));
  
  const todayFormattedAppointments = formatAppointments(todayAppointments);
  const upcomingFormattedAppointments = formatAppointments(upcomingAppointments);

  const StatusToggle = () => {
    const statusOptions = ['online', 'away', 'busy', 'offline'];
    
    const handleStatusChange = async (newStatus) => {
      setPeerStatus(newStatus);
      setIsAvailable(newStatus === 'online');
      
      try {
        await axios.put(`http://localhost:5000/api/peer-counselor/status/${currentUserId}`, {
          status: newStatus,
          isAvailable: newStatus === 'online'
        });
      } catch (error) {
        console.error('Error updating status:', error);
      }
    };

    // useEffect(() => {
    //   console.log('Status Updated:', {
    //     currentStatus: peerStatus,
    //     availabilityState: isAvailable
    //   });
    // }, [peerStatus, isAvailable]);
  
    return (
      <div className="flex items-center space-x-4 mb-6 bg-white p-4 rounded-lg shadow">
        <span className="font-medium">Status:</span>
        <div className="flex space-x-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-4 py-2 rounded-full text-sm capitalize
                ${peerStatus === status 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className={`flex items-center space-x-2 
          ${isAvailable ? 'text-green-500' : 'text-gray-500'}`}>
          <div className={`w-3 h-3 rounded-full 
            ${isAvailable ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span className="text-sm">
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <StatusToggle />
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
            {todayFormattedAppointments.length > 0 ? (
              todayFormattedAppointments.map((appointment) => (
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
                      onClick={() => navigate(`/counseling/${appointment.roomId}`)}
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
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="text-lg">Your schedule is clear today! 🌟</p>
                <p className="text-sm">Time for a coffee break?</p>
              </div>
            )}
            
          </div>
        </div>
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
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
              {upcomingFormattedAppointments.length > 0 ? (
                upcomingFormattedAppointments.map((appointment) => (
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
                        onClick={() => navigate(`/counseling/${appointment.roomId}`)}
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
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-lg">No upcoming appointments yet! ✨</p>
                  <p className="text-sm">Your future schedule is wide open</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PeerDashboard;
