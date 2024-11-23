import React, { useState } from 'react';
import Button from '../components/Button';
import { FaBuilding, FaPeopleCarry, FaPhone, FaBook, FaUsers, FaUserNurse } from 'react-icons/fa';
import { onCampusBG, aboutImage, kaugos } from '../assets';
import Carousel from '../components/Carousel';


const OnCampus = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Handler when the animation is loaded
  const handleAnimationLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className='bg-[#FFF9F9] min-h-screen'>
      {/* Hero Section */}
      <section 
        id="top"
        className="relative w-full h-[50vh] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#FFF9F9]"></div> {/* Background overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-10 space-y-6 z-20">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl text-black font-extrabold tracking-wide drop-shadow-2xl mb-10">
              On-Campus Resources
            </h1>
            <p className="text-md lg:text-md text-gray-700 text-opacity-90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Students have access to various mental health resources right on campus, including counseling services, wellness workshops, and support groups. These resources are available to help with both personal and academic challenges in a safe and confidential environment.
            </p>
          </div>
        </div>
        {/* <div className="absolute bottom-0 left-0 w-full z-10 shadow-xl h-[20vh]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f3fbf5" fillOpacity="1" d="M0,128L120,112C240,96,480,64,720,64C960,64,1200,96,1320,112L1440,128L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path>
          </svg>
        </div> */}
      </section>


      {/* Second Section with Image and Cards */}
      <section id="resources-intro" className="text-center scroll-py-10 bg-[#FFF9F9]">
        <div className="container mx-auto px-6 lg:px-20">
          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {/* Card 1: Location */}
            <a href="#" className="group bg-white h-80 shadow-lg rounded-lg p-10 transition-colors duration-300 hover:shadow-xl">
              <div className="flex items-center justify-center">
                <FaBuilding className="size-14 text-black mb-8" />
              </div>
              <h3 className="text-xl text-black font-semibold mb-6 group-hover:text-green-500">Guidance Offices and Counseling Centers</h3>
              <p className="text-gray-600 mt-4">
                Explore on-campus locations for guidance and counseling services.
              </p>
            </a>

            {/* Card 2: Operating Hours */}
            <a href="#" className="group bg-white h-80 shadow-lg rounded-lg p-10 transition-colors duration-300 hover:shadow-xl">
              <div className="flex items-center justify-center">
                <FaPeopleCarry className="size-14 text-black mb-8" />
              </div>
              <h3 className="text-xl text-black font-semibold mb-10 group-hover:text-green-500">Mental Health Support Staff</h3>
              <p className="text-gray-600 mt-4">
                Meet the professionals available to support mental health and wellness.
              </p>
            </a>

            {/* Card 3: Counseling Services */}
            <a href="#" className="group bg-white h-80 shadow-lg rounded-lg p-10 transition-colors duration-300 hover:shadow-xl">
              <div className="flex items-center justify-center">
                <FaPhone className="size-14 text-black mb-8" />
              </div>
              <h3 className="text-xl text-black font-semibold mb-5 group-hover:text-green-500">Campus Telecounseling Hotlines</h3>
              <p className="text-gray-600 mt-4">
                Access mobile and telephone support hotlines for immediate mental health assistance.
              </p>
            </a>

          </div>
        </div>
      </section>


      {/* Guidance Offices Section */}
      <section
        id="top"
        className="relative w-full h-[80vh] flex flex-col items-center justify-between p-20 bg-[#E6F4EA] bg-opacity-90 mt-20"
      >
        {/* Image and Text Section */}
        <div className="flex w-full justify-between items-center">
          {/* Image Section */}
          <div className="relative w-1/2 flex justify-center z-10">
            <img
              src={aboutImage}
              alt="About Image"
              className="ml-12 -mr-5 w-3/4 h-[400px] object-cover rounded-md"
            />
          </div>

          {/* Text Section */}
          <div className="relative w-1/2 flex flex-col justify-center space-y-4 text-black pl-16 z-10">
            <p className="font-mono text-sm text-white opacity-90">On-Campus Resources</p>
            <p className="text-5xl font-bold leading-tight text-gray-100 drop-shadow-xl">
              Guidance Offices and Counseling Centers
            </p>
            <p className="text-md text-gray-50 drop-shadow-lg w-3/4 pb-5">
              Here at MindSpace Hub, we foster personal growth and mental wellness
              through peer counseling, supporting you every step of the way.
            </p>
            <Button white className="w-64" href="#features">
              View
            </Button>
          </div>
        </div>

      </section>

      {/* Staff Section */}
       <Carousel className="h-[100vh]" />

      {/* Hotlines Section */}
      <section
        id="top"
        className="relative w-full h-[120vh] flex flex-col items-center justify-between p-20 bg-[#FFF9F9] bg-opacity-90"
      >
      {/* Header Section */}
      <h2 className="text-4xl font-bold text-gray-800 ">
        Telecounseling and Emergency Hotlines 
      </h2>
      <h3 className="text-2xl text-gray-700 font-semibold mb-6">
        Need an Appointment ASAP?
      </h3>
        {/* Image and Text Section */}
        <div className="flex w-full justify-between items-center">
          {/* Image Section */}
          <div className="relative w-1/2 flex justify-center z-10">
            <img
              src={kaugos}
              alt="About Image"
              className="ml-12 -mr-5 w-3/4 h-1/4 object-cover rounded-md"
            />
          </div>

          {/* Text Section */}
          <div className="relative w-1/2 flex flex-col justify-center space-y-4 text-black pl-16 z-10">
            <p className="font-mono text-sm text-white opacity-90">On-Campus Resources</p>
            <p className="text-5xl font-bold leading-tight text-black drop-shadow-xl">
              Guidance Offices and Counseling Centers
            </p>
            <p className="text-md text-black-50 drop-shadow-lg w-3/4 pb-5">
              Here at MindSpace Hub, we foster personal growth and mental wellness
              through peer counseling, supporting you every step of the way.
            </p>
          </div>
        </div>

      </section>

       




      {/* <section id="resources-library" className="py-20 bg-[#f3fbf5]">
        <div className="container mx-auto px-6 lg:px-20 flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/4 mb-10 lg:mb-0 lg:mr-10 bg-transparent p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-[#28903e]">Filters</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="contentType" className="block mb-1 text-gray-700">Content Type</label>
                <select id="contentType" className="w-full border text-black border-gray-300 rounded-lg p-2 bg-transparent">
                  <option>All Content</option>
                  <option>Webinar</option>
                  <option>Article</option>
                  <option>Case Study</option>
                </select>
              </div>
              <div>
                <label htmlFor="industry" className="block mb-1 text-gray-700">Industry</label>
                <select id="industry" className="w-full border text-black border-gray-300 rounded-lg p-2 bg-transparent">
                  <option>All Industries</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Technology</option>
                </select>
              </div>
              <div>
                <label htmlFor="workload" className="block mb-1 text-gray-700">Workload</label>
                <select id="workload" className="w-full border text-black border-gray-300 rounded-lg p-2 bg-transparent">
                  <option>All Workloads</option>
                  <option>Data Processing</option>
                  <option>Machine Learning</option>
                  <option>ETL</option>
                </select>
              </div>
              <div>
                <label htmlFor="department" className="block mb-1 text-gray-700">Department</label>
                <select id="department" className="w-full border text-black border-gray-300 rounded-lg p-2 bg-transparent">
                  <option>All Departments</option>
                  <option>Sales</option>
                  <option>Marketing</option>
                  <option>Engineering</option>
                </select>
              </div>
            </div>
            <button className="mt-6 w-full bg-[#28903e] text-white py-2 rounded-lg">Show Results</button>
          </div>
          <div className="w-full lg:w-3/4">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-[#28903e]">Resource Library</h2>
              <p className="text-gray-600 mt-2">Explore various resources that can help you succeed both academically and personally.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="bg-[#007acc] rounded-t-lg h-40 flex items-center justify-center">
                  <h3 className="text-xl font-semibold text-white">Webinar</h3>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-black">Customer Gen AI Use Cases</h3>
                  <p className="text-gray-600 mt-4">Explore how AI can enhance customer interactions and outcomes.</p>
                  <Button className="mt-4 px-4 py-2 bg-[#28903e] text-white rounded-lg hover:bg-[#248277]">
                    Download Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default OnCampus;
