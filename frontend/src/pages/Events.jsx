import { useState, useEffect } from 'react';
import axios from 'axios';

const EventCatalog = () => {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      maxParticipants: '',
      category: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 10;
    
    // Calculate current events to display
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
    
    // Calculate total pages
    const totalPages = Math.ceil(events.length / eventsPerPage);

    // Add pagination controls
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
      fetchEvents();
    }, []);
  
    const fetchEvents = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/events');
          setEvents(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          console.error('Error fetching events:', error);
          setEvents([]); 
        }
    };  
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewEvent(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (isEditing) {
          await axios.put(`http://localhost:5000/api/events/${editingId}`, newEvent);
        } else {
          await axios.post('http://localhost:5000/api/events', newEvent);
        }
        setNewEvent({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          maxParticipants: '',
          category: ''
        });
        setIsEditing(false);
        setEditingId(null);
        setIsModalOpen(false);
        fetchEvents();
      } catch (error) {
        console.error('Error saving event:', error);
      }
    };
  
    const handleEdit = (event) => {
      setIsEditing(true);
      setEditingId(event.id);
      setNewEvent({
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        maxParticipants: event.maxParticipants,
        category: event.category
      });
      setIsModalOpen(true);
    };
  
    const handleDelete = async (eventId) => {
      try {
        await axios.delete(`http://localhost:5000/api/events/${eventId}`);
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    };

    const EventModal = ({ isOpen, onClose, event, isEditing, onSubmit }) => {
      if (!isOpen) return null;

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  placeholder="Event Title"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                  placeholder="Event Description"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
                <input
                  type="time"
                  name="time"
                  value={newEvent.time}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  name="location"
                  value={newEvent.location}
                  onChange={handleInputChange}
                  placeholder="Location"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="maxParticipants"
                  value={newEvent.maxParticipants}
                  onChange={handleInputChange}
                  placeholder="Max Participants"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
                <select
                  name="category"
                  value={newEvent.category}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="support-group">Support Group</option>
                  <option value="therapy-session">Therapy Session</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold 
                         transform transition-all duration-200 hover:bg-blue-700 hover:scale-105 
                         active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {isEditing ? 'Update Event' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      );
    };
  
    return (
        <div className="container mx-auto p-4 min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Mental Health Event Catalog</h1>

          <div className="flex justify-end mb-6">
            <button
                onClick={() => {
                setIsModalOpen(true);
                setIsEditing(false);
                setNewEvent({
                    title: '',
                    description: '',
                    date: '',
                    time: '',
                    location: '',
                    maxParticipants: '',
                    category: ''
                });
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
                Add New Event
            </button>
          </div>

          {/* Events List */}
          <div className="grid grid-cols-1 gap-6">
            {currentEvents.map(event => (
              <div key={event.id} 
                   className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-200 hover:scale-105">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{event.title}</h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {event.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                      </svg>
                      {event.date} at {event.time}
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                      </svg>
                      {event.location}
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                      </svg>
                      Max Participants: {event.maxParticipants}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => handleEdit(event)}
                      className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 
                               transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 
                               transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      
          {/* Pagination Controls */}
          <div className="flex justify-center mt-8 space-x-4">
            <button 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600 transition-colors duration-200"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-white rounded-lg shadow">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600 transition-colors duration-200"
            >
              Next
            </button>
          </div>

          <EventModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            event={newEvent}
            isEditing={isEditing}
            onSubmit={handleSubmit}
          />
        </div>
    );
};

export default EventCatalog;