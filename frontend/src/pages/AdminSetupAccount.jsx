import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../firebase';
import axios from 'axios';

const AdminSetupAccount = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState({
    username: '',
    college: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
      document.querySelector('header')?.classList.add('hidden');
      document.querySelector('footer')?.classList.add('hidden');
  
      return () => {
        document.querySelector('header')?.classList.remove('hidden');
        document.querySelector('footer')?.classList.remove('hidden');
      };
    }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(
            `http://localhost:5000/api/admin/admin-initial-data/${auth.currentUser.uid}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        setInitialData(response.data);
    };
    fetchInitialData();
  }, []);

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!Object.values(passwordStrength).every(Boolean)) {
      setError('Please meet all password requirements');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/admin/setup-account', {
        uid: user.uid,
        ...formData
      });

      navigate('/admin/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    username: '' || user.username || initialData.username,
    fullName: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    profilePicture: '',
  });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }
  
      try {
        // Create a reference to the storage location
        const storageRef = ref(storage, `profile-photos/${user.uid}`);
        
        // Upload the file
        await uploadBytes(storageRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        
        // Update state with URL
        setImagePreview(URL.createObjectURL(file));
        setFormData({...formData, profilePicture: downloadURL});
      } catch (error) {
        setError('Error uploading image');
        console.error(error);
      }
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-color-3 to-color-5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-color-7">Complete Your Profile</h2>
          <p className="mt-2 text-sm text-gray-600">Please fill in your details below</p>
        </div>
  
        <div className="bg-gray-50 px-4 py-3 rounded-lg">
          <p className="text-sm font-medium text-gray-700">College: 
            <span className="ml-2 text-color-7">{initialData.college}</span>
          </p>
        </div>
  
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-6">
            {/* Username field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-color-5 focus:border-color-5"
                  required
                />
              </div>
            </div>
            {/* Full Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-color-5 focus:border-color-5"
                  required
                />
              </div>
            </div>
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-color-5 focus:border-color-5"
                  required
                />
              </div>
            </div>
            {/* New Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => {
                    setFormData({...formData, newPassword: e.target.value});
                    checkPasswordStrength(e.target.value);
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-color-5 focus:border-color-5"
                  required
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(passwordStrength).map(([rule, isValid]) => (
                    <div key={rule} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={`text-xs ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
                        {rule === 'minLength' && '8+ characters'}
                        {rule === 'hasUpperCase' && 'Uppercase letter'}
                        {rule === 'hasLowerCase' && 'Lowercase letter'}
                        {rule === 'hasNumber' && 'Number'}
                        {rule === 'hasSpecialChar' && 'Special character'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirm Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-color-5 focus:border-color-5"
                  required
                />
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>
            </div>


            {/* Profile picture upload with preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-32 w-32 rounded-full object-cover mb-3"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({...formData, profilePicture: null});
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-color-5 hover:text-color-7">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-color-5 hover:bg-color-7 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-5 disabled:opacity-50"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSetupAccount;