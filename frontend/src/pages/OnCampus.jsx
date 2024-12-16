import React, { useState } from 'react';
import Button from '../components/Button';
import { FaBuilding, FaPeopleCarry, FaPhone } from 'react-icons/fa';
import { hotlines } from '../assets';
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
            <h1 className="text-5xl lg:text-6xl text-black font-extrabold tracking-normal drop-shadow-2xl mb-10">
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
            <a href="#guidance-offices" className="group bg-white h-80 shadow-lg rounded-lg p-10 transition-colors duration-300 hover:shadow-xl">
              <div className="flex items-center justify-center">
                <FaBuilding className="size-14 text-black mb-8" />
              </div>
              <h3 className="text-xl text-black font-semibold mb-6 group-hover:text-green-500">Guidance Offices</h3>
              <p className="text-gray-600 mt-4">
                Explore on-campus locations for guidance and counseling services.
              </p>
            </a>

            {/* Card 2: Support Staff */}
            <a href="#carousel-section" className="group bg-white h-80 shadow-lg rounded-lg p-10 transition-colors duration-300 hover:shadow-xl">
              <div className="flex items-center justify-center">
                <FaPeopleCarry className="size-14 text-black mb-8" />
              </div>
              <h3 className="text-xl text-black font-semibold mb-10 group-hover:text-green-500">Mental Health Support Staff</h3>
              <p className="text-gray-600 mt-4">
                Meet the professionals available to support mental health and wellness.
              </p>
            </a>

            {/* Card 3: Hotlines */}
            <a href="#hotlines" className="group bg-white h-80 shadow-lg rounded-lg p-10 transition-colors duration-300 hover:shadow-xl">
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

          {/* Divider */}
        <div className="w-5/6 h-0.5 bg-black/25 mx-auto my-12"></div>

      {/* Guidance Offices Section */}
      <section
        id="guidance-offices"
        className="relative w-full py-20 bg-[#FFF9F9] flex flex-col items-center"
      >
        <div className="container mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Text Content */}
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">On-Campus Guidance Office</h2>
            <p className="text-gray-700 text-sm text-justify mb-4">
              The Guidance Office located inside the Bicol University Office of Student Affairs and Services (OSAS) is dedicated to supporting the mental health and
              well-being of students. The Office facilities offer individual counseling, 
              group sessions, and a range of workshops to enhance personal growth 
              and academic success.
            </p>
            <ul className="text-gray-700 space-y-2 mb-6">
              <li>• Professional counseling staff</li>
              <li>• Private consultation rooms</li>
              <li>• Support for academic and personal challenges</li>
              <li>• Telecounseling</li>
            </ul>
            <div className="flex flex-col space-y-4">
            <Button
              className="bg-green-500 w-2/3 text-white px-4 py-2 rounded-full transition-transform transform hover:scale-105 duration-100 text-center"
              onClick={() => window.open(
                "https://docs.google.com/forms/d/1gXlsWQNrgqh2ORWlw4heOfSlaw1jxd1GOXBegycZErc/viewform?ts=5f6ac62e&edit_requested=true&fbclid=IwZXh0bgNhZW0CMTAAAR3tFViEYFwYgpXlEgLlhVtDDxC8NoEw-f8w2M7ZfU-cMuOcoVaKThMbY4Y_aem_M6OIsCvUEoHKXVHpIPsXAA",
                "_blank",
                "noopener,noreferrer"
              )}
            >
              Bicol University Counseling Intake Form
            </Button>

            </div>
          </div>

          {/* Map and Contact Details */}
          <div>
            <div className="mb-6">
              <iframe
                title="Campus Location"
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d461.6343251888323!2d123.72186574735191!3d13.14240346731504!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sph!4v1732343629831!5m2!1sen!2sphreferrerpolicy=%22no-referrer-when-downgrade"
                width="100%"
                height="300"
                className="rounded-md shadow-lg"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
            <div className=" flex flex-row space-y-0 space-x-10">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Contact Us</h3>
                <p className="text-md text-gray-700">4PRC+XHQ, BU Main Campus Rd, Daraga, Albay</p>
                <p className="text-md text-gray-700">Bicol University</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Hours of Operation</h3>
                <p className="text-gray-700">Mon-Fri: 8 AM - 5 PM</p>
                <p className="text-gray-700">Sat-Sun: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-5/6 h-0.5 bg-black/25 mx-auto my-12"></div>

      {/* Staff Section */}
       <section id="carousel-section">
        <Carousel className="h-[100vh]" />
      </section>

       {/* Divider */}
       <div className="w-5/6 h-0.5 bg-black/25 mx-auto my-12"></div>

      {/* Hotlines Section */}
      <section
        id="hotlines"
        className="relative w-full min-h-screen flex flex-col items-center p-20 bg-[#FFF9F9] bg-opacity-90"
      >
        {/* Title */}
        <h2 className="text-5xl font-bold text-gray-800 mb-6 text-center">
          Telecounseling and Emergency Hotlines
        </h2>

        {/* Introductory Text */}
        <p className="text-md text-black/80 text-center mb-12 max-w-4xl">
          The Bicol University "Be with U" or "BUronyog" Student Assistance Program offers key hotlines for student support during emergencies. It includes <b>TARABANGAN</b> for stranded students, <b>PAGHERAS</b> for student info assistance, and <b>KAUGOS</b> for telecounseling.
        </p>

        {/* Image and Text Layout */}
        <div className="flex flex-wrap lg:flex-nowrap justify-between items-start w-full space-y-12 lg:space-y-0 lg:space-x-12">
          {/* Image Section */}
          <div className="flex justify-center w-full lg:w-1/2">
            <img
              src={hotlines}
              alt="Hotlines Illustration"
              className="w-full max-w-lg h-auto object-cover rounded-md"
            />
          </div>

          {/* Text Section */}
          <div className=" w-full lg:w-1/2 space-y-8 ml-96">
            {/* TARABANGAN Section */}
            <div className="bg-[#FFF9F9] p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-black">TARABANGAN</h3>
              <p className="text-md w-3/5  text-gray-700 mt-2">
                A program for stranded students with the University Student Development Services Division.
              </p>
              <ul className="text-md text-gray-700 mt-2">
                <li className=" text-green-600 font-bold">
                  📞 0917 703 4031
                </li>
                <li className=" text-green-600 font-bold">
                  📞 0930 668 9482
                </li>
                <li className=" text-green-600 font-bold">
                  📞 0945 104 2650
                </li>
              </ul>
            </div>

            {/* PAGHERAS Section */}
            <div className="bg-[#FFF9F9] p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-black">PAGHERAS</h3>
              <p className="text-md text-gray-700 mt-2">
                Provides student information assistance.
              </p>
              <ul className="text-md text-black-700 mt-2">
                <li className=" text-green-600 font-bold">
                  📞 0936 937 5671
                </li>
                <li className=" text-green-600 font-bold">
                  📞 0906 513 0151
                </li>
                <li className=" text-green-600 font-bold">
                  📞 0998 573 3104
                </li>
              </ul>
            </div>

            {/* KAUGOS Section */}
            <div className="bg-[#FFF9F9] p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-black">KAUGOS</h3>
              <p className="text-md w-3/5 text-gray-700 mt-2">
                Telecounseling for students with the University Student Welfare Services Division.
              </p>
              <ul className="text-md text-gray-700 mt-2">
                <li className=" text-green-600 font-bold">
                  📞 0925 254 5242
                </li>
                <li className=" text-green-600 font-bold">
                  📞 0917 484 5355
                </li>
                <li className=" text-green-600 font-bold">
                  📞 0923 628 0612
                </li>
                <li className=" text-green-600 font-bold">
                  📞 0922 957 0534
                </li>
              </ul>
            </div>
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
