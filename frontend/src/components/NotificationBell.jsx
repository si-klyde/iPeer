import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const NotificationBell = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const unread = response.data.filter(n => !n.read);
      const read = response.data.filter(n => n.read).slice(0, 5); // Get only 5 read notifications

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
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Fetch notifications every minute
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <BellIcon className="h-6 w-6 text-gray-600 hover:text-gray-800" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-60 md-w-96 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-100 z-50 sm:max-w-sm md:max-w-md">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
            {/* Unread Notifications */}
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className="p-4 bg-white hover:bg-gray-50 transition-colors duration-200 cursor-pointer border-l-4 border-blue-500"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon based on notification type */}
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
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            ))}

            {/* No new notifications message */}
            {notifications.length === 0 && (
              <div className="py-12 px-4 bg-gray-50 border-y border-gray-100">
                <div className="text-center">
                  <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No new notifications</h3>
                  <p className="mt-1 text-sm text-gray-500">You're all caught up! Check back later for updates.</p>
                </div>
              </div>
            )}

            {readNotifications.length > 0 && (
              <div className="p-4 bg-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Previously Read</h4>
              </div>
            )}
            {readNotifications.map((notification) => (
              <div 
                key={notification.id}
                className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-start space-x-3">
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
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => navigate('/notifications')}
                className="w-full text-center text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All Notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;