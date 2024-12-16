import React, { useState, useEffect, useCallback } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication Effect
  useEffect(() => {
    const unsubscribe = authStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch Appointments
  const fetchAppointments = useCallback(async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/appointments/peer-counselor/${currentUserId}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('Raw Appointments Response:', response.data);
      
      const today = new Date().toISOString().split('T')[0];
      const todaySchedule = response.data.filter(apt => apt.date === today);
      const futureSchedule = response.data.filter(apt => apt.date > today);
      
      setTodayAppointments(todaySchedule);
      setUpcomingAppointments(futureSchedule);

      // Fetch client details for appointments
      if (todaySchedule.length > 0 || futureSchedule.length > 0) {
        await fetchClientDetails([
          ...todaySchedule.map(apt => apt.clientId),
          ...futureSchedule.map(apt => apt.clientId)
        ]);
      }
    } catch (error) {
      console.error('Comprehensive Appointments Fetch Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Fetch Client Details
  const fetchClientDetails = async (userIds) => {
    // Remove duplicates and filter out invalid IDs
    const uniqueUserIds = [...new Set(userIds)].filter(id => id);

    if (uniqueUserIds.length === 0) {
      console.warn('No user IDs to fetch client details for');
      return;
    }

    try {
      const clientPromises = uniqueUserIds.map(async (userId) => {
        try {
          console.log(`Fetching client details for userId: ${userId}`);
          const response = await axios.get(`http://localhost:5000/api/client/${userId}`, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          console.log(`Client details for ${userId}:`, response.data);
          
          return {
            userId,
            name: response.data.displayName || 'Name not available'
          };
        } catch (clientError) {
          console.error(`Error fetching client ${userId}:`, clientError);
          return {
            userId,
            name: 'Name not available'
          };
        }
      });

      const clientResults = await Promise.all(clientPromises);
      
      const newClients = clientResults.reduce((acc, client) => {
        acc[client.userId] = client.name;
        return acc;
      }, {});

      setClients(prevClients => ({
        ...prevClients,
        ...newClients
      }));
    } catch (error) {
      console.error('Comprehensive Client Fetch Error:', {
        message: error.message,
        response: error.response?.data
      });
    }
  };

  // Fetch appointments when user ID is available
  useEffect(() => {
    if (currentUserId) {
      fetchAppointments();
    }
  }, [currentUserId, fetchAppointments]);

  // Format appointments with client names
  const formatAppointments = (appointments) => 
    appointments.map(apt => ({
      id: apt.id,
      studentName: clients[apt.clientId] || 'Loading...',
      time: apt.time,
      date: apt.date === new Date().toISOString().split('T')[0] ? 'Today' : apt.date,
      status: apt.status || 'Scheduled',
      roomId: apt.roomId
    }));
  
  const todayFormattedAppointments = formatAppointments(todayAppointments);
  const upcomingFormattedAppointments = formatAppointments(upcomingAppointments);

  // Status Toggle Component
  const StatusToggle = () => {
    const statusOptions = ['online', 'away', 'busy', 'offline'];
    
    const handleStatusChange = async (newStatus) => {
      try {
        setPeerStatus(newStatus);
        setIsAvailable(newStatus === 'online');
        
        await axios.put(`http://localhost:5000/api/peer-counselor/status/${currentUserId}`, {
          status: newStatus,
          isAvailable: newStatus === 'online'
        });
      } catch (error) {
        console.error('Error updating status:', error);
      }
    };
  
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

  // Loading and Error States
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

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
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
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
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
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
  );
};

export default PeerDashboard;