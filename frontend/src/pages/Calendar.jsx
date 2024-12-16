  import React, { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import Button from '../components/Button';
  import { additional1, recentPic, upcomingPic } from '../assets';
  import { ongoingPic } from '../assets';

  const Calendar = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [eventDescription, setEventDescription] = useState(''); // For modal form input
    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState('');
    const navigate = useNavigate();

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
      
      <div className="bg-[#E6F4EA] relative w-full h-auto flex flex-col items-center justify-center p-4">
      {/* Wave Background */}
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

        {/* Flex container to align year/month and day grid horizontally */}
        <div className="  flex justify-between w-full max-w-7xl mt-10 ">

            {/* Events Section */}
            <div className='shadow-2xl h-[40rem] w-[45rem] p-10 mb-10 rounded-lg bg-white backdrop-blur-md'>
              
            <h1 className="font-sans text-5xl font-semibold text-center text-black pb-3">
               Events
            </h1>
            <div className= "flex flex-col gap-5 w-[40rem] pb-20">
              {/* Recent Events */}
              <div className="bg-white shadow-md p-6 rounded-md text-white border-2 border-red-500 relative bg-cover bg-center"
              style={{ backgroundImage: `url(${recentPic})` }}>
                <div className="absolute inset-0 bg-red-800 bg-opacity-60 rounded-md"></div> {/* Semi-transparent overlay */}
                <div className="relative z-10">
                <h2 className="text-xl font-semibold mb-3 text-center">Recent Events</h2>
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
              </div>

              {/* Ongoing Events */}
              <div className="bg-white shadow-md p-6 rounded-md text-white border-2 border-green-500   relative bg-cover bg-center"
              style={{ backgroundImage: `url(${ongoingPic})` }}>
              <div className="absolute inset-0 bg-green-800 bg-opacity-60 rounded-md"></div> {/* Semi-transparent overlay */}
              <div className="relative z-10">
                <h2 className="text-xl font-semibold mb-3 text-center">Ongoing Events</h2>
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
              </div>

              {/* Upcoming Events */}
              <div className="bg-white shadow-md p-6 rounded-md text-white border-2 border-blue-500  relative bg-cover bg-center"
              style={{ backgroundImage: `url(${upcomingPic})` }}>
                <div className="absolute inset-0 bg-blue-800 bg-opacity-60 rounded-md"></div> {/* Semi-transparent overlay */}
                <div className="relative z-10">
                <h2 className="text-xl font-semibold mb-3 text-center">Upcoming Events</h2>
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

          </div>
          

            {/*Year, Month, and Days Container */}
            <div className="mt-12  shadow-2xl h-2/5 w-2/5 p-5 rounded-lg bg-green-300 backdrop-blur-md">

              {/* Year and Month Container */}
              <div className="w-full flex items-center justify-between mb-4">
                {/* Year Selector */}
                <select
                  value={selectedDate.getFullYear()}
                  onChange={handleYearChange}
                  className="p-1 text-lg bg-white rounded text-black border border-gray-300"
                >
                  {years.map((year, index) => (
                    <option key={index} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                {/* Month Selector */}
                <select
                  value={months[selectedDate.getMonth()]}
                  onChange={handleMonthChange}
                  className="p-1 text-lg bg-white rounded text-black border border-gray-300"
                >
                  {months.map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-medium text-sm text-gray-700">
                {weekdayNames.map((dayName, index) => (
                  <div key={index} className="p-1">
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-3 mt-5">
                {calendarDays.map((day, i) => (
                  day ? (
                    <div
                      key={i}
                      className={`p-5 rounded shadow cursor-pointer text-sm text-center text-black ${isToday(day) ? 'bg-blue-200 border border-blue-400' : 'bg-white'}`}
                      onClick={() => handleDayClick(day)}
                    >
                      {day}
                    </div>
                  ) : (
                    <div key={i} className="p-2 bg-transparent"></div>
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
              
              <h2 className="text-3xl font-semibold mb-8 text-center">Event Overview</h2>
              
              
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
                    <button 
                    onClick={handleViewEvent}
                    className="bg-green-500 text-white ml-40 py-2 px-8 rounded-lg font-bold transition-transform hover:scale-105">
                      View Event
                    </button>
                  </div>

                </div>

              </div>
            </div>
          </div>



        )}

        <section  className="h-64 w-full" >
          {/* Wave SVG */}
          <div className="absolute bottom-0 left-0 w-full z-10">
                <svg className='w-full h-auto' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                  <path fill="#C1F2B0" fillOpacity="1" d="M0,64L48,90.7C96,117,192,171,288,192C384,213,480,203,576,170.7C672,139,768,85,864,69.3C960,53,1056,75,1152,90.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
          </div>
        </section>
        

      </div>


    );
  };

  export default Calendar;
