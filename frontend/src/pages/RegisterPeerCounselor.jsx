import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const RegisterPeerCounselor = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [invitationData, setInvitationData] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    const validateInvitation = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/admin/validate-invitation/${token}`
        );
        setInvitationData(response.data);
        setEmail(response.data.email);
        setSelectedCollege(response.data.college);
        setSelectedSchool(response.data.school);
      } catch (error) {
        navigate('/');
      }
    };
  
    if (token) {
      setInviteToken(token);
      validateInvitation();
    }
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

  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (!firstName || !lastName || !email || !password || !selectedSchool || !selectedCollege || !inviteToken) {
      setErrorMessage('All required fields must be filled.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (!Object.values(passwordStrength).every(Boolean)) {
      setErrorMessage('Please meet all password requirements');
      return;
    }
    
    const fullName = `${firstName} ${middleInitial ? middleInitial + '.' : ''} ${lastName}`.trim();
    
    setLoading(true);
    setErrorMessage('');
  
    try {
      // First create the user account
      const response = await axios.post(
        'http://localhost:5000/api/register-peer-counselor',
        {
          email,
          password,
          fullName,
          school: selectedSchool,
          college: selectedCollege,
          inviteToken
        }
      );

      toast.success('Registration successful! Redirecting to login...', {
        position: "top-center",
        autoClose: 2000
      });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(error.response?.data?.error || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent px-4 py-6">
      <form onSubmit={handleRegister} className="w-full max-w-md bg-transparent rounded-lg p-8">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Register as Peer Counselor
        </h2>

        {errorMessage && (
          <div className="text-red-600 text-center mb-4">{errorMessage}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name*
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name*
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="middleInitial" className="block text-sm font-medium text-gray-700 mb-1">
            Middle Initial (optional)
          </label>
          <input
            id="middleInitial"
            type="text"
            placeholder="Enter middle initial"
            value={middleInitial}
            onChange={(e) => setMiddleInitial(e.target.value.charAt(0).toUpperCase())}
            maxLength={1}
            className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={true}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              checkPasswordStrength(e.target.value);
            }}
            className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={loading}
          />
          <div className="flex flex-col -space-y-1 mt-1">
            {Object.entries(passwordStrength)
              .filter(([_, isValid]) => !isValid)
              .map(([rule, _]) => (
                <div key={rule} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="text-[10px] text-gray-500">
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

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 
              ${confirmPassword && (confirmPassword === password ? 'border-green-500' : 'border-red-500')}`}
            disabled={loading}
          />
          {confirmPassword && confirmPassword !== password && (
            <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
            School*
          </label>
          <select
            id="school"
            value={selectedSchool}
            className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={true}
            required
          >
            <option value={selectedSchool}>{selectedSchool}</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">
            College*
          </label>
          <select
            id="college"
            value={selectedCollege}
            className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={true}
            required
          >
            <option value={selectedCollege}>{selectedCollege}</option>
          </select>
        </div>

        <button
          type="submit"
          className={`w-full px-4 py-2 text-white font-semibold rounded-lg transition ${
            loading
              ? 'bg-green-300 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          }`}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPeerCounselor;
