import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminPasswordReset from '../components/AdminPasswordReset.jsx';

const AdminProfile = () => {
  const [adminData, setAdminData] = useState({
    fullName: '',
    username: '',
    email: '',
    photoURL: '',
    college: '',
    school: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(
          `http://localhost:5000/api/admin/admin-data/${auth.currentUser.uid}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setAdminData(response.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch admin data');
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await auth.currentUser.getIdToken();
      let photoURL = adminData.photoURL;

      if (photoFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `profile-photos/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }

      const updateData = {
        fullName: adminData.fullName,
        username: adminData.username,
        photoURL
      };

      await axios.put(
        `http://localhost:5000/api/admin/update-profile/${auth.currentUser.uid}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-color-3 flex items-center justify-center">
        <div className="text-xl text-color-7">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            {/* Profile Photo */}
            <div className="relative w-24 sm:w-32">
              <div className="aspect-square rounded-full overflow-hidden ring-4 ring-emerald-100">
                {photoPreview || adminData?.photoURL ? (
                  <img 
                    src={photoPreview || adminData?.photoURL} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-2xl sm:text-4xl font-bold text-emerald-600">
                      {adminData?.fullName?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-2 bg-emerald-600 rounded-full cursor-pointer shadow-lg hover:bg-emerald-700 transition-all duration-300">
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              )}
            </div>
  
            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{adminData?.fullName}</h1>
              <p className="text-sm sm:text-base text-emerald-600 font-medium mt-1">{adminData?.college} Administrator</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">{adminData?.email}</p>
            </div>
  
            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white text-sm sm:text-base rounded-lg sm:rounded-xl 
                hover:bg-emerald-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isEditing ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                )}
              </svg>
              <span className="hidden sm:inline">{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>
  
        {/* Profile Details Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mb-6 sm:mb-8">Profile Information</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              <div className="relative">
                <label className="text-emerald-600 font-semibold mb-2 block">Full Name</label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={adminData?.fullName}
                      onChange={(e) => setAdminData({...adminData, fullName: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 rounded-xl border-2 border-emerald-400
                        focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 
                        text-gray-900 text-base sm:text-lg transition-all duration-300
                        placeholder-gray-400 pr-12"
                    />
                    <svg 
                      className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="px-6 py-4 bg-emerald-50 rounded-xl border-2 border-emerald-100">
                    <p className="text-base sm:text-lg font-medium text-gray-900">{adminData?.fullName}</p>
                  </div>
                )}
              </div>
  
              <div className="relative">
                <label className="text-emerald-600 font-semibold mb-2 block">Username</label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={adminData?.username}
                      onChange={(e) => setAdminData({...adminData, username: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 rounded-xl border-2 border-emerald-400
                        focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 
                        text-gray-900 text-base sm:text-lg transition-all duration-300
                        placeholder-gray-400 pr-12"
                    />
                    <svg 
                      className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="px-6 py-4 bg-emerald-50 rounded-xl border-2 border-emerald-100">
                    <p className="text-base sm:text-lg font-medium text-gray-900">{adminData?.username}</p>
                  </div>
                )}
              </div>
            </div>
  
            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-emerald-600 font-semibold mb-2">Email Address</label>
                <div className="px-6 py-4 bg-gray-50 rounded-xl border-2 border-emerald-100 flex items-center justify-between">
                  <p className="text-base sm:text-lg font-medium text-gray-900">{adminData?.email}</p>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="block text-emerald-600 font-semibold mb-2">School</label>
                <div className="px-6 py-4 bg-gray-50 rounded-xl border-2 border-emerald-100 flex items-center justify-between">
                  <p className="text-base sm:text-lg font-medium text-gray-900">{adminData?.school}</p>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {isEditing && (
            <div className="flex justify-end mt-8">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 
                  transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Save Changes</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
  
        {/* Security Settings Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mb-6 sm:mb-8">Security Settings</h2>
          <AdminPasswordReset />
        </div>
      </div>
    </div>
  );
  
  
  
};

export default AdminProfile;
