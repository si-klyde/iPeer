import { useState, useEffect } from 'react';
import axios from 'axios';
import EventModal from '../components/EventModal';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, authStateChanged, auth } from '../firebase';
import API_CONFIG from '../config/api.js';

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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const [eventsCache, setEventsCache] = useState({
        data: null,
        timestamp: null
    });

    useEffect(() => {
      const unsubscribe = authStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
              try {
                  const response = await axios.get(`${API_CONFIG.BASE_URL}/api/events`, {
                      headers: {
                          Authorization: `Bearer ${await currentUser.getIdToken()}`
                      }
                  });
                  const newData = Array.isArray(response.data) ? response.data : [];
                  setEvents(newData);
                  setEventsCache({
                      data: newData,
                      timestamp: Date.now()
                  });
              } catch (error) {
                  console.error('Error fetching events:', error);
                  setEvents([]);
              }
          }
          setLoading(false);
      });

      return () => unsubscribe();
  }, []);
    
    // Cache duration in milliseconds (e.g., 5 minutes)
    const CACHE_DURATION = 5 * 60 * 1000;

    // Clear cache
    const clearCache = () => {
        setEventsCache({
            data: null,
            timestamp: null
        });
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
      setError(null);

      // Validate required fields
      if (!newEvent.title || !newEvent.date || !newEvent.time) {
        setError("Please fill in all required fields");
        return;
      }

      try {
          if (!user) return;

          const eventData = {
              ...newEvent,
              counselorId: user.uid
          };

          if (isEditing) {
              await axios.put(`${API_CONFIG.BASE_URL}/api/${editingId}`, eventData, {
                  headers: {
                      Authorization: `Bearer ${await user.getIdToken()}`
                  }
              });
          } else {
              await axios.post(`${API_CONFIG.BASE_URL}/api/add-events`, eventData, {
                  headers: {
                      Authorization: `Bearer ${await user.getIdToken()}`
                  }
              });
          }

          // Fetch fresh data after mutation
          const response = await axios.get(`${API_CONFIG.BASE_URL}/api/events`, {
              headers: {
                  Authorization: `Bearer ${await user.getIdToken()}`
              }
          });
          const newData = Array.isArray(response.data) ? response.data : [];
          setEvents(newData);
          setEventsCache({
              data: newData,
              timestamp: Date.now()
          });

          // Reset form
          setNewEvent({
              title: '',
              description: '',
              date: '',
              time: '',
              location: '',
              maxParticipants: '',
              category: '',
              imageUrl: ''
          });
          setIsEditing(false);
          setEditingId(null);
          setIsModalOpen(false);
      } catch (error) {
          setError(error.response?.data?.message || "An error occurred");
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
        await axios.delete(`${API_CONFIG.BASE_URL}/api/${eventToDelete.id}`);
        // Immediately remove the deleted event from state
        setEvents(currentEvents => 
          currentEvents.filter(event => event.id !== eventToDelete.id)
        );
        clearCache();
        setDeleteModalOpen(false);
        setEventToDelete(null);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    };

    const handleImageUpload = async (file) => {
      const fileName = `event-photos/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'uploadedAt': new Date().toISOString()
        }
      };
    
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    };
  
    return (
      <div className="container mx-auto p-4 min-h-screen bg-white">
          {loading ? (
              <div className="flex justify-center items-center min-h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
          ) : (
              <>
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
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                      >
                          Add New Event
                      </button>
                  </div>

                
                  {currentEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No Events Added Yet</h3>
                      <p className="text-gray-500 text-center mb-6">Get started by creating your first mental health event.</p>
                  </div>
              ) : (
                <>
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
                </>
              )}
            </>
          )}

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