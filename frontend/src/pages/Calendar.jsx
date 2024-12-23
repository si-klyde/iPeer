import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { additional1, recentPic, upcomingPic, ongoingPic } from '../assets';

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [calendarEvents, setCalendarEvents] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        const eventsData = {};
        
        response.data.forEach(event => {
          const [year, month, day] = event.date.split('-');
          const [hours, minutes] = event.time ? event.time.split(':') : ['00', '00'];
          const eventDate = new Date(year, month - 1, day, hours, minutes);
          const dayKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
          
          if (!eventsData[dayKey]) {
            eventsData[dayKey] = [];
          }
          eventsData[dayKey].push({
            ...event,
            fullDate: eventDate
          });
        });
        
        setCalendarEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
  
    fetchEvents();
  }, []);  

  const handleViewEvent = () => {
    navigate('/viewevent');
  };

  // Get today's date for highlighting the current day
  const today = new Date();
  const isToday = (day) => (
    day === today.getDate() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getFullYear() === today.getFullYear()
  );

  // Month and Year Data
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const years = Array.from({ length: 10 }, (_, i) => selectedDate.getFullYear() - 5 + i);

  const events = {
    recent: ['Event 1', 'Event 2'],
    ongoing: ['Event 3'],
    upcoming: ['Event 4', 'Event 5']
  };

  const handleMonthChange = (e) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(months.indexOf(e.target.value));
    setSelectedDate(newDate);
  };

  const handleYearChange = (e) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(e.target.value);
    setSelectedDate(newDate);
  };

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  // Weekday names
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Get the first day of the current month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

  // Create calendar days array
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Handle day click to open modal
  const handleDayClick = (day) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  // Close modals
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDay(null);
  };

  const handleCloseEventModal = () => {
    setEventModalOpen(false);
    setSelectedEvent('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E6F4EA] to-[#C1F2B0] p-8 relative">
      {/* Top wave */}
      <div className="absolute top-0 left-0 w-full z-0">
        <svg 
          className="w-full h-auto transform rotate-180" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320"
        >
          <path 
            fill="#C1F2B0" 
            fillOpacity="1" 
            d="M0,64L48,90.7C96,117,192,171,288,192C384,213,480,203,576,170.7C672,139,768,85,864,69.3C960,53,1056,75,1152,90.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-20">
        {/* Main Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 order-2 lg:order-1">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Calendar</h2>
            
            {/* Year and Month Selectors */}
            <div className="flex justify-between mb-6">
              <select
                value={selectedDate.getFullYear()}
                onChange={handleYearChange}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={months[selectedDate.getMonth()]}
                onChange={handleMonthChange}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {months.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Weekday Headers */}
              {weekdayNames.map((day) => (
                <div key={day} className="text-center py-2 text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {calendarDays.map((day, i) => {
                const currentDateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${day}`;
                return day ? (
                  <div
                    key={i}
                    onClick={() => handleDayClick(day)}
                    className={`
                      min-h-[80px] p-2 rounded-lg cursor-pointer transition-all
                      ${isToday(day) 
                        ? 'bg-green-100 border-2 border-green-500' 
                        : 'bg-gray-50 hover:bg-green-50'}
                    `}
                  >
                    <div className="text-right text-sm font-medium text-gray-700">{day}</div>
                    {calendarEvents[currentDateKey]?.map((event, index) => (
                      <div
                        key={index}
                        className="mt-1 text-xs p-1 bg-green-200 rounded truncate hover:bg-green-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Event clicked");
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div key={i} className="min-h-[80px]" />
                );
              })}
            </div>
          </div>

          {/* Events Section */}
          <div className="space-y-6 order-1 lg:order-2">
            <h2 className="text-3xl font-semibold text-gray-800">Events</h2>
            
            {/* Recent Events Card */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${recentPic})` }} />
              <div className="relative bg-gradient-to-r from-red-800/80 to-red-600/80 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Events</h3>
                <ul className="space-y-2">
                  {events.recent.map((event, i) => (
                    <li
                      key={i}
                      className="text-white hover:text-red-200 cursor-pointer transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      {event}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Ongoing Events Card */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${ongoingPic})` }} />
              <div className="relative bg-gradient-to-r from-green-800/80 to-green-600/80 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Ongoing Events</h3>
                <ul className="space-y-2">
                  {events.ongoing.map((event, i) => (
                    <li
                      key={i}
                      className="text-white hover:text-green-200 cursor-pointer transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      {event}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Upcoming Events Card */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${upcomingPic})` }} />
              <div className="relative bg-gradient-to-r from-blue-800/80 to-blue-600/80 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Upcoming Events</h3>
                <ul className="space-y-2">
                  {events.upcoming.map((event, i) => (
                    <li
                      key={i}
                      className="text-white hover:text-blue-200 cursor-pointer transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      {event}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Day Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 relative m-4">
            <button 
              onClick={handleCloseModal} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              ×
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Events for {months[selectedDate.getMonth()]} {selectedDay}</h2>
            <div className="bg-gray-50 rounded-lg p-4 h-[400px] overflow-y-auto">
              {calendarEvents[`${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDay}`]?.length > 0 ? (
                calendarEvents[`${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDay}`].map((event, index) => {
                  const colorSchemes = [
                    { bg: 'bg-red-50', border: 'border-red-200', title: 'text-red-600', hover: 'hover:bg-red-100' },
                    { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-600', hover: 'hover:bg-blue-100' },
                    { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-600', hover: 'hover:bg-green-100' },
                    { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-600', hover: 'hover:bg-purple-100' },
                    { bg: 'bg-orange-50', border: 'border-orange-200', title: 'text-orange-600', hover: 'hover:bg-orange-100' }
                  ];
                  
                  const colorScheme = colorSchemes[index % colorSchemes.length];
                  
                  return (
                    <div 
                      key={index} 
                      className={`mb-4 p-4 rounded-lg border-2 shadow-md transition-all 
                      ${colorScheme.bg} ${colorScheme.border} ${colorScheme.hover}`}
                    >
                      <h3 className={`text-xl font-semibold mb-2 ${colorScheme.title}`}>
                        {event.title}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium">Time:</span> {
                            event.time || 
                            (event.fullDate ? event.fullDate.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            }) : 'Time not specified')
                          }
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Description:</span> {event.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-8">No events scheduled for this day</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-8 relative m-4">
            <button 
              onClick={handleCloseEventModal} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              ×
            </button>
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-center">{selectedEvent}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative h-[300px] rounded-xl overflow-hidden">
                  <img 
                    src={additional1} 
                    alt="Event" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-end p-6">
                  <h3 className="text-white text-xl font-bold">Find a NAMIWalk</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-bold">A GENEtle Reminder</h3>
                  <p className="text-gray-600">
                    Stay tuned for our uplifting weekly activities this month—safe spaces to grow, share,
                    and find comfort in community. Healing is a journey, and every step is worth celebrating! 👣
                  </p>
                  <button
                    onClick={handleViewEvent}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    View Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 w-full z-0">
        <svg 
          className="w-full h-auto" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320"
        >
          <path 
            fill="#C1F2B0" 
            fillOpacity="1" 
            d="M0,64L48,90.7C96,117,192,171,288,192C384,213,480,203,576,170.7C672,139,768,85,864,69.3C960,53,1056,75,1152,90.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Calendar;