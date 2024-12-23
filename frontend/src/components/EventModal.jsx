import React from 'react';

const EventModal = ({ 
  isOpen, 
  onClose, 
  isEditing, 
  newEvent, 
  handleInputChange, 
  handleSubmit 
}) => {
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
              rows="4"
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

export default EventModal;