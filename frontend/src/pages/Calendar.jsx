import React, { useState } from 'react';
import Button from '../components/Button';
import { aboutThird, additional1, additional2, infoImage, infoImage2 } from '../assets';

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventDescription, setEventDescription] = useState(''); // For modal form input
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');

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

  // Mock Event Data (added event per day as an example)      
  const eventsPerDay = {
    1: 'Event A',
    3: 'Event B',
    7: 'Event C',
    12: 'Event D',
    15: 'Event E',
    20: 'Event F',
    25: 'Event G'
  };

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

  // Create the calendar days, including empty spaces for days before the 1st
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null); // Placeholder for empty days
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Handle day click to open modal and set "Lorem Ipsum" as description
  const handleDayClick = (day) => {
    setSelectedDay(day);
    setEventDescription("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.");
    setIsModalOpen(true);
  };

  // Handle event click to open event modal
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  // Close modals
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDay(null);
    setEventDescription('');
  };

  const handleCloseEventModal = () => {
    setEventModalOpen(false);
    setSelectedEvent('');
  };

  return (
    <div 
      className="relative w-full h-auto flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(to bottom, #E6F4EA, #ffffff)' }} // Green-to-white gradient background
    >
      <h1 className="bg-clip-text font-sans mb-8 mt-10 text-5xl font-semibold text-center text-black">
        Calendar
      </h1>

      {/* Flex container to align year/month and day grid horizontally */}
      <div className="flex justify-between w-full max-w-7xl gap-10 pb-15">
        {/* Year and Month Container + Events */}
        <div className="flex flex-col items-center gap-8 w-1/4">
          {/* Year and Month Container */}
          <div className="shadow-xl w-full p-6 rounded-md flex flex-col items-center bg-green-600 bg-opacity-50 backdrop-blur-lg">
            {/* Year Selector */}
            <select 
              value={selectedDate.getFullYear()} 
              onChange={handleYearChange}
              className="p-2 mb-4 w-full text-lg bg-white rounded-md text-black"
            >
              {years.map((year, index) => (
                <option key={index} value={year}>{year}</option>
              ))}
            </select>

            {/* Month Selector */}
            <select 
              value={months[selectedDate.getMonth()]} 
              onChange={handleMonthChange}
              className="p-2 w-full text-lg bg-white rounded-md text-black"
            >
              {months.map((month, index) => (
                <option key={index} value={month}>{month}</option>
              ))}
            </select>
          </div>

          {/* Events Section */}
          <div className="flex flex-col gap-6 w-full">
            {/* Recent Events */}
            <div className="bg-white shadow-md p-6 rounded-md text-red-400 border-2 border-red-500">
              <h2 className="text-xl font-semibold mb-3">Recent Events</h2>
              <ul>
                {events.recent.map((event, i) => (
                  <li 
                    key={i} 
                    className="p-1 cursor-pointer hover:underline"
                    onClick={() => handleEventClick(event)}
                  >
                    {event}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ongoing Events */}
            <div className="bg-white shadow-md p-6 rounded-md text-color-5 border-2 border-green-500">
              <h2 className="text-xl font-semibold mb-3">Ongoing Events</h2>
              <ul>
                {events.ongoing.map((event, i) => (
                  <li 
                    key={i} 
                    className="p-1 cursor-pointer hover:underline"
                    onClick={() => handleEventClick(event)}
                  >
                    {event}
                  </li>
                ))}
              </ul>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white shadow-md p-6 rounded-md text-blue-400 border-2 border-blue-500">
              <h2 className="text-xl font-semibold mb-3">Upcoming Events</h2>
              <ul>
                {events.upcoming.map((event, i) => (
                  <li 
                    key={i} 
                    className="p-1 cursor-pointer hover:underline"
                    onClick={() => handleEventClick(event)}
                  >
                    {event}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Days Container */}
        <div className="shadow-xl w-3/4 p-8 rounded-md bg-green-600 bg-opacity-50 backdrop-blur-lg">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-4 text-center font-semibold text-3xl">
            {weekdayNames.map((dayName, index) => (
              <div key={index} className="p-2 text-black">
                {dayName}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-4 text-center mt-4">
            {calendarDays.map((day, i) => (
              day ? (
                <div 
                  key={i} 
                  className={`p-4 rounded shadow-md cursor-pointer h-24 text-black hover:scale-110 transition-transform duration-200 ease-in-out ${isToday(day) ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white'}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div>{day}</div>
                  <div className="text-sm text-green-600 truncate"> 
                    {eventsPerDay[day] || ''}
                  </div>
                </div>
              ) : (
                <div key={i} className="p-4 bg-transparent h-24"></div>
              )
            ))}
          </div>
        </div>
        
      </div>

      {/* Modal for event of the day */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-950 bg-opacity-50">
          <div className="bg-white p-8 rounded shadow-lg w-3/4 h-3/4 relative text-color-5">
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 text-2xl font-bold text-white bg-green-500 rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-transform duration-200 ease-in-out"
              onClick={handleCloseModal}
            >
              &times;
            </button>
            
            <h2 className="text-3xl font-semibold mb-4">Event for Day {selectedDay}</h2>
            
            {/* Large textarea for description (non-editable) */}
            <textarea 
              id="eventDescription"
              value={eventDescription}
              readOnly
              className="w-full h-3/4 p-4 border border-green-500 rounded-md text-lg text-black bg-gray-100"
              placeholder="Lorem ipsum dolor sit amet..." 
            />
          </div>
        </div>
      )}

      {/* Modal for individual events */}
      {/* Modal for individual events */}
      {eventModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-950 bg-opacity-50">
          <div className="bg-white p-8 rounded shadow-lg w-3/4 h-3/4 relative text-color-5 overflow-y-auto">
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 text-2xl font-bold text-white bg-green-500 rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-transform duration-200 ease-in-out"
              onClick={handleCloseEventModal}
            >
              &times;
            </button>
            
            <h2 className="text-3xl font-semibold mb-8 text-center">Event Details</h2>
            
            
              {/* Display selected event details */}
              <div className="text-lg text-black bg-gray-100 p-6 rounded-md border-2 border-green-500 mb-8">
              <div className="align-center mb-2 text-xl font-sans text-black p-3 inline-block rounded-full border border-green-500">
               {selectedEvent}
              </div>

                {/* Wrapper for horizontal alignment */}
                <div className="flex flex-col lg:flex-row items-center lg:items-start w-full space-y-8 lg:space-y-0 lg:space-x-8">

                {/* Image with overlay text */}
                <div className="relative w-full lg:w-1/2 h-96 max-w-lg overflow-hidden bg-white rounded-lg shadow-xl">
                  <img 
                    src={additional1} 
                    alt="Find a NAMIWalk" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#00a7a233] bg-opacity-20 flex flex-col justify-end p-6 transition-opacity hover:bg-opacity-70">
                    <h3 className="text-black text-2xl font-bold mb-2 text-center">Find a NAMIWalk</h3>
                  </div> 
                </div>

                {/* Text content and CTA button */}
                <div className="flex flex-col items-start w-full lg:w-1/2 space-y-4 text-black max-w-lg">
                  <p className="text-5xl font-bold leading-tight mt-7">
                    A GENEtle Reminder
                  </p>
                  <p className="text-md text-gray-700 pb-5">
                  Stay tuned for our uplifting weekly activities this month—safe spaces to grow, share, 
                  and find comfort in community. Healing is a journey, and every step is worth celebrating!👣
                  </p>
                  <button className="bg-green-500 text-white ml-40 py-2 px-8 rounded-lg font-bold transition-transform hover:scale-105">
                    View Event
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Calendar;
