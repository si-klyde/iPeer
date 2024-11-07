import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Button from '../components/Button';
import { aboutThird, additional1, additional2, infoImage, infoImage2 } from '../assets';

const OnCampus = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Handler when the animation is loaded
  const handleAnimationLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className='bg-[#f3fbf5] min-h-screen'>
      {/* Hero Section */}
      <section id='top' className="relative w-full h-[50vh] bg-[#88E5BE] overflow-hidden">
        {/* Existing hero section code remains unchanged */}
        <div className=" absolute inset-0 flex flex-col items-center justify-center p-10 space-y-6 z-20">
          <div className="text-center">
            <h1 className='h1 text-white font-semibold drop-shadow-lg'>
              On-Campus Resources
            </h1>
            <p className="body-1/2 max-w-3xl my-6 text-gray-700 text-opacity-90 lg:mb-8 drop-shadow-lg transition-opacity duration-500">   
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full z-10 shadow-xl h-[20vh]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f3fbf5" fill-opacity="1" d="M0,128L120,112C240,96,480,64,720,64C960,64,1200,96,1320,112L1440,128L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Second Section with Image and Cards */}
      <section id="resources-intro" className="scroll-py-10 bg-[#f3fbf5]">
        <div className="container mx-auto px-6 lg:px-20">
          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h3 className="text-xl text-black font-semibold">Counseling Services</h3>
              <p className="text-gray-600 mt-4">Access on-campus counseling services for personal and academic support.</p>
              <Button className="mt-4 px-4 py-2 bg-transparent text-black rounded-lg hover:bg-transparent">
                <div className='text-black underline transition hover:text-blue-500'>
                Learn More
                </div>
              </Button>
            </div>

            {/* Card 2 */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h3 className="text-xl text-black font-semibold">Counseling Services</h3>
              <p className="text-gray-600 mt-4">Access on-campus counseling services for personal and academic support.</p>
              <Button className="mt-4 px-4 py-2 bg-transparent text-black rounded-lg hover:bg-transparent">
                <div className='text-black underline'>
                Learn More
                </div>
              </Button>
            </div>

            {/* Card 3 */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h3 className="text-xl text-black font-semibold">Counseling Services</h3>
              <p className="text-gray-600 mt-4">Access on-campus counseling services for personal and academic support.</p>
              <Button className="mt-4 px-4 py-2 bg-transparent text-black rounded-lg hover:bg-transparent">
                <div className='text-black underline'>
                Learn More
                </div>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Cards Section
      <section id="resources" className="py-20 bg-[#f3fbf5]">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-[#28903e]">Resource Library</h2>
          <p className="text-gray-600 mt-2">Explore various resources that can help you succeed both academically and personally.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-10 lg:px-20">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold">Customer Gen AI Use Cases</h3>
            <p className="text-gray-600 mt-4">Explore how AI can enhance customer interactions and outcomes.</p>
            <Button className="mt-4 px-4 py-2 bg-[#28903e] text-white rounded-lg hover:bg-[#248277]">
              Download Now
            </Button>
          </div>
        </div>
      </section>/*}

      {/* Modified Third Section with Sidebar and Filters */}
      <section id="resources-library" className="py-20 bg-[#f3fbf5]">
        <div className="container mx-auto px-6 lg:px-20 flex flex-col lg:flex-row">
          
          {/* Sidebar Filter Section */}
          <div className="w-full lg:w-1/4 mb-10 lg:mb-0 lg:mr-10 bg-transparent p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-[#28903e]">Filters</h2>
            <div className="space-y-4">
              {/* Content Type Dropdown */}
              <div>
                <label htmlFor="contentType" className="block mb-1 text-gray-700">Content Type</label>
                <select id="contentType" className="w-full border text-black border-gray-300 rounded-lg p-2 bg-transparent">
                  <option>All Content</option>
                  <option>Webinar</option>
                  <option>Article</option>
                  <option>Case Study</option>
                </select>
              </div>

              {/* Industry Dropdown */}
              <div>
                <label htmlFor="industry" className="block mb-1 text-gray-700">Industry</label>
                <select id="contentType" className="w-full border text-black border-gray-300 rounded-lg p-2 bg-transparent">
                  <option>All Industries</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Technology</option>
                </select>
              </div>

              {/* Workload Dropdown */}
              <div>
                <label htmlFor="workload" className="block mb-1 text-gray-700">Workload</label>
                <select id="contentType" className="w-full border text-black border-gray-300 rounded-lg p-2 bg-transparent">
                  <option>All Workloads</option>
                  <option>Data Processing</option>
                  <option>Machine Learning</option>
                  <option>ETL</option>
                </select>
              </div>

              {/* Department Dropdown */}
              <div>
                <label htmlFor="department" className="block mb-1 text-gray-700">Department</label>
                <select id="contentType" className="w-full border text-black border-gray-300 rounded-lg p-2 bg-transparent">
                  <option>All Departments</option>
                  <option>Sales</option>
                  <option>Marketing</option>
                  <option>Engineering</option>
                </select>
              </div>
            </div>
            <button className="mt-6 w-full bg-[#28903e] text-white py-2 rounded-lg">Show Results</button>
          </div>

          {/* Resource Cards Section */}
          <div className="w-full lg:w-3/4">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-[#28903e]">Resource Library</h2>
              <p className="text-gray-600 mt-2">Explore various resources that can help you succeed both academically and personally.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Sample Resource Card */}
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
              



              {/* Additional resource cards can be added here */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnCampus;
