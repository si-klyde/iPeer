import React, { useState, useEffect } from 'react';
import BookingCalendar from './BookingCalendar';
import axios from 'axios';
import API_CONFIG from '../config/api.js';

const PendingAppointments = ({ appointments, clients, peerCounselors, handleAppointmentStatus, handleReschedule, role, fetchAppointments }) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      hourCycle: 'h23' 
  });
  const [processingAppointments, setProcessingAppointments] = useState({});
  const [rescheduledAppointments, setRescheduledAppointments] = useState([]);
  const TIME_SLOTS = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00"
  ];

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
  
    return {
      currentDate: `${year}-${month}-${day}`,
      currentTime: `${hours}:${minutes}`
    };
  };
  

  const formatTo24Hour = (time) => {
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const pendingAppointments = appointments.filter(apt => {
      if (apt.status !== 'pending' && apt.status !== 'pending_reschedule') return false;
      if (apt.date > today) return true;
      if (apt.date === today) {
          return formatTo24Hour(apt.time) > currentTime;
      }
      return false;
  });

  const getUserName = (appointment) => {
    if (role === 'client') {
      return peerCounselors[appointment.peerCounselorId] || 'Loading...';
    }
    return clients[appointment.clientId] || 'Loading...';
  };

  const getUserLabel = () => {
    return role === 'client' ? 'Peer Counselor' : 'Client';
  };

  const handleRescheduleResponse = async (appointmentId, response) => {
    try {
      await axios.put(`${API_CONFIG.BASE_URL}/api/appointments/${appointmentId}/reschedule-response`, {
        response: response // 'accept' or 'decline'
      });
      
      // Refresh appointments after response
      await fetchAppointments();
    } catch (error) {
      console.error('Error responding to reschedule:', error);
    }
  };

  const RescheduleModal = ({ appointment, onClose, onSubmit }) => {
    const [newDate, setNewDate] = useState(null);
    const [newDescription, setNewDescription] = useState('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
  
    const handleSubmit = () => {
      const formattedDate = newDate.toISOString().split('T')[0];
      onSubmit(appointment.id, formattedDate, selectedTime, newDescription);
    };  

    useEffect(() => {
      const fetchAvailableSlots = async () => {
        if (newDate && appointment.peerCounselorId) {
          try {
            const response = await axios.get(
              `${API_CONFIG.BASE_URL}/api/available-slots/${appointment.peerCounselorId}`,
              { params: { date: newDate.toISOString().split('T')[0] } }
            );
            
            if (response.data.availableSlots) {
              setAvailableTimeSlots(response.data.availableSlots);
            }
          } catch (error) {
            console.error('Error fetching slots:', error);
            setAvailableTimeSlots([]);
          }
        }
      };
  
      fetchAvailableSlots();
    }, [newDate, appointment.peerCounselorId]);
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4">Reschedule Appointment</h3>
          
          <BookingCalendar date={newDate} onDateChange={setNewDate} />
          
          <div className="mt-6 space-y-4">
            <label className="text-base font-medium text-gray-700">
              Select Time
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {TIME_SLOTS.map((slot) => {
                const { currentDate, currentTime } = getCurrentDateTime();
                const isTimeSlotPassed = newDate?.toISOString().split('T')[0] === currentDate && slot < currentTime;
                
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    disabled={!availableTimeSlots.includes(slot) || isTimeSlotPassed}
                    className={`py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ${
                      selectedTime === slot
                        ? 'bg-green-500 text-white shadow-lg transform scale-105'
                        : availableTimeSlots.includes(slot) && !isTimeSlotPassed
                          ? 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-400 hover:shadow'
                          : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
              {TIME_SLOTS.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center p-4 sm:p-8 bg-gray-50 rounded-xl border-2 border-gray-200"
                >
                  <div className="text-sm sm:text-base text-gray-600 font-medium">
                    No available time slots for this date
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-gray-500">
                    Please select a different date to view other available slots
                  </div>
                </motion.div>
              )}
            </div>
          </div>
  
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rescheduling Reason
            </label>
            <textarea
              className="w-full p-3 border rounded-lg"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Please provide a reason for rescheduling..."
              rows="3"
            />
          </div>
  
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!newDate || !selectedTime || !newDescription}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Confirm Reschedule
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };
  

  return (
    <div className="space-y-4">
      {pendingAppointments.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">No pending appointments</p>
        </div>
      ) : (
        pendingAppointments.map((appointment) => (
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
                    {getUserLabel()}: {getUserName(appointment)}
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
              {role === 'client' && appointment.status === 'pending' && (
                <p className="text-xs text-gray-500">
                  Thanks for your patience! Your request is under review. 😊
                </p>
              )}
            </div>4

            {appointment.status === 'pending_reschedule' && role === 'client' && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleRescheduleResponse(appointment.id, 'accept')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Accept New Schedule
              </button>
              <button
                onClick={() => handleRescheduleResponse(appointment.id, 'decline')}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Decline
              </button>
            </div>
          )}

          {role === 'peer-counselor' && handleAppointmentStatus && (
              <div className="mt-4 flex gap-2">
                {rescheduledAppointments.includes(appointment.id) ? (
                  <p className="text-green-600 font-medium">Reschedule request sent</p>
                ) : (
                  <>
                    <button
                      onClick={() => handleAppointmentStatus(appointment.id, 'accepted')}
                      disabled={processingAppointments[appointment.id]}
                      className={`bg-green-500 text-white px-6 py-2 rounded-lg transition-colors ${
                        processingAppointments[appointment.id] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
                      }`}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAppointmentStatus(appointment.id, 'declined')}
                      disabled={processingAppointments[appointment.id]}
                      className={`bg-red-500 text-white px-6 py-2 rounded-lg transition-colors ${
                        processingAppointments[appointment.id] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                      }`}
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setIsRescheduling(true);
                      }}
                      disabled={processingAppointments[appointment.id]}
                      className={`bg-yellow-500 text-white px-6 py-2 rounded-lg transition-colors ${
                        processingAppointments[appointment.id] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-600'
                      }`}
                    >
                      Reschedule
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {isRescheduling && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={() => {
            setIsRescheduling(false);
            setSelectedAppointment(null);
          }}
          onSubmit={async (appointmentId, newDate, newTime, newDescription) => {
            setProcessingAppointments(prev => ({ ...prev, [appointmentId]: true }));
            await handleReschedule(appointmentId, newDate, newTime, newDescription);
            setRescheduledAppointments(prev => [...prev, appointmentId]);
            setProcessingAppointments(prev => ({ ...prev, [appointmentId]: false }));
            setIsRescheduling(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
};

export default PendingAppointments;
