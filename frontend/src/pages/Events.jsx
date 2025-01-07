import { useState, useEffect } from 'react';
import axios from 'axios';
import EventModal from '../components/EventModal';

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
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

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
          await axios.put(`http://localhost:5000/api/${editingId}`, newEvent);
        } else {
          await axios.post('http://localhost:5000/api/add-events', newEvent);
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
  
    return (
        <div className="container mx-auto p-4 min-h-screen bg-white">
          <h1 className="text-3xl font-bold mb-6 text-center text-black">Mental Health Event Catalog</h1>

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
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
                Add New Event
            </button>
          </div>

          {/* Events List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {currentEvents.map(event => (
              <div key={event.id} 
                   className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-100 overflow-hidden">
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
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 
                               transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event)}
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
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 hover:bg-blue-600 transition-colors duration-200"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-white text-n-8/80 rounded-lg shadow-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 hover:bg-blue-600 transition-colors duration-200"
            >
              Next
            </button>
          </div>

          <EventModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            isEditing={isEditing}
            newEvent={newEvent}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />

          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setEventToDelete(null);
            }}
            onConfirm={confirmDelete}
            eventName={eventToDelete?.title || ''}
          />
        </div>
    );
};

export default EventCatalog;