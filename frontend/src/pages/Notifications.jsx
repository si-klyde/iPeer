import { useState, useEffect } from 'react';
import { BellIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const navigate = useNavigate();

  const handleNotificationClick = async (notification) => {
    try {
      await markAsRead(notification.id);

      // Navigate based on notification type and user role
      if (notification.type.includes('APPOINTMENT')) {
        if (user?.role === 'peer-counselor') {
          if (notification.type === 'NEW_APPOINTMENT_REQUEST') {
            navigate('/appointments/peer-counselor', { 
              state: { 
                notificationId: notification.id,
                appointmentId: notification.appointmentId 
              }
            });
          } else if (notification.type === 'APPOINTMENT_ACCEPTED' || notification.type === 'APPOINTMENT_REMINDER') {
            navigate('/appointments/peer-counselor', { 
              state: { 
                notificationId: notification.id,
                appointmentId: notification.appointmentId 
              }
            });
          }
        } else {
          if (notification.type === 'APPOINTMENT_REQUEST' || notification.type === 'APPOINTMENT_REMINDER') {
            navigate('/appointments/client', { 
              state: { 
                notificationId: notification.id,
                appointmentId: notification.appointmentId 
              }
            });
          } else if (notification.type === 'APPOINTMENT_ACCEPTED') {
            navigate('/appointments/client', { 
              state: { 
                notificationId: notification.id,
                appointmentId: notification.appointmentId 
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // Add click handler for read notifications too
  const handleReadNotificationClick = async (notification) => {
    try {
      if (notification.type.includes('APPOINTMENT')) {
        if (user?.role === 'peer_counselor') {
          navigate('/appointments/peer-counselor');
        } else {
          navigate('/appointments/client');
        }
      }
    } catch (error) {
      console.error('Error handling read notification click:', error);
    }
  };

  const fetchAllNotifications = async () => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("Notifications response:", response.data); // Add this line
    
      
      const unread = response.data.filter(n => !n.read);
      const read = response.data.filter(n => n.read);

      setNotifications(unread);
      setReadNotifications(read);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      await axios.put(`http://localhost:5000/api/notifications/${notificationId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchAllNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllNotifications();
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <BellIcon className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
          {notifications.length} New
        </span>
      </div>

      <div className="space-y-4">
        {/* Unread Notifications Section */}    
        {notifications.map((notification) => (
        <div 
            key={notification.id}
            className="p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer transform hover:scale-[1.01] border-l-4 border-green-500"
            onClick={() => handleNotificationClick(notification)}
        >
            <div className="flex items-start space-x-4">
                {notification.type === 'APPOINTMENT_REQUEST' && (
                    <CalendarIcon className="h-6 w-6 text-blue-500 mt-1" />
                )}
                {notification.type === 'NEW_APPOINTMENT_REQUEST' && (
                    <CalendarIcon className="h-6 w-6 text-blue-500 mt-1" />
                )}
                {notification.type === 'APPOINTMENT_ACCEPTED' && (
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1" />
                )}
                {notification.type === 'APPOINTMENT_DECLINED' && (
                    <XCircleIcon className="h-6 w-6 text-red-500 mt-1" />
                )}
            <div className="flex-1">
                <p className="font-bold text-gray-900">{notification.title}</p>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {new Date(notification.createdAt._seconds * 1000).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                </p>
            </div>
            </div>
        </div>
        ))}


        {/* No Notifications Message */}
        {notifications.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
              <p className="mt-2 text-gray-500">You have no new notifications at the moment.</p>
            </div>
          </div>
        )}

        {/* Read Notifications Section */}
        {readNotifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700">Previous Notifications</h2>
            </div>
            <div className="divide-y divide-gray-100">
            {readNotifications.map((notification) => (
                <div 
                key={notification.id}
                className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
                >
                <div className="flex items-start space-x-4">
                    {notification.type === 'APPOINTMENT_REQUEST' && (
                        <CalendarIcon className="h-6 w-6 text-gray-500 mt-1" />
                    )}
                    {notification.type === 'NEW_APPOINTMENT_REQUEST' && (
                        <CalendarIcon className="h-6 w-6 text-blue-500 mt-1" />
                    )}
                    {notification.type === 'APPOINTMENT_ACCEPTED' && (
                        <CheckCircleIcon className="h-6 w-6 text-gray-500 mt-1" />
                    )}
                    {notification.type === 'APPOINTMENT_DECLINED' && (
                        <XCircleIcon className="h-6 w-6 text-gray-500 mt-1" />
                    )}
                    {notification.type === 'APPOINTMENT_REMINDER' && (
                      <CalendarIcon className="h-6 w-6 text-yellow-500 mt-1" />
                    )}
                    <div className="flex-1">
                    <p className="font-medium text-gray-700">{notification.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt._seconds * 1000).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                        })}
                    </p>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;