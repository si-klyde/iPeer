import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        const maxDimension = 1200;
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress image to JPEG with 0.7 quality
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.7);
      };
    };
  });
};

const EventModal = ({ 
  isOpen, 
  onClose, 
  isEditing, 
  newEvent, 
  handleInputChange, 
  handleSubmit 
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);


  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      setUploadError(null);
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert('Image size must be less than 10MB');
        e.target.value = ''; // Reset the input
        return;
      }

      try {
        // Compress the image
        const compressedBlob = await compressImage(file);
        
        // Check if compressed size is still too large
        if (compressedBlob.size > maxSize) {
          alert('Image is too large even after compression. Please try a smaller image.');
          e.target.value = '';
          return;
        }

        // Upload to Firebase Storage
        const fileName = `event-photos/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, fileName);
        const metadata = {
          contentType: file.type,
          customMetadata: {
            'uploadedAt': new Date().toISOString()
          }
        };

        const snapshot = await uploadBytes(storageRef, compressedBlob, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Update preview and form state
        setPreviewImage(downloadURL);
        handleInputChange({
          target: {
            name: 'imageUrl',
            value: downloadURL
          }
        });
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
        e.target.value = '';
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="mb-4">
          <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
            {(previewImage || newEvent.imageUrl) ? (
              <img
                src={previewImage || newEvent.imageUrl}
                alt="Event preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                {uploadingImage ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="mt-2">Uploading image...</span>
                  </div>
                ) : (
                  <span>Upload Event Image</span>
                )}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadingImage}
            />
          </div>
          {uploadError && (
            <p className="mt-2 text-sm text-red-500">{uploadError}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">Maximum image size: 10MB</p>
        </div>

          <div>
            <input
              type="text"
              name="title"
              value={newEvent.title}
              onChange={handleInputChange}
              placeholder="Event Title"
              className="custom-input-date mb-4 w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div>
            <textarea
              name="description"
              value={newEvent.description}
              onChange={handleInputChange}
              placeholder="Event Description"
              rows="3"
              className="custom-input-time mb-4 w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <input
              type="date"
              name="date"
              value={newEvent.date}
              onChange={handleInputChange}
              className="custom-input-date mb-4 w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
            <input
              type="time"
              name="time"
              value={newEvent.time}
              onChange={handleInputChange}
              className="custom-input-time mb-4 w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              className="custom-input-date mb-4 w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <input
              type="number"
              name="maxParticipants"
              value={newEvent.maxParticipants}
              onChange={handleInputChange}
              placeholder="Max Participants"
              className="custom-input-date mb-4 w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
            <select
              name="category"
              value={newEvent.category}
              onChange={handleInputChange}
              className="custom-input-date mb-4 w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
            className="w-full p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {isEditing ? 'Update Event' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventModal;