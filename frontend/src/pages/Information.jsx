import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Button from '../components/Button';
import { aboutThird, additional1, additional2, infoImage, infoImage2 } from '../assets';

const Information = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility

  const handleAnimationLoad = () => {
    setIsLoaded(true);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <div className="bg-[#FFF9F9]">
        {/* Hero Section */}
        <section id="top" className="relative w-full h-[90vh] bg-[#E6F4EA] shadow-inherit overflow-hidden">
          <div className="relative flex float-right items-center justify-end">
            {!isLoaded && <p className="text-transparent">loading</p>}
            <DotLottieReact
              className="hidden lg:block w-80 h-80 mr-36 mt-16 drop-shadow-lg animate-slowbounce"
              src="https://lottie.host/23fc9cf7-3706-482b-85bf-f5d702b2a0fb/vxnN0ieL86.json"
              onLoad={handleAnimationLoad}
              autoplay
              loop
            />
          </div>
          <div className="lg:ml-20 absolute inset-0 flex flex-col items-center lg:items-start justify-center p-10 space-y-6 z-20">
            <div className="text-center lg:text-left">
              <h1 className="h1 -mt-32 --font-sora text-[#3a5a40] drop-shadow-md">
                Information and Resources
              </h1>
              <p className="body-1/2 max-w-3xl my-6 text-gray-600 text-opacity-90 lg:mb-8 drop-shadow-lg transition-opacity duration-500">
                Bicol University’s Mental Health Resources offer a wealth of information, including self-help articles and guided exercises, 
                to support students' personal growth and resilience. With resources on mindfulness and stress management, 
                students can find valuable guidance for enhancing their mental well-being.
              </p>
            </div>
            <div className="flex items-center justify-center mt-4">
              <Button className="w-48 bg-[#28903e] hover:bg-[#248277] transition-transform transform hover:scale-105" href="#second">
                Explore Resources
              </Button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full z-10 drop-shadow-xl">
            <svg className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path
                fill="#FFF9F9"
                fillOpacity="1"
                d="M0,64L48,90.7C96,117,192,171,288,192C384,213,480,203,576,170.7C672,139,768,85,864,69.3C960,53,1056,75,1152,90.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
          </div>
        </section>

        {/* 2nd Section - Mental Health Overview */}
        <section id="second" className="relative w-full h-auto lg:h-[70vh] bg-[#FFF9F9] flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 lg:ml-20 p-10 z-20">
            <div className="text-center lg:text-left">
              <h1 className="h3 text-[#3a5a40] font-bold drop-shadow-md animate-fadeIn">On-Campus Resources</h1>
              <p className="body-1/2 max-w-2xl my-6 text-gray-800 lg:mb-8">
               Bicol University offers students safe and private mental health support on campus. With counseling, 
               workshops, and peer support, students can find guidance and build skills to handle stress and challenges in a supportive environment.</p>
              <Button className="mb-5 w-48 bg-[#4A9E90] text-white shadow-lg transition-all duration-300 hover:scale-110" href="/onCampus">
                Learn More
              </Button>
            </div>
          </div>

          {/* Image Section */}
          <div className="lg:w-1/2 flex justify-end lg:mr-20 mb-10 p-4 lg:p-16">
            <img
              src={aboutThird}
              alt="About Image"
              className="w-full lg:w-3/4 h-auto object-cover rounded-lg"
            />
          </div>
        </section>

        {/* Divider */}
        <div className="w-5/6 h-0.5 bg-black/25 mx-auto"></div>
      
        {/* 3rd Section - Statistics */}
        <section id="third" className="relative w-full h-auto lg:h-[70vh] bg-[#FFF9F9] flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 lg:ml-20 p-10 z-20">
            <div className="text-center lg:text-left">
              <h1 className="h3 font-bold mb-4 text-[#3a5a40] animate-slideInLeft">Off-Campus Resources</h1>
              <p className="body-1/2 max-w-2xl my-6 text-gray-800 lg:mb-8">
              For students needing additional help, Bicol University connects them with trusted off-campus options, including nearby clinics and hotlines. 
              These resources offer further support for those who may need it outside the university
              </p>
              <Button className="mb-5 w-48 bg-[#4A9E90] text-white shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110" href="/offCampus">
                Learn More
              </Button>
            </div>
          </div>

          {/* Image Section */}
          <div className="lg:w-1/2 flex justify-end lg:mr-20 mb-10 p-4 lg:p-16">
            <img
              src={infoImage}
              alt="Mental Health Numbers"
              className="w-full lg:w-3/4 h-auto object-cover rounded-lg"
            />
          </div>
        </section>

        {/* Divider */}
        <div className="w-5/6 h-0.5 bg-black/25 mx-auto"></div>

        {/* Self-Help Resources Section */}
        <section id="fourth" className="relative w-full h-auto lg:h-[70vh] bg-[#FFF9F9] flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 lg:ml-20 p-10 z-20">
            <div className="text-center lg:text-left">
              <h2 className="h3 font-bold mb-4 text-[#3a5a40] animate-slideInLeft">Self-Help Resources</h2>
              <p className="body-1/2 max-w-2xl my-6 text-gray-800 lg:mb-8">
                A range of self-help tools is available to support students in managing their well-being independently. 
                With guided exercises, helpful apps, and easy-to-access articles and videos, these resources offer flexible support for building healthy habits and personal growth anytime.
              </p>
              <Button
                className="mb-5 w-48 bg-[#4A9E90] text-white shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110"
                onClick={toggleModal}
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-end lg:mr-20 mb-10 p-4 lg:p-16">
            <img
              src={infoImage2}
              alt="Mental Health Numbers"
              className="w-full lg:w-3/4 h-auto object-cover rounded-lg"
            />
          </div>
        </section>

        {/* Modal */}
        {isModalOpen && (
          <div className="text-center fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg space-y-10 p-6 md:p-10 lg:p-20">
              <h2 className="text-black text-2xl md:text-3xl drop-shadow-lg font-bold mb-4">Choose an Option</h2>
              <div className="flex flex-col space-y-4">
              <Button
                className="bg-[#28903e] text-white py-2 px-4 rounded-lg hover:bg-[#248277] transition-transform transform hover:scale-105"
                href="/therapy"
                target="_blank"
                rel="noopener noreferrer"
              >
                iPeer Online Therapy
              </Button>

              <Button
                className="bg-[#4A9E90] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105"
                href="https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Others
              </Button>
              </div>
              <button
                className="mt-10 md:mt-20 text-md text-gray-500 underline hover:text-gray-700"
                onClick={toggleModal}
              >
                Close
              </button>
            </div>
          </div>
        )}

        
        {/* <div className="w-5/6 h-0.5 bg-black/25 mx-auto"></div> */}

        {/* 5th Section - Additional Resources */}
      <section id="additional" className="relative h-auto lg:h-[110vh] w-full bg-[#E6F4EA] shadow-inner py-20">
        <div className="container mx-auto px-6">
          <h2 className="mt-20 text-center text-[#3a5a40] text-4xl font-bold mb-20 animate-fadeIn">Additional Resources</h2>

          <div className="flex flex-col lg:flex-row justify-center items-center lg:space-x-20 space-y-12 lg:space-y-0">

            {/* Resource Card 1 */}
            <div className="relative w-full max-w-lg overflow-hidden bg-green-100 rounded-lg shadow-xl hover:shadow-2xl ">
              <img 
                src={additional1} 
                alt="Find a NAMIWalk" 
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-[#0c541c33] bg-opacity-20 flex flex-col justify-end p-6 transition-opacity hover:bg-opacity-70">
                <h3 className="text-white text-2xl text-justify drop-shadow-xl font-bold mb-2">National Helplines and Mental Health Organizations</h3>
                <a href="https://www.silakbo.ph/help/" target="_blank" rel="noopener noreferrer">
                  <button className="bg-[#faffd5] w-full text-[#3a5a40] py-2 px-4 rounded-lg font-bold mt-4 transition-transform hover:scale-105">
                    Read More
                  </button>
                </a>
              </div>
            </div>

            {/* Resource Card 2 */}
            <div className="relative w-full max-w-lg overflow-hidden bg-blue-300/50 rounded-lg shadow-xl hover:shadow-2xl">
              <img 
                src={additional2} 
                alt="Attend the NAMI National Convention" 
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-[#00a7a233] bg-opacity-20 flex flex-col justify-end p-6 transition-opacity hover:bg-opacity-70">
                <h3 className="text-gray-100 text-justify drop-shadow-xl text-2xl font-bold mb-2">Educational Material, Blogs, Articles, and Recommended Readings on Mental Health Topic</h3>
                <a href="https://libguides.umn.edu/wellness" target="_blank" rel="noopener noreferrer">
                  <button className="bg-[#faffd5] w-full text-[#3a5a40] py-2 px-4 rounded-lg font-bold mt-4 transition-transform hover:scale-105">
                    Read More
                  </button>
                </a>
              </div>
            </div>

          </div>
        </div>
        <div className='mb-20'>

        </div>

        {/* Wave SVG at the bottom */}
        <div className="my-auto h-1/3 absolute top-0 drop-shadow-xl left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#FFF9F9" d="M0,160L30,160C60,160,120,160,180,144C240,128,300,96,360,69.3C420,43,480,21,540,10.7C600,0,660,0,720,0C780,0,840,0,900,16C960,32,1020,64,1080,106.7C1140,149,1200,203,1260,202.7C1320,203,1380,149,1410,122.7L1440,96L1440,0L1410,0C1380,0,1320,0,1260,0C1200,0,1140,0,1080,0C1020,0,960,0,900,0C840,0,780,0,720,0C660,0,600,0,540,0C480,0,420,0,360,0C300,0,240,0,180,0C120,0,60,0,30,0L0,0Z"></path>
          </svg>
        </div>
      </section>

      {/* 6th Section
      <section id="6th" className="relative w-full h-[20vh] bg-[#64b6ac] flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 lg:ml-20 p-10 z-20">
            <div className="text-left">
              <p className="body-1/2 max-w-2xl my-6 text-gray-800 lg:mb-8">
              Mental health institutions provide treatment and support for individuals with mental disorders, 
              offering services like therapy, medication management, and crisis intervention to help improve patients' well-being.
              </p>
            </div>
          </div>

         
        </section> */}



        </div>
      </>
    );
  };

  export default Information;
