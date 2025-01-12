import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPeerCounselor = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/schools');
        setSchools(response.data);
      } catch (error) {
        console.error('Error fetching schools - Full error:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        // res.status(500).json({ error: 'Error fetching schools' });
        setErrorMessage('Error loading schools');
      }
    };

    fetchSchools();
  }, []);

  const handleSchoolChange = (e) => {
    const schoolName = e.target.value;
    setSelectedSchool(schoolName);
    setSelectedCollege(''); // Reset college selection
  
    // Find selected school and update colleges
    const selectedSchoolData = schools.find(school => school.name === schoolName);
    setColleges(selectedSchoolData?.colleges || []);
  };
  

  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (!firstName || !lastName || !email || !password ||!selectedSchool || !selectedCollege) {
      setErrorMessage('Required fields must be filled.');
      return;
    }
  
    // Combine names into fullName
    const fullName = `${firstName} ${middleInitial ? middleInitial + '.' : ''} ${lastName}`.trim();
  
    setLoading(true);
    setErrorMessage('');
  
    try {
      const response = await axios.post(
        'http://localhost:5000/api/register-peer-counselor',
        { 
          email, 
          password, 
          fullName,
          school: selectedSchool,
          college: selectedCollege
        }
      );
      console.log('Registration successful:', response.data);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent px-4 py-6">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-transparent rounded-lg p-8"
      >
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Register as Peer Counselor
        </h2>

        {errorMessage && (
          <div className="text-red-600 text-center mb-4">{errorMessage}</div>
        )}

        {/* Name Fields */}
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

        {/* Email Input */}
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={loading}
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={loading}
          />
        </div>

        {/* School Dropdown */}
        <div className="mb-6">
          <label
            htmlFor="school"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            School*
          </label>
          <select
            id="school"
            value={selectedSchool}
            onChange={handleSchoolChange}
            className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={loading}
            required
          >
            <option value="">Select your school</option>
            {schools.map((school) => (
              <option key={school.domain} value={school.name}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label
            htmlFor="college"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            College*
          </label>
          <select
            id="college"
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="w-full px-4 py-2 border bg-green-100 text-black border-gray-500 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={!selectedSchool || loading}
            required
          >
            <option value="">Select your college</option>
            {colleges.map((college) => (
              <option key={college} value={college}>
                {college}
              </option>
            ))}
          </select>
        </div>


        {/* Register Button */}
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
