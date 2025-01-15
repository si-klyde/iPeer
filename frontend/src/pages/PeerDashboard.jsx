import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, authStateChanged } from '../firebase';
import { Calendar, ChevronRight } from 'lucide-react';
import axios from 'axios';

// Add DeleteConfirmationModal component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, eventName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Event</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{eventName}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Add ViewEventModal component after DeleteConfirmationModal
const ViewEventModal = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="h-48 bg-gray-100 overflow-hidden rounded-lg">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
          </div>

          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Date</h3>
                  <p className="text-gray-600">{event.date}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Time</h3>
                  <p className="text-gray-600">{event.time}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Location</h3>
                  <p className="text-gray-600">{event.location}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Category</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {event.category}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{event.description}</p>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-gray-700">Maximum Participants</h3>
                <p className="text-gray-600">{event.maxParticipants}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [events, setEvents] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedViewEvent, setSelectedViewEvent] = useState(null);

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
            name: response.data.fullName || 'Name not available'
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

  // Fetch Events
  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // Format the events to match the Events.jsx structure
      const formattedEvents = response.data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        category: event.category,
        maxParticipants: event.maxParticipants,
        imageUrl: event.imageUrl
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, []);

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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

  // Format events
  const formatEvents = (events) => 
    events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location
    }));

  const formattedEvents = formatEvents(events);

  // Status Toggle Component
  const StatusToggle = () => {
    const statusOptions = ['online', 'busy'];
    
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
      <div className="lg:flex items-center sm:grid-flow-row md:grid-flow-row space-x-4  space-y-3 mb-6 bg-white p-4 rounded-lg shadow">
        <span className="font-medium">Status:</span>
        <div className="flex space-x-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-4 py-2 rounded-full text-sm capitalize text-black
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

  const handleDelete = async (event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/${eventToDelete.id}`);
      setDeleteModalOpen(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleViewEvent = (event) => {
    setSelectedViewEvent(event);
    setViewModalOpen(true);
  };

  // Loading and Error States
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-black">Loading dashboard...</div>
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
    <div className="container mx-auto p-6 space-y-6 text-black sm:p-4 md:p-5 sm:w-auto md:w-auto">
      <StatusToggle />
      
      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">Today's Schedule</h2>
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
                      <p className="font-medium text-black">{appointment.studentName}</p>
                      <p className="text-sm text-black">
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
                    {/* <button 
                      onClick={() => navigate(`/peer/client-history/${appointment.id}`)}
                      className="px-3 py-1 text-sm text-black hover:text-gray-900
                              transition-colors duration-200"
                    >
                      View History
                    </button> */}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="text-lg text-black">Your schedule is clear today! 🌟</p>
                <p className="text-sm text-black">Time for a coffee break?</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">Upcoming Appointments</h2>
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
                      <p className="font-medium text-black">{appointment.studentName}</p>
                      <p className="text-sm text-black">
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
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="text-lg text-black">No upcoming appointments yet! ✨</p>
                <p className="text-sm text-black">Your future schedule is wide open</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events Management */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">Events Management</h2>
            <button 
              onClick={() => navigate('/event')}
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center"
            >
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-black">{event.title}</p>
                      <p className="text-sm text-black">
                        {event.time} - {event.date} at {event.location}
                      </p>
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewEvent(event)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md
                              hover:bg-gray-50 transition-colors duration-200"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="text-lg text-black">No events scheduled yet! ✨</p>
                <p className="text-sm text-black">Check back later for upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEventToDelete(null);
        }}
        onConfirm={confirmDelete}
        eventName={eventToDelete?.name || ''}
      />

      <ViewEventModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedViewEvent(null);
        }}
        event={selectedViewEvent}
      />
    </div>
  );
};

export default PeerDashboard;