import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion } from 'framer-motion';

const calendarStyles = `
  .react-calendar {
    width: 100%;
    max-width: 600px;
    background: white;
    border: 2px solid #508D4E;
    border-radius: 1.5rem;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    padding: clamp(1rem, 4vw, 2rem);
    margin: 0 auto;
    transition: all 0.3s ease;
  }

  @media (max-width: 640px) {
    .react-calendar {
      border-radius: 1rem;
      max-width: 100%;
    }
  }

  .react-calendar:hover {
    border-color: #4ADE80;
    transform: translateY(-4px);
  }

  @media (max-width: 640px) {
    .react-calendar:hover {
      transform: translateY(-2px);
    }
  }

  .react-calendar__navigation {
    display: flex;
    margin-bottom: clamp(1rem, 3vw, 2rem);
    padding: 0 clamp(0.5rem, 2vw, 1rem);
    justify-content: space-between;
  }

  .react-calendar__navigation button {
    min-width: clamp(36px, 8vw, 44px);
    min-height: clamp(36px, 8vw, 44px);
    background: none;
    font-size: clamp(1rem, 3vw, 1.2rem);
    color: #508D4E;
    font-weight: 600;
    border-radius: 0.75rem;
    transition: all 0.3s ease;
  }

  .react-calendar__month-view__weekdays {
    background-color: #F7F9ED;
    border-radius: 1rem;
    padding: clamp(0.5rem, 2vw, 0.75rem);
    margin-bottom: clamp(1rem, 3vw, 1.5rem);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .react-calendar__month-view__weekdays__weekday {
    font-size: clamp(0.75rem, 2vw, 0.95rem);
    font-weight: 600;
    color: #508D4E;
    padding: clamp(0.5rem, 2vw, 0.75rem);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .react-calendar__tile {
    padding: clamp(0.75rem, 3vw, 1.75rem);
    font-size: clamp(0.9rem, 2.5vw, 1.1rem);
    color: #3F3A52;
    transition: all 0.3s ease;
    border-radius: 0.75rem;
    position: relative;
    height: clamp(50px, 10vw, 75px);
    margin: 2px;
    font-weight: 500;
  }

  @media (max-width: 480px) {
    .react-calendar__tile {
      padding: 0.5rem;
      height: 40px;
    }
  }

  .react-calendar__tile:enabled:hover {
    background-color: #F7F9ED;
    color: #508D4E;
    font-weight: 600;
    transform: scale(1.1);
    z-index: 2;
  }

  @media (max-width: 640px) {
    .react-calendar__tile:enabled:hover {
      transform: scale(1.05);
    }
  }

  .react-calendar__tile--now {
    background: #FEFAE0;
    border-radius: 0.75rem;
    font-weight: 600;
    border: 2px solid #508D4E;
  }

  .react-calendar__tile--active {
    background: #508D4E !important;
    color: white !important;
    border-radius: 0.75rem;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(80, 141, 78, 0.3);
    transform: scale(1.05);
  }

  .react-calendar__tile--active:enabled:hover {
    background: #467C44 !important;
    transform: scale(1.1);
  }

  @media (max-width: 640px) {
    .react-calendar__tile--active:enabled:hover {
      transform: scale(1.05);
    }
  }

  .react-calendar__tile:disabled {
    background-color: #f1f1f1;
    color: #b5b5b5;
    cursor: not-allowed;
    opacity: 0.8;
    text-decoration: line-through;
    font-style: italic;
  }

  .react-calendar__tile:disabled:hover {
    background-color: #f1f1f1;
    transform: none;
  }

  .react-calendar__month-view__days__day--weekend:not(.react-calendar__tile--active) {
    color: #E57373;
    font-weight: 500;
  }
`;

const BookingCalendar = ({ date, onDateChange }) => {
    const formatSelectedDate = (dateToFormat) => {
        const dateObj = dateToFormat instanceof Date ? dateToFormat : new Date(dateToFormat);
        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    const handleDateChange = (newDate) => {
        if (!(newDate instanceof Date)) {
            newDate = new Date(newDate);
        }
        const year = newDate.getFullYear();
        const month = newDate.getMonth();
        const day = newDate.getDate();
        const localDate = new Date(year, month, day, 12, 0, 0, 0);
        onDateChange(localDate);
    };

    const tileDisabled = ({ date, view }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date < today) {
            return true;
        }

        if (date.getDay() === 0 || date.getDay() === 6) {
            return true;
        }

        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
        if (date > twoYearsFromNow) {
            return true;
        }

        return false;
    };

    const currentDate = date ? (date instanceof Date ? date : new Date(date)) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-6 w-full px-4 sm:px-6 md:px-8"
        >
            <style>{calendarStyles}</style>
            <label className="text-lg md:text-xl font-semibold text-gray-700 block mb-4">
                Select Date
            </label>
            
            {currentDate && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 sm:p-4 bg-color-2 rounded-lg sm:rounded-xl shadow-lg mb-4 sm:mb-6 hover:shadow-xl transition-shadow"
                >
                    <p className="text-base sm:text-lg font-medium text-gray-800">
                        Selected Date: {formatSelectedDate(currentDate)}
                    </p>
                </motion.div>
            )}

            <Calendar
                onChange={handleDateChange}
                value={currentDate || new Date()}
                tileDisabled={tileDisabled}
                navigationLabel={({ date }) => 
                    date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                }
                formatShortWeekday={(locale, date) => 
                    date.toLocaleDateString('en-US', { weekday: 'short' })
                }
                className="shadow-lg"
                minDetail="month"
                maxDetail="month"
                calendarType="gregory"
            />
        </motion.div>
    );
};

export default BookingCalendar;